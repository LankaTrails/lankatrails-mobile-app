import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

import { useNavigation } from '@react-navigation/native';

const TravelAppHome = () => {
  const navigation = useNavigation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [likedPlaces, setLikedPlaces] = useState(new Set<number>());
  const insets = useSafeAreaInsets();

  const heroImages = [
    "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=800&h=400&fit=crop",
    "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop",
  ];

  const quickActions = [
    { 
      id: 1, 
      icon: "compass-outline", 
      title: "Explore", 
      subtitle: "Discover new places", 
      color: "#008080" 
    },
    { 
      id: 2, 
      icon: "calendar-outline", 
      title: "Plan Trip", 
      subtitle: "Create itinerary", 
      color: "#20B2AA" 
    },
    { 
      id: 3, 
      icon: "camera-outline", 
      title: "Capture", 
      subtitle: "Save memories", 
      color: "#5F9EA0" 
    },
    { 
      id: 4, 
      icon: "navigate-outline", 
      title: "Navigate", 
      subtitle: "Get directions", 
      color: "#40E0D0",
      onpress: () => { navigation.push('explorer'); }
    }
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

  const notifications = [
    {
      id: 1,
      title: "Trip Reminder",
      message: "Your Kandy adventure starts in 3 days! Don't forget to pack your camera.",
      time: "2 hours ago",
      icon: "🎒",
      color: "#008080"
    },
    {
      id: 2,
      title: "New Photos Added",
      message: "Check out 15 stunning new photos from Sigiriya Rock Fortress.",
      time: "5 hours ago",
      icon: "🌟",
      color: "#20B2AA"
    },
    {
      id: 3,
      title: "Special Offer",
      message: "Save 20% on guided tours this weekend. Limited time offer!",
      time: "1 day ago",
      icon: "💫",
      color: "#40E0D0"
    },
    {
      id: 4,
      title: "Travel Buddy Request",
      message: "Alex wants to join your upcoming trip to Ella. View request.",
      time: "2 days ago",
      icon: "👥",
      color: "#5F9EA0"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const toggleLike = (placeId: number) => {
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

  const renderQuickAction = ({ item }: { item: typeof quickActions[0] }) => (
    <TouchableOpacity 
      style={{
        backgroundColor: item.color,
        borderRadius: 16,
        padding: 20,
        width: (width - 48) / 2,
        marginBottom: 16,
      }}
      activeOpacity={0.8}
      onPress={item.onpress}
    >
      <Ionicons name={item.icon as any} size={24} color="white" style={{ marginBottom: 12 }} />
      <Text style={{ fontSize: 18, fontWeight: '600', color: 'white', marginBottom: 4 }}>
        {item.title}
      </Text>
      <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)' }}>
        {item.subtitle}
      </Text>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }: { item: typeof categories[0] }) => (
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
  );

  const renderTrendingPlace = ({ item }: { item: Place }) => (
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
        
        {/* Like Button */}
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
          <Ionicons 
            name={likedPlaces.has(item.id) ? "heart" : "heart-outline"} 
            size={20} 
            color={likedPlaces.has(item.id) ? "#ef4444" : "#6b7280"} 
          />
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
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <View style={{ height: insets.top, backgroundColor: '#ffffff' }} />

      {/* Header */}
      <View style={{ backgroundColor: 'white', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <View>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 }}>
              Hello, Sarah 👋
            </Text>
            <Text style={{ fontSize: 16, color: '#6b7280' }}>
              Ready for your next adventure?
            </Text>
          </View>
          <View style={{ position: 'relative' }}>
            <TouchableOpacity 
              onPress={() => setShowNotifications(true)}
              style={{
                backgroundColor: '#f3f4f6',
                borderRadius: 24,
                padding: 12,
                position: 'relative',
              }}
            >
              <Ionicons name="notifications-outline" size={24} color="#6b7280" />
              <View style={{
                position: 'absolute',
                top: -2,
                right: -2,
                width: 16,
                height: 16,
                backgroundColor: '#ef4444',
                borderRadius: 8,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Text style={{ color: 'white', fontSize: 10, fontWeight: '600' }}>3</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          backgroundColor: searchFocused ? 'white' : '#f3f4f6',
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 16,
          marginBottom: 16,
          borderWidth: searchFocused ? 2 : 0,
          borderColor: searchFocused ? 'rgba(0,128,128,0.2)' : 'transparent',
        }}>
          <Ionicons name="search-outline" size={20} color="#6b7280" />
          <TextInput
            placeholder="Search destinations, experiences..."
            style={{ 
              flex: 1, 
              marginLeft: 12, 
              fontSize: 16,
              color: '#1f2937',
            }}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image Slider */}
        <View style={{ height: 240, marginHorizontal: 16, marginTop: 24, borderRadius: 24, overflow: 'hidden' }}>
          {heroImages.map((image, index) => (
            <View
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
                height: '40%',
                backgroundColor: 'rgba(0,0,0,0.4)',
              }} />
              <View style={{ position: 'absolute', bottom: 24, left: 24 }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 8 }}>
                  Discover Sri Lanka
                </Text>
                <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.9)' }}>
                  Where ancient meets paradise
                </Text>
              </View>
            </View>
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
        </View>

        {/* Quick Actions */}
        <View style={{ paddingHorizontal: 16, marginTop: 32 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 }}>
            Quick Actions
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {quickActions.map((action) => (
              <View key={action.id} style={{ width: (width - 48) / 2 }}>
                {renderQuickAction({ item: action })}
              </View>
            ))}
          </View>
        </View>

        {/* Categories */}
        <View style={{ marginTop: 32 }}>
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1f2937' }}>
              Explore by Category
            </Text>
          </View>
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          />
        </View>

        {/* Trending Destinations */}
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
            renderItem={renderTrendingPlace}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        </View>

        {/* Stats Section */}
        <View style={{ paddingHorizontal: 16, marginTop: 32, marginBottom: 32 }}>
          <View style={{
            borderRadius: 16,
            padding: 24,
            backgroundColor: '#008080', // Fallback for React Native
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
        <View>
          <Text style={{ fontSize: 16, color: '#ffffff', textAlign: 'center', marginBottom: 100 }}>
            © 2023 Lanka Trails. All rights reserved.
          </Text>   
        </View>
      </ScrollView>

      {/* Notifications Modal */}
      <Modal
        visible={showNotifications}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={{ 
          flex: 1, 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          justifyContent: 'center', 
          alignItems: 'center' 
        }}>
          <View style={{
            width: width * 0.9,
            maxHeight: '80%',
            backgroundColor: 'white',
            borderRadius: 16,
            overflow: 'hidden',
          }}>
            {/* Header */}
            <View style={{
              backgroundColor: '#008080', // Fallback
              paddingHorizontal: 24,
              paddingVertical: 16,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="notifications" size={20} color="white" />
                <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginLeft: 8 }}>
                  Notifications
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowNotifications(false)}
                style={{ padding: 4 }}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Notifications List */}
            <ScrollView style={{ maxHeight: 400 }}>
              {notifications.map((notification, index) => (
                <TouchableOpacity
                  key={notification.id}
                  style={{
                    flexDirection: 'row',
                    padding: 16,
                    borderBottomWidth: index < notifications.length - 1 ? 1 : 0,
                    borderBottomColor: '#f3f4f6',
                  }}
                >
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: `${notification.color}20`,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}>
                    <Text style={{ fontSize: 16 }}>{notification.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 4 }}>
                      {notification.title}
                    </Text>
                    <Text style={{ fontSize: 14, color: '#6b7280', lineHeight: 20, marginBottom: 4 }}>
                      {notification.message}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#008080', fontWeight: '500' }}>
                      {notification.time}
                    </Text>
                  </View>
                  <View style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#008080',
                    marginTop: 8,
                  }} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Footer */}
            <View style={{
              paddingHorizontal: 16,
              paddingVertical: 12,
              backgroundColor: '#f9fafb',
              borderTopWidth: 1,
              borderTopColor: '#f3f4f6',
            }}>
              <TouchableOpacity>
                <Text style={{
                  textAlign: 'center',
                  color: '#008080',
                  fontSize: 14,
                  fontWeight: '600',
                }}>
                  View All Notifications
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TravelAppHome;