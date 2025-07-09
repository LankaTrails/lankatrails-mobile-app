import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import FilterButton from '../../../../components/FilterButton'; 
import BackButton from '../../../../components/BackButton';
import ChatButton from '../../../../components/ShareButton';
import SummaryCard from '../../../../components/SummaryCard';
import { TripDetails as TripDetailsType } from '../../../../components/TripDetailsModal';
import ScheduleView from './ScheduleView';
import BookingsView from './BookingsView';
import FloatingActionButton from '../../../../components/OptionsButton';

interface Service {
  id: string;
  name: string;
  description: string;
  time: string;
  duration: string;
  cost: number;
  location: string;
  weather?: 'sunny' | 'cloudy' | 'rainy';
}

interface TripDay {
  date: string;
  dayName: string;
  services: Service[];
  weather: 'sunny' | 'cloudy' | 'rainy';
}

const TripDetails = () => {
  const tripID = useLocalSearchParams().id as string;
  const [viewMode, setViewMode] = useState<'schedule' | 'bookings'>('schedule');

  // Trip details state for the SummaryCard
  const [tripDetails, setTripDetails] = useState<TripDetailsType>({
    budget: '45000',
    members: 3,
    startDate: new Date('2024-06-22'),
    endDate: new Date('2024-06-26'),
    currency: 'LKR',
    distance: '120km', // Placeholder - will be calculated via Google APIs
    title: 'Galle Adventure', // Add trip title for editing
  });

  // Sample trip data
  const tripData = {
    title: "Galle Adventure",
    dateRange: "Dec 15-20, 2024",
    totalCost: 2450,
    distance: "180 km",
    duration: "6 days",
    members: 4
  };

  const handleUpdateTrip = (updatedDetails: TripDetailsType) => {
    setTripDetails(updatedDetails);
  };

  const tripDays: TripDay[] = [
    {
      date: "Dec 15",
      dayName: "Saturday",
      weather: 'sunny',
      services: [
        {
          id: '1',
          name: 'Galle Fort Walking Tour',
          description: 'Explore the historic Dutch fort with a local guide',
          time: '09:00 AM',
          duration: '3 hours',
          cost: 350,
          location: 'Galle Fort',
          weather: 'sunny'
        },
        {
          id: '2',
          name: 'Lighthouse Visit',
          description: 'Climb the iconic Galle Lighthouse for panoramic views',
          time: '02:00 PM',
          duration: '1 hour',
          cost: 150,
          location: 'Galle Lighthouse',
          weather: 'sunny'
        }
      ]
    },
    {
      date: "Dec 16",
      dayName: "Sunday",
      weather: 'cloudy',
      services: [
        {
          id: '3',
          name: 'Whale Watching',
          description: 'Deep sea whale and dolphin watching expedition',
          time: '06:00 AM',
          duration: '4 hours',
          cost: 650,
          location: 'Mirissa Harbor',
          weather: 'cloudy'
        },
        {
          id: '4',
          name: 'Beach Relaxation',
          description: 'Unwind at the pristine Unawatuna Beach',
          time: '02:00 PM',
          duration: '3 hours',
          cost: 200,
          location: 'Unawatuna Beach',
          weather: 'cloudy'
        }
      ]
    },
    {
      date: "Dec 17",
      dayName: "Monday",
      weather: 'rainy',
      services: [
        {
          id: '5',
          name: 'Spice Garden Tour',
          description: 'Learn about traditional Sri Lankan spices and herbs',
          time: '10:00 AM',
          duration: '2 hours',
          cost: 300,
          location: 'Ahangama Spice Garden',
          weather: 'rainy'
        },
        {
          id: '6',
          name: 'Cooking Class',
          description: 'Traditional Sri Lankan cooking experience',
          time: '03:00 PM',
          duration: '2.5 hours',
          cost: 450,
          location: 'Local Family Home',
          weather: 'rainy'
        }
      ]
    },
    {
      date: "Dec 18",
      dayName: "Tuesday",
      weather: 'sunny',
      services: [
        {
          id: '7',
          name: 'Stilt Fishing Experience',
          description: 'Try the traditional stilt fishing method',
          time: '07:00 AM',
          duration: '2 hours',
          cost: 400,
          location: 'Koggala Beach',
          weather: 'sunny'
        }
      ]
    }
  ];

  const tabs = ["Schedule", "Bookings"];

  const TabNavigation = () => (
    <View style={styles.tabContainer}>
      {tabs.map((tab) => (
        <FilterButton
          key={tab}
          filter={tab}
          isActive={viewMode === tab.toLowerCase()}
          onPress={() => setViewMode(tab.toLowerCase() as 'schedule' | 'bookings')}
        />
      ))}
    </View>
  );

  const renderCurrentView = () => {
    switch (viewMode) {
      case 'schedule':
        return <ScheduleView tripDays={tripDays} tripTitle={tripData.title} />;
      case 'bookings':
        return <BookingsView />;
      default:
        return <ScheduleView tripDays={tripDays} tripTitle={tripData.title} />;
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <BackButton />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{tripData.title}</Text>
          </View>
          <ChatButton/>
        </View>

        <ScrollView style={styles.content}>
          <SummaryCard
            tripDetails={tripDetails}
            onEditTrip={handleUpdateTrip}
          />

          <TabNavigation />
          
          <View style={styles.viewContainer}>
            {renderCurrentView()}
          </View>
        </ScrollView>

        {/* Floating Action Button positioned absolutely */}
        
      </SafeAreaView>
      <View style={styles.fabContainer}>
          <FloatingActionButton />
        </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 16,
    flexDirection: 'row',
    borderRadius: 30,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerRightSpace: {
    width: 56, // Same width as the FAB to center the title properly
  },
  content: {
    flex: 1,
    paddingHorizontal: 14,
  },
  tabContainer: {
    flexDirection: "row", 
    marginBottom: 24
  },
  viewContainer: {
    flex: 1,
    minHeight: 400,
    marginBottom: 80, // Add margin to prevent content from being hidden behind FAB
  },
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  comingSoonContent: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  comingSoonIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  comingSoonText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    zIndex: 1000,
  },
});

export default TripDetails;