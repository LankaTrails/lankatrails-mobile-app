import AddToTripButton from "@/components/AddToTripButtonNew";
import HeaderSection from "@/components/explorer-components/HeaderSection";
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
  fetchAccommodationService,
  isAccommodationService,
} from "@/services/serviceDetail";
import type {
  AccommodationServiceDetail,
  ServiceDetailResponse,
} from "@/types/serviceTypes";
import { ServiceDTO } from "@/types/triptypes";

const BASE_URL = process.env.EXPO_PUBLIC_URL;

// Convert AccommodationServiceDetail to ServiceDTO for AddToTripButton
const convertToServiceDTO = (
  detail: AccommodationServiceDetail
): ServiceDTO => ({
  serviceId: detail.serviceId || 0,
  serviceName: detail.serviceName,
  category: "ACCOMMODATION" as const,
  locationBased: detail.locationBased,
  mainImageUrl:
    detail.images && detail.images.length > 0
      ? detail.images[0].imageUrl
      : null,
});

const AccommodationServiceDetailPage = () => {
  const { serviceId } = useLocalSearchParams<{ serviceId: string }>();
  const [serviceDetail, setServiceDetail] =
    useState<AccommodationServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavourite, setIsFavourite] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState("");
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showMap, setShowMap] = useState(false); // Map visibility state
  const [expandedTabs, setExpandedTabs] = useState<{ [key: number]: boolean }>(
    {}
  );

  // Convert service detail to ServiceDTO format
  const convertToServiceDTO = (
    detail: AccommodationServiceDetail
  ): ServiceDTO => {
    return {
      serviceId: detail.serviceId!,
      serviceName: detail.serviceName,
      category: "ACCOMMODATION",
      locationBased: detail.locationBased,
      mainImageUrl:
        detail.images && detail.images.length > 0
          ? detail.images[0].imageUrl
          : undefined,
    };
  };

  // Toggle function for individual tabs
  const toggleTab = (tabId: number) => {
    setExpandedTabs((prev) => ({
      ...prev,
      [tabId]: !prev[tabId],
    }));
  };

  // Fetch service details on component mount
  useEffect(() => {
    const fetchServiceDetails = async () => {
      if (!serviceId) return;

      try {
        setLoading(true);
        setError(null);

        const response: ServiceDetailResponse = await fetchAccommodationService(
          parseInt(serviceId)
        );

        if (response.success && isAccommodationService(response.data)) {
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

  const handleSubmitReview = () => {
    if (userRating === 0 || userReview.trim() === "") {
      Alert.alert("Please add a rating and write a review.");
      return;
    }

    // TODO: Implement API call to submit review
    Alert.alert("Thank you!", "Your review has been submitted.");

    // Reset inputs
    setUserRating(0);
    setUserReview("");
  };

  const renderAmenity = (label: string, value: boolean) => {
    if (!value) return null;

    return (
      <View className="w-1/2 mb-3">
        <View className="flex-row items-center">
          <Ionicons name="checkmark-circle" size={20} color="#008080" />
          <Text className="ml-2 text-gray-700">{label}</Text>
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
              {serviceDetail.locationBased.formattedAddress ||
                `${serviceDetail.locationBased.city}, ${serviceDetail.locationBased.district}`}
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

        <AddToTripButton
          service={convertToServiceDTO(serviceDetail)}
          onTripAdded={() => {
            console.log("Accommodation added to trip successfully");
          }}
        />

        {/* Accommodation Details */}
        <View className="p-5">
          <Text className="text-3xl font-bold text-primary mb-4">
            About the Property
          </Text>

          {/* Accommodation Type and Capacity */}
          <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <View className="flex-row justify-between mb-3">
              <Text className="font-semibold text-gray-700">Type:</Text>
              <Text className="text-gray-600 capitalize">
                {serviceDetail.accommodationType
                  .toLowerCase()
                  .replace("_", " ")}
              </Text>
            </View>
            <View className="flex-row justify-between mb-3">
              <Text className="font-semibold text-gray-700">Max Guests:</Text>
              <Text className="text-gray-600">
                {serviceDetail.maxGuests} people
              </Text>
            </View>
            {serviceDetail.numberOfRooms && (
              <View className="flex-row justify-between">
                <Text className="font-semibold text-gray-700">Rooms:</Text>
                <Text className="text-gray-600">
                  {serviceDetail.numberOfRooms} rooms
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Amenities Section */}
        <View className="px-4 mb-6">
          <Text className="text-2xl font-semibold text-gray-500 mb-4">
            Amenities
          </Text>
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <View className="flex-row flex-wrap">
              {renderAmenity("Free WiFi", serviceDetail.freeWifi)}
              {renderAmenity(
                "Parking Available",
                serviceDetail.parkingAvailable
              )}
              {renderAmenity(
                "Breakfast Included",
                serviceDetail.breakfastIncluded
              )}
              {renderAmenity("Air Conditioned", serviceDetail.airConditioned)}
              {renderAmenity("Swimming Pool", serviceDetail.swimmingPool)}
              {renderAmenity("Pet Friendly", serviceDetail.petFriendly)}
              {renderAmenity("Laundry Service", serviceDetail.laundryService)}
              {renderAmenity("Room Service", serviceDetail.roomService)}
              {renderAmenity("Gym Access", serviceDetail.gymAccess)}
              {renderAmenity("Spa Services", serviceDetail.spaServices)}
            </View>
          </View>
        </View>

        {/* Location Map */}
        {serviceDetail.locationBased &&
          serviceDetail.locationBased.latitude &&
          serviceDetail.locationBased.longitude && (
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
                      {serviceDetail.locationBased.formattedAddress}
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
                      latitude: serviceDetail.locationBased.latitude,
                      longitude: serviceDetail.locationBased.longitude,
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
                        latitude: serviceDetail.locationBased.latitude,
                        longitude: serviceDetail.locationBased.longitude,
                      }}
                      title={serviceDetail.serviceName}
                      description={serviceDetail.locationBased.formattedAddress}
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

        {/* Leave a Review Section */}
        <View className="px-4 mb-20">
          <Text className="text-3xl font-semibold text-gray-500 mb-4">
            Leave a Review
          </Text>

          <View className="bg-white rounded-xl shadow-sm p-4">
            {/* Rating Stars */}
            <Text className="text-gray-500 font-medium text-lg mb-2">
              Your Rating
            </Text>
            <View className="flex-row mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setUserRating(star)}
                >
                  <Star
                    size={24}
                    color={userRating >= star ? "#FBB03B" : "#E5E7EB"}
                    fill={userRating >= star ? "#FBB03B" : "none"}
                    className="mr-1"
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Review Input */}
            <Text className="text-gray-500 font-medium mb-1 text-lg">
              Your Review
            </Text>
            <View className="bg-gray-100 rounded-lg px-3 py-2 mb-4">
              <TextInput
                multiline
                placeholder="Share your experience..."
                value={userReview}
                onChangeText={setUserReview}
                className="text-sm text-gray-800"
                style={{ minHeight: 80 }}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmitReview}
              className="bg-primary py-3 rounded-lg items-center"
            >
              <Text className="text-white text-lg font-medium">
                Submit Review
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("../../support/complaints" as any)}
              className="border-4 border-primary mt-5 bg-white py-3 items-center rounded-full"
            >
              <Text className="text-primary text-lg font-bold">
                Report an Issue
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Floating Add to Trip Button */}
      {serviceDetail && (
        <AddToTripButton service={convertToServiceDTO(serviceDetail)} />
      )}
    </>
  );
};

export default AccommodationServiceDetailPage;
