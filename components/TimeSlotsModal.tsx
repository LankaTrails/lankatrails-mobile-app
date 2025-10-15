import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { BookingType } from "../types/serviceTypes";
import { TimeSlotsResponseDTO } from "../types/triptypes";
import LongButton from "./LongButton";

interface TimeSlotsModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (timeSlot: string) => void;
  availableSlots?: TimeSlotsResponseDTO | null;
  bookingType?: BookingType;
  serviceName?: string;
  isLoading?: boolean;
}

const MODAL_HEIGHT = 0.6; // 60% of screen
const screenHeight = Dimensions.get("window").height;

export default function TimeSlotsModal({
  visible,
  onClose,
  onConfirm,
  availableSlots,
  bookingType = "TIME_SLOTS",
  serviceName = "service",
  isLoading = false,
}: TimeSlotsModalProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [customStartHour, setCustomStartHour] = useState(9);
  const [customStartMinute, setCustomStartMinute] = useState(0);
  const [customEndHour, setCustomEndHour] = useState(10);
  const [customEndMinute, setCustomEndMinute] = useState(0);

  // Modal animation
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setSelectedSlot(null);
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot);
  };

  const handleConfirm = () => {
    if (bookingType === "TIME_SLOTS" && selectedSlot) {
      onConfirm(selectedSlot);
    } else if (bookingType === "FLEXIBLE_HOURS") {
      const startTime = `${customStartHour
        .toString()
        .padStart(2, "0")}:${customStartMinute.toString().padStart(2, "0")}`;
      const endTime = `${customEndHour
        .toString()
        .padStart(2, "0")}:${customEndMinute.toString().padStart(2, "0")}`;
      onConfirm(`${startTime}-${endTime}`);
    } else {
      // For FIXED_TIME, just proceed with default time
      onConfirm("09:00");
    }
  };

  const canConfirm = () => {
    if (bookingType === "TIME_SLOTS") {
      return selectedSlot !== null;
    }
    return true;
  };

  const formatTimeSlot = (startTime: string, endTime: string) => {
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    };

    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  const getModalTitle = () => {
    switch (bookingType) {
      case "TIME_SLOTS":
        return "Available Time Slots";
      case "FLEXIBLE_HOURS":
        return "Select Time";
      case "FIXED_TIME":
        return "Confirm Time";
      default:
        return "Select Time";
    }
  };

  const getInstructions = () => {
    switch (bookingType) {
      case "TIME_SLOTS":
        return "Choose from the available time slots";
      case "FLEXIBLE_HOURS":
        return "Set your preferred start and end time";
      case "FIXED_TIME":
        return "This service has a fixed duration";
      default:
        return "Select your preferred time";
    }
  };

  const modalTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight * MODAL_HEIGHT, 0],
  });

  const renderTimeSlots = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#008080" />
          <Text style={styles.loadingText}>Loading available slots...</Text>
        </View>
      );
    }

    if (
      !availableSlots ||
      !availableSlots.content ||
      availableSlots.content.length === 0
    ) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="time-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyStateTitle}>No Available Slots</Text>
          <Text style={styles.emptyStateText}>
            Sorry, there are no available time slots for the selected date.
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={availableSlots.content}
        renderItem={({ item }) => {
          const slotId = `${item.slotStartTime}-${item.slotEndTime}`;
          const isSelected = selectedSlot === slotId;

          return (
            <TouchableOpacity
              style={[
                styles.timeSlotItem,
                isSelected && styles.selectedTimeSlot,
              ]}
              onPress={() => handleSlotSelect(slotId)}
            >
              <View style={styles.timeSlotInfo}>
                <Text
                  style={[
                    styles.timeSlotText,
                    isSelected && styles.selectedTimeSlotText,
                  ]}
                >
                  {formatTimeSlot(item.slotStartTime, item.slotEndTime)}
                </Text>
              </View>
              {isSelected && (
                <Ionicons name="checkmark-circle" size={24} color="#008080" />
              )}
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => `${item.slotStartTime}-${item.slotEndTime}`}
        showsVerticalScrollIndicator={false}
        style={styles.slotsList}
      />
    );
  };

  const renderFlexibleHours = () => (
    <View style={styles.flexibleHoursContainer}>
      <Text style={styles.flexibleHoursTitle}>Set your preferred time</Text>

      {/* Start Time */}
      <View style={styles.timePickerSection}>
        <Text style={styles.timePickerLabel}>Start Time</Text>
        <View style={styles.timePickerRow}>
          <View style={styles.timePickerContainer}>
            <TouchableOpacity
              onPress={() => setCustomStartHour((h) => (h === 0 ? 23 : h - 1))}
              style={styles.timeButton}
            >
              <Ionicons name="chevron-up" size={20} color="#008080" />
            </TouchableOpacity>
            <Text style={styles.timeValue}>
              {customStartHour.toString().padStart(2, "0")}
            </Text>
            <TouchableOpacity
              onPress={() => setCustomStartHour((h) => (h === 23 ? 0 : h + 1))}
              style={styles.timeButton}
            >
              <Ionicons name="chevron-down" size={20} color="#008080" />
            </TouchableOpacity>
          </View>

          <Text style={styles.timeSeparator}>:</Text>

          <View style={styles.timePickerContainer}>
            <TouchableOpacity
              onPress={() =>
                setCustomStartMinute((m) => (m === 0 ? 45 : m - 15))
              }
              style={styles.timeButton}
            >
              <Ionicons name="chevron-up" size={20} color="#008080" />
            </TouchableOpacity>
            <Text style={styles.timeValue}>
              {customStartMinute.toString().padStart(2, "0")}
            </Text>
            <TouchableOpacity
              onPress={() =>
                setCustomStartMinute((m) => (m === 45 ? 0 : m + 15))
              }
              style={styles.timeButton}
            >
              <Ionicons name="chevron-down" size={20} color="#008080" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* End Time */}
      <View style={styles.timePickerSection}>
        <Text style={styles.timePickerLabel}>End Time</Text>
        <View style={styles.timePickerRow}>
          <View style={styles.timePickerContainer}>
            <TouchableOpacity
              onPress={() => setCustomEndHour((h) => (h === 0 ? 23 : h - 1))}
              style={styles.timeButton}
            >
              <Ionicons name="chevron-up" size={20} color="#008080" />
            </TouchableOpacity>
            <Text style={styles.timeValue}>
              {customEndHour.toString().padStart(2, "0")}
            </Text>
            <TouchableOpacity
              onPress={() => setCustomEndHour((h) => (h === 23 ? 0 : h + 1))}
              style={styles.timeButton}
            >
              <Ionicons name="chevron-down" size={20} color="#008080" />
            </TouchableOpacity>
          </View>

          <Text style={styles.timeSeparator}>:</Text>

          <View style={styles.timePickerContainer}>
            <TouchableOpacity
              onPress={() => setCustomEndMinute((m) => (m === 0 ? 45 : m - 15))}
              style={styles.timeButton}
            >
              <Ionicons name="chevron-up" size={20} color="#008080" />
            </TouchableOpacity>
            <Text style={styles.timeValue}>
              {customEndMinute.toString().padStart(2, "0")}
            </Text>
            <TouchableOpacity
              onPress={() => setCustomEndMinute((m) => (m === 45 ? 0 : m + 15))}
              style={styles.timeButton}
            >
              <Ionicons name="chevron-down" size={20} color="#008080" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Duration Display */}
      <View style={styles.durationContainer}>
        <Text style={styles.durationLabel}>Duration:</Text>
        <Text style={styles.durationValue}>
          {(() => {
            const startTotalMinutes = customStartHour * 60 + customStartMinute;
            const endTotalMinutes = customEndHour * 60 + customEndMinute;
            const diffMinutes = endTotalMinutes - startTotalMinutes;

            if (diffMinutes <= 0) return "Invalid time range";

            const hours = Math.floor(diffMinutes / 60);
            const minutes = diffMinutes % 60;

            if (hours === 0) return `${minutes} minutes`;
            if (minutes === 0) return `${hours} hour${hours > 1 ? "s" : ""}`;
            return `${hours}h ${minutes}m`;
          })()}
        </Text>
      </View>
    </View>
  );

  const renderFixedTime = () => (
    <View style={styles.fixedTimeContainer}>
      <View style={styles.fixedTimeContent}>
        <Ionicons name="time" size={48} color="#008080" />
        <Text style={styles.fixedTimeTitle}>Fixed Duration Service</Text>
        <Text style={styles.fixedTimeText}>
          This service has a predetermined duration and timing. The exact
          schedule will be confirmed after booking.
        </Text>
      </View>
    </View>
  );

  const renderContent = () => {
    switch (bookingType) {
      case "TIME_SLOTS":
        return renderTimeSlots();
      case "FLEXIBLE_HOURS":
        return renderFlexibleHours();
      case "FIXED_TIME":
        return renderFixedTime();
      default:
        return renderTimeSlots();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[styles.modal, { transform: [{ translateY: modalTranslateY }] }]}
      >
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backButton} onPress={onClose}>
              <Ionicons name="arrow-back" size={24} color="#008080" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.modalTitle}>{getModalTitle()}</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>{getInstructions()}</Text>
        </View>

        <View style={styles.content}>{renderContent()}</View>

        {/* Confirm Button */}
        <View style={styles.buttonContainer}>
          <LongButton
            label="Continue with Selected Time"
            onPress={canConfirm() ? handleConfirm : () => {}}
          />
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    height: "60%",
  },
  header: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    position: "relative",
    height: 40,
  },
  backButton: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    zIndex: 2,
  },
  headerTitleContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
    pointerEvents: "none",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  content: {
    flex: 1,
    marginBottom: 20,
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
  slotsList: {
    flex: 1,
  },
  timeSlotItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  selectedTimeSlot: {
    backgroundColor: "#F0F8FF",
    borderColor: "#008080",
  },
  timeSlotInfo: {
    flex: 1,
  },
  timeSlotText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  selectedTimeSlotText: {
    color: "#008080",
    fontWeight: "600",
  },
  flexibleHoursContainer: {
    flex: 1,
  },
  flexibleHoursTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 20,
    textAlign: "center",
  },
  timePickerSection: {
    marginBottom: 20,
  },
  timePickerLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 12,
  },
  timePickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  timePickerContainer: {
    alignItems: "center",
    marginHorizontal: 10,
  },
  timeButton: {
    padding: 8,
  },
  timeValue: {
    fontSize: 24,
    fontWeight: "600",
    color: "#008080",
    marginVertical: 8,
    minWidth: 60,
    textAlign: "center",
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: "600",
    color: "#008080",
    marginHorizontal: 5,
  },
  durationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F8FF",
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
  },
  durationLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginRight: 8,
  },
  durationValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#008080",
  },
  fixedTimeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fixedTimeContent: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  fixedTimeTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 12,
  },
  fixedTimeText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
  buttonContainer: {
    paddingTop: 10,
  },
});
