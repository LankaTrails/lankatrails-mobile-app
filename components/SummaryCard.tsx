import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { TripDetails } from './TripDetailsModal';

interface SummaryCardProps {
  tripDetails: TripDetails;
}

export default function SummaryCard({ tripDetails }: SummaryCardProps) {
  // Remove modal state since editing is now handled by HeaderButton

  const formatDateRange = (startDate: Date, endDate: Date) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const start = startDate.toLocaleDateString('en-US', options);
    const end = endDate.toLocaleDateString('en-US', options);
    return `${start} - ${end}`;
  };

  const calculateDuration = (startDate: Date, endDate: Date) => {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} Day${diffDays > 1 ? 's' : ''}`;
  };

  const getCurrencySymbol = (currency: string) => {
    const symbols: { [key: string]: string } = {
      USD: '$',
      EUR: '€',
      LKR: 'Rs.',
      GBP: '£',
      JPY: '¥',
    };
    return symbols[currency] || currency;
  };

  return (
    <>
      <View
        style={styles.card}
      >
        <ImageBackground
          source={{ uri: "https://images.squarespace-cdn.com/content/v1/5a3bb03b4c326d76de73ddaa/9732566d-6b33-4a1a-ba0c-1b73ed8848a4/The+Common+Wanderer-9888.jpg" }}
          style={styles.backgroundImage}>

          <View style={styles.blurWrapper}>
            <BlurView intensity={10} tint="light" style={styles.blurContainer}>

            {/* Row 1 */}
            <View style={styles.gridRow}>
              <View style={styles.item}>
                <Ionicons name="time-outline" size={18} color="#fff" />
                <Text style={styles.text}>{calculateDuration(tripDetails.startDate, tripDetails.endDate)}</Text>
              </View>
              <View style={styles.item}>
                <Ionicons name="cash-outline" size={18} color="#fff" />
                <Text style={styles.text}>{getCurrencySymbol(tripDetails.currency)} {tripDetails.budget}</Text>
              </View>
              <View style={styles.item}>
                <Ionicons name="navigate-outline" size={18} color="#fff" />
                <Text style={styles.text}>{tripDetails.distance || 'Calculating...'}</Text>
              </View>
            </View>

            {/* Row 2 */}
            <View style={styles.gridRow}>
              <View style={styles.item}>
                <Ionicons name="calendar-outline" size={18} color="#fff" />
                <Text style={styles.text}>{formatDateRange(tripDetails.startDate, tripDetails.endDate)}</Text>
              </View>
              <View style={styles.item}>
                <Ionicons name="people-outline" size={18} color="#fff" />
                <Text style={styles.text}>{tripDetails.numberOfAdults + tripDetails.numberOfChildren} Member{tripDetails.numberOfAdults + tripDetails.numberOfChildren > 1 ? 's' : ''}</Text>
              </View>
            </View>
          </BlurView>
        </View>
      </ImageBackground>
    </View>
  </>
);
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
    height: 170,
    width: '100%',
    marginLeft: 0,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    columnGap: 10,
    paddingVertical: 5,
  },
  item: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 20,
  },
  blurContainer: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  blurWrapper: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden', // Clip the blur view
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  text: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '500',
  },
});