// TripDay type for hardcoded and API data
type TripDay = {
  date: string;
  dayName: string;
  weather: "sunny" | "cloudy" | "rainy";
  services: Array<{
    id: string;
    name: string;
    time: string;
    cost: number;
    location: string;
    weather?: "sunny" | "cloudy" | "rainy";
  }>;
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
        },
        {
          id: "2",
          name: "Village Lunch",
          time: "12:30",
          cost: 1200,
          location: "Habarana",
          weather: "sunny",
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
        },
      ],
    },
  ],
};
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
                const date = item.startTime.split("T")[0];
                if (!grouped[date]) {
                  grouped[date] = {
                    date,
                    dayName: new Date(date).toLocaleDateString("en-US", {
                      weekday: "long",
                    }),
                    weather: "sunny", // Placeholder, could be from trip or item
                    services: [],
                  };
                }
                grouped[date].services.push({
                  id:
                    item.service?.serviceId?.toString() ||
                    item.place?.placeId?.toString() ||
                    item.id?.toString() ||
                    "",
                  name:
                    item.service?.serviceName ||
                    item.place?.placeName ||
                    "Unknown",
                  time: item.startTime
                    ? item.startTime.split("T")[1]?.slice(0, 5)
                    : "",
                  cost: item.price || 0,
                  location:
                    item.service?.locationBased?.city ||
                    item.place?.location?.city ||
                    "",
                  weather: "sunny", // Placeholder
                });
              });
              setTripDays(Object.values(grouped));
            } else {
              setTripDays([]);
            }
          } else {
            setError("Trip not found");
          }
        }
      } catch (err) {
        setError("Failed to load trip");
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [id]);
  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case "sunny":
        return "☀️";
      case "cloudy":
        return "☁️";
      case "rainy":
        return "🌧️";
      default:
        return "☀️";
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
            <View style={styles.weatherContainer}>
              <Text style={styles.weatherIcon}>
                {getWeatherIcon(day.weather)}
              </Text>
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
  weatherContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
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
    color: "#6B7280",
    textTransform: "capitalize",
    fontWeight: "500",
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
