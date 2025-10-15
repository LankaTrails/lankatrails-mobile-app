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
import {
  addToTrip,
  getMyTrips,
  getAvailableTimeSlots,
} from "../services/tripService";
import {
  Trip,
  TripItem,
  AvailabilityDto,
  TimeSlotsResponseDTO,
  TimeSlotsRequestDTO,
} from "../types/triptypes";
import {
  Service,
  ServiceDetail,
  BookingType,
  PriceType,
} from "../types/serviceTypes";
import LongButton from "./LongButton";
import TripCreationFlow from "./TripCreationFlow";

interface AddToTripFlowProps {
  visible: boolean;
  onClose: () => void;
  service: Service;
  serviceDetail?: ServiceDetail;
  onTripAdded?: () => void;
}

enum FlowStep {
  TRIP_SELECTION = "TRIP_SELECTION",
  TRAVELERS_UNITS = "TRAVELERS_UNITS",
  DATE_SELECTION = "DATE_SELECTION",
  TIME_DURATION = "TIME_DURATION",
  PRICE_SUMMARY = "PRICE_SUMMARY",
  CONFIRMATION = "CONFIRMATION",
}

// Helper component for date selection
const DateSelectionWidget: React.FC<{
  bookingType: string;
  tripStartDate?: Date;
  tripEndDate?: Date;
  selectedDates: Date[];
  checkInDate: Date | null;
  checkOutDate: Date | null;
  onDatesChange: (dates: Date[], checkIn?: Date, checkOut?: Date) => void;
}> = ({
  bookingType,
  tripStartDate,
  tripEndDate,
  selectedDates,
  checkInDate,
  checkOutDate,
  onDatesChange,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectionMode, setSelectionMode] = useState<
    "checkIn" | "checkOut" | "single"
  >("single");

  useEffect(() => {
    if (bookingType === "MULTI_DAY") {
      setSelectionMode("checkIn");
    } else {
      setSelectionMode("single");
    }
  }, [bookingType]);

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

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(currentYear, currentMonth, day);
    if (isDateDisabled(selectedDate)) return;

    if (bookingType === "MULTI_DAY") {
      if (selectionMode === "checkIn" || (!checkInDate && !checkOutDate)) {
        onDatesChange([], selectedDate, undefined);
        setSelectionMode("checkOut");
      } else if (selectionMode === "checkOut") {
        if (checkInDate && selectedDate > checkInDate) {
          onDatesChange([], checkInDate, selectedDate);
        } else {
          onDatesChange([], selectedDate, undefined);
          setSelectionMode("checkOut");
        }
      }
    } else {
      const isAlreadySelected = selectedDates.some(
        (d) => d.toDateString() === selectedDate.toDateString()
      );

      if (isAlreadySelected) {
        onDatesChange(
          selectedDates.filter(
            (d) => d.toDateString() !== selectedDate.toDateString()
          )
        );
      } else {
        if (
          bookingType === "TIME_SLOTS" ||
          bookingType === "WHOLE_DAY" ||
          bookingType === "FIXED_TIME"
        ) {
          onDatesChange([selectedDate]);
        } else {
          onDatesChange(
            [...selectedDates, selectedDate].sort(
              (a, b) => a.getTime() - b.getTime()
            )
          );
        }
      }
    }
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Empty cells for days before first day
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.dayCell}>
          <View style={styles.emptyDay} />
        </View>
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isSelected = isDateSelected(date);
      const isDisabled = isDateDisabled(date);
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <View key={day} style={styles.dayCell}>
          <TouchableOpacity
            style={[
              styles.dayButton,
              isSelected && styles.selectedDay,
              isDisabled && styles.disabledDay,
              isToday && !isSelected && styles.todayDay,
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

  return (
    <View style={styles.dateSelectionContainer}>
      {/* Month Navigation */}
      <View style={styles.monthNavigation}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => {
            if (currentMonth === 0) {
              setCurrentMonth(11);
              setCurrentYear(currentYear - 1);
            } else {
              setCurrentMonth(currentMonth - 1);
            }
          }}
        >
          <Ionicons name="chevron-back" size={24} color="#008080" />
        </TouchableOpacity>

        <Text style={styles.monthYearText}>
          {MONTHS[currentMonth]} {currentYear}
        </Text>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => {
            if (currentMonth === 11) {
              setCurrentMonth(0);
              setCurrentYear(currentYear + 1);
            } else {
              setCurrentMonth(currentMonth + 1);
            }
          }}
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

      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>{renderCalendarDays()}</View>

      {/* Selection Summary */}
      <View style={styles.selectionSummary}>
        <Text style={styles.selectionLabel}>Selected:</Text>
        <Text style={styles.selectionText}>
          {bookingType === "MULTI_DAY"
            ? checkInDate && checkOutDate
              ? `${checkInDate.toLocaleDateString()} - ${checkOutDate.toLocaleDateString()}`
              : checkInDate
              ? `Check-in: ${checkInDate.toLocaleDateString()}`
              : "No dates selected"
            : selectedDates.length === 0
            ? "No dates selected"
            : selectedDates.length === 1
            ? selectedDates[0].toLocaleDateString()
            : `${selectedDates.length} dates selected`}
        </Text>
      </View>
    </View>
  );
};

// Helper component for time selection
const TimeSelectionWidget: React.FC<{
  bookingType: string;
  serviceDetail?: ServiceDetail;
  selectedTimeSlot: TimeSlotsRequestDTO | null;
  selectedDate: Date | null;
  availableTimeSlots: TimeSlotsResponseDTO | null;
  isLoading: boolean;
  onTimeSlotSelect: (timeSlot: TimeSlotsRequestDTO) => void;
  onFetchTimeSlots: (date: Date) => void;
}> = ({
  bookingType,
  serviceDetail,
  selectedTimeSlot,
  selectedDate,
  availableTimeSlots,
  isLoading,
  onTimeSlotSelect,
  onFetchTimeSlots,
}) => {
  console.log("TimeSelectionWidget rendered with:");
  console.log("- bookingType:", bookingType);
  console.log("- selectedDate:", selectedDate);
  console.log("- availableTimeSlots:", availableTimeSlots);

  const [customStartHour, setCustomStartHour] = useState(9);
  const [customStartMinute, setCustomStartMinute] = useState(0);
  const [duration, setDuration] = useState(1);

  useEffect(() => {
    if (bookingType === "TIME_SLOTS" && selectedDate && !availableTimeSlots) {
      onFetchTimeSlots(selectedDate);
    }
  }, [selectedDate, bookingType]);

  const renderTimeSlots = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#008080" />
          <Text style={styles.loadingText}>
            Loading available time slots...
          </Text>
        </View>
      );
    }

    if (
      !availableTimeSlots ||
      !availableTimeSlots.content ||
      availableTimeSlots.content.length === 0
    ) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="time-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyStateTitle}>No Time Slots Available</Text>
          <Text style={styles.emptyStateText}>
            No time slots are available for the selected date. Service may be
            closed or fully booked.
          </Text>
        </View>
      );
    }

    return (
      <View>
        <Text style={styles.sectionTitle}>Available Time Slots</Text>
        <Text style={styles.timeSlotSubtitle}>
          Select a time slot that works for your schedule
        </Text>
        <View style={styles.timeSlotsGrid}>
          {availableTimeSlots.content.map((slot, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.timeSlotButton,
                selectedTimeSlot &&
                  selectedTimeSlot.slotStartTime === slot.slotStartTime &&
                  selectedTimeSlot.slotEndTime === slot.slotEndTime &&
                  styles.selectedTimeSlot,
              ]}
              onPress={() => onTimeSlotSelect(slot)}
            >
              <View style={styles.timeSlotContent}>
                <Text
                  style={[
                    styles.timeSlotText,
                    selectedTimeSlot &&
                      selectedTimeSlot.slotStartTime === slot.slotStartTime &&
                      selectedTimeSlot.slotEndTime === slot.slotEndTime &&
                      styles.selectedTimeSlotText,
                  ]}
                >
                  {slot.slotStartTime} - {slot.slotEndTime}
                </Text>
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={
                    selectedTimeSlot &&
                    selectedTimeSlot.slotStartTime === slot.slotStartTime &&
                    selectedTimeSlot.slotEndTime === slot.slotEndTime
                      ? "#fff"
                      : "#008080"
                  }
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderFlexibleHours = () => (
    <View>
      <Text style={styles.sectionTitle}>Select Start Time & Duration</Text>

      <View style={styles.timePickerContainer}>
        <Text style={styles.timePickerLabel}>Start Time</Text>
        <View style={styles.timePickerRow}>
          <View style={styles.timePicker}>
            <TouchableOpacity
              onPress={() => setCustomStartHour((h) => (h === 0 ? 23 : h - 1))}
              style={styles.timePickerButton}
            >
              <Ionicons name="chevron-up" size={20} color="#008080" />
            </TouchableOpacity>
            <Text style={styles.timePickerValue}>
              {customStartHour.toString().padStart(2, "0")}
            </Text>
            <TouchableOpacity
              onPress={() => setCustomStartHour((h) => (h === 23 ? 0 : h + 1))}
              style={styles.timePickerButton}
            >
              <Ionicons name="chevron-down" size={20} color="#008080" />
            </TouchableOpacity>
          </View>

          <Text style={styles.timeSeparator}>:</Text>

          <View style={styles.timePicker}>
            <TouchableOpacity
              onPress={() =>
                setCustomStartMinute((m) => (m === 0 ? 45 : m - 15))
              }
              style={styles.timePickerButton}
            >
              <Ionicons name="chevron-up" size={20} color="#008080" />
            </TouchableOpacity>
            <Text style={styles.timePickerValue}>
              {customStartMinute.toString().padStart(2, "0")}
            </Text>
            <TouchableOpacity
              onPress={() =>
                setCustomStartMinute((m) => (m === 45 ? 0 : m + 15))
              }
              style={styles.timePickerButton}
            >
              <Ionicons name="chevron-down" size={20} color="#008080" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.durationContainer}>
        <Text style={styles.timePickerLabel}>Duration (hours)</Text>
        <View style={styles.durationRow}>
          <TouchableOpacity
            onPress={() => setDuration((d) => Math.max(0.5, d - 0.5))}
            style={styles.durationButton}
          >
            <Ionicons name="remove" size={20} color="#008080" />
          </TouchableOpacity>
          <Text style={styles.durationValue}>{duration}</Text>
          <TouchableOpacity
            onPress={() => setDuration((d) => Math.min(12, d + 0.5))}
            style={styles.durationButton}
          >
            <Ionicons name="add" size={20} color="#008080" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.timeSelectionSummary}>
        <Text style={styles.selectionLabel}>Selected Time:</Text>
        <Text style={styles.selectionText}>
          {customStartHour.toString().padStart(2, "0")}:
          {customStartMinute.toString().padStart(2, "0")} -
          {Math.floor((customStartHour + duration) % 24)
            .toString()
            .padStart(2, "0")}
          :
          {((customStartMinute + (duration % 1) * 60) % 60)
            .toString()
            .padStart(2, "0")}
          {duration === 1 ? " (1 hour)" : ` (${duration} hours)`}
        </Text>
      </View>
    </View>
  );

  const renderFixedTime = () => (
    <View style={styles.fixedTimeContainer}>
      <Ionicons name="time" size={48} color="#008080" />
      <Text style={styles.fixedTimeTitle}>Fixed Time Service</Text>
      <Text style={styles.fixedTimeText}>
        This service operates at fixed times according to its schedule.
      </Text>
      {serviceDetail?.availableTimeDTOS &&
        serviceDetail.availableTimeDTOS.length > 0 && (
          <View style={styles.scheduleContainer}>
            <Text style={styles.scheduleTitle}>Service Hours</Text>
            {serviceDetail.availableTimeDTOS.map((schedule, index) => (
              <View key={index} style={styles.scheduleItem}>
                <Text style={styles.scheduleDayText}>{schedule.dayOfWeek}</Text>
                <Text style={styles.timeText}>
                  {schedule.isClosed
                    ? "Closed"
                    : schedule.is24Hours
                    ? "24 Hours"
                    : `${schedule.openTime} - ${schedule.closeTime}`}
                </Text>
              </View>
            ))}
          </View>
        )}
    </View>
  );

  const renderEventBased = () => (
    <View style={styles.fixedTimeContainer}>
      <Ionicons name="calendar" size={48} color="#008080" />
      <Text style={styles.fixedTimeTitle}>Event-Based Service</Text>
      <Text style={styles.fixedTimeText}>
        This service is tied to specific events with fixed dates and times.
      </Text>
    </View>
  );

  const renderWholeDayService = () => (
    <View style={styles.fixedTimeContainer}>
      <Ionicons name="sunny" size={48} color="#008080" />
      <Text style={styles.fixedTimeTitle}>Full Day Service</Text>
      <Text style={styles.fixedTimeText}>
        This service runs for the entire day. No specific time selection
        required.
      </Text>
    </View>
  );

  switch (bookingType) {
    case "TIME_SLOTS":
      return renderTimeSlots();
    case "FLEXIBLE_HOURS":
      return renderFlexibleHours();
    case "FIXED_TIME":
      return renderFixedTime();
    case "EVENT_BASED":
      return renderEventBased();
    case "WHOLE_DAY":
      return renderWholeDayService();
    case "MULTI_DAY":
      return renderWholeDayService(); // Multi-day doesn't need time selection
    default:
      return renderFixedTime();
  }
};

const AddToTripFlow: React.FC<AddToTripFlowProps> = ({
  visible,
  onClose,
  service,
  serviceDetail,
  onTripAdded,
}) => {
  // Flow state
  const [currentStep, setCurrentStep] = useState<FlowStep>(
    FlowStep.TRIP_SELECTION
  );
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showNewTripFlow, setShowNewTripFlow] = useState(false);

  // Data state
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Trip item data
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [units, setUnits] = useState(1);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] =
    useState<TimeSlotsRequestDTO | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] =
    useState<TimeSlotsResponseDTO | null>(null);

  // Animation
  const slideAnim = useRef(new Animated.Value(0)).current;
  const screenHeight = Dimensions.get("window").height;

  useEffect(() => {
    console.log(
      "Main useEffect triggered - visible:",
      visible,
      "currentStep:",
      currentStep
    );
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      if (currentStep === FlowStep.TRIP_SELECTION) {
        loadTrips();
      }
    } else {
      console.log("Modal closing - calling resetFlow");
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      resetFlow();
    }
  }, [visible]);

  // Add debugging for currentStep changes
  useEffect(() => {
    console.log("Current step changed to:", currentStep);
    console.log(
      "TravelersUnitsModal should be visible:",
      currentStep === FlowStep.TRAVELERS_UNITS
    );
    console.log("TripCreationFlow should be visible:", showNewTripFlow);
  }, [currentStep, showNewTripFlow]);

  const resetFlow = () => {
    setCurrentStep(FlowStep.TRIP_SELECTION);
    setSelectedTrip(null);
    setAdults(1);
    setChildren(0);
    setUnits(1);
    setSelectedDates([]);
    setCheckInDate(null);
    setCheckOutDate(null);
    setSelectedTimeSlot(null);
    setAvailableTimeSlots(null);
  };

  const loadTrips = async () => {
    try {
      setIsLoading(true);
      const response = await getMyTrips();
      if (response.success && response.data) {
        setTrips(response.data);
      } else {
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

  const handleTripSelected = (trip: Trip) => {
    console.log("Trip selected:", trip.tripName);
    console.log("Setting current step to TRAVELERS_UNITS");
    setSelectedTrip(trip);
    // Pre-fill with trip defaults
    setAdults(trip.numberOfAdults);
    setChildren(trip.numberOfChildren);
    setCurrentStep(FlowStep.TRAVELERS_UNITS);
    console.log("Current step set to:", FlowStep.TRAVELERS_UNITS);
  };

  const handleCreateNewTrip = () => {
    console.log("Create new trip button pressed");
    setShowNewTripFlow(true);
    console.log("showNewTripFlow set to:", true);
  };

  const handleNewTripCreated = (trip: Trip) => {
    setSelectedTrip(trip);
    setAdults(trip.numberOfAdults);
    setChildren(trip.numberOfChildren);
    setShowNewTripFlow(false);
    setCurrentStep(FlowStep.TRAVELERS_UNITS);
  };

  const handleDatesConfirmed = async (
    dates: Date[],
    checkIn?: Date,
    checkOut?: Date
  ) => {
    setSelectedDates(dates);
    if (checkIn) setCheckInDate(checkIn);
    if (checkOut) setCheckOutDate(checkOut);

    const bookingType = serviceDetail?.bookingConfig?.bookingType;

    // Check if we need time slots
    if (bookingType === "TIME_SLOTS" && dates.length > 0) {
      await fetchAvailableTimeSlots(dates[0]);
      setCurrentStep(FlowStep.TIME_DURATION);
    } else if (
      bookingType === "FLEXIBLE_HOURS" ||
      bookingType === "FIXED_TIME"
    ) {
      setCurrentStep(FlowStep.TIME_DURATION);
    } else {
      // For other booking types, check if pricing is available
      if (serviceDetail?.priceConfig) {
        setCurrentStep(FlowStep.PRICE_SUMMARY);
      } else {
        setCurrentStep(FlowStep.CONFIRMATION);
      }
    }
  };

  const fetchAvailableTimeSlots = async (selectedDate: Date) => {
    if (!selectedTrip || !service.serviceId) return;

    try {
      setIsLoading(true);
      const startDateTime = new Date(selectedDate);
      startDateTime.setHours(0, 0, 0, 0);
      const endDateTime = new Date(selectedDate);
      endDateTime.setHours(23, 59, 59, 999);

      const availabilityDto: AvailabilityDto = {
        childCount: children,
        adultCount: adults,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        serviceId: service.serviceId,
        tripId: selectedTrip.tripId,
        noOfUnits: units,
      };

      const response = await getAvailableTimeSlots(
        availabilityDto,
        service.serviceId
      );
      if (response.success && response.data) {
        setAvailableTimeSlots(response.data);
      }
    } catch (error) {
      console.error("Error fetching time slots:", error);
      Alert.alert("Error", "Failed to load available time slots");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeSlotSelected = (slot: TimeSlotsRequestDTO) => {
    setSelectedTimeSlot(slot);

    // Check if pricing is available
    if (serviceDetail?.priceConfig) {
      setCurrentStep(FlowStep.PRICE_SUMMARY);
    } else {
      setCurrentStep(FlowStep.CONFIRMATION);
    }
  };

  const handleConfirmAddToTrip = async () => {
    if (!selectedTrip) return;

    setIsAdding(true);
    try {
      // Calculate start and end times based on booking type
      let startTime: string;
      let endTime: string;

      const bookingType = serviceDetail?.bookingConfig?.bookingType;
      console.log("🔍 Debug time calculation:");
      console.log("🔍 bookingType:", bookingType);
      console.log("🔍 selectedTimeSlot:", selectedTimeSlot);
      console.log("🔍 selectedDates:", selectedDates);
      console.log("🔍 checkInDate:", checkInDate);
      console.log("🔍 checkOutDate:", checkOutDate);

      if (bookingType === "MULTI_DAY" && checkInDate && checkOutDate) {
        console.log("🔍 Taking MULTI_DAY path");
        const checkInTime =
          serviceDetail?.bookingConfig?.defaultCheckInTime || "15:00";
        const checkOutTime =
          serviceDetail?.bookingConfig?.defaultCheckOutTime || "11:00";

        const startDateTime = new Date(checkInDate);
        const [checkInHour, checkInMinute] = checkInTime.split(":").map(Number);
        startDateTime.setHours(checkInHour, checkInMinute, 0, 0);

        const endDateTime = new Date(checkOutDate);
        const [checkOutHour, checkOutMinute] = checkOutTime
          .split(":")
          .map(Number);
        endDateTime.setHours(checkOutHour, checkOutMinute, 0, 0);

        startTime = startDateTime.toISOString();
        endTime = endDateTime.toISOString();
      } else if (
        bookingType === "TIME_SLOTS" &&
        selectedTimeSlot &&
        selectedDates.length > 0
      ) {
        console.log("🔍 Taking TIME_SLOTS path");
        console.log("🕐 Selected time slot object:", selectedTimeSlot);

        // Get the selected date
        const selectedDate = new Date(selectedDates[0]);
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const day = selectedDate.getDate();

        console.log(
          "🕐 Date components - Year:",
          year,
          "Month:",
          month,
          "Day:",
          day
        );

        // Use the exact times from the API response
        const startTimeStr = selectedTimeSlot.slotStartTime; // e.g., "14:30:00"
        const endTimeStr = selectedTimeSlot.slotEndTime; // e.g., "15:30:00"

        console.log("🕐 API times - Start:", startTimeStr, "End:", endTimeStr);

        // Create ISO datetime strings by combining date and time
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
          day
        ).padStart(2, "0")}`;
        // Remove seconds from time if present (14:30:00 -> 14:30)
        const startTimeFormatted = startTimeStr.substring(0, 5);
        const endTimeFormatted = endTimeStr.substring(0, 5);
        startTime = `${dateStr}T${startTimeFormatted}`;
        endTime = `${dateStr}T${endTimeFormatted}`;

        console.log(
          "🕐 Final datetime strings - Start:",
          startTime,
          "End:",
          endTime
        );
      } else if (bookingType === "WHOLE_DAY" && selectedDates.length > 0) {
        console.log("🔍 Taking WHOLE_DAY path");
        const selectedDate = new Date(selectedDates[0]);
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const day = selectedDate.getDate();

        const startDateTime = new Date(year, month, day, 0, 0, 0, 0); // Start of day
        const endDateTime = new Date(year, month, day, 23, 59, 59, 999); // End of day

        startTime = startDateTime.toISOString();
        endTime = endDateTime.toISOString();
      } else if (bookingType === "EVENT_BASED" && selectedDates.length > 0) {
        console.log("🔍 Taking EVENT_BASED path");
        // For event-based services, use the selected date with event time
        const selectedDate = new Date(selectedDates[0]);
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const day = selectedDate.getDate();

        // Default event time or from service config
        const eventStartTime = "09:00"; // Could be from serviceDetail if available
        const eventEndTime = "17:00";

        const startDateTime = new Date(
          year,
          month,
          day,
          ...eventStartTime.split(":").map(Number),
          0,
          0
        );
        const endDateTime = new Date(
          year,
          month,
          day,
          ...eventEndTime.split(":").map(Number),
          0,
          0
        );

        startTime = startDateTime.toISOString();
        endTime = endDateTime.toISOString();
      } else if (selectedDates.length > 0) {
        console.log("🔍 Taking default/fallback path");
        // For other types or fallback
        const selectedDate = new Date(selectedDates[0]);
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const day = selectedDate.getDate();

        const startDateTime = new Date(year, month, day, 9, 0, 0, 0); // Default 9 AM start
        const endDateTime = new Date(year, month, day, 17, 0, 0, 0); // Default 5 PM end

        startTime = startDateTime.toISOString();
        endTime = endDateTime.toISOString();
      } else {
        throw new Error("No dates selected");
      }

      const tripItem: TripItem = {
        type: "SERVICE",
        service: {
          serviceId: service.serviceId,
          serviceName: service.serviceName,
          category: service.category,
          locations: null,
          prices: null,
          mainImageUrl: null,
          provider: service.provider ?? null,
        },
        place: null,
        startTime: startTime.slice(0, 16), // Format: "2025-09-04T08:00"
        endTime: endTime.slice(0, 16), // Format: "2025-09-04T09:00"
        noOfUnits: units,
        numberOfAdults: adults,
        numberOfChildren: children,
      };

      console.log(
        "📋 TripItem being sent to API:",
        JSON.stringify(tripItem, null, 2)
      );

      const response = await addToTrip(selectedTrip.tripId, tripItem);
      console.log("📦 API Response:", response);

      if (response.success) {
        onClose();
        Alert.alert(
          "Added to Trip!",
          `"${service.serviceName}" has been added to "${selectedTrip.tripName}".`,
          [{ text: "OK", onPress: () => onTripAdded?.() }]
        );
      } else if (!response.success) {
        // Handle bad request or other API errors
        const errorMessage =
          response.message || "Failed to add service to trip";
        console.error("API Error:", response);
        Alert.alert("Error", errorMessage);
      }
    } catch (error) {
      console.error("Error adding to trip:", error);

      // Try to extract more specific error information
      let errorMessage = "Failed to add service to trip. Please try again.";

      if (error && typeof error === "object") {
        // Check if it's an API error with response data
        if ("response" in error && error.response) {
          const response = error.response as any;
          if (response.data && response.data.message) {
            errorMessage = response.data.message;
          } else if (response.statusText) {
            errorMessage = `Error: ${response.statusText}`;
          }
        }
        // Check if it's a standard Error object with message
        else if ("message" in error && typeof error.message === "string") {
          errorMessage = error.message;
        }
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setIsAdding(false);
    }
  };

  const goBack = () => {
    switch (currentStep) {
      case FlowStep.TRAVELERS_UNITS:
        setCurrentStep(FlowStep.TRIP_SELECTION);
        break;
      case FlowStep.DATE_SELECTION:
        setCurrentStep(FlowStep.TRAVELERS_UNITS);
        break;
      case FlowStep.TIME_DURATION:
        setCurrentStep(FlowStep.DATE_SELECTION);
        break;
      case FlowStep.PRICE_SUMMARY:
        const bookingType = serviceDetail?.bookingConfig?.bookingType;
        if (
          bookingType === "TIME_SLOTS" ||
          bookingType === "FLEXIBLE_HOURS" ||
          bookingType === "FIXED_TIME"
        ) {
          setCurrentStep(FlowStep.TIME_DURATION);
        } else {
          setCurrentStep(FlowStep.DATE_SELECTION);
        }
        break;
      case FlowStep.CONFIRMATION:
        if (serviceDetail?.priceConfig) {
          setCurrentStep(FlowStep.PRICE_SUMMARY);
        } else {
          const bookingType = serviceDetail?.bookingConfig?.bookingType;
          if (
            bookingType === "TIME_SLOTS" ||
            bookingType === "FLEXIBLE_HOURS" ||
            bookingType === "FIXED_TIME"
          ) {
            setCurrentStep(FlowStep.TIME_DURATION);
          } else {
            setCurrentStep(FlowStep.DATE_SELECTION);
          }
        }
        break;
      default:
        onClose();
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case FlowStep.TRIP_SELECTION:
        return "Add to Trip";
      case FlowStep.TRAVELERS_UNITS:
        return "Travelers & Units";
      case FlowStep.DATE_SELECTION:
        return "Select Dates";
      case FlowStep.TIME_DURATION:
        return "Select Time";
      case FlowStep.PRICE_SUMMARY:
        return "Pricing Summary";
      case FlowStep.CONFIRMATION:
        return "Confirm Details";
      default:
        return "Add to Trip";
    }
  };

  const modalTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight * 1, 0],
  });

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

  const renderTravelersUnitsContent = () => (
    <View style={styles.content}>
      <Text style={styles.subtitle}>
        Select the number of travelers and units needed
      </Text>

      {/* Adults Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Travelers</Text>

        <View style={styles.counterRow}>
          <View style={styles.counterInfo}>
            <Text style={styles.counterLabel}>Adults</Text>
            <Text style={styles.counterSubLabel}>13+ years</Text>
          </View>
          <View style={styles.counterControls}>
            <TouchableOpacity
              style={[
                styles.counterButton,
                adults <= 1 && styles.counterButtonDisabled,
              ]}
              onPress={() => adults > 1 && setAdults(adults - 1)}
              disabled={adults <= 1}
            >
              <Ionicons
                name="remove"
                size={20}
                color={adults <= 1 ? "#D1D5DB" : "#008080"}
              />
            </TouchableOpacity>
            <Text style={styles.counterValue}>{adults}</Text>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => setAdults(adults + 1)}
            >
              <Ionicons name="add" size={20} color="#008080" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.counterRow}>
          <View style={styles.counterInfo}>
            <Text style={styles.counterLabel}>Children</Text>
            <Text style={styles.counterSubLabel}>2-12 years</Text>
          </View>
          <View style={styles.counterControls}>
            <TouchableOpacity
              style={[
                styles.counterButton,
                children <= 0 && styles.counterButtonDisabled,
              ]}
              onPress={() => children > 0 && setChildren(children - 1)}
              disabled={children <= 0}
            >
              <Ionicons
                name="remove"
                size={20}
                color={children <= 0 ? "#D1D5DB" : "#008080"}
              />
            </TouchableOpacity>
            <Text style={styles.counterValue}>{children}</Text>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => setChildren(children + 1)}
            >
              <Ionicons name="add" size={20} color="#008080" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Units Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Units</Text>

        <View style={styles.counterRow}>
          <View style={styles.counterInfo}>
            <Text style={styles.counterLabel}>
              {serviceDetail?.bookingConfig?.unitAdultCapacity
                ? "Rooms/Units"
                : "Units"}
            </Text>
            <Text style={styles.counterSubLabel}>
              {serviceDetail?.bookingConfig?.unitAdultCapacity
                ? `${serviceDetail.bookingConfig.unitAdultCapacity} guests per unit`
                : "Select number needed"}
            </Text>
          </View>
          <View style={styles.counterControls}>
            <TouchableOpacity
              style={[
                styles.counterButton,
                units <= 1 && styles.counterButtonDisabled,
              ]}
              onPress={() => units > 1 && setUnits(units - 1)}
              disabled={units <= 1}
            >
              <Ionicons
                name="remove"
                size={20}
                color={units <= 1 ? "#D1D5DB" : "#008080"}
              />
            </TouchableOpacity>
            <Text style={styles.counterValue}>{units}</Text>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => setUnits(units + 1)}
            >
              <Ionicons name="add" size={20} color="#008080" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <LongButton
          label="Continue to Dates"
          onPress={() => setCurrentStep(FlowStep.DATE_SELECTION)}
        />
      </View>
    </View>
  );

  const renderTripSelection = () => (
    <View style={styles.content}>
      <Text style={styles.subtitle}>
        Add "{service.serviceName}" to one of your trips
      </Text>

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
            onPress={handleCreateNewTrip}
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
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.tripItem}
                    onPress={() => handleTripSelected(item)}
                  >
                    <View style={styles.tripInfo}>
                      <Text style={styles.tripTitle}>{item.tripName}</Text>
                      <Text style={styles.tripDetails}>
                        {formatTripDates(item.startDate, item.endDate)}
                      </Text>
                      <Text style={styles.tripLocations}>
                        {item.locations.length} location
                        {item.locations.length > 1 ? "s" : ""} •{" "}
                        {item.numberOfAdults + item.numberOfChildren} traveler
                        {item.numberOfAdults + item.numberOfChildren > 1
                          ? "s"
                          : ""}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                )}
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
  );

  const renderDateSelectionContent = () => {
    const bookingType =
      serviceDetail?.bookingConfig?.bookingType || "WHOLE_DAY";

    console.log("Date selection - serviceDetail:", serviceDetail);
    console.log(
      "Date selection - bookingConfig:",
      serviceDetail?.bookingConfig
    );
    console.log("Date selection - bookingType:", bookingType);

    return (
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          {bookingType === "MULTI_DAY"
            ? "Select your check-in and check-out dates"
            : bookingType === "TIME_SLOTS"
            ? "Select the date for your time slot"
            : "Select your preferred date(s)"}
        </Text>

        <DateSelectionWidget
          bookingType={bookingType}
          tripStartDate={
            selectedTrip ? new Date(selectedTrip.startDate) : undefined
          }
          tripEndDate={
            selectedTrip ? new Date(selectedTrip.endDate) : undefined
          }
          selectedDates={selectedDates}
          checkInDate={checkInDate}
          checkOutDate={checkOutDate}
          onDatesChange={(dates: Date[], checkIn?: Date, checkOut?: Date) => {
            setSelectedDates(dates);
            if (checkIn) setCheckInDate(checkIn);
            if (checkOut) setCheckOutDate(checkOut);
          }}
        />

        <View style={styles.buttonContainer}>
          <LongButton
            label={
              bookingType === "TIME_SLOTS" ||
              bookingType === "FLEXIBLE_HOURS" ||
              bookingType === "FIXED_TIME"
                ? "Continue to Time Selection"
                : serviceDetail?.priceConfig
                ? "Continue to Pricing"
                : "Continue to Confirmation"
            }
            onPress={() => {
              // Check if dates are selected before proceeding
              const hasValidDates =
                bookingType === "MULTI_DAY"
                  ? checkInDate && checkOutDate
                  : selectedDates.length > 0;

              if (!hasValidDates) {
                Alert.alert(
                  "Please Select Dates",
                  "You must select dates to continue."
                );
                return;
              }

              console.log("Date selection continue button pressed");
              console.log("Current booking type:", bookingType);
              const needsTimeSelection =
                bookingType === "TIME_SLOTS" ||
                bookingType === "FLEXIBLE_HOURS" ||
                bookingType === "FIXED_TIME";

              if (needsTimeSelection) {
                console.log("Setting step to TIME_DURATION");
                setCurrentStep(FlowStep.TIME_DURATION);
              } else if (serviceDetail?.priceConfig) {
                console.log("Setting step to PRICE_SUMMARY");
                setCurrentStep(FlowStep.PRICE_SUMMARY);
              } else {
                console.log("Setting step to CONFIRMATION");
                setCurrentStep(FlowStep.CONFIRMATION);
              }
            }}
          />
        </View>
      </View>
    );
  };

  const renderTimeSelectionContent = () => {
    const bookingType =
      serviceDetail?.bookingConfig?.bookingType || "WHOLE_DAY";

    console.log("Rendering time selection content");
    console.log("Booking type:", bookingType);
    console.log("Selected dates:", selectedDates);
    console.log("Check-in date:", checkInDate);

    return (
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          {bookingType === "TIME_SLOTS"
            ? "Select your preferred time slot"
            : bookingType === "FLEXIBLE_HOURS"
            ? "Select start time and duration"
            : "Select your preferred time"}
        </Text>

        <TimeSelectionWidget
          bookingType={bookingType}
          serviceDetail={serviceDetail}
          selectedTimeSlot={selectedTimeSlot}
          selectedDate={selectedDates[0] || checkInDate}
          availableTimeSlots={availableTimeSlots}
          isLoading={isLoading}
          onTimeSlotSelect={(timeSlot: TimeSlotsRequestDTO) => {
            setSelectedTimeSlot(timeSlot);
          }}
          onFetchTimeSlots={(date: Date) => {
            if (selectedTrip && date) {
              fetchAvailableTimeSlots(date);
            }
          }}
        />

        <View style={styles.buttonContainer}>
          <LongButton
            label={
              serviceDetail?.priceConfig
                ? "Continue to Pricing"
                : "Continue to Confirmation"
            }
            onPress={() => {
              if (serviceDetail?.priceConfig) {
                setCurrentStep(FlowStep.PRICE_SUMMARY);
              } else {
                setCurrentStep(FlowStep.CONFIRMATION);
              }
            }}
          />
        </View>
      </View>
    );
  };

  // Pricing calculation helper
  const calculatePricing = () => {
    if (!serviceDetail?.priceConfig) return null;

    const priceConfig = serviceDetail.priceConfig;
    const priceType = priceConfig.priceType;
    let basePrice = 0;
    let breakdown: Array<{ label: string; amount: number }> = [];

    switch (priceType) {
      case "FIXED":
        basePrice = priceConfig.fixedPrice || 0;
        breakdown.push({ label: "Fixed Price", amount: basePrice });
        break;

      case "PER_PERSON":
        const adultPrice = (priceConfig.pricePerAdult || 0) * adults;
        const childPrice = (priceConfig.pricePerChild || 0) * children;
        basePrice = adultPrice + childPrice;
        if (adultPrice > 0)
          breakdown.push({
            label: `${adults} Adult${adults > 1 ? "s" : ""}`,
            amount: adultPrice,
          });
        if (childPrice > 0)
          breakdown.push({
            label: `${children} Child${children > 1 ? "ren" : ""}`,
            amount: childPrice,
          });
        break;

      case "PER_UNIT":
        const unitPrice = (priceConfig.pricePerUnit || 0) * units;
        basePrice = unitPrice;
        breakdown.push({
          label: `${units} Unit${units > 1 ? "s" : ""}`,
          amount: unitPrice,
        });
        break;

      case "HYBRID":
        const hybridFixed = priceConfig.fixedPrice || 0;
        const hybridPerPerson =
          (priceConfig.pricePerAdult || 0) * adults +
          (priceConfig.pricePerChild || 0) * children;
        const hybridPerUnit = (priceConfig.pricePerUnit || 0) * units;
        basePrice = hybridFixed + hybridPerPerson + hybridPerUnit;
        if (hybridFixed > 0)
          breakdown.push({ label: "Base Price", amount: hybridFixed });
        if (hybridPerPerson > 0)
          breakdown.push({ label: "Per Person", amount: hybridPerPerson });
        if (hybridPerUnit > 0)
          breakdown.push({ label: "Per Unit", amount: hybridPerUnit });
        break;

      case "PER_HOUR":
      case "PER_DAY":
      case "PER_NIGHT":
        // Calculate duration based on booking type
        let duration = 1;
        if (checkInDate && checkOutDate) {
          const diffTime = Math.abs(
            checkOutDate.getTime() - checkInDate.getTime()
          );
          duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
        const timeBasedPrice =
          (priceConfig.pricePerUnit || priceConfig.fixedPrice || 0) * duration;
        basePrice = timeBasedPrice;
        breakdown.push({
          label: `${duration} ${
            priceType === "PER_HOUR"
              ? "Hour"
              : priceType === "PER_DAY"
              ? "Day"
              : "Night"
          }${duration > 1 ? "s" : ""}`,
          amount: timeBasedPrice,
        });
        break;

      default:
        basePrice = priceConfig.fixedPrice || 0;
        breakdown.push({ label: "Service Price", amount: basePrice });
    }

    // Calculate deposit/advance payment if required
    let depositAmount = 0;
    if (priceConfig.requiresDeposit && priceConfig.depositAmount) {
      depositAmount = priceConfig.depositAmount;
    } else if (priceConfig.allowAdvancePayment) {
      if (priceConfig.advancePaymentPercentage) {
        depositAmount =
          (basePrice * priceConfig.advancePaymentPercentage) / 100;
      } else if (priceConfig.advancePaymentFixedAmount) {
        depositAmount = priceConfig.advancePaymentFixedAmount;
      }
    }

    return {
      basePrice,
      breakdown,
      depositAmount,
      totalPrice: basePrice,
      requiresDeposit: priceConfig.requiresDeposit || false,
      allowsAdvancePayment: priceConfig.allowAdvancePayment || false,
    };
  };

  const renderPriceSummary = () => {
    const pricing = calculatePricing();

    if (!pricing) {
      return (
        <View style={styles.content}>
          <View style={styles.noPricingContainer}>
            <Ionicons name="pricetag-outline" size={48} color="#D1D5DB" />
            <Text style={styles.noPricingTitle}>Pricing Not Available</Text>
            <Text style={styles.noPricingText}>
              Please contact the service provider for pricing information.
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <LongButton
              label="Continue to Confirmation"
              onPress={() => setCurrentStep(FlowStep.CONFIRMATION)}
            />
          </View>
        </View>
      );
    }

    return (
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Review pricing details for your booking
        </Text>

        <View style={styles.pricingContainer}>
          <Text style={styles.pricingTitle}>Price Breakdown</Text>

          {pricing.breakdown.map((item, index) => (
            <View key={index} style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>{item.label}</Text>
              <Text style={styles.pricingAmount}>
                ${item.amount.toFixed(2)}
              </Text>
            </View>
          ))}

          <View style={styles.pricingDivider} />

          <View style={styles.pricingRow}>
            <Text style={styles.pricingTotalLabel}>Total Amount</Text>
            <Text style={styles.pricingTotalAmount}>
              ${pricing.totalPrice.toFixed(2)}
            </Text>
          </View>

          {pricing.depositAmount > 0 && (
            <>
              <View style={styles.pricingDivider} />
              <View style={styles.depositContainer}>
                <View style={styles.pricingRow}>
                  <Text style={styles.depositLabel}>
                    {pricing.requiresDeposit
                      ? "Required Deposit"
                      : "Advance Payment"}
                  </Text>
                  <Text style={styles.depositAmount}>
                    ${pricing.depositAmount.toFixed(2)}
                  </Text>
                </View>
                <Text style={styles.depositNote}>
                  {pricing.requiresDeposit
                    ? "A deposit is required to confirm your booking"
                    : "You can pay in advance to secure your booking"}
                </Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <LongButton
            label="Continue to Confirmation"
            onPress={() => setCurrentStep(FlowStep.CONFIRMATION)}
          />
        </View>
      </View>
    );
  };

  const renderConfirmation = () => (
    <View style={styles.content}>
      <Text style={styles.subtitle}>Review your booking details</Text>

      <View style={styles.confirmationContainer}>
        <Text style={styles.confirmationTitle}>Booking Summary</Text>

        <View style={styles.confirmationRow}>
          <Text style={styles.confirmationLabel}>Service:</Text>
          <Text style={styles.confirmationValue}>{service.serviceName}</Text>
        </View>

        <View style={styles.confirmationRow}>
          <Text style={styles.confirmationLabel}>Trip:</Text>
          <Text style={styles.confirmationValue}>{selectedTrip?.tripName}</Text>
        </View>

        <View style={styles.confirmationRow}>
          <Text style={styles.confirmationLabel}>Travelers:</Text>
          <Text style={styles.confirmationValue}>
            {adults} adult{adults > 1 ? "s" : ""}
            {children > 0 && `, ${children} child${children > 1 ? "ren" : ""}`}
          </Text>
        </View>

        {units > 1 && (
          <View style={styles.confirmationRow}>
            <Text style={styles.confirmationLabel}>Units:</Text>
            <Text style={styles.confirmationValue}>{units}</Text>
          </View>
        )}

        <View style={styles.confirmationRow}>
          <Text style={styles.confirmationLabel}>Dates:</Text>
          <Text style={styles.confirmationValue}>
            {checkInDate && checkOutDate
              ? `${checkInDate.toLocaleDateString()} - ${checkOutDate.toLocaleDateString()}`
              : selectedDates.map((d) => d.toLocaleDateString()).join(", ")}
          </Text>
        </View>

        {selectedTimeSlot && (
          <View style={styles.confirmationRow}>
            <Text style={styles.confirmationLabel}>Time:</Text>
            <Text style={styles.confirmationValue}>
              {selectedTimeSlot.slotStartTime} - {selectedTimeSlot.slotEndTime}
            </Text>
          </View>
        )}

        {/* Show pricing summary if available */}
        {calculatePricing() && (
          <>
            <View style={styles.confirmationDivider} />
            <View style={styles.confirmationRow}>
              <Text style={styles.confirmationLabel}>Total Price:</Text>
              <Text style={styles.confirmationPriceValue}>
                ${calculatePricing()?.totalPrice.toFixed(2)}
              </Text>
            </View>
            {calculatePricing()?.depositAmount &&
              calculatePricing()!.depositAmount > 0 && (
                <View style={styles.confirmationRow}>
                  <Text style={styles.confirmationLabel}>
                    {calculatePricing()?.requiresDeposit
                      ? "Required Deposit:"
                      : "Advance Payment:"}
                  </Text>
                  <Text style={styles.confirmationDepositValue}>
                    ${calculatePricing()?.depositAmount.toFixed(2)}
                  </Text>
                </View>
              )}
          </>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <LongButton
          label={isAdding ? "Adding to Trip..." : "Confirm & Add to Trip"}
          onPress={isAdding ? () => {} : handleConfirmAddToTrip}
        />
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    console.log("Rendering current step:", currentStep);
    switch (currentStep) {
      case FlowStep.TRIP_SELECTION:
        return renderTripSelection();
      case FlowStep.TRAVELERS_UNITS:
        return renderTravelersUnitsContent();
      case FlowStep.DATE_SELECTION:
        return renderDateSelectionContent();
      case FlowStep.TIME_DURATION:
        return renderTimeSelectionContent();
      case FlowStep.PRICE_SUMMARY:
        return renderPriceSummary();
      case FlowStep.CONFIRMATION:
        return renderConfirmation();
      default:
        return renderTripSelection();
    }
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="none">
        <TouchableWithoutFeedback
          onPress={
            currentStep === FlowStep.TRIP_SELECTION ? onClose : undefined
          }
        >
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.modal,
            { transform: [{ translateY: modalTranslateY }] },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.headerRow}>
              {currentStep !== FlowStep.TRIP_SELECTION && (
                <TouchableOpacity style={styles.backButton} onPress={goBack}>
                  <Ionicons name="arrow-back" size={24} color="#008080" />
                </TouchableOpacity>
              )}
              <View style={styles.headerTitleContainer}>
                <Text style={styles.modalTitle}>{getStepTitle()}</Text>
              </View>
            </View>
          </View>

          {renderCurrentStep()}
        </Animated.View>
      </Modal>

      <TripCreationFlow
        visible={showNewTripFlow}
        onClose={() => {
          console.log("TripCreationFlow onClose called");
          setShowNewTripFlow(false);
        }}
        onTripCreated={handleNewTripCreated}
      />
    </>
  );
};

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
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
    marginBottom: 24,
  },
  content: {
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
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
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
  confirmationContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  confirmationTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 16,
  },
  confirmationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  confirmationLabel: {
    fontSize: 14,
    color: "#6B7280",
    flex: 1,
  },
  confirmationValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    flex: 2,
    textAlign: "right",
  },
  buttonContainer: {
    paddingTop: 10,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  counterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  counterInfo: {
    flex: 1,
  },
  counterLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 2,
  },
  counterSubLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  counterControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  counterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0F8FF",
    borderWidth: 1,
    borderColor: "#008080",
    alignItems: "center",
    justifyContent: "center",
  },
  counterButtonDisabled: {
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
  },
  counterValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: "center",
  },
  // Date selection styles
  dateSelectionContainer: {
    flex: 1,
    marginBottom: 20,
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
  selectionSummary: {
    backgroundColor: "#F0F8FF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E6F7FF",
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
  // Time selection styles
  timeSlotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  timeSlotButton: {
    backgroundColor: "#F0F8FF",
    borderWidth: 1,
    borderColor: "#E6F7FF",
    borderRadius: 12,
    padding: 12,
    minWidth: "45%",
    alignItems: "center",
  },
  selectedTimeSlot: {
    backgroundColor: "#008080",
    borderColor: "#008080",
  },
  timeSlotContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#008080",
  },
  selectedTimeSlotText: {
    color: "#fff",
  },
  timeSlotSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
    textAlign: "center",
  },
  availableUnitsText: {
    fontSize: 12,
    color: "#6B7280",
  },
  timePickerContainer: {
    marginBottom: 24,
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
  timePicker: {
    alignItems: "center",
    marginHorizontal: 8,
  },
  timePickerButton: {
    padding: 8,
  },
  timePickerValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#008080",
    marginVertical: 8,
  },
  timeSeparator: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#008080",
    marginHorizontal: 8,
  },
  durationContainer: {
    marginBottom: 24,
  },
  durationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  durationButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0F8FF",
    borderWidth: 1,
    borderColor: "#008080",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
  },
  durationValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#008080",
    minWidth: 60,
    textAlign: "center",
  },
  timeSelectionSummary: {
    backgroundColor: "#F0F8FF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E6F7FF",
  },
  fixedTimeContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  fixedTimeTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  fixedTimeText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  scheduleContainer: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
    textAlign: "center",
  },
  scheduleItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  scheduleDayText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  timeText: {
    fontSize: 14,
    color: "#6B7280",
  },
  // Pricing styles
  pricingContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  pricingTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 16,
  },
  pricingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  pricingLabel: {
    fontSize: 14,
    color: "#6B7280",
    flex: 1,
  },
  pricingAmount: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  pricingDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },
  pricingTotalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  pricingTotalAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#008080",
  },
  depositContainer: {
    marginTop: 8,
  },
  depositLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#F59E0B",
  },
  depositAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F59E0B",
  },
  depositNote: {
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic",
    marginTop: 4,
  },
  noPricingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noPricingTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  noPricingText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  // Enhanced confirmation styles
  confirmationDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },
  confirmationPriceValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#008080",
    flex: 2,
    textAlign: "right",
  },
  confirmationDepositValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F59E0B",
    flex: 2,
    textAlign: "right",
  },
});

export default AddToTripFlow;
