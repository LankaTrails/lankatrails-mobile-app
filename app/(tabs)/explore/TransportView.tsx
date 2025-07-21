import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  ToastAndroid,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Platform,
  FlatList,
} from "react-native";
import HeaderSection from "@/components/explorer-components/HeaderSection";
import { Star, ChevronRight } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

const TransportServiceView = () => {
  const [isFavourite, setIsFavourite] = useState(false);

  // Related transport services data
  const relatedServices = [
    {
      id: "1",
      name: "Luxury Minivan",
      type: "Private Transfer",
      price: "LKR 12,000",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957",
    },
    {
      id: "2",
      name: "Airport Shuttle",
      type: "Shared Transfer",
      price: "LKR 3,500",
      rating: 4.5,
      image: "https://images.unsplash.com/photo-1506929562872-bb421503ef21",
    },
    {
      id: "3",
      name: "Tuk Tuk Rental",
      type: "Self-Drive",
      price: "LKR 2,500/hr",
      rating: 4.2,
      image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87",
    },
  ];

  const transportImages = [
    "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7",
    "https://images.unsplash.com/photo-1493238792000-8113da705763",
  ];

  const existingTrips = [
    { id: "trip1", name: "Beach Tour", days: ["2025-07-20"] },
    { id: "trip2", name: "Cultural Route", days: ["2025-07-22"] },
  ];

  

  const renderRelatedService = ({ item }) => (
    <TouchableOpacity 
      className="bg-white rounded-lg shadow-sm p-3 mr-4 w-48"
      onPress={() => router.push({ pathname: '../explore/TransportserviceView', params: { id: item.id } })}
    >
      <Image
        source={{ uri: item.image }}
        className="w-full h-32 rounded-lg mb-2"
      />
      <Text className="font-semibold text-gray-700">{item.name}</Text>
      <Text className="text-xs text-gray-500 mb-1">{item.type}</Text>
      <View className="flex-row justify-between items-center">
        <Text className="text-primary font-bold">{item.price}</Text>
        <View className="flex-row items-center">
          <Star size={14} color="#FBB03B" fill="#FBB03B" />
          <Text className="text-xs text-gray-500 ml-1">{item.rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <HeaderSection
        title="Premium Car Rental"
        isFavourite={isFavourite}
        handleFavourite={() => setIsFavourite(!isFavourite)}
        handleShare={() => Linking.openURL("https://maps.google.com")}
        onBack={() => router.back()}
      />

      <ScrollView className="bg-gray-50">
        <ScrollView horizontal className="ml-6 mt-4">
          {transportImages.map((img, i) => (
            <Image
              key={i}
              source={{ uri: img }}
              className="w-96 h-72 rounded-lg mr-4"
            />
          ))}
        </ScrollView>

        <View className="px-4 mt-4">
          <Text className="text-3xl font-bold text-gray-700">Premium Car Rental</Text>
          <Text className="text-gray-500 mt-1">Air-conditioned luxury vehicle with chauffeur</Text>
          <Text className="text-xl text-primary mt-2 font-bold">LKR 10,000 / day</Text>

          <View className="flex-row items-center mt-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={18} color="#FBB03B" fill="#FBB03B" />
            ))}
            <Text className="ml-2 text-gray-500">(4.7)</Text>
          </View>
        </View>

        <View className="flex-row space-x-2 px-4 mt-2 gap-2">
          <Text className="text-xs px-3 py-1 bg-blue-100 text-blue-800 rounded-full">Air Conditioned</Text>
          <Text className="text-xs px-3 py-1 bg-green-100 text-green-800 rounded-full">English Driver</Text>
          <Text className="text-xs px-3 py-1 bg-purple-100 text-purple-800 rounded-full">Free Cancellation</Text>
        </View>

        <View className="px-4 mt-4">
          <Text className="text-xl font-semibold text-gray-700 mb-2">Vehicle Details</Text>
          <Text className="text-gray-600">🚗 Toyota Prius, 🪑 4 Seats, ❄️ AC, 📱 Free WiFi, 💧 Bottled Water</Text>
        </View>

        <View className="px-4 mt-4">
          <Text className="text-lg text-gray-700">Pickup Locations: Colombo Airport, Negombo, Colombo City</Text>
          <Text className="text-sm text-gray-500">Available 24/7 with prior booking</Text>
        </View>

        

        {/* Related Services Section */}
        <View className="mt-8 px-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-700">Related Services</Text>
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-primary">See all</Text>
              <ChevronRight size={18} color="#008080" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            horizontal
            data={relatedServices}
            renderItem={renderRelatedService}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
          />
        </View>

        <View className="h-8" /> {/* Bottom spacer */}
      </ScrollView>

      
    </SafeAreaView>
  );
};

export default TransportServiceView;