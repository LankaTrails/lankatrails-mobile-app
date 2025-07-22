import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from "react-native";
import { addToTrip, getMyTrips } from "../services/tripService";
import { ServiceDTO, Trip, TripItem } from "../types/triptypes";
import CustomDatePicker from "./CustomDatePicker";
import LongButton from "./LongButton";
import TripCreationFlow from "./TripCreationFlow";

interface TripSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onTripSelected: (trip: Trip) => void;
  onCreateNewTrip: () => void;
  service: ServiceDTO;
}

interface AddToTripButtonProps {
  service: ServiceDTO;
  onTripAdded?: () => void;
  style?: ViewStyle;
  buttonText?: string;
}

const TripSelectionModal: React.FC<TripSelectionModalProps> = ({
  visible,
  onClose,
  onTripSelected,
  onCreateNewTrip,
  service,
}) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const screenHeight = Dimensions.get("window").height;

  useEffect(() => {
    if (visible) {
      loadTrips();
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const loadTrips = async () => {
    try {
      setIsLoading(true);
      console.log("Loading trips from getMyTrips...");
      const response = await getMyTrips();
      console.log("getMyTrips response:", response);

      if (response.success && response.data) {
        console.log(`Received ${response.data.length} total trips`);
        console.log("All trips:", response.data);

        // Show all trips for debugging - remove status filter temporarily
        setTrips(response.data);

        // Log the status of each trip
        response.data.forEach((trip, index) => {
          console.log(
            `Trip ${index + 1}: ${trip.tripName} - Status: ${
              trip.status || "NO STATUS"
            }`
          );
        });

        // // Filter only planning trips (ones you can still add items to)
        // const planningTrips = response.data.filter(
        //   (trip) => trip.status === "PLANNING"
        // );
        // console.log(`Filtered to ${planningTrips.length} planning trips:`, planningTrips);
        // setTrips(planningTrips);
      } else {
        console.error("API call failed:", response.message);
        setTrips([]);
      }
    } catch (error) {
      console.error("Error loading trips:", error);
      setTrips([]);
      Alert.alert("Error", "Failed to load your trips");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTripDates = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const startFormatted = start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    return `${startFormatted} • ${diffDays} day${diffDays > 1 ? "s" : ""}`;
  };

  const modalTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight * 0.7, 0],
  });

  const renderTripItem = ({ item }: { item: Trip }) => (
    <TouchableOpacity
      style={styles.tripItem}
      onPress={() => onTripSelected(item)}
    >
      <View style={styles.tripInfo}>
        <Text style={styles.tripTitle}>{item.tripName}</Text>
        <Text style={styles.tripDetails}>
          {formatTripDates(item.startDate, item.endDate)}
        </Text>
        <Text style={styles.tripLocations}>
          {item.locations.length} location{item.locations.length > 1 ? "s" : ""}{" "}
          •{item.numberOfAdults + item.numberOfChildren} traveler
          {item.numberOfAdults + item.numberOfChildren > 1 ? "s" : ""}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#6B7280" />
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="none">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[styles.modal, { transform: [{ translateY: modalTranslateY }] }]}
      >
        <View style={styles.header}>
          <Text style={styles.modalTitle}>Add to Trip</Text>
          <Text style={styles.subtitle}>
            Add "{service.serviceName}" to one of your trips
          </Text>
        </View>

        <View style={styles.content}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#008080" />
              <Text style={styles.loadingText}>Loading your trips...</Text>
            </View>
          ) : (
            <>
              {/* Create New Trip Option */}
              <TouchableOpacity
                style={styles.createTripButton}
                onPress={onCreateNewTrip}
              >
                <View style={styles.createTripIcon}>
                  <Ionicons name="add" size={24} color="#008080" />
                </View>
                <View style={styles.createTripInfo}>
                  <Text style={styles.createTripTitle}>Create New Trip</Text>
                  <Text style={styles.createTripSubtitle}>
                    Start a new trip with this service
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Existing Trips */}
              {trips.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Your Planning Trips</Text>
                  <FlatList
                    data={trips}
                    renderItem={renderTripItem}
                    keyExtractor={(item) => item.tripId.toString()}
                    style={styles.tripsList}
                    showsVerticalScrollIndicator={false}
                  />
                </>
              )}

              {trips.length === 0 && !isLoading && (
                <View style={styles.emptyState}>
                  <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
                  <Text style={styles.emptyStateTitle}>No Active Trips</Text>
                  <Text style={styles.emptyStateText}>
                    Create your first trip to start planning your adventure
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </Animated.View>
    </Modal>
  );
};

const AddToTripButton: React.FC<AddToTripButtonProps> = ({
  service,
  onTripAdded,
  style,
  buttonText = "Add to Trip",
}) => {
  const [showTripSelection, setShowTripSelection] = useState(false);
  const [showNewTripFlow, setShowNewTripFlow] = useState(false);
  const [showTimeSelection, setShowTimeSelection] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(
    new Date(Date.now() + 2 * 60 * 60 * 1000)
  ); // 2 hours later
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToTripPress = () => {
    setShowTripSelection(true);
  };

  const handleTripSelected = (trip: Trip) => {
    setSelectedTrip(trip);
    setShowTripSelection(false);
    setShowTimeSelection(true);
  };

  const handleCreateNewTrip = () => {
    setShowTripSelection(false);
    setShowNewTripFlow(true);
  };

  const handleTimeConfirmed = async () => {
    if (!selectedTrip) return;

    setIsAdding(true);
    try {
      const tripItem: TripItem = {
        type: "SERVICE",
        service: service,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      };

      const response = await addToTrip(selectedTrip.tripId, tripItem);

      if (response.success) {
        setShowTimeSelection(false);
        Alert.alert(
          "Added to Trip!",
          `"${service.serviceName}" has been added to "${selectedTrip.tripName}".`,
          [{ text: "OK", onPress: () => onTripAdded?.() }]
        );
      } else {
        Alert.alert(
          "Error",
          response.message || "Failed to add service to trip"
        );
      }
    } catch (error) {
      console.error("Error adding to trip:", error);
      Alert.alert("Error", "Failed to add service to trip. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleNewTripCreated = async (trip: Trip) => {
    setSelectedTrip(trip);
    setShowNewTripFlow(false);
    setShowTimeSelection(true);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.addToTripButton, style]}
        onPress={handleAddToTripPress}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.addToTripButtonText}>{buttonText}</Text>
      </TouchableOpacity>

      <TripSelectionModal
        visible={showTripSelection}
        onClose={() => setShowTripSelection(false)}
        onTripSelected={handleTripSelected}
        onCreateNewTrip={handleCreateNewTrip}
        service={service}
      />

      <TripCreationFlow
        visible={showNewTripFlow}
        onClose={() => setShowNewTripFlow(false)}
        onTripCreated={handleNewTripCreated}
      />

      <TimeSelectionModal
        visible={showTimeSelection}
        onClose={() => setShowTimeSelection(false)}
        onConfirm={handleTimeConfirmed}
        service={service}
        trip={selectedTrip}
        startTime={startTime}
        endTime={endTime}
        onStartTimeChange={setStartTime}
        onEndTimeChange={setEndTime}
        isLoading={isAdding}
      />
    </>
  );
};

interface TimeSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  service: ServiceDTO;
  trip: Trip | null;
  startTime: Date;
  endTime: Date;
  onStartTimeChange: (time: Date) => void;
  onEndTimeChange: (time: Date) => void;
  isLoading: boolean;
}

const TimeSelectionModal: React.FC<TimeSelectionModalProps> = ({
  visible,
  onClose,
  onConfirm,
  service,
  trip,
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  isLoading,
}) => {
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const screenHeight = Dimensions.get("window").height;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const formatDateTime = (date: Date) => {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const modalTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight * 0.5, 0],
  });

  return (
    <Modal visible={visible} transparent animationType="none">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.timeModal,
          { transform: [{ translateY: modalTranslateY }] },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.modalTitle}>Select Time</Text>
          <Text style={styles.subtitle}>
            When do you want to visit "{service.serviceName}"?
          </Text>
        </View>

        <View style={styles.timeContent}>
          <Text style={styles.tripName}>Adding to: {trip?.tripName}</Text>

          {/* Start Time */}
          <TouchableOpacity
            style={styles.timeSelector}
            onPress={() => setShowStartDatePicker(true)}
          >
            <View style={styles.timeInfo}>
              <Text style={styles.timeLabel}>Start Time</Text>
              <Text style={styles.timeValue}>{formatDateTime(startTime)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>

          {/* End Time */}
          <TouchableOpacity
            style={styles.timeSelector}
            onPress={() => setShowEndDatePicker(true)}
          >
            <View style={styles.timeInfo}>
              <Text style={styles.timeLabel}>End Time</Text>
              <Text style={styles.timeValue}>{formatDateTime(endTime)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <LongButton
            label={isLoading ? "Adding..." : "Add to Trip"}
            onPress={isLoading ? () => {} : onConfirm}
          />
        </View>
      </Animated.View>

      <CustomDatePicker
        visible={showStartDatePicker}
        onClose={() => setShowStartDatePicker(false)}
        onConfirm={(date) => {
          onStartTimeChange(date);
          setShowStartDatePicker(false);
        }}
        initialDate={startTime}
        title="Select Start Date & Time"
      />

      <CustomDatePicker
        visible={showEndDatePicker}
        onClose={() => setShowEndDatePicker(false)}
        onConfirm={(date) => {
          onEndTimeChange(date);
          setShowEndDatePicker(false);
        }}
        initialDate={endTime}
        minimumDate={startTime}
        title="Select End Date & Time"
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  addToTripButton: {
    backgroundColor: "#008080",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginVertical: 8,
  },
  addToTripButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modal: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 20,
    height: "70%",
  },
  timeModal: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 20,
    height: "50%",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  content: {
    flex: 1,
  },
  timeContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
  createTripButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F8FF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E6F7FF",
  },
  createTripIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#008080",
    alignItems: "center",
    justifyContent: "center",
  },
  createTripInfo: {
    flex: 1,
    marginLeft: 16,
  },
  createTripTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#008080",
    marginBottom: 2,
  },
  createTripSubtitle: {
    fontSize: 14,
    color: "#374151",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#008080",
    marginBottom: 16,
  },
  tripsList: {
    flex: 1,
  },
  tripItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tripInfo: {
    flex: 1,
  },
  tripTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  tripDetails: {
    fontSize: 14,
    color: "#008080",
    marginBottom: 2,
  },
  tripLocations: {
    fontSize: 12,
    color: "#6B7280",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  tripName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#008080",
    marginBottom: 20,
    textAlign: "center",
  },
  timeSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  timeInfo: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 16,
    color: "#008080",
    fontWeight: "600",
  },
  buttonContainer: {
    paddingTop: 20,
  },
});

export default AddToTripButton;
