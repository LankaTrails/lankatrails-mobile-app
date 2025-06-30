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
  SafeAreaView,
  FlatList
} from 'react-native';
import { ArrowLeft, Star, MapPin, Phone, Clock, Wifi, Coffee, Utensils } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const AccommodationFoodsTransportView = () => {
  const { tab } = useLocalSearchParams();
  const [activeView, setActiveView] = useState(tab || 'accommodation');
  const [loading, setLoading] = useState(false);
  const fadeInValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Set initial tab from URL parameter
    if (tab) {
      setActiveView(tab);
    }
    
    // Animate in when component mounts
    Animated.timing(fadeInValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [tab]);

  const getTitle = () => {
    switch (activeView) {
      case 'accommodation':
        return 'Accommodation';
      case 'foods':
        return 'Foods';
      case 'transport':
        return 'Transport';
      default:
        return 'Accommodation';
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'accommodation':
        return <Text className="text-center text-lg">Accommodation Content</Text>;
      case 'foods':
        return <Text className="text-center text-lg">Foods Content</Text>;
      case 'transport':
        return <Text className="text-center text-lg">Transport Content</Text>;
      default:
        return null;
    }
  };

  const accommodationData = [
    {
      id: 1,
      name: "Galle Fort Hotel",
      rating: "4.8",
      location: "Inside Galle Fort",
      price: "Rs. 15,000",
      image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400",
      amenities: ["Wifi", "Pool", "Restaurant"],
      phone: "+94 91 223 2870"
    },
    // ... rest of your data
  ];

  // ... rest of your component code (AnimatedCard, AccommodationCard, etc.)

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      
      <Animated.View 
        className="flex-1"
        style={{ opacity: fadeInValue }}
      >
        {/* Header */}
        <View className="bg-white shadow-sm">
          <View className="px-4 py-6">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity 
                onPress={() => router.back()}
                className="flex-row items-center"
              >
                <ArrowLeft size={24} color="#0D9488" />
              </TouchableOpacity>
              <Text className="text-xl font-bold text-gray-800">{getTitle()}</Text>
              <View className="w-6" />
            </View>
          </View>

          {/* Tab Navigation */}
          <View className="flex-row border-b border-gray-200">
            <TouchableOpacity
              onPress={() => setActiveView('accommodation')}
              className={`flex-1 py-3 px-4 items-center ${
                activeView === 'accommodation' ? 'border-b-2 border-teal-600' : ''
              }`}
            >
              <Text className={`font-medium ${
                activeView === 'accommodation' ? 'text-teal-600' : 'text-gray-600'
              }`}>
                Accommodation
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setActiveView('foods')}
              className={`flex-1 py-3 px-4 items-center ${
                activeView === 'foods' ? 'border-b-2 border-teal-600' : ''
              }`}
            >
              <Text className={`font-medium ${
                activeView === 'foods' ? 'text-teal-600' : 'text-gray-600'
              }`}>
                Foods
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setActiveView('transport')}
              className={`flex-1 py-3 px-4 items-center ${
                activeView === 'transport' ? 'border-b-2 border-teal-600' : ''
              }`}
            >
              <Text className={`font-medium ${
                activeView === 'transport' ? 'text-teal-600' : 'text-gray-600'
              }`}>
                Transport
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View className="flex-1 pt-6">
          {renderContent()}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

export default AccommodationFoodsTransportView;

