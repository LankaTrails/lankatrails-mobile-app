import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft, Heart, Share } from 'lucide-react-native';
import { router } from 'expo-router';

/* 
  Props:
    - title?: string
    - onBack?: () => void
    - isFavourite: boolean
    - handleFavourite: () => void
    - handleShare: () => void
*/

const HeaderSection = ({
  title = '',
  onBack,
  isFavourite,
  handleFavourite,
  handleShare,
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

      {/* Icons */}
      <View className="flex-row items-center">
        <TouchableOpacity className="mr-4" onPress={handleFavourite}>
          <Heart
            size={30}
            color="#008080"
            fill={isFavourite ? '#008080' : 'none'}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShare}>
          <Share size={30} color="#008080" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HeaderSection;
