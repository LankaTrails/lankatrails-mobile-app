import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface CardItem {
  id: number;
  title: string;
  subtitle: string;
  rating: number;
  image: string;
}

const TravelApp = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [searchText, setSearchText] = useState('');
  const insets = useSafeAreaInsets();

  const tabs = ['All', 'Accommodation', 'Foods', 'Transportation'];

  const accommodationData: CardItem[] = [
    {
      id: 1,
      title: 'Nice Hotel restaurant',
      subtitle: 'Nice sight restaurant',
      rating: 4.4,
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=300&h=200&fit=crop&crop=center',
    },
    {
      id: 2,
      title: 'Nice sight restaurant',
      subtitle: 'Nice sight restaurant',
      rating: 4.4,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=200&fit=crop&crop=center',
    },
  ];

  const foodsData: CardItem[] = [
    {
      id: 1,
      title: 'Nice sight restaurant',
      subtitle: 'Nice sight restaurant',
      rating: 4.4,
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&h=200&fit=crop&crop=center',
    },
    {
      id: 2,
      title: 'Nice sight restaurant',
      subtitle: 'Nice sight restaurant',
      rating: 4.4,
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&h=200&fit=crop&crop=center',
    },
  ];

  const transportData: CardItem[] = [
    {
      id: 1,
      title: 'Airport Transfer',
      subtitle: 'Comfortable rides',
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300&h=200&fit=crop&crop=center',
    },
    {
      id: 2,
      title: 'City Tours',
      subtitle: 'Guided experiences',
      rating: 4.3,
      image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=300&h=200&fit=crop&crop=center',
    },
  ];

  const renderCard = (item: CardItem, index: number): JSX.Element => (
    <TouchableOpacity
      key={item.id}
      className="bg-white rounded-xl shadow-sm mr-4 mb-4"
      style={{ width: 160, elevation: 2 }}
    >
      <Image
        source={{ uri: item.image }}
        className="w-full h-24 rounded-t-xl"
        resizeMode="cover"
      />
      <View className="p-3">
        <Text className="text-sm font-medium text-gray-800 mb-1" numberOfLines={1}>
          {item.title}
        </Text>
        <Text className="text-xs text-gray-500 mb-2" numberOfLines={1}>
          {item.subtitle}
        </Text>
        <View className="flex-row items-center">
          <Ionicons name="star" size={12} color="#FFD700" />
          <Text className="text-xs text-gray-600 ml-1">{item.rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSection = (title: string, data: CardItem[]) => (
    <View className="mb-6">
      <Text className="text-lg font-semibold text-gray-800 mb-3 px-4">
        {title}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {data.map((item: CardItem, index: number) => renderCard(item, index))}
      </ScrollView>
    </View>
  );

  const getDataForTab = (): CardItem[] => {
    switch (activeTab) {
      case 'Accommodation':
        return accommodationData;
      case 'Foods':
        return foodsData;
      case 'Transportation':
        return transportData;
      default:
        return [...accommodationData, ...foodsData, ...transportData];
    }
  };

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
      
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <View className="w-2 h-2 bg-orange-500 rounded-full mr-2" />
            <Text className="text-xl font-bold text-gray-800">Let's Travel</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color="#374151" />
          </TouchableOpacity>
        </View>
        
        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-gray-700"
            placeholder="Search your favorite place"
            placeholderTextColor="#9CA3AF"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* Tabs */}
      <View className="bg-white">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full mr-3 ${
                activeTab === tab ? 'bg-primary' : 'bg-gray-100'
              }`}
            >
              <Text
                className={`font-medium ${
                  activeTab === tab ? 'text-white' : 'text-gray-600'
                }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
        {activeTab === 'All' ? (
          <View className="pt-4">
            {renderSection('Accommodation', accommodationData)}
            {renderSection('Foods', foodsData)}
            {renderSection('Transportation', transportData)}
          </View>
        ) : (
          <View className="pt-4">
            {renderSection(activeTab, getDataForTab())}
          </View>
        )}
      </ScrollView>

      
    </View>
  );
};

export default TravelApp;