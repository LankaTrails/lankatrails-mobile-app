import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  ToastAndroid,
  Platform,
  Alert
} from 'react-native';
import { Heart, Share, ArrowLeft, Star } from 'lucide-react-native';
import TripCard from '@/components/TripCard';
import { router } from 'expo-router';
const { width } = Dimensions.get('window');

const GalleApp = () => {
  const [loading, setLoading] = useState(true);
  const [isFavourite, setIsFavourite] = useState(false);
  const fadeInValue = useRef(new Animated.Value(0)).current;
  const slideInValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
      startAnimations();
    }, 1000);
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeInValue, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideInValue, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const AnimatedCard = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
    const cardFade = new Animated.Value(0);
    const cardSlide = new Animated.Value(0.2);

    useEffect(() => {
      if (!loading) {
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(cardFade, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(cardSlide, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]).start();
        }, delay);
      }
    }, [loading, delay]);

    return (
      <Animated.View
        style={{
          opacity: cardFade,
          transform: [{ translateY: cardSlide }],
        }}
      >
        {children}
      </Animated.View>
    );
  };

  const RestaurantCard = ({
    name,
    rating,
    location,
    delay,
  }: {
    name: string;
    rating: string;
    location: string;
    delay?: number;
  }) => {
    const [pressed, setPressed] = useState(false);
    const pressScale = new Animated.Value(1);

    const handlePressIn = () => {
      setPressed(true);
      Animated.spring(pressScale, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      setPressed(false);
      Animated.spring(pressScale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    return (
      <AnimatedCard delay={delay}>
        <TouchableOpacity
          // onPressIn={handlePressIn}
          // onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          <Animated.View
            className="bg-white rounded-xl shadow-sm mr-4 w-50"
            style={{
              transform: [{ scale: pressScale }],
            }}
          >
            <View className="h-40  bg-pink-200 rounded-t-xl relative overflow-hidden mr-3">
              <View className="absolute inset-0 bg-gradient-to-br from-orange-300/30 to-pink-300/30" />
              <View className="absolute bottom-2 left-2">
                <View className="w-8 h-8 bg-white/20 rounded-full" />
              </View>
            </View>
            <View className="p-3">
              <Text className="font-semibold text-primary text-xl mb-1">{name}</Text>
              <Text className="text-10 text-gray-500 mb-2">{location}</Text>
              <View className="flex-row items-center">
                <Star size={16} color="#FBB03B" fill="#FBB03B" />
                <Text className="text-s text-gray-600 ml-1">{rating}</Text>
              </View>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </AnimatedCard>
    );
  };

  type ReviewCardProps = {
    name: string;
    location: string;
    review: string;
    delay?: number;
  };

  const ReviewCard = ({ name, location, review, delay }: ReviewCardProps) => (
    <AnimatedCard delay={delay}>
      <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
        <View className="flex-row items-center mb-3">
          <View className="w-12 h-12 bg-teal-100 rounded-full mr-3 items-center justify-center">
            <Text className="text-teal-600 font-semibold">{name.charAt(0)}</Text>
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-primary text-xl">{name}</Text>
            <Text className="text-sm text-gray-500">{location}</Text>
          </View>
        </View>
        <Text className="text-gray-700 text-sm leading-5 mb-3">"{review}"</Text>
        <View className="flex-row">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} color="#FBB03B" fill="#FBB03B" />
          ))}
        </View>
      </View>
    </AnimatedCard>
  );
      // loading view
  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Animated.View
          style={{
            transform: [
              {
                rotate: fadeInValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
          }}
        >
          <View className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full" />
        </Animated.View>
        <Text className="text-primary mt-4 font-medium">Loading...</Text>
      </View>
    );
  }

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
    const message = 'Check out this amazing place in Galle!';   
    if (Platform.OS === 'android') {
      ToastAndroid.show('Sharing is not implemented yet', ToastAndroid.SHORT);
    } else {
      Alert.alert('Sharing is not implemented yet');
    }
    };


  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#0D9488" />
      {/* Header */}
      <View 
        className="bg-gray-50 pt-12 pb-4"
        // style={{
        //   opacity: fadeInValue,
        //   transform: [{ translateY: slideInValue }],
        // }}
      >
        <View className="flex-row items-center justify-between mt-5 mb-2 px-4">
          <TouchableOpacity onPress={() => router.push('/explore')}>
            <ArrowLeft size={34} color="#008080"  />
          </TouchableOpacity>
          <Text className="text-primary text-3xl font-bold">Galle</Text>
          <View className="flex-row">
            <TouchableOpacity className="mr-4" onPress={handleFavourite}>
              <Heart size={30} color="#008080" fill={isFavourite ? '#008080' : 'none'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare}>
              <Share size={30} color="#008080"  />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View
        //   style={{
        //     opacity: fadeInValue,
        //     transform: [{ scale: scaleValue }],
        //   }}
        >
          <View className="bg-white mx-4 mt-4 rounded-xl shadow-sm overflow-hidden ">
            <View className="h-96 bg-gradient-to-br from-blue-400 relative">
              <View className="absolute inset-0 bg-teal-600/40" />
              <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/30 to-transparent h-20" />
          <Image
            source={{ uri: "https://images.squarespace-cdn.com/content/v1/5a3bb03b4c326d76de73ddaa/9732566d-6b33-4a1a-ba0c-1b73ed8848a4/The+Common+Wanderer-9888.jpg" }}
            style={{ width: '100%', height:350, borderRadius: 16 }}
            resizeMode="cover"
          />
            </View>
            <View className="p-4">
              <Text className="text-2xl font-bold text-gray-800 mb-2 justify-center mt-3 ml-3 mr-3">
                A Charming Coastal Gem in Sri Lanka
              </Text>
              <Text className="text-sm text-gray-600 leading-5">
                Galle, on Sri Lanka's southwest coast, is a popular tourist destination known for its historic charm and scenic beauty. The iconic Galle Fort, a UNESCO World Heritage Site, boasts colonial architecture, cobblestone streets, and ocean views. Visitors enjoy beaches like Unawatuna and Jungle Beach, whale watching, turtle hatcheries, and local cuisine. With its blend of history, culture, and seaside relaxation, Galle offers a memorable travel experience.
              </Text>
            </View>
            <ScrollView>
          {/* <TripCard
               id={1}
               title="Sample Trip"
               details="A wonderful trip to Sri Lanka's most beautiful places."
               budget={"Rs. 50,000"}
               duration={"5 Days"}
             /> */}
        </ScrollView>
          </View>
        </View>

        {/* Navigation Tabs */}
        <AnimatedCard delay={200}>
          <View className="flex-row justify-between px-4 my-6">
            {['All', 'Accommodation', 'Foods', 'Transportation', 'Activities'].map((tab, index) => (
              <TouchableOpacity
                key={tab}
                className={`py-2 px-3 rounded-full ${
                  index === 0 ? 'bg-teal-600' : 'bg-white'
                }`}
              >
                <Text
                  className={`text-lg font-medium ${
                    index === 0 ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </AnimatedCard>

        {/* Accommodation Section */}
        <View className="mb-6">
          <AnimatedCard delay={300}>
            <View className="flex-row items-center justify-between px-4 mb-4">
              <Text className="text-xl font-bold text-gray-800">Accommodation</Text>
              <TouchableOpacity>
                <Text className="text-primary font-medium">See more →</Text>
              </TouchableOpacity>
            </View>
          </AnimatedCard>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-4">
            <RestaurantCard 
              name="New sigiri restaurant" 
              rating="4.9" 
              location="Near to sigiri rock"
              delay={400}
            />
            <RestaurantCard 
              name="New sigiri restaurant" 
              rating="4.5" 
              location="Near to sigiri rock"
              delay={500}
            />
            <RestaurantCard 
              name="New sigiri restaurant" 
              rating="4.7" 
              location="Near to sigiri rock"
              delay={600}
            />
          </ScrollView>
        </View>

        {/* Foods Section */}
        <View className="mb-6">
          <AnimatedCard delay={700}>
            <View className="flex-row items-center justify-between px-4 mb-4">
              <Text className="text-xl font-bold text-gray-800">Foods</Text>
              <TouchableOpacity>
                <Text className="text-teal-600 font-medium">See more →</Text>
              </TouchableOpacity>
            </View>
          </AnimatedCard>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-4">
            <RestaurantCard 
              name="New sigiri restaurant" 
              rating="4.4" 
              location="Near to sigiri rock"
              delay={800}
            />
            <RestaurantCard 
              name="New sigiri restaurant" 
              rating="4.9" 
              location="Near to sigiri rock"
              delay={900}
            />
            <RestaurantCard 
              name="New sigiri restaurant" 
              rating="4.6" 
              location="Near to sigiri rock"
              delay={1000}
            />
          </ScrollView>
        </View>

        {/* Transport Section */}
        <View className="mb-6">
          <AnimatedCard delay={1100}>
            <View className="flex-row items-center justify-between px-4 mb-4">
              <Text className="text-lg font-bold text-gray-800">Transport</Text>
              <TouchableOpacity>
                <Text className="text-teal-600 font-medium">See more →</Text>
              </TouchableOpacity>
            </View>
          </AnimatedCard>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-4">
            <RestaurantCard 
              name="New sigiri restaurant" 
              rating="4.9" 
              location="Near to sigiri rock"
              delay={1200}
            />
            <RestaurantCard 
              name="New sigiri restaurant" 
              rating="4.3" 
              location="Near to sigiri rock"
              delay={1300}
            />
          </ScrollView>
        </View>

        {/* Reviews Section */}
        <View className="mb-6">
          <AnimatedCard delay={1400}>
            <View className="px-4 mb-4">
              <Text className="text-xl font-bold text-gray-800">Reviews</Text>
            </View>
          </AnimatedCard>
          
          <View className="px-4">
            <ReviewCard
              name="Meera"
              location="Singapore"
              review="Well-preserved fort, lots of boutique shops, and great ocean views. It can get a bit crowded during peak season, but it's still worth the visit."
              delay={1500}
            />
            <ReviewCard
              name="Meera"
              location="Singapore"
              review="Well-preserved fort, lots of boutique shops, and great ocean views. It can get a bit crowded during peak season, but it's still worth the visit."
              delay={1600}
            />
          </View>

          <AnimatedCard delay={1700}>
            <TouchableOpacity className="mx-4 mt-4 bg-primary py-4 rounded-xl">
              <Text className="text-white text-center font-semibold">View all</Text>
            </TouchableOpacity>
          </AnimatedCard>
        </View>

        <View className="h-20" />
      </ScrollView>

      
    </View>
  );
};

export default GalleApp;


// import { PageTransition, StaggeredListItem, LoadingSkeleton } from '@/components/transitions/animations';
// import React, { useState } from 'react';
// import { Text, SafeAreaView } from 'react-native';

// export default function AnotherScreen() {
//   const [visible, setVisible] = useState(true);

//   return (
//     <SafeAreaView className="flex-1 bg-white">
//       <PageTransition animationType="scaleIn" isVisible={visible}>
//         <StaggeredListItem index={0} delay={100}>
//           <Text className="text-xl mt-60 font-bold px-4">Hello World</Text>
//         </StaggeredListItem>
//       </PageTransition>
//     </SafeAreaView>
//   );
// }