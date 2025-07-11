import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Animated,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import FilterButton from '../../../../components/FilterButton'; 
import BackButton from '../../../../components/BackButton';
import HeaderButton from '../../../../components/HeaderButton';
import SummaryCard from '../../../../components/SummaryCard';
import TripDetailsModal, { TripDetails as TripDetailsType } from '../../../../components/TripDetailsModal';
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
  const [showEditModal, setShowEditModal] = useState(false);

  // Animation for header hide/show
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);

  // Header animation based on scroll direction
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const currentScrollY = event.nativeEvent.contentOffset.y;
        const scrollDelta = currentScrollY - lastScrollY.current;
        
        // Only start hiding header after scrolling past the summary card (around 150px)
        if (currentScrollY > 150) {
          if (scrollDelta > 5 && currentScrollY > lastScrollY.current) {
            // Scrolling down - hide header
            Animated.timing(headerTranslateY, {
              toValue: -100,
              duration: 200,
              useNativeDriver: true,
            }).start();
          } else if (scrollDelta < -5 && currentScrollY < lastScrollY.current) {
            // Scrolling up - show header
            Animated.timing(headerTranslateY, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }).start();
          }
        } else {
          // Always show header when at the top
          Animated.timing(headerTranslateY, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
        
        lastScrollY.current = currentScrollY;
      },
    }
  );

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

  // Trip data - using title from tripDetails
  const tripData = {
    title: tripDetails.title || 'Galle Adventure',
  };

  // Handle edit from header button
  const handleEdit = () => {
    setShowEditModal(true);
  };

  // Handle share from header button
  const handleShare = () => {
    // Implement share functionality
    console.log('Sharing trip:', tripDetails.title);
  };

  // Handle delete from header button
  const handleDelete = () => {
    // Implement delete functionality
    console.log('Deleting trip:', tripDetails.title);
  };

  // Handle edit modal close and update
  const handleEditModalClose = () => {
    setShowEditModal(false);
  };

  const handleEditModalConfirm = (updatedDetails: TripDetailsType) => {
    setTripDetails(updatedDetails);
    setShowEditModal(false);
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
        <Animated.View 
          style={[
            styles.header,
            {
              transform: [{ translateY: headerTranslateY }],
            }
          ]}
        >
          <BackButton />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{tripData.title}</Text>
          </View>
          <HeaderButton
            tripId={tripID}
            tripTitle={tripData.title}
            onEdit={handleEdit}
            onShare={handleShare}
            onDelete={handleDelete}
          />
        </Animated.View>

        <ScrollView 
          style={styles.content}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <SummaryCard
            tripDetails={tripDetails}
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

      <TripDetailsModal
        visible={showEditModal}
        onClose={handleEditModalClose}
        onConfirm={handleEditModalConfirm}
        initialDetails={tripDetails}
        isEditing={true}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 16,
    paddingTop: 50, // Add extra padding for status bar
    flexDirection: 'row',
    borderRadius: 30,
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1000,
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
    paddingTop: 50, // Add padding to account for fixed header
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