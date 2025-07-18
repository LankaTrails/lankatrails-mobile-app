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
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MapPinIcon } from "react-native-heroicons/outline";

const { width, height } = Dimensions.get("window");

// Page Transition Component with multiple animation types
const PageTransition = ({
  children,
  animationType = "fadeIn",
  isVisible = true,
}: {
  children: React.ReactNode;
  animationType?: "fadeIn" | "slideUp" | "scaleIn" | "bounceIn";
  isVisible?: boolean;
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // Reset all animations
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      scaleAnim.setValue(0.9);
      rotateAnim.setValue(0);

      // Choose animation based on type
      switch (animationType) {
        case "fadeIn":
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }).start();
          break;

        case "slideUp":
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
              toValue: 0,
              tension: 100,
              friction: 8,
              useNativeDriver: true,
            }),
          ]).start();
          break;

        case "scaleIn":
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
              toValue: 1,
              tension: 150,
              friction: 6,
              useNativeDriver: true,
            }),
          ]).start();
          break;

        case "bounceIn":
          fadeAnim.setValue(1);
          Animated.sequence([
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
          ]).start();
          break;
      }
    }
  }, [isVisible, animationType]);

  const getAnimatedStyle = () => {
    switch (animationType) {
      case "fadeIn":
        return { opacity: fadeAnim };

      case "slideUp":
        return {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        };

      case "scaleIn":
        return {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        };

      case "bounceIn":
        return {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        };

      default:
        return { opacity: fadeAnim };
    }
  };

  return (
    <Animated.View style={[{ flex: 1 }, getAnimatedStyle()]}>
      {children}
    </Animated.View>
  );
};

// Staggered Animation Component for list items
const StaggeredListItem = ({
  children,
  delay = 0,
  index = 0,
}: {
  children: React.ReactNode;
  delay?: number;
  index?: number;
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    const animationDelay = delay + index * 100; // 100ms stagger between items

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, animationDelay);
  }, []);

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
};

// Loading Skeleton Component
const LoadingSkeleton = () => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();
  }, []);

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
      {[1, 2, 3].map((item) => (
        <Animated.View
          key={item}
          style={{ opacity: pulseAnim }}
          className="bg-gray-200 h-12 rounded-lg mb-3"
        />
      ))}
    </View>
  );
};

const LocationSearchScreen = () => {
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("home");
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
  const router = useRouter();

  // Simulate page loading
  useEffect(() => {
    const loadTimer = setTimeout(() => {
      setIsLoading(false);
      setPageVisible(true);
    }, 1500);

    return () => clearTimeout(loadTimer);
  }, []);

  // Request location permissions and get current location
  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const status = await LocationService.requestPermissions();
      setLocationPermission(status);

      if (status === "granted") {
        getCurrentLocation();
      } else {
        setCurrentLocationName("Location access denied");
        if (status === "denied") {
          const permissionGranted =
            await LocationService.showPermissionDialog();
          if (permissionGranted) {
            getCurrentLocation();
          }
        }
      }
    } catch (error) {
      console.error("Error requesting location permission:", error);
      setCurrentLocationName("Location unavailable");
    }
  };

  const getCurrentLocation = async () => {
    try {
      setIsLocationLoading(true);

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation(currentLocation);

      // Get location name
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
  };

  // Load recent searches when component mounts
  useEffect(() => {
    loadRecentSearches();
  }, []);

  // Reload recent searches when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadRecentSearches();
    }, [])
  );

  const loadRecentSearches = async () => {
    try {
      setIsLoadingRecent(true);
      const searches = await getRecentSearches();
      setRecentSearches(searches);
    } catch (error) {
      console.error("Error loading recent searches:", error);
    } finally {
      setIsLoadingRecent(false);
    }
  };

  const handleNearbySearch = async () => {
    if (location) {
      // Save nearby search to recent searches
      await saveRecentSearch({
        name: currentLocationName,
        searchQuery: "nearby",
        searchType: "nearby",
        coordinates: {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        },
      });

      // Reload recent searches
      loadRecentSearches();

      router.push({
        pathname: "/explore/searchResult" as any,
        params: {
          location: currentLocationName,
          lat: location.coords.latitude.toString(),
          lng: location.coords.longitude.toString(),
          isNearby: "true",
        },
      });
    } else {
      // Fallback to Galle if location is not available
      await saveRecentSearch({
        name: "Galle",
        searchQuery: "Galle",
        searchType: "location",
      });

      loadRecentSearches();

      router.push({
        pathname: "/explore/searchResult" as any,
        params: { location: "Galle" },
      });
    }
  };

  // Handle search functionality
  const handleSearch = async (searchTerm: string) => {
    // Save search to recent searches
    await saveRecentSearch({
      name: searchTerm,
      searchQuery: searchTerm,
      searchType: "location",
    });

    // Reload recent searches
    loadRecentSearches();

    router.push({
      pathname: "/explore/searchResult" as any,
      params: {
        location: searchTerm,
        searchQuery: searchTerm,
      },
    });
  };

  const handleRemoveRecentSearch = async (searchId: string) => {
    try {
      // Optimistically update the UI first (immediate response)
      setRecentSearches((prevSearches) =>
        prevSearches.filter((search) => search.id !== searchId)
      );

      // Then update the storage in background
      await removeRecentSearch(searchId);
    } catch (error) {
      console.error("Error removing recent search:", error);
      // If storage update fails, revert the UI by reloading from storage
      loadRecentSearches();
    }
  };

  type RecentSearchItemProps = {
    item: RecentSearch;
    index: number;
  };

  const SearchItem = ({ item, index }: RecentSearchItemProps) => (
    <StaggeredListItem index={index} delay={100}>
      <TouchableOpacity
        className="flex-row items-center justify-between py-4 px-4 hover:bg-gray-50 active:bg-gray-100"
        activeOpacity={0.8}
        onPress={() => {
          if (item.searchType === "nearby" && item.coordinates) {
            router.push({
              pathname: "/explore/searchResult" as any,
              params: {
                location: item.name,
                lat: item.coordinates.lat.toString(),
                lng: item.coordinates.lng.toString(),
                isNearby: "true",
              },
            });
          } else {
            router.push({
              pathname: "/explore/searchResult" as any,
              params: {
                location: item.name,
                searchQuery: item.searchQuery,
              },
            });
          }
        }}
      >
        <View className="flex-row items-center flex-1">
          <Text className="text-2xl mr-3">{getLocationIcon(item)}</Text>
          <View className="flex-1">
            <Text className="text-gray-800 text-l font-medium">
              {item.name}
            </Text>
            {item.searchType === "nearby" && (
              <Text className="text-gray-500 text-sm">Nearby search</Text>
            )}
          </View>
        </View>
        <TouchableOpacity
          className="p-2 hover:bg-gray-200 rounded-full "
          activeOpacity={0.6}
          onPress={(e) => {
            e.stopPropagation();
            handleRemoveRecentSearch(item.id);
          }}
        >
          <Text className="text-gray-400 text-lg">×</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </StaggeredListItem>
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <LoadingSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white ">
      <PageTransition animationType="slideUp" isVisible={pageVisible}>
        {/* Header */}
        <StaggeredListItem index={0} delay={0}>
          <View className="px-4 pt-2 pb-4">
            {/* <Text className="text-xs text-white text-right mb-4">1</Text> */}

            {/* Search Bar */}
            {/* <SearchBar onPress={() => router.push('/testing')} /> */}
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
          <View className="px-4 mb-6">
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
              </View>
              <View className="flex-row items-center">
                <MapPinIcon size={16} color="#6B7280" strokeWidth={2} />
                <Text className="text-gray-500 text-lg ml-1" numberOfLines={1}>
                  {currentLocationName}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </StaggeredListItem>

        {/* Recent Searches */}
        <View className="flex-1 px-4">
          <StaggeredListItem index={2} delay={150}>
            <Text className="text-gray-600 font-bold text-xl mb-4">
              Recent searches
            </Text>
          </StaggeredListItem>

          <ScrollView showsVerticalScrollIndicator={false}>
            {isLoadingRecent ? (
              // Loading skeleton for recent searches
              <View className="py-4">
                {[1, 2, 3].map((item) => (
                  <View key={item} className="flex-row items-center py-3 px-4">
                    <View className="w-8 h-8 bg-gray-200 rounded-full mr-3" />
                    <View className="flex-1">
                      <View className="w-3/4 h-4 bg-gray-200 rounded mb-1" />
                      <View className="w-1/2 h-3 bg-gray-100 rounded" />
                    </View>
                  </View>
                ))}
              </View>
            ) : recentSearches.length > 0 ? (
              // Show actual recent searches
              recentSearches.map((item, index) => (
                <SearchItem key={item.id} item={item} index={index + 3} />
              ))
            ) : (
              // Empty state
              <StaggeredListItem index={3} delay={200}>
                <View className="py-8 items-center">
                  <Text className="text-gray-400 text-lg mb-2">🔍</Text>
                  <Text className="text-gray-500 text-center">
                    No recent searches yet
                  </Text>
                  <Text className="text-gray-400 text-sm text-center mt-1">
                    Start exploring to see your search history
                  </Text>
                </View>
              </StaggeredListItem>
            )}
          </ScrollView>
        </View>
      </PageTransition>
    </SafeAreaView>
  );
};

export default LocationSearchScreen;
