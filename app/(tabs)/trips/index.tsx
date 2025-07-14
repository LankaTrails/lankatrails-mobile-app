import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import TripCard from "../../../components/TripCard";
import NewTripButton from "../../../components/FAB";
import FilterButton from "../../../components/FilterButton";
import EmptyState from "../../../components/EmptyState";
import StatsHeader from "../../../components/StatsHeader";
import DestinationModal from "../../../components/DestinationModal";
import TripNameModal from "../../../components/TripNameModal";
import { BlurView } from "expo-blur";

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
  const [showDestinationModal, setShowDestinationModal] = useState(false);
  const [showTripNameModal, setShowTripNameModal] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState("");
  const [suggestedTripName, setSuggestedTripName] = useState("");

  const filters = ["All", "Upcoming", "Completed"];
  const router = useRouter();

  const filteredTrips =
    selectedFilter === "All"
      ? trips
      : trips.filter((trip) => trip.status === selectedFilter);

  const handleNewTripPress = () => {
    setShowDestinationModal(true);
  };

  const handleDestinationSelect = (destination) => {
    setSelectedDestination(destination);
    setShowDestinationModal(false);
    // Generate suggested trip name based on destination
    const suggestions = [
      `${destination} Adventure`,
      `${destination} Explorer`,
      `${destination} Journey`,
      `${destination} Experience`,
      `Discover ${destination}`,
    ];
    setSuggestedTripName(suggestions[Math.floor(Math.random() * suggestions.length)]);
    setShowTripNameModal(true);
  };

  const handleTripCreate = (tripName) => {
    const newTrip = {
      id: (trips.length + 1).toString(),
      title: tripName,
      details: `${selectedDestination} | Planning`,
      budget: "Rs. 0",
      duration: "TBD",
      status: "Upcoming",
    };
    
    setTrips([newTrip, ...trips]);
    setShowTripNameModal(false);
    setSelectedDestination("");
    setSuggestedTripName("");
  };

  const handleModalClose = () => {
    setShowDestinationModal(false);
    setShowTripNameModal(false);
    setSelectedDestination("");
    setSuggestedTripName("");
  };

  const blurOpacity = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const isAnyModalVisible = showDestinationModal || showTripNameModal;
    if (isAnyModalVisible) {
      Animated.timing(blurOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(blurOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [showDestinationModal, showTripNameModal]);

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
      
      {/* Blur Overlay */}
      {(showDestinationModal || showTripNameModal) && (
        <Animated.View
          style={[
            styles.blurContainer,
            {
              opacity: blurOpacity,
            },
          ]}
          pointerEvents="none"
        >
          <BlurView intensity={50} style={StyleSheet.absoluteFill} />
        </Animated.View>
      )}
      
      <DestinationModal
        visible={showDestinationModal}
        onClose={handleModalClose}
        onDestinationSelect={handleDestinationSelect}
      />
      
      <TripNameModal
        visible={showTripNameModal}
        destination={selectedDestination}
        suggestedName={suggestedTripName}
        onClose={handleModalClose}
        onCreateTrip={handleTripCreate}
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
    fontWeight: "700",
    color: "#1f2937",
  },
  blurContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
});