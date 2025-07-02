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
} from 'react-native';
import { Star } from 'lucide-react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderSection from '@/components/explorer-components/HeaderSection';
import { router } from 'expo-router';
import MenuCard, { MenuItem } from '@/components/explorer-components/MenuCard';

const { width } = Dimensions.get('window');

const ServiceView = () => {
  const { name } = useLocalSearchParams<{ name: string }>();
  const [isFavourite, setIsFavourite] = useState(false);

  // Service images for the horizontal gallery
  const serviceImages = [
    "https://images.squarespace-cdn.com/content/v1/5a3bb03b4c326d76de73ddaa/9732566d-6b33-4a1a-ba0c-1b73ed8848a4/The+Common+Wanderer-9888.jpg",
    "https://images.squarespace-cdn.com/content/v1/5a3bb03b4c326d76de73ddaa/9732566d-6b33-4a1a-ba0c-1b73ed8848a4/The+Common+Wanderer-9888.jpg",
    "https://images.squarespace-cdn.com/content/v1/5a3bb03b4c326d76de73ddaa/9732566d-6b33-4a1a-ba0c-1b73ed8848a4/The+Common+Wanderer-9888.jpg",
    "https://images.squarespace-cdn.com/content/v1/5a3bb03b4c326d76de73ddaa/9732566d-6b33-4a1a-ba0c-1b73ed8848a4/The+Common+Wanderer-9888.jpg",
    "https://images.squarespace-cdn.com/content/v1/5a3bb03b4c326d76de73ddaa/9732566d-6b33-4a1a-ba0c-1b73ed8848a4/The+Common+Wanderer-9888.jpg",
  ];

  // Reviews data with animated progress bars
  const reviewData = {
    excellent: 85,
    veryGood: 70,
    average: 45,
    poor: 20,
    terrible: 10,
  };

  // Service ratings data
  const serviceReviews = {
    food: 90,
    service: 80,
    ambiance: 70,
    value: 85,
  };

  // Menu items data
  const menuItems: MenuItem[] = [
    {
      id: 1,
      name: 'Grilled King Prawns',
      description: 'Large grilled prawns served with garlic butter',
      price: 'LKR 2500',
      rating: 4.8,
      image: { 
        uri: 'https://images.squarespace-cdn.com/content/v1/5a3bb03b4c326d76de73ddaa/9732566d-6b33-4a1a-ba0c-1b73ed8848a4/The+Common+Wanderer-9888.jpg' 
      },
    },
    {
      id: 2,
      name: 'Grilled King Prawns',
      description: 'Large grilled prawns served with garlic butter',
      price: 'LKR 2500',
      rating: 4.8,
      image: { 
        uri: 'https://images.squarespace-cdn.com/content/v1/5a3bb03b4c326d76de73ddaa/9732566d-6b33-4a1a-ba0c-1b73ed8848a4/The+Common+Wanderer-9888.jpg' 
      },
    },
    {
      id: 3,
      name: 'Grilled King Prawns',
      description: 'Fresh king prawns with local herbs',
      price: 'LKR 2800',
      rating: 4.6,
      image: { 
        uri: 'https://images.squarespace-cdn.com/content/v1/5a3bb03b4c326d76de73ddaa/9732566d-6b33-4a1a-ba0c-1b73ed8848a4/The+Common+Wanderer-9888.jpg' 
      },
    },
    {
      id: 4,
      name: 'Grilled King Prawns',
      description: 'Spiced grilled prawns with local sauce',
      price: 'LKR 2500',
      rating: 4.8,
      image: { 
        uri: 'https://images.squarespace-cdn.com/content/v1/5a3bb03b4c326d76de73ddaa/9732566d-6b33-4a1a-ba0c-1b73ed8848a4/The+Common+Wanderer-9888.jpg' 
      },
    },
  ];

  // Animated values for review progress bars
  const [progressAnimations] = useState({
    excellent: new Animated.Value(0),
    veryGood: new Animated.Value(0),
    average: new Animated.Value(0),
    poor: new Animated.Value(0),
    terrible: new Animated.Value(0),
  });

  // Animated values for service ratings
  const animatedWidths = {
    food: useRef(new Animated.Value(0)).current,
    service: useRef(new Animated.Value(0)).current,
    ambiance: useRef(new Animated.Value(0)).current,
    value: useRef(new Animated.Value(0)).current,
  };

  useEffect(() => {
    // Animate review progress bars
    const reviewAnimations = Object.keys(progressAnimations).map((key, index) => {
      const typedKey = key as keyof typeof progressAnimations;
      return Animated.timing(progressAnimations[typedKey], {
        toValue: reviewData[typedKey] / 100,
        duration: 1000,
        delay: index * 200,
        useNativeDriver: false,
      });
    });

    // Animate service ratings
    const serviceAnimations = Object.entries(serviceReviews).map(([key, val]) => {
      return Animated.timing(animatedWidths[key as keyof typeof serviceReviews], {
        toValue: val,
        duration: 1000,
        useNativeDriver: false,
      });
    });

    // Start animations
    Animated.stagger(100, reviewAnimations).start();
    Animated.stagger(150, serviceAnimations).start();
  }, []);

  // Progress bar component for reviews
  const ProgressBar = ({ label, animatedValue, color = '#10b981' }: {
    label: string;
    animatedValue: Animated.Value;
    color?: string;
  }) => (
    <View className="flex-row items-center mb-2">
      <Text className="text-sm text-gray-600 w-16 text-right mr-3">{label}</Text>
      <View className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <Animated.View
          className="h-full rounded-full"
          style={{
            backgroundColor: color,
            width: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          }}
        />
      </View>
    </View>
  );

  // Service rating progress bar
  const renderServiceProgressBar = (label: string, value: number, animatedValue: Animated.Value) => (
    <View className="mb-3">
      <Text className="text-gray-700 font-medium mb-1">{label}</Text>
      <View className="h-4 bg-gray-200 rounded-full overflow-hidden">
        <Animated.View
          style={{
            height: 16,
            borderRadius: 10,
            backgroundColor: '#14b8a6',
            width: animatedValue.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          }}
        />
      </View>
    </View>
  );

  const handleFavourite = () => {
    setIsFavourite((prev) => {
      const newState = !prev;
      if (Platform.OS === 'android') {
        ToastAndroid.show(
          newState ? 'Added to favourites' : 'Removed from favourites',
          ToastAndroid.SHORT
        );
      } else {
        Alert.alert(newState ? 'Added to favourites' : 'Removed from favourites');
      }
      return newState;
    });
  };
  
  const handleShare = () => {
    const message = 'Check out Sunset Food Cafe in Unawatuna!';
    if (Platform.OS === 'android') {
      ToastAndroid.show('Sharing Sunset Food Cafe', ToastAndroid.SHORT);
    } else {
      Alert.alert('Share', message);
    }
  };

  const handleMenuItemPress = (item: MenuItem) => {
    Alert.alert(
      item.name,
      `${item.description}\n\nPrice: ${item.price}\nRating: ${item.rating}⭐`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Add to Cart', style: 'default' },
      ]
    );
  };

  return (
    <>
      <SafeAreaView className="bg-white ">
        <HeaderSection 
          title="Sunset Food Cafe"
          isFavourite={isFavourite}
          handleFavourite={handleFavourite}
          handleShare={handleShare}
          onBack={() => router.push('/explore/searchResult')} 
        />
      </SafeAreaView>
      
      <ScrollView className="flex-1 mb-20 bg-gray-50">
        {/* Horizontal Image Gallery */}
        <View className="ml-6 mb-6">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {serviceImages.map((img, index) => (
              <Image
                key={index}
                source={{ uri: img }}
                className="w-80 h-64 rounded-lg mr-4 shadow-sm"
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        </View>

        {/* Restaurant Description */}
        <View className="px-4 mb-6">
          <Text className="text-gray-600 leading-6">
            Located right on the golden shores of Unawatuna, Sunset Food Cafe is a cozy beachside spot famous for its fresh seafood and stunning sunset views. Whether you're here for a romantic dinner, a casual cocktail or just to chill with friends, this cafe promises an unforgettable dining experience.
          </Text>
        </View>

        {/* Menu Highlights */}
        <View className="px-4 mb-6">
          <Text className="text-xl font-bold text-gray-800 mb-4">Menu Highlights</Text>
          <View className="flex-row flex-wrap justify-between">
            {menuItems.map((item) => (
              <View key={item.id} className="w-[48%]">
                <MenuCard 
                  item={item} 
                  onPress={handleMenuItemPress}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Service Ratings */}
        <View className="px-4 mb-6">
          <Text className="text-xl font-semibold text-gray-800 mb-4">Service Ratings</Text>
          <View className="bg-white rounded-xl p-4 shadow-sm">
            {renderServiceProgressBar('Food Quality', serviceReviews.food, animatedWidths.food)}
            {renderServiceProgressBar('Service', serviceReviews.service, animatedWidths.service)}
            {renderServiceProgressBar('Ambiance', serviceReviews.ambiance, animatedWidths.ambiance)}
            {renderServiceProgressBar('Value for Money', serviceReviews.value, animatedWidths.value)}
          </View>
        </View>

        {/* Overall Reviews Section */}
        <View className="px-4 mb-6">
          <View className="bg-white rounded-xl p-6 shadow-sm">
            {/* Overall Rating */}
            <View className="flex-row items-center mb-6">
              <View className="bg-teal-500 rounded-full w-16 h-16 items-center justify-center mr-4">
                <Text className="text-white text-xl font-bold">4.9</Text>
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-800 mb-1">Customer Reviews</Text>
                <Text className="text-sm text-gray-600">Based on 284 reviews</Text>
              </View>
            </View>

            {/* Review Progress Bars */}
            <ProgressBar 
              label="Excellent" 
              animatedValue={progressAnimations.excellent}
              color="#10b981"
            />
            <ProgressBar 
              label="Very Good" 
              animatedValue={progressAnimations.veryGood}
              color="#22c55e"
            />
            <ProgressBar 
              label="Average" 
              animatedValue={progressAnimations.average}
              color="#eab308"
            />
            <ProgressBar 
              label="Poor" 
              animatedValue={progressAnimations.poor}
              color="#f97316"
            />
            <ProgressBar 
              label="Terrible" 
              animatedValue={progressAnimations.terrible}
              color="#ef4444"
            />
          </View>
        </View>

        {/* Individual Customer Reviews */}
        <View className="px-4 mb-6">
          <Text className="text-xl font-semibold text-gray-800 mb-4">Recent Reviews</Text>
          {['Nimal', 'Sophie', 'Kasun', 'Emma'].map((reviewer, i) => (
            <View key={i} className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100">
              <View className="flex-row items-center mb-2">
                <View className="w-10 h-10 bg-teal-100 rounded-full items-center justify-center mr-3">
                  <Text className="text-teal-700 font-semibold">{reviewer.charAt(0)}</Text>
                </View>
                <Text className="font-semibold text-gray-800">{reviewer}</Text>
              </View>
              <Text className="text-gray-600 text-sm mb-2">
                {i === 0 && "Amazing seafood and breathtaking sunset views! The grilled prawns were perfectly cooked."}
                {i === 1 && "Great atmosphere and friendly service. Perfect spot for a romantic dinner by the beach."}
                {i === 2 && "Fresh ingredients and authentic flavors. The beachfront location is absolutely stunning."}
                {i === 3 && "Excellent food quality and reasonable prices. Will definitely come back again!"}
              </Text>
              <View className="flex-row">
                {[...Array(5)].map((_, starIndex) => (
                  <Star key={starIndex} size={14} color="#FBB03B" fill="#FBB03B" />
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Related Restaurants */}
        <View className="px-4 mb-6">
          <Text className="text-xl font-semibold text-gray-800 mb-4">Other Restaurants Nearby</Text>
          {['Ocean Breeze Restaurant', 'Tropical Paradise Cafe'].map((restaurant, i) => (
            <TouchableOpacity key={i} className="mb-4 bg-white rounded-xl p-4 shadow-sm">
              <Text className="text-lg font-semibold text-teal-700">{restaurant}</Text>
              <Text className="text-sm text-gray-600">Another great dining option in Unawatuna</Text>
              <View className="flex-row items-center mt-2">
                <Star size={14} color="#FBB03B" fill="#FBB03B" />
                <Text className="text-sm text-gray-600 ml-1">4.{7 - i}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* You May Also Like */}
        <View className="px-4 mb-20">
          <Text className="text-xl font-semibold text-gray-800 mb-4">You may also like</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['Beach Bar', 'Seafood Grill', 'Sunset Lounge'].map((suggestion, i) => (
              <TouchableOpacity
                key={i}
                className="bg-white rounded-xl shadow-sm mr-4 w-40 h-32 items-center justify-center border border-gray-100"
              >
                <Text className="text-teal-600 font-medium text-center">{suggestion}</Text>
                <Text className="text-xs text-gray-500 mt-1">Nearby</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </>
  );
};

export default ServiceView;