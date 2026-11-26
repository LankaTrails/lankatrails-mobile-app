import { fileUrl, GOOGLE_PLACES_API_KEY } from "@/utils/config";
import { logger } from "@/utils/logger";
import EmptyState from "@/components/EmptyState";
import FilterBar from "@/components/FilterBar";
import { searchServices } from "@/services/serviceSearch";
import { ServiceCategory } from "@/types/commonTypes";
import { AccommodationType, ActivityType, ApiResponse, FoodBeverageType, ProviderSearchResponse, SearchResponse, ServiceSearchRequest, ServiceSearchResponse, TourGuideType, VehicleType } from "@/types/serviceTypes";
import { router, useLocalSearchParams } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { ArrowLeftIcon } from "react-native-heroicons/outline";
import { fetchGroupedPlaces, geocodeLocation } from "../../../../services/googlePlacesService";

// Import modular components
import {
  PlacesLoadingState,
  SearchLoadingState,
  ServicesLoadingState,
} from "@/components/LoadingStates";
import { SectionHeader } from "@/components/SectionHeader";
import { AnimatedCard } from "@/components/transitions/AnimatedCard";
import { navigateToServiceDetail } from "@/utils/navigationHelpers";
import { PlaceGrid } from "@/components/explore/PlaceGrid";
import { ServiceGrid } from "@/components/explore/ServiceGrid";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;
const DEFAULT_COORDINATES = { lat: 6.0329, lng: 80.2168 }; // Galle coordinates


// Types - Updated to match PlaceGrid component expectations
type Place = {
  place_id: string;
  name: string;
  vicinity: string;
  rating?: number;
  photos?: { photo_reference: string }[];
};

type PlaceGroup = {
  group: string;
  places: Place[];
};

type CardItem = {
  id: number;
  title: string;
  subtitle: string;
  rating: number;
  image: string;
};

// Constants
const TABS = [
  "All",
  "Accommodation",
  "Food & Beverage",
  "Transport",
  "Activity",
  "Tour Guide",
  "Public Places",
] as const;

const TAB_TO_CATEGORY_MAP: Record<string, ServiceCategory> = {
  Accommodation: ServiceCategory.ACCOMMODATION,
  "Food & Beverage": ServiceCategory.FOOD_BEVERAGE,
  Transport: ServiceCategory.TRANSPORT,
  Activity: ServiceCategory.ACTIVITY,
  "Tour Guide": ServiceCategory.TOUR_GUIDE,
};

// Sub-type constants
const ACCOMMODATION_TYPES = [
  "← Back",
  "All",
  "Hotel",
  "Resort",
  "Guest House",
  "Villa",
  "Apartment",
  "Hostel",
  "Homestay",
  "Camping",
  "Lodge",
] as const;

const ACTIVITY_TYPES = [
  "← Back",
  "All",
  "Adventure",
  "Cultural",
  "Nature",
  "Relaxation",
  "Sports",
  "Water Sports",
  "Wellness",
  "Educational",
  "Nightlife",
] as const;

const VEHICLE_TYPES = [
  "← Back",
  "All",
  "Car",
  "Van",
  "Bus",
  "SUV",
  "Tuk Tuk",
  "Motorcycle",
  "Bicycle",
  "Scooter",
  "Pickup",
  "Truck",
] as const;

const FOOD_BEVERAGE_TYPES = [
  "← Back",
  "All",
  "Restaurant",
  "Cafe",
  "Bar",
  "Pub",
  "Food Court",
  "Food Truck",
  "Bakery",
  "Brewery",
  "Winery",
  "Street Food",
  "Buffet",
] as const;

const TOUR_GUIDE_TYPES = [
  "← Back",
  "All",
  "National",
  "Chauffeur",
  "Site",
  "Area",
] as const;

// Sub-type to enum mappings
const ACCOMMODATION_TYPE_MAP: Record<string, AccommodationType> = {
  Hotel: "HOTEL",
  Resort: "RESORT",
  "Guest House": "GUEST_HOUSE",
  Villa: "VILLA",
  Apartment: "APARTMENT",
  Hostel: "HOSTEL",
  Homestay: "HOMESTAY",
  Camping: "CAMPING",
  Lodge: "LODGE",
};

const ACTIVITY_TYPE_MAP: Record<string, ActivityType> = {
  Adventure: "ADVENTURE",
  Cultural: "CULTURAL",
  Nature: "NATURE",
  Relaxation: "RELAXATION",
  Sports: "SPORTS",
  "Water Sports": "WATER_SPORTS",
  Wellness: "WELLNESS",
  Educational: "EDUCATIONAL",
  Nightlife: "NIGHTLIFE",
};

const VEHICLE_TYPE_MAP: Record<string, VehicleType> = {
  Car: "CAR",
  Van: "VAN",
  Bus: "BUS",
  SUV: "SUV",
  "Tuk Tuk": "TUK_TUK",
  Motorcycle: "MOTORCYCLE",
  Bicycle: "BICYCLE",
  Scooter: "SCOOTER",
  Pickup: "PICKUP",
  Truck: "TRUCK",
};

const FOOD_BEVERAGE_TYPE_MAP: Record<string, FoodBeverageType> = {
  Restaurant: "RESTAURANT",
  Cafe: "CAFE",
  Bar: "BAR",
  Pub: "PUB",
  "Food Court": "FOOD_COURT",
  "Food Truck": "FOOD_TRUCK",
  Bakery: "BAKERY",
  Brewery: "BREWERY",
  Winery: "WINERY",
  "Street Food": "STREET_FOOD",
  Buffet: "BUFFET",
};

const TOUR_GUIDE_TYPE_MAP: Record<string, TourGuideType> = {
  National: "NATIONAL",
  Chauffeur: "CHAUFFEUR",
  Site: "SITE",
  Area: "AREA",
};

// Utility functions
const showError = (message: string) => {
  if (Platform.OS === "android") ToastAndroid.show(message, ToastAndroid.SHORT);
  else Alert.alert("Error", message);
};

// Helper function to normalize category values
const normalizeCategory = (category: string): string => {
  const categoryMap: Record<string, string> = {
    Accommodation: ServiceCategory.ACCOMMODATION,
    accommodation: ServiceCategory.ACCOMMODATION,
    ACCOMMODATION: ServiceCategory.ACCOMMODATION,
    "Food & Beverage": ServiceCategory.FOOD_BEVERAGE,
    "food & beverage": ServiceCategory.FOOD_BEVERAGE,
    FOOD_BEVERAGE: ServiceCategory.FOOD_BEVERAGE,
    Transport: ServiceCategory.TRANSPORT,
    transport: ServiceCategory.TRANSPORT,
    TRANSPORT: ServiceCategory.TRANSPORT,
    Activity: ServiceCategory.ACTIVITY,
    activity: ServiceCategory.ACTIVITY,
    ACTIVITY: ServiceCategory.ACTIVITY,
    "Tour Guide": ServiceCategory.TOUR_GUIDE,
    "tour guide": ServiceCategory.TOUR_GUIDE,
    TOUR_GUIDE: ServiceCategory.TOUR_GUIDE,
  };

  return categoryMap[category] || category.toUpperCase().replace(/\s+/g, "_");
};

// Helper function to get display name for category
const getCategoryDisplayName = (normalizedCategory: string): string => {
  const displayMap: Record<string, string> = {
    [ServiceCategory.ACCOMMODATION]: "Accommodation",
    [ServiceCategory.FOOD_BEVERAGE]: "Food & Beverage",
    [ServiceCategory.TRANSPORT]: "Transport",
    [ServiceCategory.ACTIVITY]: "Activity",
    [ServiceCategory.TOUR_GUIDE]: "Tour Guide",
  };

  return displayMap[normalizedCategory] || normalizedCategory;
};

// Helper function to get sub-types for a category
const getSubTypesForCategory = (category: string): readonly string[] => {
  switch (category) {
    case "Accommodation":
      return ACCOMMODATION_TYPES;
    case "Activity":
      return ACTIVITY_TYPES;
    case "Transport":
      return VEHICLE_TYPES;
    case "Food & Beverage":
      return FOOD_BEVERAGE_TYPES;
    case "Tour Guide":
      return TOUR_GUIDE_TYPES;
    default:
      return [];
  }
};

const convertServiceToCardItem = (
  service: ServiceSearchResponse
): CardItem => ({
  id:
    typeof service.serviceId === "number"
      ? service.serviceId
      : Number(service.serviceId),
  title: service.serviceName || "Unnamed Service",
  subtitle:
    service.locations?.[0]?.city || service.locations?.[0]?.formattedAddress,
  rating: service.averageRating || 0, // Use actual average rating
  image: service.mainImageUrl
    ? fileUrl(service.mainImageUrl)
    : "https://via.placeholder.com/160x96/e2e8f0/64748b?text=No+Image",
});

const convertPlaceToCardItem = (place: Place): CardItem => ({
  id: Number(place.place_id),
  title: place.name,
  subtitle: place.vicinity,
  rating:
    typeof place.rating === "number"
      ? place.rating
      : typeof place.rating === "string"
      ? Number(place.rating)
      : 0,
  image: place.photos?.[0]
    ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
    : "",
});

// Custom hooks
const useAnimatedValue = (initialValue = 0) => {
  return useRef(new Animated.Value(initialValue)).current;
};

const useCoordinates = (params: any, searchLocation: string) => {
  return useMemo(() => {
    if (params.lat && params.lng) {
      return { lat: Number(params.lat), lng: Number(params.lng) };
    }
    return null;
  }, [params.lat, params.lng]);
};

// Main Component
const GalleApp: React.FC = () => {
  const params = useLocalSearchParams();

  // State
  const [loading, setLoading] = useState(true);
  const [groupedPlaces, setGroupedPlaces] = useState<PlaceGroup[]>([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>("All");
  const [selectedSubType, setSelectedSubType] = useState<string>("All");
  const [providers, setProviders] = useState<ProviderSearchResponse[]>([]);
  const [services, setServices] = useState<ServiceSearchResponse[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [searchLocation, setSearchLocation] = useState("Galle");

  // Refs for stable values and preventing race conditions
  const isMountedRef = useRef(true);
  const lastServiceCallRef = useRef<string>("");
  const lastPlaceCallRef = useRef<string>("");

  // Animation values
  const fadeInValue = useAnimatedValue(0);
  const mainFadeAnim = useAnimatedValue(0);
  const mainSlideAnim = useAnimatedValue(40);

  // Computed values
  const coordinates = useCoordinates(params, searchLocation);
  const isNearbySearch = params.isNearby === "true";

  // Combine providers and services for filtering and grouping
  const allItems = useMemo(() => {
    const providerItems = providers.map((provider) => ({
      ...provider,
      isProvider: true,
      displayName: provider.businessName,
      displayImage: provider.coverImageUrl,
      displayCategory: provider.category,
    }));

    const serviceItems = services.map((service) => ({
      ...service,
      isProvider: false,
      displayName: service.serviceName,
      displayImage: service.mainImageUrl,
      displayCategory: service.category,
    }));

    return [...providerItems, ...serviceItems];
  }, [providers, services]);

  const filteredItems = useMemo(() => {
    // Since the API already filters by category when requested,
    // we don't need to filter again on the frontend
    return allItems;
  }, [allItems]);

  const groupedItems = useMemo(() => {
    return allItems.reduce((acc, item) => {
      const normalizedCategory = normalizeCategory(item.displayCategory);
      if (!acc[normalizedCategory]) {
        acc[normalizedCategory] = [];
      }
      acc[normalizedCategory].push(item);
      return acc;
    }, {} as Record<string, any[]>);
  }, [allItems]);

  // Effects
  useEffect(() => {
    if (params.location) {
      setSearchLocation(params.location as string);
    }

    const timer = setTimeout(() => {
      setLoading(false);
      Animated.timing(fadeInValue, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }, 600);

    return () => {
      clearTimeout(timer);
      isMountedRef.current = false;
    };
  }, [params.location]); // Only depend on location to prevent unnecessary re-runs

  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(mainFadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(mainSlideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading]);

  // Fetch functions
  const fetchServices = useCallback(async () => {
    // Create a unique call identifier to prevent race conditions
    const callId = `${coordinates?.lat}-${coordinates?.lng}-${searchLocation}-${selectedTab}-${selectedSubType}-${isNearbySearch}`;

    // Prevent duplicate calls
    if (servicesLoading || lastServiceCallRef.current === callId) {
      return;
    }

    lastServiceCallRef.current = callId;

    try {
      setServicesLoading(true);

      let searchRequest: ServiceSearchRequest;

      if (coordinates && isNearbySearch) {
        searchRequest = {
          lat: coordinates.lat,
          lng: coordinates.lng,
          radiusKm: 20,
        };
      } else {
        searchRequest = { city: searchLocation };
      }

      if (selectedTab !== "All" && selectedTab !== "Public Places") {
        const category = TAB_TO_CATEGORY_MAP[selectedTab];
        if (category) {
          searchRequest.category = category;

          // Add sub-type filtering if a specific sub-type is selected
          if (selectedSubType !== "All") {
            switch (selectedTab) {
              case "Accommodation":
                const accommodationType =
                  ACCOMMODATION_TYPE_MAP[selectedSubType];
                if (accommodationType) {
                  searchRequest.accommodationType = accommodationType;
                }
                break;
              case "Activity":
                const activityType = ACTIVITY_TYPE_MAP[selectedSubType];
                if (activityType) {
                  searchRequest.activityType = activityType;
                }
                break;
              case "Transport":
                const vehicleType = VEHICLE_TYPE_MAP[selectedSubType];
                if (vehicleType) {
                  searchRequest.vehicleType = vehicleType;
                }
                break;
              case "Food & Beverage":
                const foodBeverageType =
                  FOOD_BEVERAGE_TYPE_MAP[selectedSubType];
                if (foodBeverageType) {
                  searchRequest.foodAndBeverageType = foodBeverageType;
                }
                break;
              case "Tour Guide":
                const tourGuideType = TOUR_GUIDE_TYPE_MAP[selectedSubType];
                if (tourGuideType) {
                  searchRequest.tourGuideType = tourGuideType;
                }
                break;
            }
          }
        }
      }


      const response: ApiResponse<SearchResponse> = await searchServices(
        searchRequest
      );

      // Check if component is still mounted before updating state
      if (!isMountedRef.current) {
        return;
      }

      if (response.success && response.data) {
        const searchData = response.data;

        // Set providers and services separately
        setProviders(searchData.providers || []);
        setServices(searchData.services || []);

        // Log categories for debugging
        const allCategories = [
          ...(searchData.providers?.map((p) => p.category) || []),
          ...(searchData.services?.map((s) => s.category) || []),
        ];
      } else {
        logger.error("Search failed:", response.message);
        showError("Failed to load services");
        setProviders([]);
        setServices([]);
      }
    } catch (error) {
      logger.error("Error fetching services:", error);
      showError("Network error occurred");
      setProviders([]);
      setServices([]);
    } finally {
      if (isMountedRef.current) {
        setServicesLoading(false);
      }
      // Reset call identifier on completion
      if (lastServiceCallRef.current === callId) {
        lastServiceCallRef.current = "";
      }
    }
  }, [
    coordinates,
    isNearbySearch,
    searchLocation,
    selectedTab,
    selectedSubType,
  ]);

  const fetchPlaces = useCallback(async () => {
    // Create a unique call identifier to prevent race conditions
    const callId = `${coordinates?.lat}-${coordinates?.lng}-${searchLocation}`;

    // Prevent duplicate calls
    if (placesLoading || lastPlaceCallRef.current === callId) {
      return;
    }

    lastPlaceCallRef.current = callId;

    try {
      setPlacesLoading(true);

      let lat, lng;

      if (coordinates) {
        lat = coordinates.lat;
        lng = coordinates.lng;
      } else {
        try {
          const geocodedLocation = await geocodeLocation(searchLocation);
          if (geocodedLocation) {
            lat = geocodedLocation.lat;
            lng = geocodedLocation.lng;
          } else {
            logger.warn("⚠️ Geocoding failed, using default coordinates");
            lat = DEFAULT_COORDINATES.lat;
            lng = DEFAULT_COORDINATES.lng;
          }
        } catch (geocodeError) {
          logger.error("❌ Geocoding error:", geocodeError);
          lat = DEFAULT_COORDINATES.lat;
          lng = DEFAULT_COORDINATES.lng;
        }
      }

      
      let groups: PlaceGroup[] = [];
      
      try {
        const googlePlaceGroups = await fetchGroupedPlaces(lat, lng);
        
        // Convert Google Places to local format
        groups = googlePlaceGroups.map(group => ({
          group: group.group,
          places: group.places.map(place => ({
            place_id: place.place_id,
            name: place.name,
            vicinity: place.vicinity || place.name || "Unknown location",
            rating: place.rating || 0,
            photos: place.photos?.map(photo => ({
              photo_reference: photo.photo_reference
            })) || []
          }))
        }));
        
      } catch (apiError) {
        // No silent sample data: an empty list shows the "no places" state
        logger.warn("[search] places lookup failed", apiError);
        groups = [];
      }
      
      // Log details about each group
      groups.forEach(group => {
      });

      // Check if component is still mounted before updating state
      if (!isMountedRef.current) {
        return;
      }

      setGroupedPlaces(groups);
    } catch (error) {
      logger.error("❌ Fetch places error:", error);
      if (isMountedRef.current) {
        setGroupedPlaces([]);
      }
    } finally {
      if (isMountedRef.current) {
        setPlacesLoading(false);
      }
      // Reset call identifier on completion
      if (lastPlaceCallRef.current === callId) {
        lastPlaceCallRef.current = "";
      }
    }
  }, [coordinates, searchLocation]);

  // Effect to fetch places data with debounce
  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => {
      fetchPlaces();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchPlaces, loading]);

  // Effect to fetch services and providers data with debounce
  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => {
      fetchServices();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchServices, loading]);


  // Event handlers
  const handleTabChange = useCallback((newTab: string) => {
    setSelectedTab(newTab);
    setSelectedSubType("All"); // Reset sub-type when tab changes
  }, []);

  const handleServicePress = useCallback(
    (serviceId: string) => {

      if (!serviceId) {
        logger.error("❌ ServiceId is null or undefined");
        return;
      }

      const service = services?.find(
        (s) => s?.serviceId?.toString() === serviceId
      );


      if (service && service.category) {
        navigateToServiceDetail(
          parseInt(serviceId),
          service.category as ServiceCategory
        );
      } else {
        router.push({
          pathname: "/explore/services/[serviceId]" as any,
          params: { serviceId },
        });
      }
    },
    [services]
  );

  const handleProviderPress = useCallback(
    (providerId: number, category?: string) => {

      if (!providerId) {
        logger.error("❌ ProviderId is null or undefined");
        return;
      }


      const navParams: any = {
        providerId: providerId.toString(),
      };

      if (category && category.trim() !== "" && category !== "undefined") {
        navParams.category = category;
      } else {
        logger.warn("⚠️ Category is missing or invalid:", category);
      }

      if (isNearbySearch && coordinates) {
        navParams.lat = coordinates.lat.toString();
        navParams.lng = coordinates.lng.toString();
        navParams.radiusKm = "10";
      } else {
        navParams.city = searchLocation;
      }


      router.push({
        pathname: "/explore/services/provider/[providerId]" as any,
        params: navParams,
      });
    },
    [isNearbySearch, coordinates, searchLocation]
  );

  const handleItemPress = useCallback(
    (item: any) => {

      if (!item) {
        logger.error("❌ Item is null or undefined");
        return;
      }

      if (item.isProvider) {
        if (!item.providerId) {
          logger.error("❌ Provider ID is missing");
          return;
        }
        handleProviderPress(item.providerId, item.category);
      } else {
        if (!item.serviceId) {
          logger.error("❌ Service ID is missing");
          return;
        }

        if (item.category) {
          navigateToServiceDetail(
            item.serviceId,
            item.category as ServiceCategory
          );
        } else {
          router.push({
            pathname: "/explore/services/[serviceId]" as any,
            params: {
              serviceId: item.serviceId.toString(),
            },
          });
        }
      }
    },
    [handleProviderPress]
  );

  const handlePlacePress = useCallback(async (placeId: string) => {
    
    router.push({
      pathname: "/(tabs)/explore/places/[placeId]" as any,
      params: { placeId }
    });
  }, []);

  const handleSeeMore = useCallback((category: string) => {
    setSelectedTab(category);
    setSelectedSubType("All");
  }, []);

  // Render functions
  const renderSearchStatus = () => {
    const totalPlaces = groupedPlaces.reduce((sum, group) => sum + group.places.length, 0);
    const totalServicesAndProviders = providers.length + services.length;
    
    return (
      <View className="px-4 py-3 bg-blue-50 border-b border-blue-100">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-blue-800 font-semibold text-lg">
              {searchLocation}
            </Text>
            <Text className="text-blue-600 text-sm">
              {totalPlaces} places • {totalServicesAndProviders} services & providers found
            </Text>
          </View>
          <View className="flex-row space-x-2">
            {placesLoading && (
              <View className="bg-blue-200 px-2 py-1 rounded-full">
                <Text className="text-blue-700 text-xs">Loading places...</Text>
              </View>
            )}
            {servicesLoading && (
              <View className="bg-green-200 px-2 py-1 rounded-full">
                <Text className="text-green-700 text-xs">Loading services...</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderLoadingState = () => (
    <SearchLoadingState fadeInValue={fadeInValue} />
  );

  const renderPublicPlacesContent = () => {
    
    if (placesLoading) {
      return <PlacesLoadingState />;
    }

    const groupsWithPlaces = groupedPlaces.filter(
      ({ places }) => places.length > 0
    );


    if (groupsWithPlaces.length === 0) {
      return (
        <View className="px-4 py-12">
          <Text className="text-center text-gray-500 text-lg font-medium">
            No public places found for “{searchLocation}”
          </Text>
          <Text className="text-center text-gray-400 text-base mt-2">
            Try searching for a different location or check your internet connection
          </Text>
          <TouchableOpacity
            className="mt-4 bg-primary px-6 py-3 rounded-lg self-center"
            onPress={() => {
              fetchPlaces();
            }}
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View className="mb-6 px-4">
        <SectionHeader
          title="Public Places"
          location={searchLocation}
          isNearby={isNearbySearch}
        />
        <View className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <Text className="text-blue-700 text-sm text-center">
            💡 Tap on any place to view detailed information, photos, and nearby services
          </Text>
        </View>
        {groupsWithPlaces.map(({ group, places }, index) => (
          <View key={group} className="mb-6">
            <AnimatedCard delay={300 + index * 100}>
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-bold text-gray-700">{group}</Text>
                <View className="bg-gray-100 px-3 py-1 rounded-full">
                  <Text className="text-gray-600 text-sm font-medium">
                    {places.length}
                  </Text>
                </View>
              </View>
            </AnimatedCard>
            <PlaceGrid places={places} onItemPress={handlePlacePress} />
          </View>
        ))}
      </View>
    );
  };

  const renderServicesContent = () => {
    if (servicesLoading) {
      return <ServicesLoadingState />;
    }

    if (selectedTab === "All") {
      const sectionsToShow = Object.keys(groupedItems).filter(
        (category) => groupedItems[category]?.length > 0
      );

      if (sectionsToShow.length === 0) {
        return null;
      }

      return (
        <View className="mb-6 px-4">
          <SectionHeader
            title="Services & Providers"
            location={searchLocation}
            isNearby={isNearbySearch}
          />
          {sectionsToShow.map((category, index) => {
            const categoryItems = groupedItems[category] || [];
            const displayName = getCategoryDisplayName(category);
            return (
              <View key={category} className="mb-6">
                <AnimatedCard delay={200 + index * 100}>
                  <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-xl font-bold text-gray-700">
                      {displayName}
                    </Text>
                    <View className="flex-row items-center">
                      <View className="bg-gray-100 px-3 py-1 rounded-full mr-3">
                        <Text className="text-gray-600 text-sm font-medium">
                          {categoryItems.length}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleSeeMore(displayName)}
                      >
                        <Text className="text-primary font-semibold text-sm">
                          View all →
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </AnimatedCard>
                <ServiceGrid
                  services={categoryItems.map((item) => ({
                    serviceId: item.isProvider
                      ? (item as any).providerId
                      : (item as any).serviceId,
                    serviceName: item.displayName,
                    locations: [
                      {
                        city: item.isProvider ? "Provider" : "Service",
                        district: "",
                        province: "",
                        country: "",
                        formattedAddress: "",
                        postalCode: "",
                        latitude: 0,
                        longitude: 0,
                      },
                    ],
                    mainImageUrl: item.displayImage,
                    category: item.displayCategory,
                    prices: [],
                    provider: null,
                  }))}
                  maxItems={6}
                  onItemPress={(itemId) => {
                    const item = categoryItems.find(
                      (i) =>
                        (i.isProvider
                          ? (i as any).providerId
                          : (i as any).serviceId
                        ).toString() === itemId
                    );
                    if (item) handleItemPress(item);
                  }}
                />
              </View>
            );
          })}
        </View>
      );
    }

    // Specific category selected
    if (filteredItems.length === 0) {
      return (
        <View className="px-4 py-12">
          <Text className="text-center text-gray-500 text-xl font-medium">
            No {selectedTab} services found for “{searchLocation}”
          </Text>
          <Text className="text-center text-gray-400 text-base mt-2">
            Try searching for a different location or category
          </Text>
        </View>
      );
    }

    return (
      <View className="mb-6 px-4">
        <ServiceGrid
          services={filteredItems.map((item) => ({
            serviceId: item.isProvider
              ? (item as any).providerId
              : (item as any).serviceId,
            serviceName: item.displayName,
            locations: [
              {
                city: item.isProvider ? "Provider" : "Service",
                district: "",
                province: "",
                country: "",
                formattedAddress: "",
                postalCode: "",
                latitude: 0,
                longitude: 0,
              },
            ],
            mainImageUrl: item.displayImage,
            category: item.displayCategory,
            prices: [],
            provider: null,
          }))}
          onItemPress={(itemId) => {
            const item = filteredItems.find(
              (i) =>
                (i.isProvider
                  ? (i as any).providerId
                  : (i as any).serviceId
                ).toString() === itemId
            );
            if (item) handleItemPress(item);
          }}
        />
      </View>
    );
  };

  if (loading) {
    return renderLoadingState();
  }

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar backgroundColor="#0D9488" />

      {/* Header */}
      <View className="bg-gray-50 pt-12 pb-4">
        <View className="flex-row items-center justify-between mt-5 mb-2 px-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center"
          >
            <ArrowLeftIcon size={34} color="#008080" />
          </TouchableOpacity>

          <Text
            className="text-primary text-3xl font-bold mx-2 flex-1 text-center"
            numberOfLines={1}
          >
            {searchLocation}
          </Text>
        </View>
      </View>

      {/* Search Status */}
      {renderSearchStatus()}

      <Animated.View
        style={{
          flex: 1,
          opacity: mainFadeAnim,
          transform: [{ translateY: mainSlideAnim }],
        }}
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Dynamic Filter Tabs */}
          <FilterBar
            tabs={
              selectedTab !== "All" && selectedTab !== "Public Places"
                ? getSubTypesForCategory(selectedTab)
                : TABS
            }
            selectedTab={
              selectedTab !== "All" && selectedTab !== "Public Places"
                ? selectedSubType
                : selectedTab
            }
            onTabPress={(tab) => {
              if (selectedTab !== "All" && selectedTab !== "Public Places") {
                // We're in sub-type mode
                if (tab === "← Back") {
                  // User wants to go back to main categories
                  setSelectedTab("All");
                  setSelectedSubType("All");
                } else if (tab === "All") {
                  // User wants all sub-types of current category
                  setSelectedSubType("All");
                } else {
                  // User selected a specific sub-type
                  setSelectedSubType(tab);
                }
              } else {
                // We're in main category mode
                handleTabChange(tab);
              }
            }}
          />

          {/* Content */}
          {selectedTab === "Public Places" ? (
            renderPublicPlacesContent()
          ) : (
            <>
              {renderServicesContent()}

              {/* Public Places for "All" tab */}
              {selectedTab === "All" &&
                groupedPlaces.length > 0 &&
                !placesLoading && (
                  <View className="mb-6 px-4">
                    <SectionHeader
                      title="Public Places"
                      location={searchLocation}
                      isNearby={isNearbySearch}
                    />
                    {groupedPlaces
                      .filter(({ places }) => places.length > 0)
                      .map(({ group, places }, index) => (
                        <View key={group} className="mb-6">
                          <AnimatedCard delay={300 + index * 100}>
                            <View className="flex-row items-center justify-between mb-4">
                              <Text className="text-xl font-bold text-gray-700">
                                {group}
                              </Text>
                              <View className="bg-gray-100 px-3 py-1 rounded-full">
                                <Text className="text-gray-600 text-sm font-medium">
                                  {places.length}
                                </Text>
                              </View>
                            </View>
                          </AnimatedCard>
                          <PlaceGrid
                            places={places}
                            horizontal
                            onItemPress={handlePlacePress}
                          />
                        </View>
                      ))}
                  </View>
                )}
            </>
          )}

          {/* Empty State for "All" tab */}
          {selectedTab === "All" &&
            !servicesLoading &&
            !placesLoading &&
            ((providers.length === 0 &&
              services.length === 0 &&
              groupedPlaces.length === 0) ||
              (Object.keys(groupedItems).filter(
                (category) => groupedItems[category]?.length > 0
              ).length === 0 &&
                groupedPlaces.filter(({ places }) => places.length > 0)
                  .length === 0)) && (
              <EmptyState selectedFilter={selectedTab} />
            )}

          <View className="h-20" />
        </ScrollView>
      </Animated.View>
    </View>
  );
};

export default GalleApp;