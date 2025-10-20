import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Dimensions,
  StatusBar,
  Modal,
  FlatList,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SearchBar from '@/components/SearchBar';
import { useAuth } from '@/hooks/useAuth';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');

interface Place {
  id: number;
  name: string;
  location: string;
  image: string;
  rating: number;
  reviews: number;
  tags: string[];
  trending: boolean;
}

const TravelAppHome = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [likedPlaces, setLikedPlaces] = useState(new Set<number>());
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const searchAnim = useRef(new Animated.Value(1)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const notificationBadgeAnim = useRef(new Animated.Value(1)).current;
  const heroImageAnim = useRef(new Animated.Value(0)).current;
  const quickActionsAnim = useRef(new Animated.Value(0)).current;
  const categoriesAnim = useRef(new Animated.Value(0)).current;
  const trendingAnim = useRef(new Animated.Value(0)).current;

  const heroImages = [
    "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=800&h=400&fit=crop",
    "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop",
    "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=400&fit=crop"
  ];


  const trendingDestinations: Place[] = [
    {
      id: 1,
      name: "Sigiriya Rock Fortress",
      location: "Central Province",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop",
      rating: 4.8,
      reviews: 1234,
      tags: ["Ancient", "UNESCO"],
      trending: true
    },
    {
      id: 2,
      name: "Temple of the Tooth",
      location: "Kandy",
      image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=300&h=200&fit=crop",
      rating: 4.7,
      reviews: 892,
      tags: ["Sacred", "Culture"],
      trending: false
    },
    {
      id: 3,
      name: "Nine Arch Bridge",
      location: "Ella",
      image: "https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=300&h=200&fit=crop",
      rating: 4.6,
      reviews: 756,
      tags: ["Architecture", "Scenic"],
      trending: true
    },
    {
      id: 4,
      name: "Galle Fort",
      location: "Southern Province",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop",
      rating: 4.5,
      reviews: 634,
      tags: ["Colonial", "Coastal"],
      trending: false
    }
  ];

  const categories = [
    { id: 1, icon: "🏛️", name: "Historical", count: 45 },
    { id: 2, icon: "🏖️", name: "Beaches", count: 28 },
    { id: 3, icon: "🏔️", name: "Mountains", count: 32 },
    { id: 4, icon: "🌿", name: "Nature", count: 67 },
    { id: 5, icon: "🏙️", name: "Cities", count: 23 },
    { id: 6, icon: "🎭", name: "Culture", count: 41 }
  ];



  // Initial animations
  useEffect(() => {
    // Staggered entrance animations
    Animated.sequence([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(heroImageAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(quickActionsAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(categoriesAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(trendingAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Notification badge pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(notificationBadgeAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(notificationBadgeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  // Hero image slider with transitions
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Search focus animation
  const handleSearchFocus = () => {
    setSearchFocused(true);
    Animated.spring(searchAnim, {
      toValue: 1.02,
      useNativeDriver: true,
    }).start();
  };

  const handleSearchBlur = () => {
    setSearchFocused(false);
    Animated.spring(searchAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const toggleLike = (placeId: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setLikedPlaces(prev => {
      const newSet = new Set(prev);
      if (newSet.has(placeId)) {
        newSet.delete(placeId);
      } else {
        newSet.add(placeId);
      }
      return newSet;
    });
  };

  // Notification modal animations
  const showNotificationModal = () => {
    setShowNotifications(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideNotificationModal = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowNotifications(false);
      slideAnim.setValue(-50);
      fadeAnim.setValue(0);
    });
  };

  const renderQuickAction = ({ item, index }: { item: typeof quickActions[0], index: number }) => (
    <Animated.View
      style={{
        opacity: quickActionsAnim,
        transform: [{
          translateY: quickActionsAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [30, 0],
          })
        }]
      }}
    >
      <TouchableOpacity 
        style={{
          backgroundColor: item.color,
          borderRadius: 16,
          padding: 20,
          width: (width - 48) / 2,
          marginBottom: 16,
        }}
        activeOpacity={0.8}
        onPress={() => {
          // Add haptic feedback if available
          if (Platform.OS === 'ios') {
            // HapticFeedback.impactAsync(HapticFeedback.ImpactFeedbackStyle.Medium);
          }
        }}
      >
        <Ionicons name={item.icon as any} size={24} color="white" style={{ marginBottom: 12 }} />
        <Text style={{ fontSize: 18, fontWeight: '600', color: 'white', marginBottom: 4 }}>
          {item.title}
        </Text>
        <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)' }}>
          {item.subtitle}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderCategory = ({ item, index }: { item: typeof categories[0], index: number }) => (
    <Animated.View
      style={{
        opacity: categoriesAnim,
        transform: [{
          translateX: categoriesAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0],
          })
        }]
      }}
    >
      <TouchableOpacity 
        style={{
          backgroundColor: 'white',
          borderRadius: 16,
          padding: 16,
          marginRight: 16,
          minWidth: 120,
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
        activeOpacity={0.8}
      >
        <Text style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</Text>
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 4 }}>
          {item.name}
        </Text>
        <Text style={{ fontSize: 12, color: '#6b7280' }}>
          {item.count} places
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderTrendingPlace = ({ item, index }: { item: Place, index: number }) => (
    <Animated.View
      style={{
        opacity: trendingAnim,
        transform: [{
          translateY: trendingAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0],
          })
        }]
      }}
    >
      <TouchableOpacity 
        style={{
          backgroundColor: 'white',
          borderRadius: 16,
          marginBottom: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 5,
          overflow: 'hidden',
        }}
        activeOpacity={0.9}
      >
        <View style={{ position: 'relative' }}>
          <Image 
            source={{ uri: item.image }} 
            style={{ width: '100%', height: 180 }}
            resizeMode="cover"
          />
          
          {/* Like Button with Animation */}
          <TouchableOpacity
            onPress={() => toggleLike(item.id)}
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderRadius: 20,
              padding: 8,
            }}
          >
            <Animated.View
              style={{
                transform: [{
                  scale: likedPlaces.has(item.id) ? 1.2 : 1
                }]
              }}
            >
              <Ionicons 
                name={likedPlaces.has(item.id) ? "heart" : "heart-outline"} 
                size={20} 
                color={likedPlaces.has(item.id) ? "#ef4444" : "#6b7280"} 
              />
            </Animated.View>
          </TouchableOpacity>

          {/* Trending Badge */}
          {item.trending && (
            <View style={{
              position: 'absolute',
              top: 12,
              left: 12,
              backgroundColor: '#f59e0b',
              borderRadius: 12,
              paddingHorizontal: 8,
              paddingVertical: 4,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <Ionicons name="trending-up" size={12} color="white" style={{ marginRight: 4 }} />
              <Text style={{ color: 'white', fontSize: 10, fontWeight: '600' }}>Trending</Text>
            </View>
          )}
        </View>
        
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 }}>
            {item.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Ionicons name="location-outline" size={16} color="#6b7280" />
            <Text style={{ marginLeft: 4, fontSize: 14, color: '#6b7280' }}>
              {item.location}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="star" size={16} color="#fbbf24" />
              <Text style={{ marginLeft: 4, fontWeight: '600' }}>{item.rating}</Text>
              <Text style={{ color: '#6b7280', fontSize: 14, marginLeft: 4 }}>
                ({item.reviews} reviews)
              </Text>
            </View>
          </View>
          
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {item.tags.map((tag, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: 'rgba(0,128,128,0.1)',
                  borderRadius: 12,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  marginRight: 8,
                  marginBottom: 4,
                }}
              >
                <Text style={{ fontSize: 12, color: '#008080', fontWeight: '500' }}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <View style={{ height: insets.top, backgroundColor: '#ffffff' }} />

      {/* Header with Animation */}
      <Animated.View 
        style={{ 
          backgroundColor: 'white', 
          paddingHorizontal: 16, 
          paddingTop: 16, 
          paddingBottom: 8,
          opacity: headerAnim,
          transform: [{
            translateY: headerAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-20, 0],
            })
          }]
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <View>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 }}>
              Hello, {user?.firstName ?? 'Traveler'}!
            </Text>
            <Text style={{ fontSize: 16, color: '#6b7280' }}>
              Ready for your next adventure?
            </Text>
          </View>
          
        </View>

        {/* Search Bar with Animation */}
        <SearchBar/>  
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image Slider with Animation */}
        <Animated.View 
          style={{ 
            height: 240, 
            marginHorizontal: 16, 
            marginTop: 24, 
            borderRadius: 24, 
            overflow: 'hidden',
            opacity: heroImageAnim,
            transform: [{
              translateY: heroImageAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              })
            }]
          }}
        >
          {heroImages.map((image, index) => (
            <Animated.View
              key={index}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                opacity: index === currentSlide ? 1 : 0,
              }}
            >
              <Image source={{ uri: image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              <View style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '60%',
                backgroundColor: 'transparent',
              }} />
              <View style={{ position: 'absolute', bottom: 24, left: 24 }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 8 }}>
                  Discover Sri Lanka
                </Text>
                <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.9)' }}>
                  Where ancient meets paradise
                </Text>
              </View>
            </Animated.View>
          ))}
          
          {/* Slide Indicators */}
          <View style={{ 
            position: 'absolute', 
            bottom: 16, 
            right: 24, 
            flexDirection: 'row' 
          }}>
            {heroImages.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setCurrentSlide(index)}
                style={{
                  width: index === currentSlide ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: index === currentSlide ? 'white' : 'rgba(255,255,255,0.5)',
                  marginLeft: 8,
                }}
              />
            ))}
          </View>
        </Animated.View>

        {/* Quick Actions with Staggered Animation */}
        

        {/* Categories with Animation */}
        {/* <View style={{ marginTop: 32 }}>
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1f2937' }}>
              Explore by Category
            </Text>
          </View>
          <FlatList
            data={categories}
            renderItem={({ item, index }) => renderCategory({ item, index })}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          />
        </View> */}

        {/* Trending Destinations with Animation */}
        <View style={{ paddingHorizontal: 16, marginTop: 32 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1f2937' }}>
              Trending Now
            </Text>
            <TouchableOpacity>
              <Text style={{ fontSize: 16, color: '#008080', fontWeight: '600' }}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={trendingDestinations}
            renderItem={({ item, index }) => renderTrendingPlace({ item, index })}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        </View>

        {/* Stats Section */}
        <View style={{ paddingHorizontal: 16, marginTop: 32, marginBottom: 200 }}>
          <View style={{
            borderRadius: 16,
            padding: 24,
            backgroundColor: '#008080',
          }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center', color: 'white' }}>
              Your Journey So Far
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24 }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 32, fontWeight: 'bold', color: 'white' }}>12</Text>
                <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)' }}>Places Visited</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 32, fontWeight: 'bold', color: 'white' }}>5</Text>
                <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)' }}>Trips Planned</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 32, fontWeight: 'bold', color: 'white' }}>847</Text>
                <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)' }}>Photos Taken</Text>
              </View>
            </View>
            <TouchableOpacity style={{
              backgroundColor: 'white',
              paddingVertical: 12,
              borderRadius: 12,
              alignItems: 'center',
            }}>
              <Text style={{ color: '#008080', fontSize: 16, fontWeight: '600' }}>
                Plan Your Next Adventure
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Enhanced Notifications Modal */}
     
    </View>
  );
};

export default TravelAppHome;