import EmptyState from "@/components/EmptyState";
import FilterBar from "@/components/FilterBar";
import { searchServices } from "@/services/serviceSearch";
import {
  AccommodationType,
  ActivityType,
  FoodBeverageType,
  GroupedProviderService,
  Service,
  ServiceCategory,
  ServiceSearchRequest,
  ServiceSearchResponse,
  TourGuideType,
  VehicleType,
} from "@/types/serviceTypes";
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
import {
  fetchGroupedPlaces,
  geocodeLocation,
} from "../../../../services/googlePlacesService";

// Import modular components
import {
  PlacesLoadingState,
  SearchLoadingState,
  ServicesLoadingState,
} from "@/components/LoadingStates";
import { SectionHeader } from "@/components/SectionHeader";
import { AnimatedCard } from "@/components/transitions/AnimatedCard";
import { PlaceGrid } from "../places/components/PlaceGrid";
import { ServiceGrid } from "../services/components/ServiceGrid";

const { width } = Dimensions.get("window");
const GOOGLE_PLACES_API_KEY = "AIzaSyA47Q-I515EK0DU4pvk5jgUcatYcdnf8cY";
const CARD_WIDTH = (width - 48) / 2;
const DEFAULT_COORDINATES = { lat: 6.0329, lng: 80.2168 }; // Galle coordinates

// Types
type Place = {
  place_id: string;
  name: string;
  vicinity: string;
  rating?: number | string;
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
  Platform.OS === "android"
    ? ToastAndroid.show(message, ToastAndroid.SHORT)
    : Alert.alert("Error", message);
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

const convertServiceToCardItem = (service: Service): CardItem => ({
  id:
    typeof service.serviceId === "number"
      ? service.serviceId
      : Number(service.serviceId),
  title: service.serviceName,
  subtitle:
    service.locationBased.city || service.locationBased.formattedAddress,
  rating: 4.5, // Default rating
  image: service.mainImageUrl
    ? `http://192.168.1.9:8080${service.mainImageUrl}`
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
  const [services, setServices] = useState<GroupedProviderService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [searchLocation, setSearchLocation] = useState("Galle");

  // Animation values
  const fadeInValue = useAnimatedValue(0);
  const mainFadeAnim = useAnimatedValue(0);
  const mainSlideAnim = useAnimatedValue(40);

  // Computed values
  const coordinates = useCoordinates(params, searchLocation);
  const isNearbySearch = params.isNearby === "true";

  // Flatten grouped services into individual services for display
  const flattenedServices = useMemo(() => {
    return services.reduce((acc: Service[], groupedProvider) => {
      return acc.concat(groupedProvider.services);
    }, []);
  }, [services]);

  const filteredServices = useMemo(() => {
    // Since the API already filters by category when requested,
    // we don't need to filter again on the frontend
    return flattenedServices;
  }, [flattenedServices]);

  const groupedServices = useMemo(() => {
    return flattenedServices.reduce((acc, service) => {
      const normalizedCategory = normalizeCategory(service.category);
      if (!acc[normalizedCategory]) {
        acc[normalizedCategory] = [];
      }
      acc[normalizedCategory].push(service);
      return acc;
    }, {} as Record<string, Service[]>);
  }, [flattenedServices]);

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

    return () => clearTimeout(timer);
  }, [params]);

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

      console.log("API Request being sent:", {
        endpoint: "/service/search",
        params: searchRequest,
        selectedTab,
        selectedSubType,
      });

      const response: ServiceSearchResponse = await searchServices(
        searchRequest
      );

      if (response.success && response.data) {
        console.log("Grouped providers received:", response.data.length);
        const allServices = response.data.flatMap(
          (provider) => provider.services
        );
        console.log("Total services received:", allServices.length);
        console.log(
          "Service categories:",
          allServices.map((s) => s.category)
        );
        console.log(
          "Normalized categories:",
          allServices.map((s) => normalizeCategory(s.category))
        );
        setServices(response.data);
      } else {
        console.error("Search failed:", response.message);
        showError("Failed to load services");
        setServices([]);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      showError("Network error occurred");
      setServices([]);
    } finally {
      setServicesLoading(false);
    }
  }, [
    coordinates,
    isNearbySearch,
    searchLocation,
    selectedTab,
    selectedSubType,
  ]);

  const fetchPlaces = useCallback(async () => {
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
            lat = DEFAULT_COORDINATES.lat;
            lng = DEFAULT_COORDINATES.lng;
          }
        } catch (geocodeError) {
          console.error(
            "Geocoding failed, using default coordinates:",
            geocodeError
          );
          lat = DEFAULT_COORDINATES.lat;
          lng = DEFAULT_COORDINATES.lng;
        }
      }

      console.log(
        `Fetching places for coordinates: ${lat}, ${lng} (${searchLocation})`
      );
      const groups = await fetchGroupedPlaces(lat, lng);
      setGroupedPlaces(groups);
    } catch (error) {
      console.error("Fetch places error:", error);
      setGroupedPlaces([]);
    } finally {
      setPlacesLoading(false);
    }
  }, [coordinates, searchLocation]);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Event handlers
  const handleTabChange = useCallback((newTab: string) => {
    setSelectedTab(newTab);
    setSelectedSubType("All"); // Reset sub-type when tab changes
  }, []);

  const handleServicePress = useCallback((serviceId: string) => {
    router.push({
      pathname: "/explore/services/[serviceId]" as any,
      params: { serviceId },
    });
  }, []);

  const handlePlacePress = useCallback((placeId: string) => {
    router.push({
      pathname: "/explore/places/[placeId]" as any,
      params: {
        placeId,
        type: "public_place",
      },
    });
  }, []);

  const handleSeeMore = useCallback((category: string) => {
    // Redirect to the filtered tab within the current page
    setSelectedTab(category);
    setSelectedSubType("All"); // Reset sub-type when switching to new category
  }, []);

  // Render functions
  const renderLoadingState = () => (
    <SearchLoadingState fadeInValue={fadeInValue} />
  );

  const renderPublicPlacesContent = () => {
    if (placesLoading) {
      return <PlacesLoadingState />;
    }

    // Filter out groups with no places
    const groupsWithPlaces = groupedPlaces.filter(
      ({ places }) => places.length > 0
    );

    if (groupsWithPlaces.length === 0) {
      return (
        <View className="px-4 py-12">
          <Text className="text-center text-gray-500 text-lg font-medium">
            No public places found for "{searchLocation}"
          </Text>
          <Text className="text-center text-gray-400 text-base mt-2">
            Try searching for a different location
          </Text>
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
      const sectionsToShow = Object.keys(groupedServices).filter(
        (category) => groupedServices[category]?.length > 0
      );

      if (sectionsToShow.length === 0) {
        return null;
      }

      return (
        <View className="mb-6 px-4">
          <SectionHeader
            title="Services"
            location={searchLocation}
            isNearby={isNearbySearch}
          />
          {sectionsToShow.map((category, index) => {
            const categoryServices = groupedServices[category] || [];
            const displayName = getCategoryDisplayName(category);
            return (
              <View key={category} className="mb-6">
                <AnimatedCard delay={200 + index * 100}>
                  <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-lg font-bold text-gray-700">
                      {displayName}
                    </Text>
                    <View className="flex-row items-center">
                      <View className="bg-gray-100 px-3 py-1 rounded-full mr-3">
                        <Text className="text-gray-600 text-sm font-medium">
                          {categoryServices.length}
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
                  services={categoryServices}
                  maxItems={6}
                  onItemPress={handleServicePress}
                />
              </View>
            );
          })}
        </View>
      );
    }

    // Specific category selected
    if (filteredServices.length === 0) {
      return (
        <View className="px-4 py-12">
          <Text className="text-center text-gray-500 text-lg font-medium">
            No {selectedTab} services found for "{searchLocation}"
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
          services={filteredServices}
          onItemPress={handleServicePress}
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
                              <Text className="text-lg font-bold text-gray-700">
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
            ((services.length === 0 && groupedPlaces.length === 0) ||
              (Object.keys(groupedServices).filter(
                (category) => groupedServices[category]?.length > 0
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
