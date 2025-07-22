import React, { useState } from "react";
import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import EmptyState from "../../../components/EmptyState";
import NewTripButton from "../../../components/FAB";
import FilterButton from "../../../components/FilterButton";
import StatsHeader from "../../../components/StatsHeader";
import TripCard from "../../../components/TripCard";
import TripCreationFlow from "../../../components/TripCreationFlow";
import { Trip } from "../../../types/triptypes";

const dummyTrips = [
  {
    id: "1",
    title: "Ella Hiking Adventure",
    details: "3 spots | Scenic views",
    budget: "Rs. 18,000",
    duration: "2 Days",
    status: "Upcoming",
  },
  {
    id: "2",
    title: "Jaffna Heritage Tour",
    details: "5 places | Cultural",
    budget: "Rs. 25,000",
    duration: "3 Days",
    status: "Upcoming",
  },
];

export default function TripsScreen() {
  const [trips, setTrips] = useState(dummyTrips);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [showTripCreationFlow, setShowTripCreationFlow] = useState(false);

  const filters = ["All", "Upcoming", "Completed"];

  const filteredTrips =
    selectedFilter === "All"
      ? trips
      : trips.filter((trip) => trip.status === selectedFilter);

  const handleNewTripPress = () => {
    setShowTripCreationFlow(true);
  };

  const handleTripCreated = (newTrip: Trip) => {
    // Convert the Trip object from API to the format expected by TripCard
    const tripCardData = {
      id: newTrip.tripId.toString(),
      title: newTrip.tripName,
      details: `${newTrip.locations.length} location${
        newTrip.locations.length > 1 ? "s" : ""
      } | ${newTrip.numberOfAdults + newTrip.numberOfChildren} member${
        newTrip.numberOfAdults + newTrip.numberOfChildren > 1 ? "s" : ""
      }`,
      budget: `Rs. ${newTrip.totalBudget.toLocaleString()}`,
      duration: calculateDurationFromDates(newTrip.startDate, newTrip.endDate),
      status: mapTripStatus(newTrip.status || "PLANNING"),
    };

    setTrips([tripCardData, ...trips]);
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
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
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
        {filteredTrips.length === 0 ? (
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
});
