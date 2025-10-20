import { getTripById, getTripItemsByTripId } from "@/services/tripService";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "../../../theme";

// TripDay type for hardcoded and API data
type TripDay = {
  date: string;
  dayName: string;
  weather: "sunny" | "cloudy" | "rainy" | "stormy" | "snowy";
  services: {
    id: string;
    name: string;
    time: string;
    cost: number;
    location: string;
    weather?: "sunny" | "cloudy" | "rainy";
    booking_config_id?: number;
    bookingType?: 'TIME_SLOTS' | 'MULTI_DAY' | 'WHOLE_DAY' | 'FIXED_TIME' | 'FLEXIBLE_HOURS' | 'EVENT_BASED';
    startDate?: string;
    endDate?: string;
    checkInTime?: string;
    checkOutTime?: string;
    duration?: string;
    description?: string;
  }[];
};
// Hardcoded trip object for demo purposes
const hardcodedTrip = {
  tripId: 999,
  tripName: "Sample Adventure",
  days: [
    {
      date: "2025-07-22",
      dayName: "Tuesday",
      weather: "sunny",
      services: [
        {
          id: "1",
          name: "Sigiriya Rock Climb",
          time: "08:00",
          cost: 2500,
          location: "Sigiriya",
          weather: "sunny",
          booking_config_id: 1,
          duration: "2h",
          description: "Climb the ancient rock fortress of Sigiriya.",
        },
        {
          id: "2",
          name: "Village Lunch",
          time: "12:30",
          cost: 1200,
          location: "Habarana",
          weather: "sunny",
          booking_config_id: 2,
          duration: "1h",
          description: "Enjoy a traditional Sri Lankan lunch in a local village.",
        },
        {
          id: "4",
          name: "Beach Resort Stay",
          time: "15:00",
          cost: 15000,
          location: "Bentota",
          weather: "sunny",
          booking_config_id: 5,
          bookingType: "MULTI_DAY",
          startDate: "2025-07-22",
          endDate: "2025-07-25",
          checkInTime: "15:00",
          checkOutTime: "11:00",
          duration: "3 days",
          description: "Luxury beachfront accommodation with full amenities.",
        },
      ],
    },
    {
      date: "2025-07-23",
      dayName: "Wednesday",
      weather: "cloudy",
      services: [
        {
          id: "3",
          name: "Safari at Minneriya",
          time: "15:00",
          cost: 3500,
          location: "Minneriya",
          weather: "cloudy",
          booking_config_id: 3,
          duration: "3h",
          description: "Wildlife safari experience at Minneriya National Park.",
        },
      ],
    },
    {
      date: "2025-07-25",
      dayName: "Friday",
      weather: "sunny",
      services: [
        {
          id: "4-checkout",
          name: "Beach Resort Stay",
          time: "11:00",
          cost: 0, // Checkout doesn't have additional cost
          location: "Bentota",
          weather: "sunny",
          booking_config_id: 5,
          bookingType: "MULTI_DAY",
          startDate: "2025-07-22",
          endDate: "2025-07-25",
          checkInTime: "15:00",
          checkOutTime: "11:00",
          duration: "3 days",
          description: "Luxury beachfront accommodation with full amenities.",
        },
      ],
    },
  ],
};

interface Service {
  id: string;
  name: string;
  time: string;
  cost: number;
  location: string;
  weather?: "sunny" | "cloudy" | "rainy";
}

const ScheduleView = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [trip, setTrip] = useState<any>(null);
  const [tripDays, setTripDays] = useState<TripDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrip = async () => {
      setLoading(true);
      setError(null);
      try {
        if (id === "hardcoded") {
          setTrip(hardcodedTrip);
          setTripDays(hardcodedTrip.days as TripDay[]);
        } else {
          const tripRes = await getTripById(Number(id));
          if (tripRes.success && tripRes.data) {
            setTrip(tripRes.data);
            // Fetch trip items and group by day
            const itemsRes = await getTripItemsByTripId(Number(id));
            if (itemsRes.success && itemsRes.data) {
              // Group items by date (assuming item has startTime)
              const grouped: { [date: string]: TripDay } = {};
              
              itemsRes.data.forEach((item: any) => {
                const startDate = item.startTime.split("T")[0];
                const endDate = item.endTime ? item.endTime.split("T")[0] : startDate;
                
                const serviceData = {
                  id: item.service?.serviceId?.toString() || item.place?.placeId?.toString() || item.id?.toString() || "",
                  name: item.service?.serviceName || item.place?.placeName || "Unknown",
                  cost: item.price || 0,
                  location: item.service?.locationBased?.city || item.place?.location?.city || "",
                  weather: "sunny" as const, // Placeholder
                  booking_config_id: item.service?.booking_config_id || item.bookingConfigId || undefined,
                  bookingType: item.service?.bookingType || item.bookingType || undefined,
                  startDate: item.startTime ? item.startTime.split("T")[0] : undefined,
                  endDate: item.endTime ? item.endTime.split("T")[0] : undefined,
                  checkInTime: item.startTime ? item.startTime.split("T")[1]?.slice(0, 5) : undefined,
                  checkOutTime: item.endTime ? item.endTime.split("T")[1]?.slice(0, 5) : undefined,
                  duration: item.service?.duration || item.duration || undefined,
                  description: item.service?.description || item.description || undefined,
                };
                
                // Add service to start date
                if (!grouped[startDate]) {
                  grouped[startDate] = {
                    date: startDate,
                    dayName: new Date(startDate).toLocaleDateString("en-US", { weekday: "long" }),
                    weather: "sunny",
                    services: [],
                  };
                }
                grouped[startDate].services.push({
                  ...serviceData,
                  time: item.startTime ? item.startTime.split("T")[1]?.slice(0, 5) : "",
                });
                
                // For multi-day services, also add to end date if different
                const isMultiDay = endDate !== startDate;
                if (isMultiDay && endDate !== startDate) {
                  if (!grouped[endDate]) {
                    grouped[endDate] = {
                      date: endDate,
                      dayName: new Date(endDate).toLocaleDateString("en-US", { weekday: "long" }),
                      weather: "sunny",
                      services: [],
                    };
                  }
                  grouped[endDate].services.push({
                    ...serviceData,
                    id: `${serviceData.id}-checkout`, // Different ID for checkout
                    time: item.endTime ? item.endTime.split("T")[1]?.slice(0, 5) : "",
                    cost: 0, // Checkout typically doesn't have additional cost
                  });
                }
              });
              
              setTripDays(Object.values(grouped).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
            } else {
              setTripDays([]);
            }
          } else {
            setError("Trip not found");
          }
        }
      } catch (error) {
        setError("Failed to load trip");
        console.error("Trip loading error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [id]);

  const handleDayClick = (day: TripDay) => {
    router.push({
      pathname: './{id}/DayDetails',
      params: {
        date: day.date,
        dayName: day.dayName,
        weather: day.weather,
        services: JSON.stringify(day.services),
        tripTitle: trip?.tripName || "Trip",
      },
    });
  };

  if (loading) return <Text style={{ padding: 20 }}>Loading trip...</Text>;
  if (error) return <Text style={{ padding: 20, color: "red" }}>{error}</Text>;

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      {/* Hardcoded Trip Card Example */}
      {id === "hardcoded" && (
        <View
          style={[styles.dayCard, { borderColor: "#008080", borderWidth: 2 }]}
        >
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 18,
              color: "#008080",
              marginBottom: 8,
            }}
          >
            Sample Adventure (Hardcoded)
          </Text>
          <Text style={{ color: "#374151", marginBottom: 8 }}>
            2 days, 3 activities
          </Text>
          <Text style={{ color: "#374151", marginBottom: 8 }}>
            Total: LKR 7200
          </Text>
        </View>
      )}
      {tripDays.map((day, index) => (
        <TouchableOpacity
          key={day.date}
          style={styles.dayCard}
          onPress={() => handleDayClick(day)}
          activeOpacity={0.8}
        >
          <View style={styles.dayHeader}>
            <View style={styles.dayInfo}>
              <View className="dayDot" style={styles.dayDot} />
              <View style={styles.dayTextContainer}>
                <Text style={styles.dayDate}>{day.date}</Text>
                <Text style={styles.dayName}>{day.dayName}</Text>
              </View>
            </View>
          </View>

          <View style={styles.servicesContainer}>
            {day.services.map((service) => {
              // Check if it's a multi-day service using the same logic as DayDetails
              const isMultiDay = (
                service.booking_config_id === 5 || 
                service.bookingType === 'MULTI_DAY' ||
                (service.startDate && service.endDate && service.startDate !== service.endDate)
              );
              
              const isCheckIn = isMultiDay && service.startDate === day.date;
              const isCheckOut = isMultiDay && service.endDate === day.date && !isCheckIn;
              
              // Debug only for multi-day services
              if (isMultiDay) {
                console.log(`Multi-day service ${service.id}:`, {
                  serviceName: service.name,
                  isCheckIn,
                  isCheckOut,
                  serviceStartDate: service.startDate,
                  serviceEndDate: service.endDate,
                  currentDayDate: day.date,
                  booking_config_id: service.booking_config_id,
                  startEqualsDay: service.startDate === day.date,
                  endEqualsDay: service.endDate === day.date
                });
              }
              
              return (
                <View key={service.id} style={[
                  styles.serviceItem,
                  isMultiDay && styles.multiDayServiceItem,
                  isCheckOut && styles.checkOutServiceItem
                ]}>
                  {/* Multi-day badge */}
                  {isMultiDay && (
                    <View style={[
                      styles.multiDayBadge,
                      isCheckOut && styles.checkOutBadge
                    ]}>
                      <Text style={styles.multiDayBadgeText}>
                        {isCheckIn ? 'CHECK-IN' : 'CHECK-OUT'}
                      </Text>
                    </View>
                  )}
                  
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    {service.description && (
                      <Text style={styles.serviceDescription}>{service.description}</Text>
                    )}
                  </View>
                  <View style={styles.serviceDetails}>
                    <Text style={styles.serviceTime}>{service.time}</Text>
                    {service.duration && (
                      <Text style={styles.serviceDuration}>{service.duration}</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.dayFooter}>
            <Text style={styles.dayFooterText}>
              {day.services.length}{" "}
              {day.services.length === 1 ? "activity" : "activities"}
            </Text>
            <Text style={styles.dayFooterText}>
              LKR{" "}
              {day.services
                .reduce((sum, s) => sum + s.cost, 0)
                .toLocaleString()}
            </Text>
          </View>
        </TouchableOpacity>
      ))}

      {/* Add service */}
      <TouchableOpacity
        style={styles.addDayCard}
        onPress={() => router.push("../../explore")}
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
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  dayInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  dayDot: {
    width: 12,
    height: 12,
    backgroundColor: theme.colors.primary,
    borderRadius: 6,
    marginRight: 12,
  },
  dayTextContainer: {
    flexDirection: "column",
  },
  dayDate: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 2,
  },
  dayName: {
    fontSize: 14,
    color: "#6B7280",
    textTransform: "capitalize",
  },
  servicesContainer: {
    marginBottom: 16,
  },
  serviceItem: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    position: "relative",
  },
  multiDayServiceItem: {
    borderLeftWidth: 4,
    borderLeftColor: "#008080",
    paddingTop: 20, // Add space for the badge
  },
  checkOutServiceItem: {
    borderLeftColor: "#F59E0B",
  },
  multiDayBadge: {
    position: "absolute",
    top: -8,
    right: 12,
    backgroundColor: "#008080",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 1,
  },
  checkOutBadge: {
    backgroundColor: "#F59E0B",
  },
  multiDayBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  serviceInfo: {
    flex: 1,
    marginRight: 12,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  serviceDetails: {
    alignItems: "flex-end",
  },
  serviceTime: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "600",
    marginBottom: 2,
  },
  serviceDuration: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  dayFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  dayFooterText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  addDayCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  addDayContent: {
    alignItems: "center",
  },
  addIcon: {
    width: 48,
    height: 48,
    backgroundColor: "#F3F4F6",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  addIconText: {
    fontSize: 24,
    color: "#6B7280",
    fontWeight: "300",
  },
  addDayText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  addDaySubtext: {
    fontSize: 14,
    color: "#6B7280",
  },
});

export default ScheduleView;
