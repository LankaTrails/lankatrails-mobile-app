import AddToTripButton from "@/components/AddToTripButtonNew";
import {
  getPlaceDetails,
  getPlacePhotoUrl,
} from "@/services/googlePlacesService";
import UnifiedSearchService from "@/services/unifiedSearchService";
import { ServiceCategory } from "@/types/commonTypes";
import { Service, ServiceSearchResponse } from "@/types/serviceTypes";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Star, MapPin, Phone, Globe, Clock, Users } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { ArrowLeftIcon } from "react-native-heroicons/outline";

const { width } = Dimensions.get("window");

interface PlaceDetailsData {
  place_id: string;
  name: string;
  formatted_address: string;
  rating?: number;
  user_ratings_total?: number;
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
    periods: any[];
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
    author_url: string;
    profile_photo_url: string;
    rating: number;
    relative_time_description: string;
    text: string;
    time: number;
  }[];
  url: string;
  vicinity?: string;
}

const PlaceDetailScreen = () => {
  const { placeId } = useLocalSearchParams<{ placeId: string }>();
  const [placeDetails, setPlaceDetails] = useState<PlaceDetailsData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFavourite, setIsFavourite] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [nearbyServices, setNearbyServices] = useState<ServiceSearchResponse[]>(
    []
  );
  const [servicesLoading, setServicesLoading] = useState(false);

  // Convert place to Service for AddToTripButton
  const convertToService = useCallback(
    (place: PlaceDetailsData): Service => ({
      serviceId:
        parseInt(place.place_id.replace(/\D/g, ""), 10) ||
        Math.floor(Math.random() * 10000),
      serviceName: place.name,
      category: "ACTIVITY" as const,
      locations: [
        {
          locationId: null,
          formattedAddress: place.formatted_address,
          city: place.vicinity || "",
          district: "",
          province: "",
          country: "Sri Lanka",
          postalCode: "",
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
        },
      ],
      prices: [],
      mainImageUrl:
        place.photos && place.photos.length > 0
          ? getPlacePhotoUrl(place.photos[0].photo_reference, 800)
          : "",
      provider: null,
    }),
    []
  );

  const fetchPlaceDetails = useCallback(
    async (isRefresh = false) => {
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

        console.log(`🔍 Fetching details for place: ${placeId}`);
        const details = await getPlaceDetails(placeId);

        if (details) {
          setPlaceDetails(details);
          console.log(`✅ Place details loaded: ${details.name}`);
        } else {
          setError("Place not found");
        }
      } catch (err) {
        console.error("Error fetching place details:", err);
        setError("Failed to load place details. Please try again.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [placeId]
  );

  const fetchNearbyServices = useCallback(async () => {
    if (!placeDetails) return;

    try {
      setServicesLoading(true);
      console.log(`🔍 Fetching services near ${placeDetails.name}`);

      const result = await UnifiedSearchService.searchNearPlace(
        placeDetails.place_id,
        5000 // 5km radius
      );

      if (result.services.length > 0) {
        setNearbyServices(result.services);
        console.log(`✅ Found ${result.services.length} nearby services`);
      } else {
        console.log("No nearby services found");
      }
    } catch (error) {
      console.error("Error fetching nearby services:", error);
    } finally {
      setServicesLoading(false);
    }
  }, [placeDetails]);

  useEffect(() => {
    if (placeId) {
      fetchPlaceDetails();
    } else {
      setError("No place ID provided");
      setLoading(false);
    }
  }, [placeId, fetchPlaceDetails]);

  useEffect(() => {
    if (placeDetails) {
      fetchNearbyServices();
    }
  }, [placeDetails, fetchNearbyServices]);

  const handleFavourite = useCallback(() => {
    setIsFavourite((prev) => {
      const newState = !prev;
      const message = newState
        ? "Added to favourites"
        : "Removed from favourites";

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
      const phoneNumber = `tel:${placeDetails.formatted_phone_number}`;
      Linking.openURL(phoneNumber).catch(() => {
        Alert.alert("Error", "Could not make phone call");
      });
    }
  }, [placeDetails?.formatted_phone_number]);

  const openInMaps = useCallback(() => {
    if (placeDetails) {
      const { lat, lng } = placeDetails.geometry.location;
      const url = Platform.select({
        ios: `maps:?q=${lat},${lng}`,
        android: `geo:${lat},${lng}?q=${lat},${lng}(${placeDetails.name})`,
      });

      if (url) {
        Linking.openURL(url).catch(() => {
          Alert.alert("Error", "Could not open maps");
        });
      }
    }
  }, [placeDetails]);

  const renderLoadingState = () => (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color="#008080" />
      <Text className="text-gray-500 mt-4">Loading place details...</Text>
    </View>
  );

  const renderErrorState = () => (
    <View className="flex-1 items-center justify-center px-4">
      <Text className="text-red-500 text-lg font-semibold mb-2">Error</Text>
      <Text className="text-gray-600 text-center mb-4">{error}</Text>
      <TouchableOpacity
        onPress={() => fetchPlaceDetails()}
        className="bg-primary px-6 py-3 rounded-lg"
      >
        <Text className="text-white font-semibold">Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPhotoGallery = () => {
    if (!placeDetails?.photos || placeDetails.photos.length === 0) {
      return (
        <View className="h-64 bg-gray-200 items-center justify-center">
          <Ionicons name="image-outline" size={64} color="#9CA3AF" />
          <Text className="text-gray-500 mt-2">No photos available</Text>
        </View>
      );
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="h-64"
      >
        {placeDetails.photos.map((photo, index) => (
          <View key={index} className="mr-2">
            <Image
              source={{ uri: getPlacePhotoUrl(photo.photo_reference, 600) }}
              className="h-64 rounded-lg"
              style={{ width: width - 32 }}
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
            />
            {imageLoading && (
              <View className="absolute inset-0 items-center justify-center bg-gray-200 rounded-lg">
                <ActivityIndicator size="large" color="#008080" />
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderRating = () => {
    if (!placeDetails?.rating) return null;

    return (
      <View className="flex-row items-center">
        <Star size={20} color="#FFD700" fill="#FFD700" />
        <Text className="text-lg font-semibold ml-2">
          {placeDetails.rating.toFixed(1)}
        </Text>
        {placeDetails.user_ratings_total && (
          <Text className="text-gray-500 ml-2">
            ({placeDetails.user_ratings_total} reviews)
          </Text>
        )}
      </View>
    );
  };

  const renderOpeningHours = () => {
    if (!placeDetails?.opening_hours) return null;

    return (
      <View className="mt-4">
        <View className="flex-row items-center mb-2">
          <Clock size={20} color="#008080" />
          <Text className="text-lg font-semibold ml-2">Opening Hours</Text>
          <View
            className={`ml-auto px-2 py-1 rounded-full ${
              placeDetails.opening_hours.open_now
                ? "bg-green-100"
                : "bg-red-100"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                placeDetails.opening_hours.open_now
                  ? "text-green-800"
                  : "text-red-800"
              }`}
            >
              {placeDetails.opening_hours.open_now ? "Open Now" : "Closed"}
            </Text>
          </View>
        </View>
        {placeDetails.opening_hours.weekday_text && (
          <View className="ml-7">
            {placeDetails.opening_hours.weekday_text.map((day, index) => (
              <Text key={index} className="text-gray-600 text-sm py-1">
                {day}
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderContactInfo = () => (
    <View className="mt-4 space-y-3">
      {placeDetails?.formatted_phone_number && (
        <TouchableOpacity
          onPress={callPlace}
          className="flex-row items-center p-3 bg-blue-50 rounded-lg"
        >
          <Phone size={20} color="#008080" />
          <Text className="text-blue-700 ml-3 font-medium">
            {placeDetails.formatted_phone_number}
          </Text>
        </TouchableOpacity>
      )}

      {placeDetails?.website && (
        <TouchableOpacity
          onPress={openWebsite}
          className="flex-row items-center p-3 bg-blue-50 rounded-lg"
        >
          <Globe size={20} color="#008080" />
          <Text className="text-blue-700 ml-3 font-medium">Visit Website</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={openInMaps}
        className="flex-row items-center p-3 bg-blue-50 rounded-lg"
      >
        <MapPin size={20} color="#008080" />
        <Text className="text-blue-700 ml-3 font-medium">Open in Maps</Text>
      </TouchableOpacity>
    </View>
  );

  const renderNearbyServices = () => {
    if (servicesLoading) {
      return (
        <View className="mt-6 p-4 bg-gray-50 rounded-lg">
          <Text className="text-lg font-semibold mb-3">Nearby Services</Text>
          <ActivityIndicator size="large" color="#008080" />
          <Text className="text-gray-500 text-center mt-2">
            Finding nearby services...
          </Text>
        </View>
      );
    }

    if (nearbyServices.length === 0) {
      return (
        <View className="mt-6 p-4 bg-gray-50 rounded-lg">
          <Text className="text-lg font-semibold mb-3">Nearby Services</Text>
          <Text className="text-gray-500 text-center">
            No services found nearby
          </Text>
        </View>
      );
    }

    return (
      <View className="mt-6">
        <Text className="text-lg font-semibold mb-3">Nearby Services</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {nearbyServices.slice(0, 5).map((service, index) => (
            <TouchableOpacity
              key={service.serviceId}
              className="mr-4 bg-white rounded-lg shadow-sm border border-gray-200 w-60"
              onPress={() => {
                // Navigate to service detail
                router.push({
                  pathname:
                    `/(tabs)/explore/services/${service.category.toLowerCase()}/[id]` as any,
                  params: { id: service.serviceId.toString() },
                });
              }}
            >
              {service.mainImageUrl && (
                <Image
                  source={{ uri: service.mainImageUrl }}
                  className="w-full h-32 rounded-t-lg"
                />
              )}
              <View className="p-3">
                <Text className="font-semibold text-gray-800" numberOfLines={2}>
                  {service.serviceName}
                </Text>
                <Text className="text-gray-500 text-sm mt-1">
                  {service.category.replace("_", " ")}
                </Text>
                {service.averageRating > 0 && (
                  <View className="flex-row items-center mt-2">
                    <Star size={14} color="#FFD700" fill="#FFD700" />
                    <Text className="text-sm ml-1">
                      {service.averageRating.toFixed(1)}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {nearbyServices.length > 5 && (
          <TouchableOpacity
            className="mt-3 bg-primary px-4 py-2 rounded-lg self-center"
            onPress={() => {
              // Navigate to services with location filter
              router.push({
                pathname: "/(tabs)/explore/search/results" as any,
                params: {
                  location: placeDetails?.name,
                  lat: placeDetails?.geometry.location.lat.toString(),
                  lng: placeDetails?.geometry.location.lng.toString(),
                  selectedTab: "All",
                },
              });
            }}
          >
            <Text className="text-white font-semibold">View All Services</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white">
        <View className="bg-gray-50 pt-12 pb-4">
          <View className="flex-row items-center justify-between mt-5 mb-2 px-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-row items-center"
            >
              <ArrowLeftIcon size={34} color="#008080" />
            </TouchableOpacity>
            <Text className="text-primary text-3xl font-bold mx-2 flex-1 text-center">
              Place Details
            </Text>
          </View>
        </View>
        {renderLoadingState()}
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-white">
        <View className="bg-gray-50 pt-12 pb-4">
          <View className="flex-row items-center justify-between mt-5 mb-2 px-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-row items-center"
            >
              <ArrowLeftIcon size={34} color="#008080" />
            </TouchableOpacity>
            <Text className="text-primary text-3xl font-bold mx-2 flex-1 text-center">
              Place Details
            </Text>
          </View>
        </View>
        {renderErrorState()}
      </View>
    );
  }

  if (!placeDetails) {
    return renderErrorState();
  }

  return (
    <View className="flex-1 bg-white">
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
            {placeDetails.name}
          </Text>

          <View className="flex-row space-x-2">
            <TouchableOpacity
              onPress={handleShare}
              className="p-2 bg-white rounded-full shadow-sm"
            >
              <Ionicons name="share-outline" size={24} color="#008080" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleFavourite}
              className="p-2 bg-white rounded-full shadow-sm"
            >
              <Ionicons
                name={isFavourite ? "heart" : "heart-outline"}
                size={24}
                color={isFavourite ? "#EF4444" : "#008080"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchPlaceDetails(true)}
          />
        }
      >
        {/* Photo Gallery */}
        <View className="px-4 py-4">{renderPhotoGallery()}</View>

        {/* Place Information */}
        <View className="px-4 pb-4">
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            {placeDetails.name}
          </Text>

          <View className="flex-row items-start mb-3">
            <MapPin size={16} color="#6B7280" className="mt-1" />
            <Text className="text-gray-600 ml-2 flex-1">
              {placeDetails.formatted_address}
            </Text>
          </View>

          {renderRating()}

          {/* Types/Categories */}
          {placeDetails.types && placeDetails.types.length > 0 && (
            <View className="flex-row flex-wrap mt-3">
              {placeDetails.types.slice(0, 4).map((type, index) => (
                <View
                  key={index}
                  className="bg-gray-100 px-3 py-1 rounded-full mr-2 mb-2"
                >
                  <Text className="text-gray-700 text-sm capitalize">
                    {type.replace(/_/g, " ")}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {renderOpeningHours()}
          {renderContactInfo()}

          {/* Map */}
          <View className="mt-6">
            <TouchableOpacity
              onPress={() => setShowMap(!showMap)}
              className="flex-row items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <Text className="text-lg font-semibold">Location</Text>
              <Ionicons
                name={showMap ? "chevron-up" : "chevron-down"}
                size={24}
                color="#008080"
              />
            </TouchableOpacity>

            {showMap && (
              <View className="mt-3 h-48 rounded-lg overflow-hidden">
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
          </View>

          {renderNearbyServices()}

          {/* Add to Trip Button */}
          <View className="mt-6 mb-4">
            <AddToTripButton service={convertToService(placeDetails)} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default PlaceDetailScreen;
