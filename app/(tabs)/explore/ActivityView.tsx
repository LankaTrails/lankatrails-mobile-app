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
  TextInput,
} from 'react-native';
import { Star } from 'lucide-react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderSection from '@/components/explorer-components/HeaderSection';
import { router } from 'expo-router';
import ActivityCard from '@/components/explorer-components/Activity/ActivityCard';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ActivityView = () => {
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isFavourite, setIsFavourite] = useState(false);

  // Mock activity provider data
  const mockProvider = {
    id: 1,
    title: 'Sri Lanka Adventure Tours',
    subtitle: 'Thrilling Experiences Across the Island',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4',
    contact: {
      phone: '+94 76 543 2100',
      email: 'bookings@sladventures.lk',
      address: 'No.45, Beach Road, Hikkaduwa, Sri Lanka',
    },
    activities: [
      'Whale Watching',
      'Surfing Lessons',
      'Jungle Safaris',
      'Scuba Diving',
      'White Water Rafting',
      'Rock Climbing',
      'Hot Air Ballooning'
    ],
    operatingHours: '6:00 AM - 10:00 PM',
    policies: [
      'Free cancellation up to 48 hours before activity',
      'Safety equipment provided',
      'Certified instructors',
      'Group discounts available'
    ]
  };

  // Activity images for the horizontal gallery
  const activityImages = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945",
    "https://images.unsplash.com/photo-1510894347714-16b4b4768b2d",
    "https://images.unsplash.com/photo-1582034986517-30d163aa1da9",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4",
    "https://images.unsplash.com/photo-1551632811-561732d1e306",
  ];

  // Adventure activities data
  const adventureActivities = [
    {
      id: 1,
      name: 'Whale Watching',
      description: 'Experience majestic blue whales off the coast of Mirissa with expert guides',
      price: 'LKR 12,000',
      rating: 4.8,
      duration: '4 hours',
      difficulty: 'Easy',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
    },
    {
      id: 2,
      name: 'Surfing Lessons',
      description: 'Learn to surf with professional instructors at Hikkaduwa Beach',
      price: 'LKR 8,000',
      rating: 4.6,
      duration: '2 hours',
      difficulty: 'Beginner',
      image: 'https://images.unsplash.com/photo-1510894347714-16b4b4768b2d',
    },
    {
      id: 3,
      name: 'Jungle Safari',
      description: 'Explore Yala National Park with experienced trackers to spot leopards',
      price: 'LKR 15,000',
      rating: 4.9,
      duration: 'Full day',
      difficulty: 'Moderate',
      image: 'https://images.unsplash.com/photo-1582034986517-30d163aa1da9',
    },
    {
      id: 4,
      name: 'Scuba Diving',
      description: 'Discover coral reefs and marine life with PADI certified instructors',
      price: 'LKR 18,000',
      rating: 4.7,
      duration: '3 hours',
      difficulty: 'Intermediate',
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4',
    },
  ];

  // Reviews data with animated progress bars
  const reviewData = {
    excellent: 82,
    veryGood: 72,
    average: 28,
    poor: 8,
    terrible: 3,
  };

  // Activity ratings data
  const activityRatings = {
    safety: 95,
    equipment: 88,
    instructors: 92,
    value: 85,
    experience: 90,
  };

  // Animated values for review progress bars
  const [progressAnimations] = useState({
    excellent: new Animated.Value(0),
    veryGood: new Animated.Value(0),
    average: new Animated.Value(0),
    poor: new Animated.Value(0),
    terrible: new Animated.Value(0),
  });

  // Animated values for activity ratings
  const animatedWidths = {
    safety: useRef(new Animated.Value(0)).current,
    equipment: useRef(new Animated.Value(0)).current,
    instructors: useRef(new Animated.Value(0)).current,
    value: useRef(new Animated.Value(0)).current,
    experience: useRef(new Animated.Value(0)).current,
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

    // Animate activity ratings
    const activityAnimations = Object.entries(activityRatings).map(([key, val]) => {
      return Animated.timing(animatedWidths[key as keyof typeof activityRatings], {
        toValue: val,
        duration: 1000,
        useNativeDriver: false,
      });
    });

    // Start animations
    Animated.stagger(100, reviewAnimations).start();
    Animated.stagger(150, activityAnimations).start();
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
    const message = 'Check out Sri Lanka Adventure Tours!';
    if (Platform.OS === 'android') {
      ToastAndroid.show('Sharing Activity Provider', ToastAndroid.SHORT);
    } else {
      Alert.alert('Share', message);
    }
  };

  const handleActivityPress = (activity: typeof adventureActivities[0]) => {
    Alert.alert(
      activity.name,
      `${activity.description}\n\nPrice: ${activity.price}\nDuration: ${activity.duration}\nDifficulty: ${activity.difficulty}\nRating: ${activity.rating}⭐`,
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

  // Activity rating progress bar
  const renderActivityProgressBar = (label: string, value: number, animatedValue: Animated.Value) => (
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

  return (
    <>
      <SafeAreaView className="bg-white">
        <HeaderSection 
          title="Sri Lanka Adventure Tours"
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
            {activityImages.map((img, index) => (
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
        <View className="bg-white rounded-xl">
          <View className="flex-row p-4">
            <View className="bg-primary rounded-full w-16 h-16 items-center justify-center mr-4">
              <Text className="text-white text-2xl font-bold">4.9</Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-800 mb-1">Customer Reviews</Text>
              <Text className="text-sm text-gray-600">Based on 342 reviews</Text>
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

        {/* Activity Description */}
        <View className="p-5">
          <Text className="text-3xl font-bold text-primary mb-4">About Our Adventures</Text>
          <Text
            className="text-lg leading-6 text-gray-500 font-semibold"
            numberOfLines={showFullDescription ? undefined : 3}
          >
            Sri Lanka Adventure Tours offers unforgettable experiences across the island's diverse landscapes. 
            From whale watching in the Indian Ocean to jungle safaris in Yala National Park, our certified 
            guides ensure safe and thrilling adventures. We prioritize sustainable tourism and provide 
            top-quality equipment for all activities.
          </Text>
        
          <TouchableOpacity onPress={() => setShowFullDescription(!showFullDescription)}>
            <Text className="text-teal-600 mt-2 font-medium">
              {showFullDescription ? 'Show less' : 'Show more'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Activities Offered */}
        <View className="px-4 mb-6">
          <Text className="text-3xl font-bold text-gray-500 mb-4">Adventure Activities</Text>
          <View className="flex-row flex-wrap">
            {mockProvider.activities.map((activity, index) => (
              <View key={index} className="w-1/2 mb-3">
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={20} color="#008080" />
                  <Text className="ml-2 text-gray-700">{activity}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Activity Policies */}
        <View className="px-4 mb-6">
          <Text className="text-3xl font-bold text-gray-500 mb-4">Activity Policies</Text>
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

        {/* Popular Adventures */}
        <View className="px-4 mb-6">
          <Text className="text-3xl font-bold text-gray-500 mb-6">Popular Adventures</Text>
          <FlatList
            data={adventureActivities}
            renderItem={({ item }) => (
              <ActivityCard 
                item={item} 
                onPress={() => router.push('../explore/ActivityDetailView')}
              />
            )}
            keyExtractor={item => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
          />
        </View>

        {/* Activity Ratings */}
        <View className="px-4 mb-6">
          <Text className="text-3xl font-semibold text-gray-500 mb-4">Activity Ratings</Text>
          <View className="bg-white rounded-xl p-4 shadow-sm">
            {renderActivityProgressBar('Safety', activityRatings.safety, animatedWidths.safety)}
            {renderActivityProgressBar('Equipment', activityRatings.equipment, animatedWidths.equipment)}
            {renderActivityProgressBar('Instructors', activityRatings.instructors, animatedWidths.instructors)}
            {renderActivityProgressBar('Value', activityRatings.value, animatedWidths.value)}
            {renderActivityProgressBar('Experience', activityRatings.experience, animatedWidths.experience)}
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
                placeholder="Share your adventure experience..."
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
              <Text className="text-primary text-lg font-bold">Report Safety Concern</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </>
  );
};

export default ActivityView;