import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Animated,
  TouchableOpacity,
  ToastAndroid,
  Alert,
  Linking,
  TextInput,
} from 'react-native';
import { Star, MapPin, Clock, Award, Languages, Phone, Mail, Calendar, ChevronLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const GuideDetailView = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isFavourite, setIsFavourite] = useState(false);

  // Sample guide data - in a real app you would fetch this based on the id
  const guideProfile = {
    id: id,
    name: "Sanjay Perera",
    title: "Certified Cultural Guide",
    rating: 4.9,
    reviews: 128,
    yearsExperience: 8,
    languages: ["English", "Sinhala", "Tamil"],
    specialties: ["Cultural Tours", "Historical Sites", "Local Cuisine"],
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a",
    about: "With over 8 years of experience, I specialize in bringing Sri Lanka's rich cultural heritage to life. My tours combine historical insights with authentic local experiences, from ancient temples to hidden culinary gems.",
    certifications: [
      "Sri Lanka Tourism Development Authority Certified",
      "World Federation of Tourist Guide Associations Member",
      "First Aid Certified"
    ],
    availability: "Monday to Saturday, 8:00 AM - 6:00 PM",
    contact: {
      phone: "+94 76 321 9876",
      email: "sanjay@culturaltours.lk",
      location: "Colombo, Sri Lanka"
    },
    pricing: {
      halfDay: "LKR 5,000",
      fullDay: "LKR 8,000",
      groupDiscount: "10% off for groups of 4+"
    }
  };

  const guideRatings = {
    knowledge: 98,
    communication: 95,
    professionalism: 97,
    flexibility: 90,
    value: 88,
  };

  // Animated values
  const animatedWidths = {
    knowledge: useRef(new Animated.Value(0)).current,
    communication: useRef(new Animated.Value(0)).current,
    professionalism: useRef(new Animated.Value(0)).current,
    flexibility: useRef(new Animated.Value(0)).current,
    value: useRef(new Animated.Value(0)).current,
  };

  useEffect(() => {
    // Animate rating bars
    Animated.stagger(150, [
      Animated.timing(animatedWidths.knowledge, {
        toValue: guideRatings.knowledge,
        duration: 1000,
        useNativeDriver: false
      }),
      Animated.timing(animatedWidths.communication, {
        toValue: guideRatings.communication,
        duration: 1000,
        useNativeDriver: false
      }),
      Animated.timing(animatedWidths.professionalism, {
        toValue: guideRatings.professionalism,
        duration: 1000,
        useNativeDriver: false
      }),
      Animated.timing(animatedWidths.flexibility, {
        toValue: guideRatings.flexibility,
        duration: 1000,
        useNativeDriver: false
      }),
      Animated.timing(animatedWidths.value, {
        toValue: guideRatings.value,
        duration: 1000,
        useNativeDriver: false
      })
    ]).start();
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
    setIsFavourite(!isFavourite);
    ToastAndroid.show(
      isFavourite ? 'Removed from favourites' : 'Added to favourites',
      ToastAndroid.SHORT
    );
  };

  const handleShare = () => {
    Linking.openURL(`https://wa.me/${guideProfile.contact.phone}?text=Hi ${guideProfile.name.split(' ')[0]}, I found your profile on TravelEase`);
  };

  const renderRatingBar = (label: string, value: number, animValue: Animated.Value) => (
    <View className="mb-4">
      <View className="flex-row justify-between mb-1">
        <Text className="text-gray-700 font-medium">{label}</Text>
        <Text className="text-gray-600">{value}%</Text>
      </View>
      <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <Animated.View 
          className="h-full bg-teal-500 rounded-full"
          style={{
            width: animValue.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          }}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Custom Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">{guideProfile.name}</Text>
        <View className="flex-row space-x-4">
          <TouchableOpacity onPress={handleFavourite}>
            <Ionicons 
              name={isFavourite ? "heart" : "heart-outline"} 
              size={24} 
              color={isFavourite ? "#FF0000" : "#333"} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare}>
            <Ionicons name="share-social-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
<HeaderSection 
        title={guideProfile.name}
        subtitle={guideProfile.title}
        isFavourite={isFavourite}
        handleFavourite={handleFavourite}
        handleShare={handleShare}
        onBack={() => router.back()}
      />
      <ScrollView className="flex-1 bg-gray-50 pb-6">
        {/* Profile Header */}
        <View className="items-center pt-6 pb-4 bg-white">
          <Image
            source={{ uri: guideProfile.image }}
            className="w-32 h-32 rounded-full mb-4 border-4 border-teal-500"
          />
          <Text className="text-primary font-medium">{guideProfile.title}</Text>
          <View className="flex-row items-center my-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={20}
                color="#FBB03B"
                fill={i < Math.floor(guideProfile.rating) ? "#FBB03B" : "none"}
              />
            ))}
            <Text className="ml-2 text-gray-600">({guideProfile.reviews})</Text>
          </View>
          <Text className="text-gray-500">{guideProfile.yearsExperience} years experience</Text>
        </View>

        {/* Contact Bar */}
        <View className="flex-row justify-around py-4 bg-white border-t border-b border-gray-100">
          <TouchableOpacity 
            className="items-center"
            onPress={() => Linking.openURL(`tel:${guideProfile.contact.phone}`)}
          >
            <Phone size={24} color="#008080" />
            <Text className="mt-1 text-gray-700">Call</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
              className="items-center"
              onPress={() => Linking.openURL(`https://wa.me/${guideProfile.contact.phone.replace(/^\+|\D/g, '')}?text=Hi ${guideProfile.name.split(' ')[0]}, I found your profile on TravelEase`)}
            >
              <Ionicons name="logo-whatsapp" size={24} color="#008080" />
              <Text className="mt-1 text-gray-700">WhatsApp</Text>
            </TouchableOpacity>
            
          <TouchableOpacity 
            className="items-center"
            onPress={() => router.push('../bookings')}
          >
            <Calendar size={24} color="#008080" />
            <Text className="mt-1 text-gray-700">Book</Text>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View className="p-5 bg-white mt-4">
          <Text className="text-2xl font-bold text-gray-800 mb-3">About</Text>
          <Text 
            className="text-gray-600 leading-6"
            numberOfLines={showFullDescription ? undefined : 3}
          >
            {guideProfile.about}
          </Text>
          <TouchableOpacity onPress={() => setShowFullDescription(!showFullDescription)}>
            <Text className="text-teal-600 mt-2 font-medium">
              {showFullDescription ? 'Show less' : 'Show more'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Details Sections */}
        <View className="mt-4 bg-white p-5">
          <Text className="text-2xl font-bold text-gray-800 mb-4">Details</Text>
          
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-700 mb-2">Specialties</Text>
            <View className="flex-row flex-wrap">
              {guideProfile.specialties.map((item, index) => (
                <View key={index} className="bg-teal-100 px-3 py-1 rounded-full mr-2 mb-2">
                  <Text className="text-teal-800">{item}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-700 mb-2">Languages</Text>
            <View className="flex-row flex-wrap">
              {guideProfile.languages.map((item, index) => (
                <View key={index} className="bg-blue-100 px-3 py-1 rounded-full mr-2 mb-2">
                  <Text className="text-blue-800">{item}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-700 mb-2">Certifications</Text>
            {guideProfile.certifications.map((item, index) => (
              <View key={index} className="flex-row items-start mb-2">
                <Award size={18} color="#008080" className="mt-1 mr-2" />
                <Text className="text-gray-600 flex-1">{item}</Text>
              </View>
            ))}
          </View>

          <View>
            <Text className="text-lg font-semibold text-gray-700 mb-2">Availability</Text>
            <View className="flex-row items-center">
              <Clock size={18} color="#008080" className="mr-2" />
              <Text className="text-gray-600">{guideProfile.availability}</Text>
            </View>
          </View>
        </View>

        {/* Pricing Section */}
        <View className="mt-4 bg-white p-5">
          <Text className="text-2xl font-bold text-gray-800 mb-4">Pricing</Text>
          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-700">Half Day (4 hours)</Text>
            <Text className="font-semibold text-gray-800">{guideProfile.pricing.halfDay}</Text>
          </View>
          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-700">Full Day (8 hours)</Text>
            <Text className="font-semibold text-gray-800">{guideProfile.pricing.fullDay}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-700">Group Discount</Text>
            <Text className="font-semibold text-gray-800">{guideProfile.pricing.groupDiscount}</Text>
          </View>
        </View>

        {/* Ratings Section */}
        <View className="mt-4 bg-white p-5">
          <Text className="text-2xl font-bold text-gray-800 mb-4">Ratings</Text>
          {renderRatingBar('Knowledge', guideRatings.knowledge, animatedWidths.knowledge)}
          {renderRatingBar('Communication', guideRatings.communication, animatedWidths.communication)}
          {renderRatingBar('Professionalism', guideRatings.professionalism, animatedWidths.professionalism)}
          {renderRatingBar('Flexibility', guideRatings.flexibility, animatedWidths.flexibility)}
          {renderRatingBar('Value', guideRatings.value, animatedWidths.value)}
        </View>

        {/* Reviews Section */}
        <View className="mt-4 bg-white p-5 mb-48">
          <Text className="text-2xl font-bold text-gray-800 mb-4">Leave a Review</Text>
          
          <View className="mb-4">
            <Text className="text-gray-700 mb-2">Your Rating</Text>
            <View className="flex-row">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setUserRating(star)}>
                  <Star
                    size={28}
                    color={userRating >= star ? '#FBB03B' : '#E5E7EB'}
                    fill={userRating >= star ? '#FBB03B' : 'none'}
                    className="mr-1"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View className="mb-4">
            <Text className="text-gray-700 mb-2">Your Review</Text>
            <TextInput
              multiline
              placeholder="Share your experience with this guide..."
              value={userReview}
              onChangeText={setUserReview}
              className="border border-gray-300 rounded-lg p-3 text-gray-800"
              style={{ minHeight: 100 }}
            />
          </View>
          
          <TouchableOpacity
            onPress={handleSubmitReview}
            className="bg-teal-600 py-3 rounded-lg items-center"
          >
            <Text className="text-white font-medium">Submit Review</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default GuideDetailView;