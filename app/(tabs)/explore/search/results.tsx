import EmptyState from "@/components/EmptyState";
import FilterBar from "@/components/FilterBar";
import { searchServices } from "@/services/serviceSearch";
import { ServiceCategory } from "@/types/commonTypes";
import {
  AccommodationType,
  ActivityType,
  ApiResponse,
  FoodBeverageType,
  ProviderSearchResponse,
  SearchResponse,
  Service,
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
import { navigateToServiceDetail } from "@/utils/navigationHelpers";
import { PlaceGrid } from "../places/components/PlaceGrid";
import { ServiceGrid } from "../services/components/ServiceGrid";

const { width } = Dimensions.get("window");
const GOOGLE_PLACES_API_KEY = "AIzaSyA47Q-I515EK0DU4pvk5jgUcatYcdnf8cY";
const CARD_WIDTH = (width - 48) / 2;
const DEFAULT_COORDINATES = { lat: 6.0329, lng: 80.2168 }; // Galle coordinates

// Sample places data for testing (using real place images from Unsplash)
const SAMPLE_PLACES_DATA: PlaceGroup[] = [
  {
    group: "Temples & Religious Sites",
    places: [
      {
        place_id: "ChIJ1234567890",
        name: "Temple of the Sacred Tooth Relic",
        vicinity: "Kandy",
        rating: 4.5,
        photos: [{
          photo_reference: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop"
        }]
      },
      {
        place_id: "ChIJ0987654321",
        name: "Gangaramaya Temple",
        vicinity: "Colombo",
        rating: 4.3,
        photos: [{
          photo_reference: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=300&fit=crop"
        }]
      },
      {
        place_id: "ChIJ5555555555",
        name: "Ruwanwelisaya Stupa",
        vicinity: "Anuradhapura",
        rating: 4.6,
        photos: [{
          photo_reference: "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=400&h=300&fit=crop"
        }]
      }
    ]
  },
  {
    group: "Historical Sites",
    places: [
      {
        place_id: "ChIJ1111111111",
        name: "Sigiriya Rock Fortress",
        vicinity: "Dambulla",
        rating: 4.7,
        photos: [{
          photo_reference: "https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=400&h=300&fit=crop"
        }]
      },
      {
        place_id: "ChIJ2222222222",
        name: "Galle Dutch Fort",
        vicinity: "Galle",
        rating: 4.4,
        photos: [{
          photo_reference: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=300&fit=crop"
        }]
      },
      {
        place_id: "ChIJ6666666666",
        name: "Polonnaruwa Ancient City",
        vicinity: "Polonnaruwa",
        rating: 4.5,
        photos: [{
          photo_reference: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop"
        }]
      }
    ]
  },
  {
    group: "Beaches",
    places: [
      {
        place_id: "ChIJ3333333333",
        name: "Unawatuna Beach",
        vicinity: "Galle",
        rating: 4.2,
        photos: [{
          photo_reference: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop"
        }]
      },
      {
        place_id: "ChIJ4444444444",
        name: "Mirissa Beach",
        vicinity: "Mirissa",
        rating: 4.6,
        photos: [{
          photo_reference: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop"
        }]
      },
      {
        place_id: "ChIJ7777777777",
        name: "Bentota Beach",
        vicinity: "Bentota",
        rating: 4.3,
        photos: [{
          photo_reference: "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=400&h=300&fit=crop"
        }]
      }
    ]
  },
  {
    group: "Waterfalls & Nature",
    places: [
      {
        place_id: "ChIJ8888888888",
        name: "Sekumpul Waterfall",
        vicinity: "Ella",
        rating: 4.8,
        photos: [{
          photo_reference: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"
        }]
      },
      {
        place_id: "ChIJ9999999999",
        name: "Horton Plains National Park",
        vicinity: "Nuwara Eliya",
        rating: 4.4,
        photos: [{
          photo_reference: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop"
        }]
      }
    ]
  }
];

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
  const [providers, setProviders] = useState<ProviderSearchResponse[]>([]);
  const [services, setServices] = useState<ServiceSearchResponse[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [searchLocation, setSearchLocation] = useState("Galle");

  // Refs for stable values and preventing race conditions
  const isMountedRef = useRef(true);
  const lastServiceCallRef = useRef<string>("");
  const lastPlaceCallRef = useRef<string>("");
  const debounceTimerRef = useRef<number | null>(null);

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
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
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
      console.log("🔄 Services call skipped - duplicate or already loading");
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

      console.log("API Request being sent:", {
        endpoint: "/service/search",
        params: searchRequest,
        selectedTab,
        selectedSubType,
      });

      const response: ApiResponse<SearchResponse> = await searchServices(
        searchRequest
      );

      // Check if component is still mounted before updating state
      if (!isMountedRef.current) {
        console.log("🚫 Component unmounted, skipping state update");
        return;
      }

      if (response.success && response.data) {
        const searchData = response.data;
        console.log("Search response received:", {
          providers: searchData.providers?.length || 0,
          services: searchData.services?.length || 0,
        });

        // Set providers and services separately
        setProviders(searchData.providers || []);
        setServices(searchData.services || []);

        // Log categories for debugging
        const allCategories = [
          ...(searchData.providers?.map((p) => p.category) || []),
          ...(searchData.services?.map((s) => s.category) || []),
        ];
        console.log("Categories:", allCategories);
      } else {
        console.error("Search failed:", response.message);
        showError("Failed to load services");
        setProviders([]);
        setServices([]);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
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
      console.log("🔄 Places call skipped - duplicate or already loading");
      return;
    }

    lastPlaceCallRef.current = callId;

    try {
      setPlacesLoading(true);
      console.log("🏛️ Starting to fetch places...");

      let lat, lng;

      if (coordinates) {
        lat = coordinates.lat;
        lng = coordinates.lng;
        console.log("📍 Using provided coordinates:", { lat, lng });
      } else {
        try {
          console.log("🔍 Geocoding location:", searchLocation);
          const geocodedLocation = await geocodeLocation(searchLocation);
          if (geocodedLocation) {
            lat = geocodedLocation.lat;
            lng = geocodedLocation.lng;
            console.log("✅ Geocoded successfully:", { lat, lng });
          } else {
            console.warn("⚠️ Geocoding failed, using default coordinates");
            lat = DEFAULT_COORDINATES.lat;
            lng = DEFAULT_COORDINATES.lng;
          }
        } catch (geocodeError) {
          console.error("❌ Geocoding error:", geocodeError);
          lat = DEFAULT_COORDINATES.lat;
          lng = DEFAULT_COORDINATES.lng;
        }
      }

      console.log(
        `🔍 Fetching places for coordinates: ${lat}, ${lng} (${searchLocation})`
      );
      
      let groups: PlaceGroup[] = [];
      
      try {
        groups = await fetchGroupedPlaces(lat, lng);
        console.log("📊 Fetched place groups from API:", groups.length);
        
        // Check if API returned an error (like REQUEST_DENIED)
        if (groups.length === 0) {
          console.log("📝 API returned empty or error, using sample data");
          groups = SAMPLE_PLACES_DATA;
        }
      } catch (apiError) {
        console.warn("⚠️ API fetch failed, using sample data:", apiError);
        groups = SAMPLE_PLACES_DATA;
      }
      
      // Log details about each group
      groups.forEach(group => {
        console.log(`📍 ${group.group}: ${group.places.length} places`);
      });

      // Check if component is still mounted before updating state
      if (!isMountedRef.current) {
        console.log("🚫 Component unmounted, skipping places state update");
        return;
      }

      setGroupedPlaces(groups);
      console.log("✅ Places state updated successfully");
    } catch (error) {
      console.error("❌ Fetch places error:", error);
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

  useEffect(() => {
    // Skip if still in initial loading state
    if (loading) return;

    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce the fetchPlaces call
    debounceTimerRef.current = setTimeout(() => {
      fetchPlaces();
    }, 300);
  }, [fetchPlaces, loading]);

  useEffect(() => {
    // Skip if still in initial loading state
    if (loading) return;

    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce the fetchServices call
    debounceTimerRef.current = setTimeout(() => {
      fetchServices();
    }, 300);
  }, [fetchServices, loading]);

  // Event handlers
  const handleTabChange = useCallback((newTab: string) => {
    setSelectedTab(newTab);
    setSelectedSubType("All"); // Reset sub-type when tab changes
  }, []);

  const handleServicePress = useCallback(
    (serviceId: string) => {
      console.log("🔍 handleServicePress called with serviceId:", serviceId);
      console.log("📋 Available services count:", services?.length || 0);

      // Add null check for serviceId
      if (!serviceId) {
        console.error("❌ ServiceId is null or undefined");
        return;
      }

      // Find the service to get its category
      const service = services?.find(
        (s) => s?.serviceId?.toString() === serviceId
      );

      console.log(
        "🎯 Found service:",
        service
          ? {
              serviceId: service.serviceId,
              serviceName: service.serviceName,
              category: service.category,
            }
          : "Service not found"
      );

      if (service && service.category) {
        console.log(
          "✅ Navigating to category-specific route:",
          service.category
        );
        navigateToServiceDetail(
          parseInt(serviceId),
          service.category as ServiceCategory
        );
      } else {
        console.log(
          "⚠️ Using fallback navigation - service or category missing"
        );
        // Fallback to generic route if service not found
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
      console.log("🏢 handleProviderPress called with:", {
        providerId,
        category,
        isNearbySearch,
        coordinates,
        searchLocation,
      });

      // Add null check for providerId
      if (!providerId) {
        console.error("❌ ProviderId is null or undefined");
        return;
      }

      console.log("Navigating to provider with category:", category);

      const navParams: any = {
        providerId: providerId.toString(),
      };

      // Category is required
      if (category && category.trim() !== "" && category !== "undefined") {
        navParams.category = category;
        console.log("✅ Category added to navigation params:", category);
      } else {
        console.warn("⚠️ Category is missing or invalid:", category);
      }

      // Add search location parameters
      if (isNearbySearch && coordinates) {
        // For nearby search, pass coordinates
        navParams.lat = coordinates.lat.toString();
        navParams.lng = coordinates.lng.toString();
        navParams.radiusKm = "10"; // Default radius for nearby search
        console.log("📍 Using coordinate-based navigation");
      } else {
        // For city search, pass city name
        navParams.city = searchLocation;
        console.log("🏙️ Using city-based navigation:", searchLocation);
      }

      console.log("Navigation params:", navParams);

      router.push({
        pathname: "/explore/services/provider/[providerId]" as any,
        params: navParams,
      });
    },
    [isNearbySearch, coordinates, searchLocation]
  );

  const handleItemPress = useCallback(
    (item: any) => {
      console.log("🎯 handleItemPress called with item:", {
        isProvider: item?.isProvider,
        serviceId: item?.serviceId,
        providerId: item?.providerId,
        category: item?.category,
        displayName: item?.displayName,
      });

      // Add null check for item
      if (!item) {
        console.error("❌ Item is null or undefined");
        return;
      }

      if (item.isProvider) {
        console.log("🏢 Processing provider item");
        console.log("Provider item category:", item.category);
        console.log("Provider item:", item);

        if (!item.providerId) {
          console.error("❌ Provider ID is missing");
          return;
        }

        handleProviderPress(item.providerId, item.category);
      } else {
        console.log("⚙️ Processing service item");
        // For services, navigate to service detail using category-specific route
        if (!item.serviceId) {
          console.error("❌ Service ID is missing");
          return;
        }

        if (item.category) {
          console.log("✅ Using category-specific navigation for service:", {
            serviceId: item.serviceId,
            category: item.category,
          });
          navigateToServiceDetail(
            item.serviceId,
            item.category as ServiceCategory
          );
        } else {
          console.log("⚠️ Category missing, using fallback navigation");
          // Fallback to generic route if category not available
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

  const handlePlacePress = useCallback((placeId: string) => {
    console.log("🎯 Navigating to place details:", placeId);
    router.push({
      pathname: "/(tabs)/explore/search/results" as any,
      params: {
        placeId: placeId,
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
    console.log("🏛️ Rendering public places - loading:", placesLoading, "groups:", groupedPlaces.length);
    
    if (placesLoading) {
      return <PlacesLoadingState />;
    }

    // Filter out groups with no places
    const groupsWithPlaces = groupedPlaces.filter(
      ({ places }) => places.length > 0
    );

    console.log("📊 Groups with places:", groupsWithPlaces.length);

    if (groupsWithPlaces.length === 0) {
      return (
        <View className="px-4 py-12">
          <Text className="text-center text-gray-500 text-lg font-medium">
            No public places found for "{searchLocation}"
          </Text>
          <Text className="text-center text-gray-400 text-base mt-2">
            Try searching for a different location or check your internet connection
          </Text>
          <TouchableOpacity
            className="mt-4 bg-primary px-6 py-3 rounded-lg self-center"
            onPress={() => {
              console.log("🔄 Retry button pressed");
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
                    <Text className="text-lg font-bold text-gray-700">
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
                    prices: [], // Add empty prices array for compatibility
                    provider: null, // Add required provider field
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
            prices: [], // Add empty prices array for compatibility
            provider: null, // Add required provider field
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
