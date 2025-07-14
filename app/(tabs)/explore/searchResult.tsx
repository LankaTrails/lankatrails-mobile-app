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
  Alert,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { fetchGroupedPlaces } from '../../../services/googlePlacesService';
import { router } from 'expo-router';
import Card from '@/components/Card';
import HeaderSection from '@/components/explorer-components/HeaderSection';

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

const GalleApp = () => {
  const [loading, setLoading] = useState(true);
  const [groupedPlaces, setGroupedPlaces] = useState<PlaceGroup[]>([]);
  const [placesLoading, setPlacesLoading] = useState(true);
  const [isFavourite, setIsFavourite] = useState(false);
  const [selectedTab, setSelectedTab] = useState('All');
  const fadeInValue = useRef(new Animated.Value(0)).current;
  const mainFadeAnim = useRef(new Animated.Value(0)).current;
  const mainSlideAnim = useRef(new Animated.Value(40)).current;
const [favourites, setFavourites] = useState<Place[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
      Animated.timing(fadeInValue, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }, 1000);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setPlacesLoading(true);
        const groups = await fetchGroupedPlaces(6.0329, 80.2168);
        setGroupedPlaces(groups);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setPlacesLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(mainFadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(mainSlideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading]);

  const handleFavourite = (place: Place) => {
  setFavourites((prev) => {
    const exists = prev.find((p) => p.place_id === place.place_id);
    const updated = exists
      ? prev.filter((p) => p.place_id !== place.place_id)
      : [...prev, place];

    const message = exists ? 'Removed from favourites' : 'Added to favourites';
    Platform.OS === 'android'
      ? ToastAndroid.show(message, ToastAndroid.SHORT)
      : Alert.alert(message);
    return updated;
  });
};


  const handleShare = () => {
    Platform.OS === 'android'
      ? ToastAndroid.show('Sharing is not implemented yet', ToastAndroid.SHORT)
      : Alert.alert('Sharing is not implemented yet');
  };

  const AnimatedCard = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
    const cardFade = useRef(new Animated.Value(0)).current;
    const cardSlide = useRef(new Animated.Value(0.2)).current;

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
    }, [loading]);

    return (
      <Animated.View style={{ opacity: cardFade, transform: [{ translateY: cardSlide }] }}>
        {children}
      </Animated.View>
    );
  };

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

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar backgroundColor="#0D9488" />
      <View className="bg-gray-50 pt-12 pb-4">
        <HeaderSection
          title="Galle"
          isFavourite={isFavourite}
          handleFavourite={handleFavourite}
          handleShare={handleShare}
          onBack={() => router.back()}
        />
      </View>
      <Animated.View
        style={{
          flex: 1,
          opacity: mainFadeAnim,
          transform: [{ translateY: mainSlideAnim }],
        }}
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <View className="bg-white mx-4 mt-4 rounded-xl shadow-sm overflow-hidden">
            <Image
              source={{
                uri:
                  'https://images.squarespace-cdn.com/content/v1/5a3bb03b4c326d76de73ddaa/9732566d-6b33-4a1a-ba0c-1b73ed8848a4/The+Common+Wanderer-9888.jpg',
              }}
              style={{ width: '100%', height: 350, borderRadius: 16 }}
              resizeMode="cover"
            />
            <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/30 to-transparent h-20" />
            <View className="p-4">
              <Text className="text-3xl font-bold text-primary mt-4 mb-4">
                A Charming Coastal Gem in Sri Lanka
              </Text>
              <Text className="text-sm text-gray-600 leading-5">
                Galle, on Sri Lanka's southwest coast, is a popular tourist destination known for its
                historic charm and scenic beauty...
              </Text>
            </View>
          </View>

          
          {/* Tabs */}
          <AnimatedCard delay={200}>
            <View className="flex-row justify-between px-4 my-6">
              {['All', 'Accommodation', 'Foods', 'Transport', 'Activities','Public Places'].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  className={`py-2 px-3 rounded-full ${selectedTab === tab ? 'bg-teal-600' : 'bg-white'}`}
                  onPress={() => setSelectedTab(tab)}
                >
                  <Text className={`text-lg font-medium ${selectedTab === tab ? 'text-white' : 'text-gray-600'}`}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </AnimatedCard>

          {/* Sections */}
          {(() => {
            type SectionItem = {
              id: number;
              title: string;
              subtitle?: string;
              rating?: number;
              image?: string;
            };

           const sections: {
  title: string;
  delay: number;
  tab: string;
  items: SectionItem[];
}[] = [
  {
    title: 'Accommodation',
    delay: 300,
    tab: 'Accommodation',
    items: [
      {
        id: 1,
        title: 'New Sigiri Hotel',
        subtitle: 'Near Sigiriya Rock',
        rating: 4.9,
        image: 'https://images.squarespace-cdn.com/content/v1/5a3bb03b4c326d76de73ddaa/9732566d-6b33-4a1a-ba0c-1b73ed8848a4/The+Common+Wanderer-9888.jpg',
      },
      {
        id: 2,
        title: 'Palm Resort',
        subtitle: 'Galle Town',
        rating: 4.6,
        image: 'https://images.squarespace-cdn.com/content/v1/5a3bb03b4c326d76de73ddaa/9732566d-6b33-4a1a-ba0c-1b73ed8848a4/The+Common+Wanderer-9888.jpg',
      },
    ],
  },
  {
    title: 'Foods',
    delay: 700,
    tab: 'Foods',
    items: [
      {
        id: 3,
        title: 'Sea Breeze Cafe',
        subtitle: 'Unawatuna Beach',
        rating: 4.8,
        image: 'https://images.squarespace-cdn.com/content/v1/5a3bb03b4c326d76de73ddaa/9732566d-6b33-4a1a-ba0c-1b73ed8848a4/The+Common+Wanderer-9888.jpg',
      },
      {
        id: 4,
        title: 'Tropical Restaurant',
        subtitle: 'Fort Area',
        rating: 4.5,
        image: 'https://images.squarespace-cdn.com/content/v1/5a3bb03b4c326d76de73ddaa/9732566d-6b33-4a1a-ba0c-1b73ed8848a4/The+Common+Wanderer-9888.jpg',
      },
    ],
  },
  {
    title: 'Transport',
    delay: 1100,
    tab: 'Transport',
    items: [
      {
        id: 5,
        title: 'Tuk Tuk Service',
        subtitle: 'All Over Galle',
        rating: 4.3,
        image: 'https://images.squarespace-cdn.com/content/v1/5a3bb03b4c326d76de73ddaa/9732566d-6b33-4a1a-ba0c-1b73ed8848a4/The+Common+Wanderer-9888.jpg',
      },
      {
        id: 6,
        title: 'Galle Rent-A-Car',
        subtitle: 'Near Bus Station',
        rating: 4.4,
        image: 'https://images.squarespace-cdn.com/content/v1/5a3bb03b4c326d76de73ddaa/9732566d-6b33-4a1a-ba0c-1b73ed8848a4/The+Common+Wanderer-9888.jpg',
      },
    ],
  },
];

            const filtered = selectedTab === 'All' ? sections : sections.filter(s => s.tab === selectedTab);
            return filtered.map(section => (
              <View key={section.title} className="mb-6 px-4">
                <AnimatedCard delay={section.delay}>
                  <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-2xl font-bold text-gray-800/70">{section.title}</Text>
                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: '/explore/accommodation-foods-transport',
                          params: { tab: section.tab.toLowerCase() },
                        })
                      }
                    >
                      <Text className="text-primary font-medium">See more →</Text>
                    </TouchableOpacity>
                  </View>
                </AnimatedCard>
                <FlatList
                  data={section.items}
                  keyExtractor={item => item.id.toString()}
                  numColumns={2}
                  columnWrapperStyle={{ justifyContent: 'space-between' }}
                  renderItem={({ item }) => (
                    <Card
                      item={{
                        ...item,
                        subtitle: item.subtitle ?? '',
                        rating: item.rating ?? 0,
                      }}
                      width={(width - 48) / 2}
                      onPress={() => router.push('/explore/ServiceView')}
                    />
                  )}
                  contentContainerStyle={{ paddingBottom: 16 }}
                  scrollEnabled={false}
                />
              </View>
            ));
          })()}

          {/* Public Places Tab - FlatList, flattened, only when selected */}
          {selectedTab === 'Public Places' && (
            <View className="mb-6 px-4">
              <Text className="text-3xl font-bold text-primary mt-4 mb-4">Public Places</Text>
              {placesLoading ? (
                <ActivityIndicator size="small" />
              ) : (
                (() => {
                  // Flatten all places from all groups
                  const allPlaces = groupedPlaces.flatMap(g => g.places);
                  if (allPlaces.length === 0) {
                    return <Text style={{ color: '#666' }}>No public places found.</Text>;
                  }
                  return (
                    <FlatList
                      data={allPlaces}
                      keyExtractor={item => item.place_id}
                      numColumns={2}
                      columnWrapperStyle={{ justifyContent: 'space-between' }}
                      renderItem={({ item }) => (
                        <Card
                          item={{
                            id: Number(item.place_id),
                            title: item.name,
                            subtitle: item.vicinity,
                            rating: typeof item.rating === 'number'
                              ? item.rating
                              : typeof item.rating === 'string'
                              ? Number(item.rating)
                              : 0,
                            image: item.photos?.[0]
                              ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${item.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
                              : '',
                          }}
                          onPress={() => router.push('/explore/ServiceView')}
                          width={(width - 48) / 2}
                        />
                      )}
                      contentContainerStyle={{ paddingBottom: 16 }}
                      scrollEnabled={false}
                    />
                  );
                })()
              )}
            </View>
          )}
          <View className="h-20" />

        </ScrollView>
      </Animated.View>
    </View>
  );
};

export default GalleApp;
