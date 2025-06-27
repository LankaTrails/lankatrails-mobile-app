import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
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
import TripCard from "@/components/TripCard";
import ImageSlider from "@/components/transitions/ImageSlider";


const TravelApp = () => {
  const [searchText, setSearchText] = useState("");
  const insets = useSafeAreaInsets();
  const [showNotifications, setShowNotifications] = useState(false); // popup state

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
    },
    {
      id: 2,
      name: "Temple of Tooth",
      location: "Kandy",
      image:
        "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=200&h=150&fit=crop",
    },
    {
      id: 3,
      name: "Galle Fort",
      location: "Galle",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=150&fit=crop",
    },
    {
      id: 4,
      name: "Adam's Peak",
      location: "Ratnapura",
      image:
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200&h=150&fit=crop",
    },
  ];

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <View style={{ height: insets.top, backgroundColor: "#ffffff" }} />

      {/* Main Content */}
      <View className="flex-1">
        {/* Header */}
        <View className="px-4 pt-4 pb-2 bg-white">
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-primary text-2xl font-bold">Hello, Sarah</Text>
              <Text className="text-black text-lg font-semibold">
                Where do you want to go?
              </Text>
            </View>
            <TouchableOpacity
              className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
              onPress={() => setShowNotifications(true)}
            >
              <Ionicons name="notifications-outline" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <SearchBar />
        </View>

        {/* Scrollable Content */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Featured Destinations */}
          <View className="px-4 mb-6">
            {destinations.map((destination, index) => (
              <StaggeredListItem key={destination.id} delay={index * 100}>
                <TouchableOpacity
                  className="mb-4 rounded-2xl overflow-hidden shadow-sm"
                  style={{ elevation: 2 }}
                >
                  <Image
                    source={{ uri: destination.image }}
                    className="w-full h-48"
                    resizeMode="cover"
                  />
                  <View className="absolute bottom-0 left-0 right-0 bg-black/30 p-4">
                    <Text className="text-white text-xl font-bold mb-1">
                      {destination.name}
                    </Text>
                    <Text className="text-white/90 text-sm mb-2">
                      {destination.description}
                    </Text>
                    <View className="flex-row items-center">
                      <Ionicons name="star" size={16} color="#FFD700" />
                      <Text className="text-white ml-1 text-sm font-medium">
                        {destination.rating}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </StaggeredListItem>
            ))}
            <ImageSlider images={[
              "https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=400&h=300&fit=crop",
              "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=300&fit=crop"
            ]}>
             
             </ImageSlider>
             <TripCard
               id={1}
               title="Sample Trip"
               details="A wonderful trip to Sri Lanka's most beautiful places."
               budget={"Rs. 50,000"}
               duration={"5 Days"}
             />
          </View>
           
          {/* Popular Places */}
          <View className="px-4 mb-6">
            <Text className="text-black text-lg font-semibold mb-4">Popular Places</Text>
            <View className="flex-row flex-wrap justify-between -mx-1">
              {popularPlaces.map((place, index) => (
                <StaggeredListItem key={place.id} delay={index * 100}>
                  <TouchableOpacity
                    className="w-[48%] mx-1 mb-4 rounded-xl overflow-hidden shadow-sm"
                    style={{ elevation: 1 }}
                  >
                    <Image
                      source={{ uri: place.image }}
                      className="w-full h-32"
                      resizeMode="cover"
                    />
                    <View className="p-3 bg-white">
                      <Text className="text-black font-medium text-sm mb-1">
                        {place.name}
                      </Text>
                      <Text className="text-gray-500 text-xs">{place.location}</Text>
                    </View>
                  </TouchableOpacity>
                </StaggeredListItem>
              ))}
            </View>
          </View>

          {/* CTA */}
          <View className="mx-4 mb-8 bg-gradient-to-r from-teal-400 to-blue-500 rounded-2xl p-6 items-center">
            <Text className="text-white text-lg font-semibold mb-2">
              Let's start the journey
            </Text>
            <TouchableOpacity className="bg-white rounded-full px-6 py-3 mb-2">
              <Text className="text-teal-600 font-medium">Plan Trip</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-white/20 rounded-full px-6 py-3">
              <Text className="text-white font-medium">Explore</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Branding */}
          <View className="mx-4 mb-80 items-center">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-teal-500 rounded-full items-center justify-center mr-2">
                <Text className="text-white font-bold text-sm">L</Text>
              </View>
              <Text className="text-teal-600 text-lg font-bold">LankaTrails</Text>
            </View>
            <Text className="text-gray-500 text-xs mt-1">Discover Sri Lanka</Text>
          </View>
        </ScrollView>
      </View>

      {/* Notification Popup */}
      {showNotifications && (
        <View className="absolute inset-0 bg-black/40 justify-center items-center z-50">
          {/* Tap outside to close */}
          <TouchableOpacity
            className="absolute inset-0"
            onPress={() => setShowNotifications(false)}
            activeOpacity={1}
          />
          <View className="bg-white w-[90%] rounded-2xl p-4 shadow-lg">
            <Text className="text-3xl font-bold m-8 ml-20  text-black">Notifications</Text>

            {/* Example Notifications */}
            
            <StaggeredListItem index={0} delay={400}>
                <View className="m-4 border-" >
              <Text className="text-lg text-black">🧳 Your saved trip to Kandy is waiting!</Text>
            </View>
                <View className="m-4">
              <Text className="text-lg text-black">🌍 New destination added: Trincomalee</Text>
            </View>
            <View className="m-4">
              <Text className="text-lg text-black">✈️  Flight deals to Ella updated!</Text>
            </View>
                      </StaggeredListItem>
           

            <TouchableOpacity
              className="mt-4 self-end bg-primary w-40 h-15 px-4 py-2 rounded-full"
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