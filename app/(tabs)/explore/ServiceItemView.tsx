// This file contains the customized and enhanced view page for Grilled King Prawns
// Includes improvements like ingredients, tags, add-to-cart, and chef's note
// Continued from your original file with modifications and new sections added

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Animated,
  Dimensions,
  TouchableOpacity,
  ToastAndroid,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { Star } from 'lucide-react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderSection from '@/components/explorer-components/HeaderSection';
import MenuCard from '@/components/explorer-components/MenuCard';
import Card from '@/components/Card';
import ServiceProviderCard from '@/components/explorer-components/ServiceProviderCard';
import { Ionicons } from '@expo/vector-icons';
import { TextInput } from 'react-native';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

const ServiceView = () => {
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isFavourite, setIsFavourite] = useState(false);
  const { name } = useLocalSearchParams();

  
  const progressAnimations = {
    excellent: useRef(new Animated.Value(0)).current,
    veryGood: useRef(new Animated.Value(0)).current,
    average: useRef(new Animated.Value(0)).current,
    poor: useRef(new Animated.Value(0)).current,
    terrible: useRef(new Animated.Value(0)).current,
  };

  const reviewData = {
    excellent: 85,
    veryGood: 70,
    average: 45,
    poor: 20,
    terrible: 10,
  };
const serviceImages = [
    "https://images.squarespace-cdn.com/content/v1/5a3bb03b4c326d76de73ddaa/9732566d-6b33-4a1a-ba0c-1b73ed8848a4/The+Common+Wanderer-9888.jpg",
    "https://images.squarespace-cdn.com/content/v1/5a3bb03b4c326d76de73ddaa/9732566d-6b33-4a1a-ba0c-1b73ed8848a4/The+Common+Wanderer-9888.jpg",
    "https://images.squarespace-cdn.com/content/v1/5a3bb03b4c326d76de73ddaa/9732566d-6b33-4a1a-ba0c-1b73ed8848a4/The+Common+Wanderer-9888.jpg",
    "https://images.squarespace-cdn.com/content/v1/5a3bb03b4c326d76de73ddaa/9732566d-6b33-4a1a-ba0c-1b73ed8848a4/The+Common+Wanderer-9888.jpg",
    "https://images.squarespace-cdn.com/content/v1/5a3bb03b4c326d76de73ddaa/9732566d-6b33-4a1a-ba0c-1b73ed8848a4/The+Common+Wanderer-9888.jpg",
  ];
  useEffect(() => {
    Object.keys(progressAnimations).forEach((key, i) => {
      Animated.timing(progressAnimations[key], {
        toValue: reviewData[key] / 100,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    });
  }, []);

  const handleSubmitReview = () => {
    if (userRating === 0 || userReview.trim() === '') {
      Alert.alert('Please add a rating and write a review.');
      return;
    }
    Alert.alert('Thank you!', 'Your feedback has been submitted.');
    setUserRating(0);
    setUserReview('');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <HeaderSection
        title="Grilled King Prawns"
        isFavourite={isFavourite}
        handleFavourite={() => setIsFavourite(!isFavourite)}
        handleShare={() => Alert.alert('Share', 'Sharing Grilled King Prawns')}
        onBack={() => router.back()}
      />
      <ScrollView className="bg-gray-50">
        {/* Image Gallery */}
        <ScrollView horizontal className="ml-6 mt-4">
          {serviceImages.map((img, i) => (
            <Image key={i} source={{ uri: img }} className="w-96 h-96 rounded-lg mr-4" />
          ))}
        </ScrollView>

        {/* Food Basic Info */}
        <View className="px-4 mt-4">
          <Text className="text-3xl font-bold text-gray-500">Grilled King Prawns</Text>
          <Text className="text-lg text-gray-500 mt-1">Large grilled prawns served with garlic butter and herbs.</Text>
          <Text className="text-xl text-primary mt-2 font-bold">LKR 2500</Text>
          <View className="flex-row items-center mt-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={18} color="#FBB03B" fill="#FBB03B" />
            ))}
            <Text className="ml-2 text-gray-500">(4.8)</Text>
          </View>
        </View>

        {/* Tags */}
        <View className="flex-row space-x-2 px-4 gap-2 mt-2">
          <Text className="text-xs px-3 py-1 bg-green-100 text-green-800 rounded-full">Seafood</Text>
          <Text className="text-xs px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">Spicy</Text>
          <Text className="text-xs px-3 py-1 bg-blue-100 text-blue-800 rounded-full">Chef's Special</Text>
        </View>

        {/* Ingredients */}
        <View className="px-4 mt-4">
          <Text className="text-xl font-semibold text-gray-700 mb-2">Ingredients</Text>
          <Text className="text-gray-600">🦐 King prawns, 🧄 Garlic butter, 🌿 Local herbs, 🧂 Sea salt</Text>
        </View>

        {/* Chef's Note */}
        <View className="px-4 mt-4">
          <Text className="text-lg italic text-gray-700">
            "Our grilled prawns are prepared using a 50-year-old recipe passed down from the original beach chefs of Unawatuna."
          </Text>
        </View>

        {/* Add to Cart Button */}
        <TouchableOpacity
          onPress={() => Alert.alert('Added to cart')}
          className="bg-primary mx-6 py-3 mt-6 rounded-full items-center"
        >
          <Text className="text-white font-semibold text-lg">Add to trip</Text>
        </TouchableOpacity>

        {/* Reviews Section */}
        <View className="px-4 mt-10">
          <Text className="text-3xl font-semibold text-gray-500 mb-4">Customer Feedback</Text>
          {Object.entries(progressAnimations).map(([label, anim], i) => (
            <View key={i} className="flex-row items-center mb-2 mx-4">
              <Text className="w-20 text-gray-500 font-semibold">{label}</Text>
              <View className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <Animated.View
                  style={{
                    height: 8,
                    backgroundColor: '#008080',
                    width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                  }}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Leave a Review */}
        <View className="px-4 mt-6 mb-20">
          <Text className="text-3xl font-semibold text-gray-500 mb-2">Leave a Review</Text>

          <View className="bg-white rounded-xl shadow-sm p-4">
            <Text className="text-gray-500 font-medium text-lg mb-2">Your Rating</Text>
            <View className="flex-row mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setUserRating(star)}>
                  <Star
                    size={24}
                    color={userRating >= star ? '#FBB03B' : '#E5E7EB'}
                    fill={userRating >= star ? '#FBB03B' : 'none'}
                    className="mr-1"
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              multiline
              placeholder="Write your experience here..."
              value={userReview}
              onChangeText={setUserReview}
              className="bg-gray-100 px-3 py-2 rounded-lg text-gray-800"
              style={{ minHeight: 80 }}
            />
            <TouchableOpacity
              onPress={handleSubmitReview}
              className="bg-primary py-3 rounded-lg mt-4 items-center"
            >
              <Text className="text-white text-lg font-medium">Submit Feedback</Text>
            </TouchableOpacity>
            <TouchableOpacity
                  onPress={() => router.push('../explore/ComplainPage')}
                  className="border-4 border-primary mt-5 bg-white py-3  items-center rounded-full"
                >
                  <Text className="text-primary text-lg font-bold">If you have any complaints</Text>
                </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ServiceView;