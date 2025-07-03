import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Star } from 'lucide-react-native';

export type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: string;
  rating: number;
  image: any;
};

type MenuCardProps = {
  item: MenuItem;
  onPress?: (item: MenuItem) => void;
};

const MenuCard = ({ item, onPress }: MenuCardProps) => {
  return (
    <TouchableOpacity
      onPress={() => onPress?.(item)}
      activeOpacity={0.8}
      className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden"
    >
      <Image 
        source={item.image}
        className="w-full h-32 bg-gray-200"
        resizeMode="cover"
      />
      <View className="p-4">
        <Text className="text-lg font-semibold text-gray-800 mb-1" numberOfLines={1}>
          {item.name}
        </Text>
        <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
          {item.description}
        </Text>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Star size={16} color="#f59e0b" fill="#f59e0b" />
            <Text className="text-sm text-gray-600 ml-1 font-medium">
              {item.rating}
            </Text>
          </View>
          <Text className="text-lg font-bold text-teal-600">
            {item.price}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default MenuCard;