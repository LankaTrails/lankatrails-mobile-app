import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import TripCard from "../../components/TripCard";
import NewTripButton from "../../components/NewButton";
import FilterButton from "../../components/FilterButton";
import EmptyState from "../../components/EmptyState";
import StatsHeader from "../../components/StatsHeader";

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
    status: "upcoming",
  },
];

export default function TripsScreen() {
  const [trips] = useState(dummyTrips);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const filters = ["All", "Upcoming", "Completed"];
  const router = useRouter();

  const filteredTrips =
    selectedFilter === "All"
      ? trips
      : trips.filter((trip) => trip.status === selectedFilter);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        <View style={styles.header}>
          <Text style={styles.heading}>Your Trips</Text>


          <StatsHeader trips={trips} />

          {/* Filter Bar */}
          <View style={styles.filtersContainer}>
            <FlatList
              data={filters}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersList}
              renderItem={({ item }) => (<FilterButton
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
  renderItem={({ item }) => (
    <View style={styles.tripCardWrapper}>
      <TripCard
        onPress={() => router.push("/tripDetails(claude)")}
        title={item.title}
        details={item.details}
        budget={item.budget}
        duration={item.duration}
      />
    </View>
  )}
/>
        )}
      </ScrollView>

      <NewTripButton onPress={() => router.push("/createTrip")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1f2937",
    marginTop: 24,
    marginBottom: 30,
  },
tripList: {
  paddingHorizontal: 20,
},
tripCardWrapper: {
  marginBottom: 12,
},
filtersContainer: {
    backgroundColor: "#ffffff",
    marginBottom: 20,
  },
});