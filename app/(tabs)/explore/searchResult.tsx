import Card from "@/components/Card";
import FilterButton from "@/components/FilterButton";
import { searchServices } from "@/services/serviceSearch";
import {
  Service,
  ServiceCategory,
  ServiceSearchRequest,
  ServiceSearchResponse,
} from "@/types/serviceTypes";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { ArrowLeftIcon, MapPinIcon } from "react-native-heroicons/outline";
import {
  fetchGroupedPlaces,
  geocodeLocation,
} from "../../../services/googlePlacesService";

const { width } = Dimensions.get("window");

const GOOGLE_PLACES_API_KEY = "AIzaSyA47Q-I515EK0DU4pvk5jgUcatYcdnf8cY";

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

const GalleApp = () => {
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [groupedPlaces, setGroupedPlaces] = useState<PlaceGroup[]>([]);
  const [placesLoading, setPlacesLoading] = useState(true);
  const [isFavourite, setIsFavourite] = useState(false);
  const [selectedTab, setSelectedTab] = useState("All");
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [searchLocation, setSearchLocation] = useState("Galle");
  const fadeInValue = useRef(new Animated.Value(0)).current;
  const mainFadeAnim = useRef(new Animated.Value(0)).current;
  const mainSlideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    // Get search parameters from navigation
    if (params.location) {
      setSearchLocation(params.location as string);
    }

    setTimeout(() => {
      setLoading(false);
      Animated.timing(fadeInValue, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }, 600);
  }, [params]);

  // Fetch services from backend
  const fetchServices = async () => {
    try {
      setServicesLoading(true);

      let searchRequest: ServiceSearchRequest;

      // Check if we have coordinates (for nearby search)
      if (params.lat && params.lng && params.isNearby === "true") {
        searchRequest = {
          lat: Number(params.lat),
          lng: Number(params.lng),
          radiusKm: 20, // 20km radius for nearby search
        };
      } else {
        // Text-based search
        searchRequest = {
          city: searchLocation,
          // Add more search parameters as needed
          // district: searchLocation,
          // province: searchLocation,
        };
      }

      // Add category filter if a specific category is selected
      if (selectedTab !== "All") {
        const category = mapTabToCategory(selectedTab);
        if (category) {
          searchRequest.category = category;
        }
      }

      const response: ServiceSearchResponse = await searchServices(
        searchRequest
      );

      if (response.success && response.data) {
        setServices(response.data);
      } else {
        console.error("Search failed:", response.message);
        // Show error message to user
        Platform.OS === "android"
          ? ToastAndroid.show("Failed to load services", ToastAndroid.SHORT)
          : Alert.alert("Error", "Failed to load services");
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      Platform.OS === "android"
        ? ToastAndroid.show("Network error occurred", ToastAndroid.SHORT)
        : Alert.alert("Error", "Network error occurred");
    } finally {
      setServicesLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setPlacesLoading(true);

        let lat, lng;

        // Use coordinates if available (nearby search)
        if (params.lat && params.lng) {
          lat = Number(params.lat);
          lng = Number(params.lng);
        } else {
          // For text-based searches, try to geocode the location
          try {
            const geocodedLocation = await geocodeLocation(searchLocation);
            if (geocodedLocation) {
              lat = geocodedLocation.lat;
              lng = geocodedLocation.lng;
            } else {
              // Default to Galle coordinates as fallback
              lat = 6.0329;
              lng = 80.2168;
            }
          } catch (geocodeError) {
            console.error(
              "Geocoding failed, using default coordinates:",
              geocodeError
            );
            // Default to Galle coordinates as fallback
            lat = 6.0329;
            lng = 80.2168;
          }
        }

        console.log(
          `Fetching public places for coordinates: ${lat}, ${lng} (${searchLocation})`
        );
        const groups = await fetchGroupedPlaces(lat, lng);
        setGroupedPlaces(groups);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setPlacesLoading(false);
      }
    })();
  }, [params.lat, params.lng, searchLocation]);

  // Fetch backend services when component mounts or search location changes
  useEffect(() => {
    fetchServices();
  }, [searchLocation]);

  // Refetch services when selected tab changes (for API-level filtering)
  useEffect(() => {
    if (selectedTab !== "All") {
      fetchServices();
    } else {
      // For "All" tab, fetch all services without category filter
      fetchServices();
    }
  }, [selectedTab]);

  // Helper function to group services by category
  const groupServicesByCategory = () => {
    const grouped = services.reduce((acc, service) => {
      const category = service.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(service);
      return acc;
    }, {} as Record<string, Service[]>);

    return grouped;
  };

  // Convert Service to CardItem format
  const convertServiceToCardItem = (service: Service) => ({
    id: service.serviceId,
    title: service.serviceName,
    subtitle:
      service.locationBased.city || service.locationBased.formattedAddress,
    rating: 4.5, // Default rating since it's not in the Service interface
    image:
      `http://10.22.160.79:8080${service.mainImageUrl}` ||
      "https://via.placeholder.com/160x96/e2e8f0/64748b?text=No+Image",
  });

  // Map display tab names to backend category names
  const mapTabToCategory = (tab: string): ServiceCategory | undefined => {
    const mapping: Record<string, ServiceCategory> = {
      Accommodation: ServiceCategory.ACCOMMODATION,
      "Food & Beverage": ServiceCategory.FOOD_BEVERAGE,
      Transport: ServiceCategory.TRANSPORT,
      Activity: ServiceCategory.ACTIVITY,
      "Tour Guide": ServiceCategory.TOUR_GUIDE,
    };
    return mapping[tab];
  };

  // Filter services by category for tab selection
  const getFilteredServices = () => {
    if (selectedTab === "All") {
      return services;
    }
    const category = mapTabToCategory(selectedTab);
    return services.filter((service) => service.category === category);
  };

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

  const AnimatedCard = ({
    children,
    delay = 0,
  }: {
    children: React.ReactNode;
    delay?: number;
  }) => {
    const cardFade = useRef(new Animated.Value(0)).current;
    const cardSlide = useRef(new Animated.Value(0.2)).current;

    useEffect(() => {
      if (!loading) {
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(cardFade, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(cardSlide, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]).start();
        }, delay);
      }
    }, [loading]);

    return (
      <Animated.View
        style={{ opacity: cardFade, transform: [{ translateY: cardSlide }] }}
      >
        {children}
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Animated.View
          style={{
            transform: [
              {
                rotate: fadeInValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "360deg"],
                }),
              },
            ],
          }}
        >
          <View className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full" />
        </Animated.View>
        <Text className="text-primary mt-4 font-medium">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar backgroundColor="#0D9488" />
      <View className="bg-gray-50 pt-12 pb-4">
        <View className="flex-row items-center justify-between mt-5 mb-2 px-4">
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center"
          >
            <ArrowLeftIcon size={34} color="#008080" />
          </TouchableOpacity>

          {/* Title */}
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
          {/* Tabs */}
          <View className="px-4 mb-6">
            <FlatList
              data={[
                "All",
                "Accommodation",
                "Food & Beverage",
                "Transport",
                "Activity",
                "Tour Guide",
                "Public Places",
              ]}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <FilterButton
                  filter={item}
                  isActive={item === selectedTab}
                  onPress={() => setSelectedTab(item)}
                />
              )}
              keyExtractor={(item) => item}
              contentContainerStyle={{ paddingHorizontal: 0 }}
            />
          </View>

          {/* Dynamic Sections based on Backend Services */}
          {(() => {
            // Handle Public Places filter
            if (selectedTab === "Public Places") {
              if (placesLoading) {
                return (
                  <View className="px-4 py-8">
                    <ActivityIndicator size="large" color="#0D9488" />
                    <Text className="text-center mt-4 text-gray-600">
                      Finding public places...
                    </Text>
                  </View>
                );
              }

              if (groupedPlaces.length === 0) {
                return (
                  <View className="px-4 py-8">
                    <Text className="text-center text-gray-600 text-lg">
                      No public places found for "{searchLocation}"
                    </Text>
                    <Text className="text-center text-gray-500 mt-2">
                      Try searching for a different location
                    </Text>
                  </View>
                );
              }

              // Show only public places when this tab is selected
              return (
                <View className="mb-6 px-4">
                  {/* Public Places Main Heading */}
                  <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-3xl font-bold text-primary">
                      Public Places
                    </Text>
                    <View className="flex-row items-center">
                      <MapPinIcon size={16} color="#6B7280" strokeWidth={2} />
                      <Text className="text-gray-500 text-sm ml-1">
                        {params.isNearby === "true"
                          ? "Near you"
                          : searchLocation}
                      </Text>
                    </View>
                  </View>

                  {groupedPlaces.map(({ group, places }) => (
                    <View key={group} style={{ marginBottom: 20 }}>
                      <AnimatedCard delay={300}>
                        <Text
                          style={{
                            fontSize: 20,
                            fontWeight: "bold",
                            color: "#757575",
                            marginBottom: 10,
                          }}
                        >
                          {group} ({places.length})
                        </Text>
                      </AnimatedCard>
                      {places.length > 0 ? (
                        <FlatList
                          data={places}
                          keyExtractor={(item) => item.place_id}
                          numColumns={2}
                          columnWrapperStyle={
                            places.length > 1
                              ? { justifyContent: "space-between" }
                              : undefined
                          }
                          renderItem={({ item }) => (
                            <Card
                              item={{
                                id: Number(item.place_id),
                                title: item.name,
                                subtitle: item.vicinity,
                                rating:
                                  typeof item.rating === "number"
                                    ? item.rating
                                    : typeof item.rating === "string"
                                    ? Number(item.rating)
                                    : 0,
                                image: item.photos?.[0]
                                  ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${item.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
                                  : "",
                              }}
                              onPress={() =>
                                router.push({
                                  pathname: "/explore/ServiceView" as any,
                                  params: {
                                    placeId: item.place_id,
                                    type: "public_place",
                                  },
                                })
                              }
                              width={(width - 48) / 2}
                            />
                          )}
                          contentContainerStyle={{ paddingBottom: 16 }}
                          scrollEnabled={false}
                        />
                      ) : null}
                    </View>
                  ))}
                </View>
              );
            }

            // Handle Services filtering (existing logic but with improvements)
            if (servicesLoading) {
              return (
                <View className="px-4 py-8">
                  <ActivityIndicator size="large" color="#0D9488" />
                  <Text className="text-center mt-4 text-gray-600">
                    Loading services...
                  </Text>
                </View>
              );
            }

            // Get filtered services based on selected tab
            const filteredServices = getFilteredServices();

            if (filteredServices.length === 0) {
              return (
                <View className="px-4 py-8">
                  <Text className="text-center text-gray-600 text-lg">
                    {selectedTab === "All"
                      ? `No services found for "${searchLocation}"`
                      : `No ${selectedTab} services found for "${searchLocation}"`}
                  </Text>
                  <Text className="text-center text-gray-500 mt-2">
                    Try searching for a different location or category
                  </Text>
                </View>
              );
            }

            // If "All" is selected, group by category and hide categories with no data
            if (selectedTab === "All") {
              const groupedServices = groupServicesByCategory();
              const sectionsToShow = Object.keys(groupedServices).filter(
                (category) =>
                  groupedServices[category] &&
                  groupedServices[category].length > 0
              );

              if (sectionsToShow.length === 0) {
                // Don't show empty state here if there are public places
                return null;
              }

              return (
                <View className="mb-6 px-4">
                  {/* Services Main Heading */}
                  <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-3xl font-bold text-primary">
                      Services
                    </Text>
                    <View className="flex-row items-center">
                      <MapPinIcon size={16} color="#6B7280" strokeWidth={2} />
                      <Text className="text-gray-500 text-sm ml-1">
                        {params.isNearby === "true"
                          ? "Near you"
                          : searchLocation}
                      </Text>
                    </View>
                  </View>

                  {/* Service Categories */}
                  {sectionsToShow.map((category, index) => {
                    const categoryServices = groupedServices[category] || [];

                    return (
                      <View key={category} className="mb-6">
                        <AnimatedCard delay={300 + index * 200}>
                          <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-2xl font-bold text-gray-800/70">
                              {category} ({categoryServices.length})
                            </Text>
                            <TouchableOpacity
                              onPress={() =>
                                router.push({
                                  pathname:
                                    "/explore/accommodation-foods-transport" as any,
                                  params: {
                                    tab: category
                                      .toLowerCase()
                                      .replace(" & ", "-"),
                                    location: searchLocation,
                                  },
                                })
                              }
                            >
                              <Text className="text-primary font-medium">
                                See more →
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </AnimatedCard>

                        <FlatList
                          data={categoryServices.slice(0, 6)} // Limit to 6 items for preview
                          keyExtractor={(item) => item.serviceId.toString()}
                          numColumns={2}
                          columnWrapperStyle={
                            categoryServices.slice(0, 6).length > 1
                              ? { justifyContent: "space-between" }
                              : undefined
                          }
                          renderItem={({ item }) => (
                            <Card
                              item={convertServiceToCardItem(item)}
                              width={(width - 48) / 2}
                              onPress={() =>
                                router.push({
                                  pathname: "/explore/ServiceView" as any,
                                  params: { serviceId: item.serviceId },
                                })
                              }
                            />
                          )}
                          contentContainerStyle={{ paddingBottom: 16 }}
                          scrollEnabled={false}
                        />
                      </View>
                    );
                  })}
                </View>
              );
            } else {
              // Show filtered services for specific category
              return (
                <View className="mb-6 px-4">
                  {/* Services Main Heading for specific category */}
                  <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-3xl font-bold text-primary">
                      Services
                    </Text>
                    <View className="flex-row items-center">
                      <MapPinIcon size={16} color="#6B7280" strokeWidth={2} />
                      <Text className="text-gray-500 text-sm ml-1">
                        {params.isNearby === "true"
                          ? "Near you"
                          : searchLocation}
                      </Text>
                    </View>
                  </View>

                  <AnimatedCard delay={300}>
                    <View className="flex-row items-center justify-between mb-4">
                      <Text className="text-2xl font-bold text-gray-800/70">
                        {selectedTab} ({filteredServices.length})
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          router.push({
                            pathname:
                              "/explore/accommodation-foods-transport" as any,
                            params: {
                              tab: selectedTab
                                .toLowerCase()
                                .replace(" & ", "-"),
                              location: searchLocation,
                            },
                          })
                        }
                      >
                        <Text className="text-primary font-medium">
                          See more →
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </AnimatedCard>

                  <FlatList
                    data={filteredServices.slice(0, 10)} // Show more items for specific category
                    keyExtractor={(item) => item.serviceId.toString()}
                    numColumns={2}
                    columnWrapperStyle={
                      filteredServices.slice(0, 10).length > 1
                        ? { justifyContent: "space-between" }
                        : undefined
                    }
                    renderItem={({ item }) => (
                      <Card
                        item={convertServiceToCardItem(item)}
                        width={(width - 48) / 2}
                        onPress={() =>
                          router.push({
                            pathname: "/explore/ServiceView" as any,
                            params: { serviceId: item.serviceId },
                          })
                        }
                      />
                    )}
                    contentContainerStyle={{ paddingBottom: 16 }}
                    scrollEnabled={false}
                  />
                </View>
              );
            }
          })()}

          {/* Public Places - Only show when "All" tab is selected and has data */}
          {selectedTab === "All" &&
            groupedPlaces.length > 0 &&
            !placesLoading && (
              <View className="mb-6 px-4">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-3xl font-bold text-primary">
                    Public Places
                  </Text>
                  <View className="flex-row items-center">
                    <MapPinIcon size={16} color="#6B7280" strokeWidth={2} />
                    <Text className="text-gray-500 text-sm ml-1">
                      {params.isNearby === "true" ? "Near you" : searchLocation}
                    </Text>
                  </View>
                </View>
                <>
                  {groupedPlaces.map(({ group, places }) => (
                    <View key={group} style={{ marginBottom: 20 }}>
                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: "bold",
                          color: "#757575",
                          marginBottom: 10,
                        }}
                      >
                        {group} ({places.length})
                      </Text>
                      {places.length > 0 ? (
                        <FlatList
                          data={places}
                          keyExtractor={(item) => item.place_id}
                          renderItem={({ item }) => (
                            <Card
                              item={{
                                id: Number(item.place_id),
                                title: item.name,
                                subtitle: item.vicinity,
                                rating:
                                  typeof item.rating === "number"
                                    ? item.rating
                                    : typeof item.rating === "string"
                                    ? Number(item.rating)
                                    : 0,
                                image: item.photos?.[0]
                                  ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${item.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
                                  : "",
                              }}
                              onPress={() =>
                                router.push({
                                  pathname: "/explore/ServiceView" as any,
                                  params: {
                                    placeId: item.place_id,
                                    type: "public_place",
                                  },
                                })
                              }
                              width={180}
                            />
                          )}
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={{
                            paddingHorizontal: 4,
                            gap: 16,
                          }}
                        />
                      ) : null}
                    </View>
                  ))}
                </>
              </View>
            )}

          {/* Show empty state only when both services and public places have no data */}
          {selectedTab === "All" &&
            !servicesLoading &&
            !placesLoading &&
            services.length === 0 &&
            groupedPlaces.length === 0 && (
              <View className="px-4 py-8">
                <Text className="text-center text-gray-600 text-lg">
                  No services or places found for "{searchLocation}"
                </Text>
                <Text className="text-center text-gray-500 mt-2">
                  Try searching for a different location
                </Text>
              </View>
            )}
          <View className="h-20" />
        </ScrollView>
      </Animated.View>
    </View>
  );
};

export default GalleApp;
