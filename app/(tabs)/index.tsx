// import React, { useEffect, useRef } from 'react';
// import { Animated, Text, View } from 'react-native';

// interface FadeInViewProps {
//     style?: object;
//     children?: React.ReactNode;
// }

// const FadeInView: React.FC<FadeInViewProps> = (props) => {
//     const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value for opacity: 0

//     useEffect(() => {
//         Animated.timing(fadeAnim, {
//             toValue: 1,
//             duration: 1000,
//             useNativeDriver: true,
//         }).start();
//     }, [fadeAnim]);

//     return (
//         <Animated.View // Special animatable View
//             style={{
//                 ...props.style,
//                 opacity: fadeAnim, // Bind opacity to animated value
//             }}>
//             {props.children}
//         </Animated.View>
//     );
// };

// // You can then use your `FadeInView` in place of a `View` in your components:
// export default () => {
//     return (
//         <View
//             style={{
//                 flex: 1,
//                 alignItems: 'center',
//                 justifyContent: 'center',
//             }}>
//             <FadeInView
//                 >
//                <Text className="text-6xl font-bold">
//         <Text className="text-primary">Lanka</Text>
//         <Text className="text-secondary">Trails</Text>
//       </Text>
//             </FadeInView>
//         </View>
//     );
// };
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  StatusBar,
  SafeAreaView,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TravelApp = () => {
  const [searchText, setSearchText] = useState('');
  const insets = useSafeAreaInsets();

  const destinations = [
    {
      id: 1,
      name: 'Sigiriya',
      description: 'Ancient rock fortress with stunning views',
      image: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=400&h=300&fit=crop',
      rating: 4.8,
    },
    {
      id: 2,
      name: 'Kandy',
      description: 'Cultural capital with beautiful temples',
      image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=300&fit=crop',
      rating: 4.7,
    },
  ];

  const popularPlaces = [
    {
      id: 1,
      name: 'Nine Arch Bridge',
      location: 'Ella',
      image: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=200&h=150&fit=crop',
    },
    {
      id: 2,
      name: 'Temple of Tooth',
      location: 'Kandy',
      image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=200&h=150&fit=crop',
    },
    {
      id: 3,
      name: 'Galle Fort',
      location: 'Galle',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=150&fit=crop',
    },
    {
      id: 4,
      name: 'Adam\'s Peak',
      location: 'Ratnapura',
      image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200&h=150&fit=crop',
    },
  ];

  return (
    <View className="flex-1 bg-white">
      {/* Status Bar */}
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="transparent" 
        translucent={true}
      />
      
      {/* Safe Area for Status Bar */}
      <View 
        style={{ 
          height: insets.top,
          backgroundColor: '#ffffff'
        }} 
      />
      
      {/* Main Content */}
      <View className="flex-1">
        {/* Header */}
        <View className="px-4 pt-4 pb-2 bg-white">
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-primary text-2xl font-bold">Hello, Sarah</Text>
              <Text className="text-black text-lg font-semibold">Where do you want to go?</Text>
            </View>
            <TouchableOpacity className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
              <Ionicons name="notifications-outline" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View className="flex-row items-center bg-gray-50 rounded-lg px-4 py-3 mb-4 shadow-sm">
            <Ionicons name="search-outline" size={20} color="#666" />
            <TextInput
              className="flex-1 ml-3 text-gray-700"
              placeholder="Search your destination"
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Featured Destinations */}
          <View className="px-4 mb-6">
            {destinations.map((destination) => (
              <TouchableOpacity
                key={destination.id}
                className="mb-4 rounded-2xl overflow-hidden shadow-sm"
                style={{ elevation: 2 }}
              >
                <Image
                  source={{ uri: destination.image }}
                  className="w-full h-48"
                  resizeMode="cover"
                />
                <View className="absolute bottom-0 left-0 right-0 bg-black/30 p-4">
                  <Text className="text-white text-xl font-bold mb-1">
                    {destination.name}
                  </Text>
                  <Text className="text-white/90 text-sm mb-2">
                    {destination.description}
                  </Text>
                  <View className="flex-row items-center">
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text className="text-white ml-1 text-sm font-medium">
                      {destination.rating}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Popular Places */}
          <View className="px-4 mb-6">
            <Text className="text-black text-lg font-semibold mb-4">Popular Places</Text>
            <View className="flex-row flex-wrap justify-between">
              {popularPlaces.map((place) => (
                <TouchableOpacity
                  key={place.id}
                  className="w-[48%] mb-4 rounded-xl overflow-hidden shadow-sm"
                  style={{ elevation: 1 }}
                >
                  <Image
                    source={{ uri: place.image }}
                    className="w-full h-32"
                    resizeMode="cover"
                  />
                  <View className="p-3 bg-white">
                    <Text className="text-black font-medium text-sm mb-1">
                      {place.name}
                    </Text>
                    <Text className="text-gray-500 text-xs">{place.location}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Call to Action */}
          <View className="mx-4 mb-8 bg-gradient-to-r from-teal-400 to-blue-500 rounded-2xl p-6 items-center">
            <Text className="text-white text-lg font-semibold mb-2">
              Let's start the journey
            </Text>
            <TouchableOpacity className="bg-white rounded-full px-6 py-3 mb-2">
              <Text className="text-teal-600 font-medium">Plan Trip</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-white/20 rounded-full px-6 py-3">
              <Text className="text-white font-medium">Explore</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Branding */}
          <View className="mx-4 mb-8 items-center">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-teal-500 rounded-full items-center justify-center mr-2">
                <Text className="text-white font-bold text-sm">L</Text>
              </View>
              <Text className="text-teal-600 text-lg font-bold">LankaTrails</Text>
            </View>
            <Text className="text-gray-500 text-xs mt-1">Discover Sri Lanka</Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default TravelApp;