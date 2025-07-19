import MapLocationSelector from "@/components/MapLocationSelector";
import SearchBar from "@/components/SearchBar";
import LocationService from "@/utils/locationService";
import {
  getLocationIcon,
  getRecentSearches,
  removeRecentSearch,
  saveRecentSearch,
  type RecentSearch,
} from "@/utils/recentSearchStorage";
import * as Location from "expo-location";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MapPinIcon } from "react-native-heroicons/outline";

// Animation Configuration
const ANIMATION_CONFIG = {
  STAGGER_DELAY: 100,
  FADE_DURATION: 400,
  SLIDE_DURATION: 500,
  SPRING_TENSION: 100,
  SPRING_FRICTION: 8,
  PULSE_DURATION: 1000,
} as const;

// Types
interface PageTransitionProps {
  children: React.ReactNode;
  animationType?: "fadeIn" | "slideUp" | "scaleIn" | "bounceIn";
  isVisible?: boolean;
}

interface StaggeredListItemProps {
  children: React.ReactNode;
  delay?: number;
  index?: number;
}

interface RecentSearchItemProps {
  item: RecentSearch;
  index: number;
  onPress: (item: RecentSearch) => void;
  onRemove: (id: string) => void;
}

// Memoized Animation Components
const PageTransition = React.memo<PageTransitionProps>(
  ({ children, animationType = "fadeIn", isVisible = true }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
      if (!isVisible) return;

      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      scaleAnim.setValue(0.9);

      const animations = {
        fadeIn: () =>
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),

        slideUp: () =>
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: ANIMATION_CONFIG.SLIDE_DURATION,
              useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
              toValue: 0,
              tension: ANIMATION_CONFIG.SPRING_TENSION,
              friction: ANIMATION_CONFIG.SPRING_FRICTION,
              useNativeDriver: true,
            }),
          ]),

        scaleIn: () =>
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: ANIMATION_CONFIG.FADE_DURATION,
              useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
              toValue: 1,
              tension: 150,
              friction: 6,
              useNativeDriver: true,
            }),
          ]),

        bounceIn: () => {
          fadeAnim.setValue(1);
          return Animated.sequence([
            Animated.spring(scaleAnim, {
              toValue: 1.1,
              tension: 200,
              friction: 4,
              useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
              toValue: 1,
              tension: 200,
              friction: 8,
              useNativeDriver: true,
            }),
          ]);
        },
      };

      animations[animationType]()?.start();
    }, [isVisible, animationType, fadeAnim, slideAnim, scaleAnim]);

    const getAnimatedStyle = useCallback(() => {
      const styles = {
        fadeIn: { opacity: fadeAnim },
        slideUp: { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        scaleIn: { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        bounceIn: { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      };
      return styles[animationType];
    }, [animationType, fadeAnim, slideAnim, scaleAnim]);

    return (
      <Animated.View style={[{ flex: 1 }, getAnimatedStyle()]}>
        {children}
      </Animated.View>
    );
  }
);

const StaggeredListItem = React.memo<StaggeredListItemProps>(
  ({ children, delay = 0, index = 0 }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
      const animationDelay = delay + index * ANIMATION_CONFIG.STAGGER_DELAY;
      const timeoutId = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: ANIMATION_CONFIG.FADE_DURATION,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: ANIMATION_CONFIG.SPRING_TENSION,
            friction: ANIMATION_CONFIG.SPRING_FRICTION,
            useNativeDriver: true,
          }),
        ]).start();
      }, animationDelay);

      return () => clearTimeout(timeoutId);
    }, [delay, index, fadeAnim, slideAnim]);

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        {children}
      </Animated.View>
    );
  }
);

const LoadingSkeleton = React.memo(() => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const createPulseAnimation = () => {
      return Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: ANIMATION_CONFIG.PULSE_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: ANIMATION_CONFIG.PULSE_DURATION,
          useNativeDriver: true,
        }),
      ]);
    };

    const runPulseAnimation = () => {
      createPulseAnimation().start(() => runPulseAnimation());
    };

    runPulseAnimation();
  }, [pulseAnim]);

  const skeletonItems = Array.from({ length: 3 }, (_, i) => i + 1);

  return (
    <View className="px-4 py-4">
      <Animated.View
        style={{ opacity: pulseAnim }}
        className="bg-gray-200 h-12 rounded-full mb-4"
      />
      <Animated.View
        style={{ opacity: pulseAnim }}
        className="bg-gray-200 h-16 rounded-lg mb-4"
      />
      {skeletonItems.map((item) => (
        <Animated.View
          key={item}
          style={{ opacity: pulseAnim }}
          className="bg-gray-200 h-12 rounded-lg mb-3"
        />
      ))}
    </View>
  );
});

const SearchItem = React.memo<RecentSearchItemProps>(
  ({ item, index, onPress, onRemove }) => (
    <StaggeredListItem index={index} delay={100}>
      <TouchableOpacity
        className="flex-row items-center justify-between py-4 px-4 hover:bg-gray-50 active:bg-gray-100"
        activeOpacity={0.8}
        onPress={() => onPress(item)}
      >
        <View className="flex-row items-center flex-1">
          <Text className="text-2xl mr-3">{getLocationIcon(item)}</Text>
          <View className="flex-1">
            <Text
              className="text-gray-800 text-lg font-medium"
              numberOfLines={1}
            >
              {item.name}
            </Text>
            {item.searchType === "nearby" && (
              <Text className="text-gray-500 text-sm">Nearby search</Text>
            )}
          </View>
        </View>
        <TouchableOpacity
          className="p-2 hover:bg-gray-200 rounded-full"
          activeOpacity={0.6}
          onPress={(e) => {
            e.stopPropagation();
            onRemove(item.id);
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text className="text-gray-400 text-lg">×</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </StaggeredListItem>
  )
);

const EmptyState = React.memo(() => (
  <StaggeredListItem index={3} delay={200}>
    <View className="py-8 items-center">
      <Text className="text-gray-400 text-4xl mb-2">🔍</Text>
      <Text className="text-gray-500 text-lg text-center font-medium">
        No recent searches yet
      </Text>
      <Text className="text-gray-400 text-sm text-center mt-2 px-8">
        Start exploring to see your search history
      </Text>
    </View>
  </StaggeredListItem>
));

const LocationSearchScreen = () => {
  // State management
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [pageVisible, setPageVisible] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [locationPermission, setLocationPermission] =
    useState<Location.PermissionStatus | null>(null);
  const [currentLocationName, setCurrentLocationName] = useState(
    "Getting location..."
  );
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);
  const [showMapSelector, setShowMapSelector] = useState(false);
  const router = useRouter();

  // Initialize page
  useEffect(() => {
    const initializePage = async () => {
      // Simulate initial loading time
      await new Promise((resolve) => setTimeout(resolve, 800));
      setIsLoading(false);
      setPageVisible(true);
    };

    initializePage();
  }, []);

  // Location management
  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = useCallback(async () => {
    try {
      const status = await LocationService.requestPermissions();
      setLocationPermission(status);

      if (status === "granted") {
        await getCurrentLocation();
      } else {
        setCurrentLocationName("Location access denied");
        if (status === "denied") {
          const permissionGranted =
            await LocationService.showPermissionDialog();
          if (permissionGranted) {
            await getCurrentLocation();
          }
        }
      }
    } catch (error) {
      console.error("Location permission error:", error);
      setCurrentLocationName("Location unavailable");
    }
  }, []);

  const getCurrentLocation = useCallback(async () => {
    try {
      setIsLocationLoading(true);
      setCurrentLocationName("Getting location...");

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
        distanceInterval: 100,
      });

      setLocation(currentLocation);

      const locationName = await LocationService.getLocationName(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude
      );

      setCurrentLocationName(locationName);
    } catch (error) {
      console.error("Error getting current location:", error);
      setCurrentLocationName("Location unavailable");

      Alert.alert(
        "Location Error",
        "Unable to get your current location. Please ensure GPS is enabled and try again.",
        [
          { text: "OK", style: "default" },
          { text: "Retry", onPress: getCurrentLocation },
        ]
      );
    } finally {
      setIsLocationLoading(false);
    }
  }, []);

  // Recent searches management
  const loadRecentSearches = useCallback(async () => {
    try {
      setIsLoadingRecent(true);
      const searches = await getRecentSearches();
      setRecentSearches(searches);
    } catch (error) {
      console.error("Error loading recent searches:", error);
    } finally {
      setIsLoadingRecent(false);
    }
  }, []);

  useEffect(() => {
    loadRecentSearches();
  }, [loadRecentSearches]);

  useFocusEffect(
    useCallback(() => {
      loadRecentSearches();
    }, [loadRecentSearches])
  );

  // Navigation helpers
  const navigateToSearchResult = useCallback(
    (params: any) => {
      router.push({
        pathname: "/explore/search/results" as any,
        params,
      });
    },
    [router]
  );

  const handleNearbySearch = useCallback(async () => {
    if (location) {
      await saveRecentSearch({
        name: currentLocationName,
        searchQuery: "nearby",
        searchType: "nearby",
        coordinates: {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        },
      });

      loadRecentSearches();

      navigateToSearchResult({
        location: currentLocationName,
        lat: location.coords.latitude.toString(),
        lng: location.coords.longitude.toString(),
        isNearby: "true",
      });
    } else {
      // Fallback to default location
      await saveRecentSearch({
        name: "Galle",
        searchQuery: "Galle",
        searchType: "location",
      });

      loadRecentSearches();
      navigateToSearchResult({ location: "Galle" });
    }
  }, [
    location,
    currentLocationName,
    loadRecentSearches,
    navigateToSearchResult,
  ]);

  const handleMapLocationSelect = useCallback(
    async (selectedLocation: {
      latitude: number;
      longitude: number;
      address?: string;
    }) => {
      const locationName = selectedLocation.address || "Selected Location";

      await saveRecentSearch({
        name: locationName,
        searchQuery: locationName,
        searchType: "location",
        coordinates: {
          lat: selectedLocation.latitude,
          lng: selectedLocation.longitude,
        },
      });

      loadRecentSearches();

      navigateToSearchResult({
        location: locationName,
        lat: selectedLocation.latitude.toString(),
        lng: selectedLocation.longitude.toString(),
      });
    },
    [loadRecentSearches, navigateToSearchResult]
  );

  const handleOpenMapSelector = useCallback(() => {
    setShowMapSelector(true);
  }, []);

  const handleCloseMapSelector = useCallback(() => {
    setShowMapSelector(false);
  }, []);

  const handleSearch = useCallback(
    async (searchTerm: string) => {
      await saveRecentSearch({
        name: searchTerm,
        searchQuery: searchTerm,
        searchType: "location",
      });

      loadRecentSearches();

      navigateToSearchResult({
        location: searchTerm,
        searchQuery: searchTerm,
      });
    },
    [loadRecentSearches, navigateToSearchResult]
  );

  const handleRecentSearchPress = useCallback(
    (item: RecentSearch) => {
      if (item.searchType === "nearby" && item.coordinates) {
        navigateToSearchResult({
          location: item.name,
          lat: item.coordinates.lat.toString(),
          lng: item.coordinates.lng.toString(),
          isNearby: "true",
        });
      } else {
        navigateToSearchResult({
          location: item.name,
          searchQuery: item.searchQuery,
        });
      }
    },
    [navigateToSearchResult]
  );

  const handleRemoveRecentSearch = useCallback(
    async (searchId: string) => {
      try {
        // Optimistic update
        setRecentSearches((prev) =>
          prev.filter((search) => search.id !== searchId)
        );
        await removeRecentSearch(searchId);
      } catch (error) {
        console.error("Error removing recent search:", error);
        // Revert on error
        loadRecentSearches();
      }
    },
    [loadRecentSearches]
  );

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <LoadingSkeleton />
      </SafeAreaView>
    );
  }

  // Main render
  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <PageTransition animationType="slideUp" isVisible={pageVisible}>
        {/* Header with Search */}
        <StaggeredListItem index={0} delay={0}>
          <View className="px-4 pt-2 pb-4">
            <View className="relative mt-5">
              <SearchBar
                onSearch={handleSearch}
                placeholder="Search destinations, hotels, activities..."
              />
            </View>
          </View>
        </StaggeredListItem>

        {/* Nearby Section */}
        <StaggeredListItem index={1} delay={80}>
          <View className="px-4">
            <TouchableOpacity
              className="flex-row items-center hover:bg-gray-50 active:bg-gray-100 p-3 rounded-lg"
              activeOpacity={0.8}
              onPress={handleNearbySearch}
              disabled={isLocationLoading}
            >
              <TouchableOpacity
                className="bg-teal-100  p-5 rounded-lg mr-3"
                activeOpacity={0.8}
              >
                <MapPinIcon size={30} color="#008080" strokeWidth={2} />
              </TouchableOpacity>
              <View className="flex-1">
                <Text className="text-gray-800 text-xl font-semibold">
                  Nearby
                </Text>
                {isLocationLoading && (
                  <Text className="text-gray-500 text-sm mt-1">
                    Getting your location...
                  </Text>
                )}
                <View className="flex-row items-center">
                  <MapPinIcon size={16} color="#6B7280" strokeWidth={2} />
                  <Text
                    className="text-gray-500 text-lg ml-1"
                    numberOfLines={1}
                  >
                    {currentLocationName}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </StaggeredListItem>

        {/* Select on Map Section */}
        <StaggeredListItem index={2} delay={120}>
          <View className="px-4 mb-2">
            <TouchableOpacity
              className="flex-row items-center hover:bg-gray-50 active:bg-gray-100 p-3 rounded-lg"
              activeOpacity={0.8}
              onPress={handleOpenMapSelector}
            >
              <TouchableOpacity
                className="bg-blue-100 p-5 rounded-lg mr-3"
                activeOpacity={0.8}
              >
                <MapPinIcon size={30} color="#2563eb" strokeWidth={2} />
              </TouchableOpacity>
              <View className="flex-1">
                <Text className="text-gray-800 text-xl font-semibold">
                  Select on Map
                </Text>
                <Text className="text-gray-500 text-sm mt-1">
                  Pin a location on the map
                </Text>
              </View>
              <View className="flex-row items-center">
                {/* <Text className="text-gray-500 text-lg" numberOfLines={1}>
                  📍
                </Text> */}
              </View>
            </TouchableOpacity>
          </View>
        </StaggeredListItem>

        {/* Recent Searches */}
        <View className="flex-1 px-4">
          <StaggeredListItem index={3} delay={180}>
            <Text className="text-gray-700 font-bold text-xl">
              Recent searches
            </Text>
          </StaggeredListItem>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {isLoadingRecent ? (
              <View className="py-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <View key={index} className="flex-row items-center py-3 px-4">
                    <View className="w-8 h-8 bg-gray-200 rounded-full mr-3" />
                    <View className="flex-1">
                      <View className="w-3/4 h-4 bg-gray-200 rounded mb-2" />
                      <View className="w-1/2 h-3 bg-gray-100 rounded" />
                    </View>
                  </View>
                ))}
              </View>
            ) : recentSearches.length > 0 ? (
              recentSearches.map((item, index) => (
                <SearchItem
                  key={item.id}
                  item={item}
                  index={index + 3}
                  onPress={handleRecentSearchPress}
                  onRemove={handleRemoveRecentSearch}
                />
              ))
            ) : (
              <EmptyState />
            )}
          </ScrollView>
        </View>
      </PageTransition>

      {/* Map Location Selector Modal */}
      <MapLocationSelector
        visible={showMapSelector}
        onClose={handleCloseMapSelector}
        onLocationSelect={handleMapLocationSelect}
        initialLocation={
          location
            ? {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }
            : undefined
        }
      />
    </SafeAreaView>
  );
};

export default LocationSearchScreen;
