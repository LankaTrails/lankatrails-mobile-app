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
import { Ionicons } from '@expo/vector-icons';

const TravelApp = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [searchText, setSearchText] = useState('');

  const tabs = ['All', 'Accommodation', 'Foods', 'Transportation'];

  const accommodationData = [
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

  const foodsData = [
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

  const transportData = [
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

  interface RenderCardProps {
    item: CardItem;
    index: number;
  }

  const renderCard = (item: CardItem, index: number): JSX.Element => (
    <TouchableOpacity
      key={item.id}
      className="bg-white rounded-xl shadow-sm mr-4 mb-4"
      style={{ width: 160 }}
    >
      <Image
        source={{ uri: item.image }}
        className="w-full h-24 rounded-t-xl"
        resizeMode="cover"
      />
      <View className="p-3"></View>
        <Text className="text-sm font-medium text-gray-800 mb-1" numberOfLines={1}>
          {item.title}
        </Text>
        <Text className="text-xs text-gray-500 mb-2" numberOfLines={1}>
          {item.subtitle}
        </Text>
    </TouchableOpacity>
  );

  interface CardItem {
    id: number;
    title: string;
    subtitle: string;
    rating: number;
    image: string;
  }

  interface RenderSectionProps {
    title: string;
    data: CardItem[];
  }

  const renderSection = (title: RenderSectionProps['title'], data: RenderSectionProps['data']) => (
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

  const getDataForTab = () => {
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
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
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
                activeTab === tab ? 'bg-teal-600' : 'bg-gray-100'
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
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {activeTab === 'All' ? (
          <>
            {renderSection('Accommodation', accommodationData)}
            {renderSection('Foods', foodsData)}
            {renderSection('Transport', transportData)}
          </>
        ) : (
          <View className="mt-4">
            {renderSection(activeTab, getDataForTab())}
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      {/* <View className="bg-white border-t border-gray-100 px-4 py-3">
        <View className="flex-row justify-around items-center">
          <TouchableOpacity className="items-center py-2">
            <View className="bg-teal-600 p-2 rounded-lg">
              <Ionicons name="home" size={20} color="white" />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity className="items-center py-2">
            <Ionicons name="search" size={24} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity className="items-center py-2">
            <Ionicons name="restaurant" size={24} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity className="items-center py-2">
            <Ionicons name="person" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View> */}
    </SafeAreaView>
  );
};

export default TravelApp;