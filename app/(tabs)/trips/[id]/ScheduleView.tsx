import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { theme } from '../../../theme';

interface Service {
  id: string;
  name: string;
  time: string;
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

interface ScheduleViewProps {
  tripDays: TripDay[];
  tripTitle: string;
}

const ScheduleView: React.FC<ScheduleViewProps> = ({ tripDays, tripTitle }) => {
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
      pathname: './{id}/DayDetails',
      params: {
        date: day.date,
        dayName: day.dayName,
        weather: day.weather,
        services: JSON.stringify(day.services),
        tripTitle: tripTitle
      }
    });
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
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
                <View style={styles.serviceDetails}>
                  <Text style={styles.serviceTime}>{service.time}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.dayFooter}>
            <Text style={styles.dayFooterText}>
              {day.services.length} {day.services.length === 1 ? 'activity' : 'activities'}
            </Text>
            <Text style={styles.dayFooterText}>
              LKR {day.services.reduce((sum, s) => sum + s.cost, 0).toLocaleString()}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
      
      {/* Add service */}
      <TouchableOpacity
        style={styles.addDayCard}
        onPress={() => router.push('../../explore')}
        activeOpacity={0.8}
      >
        <View style={styles.addDayContent}>
          <View style={styles.addIcon}>
            <Text style={styles.addIconText}>+</Text>
          </View>
          <Text style={styles.addDaySubtext}>Plan more activities</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  dayName: {
    fontSize: 14,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  weatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  weatherIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  weatherText: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  servicesContainer: {
    marginBottom: 16,
  },
  serviceItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  serviceInfo: {
    flex: 1,
    marginRight: 12,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  serviceDetails: {
    alignItems: 'flex-end',
  },
  serviceTime: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 2,
  },
  serviceDuration: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  dayFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  dayFooterText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  addDayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addDayContent: {
    alignItems: 'center',
  },
  addIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  addIconText: {
    fontSize: 24,
    color: '#6B7280',
    fontWeight: '300',
  },
  addDayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  addDaySubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default ScheduleView;