import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CardItem {
  id: number;
  title: string;
  subtitle: string;
  rating: number;
  image: string;
}

interface CardProps {
  item?: CardItem;
  onPress?: (item: CardItem) => void;
  width?: number;
}

const Card: React.FC<CardProps> = ({ item, onPress, width = 160 }) => {
  // Handle undefined item prop
  if (!item) {
    return null;
  }

  // Provide default values for missing properties
  const cardData = {
    id: item.id || 0,
    title: item.title || 'No title',
    subtitle: item.subtitle || 'No subtitle',
    rating: item.rating || 0,
    image: item.image || 'https://via.placeholder.com/160x96/e2e8f0/64748b?text=No+Image'
  };

  return (
    <TouchableOpacity
      className="bg-white rounded-xl shadow-sm mr-4 mb-4"
      style={{ width }}
      onPress={() => onPress?.(item)}
    >
      <Image
        source={{ uri: cardData.image }}
        className="w-full h-24 rounded-t-xl"
        resizeMode="cover"
      />
      <View className="p-3">
        <Text className="text-sm font-medium text-gray-800 mb-1" numberOfLines={1}>
          {cardData.title}
        </Text>
        <Text className="text-xs text-gray-500 mb-2" numberOfLines={1}>
          {cardData.subtitle}
        </Text>
        <View className="flex-row items-center">
          <Ionicons name="star" size={12} color="#FFC107" />
          <Text className="text-xs text-gray-600 ml-1">{cardData.rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default Card;
export type { CardItem };