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
  FlatList,
} from 'react-native';
import { Star } from 'lucide-react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderSection from '@/components/explorer-components/HeaderSection';
import { router } from 'expo-router';
import VehicleCard, { VehicleItem } from '@/components/explorer-components/Transport/VehicleCard';
import Card from '@/components/Card';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TransportProviderCard from '@/components/explorer-components/Transport/TransportProviderCard';
import { Ionicons } from '@expo/vector-icons';
import { TextInput } from 'react-native';

const { width } = Dimensions.get('window');

const TransportServiceView = () => {
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [userComplaint, setUserComplaint] = useState('');
  const [showFullDescription, setShowFullDescription] = useState(false);

  const mockProvider = {
    id: 1,
    title: 'Island Express Transports',
    subtitle: 'Nationwide Services',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    contact: {
      phone: '+94 78 129 4800',
      email: 'bookings@islandexpress.lk',
      address: 'No.12, Galle Road, Colombo 03, Sri Lanka',
    },
    services: ['Airport Transfers', 'City Tours', 'Intercity Travel', 'Chauffeur Service', 'Long Distance'],
    operatingHours: '24/7',
    policies: [
      'Free cancellation up to 24 hours before booking',
      'Child seats available on request',
      'Meet & greet service at airport'
    ]
  };

  const handleSubmitReview = () => {
    if (userRating === 0 || userReview.trim() === '') {
      Alert.alert('Please add a rating and write a review.');
      return;
    }

    Alert.alert('Thank you!', 'Your feedback has been submitted.');
    setUserRating(0);
    setUserReview('');
  };

  const { name } = useLocalSearchParams<{ name: string }>();
  const [isFavourite, setIsFavourite] = useState(false);

  // Transport service images for the horizontal gallery
  const serviceImages = [
    "https://images.unsplash.com/photo-1601584115197-04ecc0da31d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "https://images.unsplash.com/photo-1544620347-c4fd8a3b0de2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "https://images.unsplash.com/photo-1502877338535-766e1452684a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "https://images.unsplash.com/photo-1547036967-23d11aacaee0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
  ];

  // Reviews data with animated progress bars
  const reviewData = {
    excellent: 75,
    veryGood: 68,
    average: 35,
    poor: 12,
    terrible: 5,
  };

  // Service ratings data
  const serviceRatings = {
    punctuality: 90,
    comfort: 85,
    safety: 95,
    value: 80,
    driver: 88,
  };

  // Vehicle items data
  const vehicleItems: VehicleItem[] = [
    {
      id: 1,
      name: 'Premium Sedan',
      description: 'Luxury sedan with leather seats and AC, perfect for business travel',
      price: 'LKR 5,000',
      rating: 4.6,
      capacity: '3 Passengers',
      type: 'Sedan',
      image: { 
        uri: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' 
      },
    },
    {
      id: 2,
      name: 'Family Van',
      description: 'Spacious van with 7 seats, ideal for family trips',
      price: 'LKR 8,000',
      rating: 4.4,
      capacity: '7 Passengers',
      type: 'Minivan',
      image: { 
        uri: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' 
      },
    },
    {
      id: 3,
      name: 'Luxury SUV',
      description: 'Premium SUV with extra legroom and panoramic roof',
      price: 'LKR 7,500',
      rating: 4.8,
      capacity: '4 Passengers',
      type: 'SUV',
      image: { 
        uri: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' 
      },
    },
    {
      id: 4,
      name: 'Budget Car',
      description: 'Economical option for city travel',
      price: 'LKR 3,500',
      rating: 4.2,
      capacity: '3 Passengers',
      type: 'Hatchback',
      image: { 
        uri: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' 
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
    punctuality: useRef(new Animated.Value(0)).current,
    comfort: useRef(new Animated.Value(0)).current,
    safety: useRef(new Animated.Value(0)).current,
    value: useRef(new Animated.Value(0)).current,
    driver: useRef(new Animated.Value(0)).current,
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
    const serviceAnimations = Object.entries(serviceRatings).map(([key, val]) => {
      return Animated.timing(animatedWidths[key as keyof typeof serviceRatings], {
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
            backgroundColor: '#008080',
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
    const message = 'Check out Island Express Transports!';
    if (Platform.OS === 'android') {
      ToastAndroid.show('Sharing Transport Service', ToastAndroid.SHORT);
    } else {
      Alert.alert('Share', message);
    }
  };

  const handleVehiclePress = (item: VehicleItem) => {
    Alert.alert(
      item.name,
      `${item.description}\n\nPrice: ${item.price}\nType: ${item.type}\nCapacity: ${item.capacity}\nRating: ${item.rating}⭐`,
      [
        {
          text: 'Cancel',
          style: 'destructive',
        },
        {
          text: 'Book Now',
          style: 'default',
          onPress: () => router.push('../trips'), // Navigate to booking screen
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <>
      <SafeAreaView className="bg-white ">
        <HeaderSection 
          title="Island Express Transports"
          isFavourite={isFavourite}
          handleFavourite={handleFavourite}
          handleShare={handleShare}
          onBack={() => router.push('../explore/searchResult')} 
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
                className="w-96 h-96 rounded-lg mr-4 shadow-sm"
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        </View>

        {/* Overall Rating */}
        <View className="bg-white rounded-xl ">
          <View className="flex-row p-4">
            <View className="bg-primary rounded-full w-16 h-16 items-center justify-center mr-4">
              <Text className="text-white text-2xl font-bold">4.7</Text>
            </View>
            <View className="flex-1 ">
              <Text className="text-lg font-semibold text-gray-800 mb-1">Customer Reviews</Text>
              <Text className="text-sm text-gray-600">Based on 256 reviews</Text>
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View className="px-4 py-3 border-t border-b border-gray-100">
          <Text className="text-2xl font-semibold text-gray-500 mb-3">Contact</Text>

          <TouchableOpacity
            onPress={() => Linking.openURL(`tel:${mockProvider.contact.phone}`)}
            className="flex-row items-center mb-2"
          >
            <Ionicons name="call" size={24} color="#008080" />
            <Text className="ml-4 text-gray-700 text-lg">{mockProvider.contact.phone}</Text>
          </TouchableOpacity>

          <View className="flex-row items-start mt-1">
            <Ionicons name="location" size={24} color="#008080" />
            <Text className="ml-2 text-gray-700 w-[85%]">{mockProvider.contact.address}</Text>
          </View>
        </View>

        {/* Service Description */}
        <View className="p-5">
          <Text className="text-3xl font-bold text-primary mb-4">About Our Service</Text>
          <Text
            className="text-lg leading-6 text-gray-500 font-semibold"
            numberOfLines={showFullDescription ? undefined : 3}
          >
            Island Express Transports provides reliable and comfortable transportation services across Sri Lanka. 
            With a fleet of well-maintained vehicles and professional drivers, we offer airport transfers, 
            city tours, and intercity travel with punctuality and safety as our top priorities. 
            Our 24/7 customer service ensures you have support whenever you need it.
          </Text>
        
          <TouchableOpacity onPress={() => setShowFullDescription(!showFullDescription)}>
            <Text className="text-teal-600 mt-2 font-medium">
              {showFullDescription ? 'Show less' : 'Show more'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Services Offered */}
        <View className="px-4 mb-6">
          <Text className="text-3xl font-bold text-gray-500 mb-4">Services Offered</Text>
          <View className="flex-row flex-wrap">
            {mockProvider.services.map((service, index) => (
              <View key={index} className="w-1/2 mb-3">
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={20} color="#008080" />
                  <Text className="ml-2 text-gray-700">{service}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Service Policies */}
        <View className="px-4 mb-6">
          <Text className="text-3xl font-bold text-gray-500 mb-4">Service Policies</Text>
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <View className="flex-row justify-between mb-4">
              <Text className="font-semibold text-gray-700">Operating Hours:</Text>
              <Text className="text-gray-600">{mockProvider.operatingHours}</Text>
            </View>
            {mockProvider.policies.map((policy, index) => (
              <View key={index} className="flex-row mb-2">
                <Text className="text-gray-700">• {policy}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Available Vehicles */}
        <View className="px-4 mb-6">
          <Text className="text-3xl font-bold text-gray-500 mb-6">Available Vehicles</Text>
          <FlatList
  data={vehicleItems}
  renderItem={({ item }) => (
    <VehicleCard 
      item={item} 
      onPress={() => router.push('../explore/TransportView')}
    />
  )}
  keyExtractor={item => item.id.toString()}
  horizontal
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={{ paddingRight: 20 }}
/>
        </View>

        {/* Service Ratings */}
        <View className="px-4 mb-6">
          <Text className="text-3xl font-semibold text-gray-500 mb-4">Service Ratings</Text>
          <View className="bg-white rounded-xl p-4 shadow-sm">
            {renderServiceProgressBar('Punctuality', serviceRatings.punctuality, animatedWidths.punctuality)}
            {renderServiceProgressBar('Comfort', serviceRatings.comfort, animatedWidths.comfort)}
            {renderServiceProgressBar('Safety', serviceRatings.safety, animatedWidths.safety)}
            {renderServiceProgressBar('Value', serviceRatings.value, animatedWidths.value)}
            {renderServiceProgressBar('Driver', serviceRatings.driver, animatedWidths.driver)}
          </View>
        </View>

        {/* Leave a Review Section */}
        <View className="px-4 mb-20">
          <Text className="text-3xl font-semibold text-gray-500 mb-4">Leave a Review</Text>

          <View className="bg-white rounded-xl shadow-sm p-4">
            {/* Rating Stars */}
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

            {/* Review Input */}
            <Text className="text-gray-500 font-medium mb-1 text-lg">Your Review</Text>
            <View className="bg-gray-100 rounded-lg px-3 py-2 mb-4">
              <TextInput
                multiline
                placeholder="Share your experience..."
                value={userReview}
                onChangeText={setUserReview}
                className="text-sm text-gray-800"
                style={{ minHeight: 80 }}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmitReview}
              className="bg-primary py-3 rounded-lg items-center"
            >
              <Text className="text-white text-lg font-medium">Submit Review</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('../explore/ComplainPage')}
              className="border-4 border-primary mt-5 bg-white py-3 items-center rounded-full"
            >
              <Text className="text-primary text-lg font-bold">Report an Issue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </>
  );
};

export default TransportServiceView;