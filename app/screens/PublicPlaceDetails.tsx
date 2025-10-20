import AddToTripButton from "@/components/AddToTripButtonNew";
import HeaderSection from "@/components/explorer-components/HeaderSection";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Star } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";

// Types for Google Places API
interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  rating?: number;
  user_ratings_total?: number;
  formatted_phone_number?: string;
  website?: string;
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
  photos?: {
    photo_reference: string;
    height: number;
    width: number;
  }[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
  price_level?: number;
  reviews?: {
    author_name: string;
    rating: number;
    text: string;
    time: number;
  }[];
}

// Service type for AddToTripButton compatibility
import { Service } from "@/types/serviceTypes";

const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || "AIzaSyAFJ8_eIjeXNhtS5TeuDWwswREqxO4FsGU";

const PublicPlaceDetails = () => {
  const { placeId } = useLocalSearchParams<{ placeId: string }>();
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFavourite, setIsFavourite] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Convert place to Service for AddToTripButton
  const convertToService = useCallback((place: PlaceDetails): Service => ({
    serviceId: parseInt(place.place_id.replace(/\D/g, ''), 10) || Math.floor(Math.random() * 10000),
    serviceName: place.name,
    category: "ACTIVITY" as const,
    locations: [
      {
        locationId: null,
        formattedAddress: place.formatted_address,
        city: "",
        district: "",
        province: "",
        country: "",
        postalCode: "",
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
      },
    ],
    prices: [],
    mainImageUrl:
      place.photos && place.photos.length > 0
        ? getPhotoUrl(place.photos[0].photo_reference, 800)
        : "",
    provider: null,
  }), []);

  const fetchPlaceDetails = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      if (!placeId) {
        throw new Error("No place ID provided");
      }

      const response = await axios.get(
        "https://maps.googleapis.com/maps/api/place/details/json",
        {
          params: {
            place_id: placeId,
            fields:
              "name,formatted_address,rating,user_ratings_total,formatted_phone_number,website,opening_hours,photos,geometry,types,price_level,reviews",
            key: GOOGLE_PLACES_API_KEY,
          },
          timeout: 10000, // 10 second timeout
        }
      );

      if (response.data.status === "OK") {
        setPlaceDetails(response.data.result);
      } else if (response.data.status === "NOT_FOUND") {
        setError("Place not found");
      } else if (response.data.status === "REQUEST_DENIED") {
        setError("Invalid API key or request denied");
      } else {
        setError(`Failed to fetch place details: ${response.data.status}`);
      }
    } catch (err) {
      console.error("Error fetching place details:", err);
      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNABORTED') {
          setError("Request timeout. Please check your connection.");
        } else if (err.response?.status === 403) {
          setError("API quota exceeded or invalid key");
        } else {
          setError("Network error. Please check your connection.");
        }
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [placeId]);

  useEffect(() => {
    if (placeId) {
      fetchPlaceDetails();
    } else {
      setError("No place ID provided");
      setLoading(false);
    }
  }, [placeId, fetchPlaceDetails]);

  const getPhotoUrl = useCallback((photoReference: string, maxWidth: number = 400) => {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;
  }, []);

  const handleFavourite = useCallback(() => {
    setIsFavourite((prev) => {
      const newState = !prev;
      const message = newState ? "Added to favourites" : "Removed from favourites";
      
      if (Platform.OS === "android") {
        ToastAndroid.show(message, ToastAndroid.SHORT);
      } else {
        Alert.alert("Favourites", message);
      }
      return newState;
    });
  }, []);

  const handleShare = useCallback(() => {
    if (!placeDetails) return;
    
    const message = `Check out ${placeDetails.name} at ${placeDetails.formatted_address}`;
    if (Platform.OS === "android") {
      ToastAndroid.show(`Sharing ${placeDetails.name}`, ToastAndroid.SHORT);
    } else {
      Alert.alert("Share", message);
    }
  }, [placeDetails]);

  const openWebsite = useCallback(() => {
    if (placeDetails?.website) {
      Linking.openURL(placeDetails.website).catch(() => {
        Alert.alert("Error", "Could not open website");
      });
    }
  }, [placeDetails?.website]);

  const callPlace = useCallback(() => {
    if (placeDetails?.formatted_phone_number) {
      const phoneNumber = placeDetails.formatted_phone_number.replace(/\s/g, "");
      Linking.openURL(`tel:${phoneNumber}`).catch(() => {
        Alert.alert("Error", "Could not make phone call");
      });
    }
  }, [placeDetails?.formatted_phone_number]);

  const openInMaps = useCallback(() => {
    if (placeDetails) {
      const { lat, lng } = placeDetails.geometry.location;
      const url = Platform.OS === 'ios' 
        ? `maps://?q=${lat},${lng}` 
        : `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(placeDetails.name)})`;
      
      Linking.openURL(url).catch(() => {
        // Fallback to Google Maps web
        const webUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        Linking.openURL(webUrl);
      });
    }
  }, [placeDetails]);

  const onRefresh = useCallback(() => {
    fetchPlaceDetails(true);
  }, [fetchPlaceDetails]);

  const renderStars = useCallback((rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <View className="flex-row">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} size={16} fill="#FCD34D" color="#FCD34D" />
        ))}
        {hasHalfStar && <Star size={16} fill="#FCD34D" color="#FCD34D" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} size={16} fill="none" color="#D1D5DB" />
        ))}
      </View>
    );
  }, []);

  const getPriceLevel = useCallback((level?: number) => {
    if (!level) return "";
    return "$".repeat(level);
  }, []);

  // Loading state
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <HeaderSection
          title="Loading..."
          onBack={() => router.back()}
          showFavorite={false}
          isFavorite={false}
        />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#008080" />
          <Text className="mt-4 text-gray-600">Loading place details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !placeDetails) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <HeaderSection
          title="Error"
          onBack={() => router.back()}
          showFavorite={false}
          isFavorite={false}
        />
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="alert-circle" size={64} color="#ef4444" />
          <Text className="mt-4 text-xl font-semibold text-gray-800">
            Oops!
          </Text>
          <Text className="mt-2 text-gray-600 text-center">
            {error || "Place not found"}
          </Text>
          <TouchableOpacity
            className="mt-6 bg-primary px-6 py-3 rounded-lg"
            onPress={() => fetchPlaceDetails()}
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="mt-3 px-6 py-3"
            onPress={() => router.back()}
          >
            <Text className="text-gray-600 font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Main content
  return (
    <SafeAreaView className="flex-1 bg-white">
      <HeaderSection
        title={placeDetails.name}
        onBack={() => router.back()}
        showFavorite={true}
        isFavorite={isFavourite}
        onFavoritePress={handleFavourite}
        onShare={handleShare}
      />

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Main Photo */}
        {placeDetails.photos && placeDetails.photos.length > 0 && (
          <View className="relative">
            <Image
              source={{
                uri: getPhotoUrl(placeDetails.photos[0].photo_reference, 800),
              }}
              className="w-full h-64"
              resizeMode="cover"
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
            />
            {imageLoading && (
              <View className="absolute inset-0 justify-center items-center bg-gray-200">
                <ActivityIndicator size="large" color="#008080" />
              </View>
            )}
          </View>
        )}

        <View className="p-4">
          {/* Place Header */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-gray-300 mb-2">
              {placeDetails.name}
            </Text>
            <Text className="text-gray-600 mb-4">
              {placeDetails.formatted_address}
            </Text>

            {/* Rating and Price */}
            <View className="flex-row items-center justify-between">
              {placeDetails.rating && (
                <View className="flex-row items-center">
                  {renderStars(placeDetails.rating)}
                  <Text className="ml-2 text-gray-600">
                    {placeDetails.rating} (
                    {placeDetails.user_ratings_total || 0} reviews)
                  </Text>
                </View>
              )}
              {placeDetails.price_level && (
                <Text className="text-lg font-bold text-green-600">
                  {getPriceLevel(placeDetails.price_level)}
                </Text>
              )}
            </View>
          </View>

          {/* Quick Actions */}
          <View className="flex-row justify-around mb-6 bg-gray-50 p-4 rounded-xl">
            {placeDetails.formatted_phone_number && (
              <TouchableOpacity
                className="items-center p-2"
                onPress={callPlace}
              >
                <Ionicons name="call" size={24} color="#008080" />
                <Text className="text-xs text-gray-600 mt-1">Call</Text>
              </TouchableOpacity>
            )}
            {placeDetails.website && (
              <TouchableOpacity
                className="items-center p-2"
                onPress={openWebsite}
              >
                <Ionicons name="globe" size={24} color="#008080" />
                <Text className="text-xs text-gray-600 mt-1">Website</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity className="items-center p-2" onPress={openInMaps}>
              <Ionicons name="navigate" size={24} color="#008080" />
              <Text className="text-xs text-gray-600 mt-1">Directions</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="items-center p-2"
              onPress={() => setShowMap(!showMap)}
            >
              <Ionicons name="map" size={24} color="#008080" />
              <Text className="text-xs text-gray-600 mt-1">Map</Text>
            </TouchableOpacity>
          </View>

          {/* Map Section */}
          {showMap && (
            <View
              className="mb-6 rounded-xl overflow-hidden"
              style={{ height: 200 }}
            >
              <MapView
                style={{ flex: 1 }}
                initialRegion={{
                  latitude: placeDetails.geometry.location.lat,
                  longitude: placeDetails.geometry.location.lng,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: placeDetails.geometry.location.lat,
                    longitude: placeDetails.geometry.location.lng,
                  }}
                  title={placeDetails.name}
                  description={placeDetails.formatted_address}
                />
              </MapView>
            </View>
          )}

          {/* Opening Hours */}
          {placeDetails.opening_hours && (
            <View className="mb-6 bg-white p-4 rounded-xl shadow-sm">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                Opening Hours
              </Text>
              <View className="mb-3">
                <Text
                  className={`text-sm font-medium ${
                    placeDetails.opening_hours.open_now
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {placeDetails.opening_hours.open_now ? "Open Now" : "Closed"}
                </Text>
              </View>
              {placeDetails.opening_hours.weekday_text?.map((day, index) => (
                <Text key={index} className="text-sm text-gray-600 mb-1">
                  {day}
                </Text>
              ))}
            </View>
          )}

          {/* Place Types */}
          <View className="mb-6 bg-white p-4 rounded-xl shadow-sm">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Categories
            </Text>
            <View className="flex-row flex-wrap">
              {placeDetails.types?.slice(0, 5).map((type, index) => (
                <View
                  key={index}
                  className="bg-gray-100 px-3 py-1 rounded-full mr-2 mb-2"
                >
                  <Text className="text-xs text-gray-600">
                    {type
                      .replace(/_/g, " ")
                      .toLowerCase()
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Recent Reviews */}
          {placeDetails.reviews && placeDetails.reviews.length > 0 && (
            <View className="mb-6 bg-white p-4 rounded-xl shadow-sm">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                Recent Reviews
              </Text>
              {placeDetails.reviews.slice(0, 3).map((review, index) => (
                <View
                  key={index}
                  className="mb-4 pb-4 border-b border-gray-100"
                >
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-sm font-medium text-gray-900">
                      {review.author_name}
                    </Text>
                    {renderStars(review.rating)}
                  </View>
                  <Text className="text-sm text-gray-600" numberOfLines={3}>
                    {review.text}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Contact Information */}
          <View className="mb-6 bg-white p-4 rounded-xl shadow-sm">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Contact Information
            </Text>
            {placeDetails.formatted_phone_number && (
              <View className="flex-row items-center mb-2">
                <Ionicons name="call" size={16} color="#6B7280" />
                <Text className="ml-3 text-sm text-gray-600">
                  {placeDetails.formatted_phone_number}
                </Text>
              </View>
            )}
            {placeDetails.website && (
              <View className="flex-row items-center mb-2">
                <Ionicons name="globe" size={16} color="#6B7280" />
                <Text className="ml-3 text-sm text-gray-600" numberOfLines={1}>
                  {placeDetails.website}
                </Text>
              </View>
            )}
            <View className="flex-row items-center">
              <Ionicons name="location" size={16} color="#6B7280" />
              <Text className="ml-3 text-sm text-gray-600">
                {placeDetails.geometry.location.lat.toFixed(6)},{" "}
                {placeDetails.geometry.location.lng.toFixed(6)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Add to Trip Button */}
      <View className="p-4 bg-white border-t border-gray-100 ">
        <AddToTripButton service={convertToService(placeDetails)} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
});

export default PublicPlaceDetails;
