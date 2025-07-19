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

type GuideItem = {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  languages: string[];
  yearsExperience: number;
  price: string;
  image: string;
};

interface GuideCardProps {
  item: GuideItem;
  onPress: () => void;
  width?: number;
}

const GuideCard: React.FC<GuideCardProps> = ({ 
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
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.specialty}>{item.specialty}</Text>
        
        <View style={styles.ratingContainer}>
          <Star size={16} color="#FBB03B" fill="#FBB03B" />
          <Text style={styles.ratingText}>{item.rating}</Text>
          <Text style={styles.experienceText}>{item.yearsExperience} yrs exp</Text>
        </View>
        
        <View style={styles.languagesContainer}>
          {item.languages.map((lang, index) => (
            <Text key={index} style={styles.languageText}>{lang}</Text>
          ))}
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
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  specialty: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
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
    marginRight: 10,
  },
  experienceText: {
    fontSize: 12,
    color: '#888',
  },
  languagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  languageText: {
    fontSize: 12,
    color: '#008080',
    backgroundColor: '#e6fffa',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#008080',
  },
});

export default GuideCard;