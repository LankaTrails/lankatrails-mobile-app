// TravelApp.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import SearchBar from "@/components/SearchBar";
import {
  StaggeredListItem,
  LoadingSkeleton,
} from "@/components/transitions/animations";
import Card from "@/components/Card";
import ImageSlider from "@/components/transitions/ImageSlider";
import { router } from "expo-router";
import { fetchPopularPlacesSriLanka } from "@/utils/fetchPopularPlacesSriLanka";

const { width } = Dimensions.get("window");

interface Place {
  place_id: string;
  name: string;
  vicinity?: string;
  rating?: number;
  image?: string;
}

const TravelApp = () => {
  const [searchText, setSearchText] = useState("");
  const insets = useSafeAreaInsets();
  const [showNotifications, setShowNotifications] = useState(false);

  // 🎯 Dynamic Popular Places
  const [popularPlaces, setPopularPlaces] = useState<Place[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const places = await fetchPopularPlacesSriLanka();
        setPopularPlaces(places);
      } catch (error) {
        console.error("Failed to fetch popular places:", error);
      } finally {
        setLoadingPopular(false);
      }
    })();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const categories = ["Hotels", "Beaches", "Hiking", "Culture", "Wildlife", "Restaurants"];

  const trendingDestinations = [
    {
      id: 1,
      name: "Sigiriya Rock Fortress",
      location: "Dambulla",
      image:
        "https://images.unsplash.com/photo-1626697550561-8ff63f63683c?q=80&w=1000",
    },
    {
      id: 2,
      name: "Mirissa Beach",
      location: "Mirissa",
      image:
        "https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=1000",
    },
    {
      id: 3,
      name: "Yala National Park",
      location: "Hambantota",
      image:
        "https://images.unsplash.com/photo-1621135809414-8fba7ddfb616?q=80&w=1000",
    },
  ];

  const popularservices = [
    {
      id: 1,
      name: "Nine Arch Bridge",
      location: "Ella",
      image:
        "https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=200&h=150&fit=crop",
      rating: 4.6,
    },
    {
      id: 2,
      name: "Temple of Tooth",
      location: "Kandy",
      image:
        "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=200&h=150&fit=crop",
      rating: 4.8,
    },
    {
      id: 3,
      name: "Galle Fort",
      location: "Galle",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=150&fit=crop",
      rating: 4.7,
    },
    {
      id: 4,
      name: "Adam's Peak",
      location: "Ratnapura",
      image:
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200&h=150&fit=crop",
      rating: 4.5,
    },
  ];

  return (
    <View className="flex-1 bg-white">
      {showNotifications && (
        <View pointerEvents="auto" className="absolute inset-0 bg-black/40 z-40" />
      )}
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <View style={{ height: insets.top, backgroundColor: "#ffffff" }} />

      {/* Header */}
      <View className={`px-4 pt-4 pb-2 ${showNotifications ? "bg-white/80" : "bg-white"}`}>
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-primary mt-6 text-4xl font-bold">
              {getGreeting()}, Sarah 👋
            </Text>
            <Text className="text-gray-500 mt-3 text-lg font-semibold">
              Where do you want to go?
            </Text>
          </View>
          <TouchableOpacity
            className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center"
            onPress={() => setShowNotifications(true)}
          >
            <Ionicons name="notifications-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        <SearchBar onPress={() => {}} />
      </View>

      {/* Main Content */}
      <ScrollView
        className={`flex-1 ${showNotifications ? "opacity-60" : " "}`}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!showNotifications}
      >
        {/* Image Slider */}
        <View className="px-4 mb-6 w-full">
          <ImageSlider
            images={[
              "https://images.unsplash.com/photo-1646894232861-a0ad84f1ad5d?q=80&w=2071",
              "https://images.unsplash.com/photo-1591351373936-3d5bf044b854?q=80&w=1170",
              "https://admin.idaoffice.org/wp-content/uploads/2023/12/pexels-michael-swigunski-3825040.jpg",
            ]}
          />
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mb-6">
          {categories.map((cat, i) => (
            <TouchableOpacity key={i} className="bg-gray-100 px-4 py-2 mr-2 rounded-full">
              <Text className="text-gray-700 font-medium">{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Trending Destinations */}
        <View className="px-4 mb-6">
          <Text className="text-black text-3xl font-bold mb-4">Trending Destinations</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {trendingDestinations.map((place, index) => (
              <TouchableOpacity key={place.id} className="mr-4">
                <ImageBackground
                  source={{ uri: place.image }}
                  className="w-64 h-40 rounded-2xl overflow-hidden justify-end"
                >
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.6)"]}
                    className="w-full h-full justify-end p-4"
                  >
                    <Text className="text-white text-lg font-bold">{place.name}</Text>
                    <Text className="text-gray-200 text-sm">{place.location}</Text>
                  </LinearGradient>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Travel Tip + Weather Widget */}
        <View className="px-4 mb-6 flex-row justify-between">
          <View className="bg-blue-100 rounded-xl p-4 w-[48%]">
            <Text className="text-blue-700 font-bold mb-2">🌤️ Weather</Text>
            <Text className="text-gray-700">Colombo</Text>
            <Text className="text-gray-500">28°C | Sunny</Text>
          </View>
          <View className="bg-green-100 rounded-xl p-4 w-[48%]">
            <Text className="text-green-700 font-bold mb-2">💡 Travel Tip</Text>
            <Text className="text-gray-700">
              Best time to visit Ella is morning 🌄
            </Text>
          </View>
        </View>

        {/* Popular Services */}
        <View className="px-4 mb-6">
          <Text className="text-black text-3xl font-bold mb-4">Popular Services</Text>
          <View className="flex-row flex-wrap justify-between -mx-1">
            {popularservices.map((place, index) => (
              <StaggeredListItem key={place.id} delay={index * 100}>
                <Card
                  item={{
                    id: place.id,
                    title: place.name,
                    subtitle: place.location,
                    rating: place.rating || 0,
                    image: place.image,
                  }}
                  width={width * 0.5 - 16}
                  onPress={(selectedPlace) => {
                    console.log("Pressed:", selectedPlace.title);
                  }}
                />
              </StaggeredListItem>
            ))}
          </View>
        </View>

        {/* 🚀 Popular Places (Dynamic) */}
        <View className="px-4 mb-6">
          <Text className="text-black text-3xl font-bold mb-4">Popular Places</Text>
          <View className="flex-row flex-wrap justify-between -mx-1">
            {loadingPopular
              ? Array.from({ length: 4 }).map((_, index) => (
                  <LoadingSkeleton key={index} />
                ))
              : popularPlaces.map((place, index) => (
                  <StaggeredListItem key={place.place_id} delay={index * 100}>
                    <Card
                      item={{
                        id: parseInt(place.place_id, 10) || 0,
                        title: place.name,
                        subtitle: place.vicinity ?? "Sri Lanka",
                        rating: place.rating ?? 0,
                        image: place.image ?? "https://via.placeholder.com/200x150",
                      }}
                      width={width * 0.5 - 16}
                      onPress={(selectedPlace) => {
                        console.log("Navigating to place:", selectedPlace.title);
                        router.push({
                          pathname: "../../screens/PublicPlaceDetails",
                          params: { placeId: place.place_id },
                        });
                      }}
                    />
                  </StaggeredListItem>
                ))}
          </View>
        </View>

        {/* Plan Trip CTA */}
        <View className="mx-4 mb-8 rounded-2xl overflow-hidden">
          <LinearGradient colors={["#1D976C", "#93F9B9"]} className="p-6 items-center">
            <Text className="text-white text-2xl font-bold mb-4">
              Let&apos;s start the journey
            </Text>
            <TouchableOpacity
              className="bg-white rounded-full px-6 py-3 mb-2"
              onPress={() => router.push("../trips")}
            >
              <Text className="text-primary font-medium">Plan Trip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-white/20 rounded-full px-6 py-3"
              onPress={() => router.push("../explore")}
            >
              <Text className="text-white font-medium">Explore</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View className="px-4 mb-24">
          <Text className="text-center text-gray-400">LankaTrails © 2025</Text>
        </View>
      </ScrollView>

      {/* Notifications Modal */}
      {showNotifications && (
        <View className="absolute inset-0 justify-center items-center z-50">
          <TouchableOpacity
            className="absolute inset-0"
            onPress={() => setShowNotifications(false)}
            activeOpacity={1}
          />
          <View className="bg-white w-[90%] rounded-2xl p-4 shadow-lg">
            <Text className="text-3xl font-bold mb-6 text-black">Notifications</Text>
            <StaggeredListItem index={0} delay={400}>
              <View className="m-4">
                <Text className="text-lg text-black">🧳 Your saved trip to Kandy is waiting!</Text>
              </View>
              <View className="m-4">
                <Text className="text-lg text-black">🌍 New destination added: Trincomalee</Text>
              </View>
              <View className="m-4">
                <Text className="text-lg text-black">💸 Special offer: 20% off in Galle hotels</Text>
              </View>
            </StaggeredListItem>
            <TouchableOpacity
              className="mt-4 self-end bg-primary px-4 py-2 rounded-full"
              onPress={() => setShowNotifications(false)}
            >
              <Text className="text-white font-medium">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default TravelApp;
