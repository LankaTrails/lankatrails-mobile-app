import React, { useState } from "react";
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
  PageTransition,
  StaggeredListItem,
  LoadingSkeleton,
} from "@/components/transitions/animations";
import Card from "@/components/Card";
import ImageSlider from "@/components/transitions/ImageSlider";
import { Path } from "react-native-svg";
import { Route } from "expo-router/build/Route";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

const TravelApp = () => {
  const [searchText, setSearchText] = useState("");
  const insets = useSafeAreaInsets();
  const [showNotifications, setShowNotifications] = useState(false);

  const destinations = [
    {
      id: 1,
      name: "Sigiriya",
      description: "Ancient rock fortress with stunning views",
      image:
        "https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=400&h=300&fit=crop",
      rating: 4.8,
    },
    {
      id: 2,
      name: "Kandy",
      description: "Cultural capital with beautiful temples",
      image:
        "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=300&fit=crop",
      rating: 4.7,
    },
  ];

  const popularPlaces = [
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
      {/* Overlay for darkening home and navbar when notifications are open */}
      {showNotifications && (
        <View pointerEvents="auto" className="absolute inset-0 bg-black/40 z-40" />
      )}
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />
      <View style={{ height: insets.top, backgroundColor: "#ffffff" }} />

      {/* Header */}
      <View className={`px-4 pt-4 pb-2 ${showNotifications ? 'bg-white/80' : 'bg-white'}`}> 
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-primary mt-6 text-4xl font-bold">
              Hello, Sarah
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
        <SearchBar />
      </View>

      {/* Scrollable Content */}
      <ScrollView className={`flex-1 ${showNotifications ? 'opacity-60' : ''}`} showsVerticalScrollIndicator={false} scrollEnabled={!showNotifications}>
        {/* Image Slider */}
        <View className="px-4 mb-6">
          <ImageSlider
            images={[
              "https://images.unsplash.com/photo-1646894232861-a0ad84f1ad5d?q=80&w=2071&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1591351373936-3d5bf044b854?q=80&w=1170&auto=format&fit=crop",
              "https://admin.idaoffice.org/wp-content/uploads/2023/12/pexels-michael-swigunski-3825040-6045035-1140x550.jpg",
            ]}
          />
        </View>

        {/* Popular Places */}
        <View className="px-4 mb-6">
          <Text className="text-black text-2xl font-bold mb-4">
            Popular Places
          </Text>
          <View className="flex-row flex-wrap justify-between -mx-1">
            {popularPlaces.map((place, index) => (
              <StaggeredListItem key={place.id} delay={index * 100}>
                <Card
                  item={{
                    id: place.id,
                    title: place.name,
                    subtitle: place.location,
                    rating: place.rating || 0,
                    image: place.image,
                  }}
                  width={width * 0.44}
                  onPress={(selectedPlace) => {
                    console.log("Pressed:", selectedPlace.title);
                  }}
                />
              </StaggeredListItem>
            ))}
          </View>
        </View>

        {/* Signup Area */}
        <View className="mx-4 mb-6 bg-teal-100 rounded-2xl p-5">
          <Text className="text-black text-2xl font-bold mb-2">
            Join LankaTrails
          </Text>
          <Text className="text-gray-700/80 text-lg mb-4">
            Create an account to save trips, write reviews, and get exclusive
            offers!
          </Text>
          <TouchableOpacity className="bg-primary rounded-full px-6 py-3">
            <Text className="text-white font-semibold text-center">
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        {/* Plan Trip CTA */}
        <View className="mx-4 mb-8 bg-primary/60 rounded-2xl p-6 items-center">
          <Text className="text-white text-2xl font-bold mb-4">
            Let's start the journey
          </Text>
          <TouchableOpacity
            className="bg-white rounded-full px-6 py-3 mb-2"
            onPress={() => router.push("/explore")} // Navigate to Plan Trip screen
          >
            <Text className="text-primary font-medium">Plan Trip</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-white/20 rounded-full px-6 py-3"
            onPress={() => router.push("/trips")}
          >
            <Text className="text-white font-medium">Explore</Text>
          </TouchableOpacity>
        </View>

        {/* Travel News Section (Sri Lanka only) */}
        <View className="px-4 mb-6">
          <Text className="text-black text-2xl font-bold mb-4">
            Travel News (Sri Lanka)
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              {
                id: 1,
                title: "Ella hiking trails reopened after monsoon season",
                image:
                  "https://images.unsplash.com/photo-1603808033192-0829f84af1d7?w=400&h=250&fit=crop",
              },
              {
                id: 2,
                title: "New train route added: Colombo to Trincomalee",
                image:
                  "https://images.unsplash.com/photo-1593417663585-724d1c0ad4f6?w=400&h=250&fit=crop",
              },
              {
                id: 3,
                title:
                  "Galle Fort heritage walk now available with local guides",
                image:
                  "https://images.unsplash.com/photo-1589102870190-60956cd4c8d2?w=400&h=250&fit=crop",
              },
              {
                id: 4,
                title: "Rainforest camping now open in Sinharaja",
                image:
                  "https://images.unsplash.com/photo-1577117234329-2e2fdfc621d3?w=400&h=250&fit=crop",
              },
            ].map((news) => (
              <TouchableOpacity
                key={news.id}
                className="mr-4 w-64 rounded-xl overflow-hidden shadow"
              >
                <Image
                  source={{ uri: news.image }}
                  className="w-full h-32"
                  resizeMode="cover"
                />
                <View className="bg-white p-3">
                  <Text
                    className="text-black font-semibold text-sm"
                    numberOfLines={2}
                  >
                    {news.title}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Travel Tips (Local Only) */}
        <View className="px-4 mb-6">
          <Text className="text-black text-2xl font-bold mb-4">For You</Text>

          <View className="bg-yellow-50 rounded-xl p-4 mb-4">
            <Text className="text-black font-semibold mb-1">
              🚖 Local Transport Hacks
            </Text>
            <Text className="text-gray-600 text-sm">
              Use PickMe or Uber for short rides in cities. For rural travel,
              tuk-tuks are ideal—just agree on a price first!
            </Text>
          </View>

          <View className="bg-blue-50 rounded-xl p-4 mb-4">
            <Text className="text-black font-semibold mb-1">
              🕒 Best Travel Times
            </Text>
            <Text className="text-gray-600 text-sm">
              Visit southern beaches between December–April and hill country
              like Nuwara Eliya from May–August.
            </Text>
          </View>

          <View className="bg-green-50 rounded-xl p-4 mb-4">
            <Text className="text-black font-semibold mb-1">
              🍛 Food Safety
            </Text>
            <Text className="text-gray-600 text-sm">
              Always drink bottled water. Try street food like kottu and hoppers
              from busy, clean vendors for the best taste and safety.
            </Text>
          </View>

          <View className="bg-red-50 rounded-xl p-4 mb-4">
            <Text className="text-black/200 font-semibold mb-1">
              📵 Stay Connected
            </Text>
            <Text className="text-gray-600 text-sm">
              Buy a Dialog or Mobitel tourist SIM at the airport. They offer
              great coverage even in rural areas.
            </Text>
          </View>
        </View>

        {/* Branding */}
        <View className="mx-4 mb-80 items-center">
          <View className="flex-row items-center">
            <View className="w-8 h-8 bg-primary rounded-full items-center justify-center mr-2">
              <Text className="text-white font-bold text-sm">L</Text>
            </View>
            <Text className="text-teal-600 text-lg font-bold">LankaTrails</Text>
          </View>
          <Text className="text-gray-500 text-xs mt-1">Discover Sri Lanka</Text>
        </View>
      </ScrollView>

      {/* Notification Popup */}
      {showNotifications && (
        <View className="absolute inset-0 justify-center items-center z-50">
          <TouchableOpacity
            className="absolute inset-0"
            onPress={() => setShowNotifications(false)}
            activeOpacity={1}
          />
          <View className="bg-white w-[90%] rounded-2xl p-4 shadow-lg">
            <Text className="text-3xl font-bold m-8 items-center text-black">
              Notifications
            </Text>
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
              className="mt-4 self-end bg-primary  h-15 px-4 py-2 rounded-full"
              onPress={() => setShowNotifications(false)}
            >
              <Text className="text-white font-medium p-2">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      
    </View>
  );
};

export default TravelApp;
