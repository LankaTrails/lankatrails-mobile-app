import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import FilterButton from '../../../../components/FilterButton'; 
import BackButton from '../../../../components/BackButton';
import ChatButton from '../../../../components/ChatButton';
import NewButton from '../../../../components/NewButton';
import SummaryCard from '../../../../components/SummaryCard';
import { theme } from '../../../theme';

const { width } = Dimensions.get('window');

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
  const [viewMode, setViewMode] = useState<'schedule' | 'bookings' | 'budget'>('schedule');

  // Sample trip data
  const tripData = {
    title: "Galle Adventure",
    dateRange: "Dec 15-20, 2024",
    totalCost: 2450,
    distance: "180 km",
    duration: "6 days",
    members: 4
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

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case 'sunny': return '☀️';
      case 'cloudy': return '☁️';
      case 'rainy': return '🌧️';
      default: return '☀️';
    }
  };

  const handleDayClick = (day: TripDay) => {
    router.push({
      pathname: '/screens/day-details',
      params: {
        date: day.date,
        dayName: day.dayName,
        weather: day.weather,
        services: JSON.stringify(day.services),
        tripTitle: tripData.title
      }
    });
  };

  const tabs = ["Schedule", "Bookings", "Budget"];

  const TabNavigation = () => (
    <View style={{ flexDirection: "row", marginBottom: 24 }}>
      {tabs.map((tab) => (
        <FilterButton
          key={tab}
          filter={tab}
          isActive={viewMode === tab.toLowerCase()}
          onPress={() => setViewMode(tab.toLowerCase() as 'schedule' | 'bookings' | 'budget')}
        />
      ))}
    </View>
  );

  const DaysView = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {tripDays.map((day, index) => (
        <TouchableOpacity
          key={day.date}
          style={styles.dayCard}
          onPress={() => handleDayClick(day)}
          activeOpacity={0.8}
        >
          <View style={styles.dayHeader}>
            <View style={styles.dayInfo}>
              <View style={styles.dayDot} />
              <View style={styles.dayTextContainer}>
                <Text style={styles.dayDate}>{day.date}</Text>
                <Text style={styles.dayName}>{day.dayName}</Text>
              </View>
            </View>
            <View style={styles.weatherContainer}>
              <Text style={styles.weatherIcon}>{getWeatherIcon(day.weather)}</Text>
              <Text style={styles.weatherText}>{day.weather}</Text>
            </View>
          </View>

          <View style={styles.servicesContainer}>
            {day.services.map((service) => (
              <View key={service.id} style={styles.serviceItem}>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                </View>
                <Text style={styles.serviceTime}>{service.time}</Text>
              </View>
            ))}
          </View>

          <View style={styles.dayFooter}>
            <Text style={styles.dayFooterText}>{day.services.length} activities</Text>
            <Text style={styles.dayFooterText}>
              LKR {day.services.reduce((sum, s) => sum + s.cost, 0)}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
      
    </ScrollView>
  );
  

  return (
    <>
    <Stack.Screen options={{ headerShown: false }} />
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
              <BackButton/>
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>{tripData.title}</Text>
              </View>
              <ChatButton />
            </View>

      <ScrollView style={styles.content}>
          <SummaryCard
  tripData={{
    dateRange: 'June 22 - June 26',
    totalCost: '45,000',
    distance: '120km',
    duration: '4 Days',
    members: 3,
  }}/>


        <TabNavigation />
        
        <View style={styles.viewContainer}>
          {viewMode === 'schedule' && <DaysView />}
          {viewMode === 'bookings' && <Text>Bookings screen coming soon!</Text>}
          {viewMode === 'budget' && <Text>Budget screen coming soon!</Text>}
        </View>
      </ScrollView>
      <NewButton
        onPress={() => alert("Route -> add new day!")}
      />
    </SafeAreaView>
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
 
  content: {
    flex: 1,
    paddingHorizontal: 14,
  },
  viewContainer: {
    flex: 1,
    minHeight: 400,
  },
  dayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayDot: {
    width: 12,
    height: 12,
    backgroundColor: theme.colors.primary,
    borderRadius: 6,
    marginRight: 12,
  },
  dayTextContainer: {
    flexDirection: 'column',
  },
  dayDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  dayName: {
    fontSize: 14,
    color: '#6B7280',
  },
  weatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  weatherText: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  servicesContainer: {
    marginBottom: 12,
  },
  serviceItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  serviceLocation: {
    fontSize: 12,
    color: '#6B7280',
  },
  serviceTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  dayFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  dayFooterText: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default TripDetails;