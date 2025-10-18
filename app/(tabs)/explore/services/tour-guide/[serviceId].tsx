import AddToTripButton from "@/components/AddToTripButtonNew";
import HeaderSection from "@/components/explorer-components/HeaderSection";
import ReviewsSection from "@/components/ReviewsSection";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { MapPin, Star, User } from "lucide-react-native";
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
  fetchTourGuideService,
  isTourGuideService,
} from "@/services/serviceDetail";
import type { TourGuideServiceDetail } from "@/types/serviceTypes";
import { ApiResponse } from "@/types/commonTypes";
import { Service } from "@/types/serviceTypes";

const BASE_URL = process.env.EXPO_PUBLIC_URL;

// Convert TourGuideServiceDetail to Service for AddToTripButton
const convertToService = (detail: TourGuideServiceDetail): Service => ({
  serviceId: detail.serviceId || 0,
  serviceName: detail.serviceName,
  category: "TOUR_GUIDE" as const,
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

const TourGuideServiceDetailPage = () => {
  const { serviceId } = useLocalSearchParams<{ serviceId: string }>();
  const [serviceDetail, setServiceDetail] =
    useState<TourGuideServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavourite, setIsFavourite] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showMap, setShowMap] = useState(false); // Map visibility state
  const [expandedTabs, setExpandedTabs] = useState<Record<number, boolean>>({});
  const [expandedPolicies, setExpandedPolicies] = useState<
    Record<number, boolean>
  >({});

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

        const response: ApiResponse<TourGuideServiceDetail> =
          await fetchTourGuideService(parseInt(serviceId));

        if (response.success && isTourGuideService(response.data)) {
          setServiceDetail(response.data);
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

  const handleFavourite = () => {
    setIsFavourite((prev) => {
      const newState = !prev;
      if (Platform.OS === "android") {
        ToastAndroid.show(
          newState ? "Added to favourites" : "Removed from favourites",
          ToastAndroid.SHORT
        );
      } else {
        Alert.alert(
          newState ? "Added to favourites" : "Removed from favourites"
        );
      }
      return newState;
    });
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

        {/* Guide Profile Header */}
        <View className="px-4 py-6 bg-white">
          <View className="items-center">
            <View className="bg-primary rounded-full w-24 h-24 items-center justify-center mb-4">
              <User size={48} color="white" />
            </View>
            <Text className="text-2xl font-bold text-gray-800 mb-2">
              {serviceDetail.serviceName}
            </Text>
            {serviceDetail.tourGuideType && (
              <Text className="text-lg text-gray-600 capitalize mb-2">
                {serviceDetail.tourGuideType.toLowerCase().replace("_", " ")}{" "}
                Guide
              </Text>
            )}
          </View>
        </View>

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
          <AddToTripButton
            service={convertToService(serviceDetail)}
            serviceDetail={serviceDetail}
          />
        </View>

        {/* Languages Spoken */}
        {serviceDetail.languages.length > 0 && (
          <View className="px-4 py-4 bg-white mb-4">
            <Text className="text-xl font-semibold text-gray-800 mb-3">
              Languages Spoken
            </Text>
            <View className="flex-row flex-wrap">
              {serviceDetail.languages.map((language, index) => (
                <View
                  key={index}
                  className="bg-primary/10 px-3 py-2 rounded-full mr-2 mb-2"
                >
                  <Text className="text-primary font-medium">{language}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Service Areas */}
        {serviceDetail.serviceAreas &&
          serviceDetail.serviceAreas.length > 0 && (
            <View className="px-4 py-4 bg-white mb-4">
              <Text className="text-xl font-semibold text-gray-800 mb-3">
                Service Areas
              </Text>
              <View className="flex-row flex-wrap">
                {serviceDetail.serviceAreas.map((area, index) => (
                  <View
                    key={index}
                    className="flex-row items-center bg-gray-100 px-3 py-2 rounded-lg mr-2 mb-2"
                  >
                    <MapPin size={16} color="#008080" />
                    <Text className="text-gray-700 ml-1">
                      {area.toString()}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

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

export default TourGuideServiceDetailPage;
