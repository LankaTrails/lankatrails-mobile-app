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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SearchBar from "@/components/SearchBar";
import {
  StaggeredListItem,
  LoadingSkeleton,
} from "@/components/transitions/animations";
import Card from "@/components/Card";
import ImageSlider from "@/components/transitions/ImageSlider";
import { router } from "expo-router";
import { fetchPopularPlacesSriLanka } from "@/utils/fetchPopularPlacesSriLanka"; // ← Import logic

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
      <View className={`px-4 pt-4 pb-2 ${showNotifications ? 'bg-white/80' : 'bg-white'}`}>
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-primary mt-6 text-4xl font-bold">Hello, Sarah</Text>
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
        className={`flex-1 ${showNotifications ? 'opacity-60' : ' '}` }
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

        {/* Popular Services (static) */}
{/* Popular Services */}
        <View className="px-4 mb-6">
          <Text className="text-black text-3xl font-bold mb-4">
            Popular Services
          </Text>
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
                  width={width * 0.5 - 16} // Adjust width for two columns
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
            {loadingPopular ? (
              <LoadingSkeleton count={4} />
            ) : (
              popularPlaces.map((place, index) => (
                <StaggeredListItem key={place.place_id} delay={index * 100}>
                  <Card
                    item={{
                      id: place.place_id,
                      title: place.name,
                      subtitle: place.vicinity ?? "Sri Lanka",
                      rating: place.rating ?? 0,
                      image: place.image ?? "https://via.placeholder.com/200x150",
                    }}
                    width={width * 0.5 - 16}
                    onPress={(selectedPlace) => {
                      console.log("Pressed:", selectedPlace.title);
                    }}
                  />
                </StaggeredListItem>
              ))
            )}
          </View>
        </View>

        {/* Rest of your content (popular pics, tips, etc.) */}
        {/* <View className="px-3 mb-3">
  <Text className="text-black text-3xl font-bold mb-4">
    Popular Pics at YALA forest
  </Text> */}

  {/* <View className="flex-row gap-1"> */}
    {/* Large Image on the Left */}
    {/* <Image
      source={require('../../../assets/images/Home/deer.jpg')}
      className="w-56 h-96 rounded-lg"
      resizeMode="cover"
    /> */}

    {/* Two Small Stacked Images on the Right */}
    {/* <View className="mb-2">
      <Image
        source={require('../../../assets/images/Home/leopard.jpg')}
        className="w-56 h-48 rounded-lg mb-1"
        resizeMode="cover"
      />
      <Image
        source={require('../../../assets/images/Home/elephants.jpg')}
        className="w-56 h-48 rounded-lg"
        resizeMode="cover"
      />
    </View>
  </View>
</View> */}

{/* Plan Trip CTA */}
        <View className="mx-4 mb-8 bg-primary/60 rounded-2xl p-6 items-center ">
          <Text className="text-white text-2xl font-bold mb-4">
            Let's start the journey
          </Text>
          <TouchableOpacity
            className="bg-white rounded-full px-6 py-3 mb-2"
            onPress={() => router.push("../trips")} // Navigate to Plan Trip screen
          >
            <Text className="text-primary font-medium">Plan Trip</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-white/20 rounded-full px-6 py-3"
            onPress={() => router.push("../explore")} // Navigate to Explore screen
          >
            <Text className="text-white font-medium">Explore</Text>
          </TouchableOpacity>
        </View>
        <View className="px-4 mb-24">
          <Text className=" text-white">LankaTrails</Text>
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
            <Text className="text-3xl font-bold m-8 items-center text-black">Notifications</Text>
            <StaggeredListItem index={0} delay={400}>
              <View className="m-4">
                <Text className="text-lg text-black">
                  🧳 Your saved trip to Kandy is waiting!
                </Text>
              </View>
              <View className="m-4">
                <Text className="text-lg text-black">
                  🌍 New destination added: Trincomalee
                </Text>
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
