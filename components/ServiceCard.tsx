import React, { Component } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
} from 'react-native';
import Card, { CardItem } from './Card';

interface ServiceCardProps {}

interface ServiceCardState {
  services: CardItem[];
}

export default class ServiceCard extends Component<ServiceCardProps, ServiceCardState> {
  constructor(props: ServiceCardProps) {
    super(props);
    this.state = {
      services: [
        {
          id: 1,
          title: 'Restaurant Booking',
          subtitle: 'Fine Dining',
          rating: 4.5,
          image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'
        },
        // {
        //   id: 2,
        //   title: 'Spa Treatment',
        //   subtitle: 'Wellness',
        //   rating: 4.8,
        //   image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400'
        // },
        // {
        //   id: 3,
        //   title: 'City Tour',
        //   subtitle: 'Sightseeing',
        //   rating: 4.3,
        //   image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400'
        // },
      ]
    };
  }

  handleCardPress = (item: CardItem) => {
    console.log('Card pressed:', item.title);
    // Handle card press logic here
  };

  renderCard = (item: CardItem) => (
    <Card
      key={item.id}
      item={item}
      onPress={this.handleCardPress}
    />
  );

  render() {
    const { services } = this.state;

    return (
      <View className="flex-1 bg-gray-50 p-4">
        <Text className="text-xl font-bold text-gray-800 mb-4">
          Our Services
        </Text>
        
        {/* Using ScrollView with horizontal scroll */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="mb-6"
        >
          {services.map(this.renderCard)}
        </ScrollView>

        {/* Alternative: Using FlatList */}
        <Text className="text-lg font-semibold text-gray-800 mb-3">
          Popular Services
        </Text>
        <FlatList
          data={services}
          renderItem={({ item }) => (
            <Card
              item={item}
              onPress={this.handleCardPress}
              width={180}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>
    );
  }
}