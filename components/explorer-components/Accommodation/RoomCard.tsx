import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';

export interface RoomItem {
  id: number;
  name: string;
  description: string;
  price: string;
  rating: number;
  capacity: string;
  size: string;
  image: {
    uri: string;
  };
}

interface RoomCardProps {
  item: RoomItem;
  onPress: (item: RoomItem) => void;
}

const RoomCard: React.FC<RoomCardProps> = ({ item, onPress }) => {
  return (
    <TouchableOpacity 
      onPress={() => onPress(item)}
      style={styles.container}
    >
      <Image 
        source={item.image} 
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.detailsContainer}>
        <Text style={styles.name}>{item.name}</Text>
        
        <View style={styles.ratingContainer}>
          <Star size={16} color="#FBB03B" fill="#FBB03B" />
          <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>{item.capacity}</Text>
          <Text style={styles.infoText}>•</Text>
          <Text style={styles.infoText}>{item.size}</Text>
        </View>
        
        <Text style={styles.price}>{item.price}</Text>
        <Text style={styles.perNight}>per night</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 280,
    backgroundColor: 'white',
    borderRadius: 12,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 160,
  },
  detailsContainer: {
    padding: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    marginRight: 6,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#008080',
  },
  perNight: {
    fontSize: 12,
    color: '#888',
  },
});

export default RoomCard;