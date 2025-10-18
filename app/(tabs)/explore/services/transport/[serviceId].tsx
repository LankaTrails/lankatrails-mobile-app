import AddToTripButton from "@/components/AddToTripButtonNew";
import HeaderSection from "@/components/explorer-components/HeaderSection";
import ReviewsSection from "@/components/ReviewsSection";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Star } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  ScrollView,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

// Import service functions and types
import {
  fetchTransportService,
  isTransportService,
} from "@/services/serviceDetail";
import type { TransportServiceDetail } from "@/types/serviceTypes";
import { ApiResponse } from "@/types/commonTypes";
import { Service } from "@/types/serviceTypes";
import {
  getFavorites,
  addFavorites,
  removeFavorites,
} from "@/services/favouriteService";
import { FavoriteItem } from "@/types/triptypes";

const BASE_URL = process.env.EXPO_PUBLIC_URL;

// Convert TransportServiceDetail to Service for AddToTripButton
const convertToService = (detail: TransportServiceDetail): Service => ({
  serviceId: detail.serviceId || 0,
  serviceName: detail.serviceName,
  category: "TRANSPORT" as const,
  locations: detail.locations,
  prices: detail.priceConfig
    ? [
        {
          priceType: detail.priceConfig.priceType,
          amount:
            detail.priceConfig.fixedPrice ||
            detail.priceConfig.pricePerUnit ||
            0,
        },
      ]
    : [],
  mainImageUrl:
    detail.images && detail.images.length > 0 ? detail.images[0].imageUrl : "",
  provider: null,
});

const TransportServiceDetailPage = () => {
  const { serviceId } = useLocalSearchParams<{ serviceId: string }>();
  const [serviceDetail, setServiceDetail] =
    useState<TransportServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavourite, setIsFavourite] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showMap, setShowMap] = useState(false); // Map visibility state
  const [expandedTabs, setExpandedTabs] = useState<Record<number, boolean>>({});
  const [expandedPolicies, setExpandedPolicies] = useState<
    Record<number, boolean>
  >({});
  const [favourites, setFavourites] = useState<FavoriteItem[]>([]);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // Check if current service is in favorites
  const checkIfFavorite = (
    serviceDetail: TransportServiceDetail,
    favorites: FavoriteItem[]
  ) => {
    return favorites.some(
      (fav) =>
        fav.type === "SERVICE" &&
        fav.service?.serviceId === serviceDetail.serviceId
    );
  };

  // Toggle functions for individual items
  const toggleTab = (tabId: number) => {
    setExpandedTabs((prev) => ({
      ...prev,
      [tabId]: !prev[tabId],
    }));
  };

  const togglePolicy = (policyId: number) => {
    setExpandedPolicies((prev) => ({
      ...prev,
      [policyId]: !prev[policyId],
    }));
  };

  // Fetch service details on component mount
  useEffect(() => {
    const fetchServiceDetails = async () => {
      if (!serviceId) return;

      try {
        setLoading(true);
        setError(null);

        const response: ApiResponse<TransportServiceDetail> =
          await fetchTransportService(parseInt(serviceId));

        if (response.success && isTransportService(response.data)) {
          setServiceDetail(response.data);

          // Fetch favorites after getting service details
          try {
            const favorites = await getFavorites();
            setFavourites(favorites);
            setIsFavourite(checkIfFavorite(response.data, favorites));
          } catch (favError) {
            console.error("Error fetching favorites:", favError);
          }
        } else {
          setError(response.message || "Failed to load service details");
        }
      } catch (err) {
        setError("Network error. Please check your connection.");
        console.error("Error fetching service details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceDetails();
  }, [serviceId]);

  const handleFavourite = async () => {
    if (!serviceDetail || favoriteLoading) return;

    const favoriteItem: FavoriteItem = {
      type: "SERVICE",
      service: convertToService(serviceDetail),
      place: null,
    };

    try {
      setFavoriteLoading(true);

      if (isFavourite) {
        // Remove from favorites
        const updatedFavorites = await removeFavorites(favoriteItem);
        setFavourites(updatedFavorites);
        setIsFavourite(false);

        if (Platform.OS === "android") {
          ToastAndroid.show("Removed from favourites", ToastAndroid.SHORT);
        } else {
          Alert.alert("Removed from favourites");
        }
      } else {
        // Add to favorites
        const updatedFavorites = await addFavorites(favoriteItem);
        setFavourites(updatedFavorites);
        setIsFavourite(true);

        if (Platform.OS === "android") {
          ToastAndroid.show("Added to favourites", ToastAndroid.SHORT);
        } else {
          Alert.alert("Added to favourites");
        }
      }
    } catch (error) {
      console.error("Error handling favorite:", error);
      if (Platform.OS === "android") {
        ToastAndroid.show("Failed to update favorites", ToastAndroid.SHORT);
      } else {
        Alert.alert("Error", "Failed to update favorites");
      }
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleShare = () => {
    const message = `Check out ${serviceDetail?.serviceName}!`;
    if (Platform.OS === "android") {
      ToastAndroid.show(
        `Sharing ${serviceDetail?.serviceName}`,
        ToastAndroid.SHORT
      );
    } else {
      Alert.alert("Share", message);
    }
  };

  const renderFeature = (icon: string, label: string, value: boolean) => {
    return (
      <View className={`w-1/2 mb-3 ${value ? "opacity-100" : "opacity-40"}`}>
        <View className="flex-row items-center">
          <Ionicons
            name={value ? "checkmark-circle" : "close-circle"}
            size={20}
            color={value ? "#008080" : "#ef4444"}
          />
          <Text className={`ml-2 ${value ? "text-gray-700" : "text-gray-400"}`}>
            {label}
          </Text>
        </View>
      </View>
    );
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <HeaderSection title="Loading..." onBack={() => router.back()} />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#008080" />
          <Text className="mt-4 text-gray-600">Loading service details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <HeaderSection title="Error" onBack={() => router.back()} />
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="alert-circle" size={64} color="#ef4444" />
          <Text className="mt-4 text-xl font-semibold text-gray-800">
            Oops!
          </Text>
          <Text className="mt-2 text-gray-600 text-center">{error}</Text>
          <TouchableOpacity
            className="mt-6 bg-primary px-6 py-3 rounded-lg"
            onPress={() => router.back()}
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Main content
  if (!serviceDetail) return null;

  return (
    <>
      <SafeAreaView className="bg-white">
        <HeaderSection
          title={serviceDetail.serviceName}
          onBack={() => router.back()}
          showFavorite={true}
          isFavorite={isFavourite}
          onFavoritePress={handleFavourite}
        />
      </SafeAreaView>

      <ScrollView className="flex-1 mb-20 bg-gray-50">
        {/* Image Gallery */}
        {serviceDetail.images && serviceDetail.images.length > 0 && (
          <View className="ml-6 mb-6">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {serviceDetail.images.map((img, index) => (
                <Image
                  key={index}
                  source={{
                    uri: img.imageUrl.startsWith("http")
                      ? img.imageUrl
                      : `${BASE_URL}${img.imageUrl}`,
                  }}
                  className="w-96 h-96 rounded-lg mr-4 shadow-sm"
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Vehicle Header */}
        {/* <View className="px-4 py-6 bg-white">
          <View className="items-center">
            <View className="bg-primary rounded-full w-24 h-24 items-center justify-center mb-4">
              <Car size={48} color="white" />
            </View>
            <Text className="text-2xl font-bold text-gray-800 mb-2">
              {serviceDetail.serviceName}
            </Text>
            <Text className="text-lg text-gray-600 capitalize">
              {serviceDetail.vehicleCategory.toLowerCase().replace("_", " ")}
            </Text>
          </View>
        </View> */}

        {/* Contact Information */}
        <View className="px-4 py-3 border-t border-b border-gray-100 bg-white">
          <Text className="text-2xl font-semibold text-gray-500 mb-3">
            Contact
          </Text>

          <TouchableOpacity
            onPress={() => Linking.openURL(`tel:${serviceDetail.contactNo}`)}
            className="flex-row items-center mb-2"
          >
            <Ionicons name="call" size={24} color="#008080" />
            <Text className="ml-4 text-gray-700 text-lg">
              {serviceDetail.contactNo}
            </Text>
          </TouchableOpacity>

          <View className="flex-row items-start mt-1">
            <Ionicons name="location" size={24} color="#008080" />
            <Text className="ml-2 text-gray-700 w-[85%]">
              {serviceDetail.locations && serviceDetail.locations.length > 0
                ? serviceDetail.locations[0].formattedAddress ||
                  (serviceDetail.locations[0].city &&
                  serviceDetail.locations[0].district
                    ? `${serviceDetail.locations[0].city}, ${serviceDetail.locations[0].district}`
                    : "Location not available")
                : "Location not available"}
            </Text>
          </View>

          {serviceDetail.price && (
            <View className="flex-row items-center mt-3">
              <Ionicons name="cash" size={24} color="#008080" />
              <Text className="ml-4 text-gray-700 text-lg font-semibold">
                LKR {serviceDetail.price}
                {serviceDetail.priceType && (
                  <Text className="text-sm text-gray-500">
                    {" "}
                    / {serviceDetail.priceType.toLowerCase().replace("_", " ")}
                  </Text>
                )}
              </Text>
            </View>
          )}
        </View>

        <View className="px-4 mt-6 mb-6">
          <AddToTripButton service={convertToService(serviceDetail)} />
        </View>

        {/* Vehicle Specifications */}
        <View className="p-5">
          <Text className="text-3xl font-bold text-primary mb-4">
            Vehicle Details
          </Text>

          <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <View className="flex-row justify-between mb-3">
              <Text className="font-semibold text-gray-700">Vehicle Type:</Text>
              <Text className="text-gray-600 capitalize">
                {serviceDetail.vehicleCategory.toLowerCase().replace("_", " ")}
              </Text>
            </View>
            <View className="flex-row justify-between mb-3">
              <Text className="font-semibold text-gray-700">Capacity:</Text>
              <Text className="text-gray-600">
                {serviceDetail.vehicleCapacity} people
              </Text>
            </View>
            <View className="flex-row justify-between mb-3">
              <Text className="font-semibold text-gray-700">
                Quantity Available:
              </Text>
              <Text className="text-gray-600">
                {serviceDetail.vehicleQty} vehicles
              </Text>
            </View>
            <View className="flex-row justify-between mb-3">
              <Text className="font-semibold text-gray-700">Transmission:</Text>
              <Text className="text-gray-600 capitalize">
                {serviceDetail.transmissionType.toLowerCase().replace("_", " ")}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="font-semibold text-gray-700">Fuel Type:</Text>
              <Text className="text-gray-600 capitalize">
                {serviceDetail.fuelType.toLowerCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Features */}
        <View className="px-4 mb-6">
          <Text className="text-2xl font-semibold text-gray-500">Features</Text>
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <View className="flex-row flex-wrap">
              {renderFeature(
                "person",
                "Driver Included",
                serviceDetail.driverIncluded
              )}
              {renderFeature(
                "snow",
                "Air Conditioned",
                serviceDetail.airConditioned
              )}
            </View>
          </View>
        </View>

        {/* Location Map */}
        {serviceDetail.locations[0] &&
          serviceDetail.locations[0].latitude &&
          serviceDetail.locations[0].longitude && (
            <View className="px-4 mb-6">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-2xl font-semibold text-gray-500">
                  Location
                </Text>
              </View>

              {/* Address Display - Always visible */}
              <View className="p-3 bg-white rounded-lg shadow-sm mb-3">
                <TouchableOpacity
                  onPress={() => setShowMap(!showMap)}
                  className="flex-row items-center"
                >
                  <Ionicons name="location" size={20} color="#008080" />
                  <View className="flex-1 ml-2">
                    <Text className="text-sm font-medium text-gray-700 mb-1">
                      Address
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {serviceDetail.locations[0].formattedAddress}
                    </Text>
                  </View>
                  <Ionicons
                    name={showMap ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>

              {/* Map - Conditionally visible */}
              {showMap && (
                <View
                  className="rounded-lg overflow-hidden"
                  style={{ height: 200 }}
                >
                  <MapView
                    style={{ flex: 1 }}
                    initialRegion={{
                      latitude: serviceDetail.locations[0].latitude,
                      longitude: serviceDetail.locations[0].longitude,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                    showsUserLocation={true}
                    showsMyLocationButton={true}
                    showsCompass={true}
                    scrollEnabled={true}
                    zoomEnabled={true}
                  >
                    <Marker
                      coordinate={{
                        latitude: serviceDetail.locations[0].latitude,
                        longitude: serviceDetail.locations[0].longitude,
                      }}
                      title={serviceDetail.serviceName}
                      description={serviceDetail.locations[0].formattedAddress}
                    />
                  </MapView>
                </View>
              )}
            </View>
          )}

        {/* Tabs Section */}
        {serviceDetail.tabsSection.length > 0 && (
          <View className="px-4 mb-6">
            {serviceDetail.tabsSection.map((tab) => (
              <View
                key={tab.id}
                className="bg-white rounded-lg mb-3 shadow-sm overflow-hidden"
              >
                {/* Clickable Tab Header */}
                <TouchableOpacity
                  onPress={() => toggleTab(tab.id)}
                  className="flex-row items-center justify-between p-4"
                >
                  <Text className="text-lg font-semibold text-gray-800 flex-1 mr-3">
                    {tab.heading}
                  </Text>
                  <Ionicons
                    name={expandedTabs[tab.id] ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>

                {/* Tab Content - Conditionally visible */}
                {expandedTabs[tab.id] && (
                  <View className="px-4 pb-4">
                    <Text className="text-gray-600 leading-6">
                      {tab.content.replace(/<[^>]*>/g, "")}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Policy Section */}
        {serviceDetail.policySection.length > 0 && (
          <View className="px-4 mb-6">
            {serviceDetail.policySection.map((policy) => (
              <View
                key={policy.id}
                className="bg-white rounded-lg mb-3 shadow-sm overflow-hidden"
              >
                {/* Clickable Policy Header */}
                <TouchableOpacity
                  onPress={() => togglePolicy(policy.id)}
                  className="flex-row items-center justify-between p-4"
                >
                  <Text className="text-lg font-semibold text-gray-800 flex-1 mr-3">
                    {policy.heading}
                  </Text>
                  <Ionicons
                    name={
                      expandedPolicies[policy.id]
                        ? "chevron-up"
                        : "chevron-down"
                    }
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>

                {/* Policy Content - Conditionally visible */}
                {expandedPolicies[policy.id] && (
                  <View className="px-4 pb-4">
                    <Text className="text-gray-600 leading-6">
                      {policy.content.replace(/<[^>]*>/g, "")}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Reviews and Ratings Section */}
        <ReviewsSection serviceId={parseInt(serviceId)} />

        {/* Report Issue Section */}
        <View className="px-4 mb-20">
          <TouchableOpacity
            onPress={() => router.push("../../support/complaints" as any)}
            className="border-2 border-primary bg-white py-3 items-center rounded-xl"
          >
            <Text className="text-primary text-lg font-semibold">
              Report an Issue
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
};

export default TransportServiceDetailPage;
