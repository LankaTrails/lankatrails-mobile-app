import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ScrollView, ActivityIndicator } from "react-native";
import { fetchGroupedPlaces } from "../../../services/googlePlacesService";
import Card from "../../../components/Card";

const GOOGLE_PLACES_API_KEY = 'AIzaSyA47Q-I515EK0DU4pvk5jgUcatYcdnf8cY';

// Define types for place and group
type Place = {
  place_id: string;
  name: string;
  vicinity: string;
  rating?: number | string;
  photos?: { photo_reference: string }[];
};

type PlaceGroup = {
  group: string;
  places: Place[];
};

export default function NearbyPlacesScreen() {
  const [groupedPlaces, setGroupedPlaces] = useState<PlaceGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const groups = await fetchGroupedPlaces(6.0329, 80.2168); // Galle coordinates
        setGroupedPlaces(groups);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 10 }}>
      {groupedPlaces.map(({ group, places }) => (
        <View key={group} style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            {group} ({places.length})
          </Text>
          {places.length > 0 ? (
            <FlatList
              data={places}
              keyExtractor={(item) => item.place_id}
              renderItem={({ item }) => (
                <Card
                  item={{
                    id: Number(item.place_id),
                    title: item.name,
                    subtitle: item.vicinity,
                    rating: typeof item.rating === "number" ? item.rating : (typeof item.rating === "string" ? Number(item.rating) : 0),
                    image: item.photos?.[0] 
                      ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${item.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
                      : "",
                  }}
                  onPress={() => console.log("Pressed:", item.name)}
                  width={180}
                />
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          ) : (
            <Text style={{ color: '#666' }}>No public places found in this category.</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
}


// // // import React, { useEffect, useRef } from 'react';
// // // import { Animated, Text, View } from 'react-native';
// // // import Card from '@/components/Card';

// // // interface FadeInViewProps {
// // //     style?: object;
// // //     children?: React.ReactNode;
// // // }

// // // const FadeInView: React.FC<FadeInViewProps> = (props) => {
// // //     const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value for opacity: 0

// // //     useEffect(() => {
// // //         Animated.timing(fadeAnim, {
// // //             toValue: 1,
// // //             duration: 1000,
// // //             useNativeDriver: true,
// // //         }).start();
// // //     }, [fadeAnim]);

// // //     return (
// // //         <Animated.View // Special animatable View
// // //             style={{
// // //                 ...props.style,
// // //                 opacity: fadeAnim, // Bind opacity to animated value
// // //             }}>
// // //             {props.children}
// // //         </Animated.View>
// // //     );
// // // };

// // // // You can then use your `FadeInView` in place of a `View` in your components:
// // // export default () => {
// // //     return (
// // //         <View
// // //             style={{
// // //                 flex: 1,
// // //                 alignItems: 'center',
// // //                 justifyContent: 'center',
// // //             }}>
// // //             <FadeInView
// // //                 >
// // //                <Text className="text-6xl font-bold">
// // //         <Text className="text-primary">Lanka</Text>
// // //         <Text className="text-secondary">Trails</Text>
// // //       </Text>
// // //             </FadeInView>
// // //             <Card/>
// // //         </View>
// // //     );
// // // };

// // import React from 'react';
// // import {
// //   ScrollView,
// //   Text,
// //   StyleSheet,
// //   View,
// //   ImageBackground,
// //   Animated,
// //   useWindowDimensions,
// //   useAnimatedValue,
// // } from 'react-native';
// // import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';

// // const images = new Array(6).fill(
// //   'https://images.unsplash.com/photo-1556740749-887f6717d7e4',
// // );

// // const App = () => {
// //   const scrollX = useAnimatedValue(0);

// //   const {width: windowWidth} = useWindowDimensions();

// //   return (
// //     <SafeAreaProvider>
// //       <SafeAreaView style={styles.container}>
// //         <View style={styles.scrollContainer}>
// //           <ScrollView
// //             horizontal={true}
// //             pagingEnabled
// //             showsHorizontalScrollIndicator={false}
// //             onScroll={Animated.event([
// //               {
// //                 nativeEvent: {
// //                   contentOffset: {
// //                     x: scrollX,
// //                   },
// //                 },
// //               },
// //             ])}
// //             scrollEventThrottle={1}>
// //             {images.map((image, imageIndex) => {
// //               return (
// //                 <View
// //                   style={{width: windowWidth, height: 250}}
// //                   key={imageIndex}>
// //                   <ImageBackground source={{uri: image}} style={styles.card}>
// //                     <View style={styles.textContainer}>
// //                       <Text style={styles.infoText}>
// //                         {'Image - ' + imageIndex}
// //                       </Text>
// //                     </View>
// //                   </ImageBackground>
// //                 </View>
// //               );
// //             })}
// //           </ScrollView>
// //           <View style={styles.indicatorContainer}>
// //             {images.map((image, imageIndex) => {
// //               const width = scrollX.interpolate({
// //                 inputRange: [
// //                   windowWidth * (imageIndex - 1),
// //                   windowWidth * imageIndex,
// //                   windowWidth * (imageIndex + 1),
// //                 ],
// //                 outputRange: [8, 16, 8],
// //                 extrapolate: 'clamp',
// //               });
// //               return (
// //                 <Animated.View
// //                   key={imageIndex}
// //                   style={[styles.normalDot, {width}]}
// //                 />
// //               );
// //             })}
// //           </View>
// //         </View>
// //       </SafeAreaView>
// //     </SafeAreaProvider>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //   },
// //   scrollContainer: {
// //     height: 300,
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //   },
// //   card: {
// //     flex: 1,
// //     marginVertical: 4,
// //     marginHorizontal: 16,
// //     borderRadius: 5,
// //     overflow: 'hidden',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //   },
// //   textContainer: {
// //     backgroundColor: 'rgba(0,0,0, 0.7)',
// //     paddingHorizontal: 24,
// //     paddingVertical: 8,
// //     borderRadius: 5,
// //   },
// //   infoText: {
// //     color: 'white',
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //   },
// //   normalDot: {
// //     height: 8,
// //     width: 8,
// //     borderRadius: 4,
// //     backgroundColor: 'silver',
// //     marginHorizontal: 4,
// //   },
// //   indicatorContainer: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //   },
// // });

// // export default App;

// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   Image,
//   TouchableOpacity,
//   Animated,
//   Dimensions,
//   StatusBar,
// } from 'react-native';
// import { Heart, Share, ArrowLeft, Star } from 'lucide-react-native';

// const { width } = Dimensions.get('window');

// const GalleApp = () => {
//   const [loading, setLoading] = useState(true);
//   const fadeInValue = new Animated.Value(0);
//   const slideInValue = new Animated.Value(50);
//   const scaleValue = new Animated.Value(0.8);

//   useEffect(() => {
//     // Simulate loading
//     setTimeout(() => {
//       setLoading(false);
//       startAnimations();
//     }, 1000);
//   }, []);

//   const startAnimations = () => {
//     Animated.parallel([
//       Animated.timing(fadeInValue, {
//         toValue: 1,
//         duration: 800,
//         useNativeDriver: true,
//       }),
//       Animated.timing(slideInValue, {
//         toValue: 0,
//         duration: 600,
//         useNativeDriver: true,
//       }),
//       Animated.timing(scaleValue, {
//         toValue: 1,
//         duration: 700,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   };

//   const AnimatedCard = ({ children, delay = 0 }) => {
//     const cardFade = new Animated.Value(0);
//     const cardSlide = new Animated.Value(30);

//     useEffect(() => {
//       if (!loading) {
//         setTimeout(() => {
//           Animated.parallel([
//             Animated.timing(cardFade, {
//               toValue: 1,
//               duration: 500,
//               useNativeDriver: true,
//             }),
//             Animated.timing(cardSlide, {
//               toValue: 0,
//               duration: 400,
//               useNativeDriver: true,
//             }),
//           ]).start();
//         }, delay);
//       }
//     }, [loading, delay]);

//     return (
//       <Animated.View
//         style={{
//           opacity: cardFade,
//           transform: [{ translateY: cardSlide }],
//         }}
//       >
//         {children}
//       </Animated.View>
//     );
//   };

//   const RestaurantCard = ({ name, rating, location, delay }) => {
//     const [pressed, setPressed] = useState(false);
//     const pressScale = new Animated.Value(1);

//     const handlePressIn = () => {
//       setPressed(true);
//       Animated.spring(pressScale, {
//         toValue: 0.95,
//         useNativeDriver: true,
//       }).start();
//     };

//     const handlePressOut = () => {
//       setPressed(false);
//       Animated.spring(pressScale, {
//         toValue: 1,
//         useNativeDriver: true,
//       }).start();
//     };

//     return (
//       <AnimatedCard delay={delay}>
//         <TouchableOpacity
//           onPressIn={handlePressIn}
//           onPressOut={handlePressOut}
//           activeOpacity={0.9}
//         >
//           <Animated.View
//             className="bg-white rounded-xl shadow-sm mr-4 w-40"
//             style={{
//               transform: [{ scale: pressScale }],
//             }}
//           >
//             <View className="h-24 bg-gradient-to-br from-orange-200 to-pink-200 rounded-t-xl relative overflow-hidden">
//               <View className="absolute inset-0 bg-gradient-to-br from-orange-300/30 to-pink-300/30" />
//               <View className="absolute bottom-2 left-2">
//                 <View className="w-8 h-8 bg-white/20 rounded-full" />
//               </View>
//             </View>
//             <View className="p-3">
//               <Text className="font-semibold text-primary text-sm mb-1">{name}</Text>
//               <Text className="text-xs text-gray-500 mb-2">{location}</Text>
//               <View className="flex-row items-center">
//                 <Star size={12} color="#FBB03B" fill="#FBB03B" />
//                 <Text className="text-xs text-gray-600 ml-1">{rating}</Text>
//               </View>
//             </View>
//           </Animated.View>
//         </TouchableOpacity>
//       </AnimatedCard>
//     );
//   };

//   const ReviewCard = ({ name, location, review, delay }) => (
//     <AnimatedCard delay={delay}>
//       <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
//         <View className="flex-row items-center mb-3">
//           <View className="w-12 h-12 bg-teal-100 rounded-full mr-3 items-center justify-center">
//             <Text className="text-teal-600 font-semibold">{name.charAt(0)}</Text>
//           </View>
//           <View className="flex-1">
//             <Text className="font-semibold text-primary">{name}</Text>
//             <Text className="text-sm text-gray-500">{location}</Text>
//           </View>
//         </View>
//         <Text className="text-gray-700 text-sm leading-5 mb-3">"{review}"</Text>
//         <View className="flex-row">
//           {[...Array(5)].map((_, i) => (
//             <Star key={i} size={14} color="#FBB03B" fill="#FBB03B" />
//           ))}
//         </View>
//       </View>
//     </AnimatedCard>
//   );

//   if (loading) {
//     return (
//       <View className="flex-1 bg-white items-center justify-center">
//         <Animated.View
//           style={{
//             transform: [
//               {
//                 rotate: fadeInValue.interpolate({
//                   inputRange: [0, 1],
//                   outputRange: ['0deg', '360deg'],
//                 }),
//               },
//             ],
//           }}
//         >
//           <View className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full" />
//         </Animated.View>
//         <Text className="text-primary mt-4 font-medium">Loading Galle...</Text>
//       </View>
//     );
//   }

//   return (
//     <View className="flex-1 bg-gray-50">
//       <StatusBar barStyle="light-content" backgroundColor="#0D9488" />
      
//       {/* Header */}
//       <Animated.View 
//         className="bg-primary pt-12 pb-4"
//         style={{
//           opacity: fadeInValue,
//           transform: [{ translateY: slideInValue }],
//         }}
//       >
//         <View className="flex-row items-center justify-between px-4">
//           <TouchableOpacity>
//             <ArrowLeft size={24} color="white" />
//           </TouchableOpacity>
//           <Text className="text-white text-xl font-bold">Galle</Text>
//           <View className="flex-row">
//             <TouchableOpacity className="mr-4">
//               <Heart size={24} color="white" />
//             </TouchableOpacity>
//             <TouchableOpacity>
//               <Share size={24} color="white" />
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Animated.View>

//       <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
//         {/* Hero Section */}
//         <Animated.View
//           style={{
//             opacity: fadeInValue,
//             transform: [{ scale: scaleValue }],
//           }}
//         >
//           <View className="bg-white mx-4 mt-4 rounded-xl shadow-sm overflow-hidden">
//             <View className="h-48 bg-gradient-to-br from-blue-400 to-primary relative">
//               <View className="absolute inset-0 bg-gradient-to-br from-blue-500/40 to-teal-600/40" />
//               <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/30 to-transparent h-20" />
//             </View>
//             <View className="p-4">
//               <Text className="text-lg font-bold text-gray-800 mb-2">
//                 A Charming Coastal Gem in Sri Lanka
//               </Text>
//               <Text className="text-sm text-gray-600 leading-5">
//                 Galle, on Sri Lanka's southwest coast, is a popular tourist destination known for its historic charm and scenic beauty. The iconic Galle Fort, a UNESCO World Heritage Site, boasts colonial architecture, cobblestone streets, and ocean views. Visitors enjoy beaches like Unawatuna and Jungle Beach, whale watching, turtle hatcheries, and local cuisine. With its blend of history, culture, and seaside relaxation, Galle offers a memorable travel experience.
//               </Text>
//             </View>
//           </View>
//         </Animated.View>

//         {/* Navigation Tabs */}
//         <AnimatedCard delay={200}>
//           <View className="flex-row justify-between px-4 my-6">
//             {['All', 'Accommodation', 'Foods', 'Transportation', 'Activities'].map((tab, index) => (
//               <TouchableOpacity
//                 key={tab}
//                 className={`py-2 px-3 rounded-full ${
//                   index === 0 ? 'bg-teal-600' : 'bg-white'
//                 }`}
//               >
//                 <Text
//                   className={`text-sm font-medium ${
//                     index === 0 ? 'text-white' : 'text-gray-600'
//                   }`}
//                 >
//                   {tab}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         </AnimatedCard>

//         {/* Accommodation Section */}
//         <View className="mb-6">
//           <AnimatedCard delay={300}>
//             <View className="flex-row items-center justify-between px-4 mb-4">
//               <Text className="text-lg font-bold text-gray-800">Accommodation</Text>
//               <TouchableOpacity>
//                 <Text className="text-primary font-medium">See more →</Text>
//               </TouchableOpacity>
//             </View>
//           </AnimatedCard>
          
//           <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-4">
//             <RestaurantCard 
//               name="New sigiri restaurant" 
//               rating="4.9" 
//               location="Near to sigiri rock"
//               delay={400}
//             />
//             <RestaurantCard 
//               name="New sigiri restaurant" 
//               rating="4.5" 
//               location="Near to sigiri rock"
//               delay={500}
//             />
//             <RestaurantCard 
//               name="New sigiri restaurant" 
//               rating="4.7" 
//               location="Near to sigiri rock"
//               delay={600}
//             />
//           </ScrollView>
//         </View>

//         {/* Foods Section */}
//         <View className="mb-6">
//           <AnimatedCard delay={700}>
//             <View className="flex-row items-center justify-between px-4 mb-4">
//               <Text className="text-lg font-bold text-gray-800">Foods</Text>
//               <TouchableOpacity>
//                 <Text className="text-teal-600 font-medium">See more →</Text>
//               </TouchableOpacity>
//             </View>
//           </AnimatedCard>
          
//           <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-4">
//             <RestaurantCard 
//               name="New sigiri restaurant" 
//               rating="4.4" 
//               location="Near to sigiri rock"
//               delay={800}
//             />
//             <RestaurantCard 
//               name="New sigiri restaurant" 
//               rating="4.9" 
//               location="Near to sigiri rock"
//               delay={900}
//             />
//             <RestaurantCard 
//               name="New sigiri restaurant" 
//               rating="4.6" 
//               location="Near to sigiri rock"
//               delay={1000}
//             />
//           </ScrollView>
//         </View>

//         {/* Transport Section */}
//         <View className="mb-6">
//           <AnimatedCard delay={1100}>
//             <View className="flex-row items-center justify-between px-4 mb-4">
//               <Text className="text-lg font-bold text-gray-800">Transport</Text>
//               <TouchableOpacity>
//                 <Text className="text-teal-600 font-medium">See more →</Text>
//               </TouchableOpacity>
//             </View>
//           </AnimatedCard>
          
//           <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-4">
//             <RestaurantCard 
//               name="New sigiri restaurant" 
//               rating="4.9" 
//               location="Near to sigiri rock"
//               delay={1200}
//             />
//             <RestaurantCard 
//               name="New sigiri restaurant" 
//               rating="4.3" 
//               location="Near to sigiri rock"
//               delay={1300}
//             />
//           </ScrollView>
//         </View>

//         {/* Reviews Section */}
//         <View className="mb-6">
//           <AnimatedCard delay={1400}>
//             <View className="px-4 mb-4">
//               <Text className="text-lg font-bold text-gray-800">Reviews</Text>
//             </View>
//           </AnimatedCard>
          
//           <View className="px-4">
//             <ReviewCard
//               name="Meera"
//               location="Singapore"
//               review="Well-preserved fort, lots of boutique shops, and great ocean views. It can get a bit crowded during peak season, but it's still worth the visit."
//               delay={1500}
//             />
//             <ReviewCard
//               name="Meera"
//               location="Singapore"
//               review="Well-preserved fort, lots of boutique shops, and great ocean views. It can get a bit crowded during peak season, but it's still worth the visit."
//               delay={1600}
//             />
//           </View>

//           <AnimatedCard delay={1700}>
//             <TouchableOpacity className="mx-4 mt-4 bg-primary py-4 rounded-xl">
//               <Text className="text-white text-center font-semibold">View all</Text>
//             </TouchableOpacity>
//           </AnimatedCard>
//         </View>

//         <View className="h-20" />
//       </ScrollView>

      
//     </View>
//   );
// };

// export default GalleApp;


// // import { PageTransition, StaggeredListItem, LoadingSkeleton } from '@/components/transitions/animations';
// // import React, { useState } from 'react';
// // import { Text, SafeAreaView } from 'react-native';

// // export default function AnotherScreen() {
// //   const [visible, setVisible] = useState(true);

// //   return (
// //     <SafeAreaView className="flex-1 bg-white">
// //       <PageTransition animationType="scaleIn" isVisible={visible}>
// //         <StaggeredListItem index={0} delay={100}>
// //           <Text className="text-xl mt-60 font-bold px-4">Hello World</Text>
// //         </StaggeredListItem>
// //       </PageTransition>
// //     </SafeAreaView>
// //   );
// // }