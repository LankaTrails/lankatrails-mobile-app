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
      onPress={() => {
        // console.log(`Card pressed: ${cardData.title}`);
        onPress?.(cardData);
      }}
    >
      <Image
        source={{ uri: cardData.image }}
        className="w-full h-48 rounded-t-xl"
        resizeMode="cover"
      />
      <View className="p-3">
        <Text className="text-lg font-bold  text-primary mb-1" numberOfLines={1}>
          {cardData.title}
        </Text>
        <Text className="text-sm text-gray-500 mb-2" numberOfLines={1}>
          {cardData.subtitle}
        </Text>
        <View className="flex-row items-center">
          <Ionicons name="star" size={16} color="#FFC107" />
          <Text className="text-sm text-gray-600 ml-1">{cardData.rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default Card;


      //  <View className="px-4 mb-6">
      //       <Text className="text-black text-lg font-semibold mb-4">Popular Places</Text>
      //       <View className="flex-row flex-wrap justify-between">
      //         {popularPlaces.map((place) => (
      //           <TouchableOpacity
      //             key={place.id}
      //             className="w-[48%] mb-4 rounded-xl overflow-hidden shadow-sm"
      //             style={{ elevation: 1 }}
      //           >
      //             <Image
      //               source={{ uri: place.image }}
      //               className="w-full h-32"
      //               resizeMode="cover"
      //             />
      //             <View className="p-3 bg-white">
      //               <Text className="text-black font-medium text-sm mb-1">
      //                 {place.name}
      //               </Text>
      //               <Text className="text-gray-500 text-xs">{place.location}</Text>
      //             </View>
      //           </TouchableOpacity>
      //         ))}
      //       </View>
      //     </View>