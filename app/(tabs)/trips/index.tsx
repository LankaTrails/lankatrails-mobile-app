import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import EmptyState from "../../../components/EmptyState";
import NewTripButton from "../../../components/FAB";
import FilterButton from "../../../components/FilterButton";
import StatsHeader from "../../../components/StatsHeader";
import TripCard from "../../../components/TripCard";
import TripCreationFlow from "../../../components/TripCreationFlow";
import { getMyTrips } from "../../../services/tripService";
import { Trip } from "../../../types/triptypes";

export default function TripsScreen() {
  const [trips, setTrips] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [showTripCreationFlow, setShowTripCreationFlow] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filters = ["All", "Upcoming", "Completed"];

  // Load trips when component mounts
  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setIsLoading(true);
      const response = await getMyTrips();

      if (response.success && response.data) {
        // Convert API trips to TripCard format
        const convertedTrips = response.data.map(convertTripToCardFormat);
        setTrips(convertedTrips);
        console.log(`Loaded ${convertedTrips.length} trips from API`);
      } else {
        console.error("Failed to load trips:", response.message);
        // Show empty state instead of dummy data on API failure
        setTrips([]);
        Alert.alert("Error", response.message || "Failed to load your trips.");
      }
    } catch (error) {
      console.error("Error loading trips:", error);
      // Show empty state instead of dummy data on network error
      setTrips([]);
      Alert.alert(
        "Connection Error",
        "Failed to load your trips. Please check your internet connection and pull down to refresh.",
        [{ text: "OK", style: "default" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadTrips();
    setIsRefreshing(false);
  };

  const convertTripToCardFormat = (trip: Trip) => {
    return {
      id: trip.tripId.toString(),
      title: trip.tripName,
      details: `${trip.locations.length} location${
        trip.locations.length > 1 ? "s" : ""
      } | ${trip.numberOfAdults + trip.numberOfChildren} traveler${
        trip.numberOfAdults + trip.numberOfChildren > 1 ? "s" : ""
      }`,
      budget: `Rs. ${trip.totalBudget.toLocaleString()}`,
      duration: calculateDurationFromDates(trip.startDate, trip.endDate),
      status: mapTripStatus(trip.status || "PLANNING"),
    };
  };

  const filteredTrips =
    selectedFilter === "All"
      ? trips
      : trips.filter((trip) => trip.status === selectedFilter);

  const handleNewTripPress = () => {
    setShowTripCreationFlow(true);
  };

  const handleTripCreated = async (newTrip: Trip) => {
    // Convert the Trip object from API to the format expected by TripCard
    const tripCardData = convertTripToCardFormat(newTrip);

    // Add to the beginning of the trips list
    setTrips([tripCardData, ...trips]);

    // Optionally refresh the entire list from API to ensure consistency
    // This is helpful in case there are server-side computed fields
    setTimeout(() => {
      loadTrips();
    }, 1000);
  };

  const calculateDurationFromDates = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} Day${diffDays > 1 ? "s" : ""}`;
  };

  const mapTripStatus = (status: string) => {
    switch (status) {
      case "PLANNING":
        return "Upcoming";
      case "IN_PROGRESS":
        return "Ongoing";
      case "COMPLETED":
        return "Completed";
      case "CANCELLED":
        return "Cancelled";
      case "ARCHIVED":
        return "Archived";
      default:
        return "Upcoming";
    }
  };

  const handleTripCreationClose = () => {
    setShowTripCreationFlow(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={["#008080"]}
            tintColor="#008080"
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.heading}>Your Trips</Text>
          <StatsHeader trips={trips} />
          {/* Filter Bar */}
          <View>
            <FlatList
              data={filters}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <FilterButton
                  filter={item}
                  isActive={item === selectedFilter}
                  onPress={() => setSelectedFilter(item)}
                />
              )}
              keyExtractor={(item) => item}
            />
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#008080" />
            <Text style={styles.loadingText}>Loading your trips...</Text>
          </View>
        ) : filteredTrips.length === 0 ? (
          <EmptyState selectedFilter={selectedFilter} />
        ) : (
          <FlatList
            data={filteredTrips}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.tripList}
            renderItem={({ item }) => <TripCard {...item} />}
          />
        )}
      </ScrollView>

      <NewTripButton onPress={handleNewTripPress} />

      <TripCreationFlow
        visible={showTripCreationFlow}
        onClose={handleTripCreationClose}
        onTripCreated={handleTripCreated}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 14,
    backgroundColor: "#fff",
  },
  header: {
    marginTop: 60,
    marginBottom: 16,
  },
  heading: {
    fontSize: 32,
    paddingLeft: 10,
    fontWeight: "700",
    color: "#1f2937",
  },
  tripList: {
    paddingHorizontal: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
});
