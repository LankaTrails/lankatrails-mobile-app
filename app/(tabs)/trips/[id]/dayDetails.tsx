import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import BackButton from '../../../../components/BackButton';
import { theme } from '../../../theme';

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

const DayDetails = () => {
  const params = useLocalSearchParams();
  
  // Parse the data from route parameters
  const date = params.date as string;
  const dayName = params.dayName as string;
  const weather = params.weather as 'sunny' | 'cloudy' | 'rainy';
  const tripTitle = params.tripTitle as string;
  const services: Service[] = JSON.parse(params.services as string);

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case 'sunny': return '☀️';
      case 'cloudy': return '☁️';
      case 'rainy': return '🌧️';
      default: return '☀️';
    }
  };

  const handleViewServiceDetails = (serviceId: string) => {
    // Navigate to service details page
    console.log('View service details:', serviceId);
  };

  return (
    <>
    <Stack.Screen options={{ headerShown: false }} />
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
       <BackButton/>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>{tripTitle}</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.dayHeader}>
          <View style={styles.dayHeaderLeft}>
            <Text style={styles.dayDate}>{date}</Text>
          </View>
            <Text style={styles.dayName}>{dayName}</Text>
        </View>

        {services.map((service) => (
          <View key={service.id} style={styles.serviceCard}>
            <View style={styles.serviceCardHeader}>
              <View style={styles.serviceCardInfo}>
                <Text style={styles.serviceCardName}>{service.name}</Text>
                <Text style={styles.serviceCardDescription}>{service.description}</Text>
                <View style={styles.serviceCardDetails}>
                  <View style={styles.serviceDetail}>
                    <Text style={styles.serviceDetailIcon}>⏰</Text>
                    <Text style={styles.serviceDetailText}>{service.time}</Text>
                  </View>
                  <View style={styles.serviceDetail}>
                    <Text style={styles.serviceDetailIcon}>📍</Text>
                    <Text style={styles.serviceDetailText}>{service.location}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.serviceCardPrice}>
                <Text style={styles.serviceCost}>LKR {service.cost}</Text>
                <Text style={styles.serviceDuration}>{service.duration}</Text>
              </View>
            </View>

            <View style={styles.serviceCardFooter}>
              <View style={styles.serviceWeather}>
                <Text style={styles.weatherIcon}>{getWeatherIcon(service.weather || weather)}</Text>
                <Text style={styles.serviceWeatherText}>Weather forecast</Text>
              </View>
              <TouchableOpacity onPress={() => handleViewServiceDetails(service.id)}>
                <Text style={styles.changeDetailsButton}>Edit Details</Text>
              </TouchableOpacity>
            </View>
          </View>
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

        <View style={styles.dayTotal}>
          <View style={styles.dayTotalHeader}>
            <Text style={styles.dayTotalLabel}>Day Total</Text>
            <Text style={styles.dayTotalAmount}>
              LKR {services.reduce((sum, s) => sum + s.cost, 0)}
            </Text>
          </View>
          <Text style={styles.dayTotalSubtext}>
            {services.length} activities scheduled
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
  headerSpacer: {
    width: 30, // Same width as BackButton to balance the layout
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  
  headerText: {
    flex: 1,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 14,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 24,
    backgroundColor: theme.colors.lightPrimary,
    borderRadius: 26,
    padding: 15,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  dayHeaderLeft: {
    flex: 1,
  },
  dayDate: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  dayName: {
    fontSize: 16,
    color: '#6B7280',
  },
  weatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  weatherIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  weatherText: {
    fontSize: 14,
    color: '#6B7280',
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  serviceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  serviceCardInfo: {
    flex: 1,
    marginRight: 16,
  },
  serviceCardName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  serviceCardDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  serviceCardDetails: {
    flexDirection: 'column',
  },
  serviceDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  serviceDetailIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  serviceDetailText: {
    fontSize: 14,
    color: '#6B7280',
  },
  serviceCardPrice: {
    alignItems: 'flex-end',
  },
  serviceCost: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  serviceDuration: {
    fontSize: 14,
    color: '#6B7280',
  },
  serviceCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  serviceWeather: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceWeatherText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  changeDetailsButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#008080',
  },
  dayTotal: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 20,
    marginBottom: 70,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dayTotalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  dayTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  dayTotalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  dayTotalSubtext: {
    fontSize: 14,
    color: '#6B7280',
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

export default DayDetails;