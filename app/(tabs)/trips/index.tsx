import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
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
  const [error, setError] = useState<string | null>(null);

  const filters = ["All", "Upcoming", "Completed"];

  // Load trips when component mounts
  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getMyTrips();

      if (response.success && response.data) {
        // Convert API trips to TripCard format
        const convertedTrips = response.data.map(convertTripToCardFormat);
        setTrips(convertedTrips);
        console.log(`Loaded ${convertedTrips.length} trips from API`);
      } else {
        console.error("Failed to load trips:", response.message);
        setTrips([]);

        // Check if it's just "no trips found" which is normal, not an error
        const message = response.message || "";
        const isNoTripsFound = message.toLowerCase().includes("no trips found");

        if (!isNoTripsFound) {
          setError(message || "Failed to load your trips.");
        }
        // If it's just "no trips found", don't set error - show empty state instead
      }
    } catch (error) {
      console.error("Error loading trips:", error);
      setTrips([]);
      setError(
        "Failed to load your trips. Please check your internet connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null); // Clear any existing errors
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
            <View style={styles.loadingContent}>
              <ActivityIndicator size="large" color="#008080" />
              <Text style={styles.loadingText}>Loading your trips...</Text>
              <Text style={styles.loadingSubtext}>
                Please wait while we fetch your travel plans
              </Text>
            </View>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <View style={styles.errorContent}>
              <View style={styles.errorIconContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
              </View>
              <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
              <Text style={styles.errorSubtitle}>{error}</Text>
              <View style={styles.errorActions}>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={loadTrips}
                >
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.createTripButton}
                  onPress={handleNewTripPress}
                >
                  <Text style={styles.createTripButtonText}>Create Trip</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : filteredTrips.length === 0 ? (
          <EmptyState
            selectedFilter={selectedFilter}
            onCreateTrip={handleNewTripPress}
          />
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
  loadingContent: {
    alignItems: "center",
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "center",
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  errorContent: {
    alignItems: "center",
    paddingHorizontal: 32,
    maxWidth: 320,
  },
  errorIconContainer: {
    marginBottom: 16,
  },
  errorIcon: {
    fontSize: 48,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  errorActions: {
    flexDirection: "row",
    gap: 16,
  },
  retryButton: {
    backgroundColor: "#008080",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  createTripButton: {
    backgroundColor: "transparent",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#008080",
    minWidth: 100,
    alignItems: "center",
  },
  createTripButtonText: {
    color: "#008080",
    fontSize: 16,
    fontWeight: "600",
  },
});
