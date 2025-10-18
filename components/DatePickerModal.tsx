import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { BookingType } from "../types/serviceTypes";
import LongButton from "./LongButton";

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (dates: Date[], checkIn?: Date, checkOut?: Date) => void;
  tripStartDate?: Date;
  tripEndDate?: Date;
  bookingType?: BookingType;
  serviceName?: string;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MODAL_HEIGHT = 0.7; // 70% of screen
const screenHeight = Dimensions.get("window").height;

export default function DatePickerModal({
  visible,
  onClose,
  onConfirm,
  tripStartDate,
  tripEndDate,
  bookingType = "WHOLE_DAY",
  serviceName = "service",
}: DatePickerModalProps) {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(
    tripStartDate ? tripStartDate.getMonth() : new Date().getMonth()
  );
  const [currentYear, setCurrentYear] = useState(
    tripStartDate ? tripStartDate.getFullYear() : new Date().getFullYear()
  );
  const [selectionMode, setSelectionMode] = useState<
    "checkIn" | "checkOut" | "single"
  >("single");

  // Modal animation
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Reset state when modal opens
      setSelectedDates([]);
      setCheckInDate(null);
      setCheckOutDate(null);

      // Set selection mode based on booking type
      if (bookingType === "MULTI_DAY") {
        setSelectionMode("checkIn");
      } else {
        setSelectionMode("single");
      }

      // Set current month to trip start month if available
      if (tripStartDate) {
        setCurrentMonth(tripStartDate.getMonth());
        setCurrentYear(tripStartDate.getFullYear());
      }
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const isDateDisabled = (date: Date) => {
    if (tripStartDate && date < tripStartDate) return true;
    if (tripEndDate && date > tripEndDate) return true;
    return false;
  };

  const isDateSelected = (date: Date) => {
    if (bookingType === "MULTI_DAY") {
      if (checkInDate && date.toDateString() === checkInDate.toDateString())
        return true;
      if (checkOutDate && date.toDateString() === checkOutDate.toDateString())
        return true;
      if (
        checkInDate &&
        checkOutDate &&
        date > checkInDate &&
        date < checkOutDate
      )
        return true;
    } else {
      return selectedDates.some(
        (d) => d.toDateString() === date.toDateString()
      );
    }
    return false;
  };

  const isDateInRange = (date: Date) => {
    if (bookingType === "MULTI_DAY" && checkInDate && checkOutDate) {
      return date > checkInDate && date < checkOutDate;
    }
    return false;
  };

  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(currentYear, currentMonth, day);
    if (isDateDisabled(selectedDate)) return;

    if (bookingType === "MULTI_DAY") {
      if (selectionMode === "checkIn" || (!checkInDate && !checkOutDate)) {
        setCheckInDate(selectedDate);
        setCheckOutDate(null);
        setSelectionMode("checkOut");
      } else if (selectionMode === "checkOut") {
        if (checkInDate && selectedDate > checkInDate) {
          setCheckOutDate(selectedDate);
        } else {
          // If selected date is before check-in, make it the new check-in
          setCheckInDate(selectedDate);
          setCheckOutDate(null);
        }
      }
    } else {
      // For single day or multiple single days
      const isAlreadySelected = selectedDates.some(
        (d) => d.toDateString() === selectedDate.toDateString()
      );

      if (isAlreadySelected) {
        // Remove from selection
        setSelectedDates(
          selectedDates.filter(
            (d) => d.toDateString() !== selectedDate.toDateString()
          )
        );
      } else {
        // Add to selection
        if (
          bookingType === "TIME_SLOTS" ||
          bookingType === "WHOLE_DAY" ||
          bookingType === "FIXED_TIME"
        ) {
          // For these types, only allow single date selection
          setSelectedDates([selectedDate]);
        } else {
          // Allow multiple dates
          setSelectedDates(
            [...selectedDates, selectedDate].sort(
              (a, b) => a.getTime() - b.getTime()
            )
          );
        }
      }
    }
  };

  const handleConfirm = () => {
    if (bookingType === "MULTI_DAY") {
      if (checkInDate && checkOutDate) {
        onConfirm([], checkInDate, checkOutDate);
      }
    } else {
      if (selectedDates.length > 0) {
        onConfirm(selectedDates);
      }
    }
  };

  const canConfirm = () => {
    if (bookingType === "MULTI_DAY") {
      return checkInDate && checkOutDate;
    } else {
      return selectedDates.length > 0;
    }
  };

  const getInstructions = () => {
    switch (bookingType) {
      case "MULTI_DAY":
        return selectionMode === "checkIn"
          ? "Select your check-in date"
          : "Select your check-out date";
      case "TIME_SLOTS":
        return "Select a date for your time slot";
      case "WHOLE_DAY":
        return "Select the day(s) you want to book";
      case "FIXED_TIME":
        return "Select your preferred date";
      case "FLEXIBLE_HOURS":
        return "Select the date(s) for your booking";
      default:
        return "Select your preferred date(s)";
    }
  };

  const getSelectedDatesText = () => {
    if (bookingType === "MULTI_DAY") {
      if (checkInDate && checkOutDate) {
        const nights = Math.ceil(
          (checkOutDate.getTime() - checkInDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        return `${checkInDate.toLocaleDateString()} - ${checkOutDate.toLocaleDateString()} (${nights} night${
          nights > 1 ? "s" : ""
        })`;
      } else if (checkInDate) {
        return `Check-in: ${checkInDate.toLocaleDateString()}`;
      }
      return "No dates selected";
    } else {
      if (selectedDates.length === 0) return "No dates selected";
      if (selectedDates.length === 1)
        return selectedDates[0].toLocaleDateString();
      return `${selectedDates.length} dates selected`;
    }
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.dayCell}>
          <View style={styles.emptyDay} />
        </View>
      );
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isSelected = isDateSelected(date);
      const isDisabled = isDateDisabled(date);
      const isToday = new Date().toDateString() === date.toDateString();
      const isInRange = isDateInRange(date);
      const isCheckIn =
        bookingType === "MULTI_DAY" &&
        checkInDate &&
        date.toDateString() === checkInDate.toDateString();
      const isCheckOut =
        bookingType === "MULTI_DAY" &&
        checkOutDate &&
        date.toDateString() === checkOutDate.toDateString();

      days.push(
        <View key={day} style={styles.dayCell}>
          <TouchableOpacity
            style={[
              styles.dayButton,
              isSelected && styles.selectedDay,
              isDisabled && styles.disabledDay,
              isToday && !isSelected && styles.todayDay,
              isInRange && styles.rangeDay,
              isCheckIn && styles.checkInDay,
              isCheckOut && styles.checkOutDay,
            ]}
            onPress={() => handleDateSelect(day)}
            disabled={isDisabled}
          >
            <Text
              style={[
                styles.dayText,
                isSelected && styles.selectedDayText,
                isDisabled && styles.disabledDayText,
                isToday && !isSelected && styles.todayDayText,
                isInRange && styles.rangeDayText,
              ]}
            >
              {day}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return days;
  };

  const modalTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight * MODAL_HEIGHT, 0],
  });

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
              <Text style={styles.modalTitle}>Select Dates</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>{getInstructions()}</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Month/Year Navigation */}
          <View style={styles.monthNavigation}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={handlePreviousMonth}
            >
              <Ionicons name="chevron-back" size={24} color="#008080" />
            </TouchableOpacity>

            <View style={styles.monthYearContainer}>
              <Text style={styles.monthYearText}>
                {MONTHS[currentMonth]} {currentYear}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.navButton}
              onPress={handleNextMonth}
            >
              <Ionicons name="chevron-forward" size={24} color="#008080" />
            </TouchableOpacity>
          </View>

          {/* Weekday Headers */}
          <View style={styles.weekdaysContainer}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <View key={day} style={styles.weekdayCell}>
                <Text style={styles.weekdayText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar Days */}
          <View style={styles.calendarGrid}>{renderCalendarDays()}</View>

          {/* Selection Summary */}
          <View style={styles.selectionContainer}>
            <Text style={styles.selectionLabel}>Selected:</Text>
            <Text style={styles.selectionText}>{getSelectedDatesText()}</Text>
          </View>

          {/* Legend for multi-day bookings */}
          {bookingType === "MULTI_DAY" && (
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, styles.checkInDay]} />
                <Text style={styles.legendText}>Check-in</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, styles.checkOutDay]} />
                <Text style={styles.legendText}>Check-out</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, styles.rangeDay]} />
                <Text style={styles.legendText}>Stay period</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Confirm Button */}
        <View style={styles.buttonContainer}>
          <LongButton
            label="Continue with Selected Dates"
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
    height: "70%",
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
  },
  monthNavigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  navButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F0F8FF",
    borderWidth: 1,
    borderColor: "#E6F7FF",
  },
  monthYearContainer: {
    flex: 1,
    alignItems: "center",
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
  },
  weekdaysContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  weekdayCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  weekdayText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 2,
  },
  dayButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  emptyDay: {
    flex: 1,
  },
  selectedDay: {
    backgroundColor: "#008080",
  },
  disabledDay: {
    backgroundColor: "transparent",
  },
  todayDay: {
    backgroundColor: "#F0F8FF",
    borderWidth: 1,
    borderColor: "#008080",
  },
  rangeDay: {
    backgroundColor: "#E6F7FF",
  },
  checkInDay: {
    backgroundColor: "#008080",
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  checkOutDay: {
    backgroundColor: "#008080",
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  dayText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  selectedDayText: {
    color: "#fff",
    fontWeight: "600",
  },
  disabledDayText: {
    color: "#D1D5DB",
  },
  todayDayText: {
    color: "#008080",
    fontWeight: "600",
  },
  rangeDayText: {
    color: "#008080",
    fontWeight: "500",
  },
  selectionContainer: {
    backgroundColor: "#F0F8FF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E6F7FF",
    marginBottom: 20,
  },
  selectionLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#008080",
    marginBottom: 4,
  },
  selectionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#6B7280",
  },
  buttonContainer: {
    paddingTop: 10,
  },
});
