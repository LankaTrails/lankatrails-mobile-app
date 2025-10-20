// TravelApp.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  FlatList,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
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
  const insets = useSafeAreaInsets();
  const [likedPlaces, setLikedPlaces] = useState(new Set<number>());
  const [currentSlide, setCurrentSlide] = useState(0);
  const { user } = useAuth();
  
  // Animation values (kept for visual polish if desired)
  const headerAnim = useRef(new Animated.Value(0)).current;
  const heroImageAnim = useRef(new Animated.Value(0)).current;
  const quickActionsAnim = useRef(new Animated.Value(0)).current;
  const categoriesAnim = useRef(new Animated.Value(0)).current;
  const trendingAnim = useRef(new Animated.Value(0)).current;
  const collageAnim = useRef(new Animated.Value(0)).current;
  const summaryAnim = useRef(new Animated.Value(0)).current;
  const placesInfoAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;

  const heroImages = [
       "https://images.unsplash.com/photo-1550614795-00d4f7e5fed2?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
    "https://images.unsplash.com/photo-1552055568-e9943cd2a08f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjc0fHxzcmklMjBsYW5rYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=1000",
    "https://plus.unsplash.com/premium_photo-1661947939375-6d52ab549864?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687",
      "https://images.unsplash.com/photo-1604632217713-387c9f7bcac2?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1074",
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



  // A minimal quickActions array so renderQuickAction has data to work with.
  const quickActions = [
    { id: '1', icon: 'add', title: 'New Trip', subtitle: 'Start planning', color: '#1D976C' },
    { id: '2', icon: 'search', title: 'Explore', subtitle: 'Find places', color: '#2563EB' },
  ];

  // Entrance animations
  useEffect(() => {
    Animated.sequence([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(heroImageAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(collageAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(summaryAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(placesInfoAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Hero slider auto-advance
  useEffect(() => {
    const id = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(id);
  }, [heroImages.length]);



  const toggleLike = (placeId: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setLikedPlaces(prev => {
      const next = new Set(prev);
      if (next.has(placeId)) next.delete(placeId);
      else next.add(placeId);
      return next;
    });
  };



  const renderQuickAction = ({ item }: { item: typeof quickActions[0] }) => (
    <Animated.View
      style={{
        opacity: quickActionsAnim,
        transform: [{
          translateY: quickActionsAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] })
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
        onPress={() => { /* no-op */ }}
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

  const renderCategory = ({ item }: { item: typeof categories[0] }) => (
    <Animated.View
      style={{
        opacity: categoriesAnim,
        transform: [{
          translateX: categoriesAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] })
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

  // Simple trending place renderer
  const renderTrendingPlace = ({ item }: { item: Place }) => (
    <View
      style={{
        backgroundColor: 'white',
        borderRadius: 12,
        marginRight: 12,
        overflow: 'hidden',
        width: 240,
      }}
    >
      <Image source={{ uri: item.image }} style={{ width: '100%', height: 140 }} resizeMode="cover" />
      <View style={{ padding: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: '700' }}>{item.name}</Text>
        <Text style={{ fontSize: 12, color: '#6b7280' }}>{item.vicinity ?? 'Sri Lanka'}</Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <View style={{ height: insets.top, backgroundColor: '#ffffff' }} />

      <Animated.View
        style={{
          backgroundColor: 'white',
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 8,
          opacity: headerAnim,
          transform: [{
            translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] })
          }]
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 1 }}>
          <View>
            <Text style={{ fontSize: 36, fontWeight: 'bold', color: '#008080', marginBottom: 4 }}>
              Hello, {user?.firstName ?? 'Traveler'}!
            </Text>
            <Text style={{ fontSize: 16, color: '#6b7280' }}>
              Ready for your next adventure?
            </Text>
          </View>
          
        </View>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View
          style={{
            height: 240,
            marginHorizontal: 16,
            marginTop: 24,
            borderRadius: 24,
            overflow: 'hidden',
            opacity: heroImageAnim,
            transform: [{
              translateY: heroImageAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] })
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

          <View style={{ position: 'absolute', bottom: 16, right: 24, flexDirection: 'row' }}>
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

        

   {/* Places Around Sri Lanka Section */}
        <View style={{ marginHorizontal: 16, marginBottom: 32 }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#757575', marginBottom: 4, marginTop: 16 }}>
            Explore Sri Lanka
          </Text>
          <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>
            Discover the pearl of the Indian Ocean
          </Text>

          {/* Popular Places Grid */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {/* Sigiriya */}
            <TouchableOpacity 
              style={{ 
                width: '48%', 
                backgroundColor: 'white', 
                borderRadius: 16, 
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
              onPress={() => {
                router.push({
                  pathname: '/(tabs)/explore/search/results',
                  params: {
                    searchQuery: 'Sigiriya Rock Fortress',
                    location: 'Sigiriya',
                  },
                });
              }}
            >
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1612862862126-865765df2ded?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1074' }}
                style={{ width: '100%', height: 120, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
                resizeMode="cover"
              />
              <View style={{ padding: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#1f2937', marginBottom: 4 }}>
                  Sigiriya
                </Text>
                <Text style={{ fontSize: 12, color: '#6b7280' }}>
                  Ancient Rock Fortress
                </Text>
              </View>
            </TouchableOpacity>

            {/* Kandy */}
            <TouchableOpacity 
              style={{ 
                width: '48%', 
                backgroundColor: 'white', 
                borderRadius: 16, 
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
              onPress={() => {
                router.push({
                  pathname: '/(tabs)/explore/search/results',
                  params: {
                    searchQuery: 'Temple of the Sacred Tooth Relic',
                    location: 'Kandy',
                  },
                });
              }}
            >
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1562698013-ac13558052cd?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjN8fHNyaSUyMGxhbmthJTIwa2FuZHl8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=1000' }}
                style={{ width: '100%', height: 120, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
                resizeMode="cover"
              />
              <View style={{ padding: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#1f2937', marginBottom: 4 }}>
                  Kandy
                </Text>
                <Text style={{ fontSize: 12, color: '#6b7280' }}>
                  Cultural Capital
                </Text>
              </View>
            </TouchableOpacity>

            {/* Galle */}
            <TouchableOpacity 
              style={{ 
                width: '48%', 
                backgroundColor: 'white', 
                borderRadius: 16, 
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
              onPress={() => {
                router.push({
                  pathname: '/(tabs)/explore/search/results',
                  params: {
                    searchQuery: 'Galle Dutch Fort',
                    location: 'Galle',
                  },
                });
              }}
            >
              <Image 
                source={{ uri: 'https://images.unsplash.com/flagged/photo-1567498573339-688686a4b5df?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzh8fHNyaSUyMGxhbmthfGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=1000' }}
                style={{ width: '100%', height: 120, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
                resizeMode="cover"
              />
              <View style={{ padding: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#1f2937', marginBottom: 4 }}>
                  Galle
                </Text>
                <Text style={{ fontSize: 12, color: '#6b7280' }}>
                  Historic Dutch Fort
                </Text>
              </View>
            </TouchableOpacity>

            {/* Ella */}
            <TouchableOpacity 
              style={{ 
                width: '48%', 
                backgroundColor: 'white', 
                borderRadius: 16, 
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
              onPress={() => {
                router.push({
                  pathname: '/(tabs)/explore/search/results',
                  params: {
                    searchQuery: 'Nine Arch Bridge Ella',
                    location: 'Ella',
                  },
                });
              }}
            >
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1574611122955-5baa61496637?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8c3JpJTIwbGFua2F8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=1000' }}
                style={{ width: '100%', height: 120, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
                resizeMode="cover"
              />
              <View style={{ padding: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#1f2937', marginBottom: 4 }}>
                  Ella
                </Text>
                <Text style={{ fontSize: 12, color: '#6b7280' }}>
                  Hill Country Paradise
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Yala National Park - Full Width */}
          <TouchableOpacity 
            style={{ 
              backgroundColor: 'white', 
              borderRadius: 16, 
              marginBottom: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
            onPress={() => {
              router.push({
                pathname: '/(tabs)/explore/search/results',
                params: {
                  searchQuery: 'Yala National Park',
                  location: 'Yala National Park',
                },
              });
            }}
          >
            <Image 
              source={{ uri: 'https://media.istockphoto.com/id/1922703858/photo/minneriya-elephant-gathering.webp?a=1&b=1&s=612x612&w=0&k=20&c=CHu2uR4F6yGklQXDk87N2wwpCXFG356zjUn04VRwaHQ=' }}
              style={{ width: '100%', height: 160, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
              resizeMode="cover"
            />
            <View style={{ padding: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#1f2937', marginBottom: 4 }}>
                Yala National Park
              </Text>
              <Text style={{ fontSize: 14, color: '#6b7280' }}>
                Wildlife Safari & Leopard Spotting
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        

        <View style={{ marginHorizontal: 16, marginVertical: 32, borderRadius: 12, overflow: 'hidden', backgroundColor: '#008080', padding: 16 }}>
          <Text style={{ color: 'white', fontSize: 26, fontWeight: '700', marginBottom: 20 }}>Let's start the journey</Text>
          <View style={{ flexDirection: 'row', gap: 8}}>
            <TouchableOpacity style={{ backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999 }}
            onPress={() => router.push('/(tabs)/trips')}
            >
              <Text style={{ color: '#008080', fontWeight: '600' }}>Plan Trip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999 }}
                        onPress={() => router.push('/(tabs)/explore')}
>
              <Text style={{ color: 'white', fontWeight: '600' }}>Explore</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sri Lanka Photo Collage Section */}
        <View style={{ marginHorizontal: 16, marginBottom: 32 }}>
          <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#000000', marginBottom: 4 }}>
            Discover Sri Lanka's Beauty
          </Text>
          <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>
            From majestic elephants to stunning waterfalls
          </Text>
          
          <View style={{ height: 280, borderRadius: 16, overflow: 'hidden' }}>
            <View style={{ flexDirection: 'row', height: '50%', marginBottom: 4 }}>
              {/* Large image - Elephant */}
              <View style={{ flex: 2, marginRight: 4 }}>
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=400&h=200&fit=crop' }}
                  style={{ width: '100%', height: '100%', borderRadius: 12 }}
                  resizeMode="cover"
                />
                <View style={{ position: 'absolute', bottom: 8, left: 8 }}>
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: '600', textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 }}>
                    Yala National Park
                  </Text>
                </View>
              </View>
              
              {/* Waterfall */}
              <View style={{ flex: 1 }}>
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1609681980718-340e7f4b11d7?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=840' }}
                  style={{ width: '100%', height: '100%', borderRadius: 12 }}
                  resizeMode="cover"
                />
                <View style={{ position: 'absolute', bottom: 8, left: 8 }}>
                  <Text style={{ color: 'white', fontSize: 10, fontWeight: '600', textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 }}>
                    Waterfalls
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={{ flexDirection: 'row', height: '50%' }}>
              {/* Tea Plantations */}
              <View style={{ flex: 1, marginRight: 4 }}>
                <Image 
                  source={{ uri: 'https://media.istockphoto.com/id/2171108924/photo/tamil-women-plucking-tea-leaves-on-plantation-ceylon.jpg?s=612x612&w=is&k=20&c=qSYUbXgAb4u5GK1ApImqvJ0OQC8hEUayi6Rvxj3K7zo=' }}
                  style={{ width: '100%', height: '100%', borderRadius: 12 }}
                  resizeMode="cover"
                />
                <View style={{ position: 'absolute', bottom: 8, left: 8 }}>
                  <Text style={{ color: 'white', fontSize: 10, fontWeight: '600', textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 }}>
                    Tea Estates
                  </Text>
                </View>
              </View>
              
              {/* Ancient Sites */}
              <View style={{ flex: 2 }}>
                <Image 
                  source={{ uri: 'https://media.istockphoto.com/id/2169029490/photo/buddhism-father-and-son-praying.webp?a=1&b=1&s=612x612&w=0&k=20&c=YBPoQV4Uzouj9t88X4OP1wawpX5FSNztWQXSAmtY-ew=' }}
                  style={{ width: '100%', height: '100%', borderRadius: 12 }}
                  resizeMode="cover"
                />
                <View style={{ position: 'absolute', bottom: 8, left: 8 }}>
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: '600', textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 }}>
                    Ancient Temples
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Traveler Summary Section */}
        

        

        <View style={{ paddingHorizontal: 16, marginBottom: 100, alignItems: 'center',  }}>
          <View style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
            borderRadius: 30,
          }}>
            <Image 
              source={require('@/assets/images/logo-icon.jpg')}
              style={{ 
                width: 110, 
                height: 110, 
                borderRadius: 30,
                
              }}
              resizeMode="cover"
            />
          </View>
          <Text style={{ textAlign: 'center', color: '#9ca3af', marginTop: 12 }}>LankaTrails © 2025</Text>
        </View>
      </ScrollView>

      
    </View>
  );
};

export default TravelApp;

