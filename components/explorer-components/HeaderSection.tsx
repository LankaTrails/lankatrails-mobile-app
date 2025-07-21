import { router } from "expo-router";
import { ArrowLeft, Heart } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface HeaderSectionProps {
  title?: string;
  onBack?: () => void;
  showFavorite?: boolean;
  isFavorite?: boolean;
  onFavoritePress?: () => void;
}

const HeaderSection: React.FC<HeaderSectionProps> = ({
  title = "",
  onBack,
  showFavorite = false,
  isFavorite = false,
  onFavoritePress,
}) => {
  return (
    <View className="flex-row items-center justify-between mt-5 mb-2 px-4">
      {/* Back Button */}
      <TouchableOpacity
        onPress={onBack ?? (() => router.back())}
        className="flex-row items-center"
      >
        <ArrowLeft size={34} color="#008080" />
      </TouchableOpacity>

      {/* Title */}
      <Text
        className="text-primary text-3xl font-bold mx-2 flex-1 text-center"
        numberOfLines={1}
      >
        {title}
      </Text>

      {/* Favorite Button or Empty space */}
      {showFavorite ? (
        <TouchableOpacity onPress={onFavoritePress} className="p-2">
          <Heart
            size={28}
            color={isFavorite ? "#008080" : "#008080"}
            fill={isFavorite ? "#008080" : "none"}
          />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 34 }} />
      )}
    </View>
  );
};

export default HeaderSection;
