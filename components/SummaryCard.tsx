import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

export default function SummaryCard({ tripData }) {
  return (
    
    <ImageBackground
      source={{ uri: "https://images.squarespace-cdn.com/content/v1/5a3bb03b4c326d76de73ddaa/9732566d-6b33-4a1a-ba0c-1b73ed8848a4/The+Common+Wanderer-9888.jpg" }}
      style={styles.card}>
          <View style={styles.blurWrapper}>
   <BlurView intensity={10} tint="light" style={styles.blurContainer}>
  <Text style={styles.title}>Trip Summary</Text>

  {/* Row 1 */}
  <View style={styles.gridRow}>
    <View style={styles.item}>
      <Ionicons name="time-outline" size={18} color="#fff" />
      <Text style={styles.text}>{tripData.duration}</Text>
    </View>
    <View style={styles.item}>
      <Ionicons name="cash-outline" size={18} color="#fff" />
      <Text style={styles.text}>LKR {tripData.totalCost}</Text>
    </View>
    <View style={styles.item}>
      <Ionicons name="navigate-outline" size={18} color="#fff" />
      <Text style={styles.text}>{tripData.distance}</Text>
    </View>
  </View>

  {/* Row 2 */}
  <View style={styles.gridRow}>
    <View style={styles.item}>
      <Ionicons name="calendar-outline" size={18} color="#fff" />
      <Text style={styles.text}>{tripData.dateRange}</Text>
    </View>
    <View style={styles.item}>
      <Ionicons name="people-outline" size={18} color="#fff" />
      <Text style={styles.text}>{tripData.members} Members</Text>
    </View>
  </View>
</BlurView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
    height: 200,
    width: '100%',
    marginLeft: 0,
  },
  gridRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 12,
  gap: 12,
},

item: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: 'rgba(255,255,255,0.1)',
  padding: 10,
  borderRadius: 20,
},
  blurContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  blurWrapper: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden', // Clip the blur view
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  text: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '500',
  },
});