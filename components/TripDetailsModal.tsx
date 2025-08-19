import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import CustomDatePicker from "./CustomDatePicker";

interface TripDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (details: TripDetails) => void;
  initialDetails?: TripDetails;
  tripTitle?: string; // New prop to receive trip title from TripNameModal
  isEditing?: boolean; // New prop to indicate editing mode
  startFromIntermediate?: boolean; // For seamless transition from TripNameModal
  numberOfAdults?: number; // Pass adults count from PersonCountModal
  numberOfChildren?: number; // Pass children count from PersonCountModal
}

export interface TripDetails {
  budget: string;
  numberOfAdults: number;
  numberOfChildren: number;
  startDate: Date;
  endDate: Date;
  currency: string;
  distance?: string; // Optional since it will be calculated later via Google APIs
  title?: string; // Optional trip title for editing mode
}

export default function TripDetailsModal({
  visible,
  onClose,
  onConfirm,
  initialDetails,
  tripTitle,
  isEditing = false,
  startFromIntermediate = false,
  numberOfAdults: initialAdults,
  numberOfChildren: initialChildren,
}: TripDetailsModalProps) {
  const [budget, setBudget] = useState(initialDetails?.budget || "");
  const [numberOfAdults, setNumberOfAdults] = useState(
    initialDetails?.numberOfAdults || initialAdults || 1
  );
  const [numberOfChildren, setNumberOfChildren] = useState(
    initialDetails?.numberOfChildren || initialChildren || 0
  );
  const [startDate, setStartDate] = useState(
    initialDetails?.startDate || new Date()
  );
  const [endDate, setEndDate] = useState(
    initialDetails?.endDate || new Date(Date.now() + 24 * 60 * 60 * 1000)
  );
  const [currency, setCurrency] = useState(initialDetails?.currency || "USD");
  const [title, setTitle] = useState(initialDetails?.title || tripTitle || "");
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Animation for slide up effect
  const slideAnim = useRef(
    new Animated.Value(startFromIntermediate ? 0.3 : 0)
  ).current;
  const screenHeight = Dimensions.get("window").height;

  useEffect(() => {
    if (visible) {
      // Slide up animation
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: startFromIntermediate ? 200 : 250,
        useNativeDriver: true,
      }).start();
    } else {
      // Slide down animation
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim, startFromIntermediate]);

  // Update title when tripTitle prop changes (for new trip creation flow)
  useEffect(() => {
    if (tripTitle && !isEditing) {
      setTitle(tripTitle);
    }
  }, [tripTitle, isEditing]);

  const currencies = [
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "LKR", symbol: "Rs.", name: "Sri Lankan Rupee" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "GBP", symbol: "£", name: "British Pound" },
  ];

  const getTotalTravelers = () => numberOfAdults + numberOfChildren;

  const handleStartDateChange = () => {
    setShowStartDatePicker(true);
  };

  const handleEndDateChange = () => {
    setShowEndDatePicker(true);
  };

  const handleStartDateConfirm = (selectedDate: Date) => {
    setShowStartDatePicker(false);
    setStartDate(selectedDate);
    // If start date is after end date, adjust end date
    if (selectedDate >= endDate) {
      setEndDate(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000));
    }
  };

  const handleEndDateConfirm = (selectedDate: Date) => {
    setShowEndDatePicker(false);
    // Ensure end date is not before start date
    if (selectedDate <= startDate) {
      Alert.alert("Invalid Date", "End date must be after start date");
      return;
    }
    setEndDate(selectedDate);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateDays = () => {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleConfirm = () => {
    if (!budget.trim()) {
      Alert.alert("Missing Information", "Please enter your budget");
      return;
    }

    if (isNaN(Number(budget))) {
      Alert.alert("Invalid Budget", "Please enter a valid number for budget");
      return;
    }

    if (!title.trim()) {
      Alert.alert("Missing Information", "Please enter a trip title");
      return;
    }

    const tripDetails: TripDetails = {
      budget: budget.trim(),
      numberOfAdults,
      numberOfChildren,
      startDate,
      endDate,
      currency,
      title: title.trim(),
    };

    onConfirm(tripDetails);
  };

  const selectedCurrency = currencies.find((c) => c.code === currency);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <BlurView intensity={50} tint="dark" style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop}></View>
        </TouchableWithoutFeedback>
        <Animated.View
          style={[
            styles.modal,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [screenHeight * 0.3, 0], // Start at intermediate position (30% from bottom) or from bottom
                  }),
                },
              ],
            },
          ]}
        >
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Trip Title Section - Always visible now */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trip Title</Text>
              <TextInput
                style={styles.titleInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter trip title"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Budget Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Budget</Text>
              <View style={styles.budgetContainer}>
                <View style={styles.currencySelector}>
                  <TouchableOpacity
                    style={styles.currencyButton}
                    onPress={() => setShowCurrencySelector(true)}
                  >
                    <Text style={styles.currencyText}>
                      {selectedCurrency?.symbol} {selectedCurrency?.code}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.budgetInput}
                  value={budget}
                  onChangeText={setBudget}
                  placeholder="Enter amount"
                  keyboardType="numeric"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Travelers Section - Read-only display */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Number of Travelers</Text>
              <View style={styles.travelersDisplay}>
                <View style={styles.travelersInfo}>
                  <Text style={styles.travelersCount}>
                    {getTotalTravelers()}{" "}
                    {getTotalTravelers() === 1 ? "Traveler" : "Travelers"}
                  </Text>
                  <Text style={styles.travelersBreakdown}>
                    {numberOfAdults} adult{numberOfAdults > 1 ? "s" : ""}
                    {numberOfChildren > 0 &&
                      `, ${numberOfChildren} child${
                        numberOfChildren > 1 ? "ren" : ""
                      }`}
                  </Text>
                </View>
                <Ionicons name="people" size={24} color="#008080" />
              </View>
            </View>

            {/* Date Range Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Travel Dates</Text>

              {/* Start Date */}
              <View style={styles.dateItem}>
                <View style={styles.dateLabel}>
                  <Ionicons name="calendar-outline" size={20} color="#008080" />
                  <Text style={styles.dateLabelText}>Start Date</Text>
                </View>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={handleStartDateChange}
                >
                  <Text style={styles.dateText}>{formatDate(startDate)}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* End Date */}
              <View style={styles.dateItem}>
                <View style={styles.dateLabel}>
                  <Ionicons name="calendar-outline" size={20} color="#008080" />
                  <Text style={styles.dateLabelText}>End Date</Text>
                </View>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={handleEndDateChange}
                >
                  <Text style={styles.dateText}>{formatDate(endDate)}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Duration Display */}
              <View style={styles.durationContainer}>
                <Ionicons name="time-outline" size={16} color="#6B7280" />
                <Text style={styles.durationText}>
                  {calculateDays()} {calculateDays() === 1 ? "day" : "days"}
                </Text>
              </View>
            </View>

            {/* Summary Section */}
            <View style={styles.summarySection}>
              <Text style={styles.summaryTitle}>Trip Summary</Text>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Budget:</Text>
                <Text style={styles.summaryValue}>
                  {budget ? `${selectedCurrency?.symbol}${budget}` : "Not set"}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Travelers:</Text>
                <Text style={styles.summaryValue}>{getTotalTravelers()}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Duration:</Text>
                <Text style={styles.summaryValue}>
                  {calculateDays()} {calculateDays() === 1 ? "day" : "days"}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>
                {isEditing ? "Update Trip" : "Create Trip"}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </BlurView>

      {/* Currency Selector Modal */}
      <Modal visible={showCurrencySelector} transparent animationType="fade">
        <View style={styles.overlay}>
          <TouchableWithoutFeedback
            onPress={() => setShowCurrencySelector(false)}
          >
            <View style={styles.backdrop}></View>
          </TouchableWithoutFeedback>
          <View style={styles.currencyModal}>
            <Text style={styles.currencyModalTitle}>Select Currency</Text>
            {currencies.map((curr) => (
              <TouchableOpacity
                key={curr.code}
                style={styles.currencyOption}
                onPress={() => {
                  setCurrency(curr.code);
                  setShowCurrencySelector(false);
                }}
              >
                <Text style={styles.currencySymbol}>{curr.symbol}</Text>
                <View style={styles.currencyInfo}>
                  <Text style={styles.currencyCode}>{curr.code}</Text>
                  <Text style={styles.currencyName}>{curr.name}</Text>
                </View>
                {currency === curr.code && (
                  <Ionicons name="checkmark" size={20} color="#008080" />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.currencyCloseButton}
              onPress={() => setShowCurrencySelector(false)}
            >
              <Text style={styles.currencyCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Custom Date Pickers */}
      <CustomDatePicker
        visible={showStartDatePicker}
        onClose={() => setShowStartDatePicker(false)}
        onConfirm={handleStartDateConfirm}
        initialDate={startDate}
        minimumDate={new Date()}
        title="Select Start Date"
      />

      <CustomDatePicker
        visible={showEndDatePicker}
        onClose={() => setShowEndDatePicker(false)}
        onConfirm={handleEndDateConfirm}
        initialDate={endDate}
        minimumDate={new Date(startDate.getTime() + 24 * 60 * 60 * 1000)}
        title="Select End Date"
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "transparent",
  },
  modal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 12,
    height: "80%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    color: "#111827",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#008080",
    marginBottom: 12,
  },
  budgetContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 20,
    overflow: "hidden",
  },
  currencySelector: {
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRightWidth: 1,
    borderRightColor: "#D1D5DB",
  },
  currencyButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  currencyText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginRight: 4,
  },
  budgetInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: "#1F2937",
    height: 45,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: "#1F2937",
    backgroundColor: "#F9FAFB",
    height: 45,
  },
  membersContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 26,
    padding: 16,
  },
  memberButton: {
    width: 40,
    height: 40,
    borderRadius: 26,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#008080",
  },
  membersDisplay: {
    alignItems: "center",
    marginHorizontal: 32,
  },
  membersNumber: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1F2937",
  },
  membersLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  travelersDisplay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F0F8FF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E6F7FF",
  },
  travelersInfo: {
    flex: 1,
  },
  travelersCount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#008080",
    marginBottom: 4,
  },
  travelersBreakdown: {
    fontSize: 14,
    color: "#374151",
  },
  dateItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dateLabel: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  dateLabelText: {
    fontSize: 16,
    color: "#374151",
    marginLeft: 8,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 26,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
    marginRight: 8,
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    padding: 8,
    backgroundColor: "rgba(0, 128, 128, 0.1)",
    borderRadius: 26,
  },
  durationText: {
    fontSize: 14,
    color: "#008080",
    fontWeight: "500",
    marginLeft: 4,
  },
  summarySection: {
    backgroundColor: "#F9FAFB",
    borderRadius: 26,
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    borderTopColor: "#F3F4F6",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginRight: 8,
    marginBottom: 26,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 26,
    backgroundColor: "#008080",
    marginLeft: 8,
    marginBottom: 26,
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#ffffff",
  },
  currencyOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  currencyModal: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    width: "80%",
    maxHeight: "60%",
    padding: 20,
    margin: 20,
    alignSelf: "center",
    position: "absolute",
    top: "20%",
    left: "10%",
    right: "10%",
  },
  currencyModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
    textAlign: "center",
  },
  currencyOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    width: 40,
    textAlign: "center",
  },
  currencyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
  },
  currencyName: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  currencyCloseButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    alignItems: "center",
  },
  currencyCloseText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
  },
});
