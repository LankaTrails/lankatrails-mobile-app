import AddToTripButton from "@/components/AddToTripButtonNew";
import HeaderSection from "@/components/explorer-components/HeaderSection";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Star, Clock, Calendar, Users } from "lucide-react-native";
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
  fetchPublicPlaceDetails,
  isPublicPlaceService,
} from "@/services/publicPlaceService";
import type {
  PublicPlaceServiceDetail,
  ServiceDetailResponse,
} from "@/types/serviceTypes";
import { ServiceDTO } from "@/types/triptypes";

const BASE_URL = process.env.EXPO_PUBLIC_URL;

// Convert PublicPlaceServiceDetail to ServiceDTO for AddToTripButton
const convertToServiceDTO = (
  detail: PublicPlaceServiceDetail
): ServiceDTO => ({
  serviceId: detail.placeId || 0,
  serviceName: detail.name,
  category: "PUBLIC_PLACE" as const,
  locationBased: detail.location,
  mainImageUrl:
    detail.photos && detail.photos.length > 0
      ? detail.photos[0]
      : null,
});

const PublicPlaceDetailPage = () => {
  const { placeId } = useLocalSearchParams<{ placeId: string }>();
  const [placeDetail, setPlaceDetail] =
    useState<PublicPlaceServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavourite, setIsFavourite] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState("");
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [expandedTabs, setExpandedTabs] = useState<{ [key: number]: boolean }>(
    {}
  );

  // Fetch place details on component mount
  useEffect(() => {
    const fetchPlaceDetails = async () => {
      if (!placeId) return;

      try {
        setLoading(true);
        setError(null);

        const response: ServiceDetailResponse = await fetchPublicPlaceDetails(
          placeId
        );

        if (response.success && isPublicPlaceService(response.data)) {
          setPlaceDetail(response.data);
        } else {
          setError(response.message || "Failed to load place details");
        }
      } catch (err) {
        setError("Network error. Please check your connection.");
        console.error("Error fetching place details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaceDetails();
  }, [placeId]);

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
    const message = `Check out ${placeDetail?.name} in Sri Lanka!`;
    if (Platform.OS === "android") {
      ToastAndroid.show(
        `Sharing ${placeDetail?.name}`,
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

  const renderFeature = (icon: React.ReactNode, label: string, value: string | number) => {
    return (
      <View className="flex-row items-center bg-gray-100 rounded-lg p-3 mb-2 mr-2">
        {icon}
        <Text className="ml-2 text-gray-700 text-sm">
          <Text className="font-semibold">{label}:</Text> {value}
        </Text>
      </View>
    );
  };

  // Toggle function for individual tabs
  const toggleTab = (tabId: number) => {
    setExpandedTabs((prev) => ({
      ...prev,
      [tabId]: !prev[tabId],
    }));
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <HeaderSection title="Loading..." onBack={() => router.back()} />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#008080" />
          <Text className="mt-4 text-gray-600">Loading place details...</Text>
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
  if (!placeDetail) return null;

  return (
    <>
      <SafeAreaView className="bg-white">
        <HeaderSection
          title={placeDetail.name}
          onBack={() => router.back()}
          showFavorite={true}
          isFavorite={isFavourite}
          onFavoritePress={handleFavourite}
        />
      </SafeAreaView>

      <ScrollView className="flex-1 mb-20 bg-gray-50">
        {/* Image Gallery */}
        {placeDetail.photos && placeDetail.photos.length > 0 && (
          <View className="ml-6 mb-6">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {placeDetail.photos.map((photo, index) => (
                <Image
                  key={index}
                  source={{
                    uri: photo.startsWith("http")
                      ? photo
                      : `${BASE_URL}${photo}`,
                  }}
                  className="w-96 h-96 rounded-lg mr-4 shadow-sm"
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Basic Information */}
        <View className="px-4 py-3 border-t border-b border-gray-100 bg-white">
          <Text className="text-2xl font-semibold text-gray-500 mb-3">
            Overview
          </Text>

          <View className="flex-row items-start mb-3">
            <Ionicons name="location" size={24} color="#008080" />
            <Text className="ml-2 text-gray-700 w-[85%]">
              {placeDetail.vicinity || placeDetail.formattedAddress}
            </Text>
          </View>

          {placeDetail.rating && (
            <View className="flex-row items-center mb-3">
              <Ionicons name="star" size={24} color="#FBB03B" />
              <Text className="ml-2 text-gray-700">
                {placeDetail.rating} ({placeDetail.userRatingsTotal || 0} reviews)
              </Text>
            </View>
          )}

          {placeDetail.priceLevel !== undefined && (
            <View className="flex-row items-center">
              <Ionicons name="cash" size={24} color="#008080" />
              <Text className="ml-2 text-gray-700">
                Price Level: {"$".repeat(placeDetail.priceLevel)}
              </Text>
            </View>
          )}
        </View>

        <View className="px-4 mt-6 mb-6">
          <AddToTripButton service={convertToServiceDTO(placeDetail)} />
        </View>

        {/* Place Details */}
        <View className="p-5">
          <Text className="text-3xl font-bold text-primary mb-4">
            About This Place
          </Text>

          {/* Place Type and Features */}
          <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <View className="flex-row justify-between mb-3">
              <Text className="font-semibold text-gray-700">Type:</Text>
              <Text className="text-gray-600 capitalize">
                {placeDetail.types?.join(", ").replace(/_/g, " ") || "Public Place"}
              </Text>
            </View>
            
            {/* Features Grid */}
            <View className="mt-3">
              <Text className="font-semibold text-gray-700 mb-2">Features:</Text>
              <View className="flex-row flex-wrap">
                {placeDetail.openingHours && 
                  renderFeature(
                    <Clock size={16} color="#008080" />,
                    "Open Now",
                    placeDetail.openingHours.openNow ? "Yes" : "No"
                  )
                }
                
                {placeDetail.currentOpeningHours && 
                  renderFeature(
                    <Clock size={16} color="#008080" />,
                    "Hours",
                    "See schedule"
                  )
                }
                
                {placeDetail.utcOffsetMinutes !== undefined && 
                  renderFeature(
                    <Clock size={16} color="#008080" />,
                    "Timezone",
                    `UTC${placeDetail.utcOffsetMinutes >= 0 ? '+' : ''}${placeDetail.utcOffsetMinutes/60}`
                  )
                }
                
                {placeDetail.popularity && 
                  renderFeature(
                    <Users size={16} color="#008080" />,
                    "Popularity",
                    `${placeDetail.popularity}/100`
                  )
                }
              </View>
            </View>
          </View>
        </View>

        {/* Opening Hours */}
        {placeDetail.currentOpeningHours && (
          <View className="px-4 mb-6">
            <Text className="text-2xl font-semibold text-gray-500 mb-4">
              Opening Hours
            </Text>
            <View className="bg-white rounded-lg p-4 shadow-sm">
              {placeDetail.currentOpeningHours.weekdayDescriptions?.map((day, index) => (
                <View key={index} className="flex-row justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <Text className="text-gray-700">{day.split(": ")[0]}</Text>
                  <Text className="text-gray-600 font-medium">{day.split(": ")[1]}</Text>
                </View>
              ))}
              
              {placeDetail.currentOpeningHours.periods && (
                <View className="mt-3">
                  <Text className="font-semibold text-gray-700 mb-2">Current Week:</Text>
                  {placeDetail.currentOpeningHours.periods.map((period, index) => (
                    <View key={index} className="mb-2">
                      <Text className="text-gray-600">
                        {period.open.day}: {period.open.time} - {period.close ? `${period.close.time}` : "Open 24h"}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Location Map */}
        {placeDetail.geometry && placeDetail.geometry.location && (
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
                    {placeDetail.vicinity || placeDetail.formattedAddress}
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
                    latitude: placeDetail.geometry.location.lat,
                    longitude: placeDetail.geometry.location.lng,
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
                      latitude: placeDetail.geometry.location.lat,
                      longitude: placeDetail.geometry.location.lng,
                    }}
                    title={placeDetail.name}
                    description={placeDetail.vicinity}
                  />
                </MapView>
              </View>
            )}
          </View>
        )}

        {/* Reviews Section */}
        {placeDetail.reviews && placeDetail.reviews.length > 0 && (
          <View className="px-4 mb-6">
            <Text className="text-2xl font-semibold text-gray-500 mb-4">
              Reviews
            </Text>
            
            {placeDetail.reviews.slice(0, 3).map((review, index) => (
              <View key={index} className="bg-white rounded-lg p-4 mb-3 shadow-sm">
                <View className="flex-row items-center mb-2">
                  {review.profilePhotoUrl ? (
                    <Image 
                      source={{ uri: review.profilePhotoUrl }} 
                      className="w-10 h-10 rounded-full mr-3"
                    />
                  ) : (
                    <View className="w-10 h-10 rounded-full bg-gray-300 mr-3 items-center justify-center">
                      <Ionicons name="person" size={20} color="#666" />
                    </View>
                  )}
                  <View>
                    <Text className="font-semibold text-gray-800">
                      {review.authorName || "Anonymous"}
                    </Text>
                    <View className="flex-row items-center">
                      <Star size={14} color="#FBB03B" fill="#FBB03B" />
                      <Text className="ml-1 text-gray-600 text-sm">
                        {review.rating}
                      </Text>
                      <Text className="ml-2 text-gray-400 text-sm">
                        {review.relativeTimeDescription}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <Text className="text-gray-700 mt-2">
                  {review.text}
                </Text>
              </View>
            ))}
            
            {placeDetail.reviews.length > 3 && (
              <TouchableOpacity 
                className="bg-primary py-3 rounded-lg items-center mt-2"
                onPress={() => {
                  // Navigate to full reviews page
                  // router.push(`/place/reviews/${placeId}`);
                }}
              >
                <Text className="text-white font-medium">
                  View All {placeDetail.reviews.length} Reviews
                </Text>
              </TouchableOpacity>
            )}
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
    </>
  );
};

export default PublicPlaceDetailPage;