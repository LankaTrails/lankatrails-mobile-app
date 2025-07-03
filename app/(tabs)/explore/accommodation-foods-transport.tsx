import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  SafeAreaView,
  FlatList,
  ScrollView,
} from 'react-native';
import { ArrowLeft, Star } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { fetchGroupedPlaces } from '../../../services/googlePlacesService';
import Card from '../../../components/Card';

const { width } = Dimensions.get('window');
const GOOGLE_PLACES_API_KEY = 'AIzaSyA47Q-I515EK0DU4pvk5jgUcatYcdnf8cY';

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

const AccommodationFoodsTransportView = () => {
  const { tab } = useLocalSearchParams();
  const [activeView, setActiveView] = useState(tab || 'accommodation');
  const [groupedPlaces, setGroupedPlaces] = useState([]);
  const [loadingPlaces, setLoadingPlaces] = useState(true);
  const fadeInValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (tab) setActiveView(tab);

    Animated.timing(fadeInValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    const fetchPlaces = async () => {
      try {
        setLoadingPlaces(true);
        // const groups = await fetchGroupedPlaces(6.9271, 79.8612); // Colombo
        const groups = await fetchGroupedPlaces(7.2906, 80.6337); // Kandy coordinates

        setGroupedPlaces(groups);
      } catch (error) {
        console.error('Place fetch error:', error);
      } finally {
        setLoadingPlaces(false);
      }
    };

    fetchPlaces();
  }, [tab]);

  const getTitle = () => {
    switch (activeView) {
      case 'accommodation': return 'Accommodation';
      case 'foods': return 'Foods';
      case 'transport': return 'Transport';
      default: return 'Accommodation';
    }
  };

  const getCurrentGroupPlaces = () => {
    return groupedPlaces.find(g => g.group.toLowerCase() === activeView.toLowerCase())?.places || [];
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <Animated.View className="flex-1" style={{ opacity: fadeInValue }}>
        {/* Header */}
        <View className="bg-white shadow-sm">
          <View className="px-4 py-6 mt-9">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity onPress={() => router.back()} className="flex-row items-center">
                <ArrowLeft size={36} color="#0D9488" />
              </TouchableOpacity>
              <Text className="text-3xl font-bold text-gray-800">{getTitle()}</Text>
              <View className="w-6" />
            </View>
          </View>

          {/* Tabs */}
          <View className="flex-row border-b border-gray-200">
            {['accommodation', 'foods', 'transport'].map((tabKey) => (
              <TouchableOpacity
                key={tabKey}
                onPress={() => setActiveView(tabKey)}
                className={`flex-1 py-3 px-4 items-center ${
                  activeView === tabKey ? 'border-b-2 border-teal-600' : ''
                }`}
              >
                <Text
                  className={`font-medium ${
                    activeView === tabKey ? 'text-teal-600' : 'text-gray-600'
                  }`}
                >
                  {tabKey.charAt(0).toUpperCase() + tabKey.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Filtered Tab Content */}
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {loadingPlaces ? (
            <Text className="text-center text-gray-500">Loading places...</Text>
          ) : (
            <View>
              <Text className="text-lg font-bold mb-2 capitalize">
                {activeView} ({getCurrentGroupPlaces().length})
              </Text>
              {getCurrentGroupPlaces().length > 0 ? (
                <FlatList 
                  data={getCurrentGroupPlaces()}
                  keyExtractor={(item) => item.place_id}
                  renderItem={({ item }) => (
                    <Card
                      item={{
                        id: Number(item.place_id),
                        title: item.name,
                        subtitle: item.vicinity,
                        rating:
                          typeof item.rating === 'number'
                            ? item.rating
                            : typeof item.rating === 'string'
                            ? parseFloat(item.rating)
                            : 0,
                        image:
                          item.photos?.[0]
                            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${item.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
                            : '',
                      }}
                      onPress={() => console.log('Pressed:', item.place_id)}
                      width={180}
                    />
                  )}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                />
              ) : (
                <Text className="text-gray-500">No places found in this category.</Text>
              )}
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

export default AccommodationFoodsTransportView;
