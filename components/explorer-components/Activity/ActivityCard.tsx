import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Star } from 'lucide-react-native';

const { width } = Dimensions.get('window');

type ActivityItem = {
  id: number;
  name: string;
  description: string;
  price: string;
  rating: number;
  duration: string;
  difficulty: string;
  image: string;
};

interface ActivityCardProps {
  item: ActivityItem;
  onPress: () => void;
  width?: number;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ 
  item, 
  onPress, 
  width = (Dimensions.get('window').width - 48) / 2 
}) => {
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[styles.card, { width }]}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.image}
        resizeMode="cover"
      />
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
        
        <View style={styles.ratingContainer}>
          <Star size={16} color="#FBB03B" fill="#FBB03B" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
        
        <View style={styles.detailsRow}>
          <Text style={styles.detailText}>{item.duration}</Text>
          <Text style={styles.detailText}>•</Text>
          <Text style={styles.detailText}>{item.difficulty}</Text>
        </View>
        
        <Text style={styles.price}>{item.price}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginRight: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#008080',
  },
});

export default ActivityCard;