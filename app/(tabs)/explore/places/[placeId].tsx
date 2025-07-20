import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { ArrowLeftIcon } from "react-native-heroicons/outline";

const PlaceDetailScreen = () => {
  const { placeId, type } = useLocalSearchParams();

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

          <Text className="text-primary text-3xl font-bold mx-2 flex-1 text-center">
            Place Details
          </Text>
        </View>
      </View>

      <View className="flex-1 items-center justify-center px-4">
        <Text className="text-gray-600 text-lg mb-4">Place Detail View</Text>
        <Text className="text-gray-500 text-base mb-2">
          Place ID: {placeId}
        </Text>
        <Text className="text-gray-500 text-base">Type: {type}</Text>
      </View>
    </View>
  );
};

export default PlaceDetailScreen;
