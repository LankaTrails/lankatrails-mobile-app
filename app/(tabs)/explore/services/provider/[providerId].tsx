import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/Card';
import Header from '@/components/explorer-components/Header';
import  { useState } from 'react';

const { width } = Dimensions.get('window');

// Mock provider data (replace this with dynamic API logic if needed)
const mockProvider = {
  id: 1,
  title: 'Sunset Food Cafe',
  subtitle: 'Unawatuna Beach',
  rating: 4.9,
  image:
    'https://images.squarespace-cdn.com/content/v1/5a3bb03b4c326d76de73ddaa/9732566d-6b33-4a1a-ba0c-1b73ed8848a4/The+Common+Wanderer-9888.jpg',
  contact: {
    phone: '+94 78 129 4800',
    email: 'info@sunsetcafe.lk',
    address: 'No.12, Beach Road, Unawatuna, Sri Lanka',
  },
};

const serviceImages = [
    "https://images.squarespace-cdn.com/content/v1/5a3bb03b4c326d76de73ddaa/9732566d-6b33-4a1a-ba0c-1b73ed8848a4/The+Common+Wanderer-9888.jpg",
    "https://images.squarespace-cdn.com/content/v1/5a3bb03b4c326d76de73ddaa/9732566d-6b33-4a1a-ba0c-1b73ed8848a4/The+Common+Wanderer-9888.jpg",
    "https://images.squarespace-cdn.com/content/v1/5a3bb03b4c326d76de73ddaa/9732566d-6b33-4a1a-ba0c-1b73ed8848a4/The+Common+Wanderer-9888.jpg",
    "https://images.squarespace-cdn.com/content/v1/5a3bb03b4c326d76de73ddaa/9732566d-6b33-4a1a-ba0c-1b73ed8848a4/The+Common+Wanderer-9888.jpg",
    "https://images.squarespace-cdn.com/content/v1/5a3bb03b4c326d76de73ddaa/9732566d-6b33-4a1a-ba0c-1b73ed8848a4/The+Common+Wanderer-9888.jpg",
  ];
// Suggested items (can be fetched from your fetchGroupedPlaces logic later)
const suggestedProviders = [
  {
    id: 2,
    title: 'Tropical Grill',
    subtitle: 'Galle Fort',
    rating: 4.7,
    image: '"https://images.squarespace-cdn.com/content/v1/5a3bb03b4c326d76de73ddaa/9732566d-6b33-4a1a-ba0c-1b73ed8848a4/The+Common+Wanderer-9888.jpg"',
  },
  {
    id: 3,
    title: 'Lagoon View Hotel',
    subtitle: 'Hikkaduwa',
    rating: 4.6,
    image: '"https://images.squarespace-cdn.com/content/v1/5a3bb03b4c326d76de73ddaa/9732566d-6b33-4a1a-ba0c-1b73ed8848a4/The+Common+Wanderer-9888.jpg"',
  },
];

const ServiceView = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
const [showFullDescription, setShowFullDescription] = useState(false);
  return (
    <View style={{ flex: 1 }}>
      <Header 
        title="Service Details" onBack={() => router.back()} 
      />
      <ScrollView className="bg-white flex-1 p-1">
        {/* Cover Image */}
        <View className="ml-6 mb-6">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {serviceImages.map((img, index) => (
              <Image
                key={index}
                source={{ uri: img }}
                className="w-96 h-96 rounded-lg mr-4 shadow-sm"
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        </View>

        {/* Basic Info */}
        <View className="p-4">
          <Text className="text-3xl font-bold text-primary">{mockProvider.title}</Text>
          <Text className="text-l text-gray-500 mt-1">{mockProvider.subtitle}</Text>
          <View className="flex-row items-center mt-2">
            <Ionicons name="star" size={20} color="#facc15" />
            <Text className="ml-1 text-gray-700 text-xl">{mockProvider.rating.toFixed(1)}</Text>
          </View>
          
        </View>

        {/* Contact Section */}
        <View className="px-4 py-3 border-t border-b border-gray-100">
          <Text className="text-2xl font-semibold text-gray-500 mb-3">Contact</Text>

          <TouchableOpacity
            onPress={() => Linking.openURL(`tel:${mockProvider.contact.phone}`)}
            className="flex-row items-center mb-2"
          >
            <Ionicons name="call" size={24} color="#008080" />
            <Text className="ml-4 text-gray-700 text-lg">{mockProvider.contact.phone}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => Linking.openURL(`mailto:${mockProvider.contact.email}`)}
            className="flex-row items-center mb-2"
          >
            <Ionicons name="mail" size={24} color="#008080" />
            <Text className="ml-4 text-gray-700 text-lg">{mockProvider.contact.email}</Text>
          </TouchableOpacity>

          {/* <View className="flex-row items-start mt-1">
            <Ionicons name="location" size={18} color="#14b8a6" />
            <Text className="ml-2 text-gray-700 w-[85%]">{mockProvider.contact.address}</Text>
          </View> */}
        </View>

        {/* Map Preview */}
        <View className="px-4 mt-4">
          <Text className="text-2xl font-semibold text-gray-500 mb-2">Location</Text>
          <Image
            source={{
              uri: `https://maps.googleapis.com/maps/api/staticmap?center=Unawatuna,Sri+Lanka&zoom=15&size=600x300&key=AIzaSyA47Q-I515EK0DU4pvk5jgUcatYcdnf8cY`,
            }}
            className="w-full h-40 rounded-lg"
            resizeMode="cover"
          />
        </View>
        

        {/* Suggested Providers */}
        <View className="px-4 mt-9 mb-12">
          <Text className="text-2xl mt-3 font-semibold text-gray-500 mb-3">You may also like</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {suggestedProviders.map((item) => (
              <Card
                key={item.id}
                item={item}
                width={width * 0.45}
                onPress={() =>
                  router.push({
                    pathname: '../explore/ServiceView',
                    params: { id: item.id.toString() },
                  })
                }
              />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

export default ServiceView;
import ServiceProviderCard from '@/components/explorer-components/ServiceProviderCard';