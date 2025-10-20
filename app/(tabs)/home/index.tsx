// TravelApp.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
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

const { width } = Dimensions.get("window");

interface Place {
  place_id: string;
  name: string;
  vicinity?: string;
  rating?: number;
  image?: string;
}

const TravelApp = () => {
  const [searchText, setSearchText] = useState("");
  const insets = useSafeAreaInsets();
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


  const trendingDestinations = [
    {
      id: 1,
      name: "Sigiriya Rock Fortress",
      location: "Dambulla",
      image:
        "https://images.unsplash.com/photo-1626697550561-8ff63f63683c?q=80&w=1000",
    },
    {
      id: 2,
      name: "Mirissa Beach",
      location: "Mirissa",
      image:
        "https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=1000",
    },
    {
      id: 3,
      name: "Yala National Park",
      location: "Hambantota",
      image:
        "https://images.unsplash.com/photo-1621135809414-8fba7ddfb616?q=80&w=1000",
    },
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
            className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center"
            onPress={() => setShowNotifications(true)}
          >
            <Ionicons name="notifications-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        <SearchBar onPress={() => {}} />
      </View>

      {/* Main Content */}
      <ScrollView
        className={`flex-1 ${showNotifications ? "opacity-60" : " "}`}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!showNotifications}
      >
        {/* Image Slider */}
        <View className="px-4 mb-6 w-full">
          <ImageSlider
            images={[
              "https://images.unsplash.com/photo-1646894232861-a0ad84f1ad5d?q=80&w=2071",
              "https://images.unsplash.com/photo-1591351373936-3d5bf044b854?q=80&w=1170",
              "https://admin.idaoffice.org/wp-content/uploads/2023/12/pexels-michael-swigunski-3825040.jpg",
            ]}
          />
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mb-6">
          {categories.map((cat, i) => (
            <TouchableOpacity key={i} className="bg-gray-100 px-4 py-2 mr-2 rounded-full">
              <Text className="text-gray-700 font-medium">{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Trending Destinations */}
        <View className="px-4 mb-6">
          <Text className="text-black text-3xl font-bold mb-4">Trending Destinations</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {trendingDestinations.map((place, index) => (
              <TouchableOpacity key={place.id} className="mr-4">
                <ImageBackground
                  source={{ uri: place.image }}
                  className="w-64 h-40 rounded-2xl overflow-hidden justify-end"
                >
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.6)"]}
                    className="w-full h-full justify-end p-4"
                  >
                    <Text className="text-white text-lg font-bold">{place.name}</Text>
                    <Text className="text-gray-200 text-sm">{place.location}</Text>
                  </LinearGradient>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Travel Tip + Weather Widget */}
        <View className="px-4 mb-6 flex-row justify-between">
          <View className="bg-blue-100 rounded-xl p-4 w-[48%]">
            <Text className="text-blue-700 font-bold mb-2">🌤 Weather</Text>
            <Text className="text-gray-700">Colombo</Text>
            <Text className="text-gray-500">28°C | Sunny</Text>
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

        {/* Plan Trip CTA */}
        <View className="mx-4 mb-8 rounded-2xl overflow-hidden">
          <LinearGradient colors={["#1D976C", "#93F9B9"]} className="p-6 items-center">
            <Text className="text-white text-2xl font-bold mb-4">
              Let&apos;s start the journey
            </Text>
            <TouchableOpacity
              className="bg-white rounded-full px-6 py-3 mb-2"
              onPress={() => router.push("../trips")}
            >
              <Text className="text-primary font-medium">Plan Trip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-white/20 rounded-full px-6 py-3"
              onPress={() => router.push("../explore")}
            >
              <Text className="text-white font-medium">Explore</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View className="px-4 mb-24">
          <Text className="text-center text-gray-400">LankaTrails © 2025</Text>
        </View>
      </ScrollView>

      {/* Notifications Modal */}
      {showNotifications && (
        <View className="absolute inset-0 justify-center items-center z-50">
          <TouchableOpacity
            className="absolute inset-0"
            onPress={() => setShowNotifications(false)}
            activeOpacity={1}
          />
          <View className="bg-white w-[90%] rounded-2xl p-4 shadow-lg">
            <Text className="text-3xl font-bold mb-6 text-black">Notifications</Text>
            <StaggeredListItem index={0} delay={400}>
              <View className="m-4">
                <Text className="text-lg text-black">🧳 Your saved trip to Kandy is waiting!</Text>
              </View>
              <View className="m-4">
                <Text className="text-lg text-black">🌍 New destination added: Trincomalee</Text>
              </View>
              <View className="m-4">
                <Text className="text-lg text-black">💸 Special offer: 20% off in Galle hotels</Text>
              </View>
            </StaggeredListItem>
            <TouchableOpacity
              className="mt-4 self-end bg-primary px-4 py-2 rounded-full"
              onPress={() => setShowNotifications(false)}
            >
              <Text className="text-white font-medium">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Enhanced Notifications Modal */}
     
    </View>
  );
};

export default TravelApp;