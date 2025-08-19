import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import { 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  HomeIcon,
  UserGroupIcon,
  MapIcon,
  UserIcon 
} from 'react-native-heroicons/outline';
import SearchBar from '@/components/SearchBar';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

// Page Transition Component with multiple animation types
const PageTransition = ({
  children,
  animationType = 'fadeIn',
  isVisible = true,
}: {
  children: React.ReactNode;
  animationType?: 'fadeIn' | 'slideUp' | 'scaleIn' | 'bounceIn';
  isVisible?: boolean;
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // Reset all animations
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      scaleAnim.setValue(0.9);
      rotateAnim.setValue(0);

      // Choose animation based on type
      switch (animationType) {
        case 'fadeIn':
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }).start();
          break;

        case 'slideUp':
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
              toValue: 0,
              tension: 100,
              friction: 8,
              useNativeDriver: true,
            }),
          ]).start();
          break;

        case 'scaleIn':
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
              toValue: 1,
              tension: 150,
              friction: 6,
              useNativeDriver: true,
            }),
          ]).start();
          break;

        case 'bounceIn':
          fadeAnim.setValue(1);
          Animated.sequence([
            Animated.spring(scaleAnim, {
              toValue: 1.1,
              tension: 200,
              friction: 4,
              useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
              toValue: 1,
              tension: 200,
              friction: 8,
              useNativeDriver: true,
            }),
          ]).start();
          break;
      }
    }
  }, [isVisible, animationType]);

  const getAnimatedStyle = () => {
    switch (animationType) {
      case 'fadeIn':
        return { opacity: fadeAnim };
      
      case 'slideUp':
        return {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        };
      
      case 'scaleIn':
        return {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        };
      
      case 'bounceIn':
        return {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        };
      
      default:
        return { opacity: fadeAnim };
    }
  };

  return (
    <Animated.View style={[{ flex: 1 }, getAnimatedStyle()]}>
      {children}
    </Animated.View>
  );
};

// Staggered Animation Component for list items
const StaggeredListItem = ({
  children,
  delay = 0,
  index = 0,
}: {
  children: React.ReactNode;
  delay?: number;
  index?: number;
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    const animationDelay = delay + (index * 100); // 100ms stagger between items
    
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, animationDelay);
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      {children}
    </Animated.View>
  );
};

// Loading Skeleton Component
const LoadingSkeleton = () => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();
  }, []);

  return (
    <View className="px-4 py-4">
      <Animated.View 
        style={{ opacity: pulseAnim }}
        className="bg-gray-200 h-12 rounded-full mb-4"
      />
      <Animated.View 
        style={{ opacity: pulseAnim }}
        className="bg-gray-200 h-16 rounded-lg mb-4"
      />
      {[1, 2, 3].map((item) => (
        <Animated.View 
          key={item}
          style={{ opacity: pulseAnim }}
          className="bg-gray-200 h-12 rounded-lg mb-3"
        />
      ))}
    </View>
  );
};

const LocationSearchScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  const [pageVisible, setPageVisible] = useState(false);
  const router = useRouter();

  // Simulate page loading
  useEffect(() => {
    const loadTimer = setTimeout(() => {
      setIsLoading(false);
      setPageVisible(true);
    }, 1500);

    return () => clearTimeout(loadTimer);
  }, []);

  const recentSearches = [
    { id: 1, name: 'Ella', icon: '🏔️' },
    { id: 2, name: 'Kandy', icon: '🏛️' }
  ];

  type TabButtonProps = {
    id: string;
    icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
    isActive: boolean;
    onPress: () => void;
  };

  const TabButton = ({ id, icon: Icon, isActive, onPress }: TabButtonProps) => (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-1 items-center justify-center py-3 ${
        isActive 
          ? 'bg-teal-500 rounded-full mx-1' 
          : 'hover:bg-gray-100 rounded-full mx-1'
      }`}
      activeOpacity={0.7}
    >
      <Icon 
        size={24} 
        color={isActive ? 'white' : '#6B7280'} 
        strokeWidth={2}
      />
    </TouchableOpacity>
  );

  type RecentSearchItem = {
    id: number;
    name: string;
    icon: string;
  };

  const SearchItem = ({
    item,
    index,
  }: {
    item: RecentSearchItem;
    index: number;
  }) => (
    <StaggeredListItem index={index} delay={100}>
      <TouchableOpacity
        className="flex-row items-center justify-between py-4 px-4 hover:bg-gray-50 active:bg-gray-100"
        activeOpacity={0.8}
      >
        <View className="flex-row items-center flex-1">
          <Text className="text-2xl mr-3">{item.icon}</Text>
          <Text className="text-gray-800 text-l font-medium">{item.name}</Text>
        </View>
        <TouchableOpacity 
          className="p-2 hover:bg-gray-200 rounded-full "
          activeOpacity={0.6}
        >
          <Text className="text-gray-400 text-lg">×</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </StaggeredListItem>
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <LoadingSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white " >
      
      <PageTransition animationType="slideUp" isVisible={pageVisible}>
        {/* Header */}
        <StaggeredListItem index={0} delay={0}>
          <View className="px-4 pt-2 pb-4">
            <Text className="text-xs text-white text-right mb-4">1</Text>
            
            {/* Search Bar */}
            {/* <SearchBar onPress={() => router.push('/testing')} /> */}
            <View className="relative mt-5">
              <SearchBar onPress={() => router.push({ pathname: '../explore/searchResult' })} />
            </View>
          </View>
        </StaggeredListItem>

        {/* Nearby Section */}
        <StaggeredListItem index={1} delay={80}>
          <View className="px-4 mb-6">
            <TouchableOpacity 
              className="flex-row items-center hover:bg-gray-50 active:bg-gray-100 p-3 rounded-lg"
              activeOpacity={0.8}
              onPress={() => router.push({ pathname: '../explore/searchResult' })}

            >
              
              <TouchableOpacity
                className="bg-teal-100  p-5 rounded-lg mr-3"
                activeOpacity={0.8}   
              >
                <MapPinIcon size={30} color="#008080" strokeWidth={2} />
              </TouchableOpacity>
              <View className="flex-1">
                <Text className="text-gray-800 text-xl font-semibold">Nearby</Text>
              </View>
              <View className="flex-row items-center">
                <MapPinIcon size={16} color="#6B7280" strokeWidth={2} />
                <Text className="text-gray-500 text-lg ml-1">Galle</Text>
              </View>
            </TouchableOpacity>
          </View>
        </StaggeredListItem>

        {/* Recent Searches */}
        <View className="flex-1 px-4">
          <StaggeredListItem index={2} delay={150}>
            <Text className="text-gray-600 font-bold text-xl mb-4">Recent searches</Text>
          </StaggeredListItem>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            {recentSearches.map((item, index) => (
              <SearchItem key={item.id} item={item} index={index + 3} />
            ))}
            <TouchableOpacity
onPress={() => router.push('../explore/MapSelectorComponent')}
            >
              <Text>
            hiii
          </Text>
            </TouchableOpacity>
          </ScrollView>
          
        </View>

        {/* Bottom Navigation */}
        {/* <StaggeredListItem index={6} delay={300}>
          <View className="flex-row bg-white border-t border-gray-200 px-4 py-2 shadow-lg">
            <TabButton
              id="home"
              icon={HomeIcon}
              isActive={activeTab === 'home'}
              onPress={() => setActiveTab('home')}
            />
            <TabButton
              id="search"
              icon={MagnifyingGlassIcon}
              isActive={activeTab === 'search'}
              onPress={() => setActiveTab('search')}
            />
            <TabButton
              id="map"
              icon={MapIcon}
              isActive={activeTab === 'map'}
              onPress={() => setActiveTab('map')}
            />
            <TabButton
              id="profile"
              icon={UserIcon}
              isActive={activeTab === 'profile'}
              onPress={() => setActiveTab('profile')}
            />
          </View>
        </StaggeredListItem> */}
      </PageTransition>
    </SafeAreaView>
  );
};

export default LocationSearchScreen;