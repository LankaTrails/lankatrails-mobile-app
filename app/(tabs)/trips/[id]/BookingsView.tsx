import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';

const { width } = Dimensions.get('window');

interface BookingService {
  id: string;
  name: string;
  description: string;
  time: string;
  duration: string;
  cost: number;
  location: string;
  date: string;
  dayName: string;
  isBooked: boolean;
  isAvailable: boolean;
  bookingReference?: string;
  providerName: string;
  maxCapacity: number;
  currentBookings: number;
  weather?: 'sunny' | 'cloudy' | 'rainy';
}

interface TripBookingsProps {
  onBack?: () => void;
}

const BookingsView: React.FC<TripBookingsProps> = ({ onBack }) => {
  const [viewMode, setViewMode] = useState<'overview' | 'details'>('overview');
  const [selectedService, setSelectedService] = useState<BookingService | null>(null);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [bookingServices, setBookingServices] = useState<BookingService[]>([
    {
      id: '1',
      name: 'Galle Fort Walking Tour',
      description: 'Explore the historic Dutch fort with a local guide',
      time: '09:00 AM',
      duration: '3 hours',
      cost: 350,
      location: 'Galle Fort',
      date: 'Dec 15',
      dayName: 'Saturday',
      isBooked: true,
      isAvailable: true,
      bookingReference: 'GF-2024-001',
      providerName: 'Galle Heritage Tours',
      maxCapacity: 15,
      currentBookings: 8,
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
      date: 'Dec 15',
      dayName: 'Saturday',
      isBooked: false,
      isAvailable: true,
      providerName: 'Maritime Heritage Site',
      maxCapacity: 20,
      currentBookings: 12,
      weather: 'sunny'
    },
    {
      id: '3',
      name: 'Whale Watching',
      description: 'Deep sea whale and dolphin watching expedition',
      time: '06:00 AM',
      duration: '4 hours',
      cost: 650,
      location: 'Mirissa Harbor',
      date: 'Dec 16',
      dayName: 'Sunday',
      isBooked: false,
      isAvailable: true,
      providerName: 'Ocean Safari Lanka',
      maxCapacity: 25,
      currentBookings: 18,
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
      date: 'Dec 16',
      dayName: 'Sunday',
      isBooked: true,
      isAvailable: true,
      bookingReference: 'UB-2024-045',
      providerName: 'Beach Resort Unawatuna',
      maxCapacity: 50,
      currentBookings: 23,
      weather: 'cloudy'
    },
    {
      id: '5',
      name: 'Spice Garden Tour',
      description: 'Learn about traditional Sri Lankan spices and herbs',
      time: '10:00 AM',
      duration: '2 hours',
      cost: 300,
      location: 'Ahangama Spice Garden',
      date: 'Dec 17',
      dayName: 'Monday',
      isBooked: false,
      isAvailable: false,
      providerName: 'Spice Island Tours',
      maxCapacity: 12,
      currentBookings: 12,
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
      date: 'Dec 17',
      dayName: 'Monday',
      isBooked: false,
      isAvailable: true,
      providerName: 'Authentic Lanka Cooking',
      maxCapacity: 8,
      currentBookings: 3,
      weather: 'rainy'
    },
    {
      id: '7',
      name: 'Stilt Fishing Experience',
      description: 'Try the traditional stilt fishing method',
      time: '07:00 AM',
      duration: '2 hours',
      cost: 400,
      location: 'Koggala Beach',
      date: 'Dec 18',
      dayName: 'Tuesday',
      isBooked: true,
      isAvailable: true,
      bookingReference: 'SF-2024-078',
      providerName: 'Traditional Fishing Co.',
      maxCapacity: 6,
      currentBookings: 4,
      weather: 'sunny'
    }
  ]);


  const getStatusText = (service: BookingService) => {
    if (service.isBooked) return 'Booked';
    if (!service.isAvailable) return 'Not Available';
    return 'Available';
  };

  const getStatusColor = (service: BookingService) => {
    if (service.isBooked) return '#10B981';
    if (!service.isAvailable) return '#EF4444';
    return '#F59E0B';
  };

  const handleBookService = (serviceId: string) => {
    Alert.alert(
      "Confirm Booking",
      "Are you sure you want to book this service?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Book Now",
          onPress: () => {
            setBookingServices(prev => prev.map(service => 
              service.id === serviceId 
                ? { 
                    ...service, 
                    isBooked: true, 
                    bookingReference: `BK-${Date.now()}`,
                    currentBookings: service.currentBookings + 1
                  }
                : service
            ));
            Alert.alert("Success", "Service booked successfully!");
          }
        }
      ]
    );
  };

  const handleBookAll = () => {
    const availableServices = bookingServices.filter(s => !s.isBooked && s.isAvailable);
    if (availableServices.length === 0) {
      Alert.alert("No Services", "No available services to book.");
      return;
    }

    Alert.alert(
      "Book All Available",
      `Book ${availableServices.length} available services for LKR ${availableServices.reduce((sum, s) => sum + s.cost, 0)}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Book All",
          onPress: () => {
            setBookingServices(prev => prev.map(service => 
              !service.isBooked && service.isAvailable
                ? { 
                    ...service, 
                    isBooked: true, 
                    bookingReference: `BK-${Date.now()}-${service.id}`,
                    currentBookings: service.currentBookings + 1
                  }
                : service
            ));
            Alert.alert("Success", `${availableServices.length} services booked successfully!`);
          }
        }
      ]
    );
  };



  const OverviewView = () => (
    <Animated.View style={[styles.animatedContainer, { opacity: fadeAnim }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {availableCount > 0 && (
          <TouchableOpacity style={styles.bookAllButton} onPress={handleBookAll}>
            <Text style={styles.bookAllIcon}>📋</Text>
            <Text style={styles.bookAllText}>Book All Available ({availableCount})</Text>
          </TouchableOpacity>
        )}

        {bookingServices.map((service) => (
          <TouchableOpacity
            key={service.id}
            style={styles.serviceCard
  }
            onPress={() => handleServiceClick(service)}
            activeOpacity={0.8}
          >
            <View style={styles.serviceHeader}>
              <View style={styles.serviceInfo}>
                <View style={styles.serviceMainInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceDateTime}>{service.date} • {service.time}</Text>
                  <Text style={styles.serviceLocation}>📍 {service.location}</Text>
                </View>
                <View style={styles.serviceStatus}>
                  <Text style={[styles.statusText, { color: getStatusColor(service) }]}>
                    {getStatusText(service)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.serviceDetails}>
              <View style={styles.serviceDetailRow}>
                <Text style={styles.serviceDetailLabel}>Provider:</Text>
                <Text style={styles.serviceDetailValue}>{service.providerName}</Text>
              </View>
              <View style={styles.serviceDetailRow}>
                <Text style={styles.serviceDetailLabel}>Capacity:</Text>
                <Text style={styles.serviceDetailValue}>{service.currentBookings}/{service.maxCapacity}</Text>
              </View>
              {service.isBooked && service.bookingReference && (
                <View style={styles.serviceDetailRow}>
                  <Text style={styles.serviceDetailLabel}>Reference:</Text>
                  <Text style={styles.serviceDetailValue}>{service.bookingReference}</Text>
                </View>
              )}
            </View>

            <View style={styles.serviceFooter}>
              <View style={styles.servicePriceContainer}>
                <Text style={styles.servicePrice}>LKR {service.cost}</Text>
                <Text style={styles.serviceDuration}>{service.duration}</Text>
              </View>
              {!service.isBooked && service.isAvailable && (
                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleBookService(service.id);
                  }}
                >
                  <Text style={styles.bookButtonText}>Book Now</Text>
                </TouchableOpacity>
              )}

            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );

  const DetailsView = () => {
    if (!selectedService) return null;

    return (
      <Animated.View style={[styles.animatedContainer, { opacity: fadeAnim }]}>
        <View style={styles.detailsHeader}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackToOverview}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.detailsHeaderText}>
            <Text style={styles.detailsTitle}>{selectedService.name}</Text>
            <Text style={styles.detailsSubtitle}>{selectedService.date} • {selectedService.dayName}</Text>
          </View>
          <View style={styles.detailsStatus}>
            <Text style={[styles.statusText, { color: getStatusColor(selectedService) }]}>
              {getStatusText(selectedService)}
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  const bookedCount = bookingServices.filter(s => s.isBooked).length;
  const availableCount = bookingServices.filter(s => !s.isBooked && s.isAvailable).length;

  return (
    <View style={styles.container}>
     
      
      <View style={styles.viewContainer}>
        {viewMode === 'overview' && <OverviewView />}
        {viewMode === 'details' && selectedService && <DetailsView />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  animatedContainer: {
    flex: 1,
  },
  viewContainer: {
    flex: 1,
  },
  bookAllButton: {
    backgroundColor: '#008080',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  bookAllIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  bookAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceHeader: {
    marginBottom: 12,
  },
  serviceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  serviceMainInfo: {
    flex: 1,
    marginRight: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  serviceDateTime: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  serviceLocation: {
    fontSize: 14,
    color: '#6B7280',
  },
  serviceStatus: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  serviceDetails: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  serviceDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  serviceDetailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  serviceDetailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  servicePriceContainer: {
    flex: 1,
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  serviceDuration: {
    fontSize: 12,
    color: '#6B7280',
  },
  bookButton: {
    backgroundColor: '#008080',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bookedIndicator: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bookedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  fullIndicator: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  fullText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#F3F4F6',
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backIcon: {
    fontSize: 18,
    color: '#6B7280',
  },
  detailsHeaderText: {
    flex: 1,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  detailsSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailsStatus: {
    alignItems: 'center',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsDescription: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 24,
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailsIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 20,
  },
  detailsContent: {
    flex: 1,
  },
  detailsLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  detailsValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  bookedSection: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  priceSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  priceSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  priceSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  priceSectionAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  priceSectionSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailsBookButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  detailsBookButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  unavailableNotice: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unavailableIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  unavailableText: {
    fontSize: 16,
    color: '#DC2626',
    fontWeight: '500',
  },
});

export default BookingsView;