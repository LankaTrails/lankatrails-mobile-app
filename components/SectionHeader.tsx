import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { MapPinIcon } from "react-native-heroicons/outline";

interface SectionHeaderProps {
  title: string;
  count?: number;
  location: string;
  isNearby: boolean;
  showSeeMore?: boolean;
  onSeeMore?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  count,
  location,
  isNearby,
  showSeeMore,
  onSeeMore,
}) => (
  <View className="flex-row items-center justify-between mb-6">
    <View className="flex-row items-center flex-1 justify-between">
      <Text className="text-2xl font-bold text-primary mr-3">{title}</Text>
      <View className="flex-row items-center">
        <MapPinIcon size={14} color="#6B7280" strokeWidth={2} />
        <Text className="text-gray-500 text-sm ml-1">
          {isNearby ? "Near you" : location}
        </Text>
      </View>
    </View>
    {showSeeMore && onSeeMore && (
      <TouchableOpacity onPress={onSeeMore}>
        <Text className="text-primary font-semibold text-sm">View all →</Text>
      </TouchableOpacity>
    )}
  </View>
);

export default SectionHeader;
