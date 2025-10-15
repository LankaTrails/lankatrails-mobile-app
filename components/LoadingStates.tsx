import React from "react";
import { ActivityIndicator, Animated, Text, View } from "react-native";

interface LoadingStateProps {
  fadeInValue?: Animated.Value;
}

export const SearchLoadingState: React.FC<LoadingStateProps> = ({
  fadeInValue,
}) => (
  <View className="flex-1 bg-white items-center justify-center">
    {fadeInValue ? (
      <Animated.View
        style={{
          transform: [
            {
              rotate: fadeInValue.interpolate({
                inputRange: [0, 1],
                outputRange: ["0deg", "360deg"],
              }),
            },
          ],
        }}
      >
        <View className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full" />
      </Animated.View>
    ) : (
      <ActivityIndicator size="large" color="#0D9488" />
    )}
    <Text className="text-primary mt-4 font-medium">Loading...</Text>
  </View>
);

export const ServicesLoadingState: React.FC = () => (
  <View className="px-4 py-8">
    <ActivityIndicator size="large" color="#0D9488" />
    <Text className="text-center mt-4 text-gray-600">Loading services...</Text>
  </View>
);

export const PlacesLoadingState: React.FC = () => (
  <View className="px-4 py-8">
    <ActivityIndicator size="large" color="#0D9488" />
    <Text className="text-center mt-4 text-gray-500 text-base">
      Finding public places...
    </Text>
  </View>
);

export default {
  SearchLoadingState,
  ServicesLoadingState,
  PlacesLoadingState,
};
