import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';

interface TransportProviderCardProps {
  id: number;
  name: string;
  subtitle: string;
  rating: number;
  image: string;
  onPress: (id: number) => void;
}

const TransportProviderCard: React.FC<TransportProviderCardProps> = ({
  id,
  name,
  subtitle,
  rating,
  image,
  onPress,
}) => {
  return (
    <TouchableOpacity 
      onPress={() => onPress(id)}
      style={styles.container}
    >
      <Image 
        source={{ uri: image }} 
        style={styles.image}
        resizeMode="cover"
      />
      
      <View style={styles.detailsContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
        </View>
        
        <View style={styles.ratingContainer}>
          <Star size={16} color="#FBB03B" fill="#FBB03B" />
          <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
  },
  detailsContainer: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  ratingText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default TransportProviderCard;