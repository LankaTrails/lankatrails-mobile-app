import { ServiceGrid } from "@/app/(tabs)/explore/services/components/ServiceGrid";
import HeaderSection from "@/components/explorer-components/HeaderSection";
import { searchProvider } from "@/services/serviceSearch";
import {
  ApiResponse,
  ProviderDetailRequest,
  ProviderDetailResponse,
  Service,
  ServiceCategory,
} from "@/types/serviceTypes";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Star } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// Helper function to validate ServiceCategory
const isValidServiceCategory = (
  category: string
): category is ServiceCategory => {
  return Object.values(ServiceCategory).includes(category as ServiceCategory);
};

// Helper function to format category names nicely
const formatCategoryName = (category: ServiceCategory): string => {
  const categoryMap: Record<ServiceCategory, string> = {
    [ServiceCategory.ACCOMMODATION]: "Accommodation",
    [ServiceCategory.FOOD_BEVERAGE]: "Food & Beverage",
    [ServiceCategory.TRANSPORT]: "Transport",
    [ServiceCategory.ACTIVITY]: "Activity",
    [ServiceCategory.TOUR_GUIDE]: "Tour Guide",
  };
  return categoryMap[category] || category.replace("_", " ");
};

const ProviderDetailView = () => {
  const params = useLocalSearchParams<{
    id: string;
    providerId: string;
    category?: string;
    city?: string;
    lat?: string;
    lng?: string;
    radiusKm?: string;
  }>();
  const providerId = params.id || params.providerId;
  const category = params.category;
  const city = params.city;
  const lat = params.lat ? parseFloat(params.lat) : undefined;
  const lng = params.lng ? parseFloat(params.lng) : undefined;
  const radiusKm = params.radiusKm ? parseFloat(params.radiusKm) : undefined;

  // State management
  const [provider, setProvider] = useState<ProviderDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState("");
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showMap, setShowMap] = useState(false); // Map visibility state

  // Fetch provider details
  useEffect(() => {
    const fetchProviderDetails = async () => {
      if (!providerId) return;

      try {
        setLoading(true);

        // Validate required parameters
        if (!category || !isValidServiceCategory(category)) {
          console.error("Invalid or missing category:", category);
          Alert.alert("Error", "Invalid category parameter");
          return;
        }

        // Validate that we have location information
        if (!city && (!lat || !lng || !radiusKm)) {
          console.error(
            "Missing location parameters. City:",
            city,
            "Coordinates:",
            lat,
            lng,
            radiusKm
          );
          Alert.alert("Error", "Missing location information");
          return;
        }

        const request: ProviderDetailRequest = {
          providerId: parseInt(providerId as string),
          category: category as ServiceCategory,
        };

        // Add location parameters
        if (city) {
          request.city = city;
          console.log("Using city search:", city);
        } else if (lat && lng && radiusKm) {
          request.lat = lat;
          request.lng = lng;
          request.radiusKm = radiusKm;
          console.log("Using coordinate search:", lat, lng, radiusKm);
        }

        console.log("Provider detail request:", request);

        const response: ApiResponse<ProviderDetailResponse> =
          await searchProvider(request);

        console.log("Provider detail response:", response);

        if (response.success && response.data) {
          console.log("Provider data received:", response.data);
          console.log("Provider location:", response.data.location);
          setProvider(response.data);
        } else {
          console.error("API call failed:", response.message);
          Alert.alert(
            "Error",
            response.message || "Failed to load provider details"
          );
        }
      } catch (error) {
        console.error("Error fetching provider details:", error);
        Alert.alert("Error", "Failed to load provider details");
      } finally {
        setLoading(false);
      }
    };

    fetchProviderDetails();
  }, [providerId, category, city, lat, lng, radiusKm]);

  // Navigation handlers
  const handleServicePress = (service: Service) => {
    router.push({
      pathname: "/explore/services/[serviceId]" as any,
      params: {
        serviceId: service.serviceId.toString(),
      },
    });
  };

  const handleSubmitReview = () => {
    if (userRating === 0 || userReview.trim() === "") {
      Alert.alert("Please add a rating and write a review.");
      return;
    }

    Alert.alert("Thank you!", "Your feedback has been submitted.");
    setUserRating(0);
    setUserReview("");
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-600">
            Loading provider details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state or no provider data
  if (!provider || !provider.businessName) {
    console.log("Provider state:", provider);

    let errorMessage = "Provider not found or failed to load.";
    if (!category) {
      errorMessage = "Missing category information";
    } else if (!city && (!lat || !lng || !radiusKm)) {
      errorMessage = "Missing location information";
    }

    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-lg text-gray-600 text-center mb-4">
            {errorMessage}
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-primary px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <SafeAreaView className="bg-white">
        <HeaderSection
          title={provider.businessName}
          onBack={() => router.back()}
        />
      </SafeAreaView>

      <ScrollView className="flex-1 mb-20 bg-gray-50">
        {/* Cover Image */}
        {provider.coverImageUrl && (
          <View className="ml-6 mb-6">
            <Image
              source={{
                uri: provider.coverImageUrl.startsWith("http")
                  ? provider.coverImageUrl
                  : `http://192.168.1.9:8080${provider.coverImageUrl}`,
              }}
              className="w-96 h-64 rounded-lg shadow-sm"
              resizeMode="cover"
            />
          </View>
        )}

        {/* Business Information */}
        <View className="px-4 mb-6">
          <Text className="text-3xl font-bold text-primary mb-2">
            {provider.businessName || "Unknown Business"}
          </Text>

          {/* Location */}
          {provider.location && (
            <View className="flex-row items-center mb-4">
              <Ionicons name="location" size={20} color="#008080" />
              <Text className="ml-2 text-gray-600 text-lg">
                {provider.location.city
                  ? provider.location.city
                  : "Unknown City"}
                {provider.location.district
                  ? `, ${provider.location.district}`
                  : ""}
              </Text>
            </View>
          )}

          {/* Category */}
          {provider.category && (
            <View className="flex-row items-center mb-4">
              <Ionicons name="business" size={20} color="#008080" />
              <Text className="ml-2 text-gray-600 text-lg">
                {formatCategoryName(provider.category)}
              </Text>
            </View>
          )}
        </View>

        {/* Business Description */}
        {provider.businessDescription && (
          <View className="px-4 mb-6">
            <Text className="text-2xl font-semibold text-gray-700 mb-3">
              About
            </Text>
            <Text
              className="text-lg leading-6 text-gray-600"
              numberOfLines={showFullDescription ? undefined : 3}
            >
              {provider.businessDescription}
            </Text>

            <TouchableOpacity
              onPress={() => setShowFullDescription(!showFullDescription)}
            >
              <Text className="text-primary mt-2 font-medium">
                {showFullDescription ? "Show less" : "Show more"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Location Map */}
        {provider.location &&
          provider.location.latitude &&
          provider.location.longitude && (
            <View className="px-4 mb-6">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-2xl font-semibold text-gray-700">
                  Location
                </Text>
                {/* <TouchableOpacity
                  onPress={() => setShowMap(!showMap)}
                  className="flex-row items-center bg-primary px-3 py-1 rounded-lg"
                >
                  <Ionicons
                    name={showMap ? "map" : "location-outline"}
                    size={16}
                    color="white"
                  />
                  <Text className="text-white ml-1 font-medium">
                    {showMap ? "Hide Map" : "Show Map"}
                  </Text>
                </TouchableOpacity> */}
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
                      {provider.location.formattedAddress}
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
                      latitude: provider.location.latitude,
                      longitude: provider.location.longitude,
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
                        latitude: provider.location.latitude,
                        longitude: provider.location.longitude,
                      }}
                      title={provider.businessName}
                      description={provider.location.formattedAddress}
                    />
                  </MapView>
                </View>
              )}
            </View>
          )}

        {/* Services Section */}
        {provider.services && provider.services.length > 0 && (
          <View className="px-4 mb-6">
            <Text className="text-2xl font-semibold text-gray-700 mb-4">
              Available Services
            </Text>
            <ServiceGrid
              services={provider.services}
              onItemPress={(serviceId) => {
                const service = provider.services.find(
                  (s) => s.serviceId.toString() === serviceId
                );
                if (service) handleServicePress(service);
              }}
            />
          </View>
        )}

        {/* Leave a Review Section */}
        <View className="px-4 mb-20">
          <Text className="text-2xl font-semibold text-gray-700 mb-4">
            Leave a Review
          </Text>

          <View className="bg-white rounded-xl shadow-sm p-4">
            {/* Rating Stars */}
            <Text className="text-gray-600 font-medium text-lg mb-2">
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
            <Text className="text-gray-600 font-medium mb-1 text-lg">
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
              className="bg-primary py-3 rounded-lg items-center mb-4"
            >
              <Text className="text-white text-lg font-medium">
                Submit Review
              </Text>
            </TouchableOpacity>

            {/* Report Issue Button */}
            <TouchableOpacity
              onPress={() => router.push("../../support/complaints")}
              className="border-2 border-primary bg-white py-3 items-center rounded-lg"
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

export default ProviderDetailView;
