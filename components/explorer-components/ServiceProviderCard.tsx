import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Star } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Link } from "expo-router";


type Props = {
  id: number;
  name: string;
  subtitle: string;
  rating: number;
  image: string;
  onPress: () => void;
  width?: number;
};


const ServiceProviderCard = ({
  id,
  name,
  subtitle,
  rating,
  image,
  onPress,
  width = 370,
}: Props) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ width }}
      className="bg-white rounded-xl overflow-hidden  m-5 shadow-md"
    >
      <View className='flex-row items-center m-3'>
        <Image
          source={{ uri: image }}
          className="w-28 h-28 m-3"
          resizeMode="cover"
          style={{ borderRadius: 50}}
        />
        <View className="p-3">
          <Text className="text-2xl font-semibold text-gray-800">{name}</Text>
          <Text className="text-l text-gray-500 mt-1">{subtitle}</Text>
          <View className="flex-row items-center mt-2">
            <Star size={20} color="#14b8a6" />
            <Text className="ml-1 text-lg text-gray-700">{rating.toFixed(1)}</Text>
          </View>
          <Text className="text-lg text-primary mt-2 font-medium ">View Details →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ServiceProviderCard;
