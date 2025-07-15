import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
  Animated,
} from "react-native";
import TripCard from "../../../components/TripCard";
import NewTripButton from "../../../components/FAB";
import FilterButton from "../../../components/FilterButton";
import EmptyState from "../../../components/EmptyState";
import StatsHeader from "../../../components/StatsHeader";
import DestinationModal from "../../../components/DestinationModal";
import TripNameModal from "../../../components/TripNameModal";
import TripDetailsModal, { TripDetails } from "../../../components/TripDetailsModal";
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
  const [showTripDetailsModal, setShowTripDetailsModal] = useState(false);
  const [tripName, setTripName] = useState("");

  const filters = ["All", "Upcoming", "Completed"];

  const filteredTrips =
    selectedFilter === "All"
      ? trips
      : trips.filter((trip) => trip.status === selectedFilter);

  const handleNewTripPress = () => {
    setShowDestinationModal(true);
  };

  const handleDestinationSelect = (destinations: string[], selectedVibes?: string[]) => {
    // Use the first destination for the trip name suggestion, or combine multiple
    const primaryDestination = destinations[0];
    
    // Format destination text with proper truncation for many destinations
    let destinationText;
    if (destinations.length === 1) {
      destinationText = primaryDestination;
    } else if (destinations.length <= 5) {
      // Show all destinations normally
      destinationText = destinations.length === 2 
        ? `${destinations[0]} & ${destinations[1]}`
        : `${destinations.slice(0, -1).join(', ')} & ${destinations[destinations.length - 1]}`;
    } else {
      // Show first 5 destinations with "..." for more than 5
      const first5 = destinations.slice(0, 5);
      destinationText = `${first5.join(', ')}...`;
    }
    
    setSelectedDestination(destinationText);
    
    // Generate suggested trip name based on primary destination
    const suggestions = [
      `${primaryDestination} Adventure`,
      `${primaryDestination} Explorer`,
      `${primaryDestination} Journey`,
      `${primaryDestination} Experience`,
      `Discover ${primaryDestination}`,
    ];
    setSuggestedTripName(suggestions[Math.floor(Math.random() * suggestions.length)]);
    
    // TODO: Use selectedVibes to influence trip suggestions and services in later steps
    if (selectedVibes && selectedVibes.length > 0) {
      console.log('Selected vibes for trip:', selectedVibes);
    }
    
    console.log('Selected destinations:', destinations);
    
    // Close destination modal with animation to TripName height, then show TripName modal
    setTimeout(() => {
      setShowDestinationModal(false);
      setShowTripNameModal(true);
    }, 250); // Match the animation duration
  };
  const handleTripNameConfirm = (name: string) => {
    setTripName(name);
    // Close TripName modal with animation to TripDetails height, then show TripDetails modal
    setTimeout(() => {
      setShowTripNameModal(false);
      setShowTripDetailsModal(true);
    }, 250); // Match the animation duration
  };

  const handleTripDetailsConfirm = (details: TripDetails) => {
    const newTrip = {
      id: (trips.length + 1).toString(),
      title: tripName,
      details: `${selectedDestination} | ${details.members} member${details.members > 1 ? 's' : ''}`,
      budget: `${details.currency === 'LKR' ? 'Rs.' : details.currency === 'USD' ? '$' : details.currency === 'EUR' ? '€' : '£'} ${details.budget}`,
      duration: `${calculateDuration(details.startDate, details.endDate)} Days`,
      status: "Upcoming",
    };
    
    setTrips([newTrip, ...trips]);
    setShowTripDetailsModal(false);
    handleModalClose();
  };

  const calculateDuration = (start: Date, end: Date) => {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleModalClose = () => {
    setShowDestinationModal(false);
    setShowTripNameModal(false);
    setShowTripDetailsModal(false);
    setSelectedDestination("");
    setSuggestedTripName("");
    setTripName("");
  }

  const blurOpacity = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const isAnyModalVisible = showDestinationModal || showTripNameModal || showTripDetailsModal;
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
  }, [showDestinationModal, showTripNameModal, showTripDetailsModal, blurOpacity]);

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
      
      {/* Blur Overlay */}
      {(showDestinationModal || showTripNameModal || showTripDetailsModal) && (
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
        animateToTripNameHeight={!!selectedDestination}
      />
      
      <TripNameModal
        visible={showTripNameModal}
        destination={selectedDestination}
        suggestedName={suggestedTripName}
        onClose={handleModalClose}
        onCreateTrip={handleTripNameConfirm}
        startFromIntermediate={!!selectedDestination}
        animateToTripDetailsHeight={!!tripName}
      />

      <TripDetailsModal
        visible={showTripDetailsModal}
        onClose={handleModalClose}
        onConfirm={handleTripDetailsConfirm}
        tripTitle={tripName}
        startFromIntermediate={!!tripName}
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
  blurContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
});