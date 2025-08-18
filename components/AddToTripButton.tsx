import DestinationModal from "@/components/DestinationModal";
import TripDetailsModal, { TripDetails } from "@/components/TripDetailsModal";
import TripNameModal from "@/components/TripNameModal";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Platform,
  Text,
  ToastAndroid,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from "react-native";

// Trip type interface
interface Trip {
  id: string;
  name: string;
  days: string[];
}

// Mock data for existing trips - replace with actual data from your trip management system
const existingTrips: Trip[] = [
  {
    id: "1",
    name: "Colombo Adventure",
    days: ["Day 1", "Day 2", "Day 3"],
  },
  {
    id: "2",
    name: "Kandy Cultural Tour",
    days: ["Day 1", "Day 2"],
  },
  {
    id: "3",
    name: "Southern Coast Explorer",
    days: ["Day 1", "Day 2", "Day 3", "Day 4"],
  },
];

interface AddToTripButtonProps {
  onTripAdded?: () => void;
  serviceName?: string;
  className?: string;
  style?: ViewStyle;
  buttonText?: string;
  addedText?: string;
}

const AddToTripButton: React.FC<AddToTripButtonProps> = ({
  onTripAdded,
  serviceName,
  className,
  style,
  buttonText = "Add to Trip",
  addedText = "Booked",
}) => {
  // Trip-related states
  const [tripType, setTripType] = useState("existing");
  const [selectedTrip, setSelectedTrip] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [tripAdded, setTripAdded] = useState(false);
  const [showTripModal, setShowTripModal] = useState(false);
  const tripModalAnim = useRef(new Animated.Value(0)).current;

  // Modal flow states
  const [showDestinationModal, setShowDestinationModal] = useState(false);
  const [showTripNameModal, setShowTripNameModal] = useState(false);
  const [showTripDetailsModal, setShowTripDetailsModal] = useState(false);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>(
    []
  );
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [tripName, setTripName] = useState("");
  const [suggestedTripName, setSuggestedTripName] = useState("");
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null);

  // Animation effect for trip modal
  useEffect(() => {
    if (showTripModal) {
      Animated.timing(tripModalAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(tripModalAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [showTripModal]);

  const handleAddToTrip = () => {
    setShowTripModal(true);
  };

  const handleConfirmAddToTrip = () => {
    setShowTripModal(false);
    if (tripType === "new") {
      setShowDestinationModal(true);
    } else {
      setTripAdded(true);
      ToastAndroid.show("Added to trip!", ToastAndroid.SHORT);
      onTripAdded?.();
    }
  };

  const handleTripCreated = (details: TripDetails) => {
    setTripDetails(details);
    setShowTripDetailsModal(false);
    setTripAdded(true);
    ToastAndroid.show("Trip created successfully!", ToastAndroid.SHORT);
    onTripAdded?.();
  };

  return (
    <>
      {/* Add to Trip Button */}
      <TouchableOpacity
        onPress={handleAddToTrip}
        className={
          className ||
          `mx-6 py-3 my-4 rounded-full items-center ${
            tripAdded ? "bg-green-500" : "bg-primary"
          }`
        }
        style={style}
        disabled={tripAdded}
      >
        <Text className="text-white font-semibold text-lg">
          {tripAdded ? addedText : buttonText}
        </Text>
      </TouchableOpacity>

      {/* Modal for Add to Trip */}
      <Modal visible={showTripModal} transparent animationType="none">
        <TouchableWithoutFeedback onPress={() => setShowTripModal(false)}>
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.2)" }} />
        </TouchableWithoutFeedback>
        <Animated.View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            backgroundColor: "#fff",
            padding: 24,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 8,
            transform: [
              {
                translateY: tripModalAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [400, 0],
                }),
              },
            ],
            zIndex: 1001,
          }}
        >
          <Text
            style={{
              fontSize: 22,
              fontWeight: "bold",
              color: "#374151",
              marginBottom: 18,
            }}
          >
            Add to Trip
          </Text>

          <>
            <Text
              style={{ marginBottom: 6, fontWeight: "600", color: "#374151" }}
            >
              Select Trip
            </Text>
            {existingTrips.map((trip) => (
              <TouchableOpacity
                key={trip.id}
                onPress={() => {
                  setSelectedTrip(trip.id);
                  setSelectedDay("");
                }}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  marginVertical: 4,
                  backgroundColor:
                    selectedTrip === trip.id ? "#008080" : "#f3f4f6",
                }}
              >
                <Text
                  style={{
                    color: selectedTrip === trip.id ? "#fff" : "#374151",
                    fontWeight: "500",
                  }}
                >
                  {trip.name}
                </Text>
              </TouchableOpacity>
            ))}
            <View style={{ marginVertical: 8 }}>
              <TouchableOpacity
                onPress={() => {
                  setTripType("new");
                  setShowTripModal(false);
                  setShowDestinationModal(true);
                }}
                style={{
                  padding: 12,
                  borderRadius: 36,
                  marginVertical: 4,
                  backgroundColor: "#ffffff",
                  borderColor: "#008080",
                  borderWidth: 3,
                }}
              >
                <View
                  style={{
                    alignItems: "center",
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <Text
                    style={{
                      color: "#008080",
                      fontWeight: "600",
                      alignItems: "center",
                      textAlign: "center",
                      fontSize: 24,
                    }}
                  >
                    +
                  </Text>
                  <Text
                    style={{
                      color: "#008080",
                      fontWeight: "600",
                      alignItems: "center",
                      textAlign: "center",
                    }}
                  >
                    New Trip
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {selectedTrip && (
              <>
                <Text
                  style={{
                    marginTop: 16,
                    marginBottom: 6,
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  Select Day
                </Text>
                {existingTrips
                  .find((trip) => trip.id === selectedTrip)
                  ?.days.map((day, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => setSelectedDay(day)}
                      style={{
                        padding: 12,
                        borderRadius: 12,
                        marginVertical: 4,
                        backgroundColor:
                          selectedDay === day ? "#008080" : "#f3f4f6",
                      }}
                    >
                      <Text
                        style={{
                          color: selectedDay === day ? "#fff" : "#374151",
                          fontWeight: "500",
                        }}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </>
            )}
          </>

          {selectedTrip && selectedDay && (
            <View style={{ marginTop: 16 }}>
              <Text
                style={{
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: 8,
                }}
              >
                Select Time
              </Text>
              <TouchableOpacity
                onPress={() => setShowTimePicker(true)}
                style={{
                  backgroundColor: "#f3f4f6",
                  padding: 12,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#374151", fontWeight: "500" }}>
                  {selectedTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={selectedTime}
                  mode="time"
                  is24Hour={true}
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(event, date) => {
                    if (date) setSelectedTime(date);
                    setShowTimePicker(false);
                  }}
                />
              )}
            </View>
          )}

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 24,
            }}
          >
            <TouchableOpacity
              onPress={() => setShowTripModal(false)}
              style={{
                backgroundColor: "#e5e7eb",
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 999,
              }}
            >
              <Text style={{ color: "#374151", fontWeight: "500" }}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirmAddToTrip}
              style={{
                backgroundColor: "#008080",
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 999,
                opacity: tripAdded ? 0.6 : 1,
              }}
              disabled={tripAdded || (!selectedTrip && tripType !== "new")}
            >
              <Text style={{ color: "#fff", fontWeight: "500" }}>
                {tripAdded ? "Added" : "Confirm"}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>

      {/* Sequential Modal Flow */}
      {(showDestinationModal || showTripNameModal || showTripDetailsModal) && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.2)",
            zIndex: 1000,
          }}
          pointerEvents="none"
        />
      )}

      <DestinationModal
        visible={showDestinationModal}
        onClose={() => setShowDestinationModal(false)}
        onDestinationSelect={(destinations: string[], vibes?: string[]) => {
          setSelectedDestinations(destinations);
          setSelectedVibes(vibes || []);
          setShowDestinationModal(false);
          setSuggestedTripName(
            destinations[0] ? `${destinations[0]} Explorer` : ""
          );
          setShowTripNameModal(true);
        }}
        animateToTripNameHeight={!!selectedDestinations.length}
      />

      <TripNameModal
        visible={showTripNameModal}
        destination={selectedDestinations.join(", ")}
        suggestedName={suggestedTripName}
        onClose={() => setShowTripNameModal(false)}
        onCreateTrip={(name: string) => {
          setTripName(name);
          setShowTripNameModal(false);
          setShowTripDetailsModal(true);
        }}
        startFromIntermediate={!!selectedDestinations.length}
        animateToTripDetailsHeight={!!tripName}
      />

      <TripDetailsModal
        visible={showTripDetailsModal}
        onClose={() => setShowTripDetailsModal(false)}
        onConfirm={handleTripCreated}
        tripTitle={tripName}
        startFromIntermediate={!!tripName}
      />
    </>
  );
};

export default AddToTripButton;
