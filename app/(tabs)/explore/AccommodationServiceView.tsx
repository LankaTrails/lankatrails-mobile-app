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
import RoomCard, { RoomItem } from '@/components/explorer-components/Accommodation/RoomCard';
import Card from '@/components/Card';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AccommodationProviderCard from '@/components/explorer-components/Accommodation/AccommodationProviderCard';
import { Ionicons } from '@expo/vector-icons';
import { TextInput } from 'react-native';

const { width } = Dimensions.get('window');

const AccommodationView = () => {
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [userComplaint, setUserComplaint] = useState('');
  const [showFullDescription, setShowFullDescription] = useState(false);

  const mockProvider = {
    id: 1,
    title: 'Ocean View Resort',
    subtitle: 'Unawatuna Beach',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    contact: {
      phone: '+94 78 129 4800',
      email: 'reservations@oceanview.lk',
      address: 'No.12, Beach Road, Unawatuna, Sri Lanka',
    },
    amenities: ['Free WiFi', 'Swimming Pool', 'Spa', 'Restaurant', 'Air Conditioning'],
    checkInTime: '14:00',
    checkOutTime: '12:00',
    policies: [
      'Cancellation must be made 48 hours prior to arrival',
      'Children under 12 stay free',
      'Pets not allowed'
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

  // Hotel images for the horizontal gallery
  const hotelImages = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
  ];

  // Reviews data with animated progress bars
  const reviewData = {
    excellent: 78,
    veryGood: 65,
    average: 30,
    poor: 15,
    terrible: 5,
  };

  // Hotel ratings data
  const hotelRatings = {
    cleanliness: 92,
    comfort: 88,
    location: 95,
    facilities: 85,
    staff: 90,
  };

  // Room items data
  const roomItems: RoomItem[] = [
    {
      id: 1,
      name: 'Deluxe Ocean View',
      description: 'Spacious room with king bed and private balcony overlooking the ocean',
      price: 'LKR 15,000',
      rating: 4.7,
      capacity: '2 Adults',
      size: '35 sqm',
      image: { 
        uri: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' 
      },
    },
    {
      id: 2,
      name: 'Family Suite',
      description: 'Two-bedroom suite with living area, perfect for families',
      price: 'LKR 22,000',
      rating: 4.5,
      capacity: '4 Adults',
      size: '55 sqm',
      image: { 
        uri: 'https://images.unsplash.com/photo-1566669437685-5d13b12a1e1a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' 
      },
    },
    {
      id: 3,
      name: 'Standard Room',
      description: 'Comfortable room with garden view',
      price: 'LKR 10,000',
      rating: 4.2,
      capacity: '2 Adults',
      size: '28 sqm',
      image: { 
        uri: 'https://images.unsplash.com/photo-1591088398332-8a7791972803?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' 
      },
    },
    {
      id: 4,
      name: 'Beachfront Villa',
      description: 'Private villa with direct beach access and plunge pool',
      price: 'LKR 35,000',
      rating: 4.9,
      capacity: '2 Adults',
      size: '75 sqm',
      image: { 
        uri: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' 
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

  // Animated values for hotel ratings
  const animatedWidths = {
    cleanliness: useRef(new Animated.Value(0)).current,
    comfort: useRef(new Animated.Value(0)).current,
    location: useRef(new Animated.Value(0)).current,
    facilities: useRef(new Animated.Value(0)).current,
    staff: useRef(new Animated.Value(0)).current,
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

    // Animate hotel ratings
    const hotelAnimations = Object.entries(hotelRatings).map(([key, val]) => {
      return Animated.timing(animatedWidths[key as keyof typeof hotelRatings], {
        toValue: val,
        duration: 1000,
        useNativeDriver: false,
      });
    });

    // Start animations
    Animated.stagger(100, reviewAnimations).start();
    Animated.stagger(150, hotelAnimations).start();
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

  // Hotel rating progress bar
  const renderHotelProgressBar = (label: string, value: number, animatedValue: Animated.Value) => (
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
    const message = 'Check out Ocean View Resort in Unawatuna!';
    if (Platform.OS === 'android') {
      ToastAndroid.show('Sharing Ocean View Resort', ToastAndroid.SHORT);
    } else {
      Alert.alert('Share', message);
    }
  };

  const handleRoomPress = (item: RoomItem) => {
    Alert.alert(
      item.name,
      `${item.description}\n\nPrice: ${item.price}\nSize: ${item.size}\nCapacity: ${item.capacity}\nRating: ${item.rating}⭐`,
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
          title="Ocean View Resort"
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
            {hotelImages.map((img, index) => (
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
              <Text className="text-white text-2xl font-bold">4.8</Text>
            </View>
            <View className="flex-1 ">
              <Text className="text-lg font-semibold text-gray-800 mb-1">Guest Reviews</Text>
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

        {/* Location Map */}
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

        {/* Hotel Description */}
        <View className="p-5">
          <Text className="text-3xl font-bold text-primary mb-4">About the Property</Text>
          <Text
            className="text-lg leading-6 text-gray-500 font-semibold"
            numberOfLines={showFullDescription ? undefined : 3}
          >
            Ocean View Resort is a luxurious beachfront property offering breathtaking views of the Indian Ocean. 
            Our resort features spacious rooms with modern amenities, a large infinity pool, spa facilities, 
            and direct beach access. Located just steps away from Unawatuna Beach, we provide the perfect 
            blend of comfort and tropical paradise for your stay in Sri Lanka.
          </Text>
        
          <TouchableOpacity onPress={() => setShowFullDescription(!showFullDescription)}>
            <Text className="text-teal-600 mt-2 font-medium">
              {showFullDescription ? 'Show less' : 'Show more'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Amenities Section */}
        <View className="px-4 mb-6">
          <Text className="text-3xl font-bold text-gray-500 mb-4">Amenities</Text>
          <View className="flex-row flex-wrap">
            {mockProvider.amenities.map((amenity, index) => (
              <View key={index} className="w-1/2 mb-3">
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={20} color="#008080" />
                  <Text className="ml-2 text-gray-700">{amenity}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Hotel Policies */}
        <View className="px-4 mb-6">
          <Text className="text-3xl font-bold text-gray-500 mb-4">Hotel Policies</Text>
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <View className="flex-row justify-between mb-4">
              <Text className="font-semibold text-gray-700">Check-in:</Text>
              <Text className="text-gray-600">{mockProvider.checkInTime}</Text>
            </View>
            <View className="flex-row justify-between mb-4">
              <Text className="font-semibold text-gray-700">Check-out:</Text>
              <Text className="text-gray-600">{mockProvider.checkOutTime}</Text>
            </View>
            {mockProvider.policies.map((policy, index) => (
              <View key={index} className="flex-row mb-2">
                <Text className="text-gray-700">• {policy}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Available Rooms */}
        <View className="px-4 mb-6">
          <Text className="text-3xl font-bold text-gray-500 mb-6">Available Rooms</Text>
          <FlatList
            data={roomItems}
            renderItem={({ item }) => (
              <RoomCard 
  item={item} 
  onPress={() => router.push('../explore/AccommodationView')}
/>
            )}
            keyExtractor={item => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
          />
        </View>

        {/* Guest Reviews Section */}
        <View className="px-4 mb-6">
          <Text className="text-3xl font-bold text-gray-500 mb-4">Guest Reviews</Text>
          <View className="bg-white rounded-xl p-6 shadow-sm">
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

        {/* Hotel Ratings */}
        <View className="px-4 mb-6">
          <Text className="text-3xl font-semibold text-gray-500 mb-4">Hotel Ratings</Text>
          <View className="bg-white rounded-xl p-4 shadow-sm">
            {renderHotelProgressBar('Cleanliness', hotelRatings.cleanliness, animatedWidths.cleanliness)}
            {renderHotelProgressBar('Comfort', hotelRatings.comfort, animatedWidths.comfort)}
            {renderHotelProgressBar('Location', hotelRatings.location, animatedWidths.location)}
            {renderHotelProgressBar('Facilities', hotelRatings.facilities, animatedWidths.facilities)}
            {renderHotelProgressBar('Staff', hotelRatings.staff, animatedWidths.staff)}
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

export default AccommodationView;