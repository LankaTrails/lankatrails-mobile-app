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
import { fetchServiceDetail } from "../services/serviceDetail";
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
      // Check-in date
      if (checkInDate && date.toDateString() === checkInDate.toDateString())
        return "checkIn";
      // Check-out date
      if (checkOutDate && date.toDateString() === checkOutDate.toDateString())
        return "checkOut";
      // Dates in between
      if (
        checkInDate &&
        checkOutDate &&
        date > checkInDate &&
        date < checkOutDate
      )
        return "between";
    } else {
      return selectedDates.some((d) => d.toDateString() === date.toDateString())
        ? "selected"
        : false;
    }
    return false;
  };

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(currentYear, currentMonth, day);
    if (isDateDisabled(selectedDate)) return;

    if (bookingType === "MULTI_DAY") {
      if (selectionMode === "checkIn" || (!checkInDate && !checkOutDate)) {
        // Reset any existing selection and set check-in
        onDatesChange([], selectedDate, undefined);
        setSelectionMode("checkOut");
      } else if (selectionMode === "checkOut") {
        if (checkInDate && selectedDate > checkInDate) {
          // Valid check-out date
          onDatesChange([], checkInDate, selectedDate);
          // Keep in checkOut mode to allow changing check-out date
        } else if (checkInDate && selectedDate < checkInDate) {
          // Selected date is before check-in, make it the new check-in
          onDatesChange([], selectedDate, undefined);
          setSelectionMode("checkOut");
        } else if (
          checkInDate &&
          selectedDate.toDateString() === checkInDate.toDateString()
        ) {
          // Clicked on check-in date, clear selection and start over
          onDatesChange([], undefined, undefined);
          setSelectionMode("checkIn");
        } else {
          // Same date as check-in or invalid, reset
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
      const selectionType = isDateSelected(date);
      const isDisabled = isDateDisabled(date);
      const isToday = new Date().toDateString() === date.toDateString();

      // Determine styling based on selection type for multi-day
      let dayButtonStyle: any[] = [styles.dayButton];
      let dayTextStyle: any[] = [styles.dayText];

      if (isDisabled) {
        dayButtonStyle.push(styles.disabledDay);
        dayTextStyle.push(styles.disabledDayText);
      } else if (bookingType === "MULTI_DAY") {
        if (selectionType === "checkIn") {
          dayButtonStyle.push(styles.selectedDay);
          dayButtonStyle.push({ backgroundColor: "#059669" });
          dayTextStyle.push(styles.selectedDayText);
        } else if (selectionType === "checkOut") {
          dayButtonStyle.push(styles.selectedDay);
          dayButtonStyle.push({ backgroundColor: "#DC2626" });
          dayTextStyle.push(styles.selectedDayText);
        } else if (selectionType === "between") {
          dayButtonStyle.push({
            backgroundColor: "#E0F2FE",
            borderColor: "#0EA5E9",
            borderWidth: 1,
          });
          dayTextStyle.push({ color: "#0EA5E9" });
        } else if (isToday) {
          dayButtonStyle.push(styles.todayDay);
          dayTextStyle.push(styles.todayDayText);
        }
      } else {
        if (selectionType) {
          dayButtonStyle.push(styles.selectedDay);
          dayTextStyle.push(styles.selectedDayText);
        } else if (isToday) {
          dayButtonStyle.push(styles.todayDay);
          dayTextStyle.push(styles.todayDayText);
        }
      }

      days.push(
        <View key={day} style={styles.dayCell}>
          <TouchableOpacity
            style={dayButtonStyle}
            onPress={() => handleDateSelect(day)}
            disabled={isDisabled}
          >
            <Text style={dayTextStyle}>{day}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return days;
  };

  return (
    <View style={styles.dateSelectionContainer}>
      {/* Multi-day Selection Status */}
      {bookingType === "MULTI_DAY" && (
        <View
          style={{
            padding: 16,
            backgroundColor: "#F0F9FF",
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#1E40AF",
              marginBottom: 8,
            }}
          >
            Select Check-in & Check-out Dates
          </Text>

          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: "#6B7280", marginBottom: 4 }}>
                Check-in
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: checkInDate ? "#059669" : "#9CA3AF",
                }}
              >
                {checkInDate ? checkInDate.toLocaleDateString() : "Select date"}
              </Text>
            </View>

            <View
              style={{
                width: 20,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="arrow-forward" size={16} color="#6B7280" />
            </View>

            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Text style={{ fontSize: 12, color: "#6B7280", marginBottom: 4 }}>
                Check-out
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: checkOutDate ? "#059669" : "#9CA3AF",
                }}
              >
                {checkOutDate
                  ? checkOutDate.toLocaleDateString()
                  : "Select date"}
              </Text>
            </View>
          </View>

          {checkInDate && checkOutDate && (
            <View
              style={{
                marginTop: 12,
                padding: 8,
                backgroundColor: "#ECFDF5",
                borderRadius: 6,
              }}
            >
              <Text
                style={{ fontSize: 13, color: "#059669", textAlign: "center" }}
              >
                {(() => {
                  const diffTime = Math.abs(
                    checkOutDate.getTime() - checkInDate.getTime()
                  );
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return `${diffDays} night${diffDays > 1 ? "s" : ""} selected`;
                })()}
              </Text>
            </View>
          )}

          <Text
            style={{
              fontSize: 12,
              color: "#6B7280",
              marginTop: 8,
              textAlign: "center",
            }}
          >
            {selectionMode === "checkIn"
              ? "Tap a date to set check-in"
              : selectionMode === "checkOut"
              ? "Tap a date to set check-out"
              : "Tap dates to modify your selection"}
          </Text>

          {/* Clear selection button */}
          {(checkInDate || checkOutDate) && (
            <TouchableOpacity
              style={{
                marginTop: 12,
                paddingVertical: 8,
                paddingHorizontal: 16,
                backgroundColor: "#FEF2F2",
                borderRadius: 6,
                alignSelf: "center",
              }}
              onPress={() => {
                onDatesChange([], undefined, undefined);
                setSelectionMode("checkIn");
              }}
            >
              <Text
                style={{ fontSize: 12, color: "#DC2626", fontWeight: "500" }}
              >
                Clear Selection
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

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
      {/* <View style={styles.selectionSummary}>
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
      </View> */}
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
  customStartHour?: number;
  customStartMinute?: number;
  customDuration?: number;
  onTimeSlotSelect: (timeSlot: TimeSlotsRequestDTO) => void;
  onCustomTimeChange?: (hour: number, minute: number, duration: number) => void;
  onFetchTimeSlots: (date: Date) => void;
}> = ({
  bookingType,
  serviceDetail,
  selectedTimeSlot,
  selectedDate,
  availableTimeSlots,
  isLoading,
  customStartHour = 9,
  customStartMinute = 0,
  customDuration = 1,
  onTimeSlotSelect,
  onCustomTimeChange,
  onFetchTimeSlots,
}) => {
  console.log("TimeSelectionWidget rendered with:");
  console.log("- bookingType:", bookingType);
  console.log("- selectedDate:", selectedDate);
  console.log("- availableTimeSlots:", availableTimeSlots);

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
        {/* <Text style={styles.sectionTitle}>Available Time Slots</Text> */}
        {/* <Text style={styles.timeSlotSubtitle}>
          Select a time slot that works for your schedule
        </Text> */}
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
                  {slot.slotStartTime.substring(0, 5)} -{" "}
                  {slot.slotEndTime.substring(0, 5)}
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
              onPress={() =>
                onCustomTimeChange?.(
                  customStartHour === 0 ? 23 : customStartHour - 1,
                  customStartMinute,
                  customDuration
                )
              }
              style={styles.timePickerButton}
            >
              <Ionicons name="chevron-up" size={20} color="#008080" />
            </TouchableOpacity>
            <Text style={styles.timePickerValue}>
              {customStartHour.toString().padStart(2, "0")}
            </Text>
            <TouchableOpacity
              onPress={() =>
                onCustomTimeChange?.(
                  customStartHour === 23 ? 0 : customStartHour + 1,
                  customStartMinute,
                  customDuration
                )
              }
              style={styles.timePickerButton}
            >
              <Ionicons name="chevron-down" size={20} color="#008080" />
            </TouchableOpacity>
          </View>

          <Text style={styles.timeSeparator}>:</Text>

          <View style={styles.timePicker}>
            <TouchableOpacity
              onPress={() =>
                onCustomTimeChange?.(
                  customStartHour,
                  customStartMinute === 0 ? 45 : customStartMinute - 15,
                  customDuration
                )
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
                onCustomTimeChange?.(
                  customStartHour,
                  customStartMinute === 45 ? 0 : customStartMinute + 15,
                  customDuration
                )
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
            onPress={() =>
              onCustomTimeChange?.(
                customStartHour,
                customStartMinute,
                Math.max(0.5, customDuration - 0.5)
              )
            }
            style={styles.durationButton}
          >
            <Ionicons name="remove" size={20} color="#008080" />
          </TouchableOpacity>
          <Text style={styles.durationValue}>{customDuration}</Text>
          <TouchableOpacity
            onPress={() =>
              onCustomTimeChange?.(
                customStartHour,
                customStartMinute,
                Math.min(12, customDuration + 0.5)
              )
            }
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
          {Math.floor((customStartHour + customDuration) % 24)
            .toString()
            .padStart(2, "0")}
          :
          {((customStartMinute + (customDuration % 1) * 60) % 60)
            .toString()
            .padStart(2, "0")}
          {customDuration === 1 ? " (1 hour)" : ` (${customDuration} hours)`}
        </Text>
      </View>
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
            {serviceDetail.availableTimeDTOS.map(
              (schedule: any, index: number) => (
                <View key={index} style={styles.scheduleItem}>
                  <Text style={styles.scheduleDayText}>
                    {schedule.dayOfWeek}
                  </Text>
                  <Text style={styles.timeText}>
                    {schedule.isClosed
                      ? "Closed"
                      : schedule.is24Hours
                      ? "24 Hours"
                      : `${schedule.openTime} - ${schedule.closeTime}`}
                  </Text>
                </View>
              )
            )}
          </View>
        )}
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
      return renderEventBased(); // TODO:
    case "WHOLE_DAY":
      return renderWholeDayService();
    case "MULTI_DAY":
      return renderWholeDayService(); // Multi-day doesn't need time selection
    default:
      return renderFixedTime(); // Default to fixed time
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
  const [fetchedServiceDetail, setFetchedServiceDetail] =
    useState<ServiceDetail | null>(null);
  const [isLoadingServiceDetail, setIsLoadingServiceDetail] = useState(false);

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

  // Custom time selection for FLEXIBLE_HOURS
  const [customStartHour, setCustomStartHour] = useState(9);
  const [customStartMinute, setCustomStartMinute] = useState(0);
  const [customDuration, setCustomDuration] = useState(1);

  // Animation
  const slideAnim = useRef(new Animated.Value(0)).current;
  const screenHeight = Dimensions.get("window").height;

  // Helper to get current service detail (prop or fetched)
  const getCurrentServiceDetail = (): ServiceDetail | undefined => {
    return serviceDetail || fetchedServiceDetail || undefined;
  };

  // Fetch service details if not provided
  const fetchServiceDetails = async () => {
    if (serviceDetail || fetchedServiceDetail || isLoadingServiceDetail) {
      return; // Already have details or currently loading
    }

    try {
      setIsLoadingServiceDetail(true);
      console.log(
        `🔍 Fetching service details for ${service.serviceId} (${service.category})`
      );

      const response = await fetchServiceDetail(
        service.serviceId,
        service.category as any
      );
      if (response.success && response.data) {
        setFetchedServiceDetail(response.data);
        console.log(
          `✅ Service details fetched successfully for ${service.serviceName}`
        );
      } else {
        console.error(
          `❌ Failed to fetch service details: ${response.message}`
        );
      }
    } catch (error) {
      console.error(`❌ Error fetching service details:`, error);
    } finally {
      setIsLoadingServiceDetail(false);
    }
  };

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
      // Fetch service details if not available
      if (!serviceDetail && !fetchedServiceDetail && !isLoadingServiceDetail) {
        fetchServiceDetails();
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
    setCustomStartHour(9);
    setCustomStartMinute(0);
    setCustomDuration(1);
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

  // Auto-suggest units when travelers change
  useEffect(() => {
    const currentServiceDetail = getCurrentServiceDetail();
    if (
      currentStep === FlowStep.TRAVELERS_UNITS &&
      currentServiceDetail?.bookingConfig?.manageCapacity
    ) {
      const suggested = getSuggestedUnits();
      // Only auto-update if current units is 1 (default) and suggestion is different
      if (units === 1 && suggested !== 1) {
        setUnits(suggested);
      }
    }
  }, [adults, children, currentStep]);

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

  // Helper function to determine if time selection is needed
  const needsTimeSelection = (bookingType?: BookingType) => {
    if (!bookingType) return false;
    return ["TIME_SLOTS", "FLEXIBLE_HOURS", "FIXED_TIME"].includes(bookingType);
  };

  // Helper function to determine if pricing should be shown
  const shouldShowPricing = () => {
    const currentServiceDetail = getCurrentServiceDetail();
    return (
      currentServiceDetail?.priceConfig !== undefined &&
      currentServiceDetail?.priceConfig !== null
    );
  };

  // Helper function to get next step after date selection
  const getNextStepAfterDates = (bookingType?: BookingType) => {
    if (needsTimeSelection(bookingType)) {
      return FlowStep.TIME_DURATION;
    } else if (shouldShowPricing()) {
      return FlowStep.PRICE_SUMMARY;
    } else {
      return FlowStep.CONFIRMATION;
    }
  };

  // Helper function to get next step after time selection
  const getNextStepAfterTime = () => {
    if (shouldShowPricing()) {
      return FlowStep.PRICE_SUMMARY;
    } else {
      return FlowStep.CONFIRMATION;
    }
  };

  // Helper function to validate date selection
  const validateDateSelection = (
    dates: Date[],
    checkIn?: Date,
    checkOut?: Date
  ): { isValid: boolean; errorMessage?: string } => {
    const currentServiceDetail = getCurrentServiceDetail();
    const bookingConfig = currentServiceDetail?.bookingConfig;
    const bookingType = bookingConfig?.bookingType;

    // Check if dates are selected
    if (bookingType === "MULTI_DAY") {
      if (!checkIn || !checkOut) {
        return {
          isValid: false,
          errorMessage: "Please select check-in and check-out dates.",
        };
      }
    } else {
      if (dates.length === 0) {
        return {
          isValid: false,
          errorMessage: "Please select at least one date.",
        };
      }
    }

    // Validate last minute booking period (minimum advance booking time)
    if (bookingConfig?.lastMinuteBookingPeriod) {
      const minBookingDate = new Date();
      minBookingDate.setHours(
        minBookingDate.getHours() + bookingConfig.lastMinuteBookingPeriod
      );

      const dateToCheck = checkIn || dates[0];
      if (dateToCheck && dateToCheck < minBookingDate) {
        return {
          isValid: false,
          errorMessage: `Bookings must be made at least ${bookingConfig.lastMinuteBookingPeriod} hours in advance.`,
        };
      }
    }

    // Validate advance booking period (maximum advance booking time)
    if (bookingConfig?.advanceBookingPeriod) {
      const maxBookingDate = new Date();
      maxBookingDate.setDate(
        maxBookingDate.getDate() + bookingConfig.advanceBookingPeriod
      );

      const dateToCheck = checkIn || dates[0];
      if (dateToCheck && dateToCheck > maxBookingDate) {
        return {
          isValid: false,
          errorMessage: `Bookings cannot be made more than ${bookingConfig.advanceBookingPeriod} days in advance.`,
        };
      }
    }

    // Validate minimum and maximum booking days for multi-day bookings
    if (bookingType === "MULTI_DAY" && checkIn && checkOut) {
      const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (
        bookingConfig?.minimumBookingDays &&
        diffDays < bookingConfig.minimumBookingDays
      ) {
        return {
          isValid: false,
          errorMessage: `Minimum booking period is ${bookingConfig.minimumBookingDays} days.`,
        };
      }

      if (
        bookingConfig?.maximumBookingDays &&
        diffDays > bookingConfig.maximumBookingDays
      ) {
        return {
          isValid: false,
          errorMessage: `Maximum booking period is ${bookingConfig.maximumBookingDays} days.`,
        };
      }
    }

    // Check if selected dates are within trip dates
    if (selectedTrip) {
      const tripStart = new Date(selectedTrip.startDate);
      const tripEnd = new Date(selectedTrip.endDate);

      const datesToCheck =
        bookingType === "MULTI_DAY" ? [checkIn!, checkOut!] : dates;

      for (const date of datesToCheck) {
        if (date < tripStart || date > tripEnd) {
          return {
            isValid: false,
            errorMessage: "Selected dates must be within your trip dates.",
          };
        }
      }
    }

    return { isValid: true };
  };

  const handleDatesConfirmed = async (
    dates: Date[],
    checkIn?: Date,
    checkOut?: Date
  ) => {
    // Validate date selection
    const validation = validateDateSelection(dates, checkIn, checkOut);
    if (!validation.isValid) {
      Alert.alert("Invalid Date Selection", validation.errorMessage);
      return;
    }

    setSelectedDates(dates);
    if (checkIn) setCheckInDate(checkIn);
    if (checkOut) setCheckOutDate(checkOut);

    const currentServiceDetail = getCurrentServiceDetail();
    const bookingType = currentServiceDetail?.bookingConfig?.bookingType;

    // For TIME_SLOTS, fetch available slots before proceeding
    if (bookingType === "TIME_SLOTS" && dates.length > 0) {
      await fetchAvailableTimeSlots(dates[0]);
    }

    // Navigate to next step
    const nextStep = getNextStepAfterDates(bookingType);
    setCurrentStep(nextStep);
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
    const nextStep = getNextStepAfterTime();
    setCurrentStep(nextStep);
  };

  const handleConfirmAddToTrip = async () => {
    if (!selectedTrip) return;

    setIsAdding(true);
    try {
      // Calculate start and end times based on booking type
      let startTime: string;
      let endTime: string;

      const currentServiceDetail = getCurrentServiceDetail();
      const bookingType = currentServiceDetail?.bookingConfig?.bookingType;
      const bookingConfig = currentServiceDetail?.bookingConfig;

      console.log("🔍 Debug time calculation:");
      console.log("🔍 bookingType:", bookingType);
      console.log("🔍 selectedTimeSlot:", selectedTimeSlot);
      console.log("🔍 selectedDates:", selectedDates);
      console.log("🔍 checkInDate:", checkInDate);
      console.log("🔍 checkOutDate:", checkOutDate);
      console.log("🔍 customStartHour:", customStartHour);
      console.log("🔍 customStartMinute:", customStartMinute);
      console.log("🔍 customDuration:", customDuration);

      if (bookingType === "MULTI_DAY" && checkInDate && checkOutDate) {
        console.log("🔍 Taking MULTI_DAY path");
        const checkInTime = bookingConfig?.defaultCheckInTime || "15:00";
        const checkOutTime = bookingConfig?.defaultCheckOutTime || "11:00";

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

        const selectedDate = new Date(selectedDates[0]);
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const day = selectedDate.getDate();

        // Use the exact times from the API response
        const startTimeStr = selectedTimeSlot.slotStartTime;
        const endTimeStr = selectedTimeSlot.slotEndTime;

        // Create ISO datetime strings by combining date and time
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
          day
        ).padStart(2, "0")}`;
        const startTimeFormatted = startTimeStr.substring(0, 5);
        const endTimeFormatted = endTimeStr.substring(0, 5);
        startTime = `${dateStr}T${startTimeFormatted}`;
        endTime = `${dateStr}T${endTimeFormatted}`;
      } else if (bookingType === "FLEXIBLE_HOURS" && selectedDates.length > 0) {
        console.log("🔍 Taking FLEXIBLE_HOURS path");

        const selectedDate = new Date(selectedDates[0]);
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const day = selectedDate.getDate();

        // Calculate start and end times based on custom selection
        const startDateTime = new Date(
          year,
          month,
          day,
          customStartHour,
          customStartMinute,
          0,
          0
        );

        // Calculate end time based on duration
        const endDateTime = new Date(startDateTime);
        const durationMs = customDuration * 60 * 60 * 1000; // Convert hours to milliseconds
        endDateTime.setTime(endDateTime.getTime() + durationMs);

        startTime = startDateTime.toISOString();
        endTime = endDateTime.toISOString();
      } else if (bookingType === "WHOLE_DAY" && selectedDates.length > 0) {
        console.log("🔍 Taking WHOLE_DAY path");

        const selectedDate = new Date(selectedDates[0]);
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const day = selectedDate.getDate();

        // Use service operating hours if available, otherwise full day
        const currentServiceDetail = getCurrentServiceDetail();
        const serviceHours = currentServiceDetail?.availableTimeDTOS?.find(
          (schedule) =>
            !schedule.isClosed &&
            schedule.dayOfWeek ===
              [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ][selectedDate.getDay()]
        );

        let startHour = 0,
          startMinute = 0,
          endHour = 23,
          endMinute = 59;

        if (serviceHours && !serviceHours.is24Hours) {
          [startHour, startMinute] = serviceHours.openTime
            .split(":")
            .map(Number);
          [endHour, endMinute] = serviceHours.closeTime.split(":").map(Number);
        }

        const startDateTime = new Date(
          year,
          month,
          day,
          startHour,
          startMinute,
          0,
          0
        );
        const endDateTime = new Date(
          year,
          month,
          day,
          endHour,
          endMinute,
          0,
          0
        );

        startTime = startDateTime.toISOString();
        endTime = endDateTime.toISOString();
      } else if (bookingType === "FIXED_TIME" && selectedDates.length > 0) {
        console.log("🔍 Taking FIXED_TIME path");

        const selectedDate = new Date(selectedDates[0]);
        const dayName = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ][selectedDate.getDay()];

        // Find the service hours for the selected day
        const currentServiceDetail = getCurrentServiceDetail();
        const serviceHours = currentServiceDetail?.availableTimeDTOS?.find(
          (schedule) => schedule.dayOfWeek === dayName && !schedule.isClosed
        );

        if (serviceHours) {
          const year = selectedDate.getFullYear();
          const month = selectedDate.getMonth();
          const day = selectedDate.getDate();

          const [startHour, startMinute] = serviceHours.openTime
            .split(":")
            .map(Number);
          const [endHour, endMinute] = serviceHours.closeTime
            .split(":")
            .map(Number);

          const startDateTime = new Date(
            year,
            month,
            day,
            startHour,
            startMinute,
            0,
            0
          );
          const endDateTime = new Date(
            year,
            month,
            day,
            endHour,
            endMinute,
            0,
            0
          );

          startTime = startDateTime.toISOString();
          endTime = endDateTime.toISOString();
        } else {
          // Fallback to default hours
          const year = selectedDate.getFullYear();
          const month = selectedDate.getMonth();
          const day = selectedDate.getDate();

          const startDateTime = new Date(year, month, day, 9, 0, 0, 0);
          const endDateTime = new Date(year, month, day, 17, 0, 0, 0);

          startTime = startDateTime.toISOString();
          endTime = endDateTime.toISOString();
        }
      } else if (bookingType === "EVENT_BASED" && selectedDates.length > 0) {
        console.log("🔍 Taking EVENT_BASED path");

        const selectedDate = new Date(selectedDates[0]);
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const day = selectedDate.getDate();

        // For event-based services, you might need additional event data
        // For now, use default event hours
        const eventStartTime = "09:00";
        const eventEndTime = "17:00";

        const [startHour, startMinute] = eventStartTime.split(":").map(Number);
        const [endHour, endMinute] = eventEndTime.split(":").map(Number);

        const startDateTime = new Date(
          year,
          month,
          day,
          startHour,
          startMinute,
          0,
          0
        );
        const endDateTime = new Date(
          year,
          month,
          day,
          endHour,
          endMinute,
          0,
          0
        );

        startTime = startDateTime.toISOString();
        endTime = endDateTime.toISOString();
      } else if (selectedDates.length > 0) {
        console.log("🔍 Taking default/fallback path");

        const selectedDate = new Date(selectedDates[0]);
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const day = selectedDate.getDate();

        const startDateTime = new Date(year, month, day, 9, 0, 0, 0);
        const endDateTime = new Date(year, month, day, 17, 0, 0, 0);

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
        const errorMessage =
          response.message || "Failed to add service to trip";
        console.error("API Error:", response);
        Alert.alert("Error", errorMessage);
      }
    } catch (error) {
      console.error("Error adding to trip:", error);

      let errorMessage = "Failed to add service to trip. Please try again.";

      if (error && typeof error === "object") {
        if ("response" in error && error.response) {
          const response = error.response as any;
          if (response.data && response.data.message) {
            errorMessage = response.data.message;
          } else if (response.statusText) {
            errorMessage = `Error: ${response.statusText}`;
          }
        } else if ("message" in error && typeof error.message === "string") {
          errorMessage = error.message;
        }
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setIsAdding(false);
    }
  };

  const goBack = () => {
    const currentServiceDetail = getCurrentServiceDetail();
    const bookingType = currentServiceDetail?.bookingConfig?.bookingType;

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
        if (needsTimeSelection(bookingType)) {
          setCurrentStep(FlowStep.TIME_DURATION);
        } else {
          setCurrentStep(FlowStep.DATE_SELECTION);
        }
        break;
      case FlowStep.CONFIRMATION:
        if (shouldShowPricing()) {
          setCurrentStep(FlowStep.PRICE_SUMMARY);
        } else if (needsTimeSelection(bookingType)) {
          setCurrentStep(FlowStep.TIME_DURATION);
        } else {
          setCurrentStep(FlowStep.DATE_SELECTION);
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

  // Helper function to validate travelers and units
  const validateTravelersAndUnits = (): {
    isValid: boolean;
    errorMessage?: string;
  } => {
    const currentServiceDetail = getCurrentServiceDetail();
    const bookingConfig = currentServiceDetail?.bookingConfig;
    const priceConfig = currentServiceDetail?.priceConfig;

    // Basic validation - at least one traveler required
    if (adults + children === 0) {
      return {
        isValid: false,
        errorMessage: "At least one traveler is required.",
      };
    }

    // Basic validation - at least one unit required
    if (units < 1) {
      return {
        isValid: false,
        errorMessage: "At least one unit is required.",
      };
    }

    // Validate minimum units per booking
    if (
      bookingConfig?.minUnitsPerBooking &&
      units < bookingConfig.minUnitsPerBooking
    ) {
      return {
        isValid: false,
        errorMessage: `Minimum ${bookingConfig.minUnitsPerBooking} unit${
          bookingConfig.minUnitsPerBooking > 1 ? "s" : ""
        } required per booking.`,
      };
    }

    // Validate maximum units per booking
    if (
      bookingConfig?.maxUnitsPerBooking &&
      units > bookingConfig.maxUnitsPerBooking
    ) {
      return {
        isValid: false,
        errorMessage: `Maximum ${bookingConfig.maxUnitsPerBooking} unit${
          bookingConfig.maxUnitsPerBooking > 1 ? "s" : ""
        } allowed per booking.`,
      };
    }

    // Check total units availability
    if (bookingConfig?.totalUnits && units > bookingConfig.totalUnits) {
      return {
        isValid: false,
        errorMessage: `Only ${bookingConfig.totalUnits} unit${
          bookingConfig.totalUnits > 1 ? "s" : ""
        } available in total.`,
      };
    }

    // Capacity management validation - Enhanced for precise adult/child capacity handling
    if (bookingConfig?.manageCapacity) {
      // If both adult and child capacities are defined separately
      if (bookingConfig.unitAdultCapacity && bookingConfig.unitChildCapacity) {
        const baseAdultCapacity = bookingConfig.unitAdultCapacity * units;
        const baseChildCapacity = bookingConfig.unitChildCapacity * units;

        // Validate adult capacity
        if (adults > baseAdultCapacity) {
          const excessAdults = adults - baseAdultCapacity;

          if (!bookingConfig.allowExtraCapacity) {
            // Calculate minimum units needed for adults
            const minUnitsForAdults = Math.ceil(
              adults / bookingConfig.unitAdultCapacity
            );
            return {
              isValid: false,
              errorMessage: `${adults} adults require at least ${minUnitsForAdults} unit${
                minUnitsForAdults > 1 ? "s" : ""
              }. Current: ${units} unit${
                units > 1 ? "s" : ""
              } (max ${baseAdultCapacity} adults).`,
            };
          }

          // Check extra adult capacity limits
          if (
            bookingConfig.extraAdultCapacityLimit !== undefined &&
            excessAdults > bookingConfig.extraAdultCapacityLimit
          ) {
            return {
              isValid: false,
              errorMessage: `Maximum ${
                bookingConfig.extraAdultCapacityLimit
              } extra adult${
                bookingConfig.extraAdultCapacityLimit > 1 ? "s" : ""
              } allowed across all units.`,
            };
          }
        }

        // Validate child capacity
        if (children > baseChildCapacity) {
          const excessChildren = children - baseChildCapacity;

          if (!bookingConfig.allowExtraCapacity) {
            // Calculate minimum units needed for children
            const minUnitsForChildren = Math.ceil(
              children / bookingConfig.unitChildCapacity
            );
            return {
              isValid: false,
              errorMessage: `${children} child${
                children > 1 ? "ren" : ""
              } require at least ${minUnitsForChildren} unit${
                minUnitsForChildren > 1 ? "s" : ""
              }. Current: ${units} unit${
                units > 1 ? "s" : ""
              } (max ${baseChildCapacity} children).`,
            };
          }

          // Check extra child capacity limits
          if (
            bookingConfig.extraChildCapacityLimit !== undefined &&
            excessChildren > bookingConfig.extraChildCapacityLimit
          ) {
            return {
              isValid: false,
              errorMessage: `Maximum ${
                bookingConfig.extraChildCapacityLimit
              } extra child${
                bookingConfig.extraChildCapacityLimit > 1 ? "ren" : ""
              } allowed across all units.`,
            };
          }
        }

        // Check if current units are insufficient (suggest more units)
        const minUnitsForAdults = Math.ceil(
          adults / bookingConfig.unitAdultCapacity
        );
        const minUnitsForChildren = Math.ceil(
          children / bookingConfig.unitChildCapacity
        );
        const requiredUnits = Math.max(minUnitsForAdults, minUnitsForChildren);

        if (units < requiredUnits && !bookingConfig.allowExtraCapacity) {
          return {
            isValid: false,
            errorMessage: `Insufficient units. Need ${requiredUnits} unit${
              requiredUnits > 1 ? "s" : ""
            } for ${adults} adult${
              adults > 1 ? "s" : ""
            } and ${children} child${children > 1 ? "ren" : ""}.`,
          };
        }
      }

      // If only adult capacity is defined (treats as total capacity per unit)
      else if (bookingConfig.unitAdultCapacity) {
        const totalTravelers = adults + children;
        const baseCapacity = bookingConfig.unitAdultCapacity * units;

        if (totalTravelers > baseCapacity) {
          if (!bookingConfig.allowExtraCapacity) {
            const requiredUnits = Math.ceil(
              totalTravelers / bookingConfig.unitAdultCapacity
            );
            return {
              isValid: false,
              errorMessage: `${totalTravelers} traveler${
                totalTravelers > 1 ? "s" : ""
              } require at least ${requiredUnits} unit${
                requiredUnits > 1 ? "s" : ""
              }. Current: ${units} unit${
                units > 1 ? "s" : ""
              } (max ${baseCapacity} people).`,
            };
          }

          // Check total extra capacity limit
          const extraPeopleNeeded = totalTravelers - baseCapacity;
          const maxExtraCapacity =
            (bookingConfig.extraAdultCapacityLimit || 0) +
            (bookingConfig.extraChildCapacityLimit || 0);

          if (maxExtraCapacity > 0 && extraPeopleNeeded > maxExtraCapacity) {
            return {
              isValid: false,
              errorMessage: `Maximum ${maxExtraCapacity} extra people allowed across all units.`,
            };
          }
        }
      }
    }

    // Pricing-related validation
    if (priceConfig) {
      // For per-unit pricing, ensure units make sense with travelers
      if (
        priceConfig.priceType === "PER_UNIT" &&
        bookingConfig?.manageCapacity
      ) {
        const unitCapacity = bookingConfig.unitAdultCapacity || 1;
        const recommendedUnits = Math.ceil((adults + children) / unitCapacity);

        // Warn if units seem insufficient (not blocking, just informative)
        if (units < recommendedUnits && !bookingConfig.allowExtraCapacity) {
          return {
            isValid: false,
            errorMessage: `${recommendedUnits} unit${
              recommendedUnits > 1 ? "s" : ""
            } recommended for ${adults + children} traveler${
              adults + children > 1 ? "s" : ""
            }.`,
          };
        }
      }

      // For per-person pricing with extra charges, validate extra capacity costs
      if (
        priceConfig.priceType === "PER_PERSON" &&
        priceConfig.extraPerAdult &&
        priceConfig.extraPerChild
      ) {
        if (bookingConfig?.manageCapacity && bookingConfig.unitAdultCapacity) {
          const baseCapacity = bookingConfig.unitAdultCapacity * units;
          const extraPeople = Math.max(0, adults + children - baseCapacity);

          // Ensure extra charges are configured if extra capacity is being used
          if (
            extraPeople > 0 &&
            !priceConfig.extraPerAdult &&
            !priceConfig.extraPerChild
          ) {
            return {
              isValid: false,
              errorMessage:
                "Extra capacity pricing not configured for this service.",
            };
          }
        }
      }

      // Validate deposit requirements
      if (priceConfig.requiresDeposit && !priceConfig.depositAmount) {
        return {
          isValid: false,
          errorMessage: "Deposit amount not configured for this service.",
        };
      }
    }

    // Booking type specific validations
    if (bookingConfig?.bookingType) {
      switch (bookingConfig.bookingType) {
        case "MULTI_DAY":
          // For multi-day bookings, units often represent rooms/accommodations
          if (bookingConfig.manageCapacity && bookingConfig.unitAdultCapacity) {
            const totalCapacity = bookingConfig.unitAdultCapacity * units;
            if (
              adults + children > totalCapacity &&
              !bookingConfig.allowExtraCapacity
            ) {
              return {
                isValid: false,
                errorMessage: `${units} unit${
                  units > 1 ? "s" : ""
                } can accommodate maximum ${totalCapacity} guest${
                  totalCapacity > 1 ? "s" : ""
                }.`,
              };
            }
          }
          break;

        case "TIME_SLOTS":
          // For time slots, validate that we don't exceed slot capacity
          if (bookingConfig.totalUnits && units > bookingConfig.totalUnits) {
            return {
              isValid: false,
              errorMessage: `Only ${bookingConfig.totalUnits} slot${
                bookingConfig.totalUnits > 1 ? "s" : ""
              } available for this time.`,
            };
          }
          break;

        case "FLEXIBLE_HOURS":
          // For flexible hours, ensure reasonable unit count
          if (units > 10) {
            // Arbitrary reasonable limit
            return {
              isValid: false,
              errorMessage:
                "Maximum 10 units allowed for flexible hour bookings.",
            };
          }
          break;
      }
    }

    return { isValid: true };
  };

  // Helper function to suggest optimal units based on travelers and configuration
  const getSuggestedUnits = (): number => {
    const currentServiceDetail = getCurrentServiceDetail();
    const bookingConfig = currentServiceDetail?.bookingConfig;

    if (!bookingConfig?.manageCapacity) {
      return 1; // Default to 1 if no capacity management
    }

    let suggestedUnits = 1;

    // Calculate units needed based on separate adult and child capacities
    if (bookingConfig.unitAdultCapacity && bookingConfig.unitChildCapacity) {
      // Both adult and child capacities are defined
      const unitsForAdults = Math.ceil(
        adults / bookingConfig.unitAdultCapacity
      );
      const unitsForChildren = Math.ceil(
        children / bookingConfig.unitChildCapacity
      );

      // Take the maximum of both requirements
      suggestedUnits = Math.max(unitsForAdults, unitsForChildren, 1);
    } else if (bookingConfig.unitAdultCapacity) {
      // Only adult capacity defined - treat as total capacity per unit
      const totalTravelers = adults + children;
      suggestedUnits = Math.ceil(
        totalTravelers / bookingConfig.unitAdultCapacity
      );
    } else {
      // No specific capacities defined
      suggestedUnits = 1;
    }

    // Apply minimum units constraint
    if (bookingConfig.minUnitsPerBooking) {
      suggestedUnits = Math.max(
        suggestedUnits,
        bookingConfig.minUnitsPerBooking
      );
    }

    // Apply maximum units constraint
    if (bookingConfig.maxUnitsPerBooking) {
      suggestedUnits = Math.min(
        suggestedUnits,
        bookingConfig.maxUnitsPerBooking
      );
    }

    // Apply total units availability constraint
    if (bookingConfig.totalUnits) {
      suggestedUnits = Math.min(suggestedUnits, bookingConfig.totalUnits);
    }

    return Math.max(1, suggestedUnits);
  };

  // Helper function to get smart unit counter limits
  const getUnitCounterLimits = () => {
    const currentServiceDetail = getCurrentServiceDetail();
    const bookingConfig = currentServiceDetail?.bookingConfig;

    let minUnits = 1;
    let maxUnits = 999; // Large default

    // Apply booking config constraints
    if (bookingConfig?.minUnitsPerBooking) {
      minUnits = Math.max(minUnits, bookingConfig.minUnitsPerBooking);
    }

    if (bookingConfig?.maxUnitsPerBooking) {
      maxUnits = Math.min(maxUnits, bookingConfig.maxUnitsPerBooking);
    }

    if (bookingConfig?.totalUnits) {
      maxUnits = Math.min(maxUnits, bookingConfig.totalUnits);
    }

    // For certain booking types, apply reasonable limits
    if (bookingConfig?.bookingType === "FLEXIBLE_HOURS") {
      maxUnits = Math.min(maxUnits, 10);
    }

    return { minUnits, maxUnits };
  };

  const renderTravelersUnitsContent = () => {
    const currentServiceDetail = getCurrentServiceDetail();
    const bookingConfig = currentServiceDetail?.bookingConfig;

    return (
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
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={styles.sectionTitle}>Units</Text>
            {(() => {
              const suggested = getSuggestedUnits();
              return (
                suggested !== units && (
                  <TouchableOpacity
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      backgroundColor: "#E0F2F1",
                      borderRadius: 12,
                    }}
                    onPress={() => setUnits(suggested)}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#008080",
                        fontWeight: "500",
                      }}
                    >
                      Suggested: {suggested}
                    </Text>
                  </TouchableOpacity>
                )
              );
            })()}
          </View>

          <View style={styles.counterRow}>
            <View style={styles.counterInfo}>
              <Text style={styles.counterLabel}>
                {bookingConfig?.unitAdultCapacity
                  ? bookingConfig.bookingType === "MULTI_DAY"
                    ? "Rooms/Accommodations"
                    : "Units/Groups"
                  : "Units"}
              </Text>
              <Text style={styles.counterSubLabel}>
                {bookingConfig?.unitAdultCapacity &&
                bookingConfig?.unitChildCapacity
                  ? `${bookingConfig.unitAdultCapacity} adults + ${bookingConfig.unitChildCapacity} children per unit`
                  : bookingConfig?.unitAdultCapacity
                  ? `${bookingConfig.unitAdultCapacity} guests per unit`
                  : bookingConfig?.totalUnits
                  ? `${bookingConfig.totalUnits} total available`
                  : "Select number needed"}
              </Text>
            </View>
            <View style={styles.counterControls}>
              {(() => {
                const { minUnits, maxUnits } = getUnitCounterLimits();
                return (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.counterButton,
                        units <= minUnits && styles.counterButtonDisabled,
                      ]}
                      onPress={() => {
                        if (units > minUnits) setUnits(units - 1);
                      }}
                      disabled={units <= minUnits}
                    >
                      <Ionicons
                        name="remove"
                        size={20}
                        color={units <= minUnits ? "#D1D5DB" : "#008080"}
                      />
                    </TouchableOpacity>
                    <Text style={styles.counterValue}>{units}</Text>
                    <TouchableOpacity
                      style={[
                        styles.counterButton,
                        units >= maxUnits && styles.counterButtonDisabled,
                      ]}
                      onPress={() => {
                        if (units < maxUnits) setUnits(units + 1);
                      }}
                      disabled={units >= maxUnits}
                    >
                      <Ionicons
                        name="add"
                        size={20}
                        color={units >= maxUnits ? "#D1D5DB" : "#008080"}
                      />
                    </TouchableOpacity>
                  </>
                );
              })()}
            </View>
          </View>

          {/* Enhanced capacity information */}
          {bookingConfig?.manageCapacity && (
            <View style={styles.capacityInfo}>
              {bookingConfig.unitAdultCapacity &&
              bookingConfig.unitChildCapacity ? (
                // Detailed capacity breakdown for separate adult/child limits
                <View>
                  <Text style={styles.capacityText}>
                    Capacity per unit: {bookingConfig.unitAdultCapacity} adults
                    + {bookingConfig.unitChildCapacity} children
                  </Text>
                  <Text style={styles.capacityText}>
                    Total capacity: {bookingConfig.unitAdultCapacity * units}{" "}
                    adults + {bookingConfig.unitChildCapacity * units} children
                  </Text>

                  {/* Check if we need more units for adults */}
                  {adults > bookingConfig.unitAdultCapacity * units && (
                    <Text
                      style={[
                        styles.capacityText,
                        { color: "#EF4444", fontWeight: "600" },
                      ]}
                    >
                      ⚠️ Need{" "}
                      {Math.ceil(adults / bookingConfig.unitAdultCapacity)} unit
                      {Math.ceil(adults / bookingConfig.unitAdultCapacity) > 1
                        ? "s"
                        : ""}{" "}
                      for {adults} adults
                    </Text>
                  )}

                  {/* Check if we need more units for children */}
                  {children > bookingConfig.unitChildCapacity * units && (
                    <Text
                      style={[
                        styles.capacityText,
                        { color: "#EF4444", fontWeight: "600" },
                      ]}
                    >
                      ⚠️ Need{" "}
                      {Math.ceil(children / bookingConfig.unitChildCapacity)}{" "}
                      unit
                      {Math.ceil(children / bookingConfig.unitChildCapacity) > 1
                        ? "s"
                        : ""}{" "}
                      for {children} children
                    </Text>
                  )}

                  {/* Show extra capacity usage if allowed */}
                  {(adults > bookingConfig.unitAdultCapacity * units ||
                    children > bookingConfig.unitChildCapacity * units) &&
                    bookingConfig.allowExtraCapacity && (
                      <Text style={[styles.capacityText, { color: "#F59E0B" }]}>
                        Extra capacity:{" "}
                        {Math.max(
                          0,
                          adults - bookingConfig.unitAdultCapacity * units
                        )}{" "}
                        adults,{" "}
                        {Math.max(
                          0,
                          children - bookingConfig.unitChildCapacity * units
                        )}{" "}
                        children
                      </Text>
                    )}

                  {/* Show if current selection is optimal */}
                  {(() => {
                    const requiredAdultUnits = Math.ceil(
                      adults / bookingConfig.unitAdultCapacity
                    );
                    const requiredChildUnits = Math.ceil(
                      children / bookingConfig.unitChildCapacity
                    );
                    const optimalUnits = Math.max(
                      requiredAdultUnits,
                      requiredChildUnits
                    );

                    if (
                      units === optimalUnits &&
                      adults <= bookingConfig.unitAdultCapacity * units &&
                      children <= bookingConfig.unitChildCapacity * units
                    ) {
                      return (
                        <Text
                          style={[
                            styles.capacityText,
                            { color: "#059669", fontWeight: "600" },
                          ]}
                        >
                          ✓ Optimal unit selection
                        </Text>
                      );
                    }
                    return null;
                  })()}
                </View>
              ) : bookingConfig.unitAdultCapacity ? (
                // Simple capacity (total people per unit)
                <View>
                  <Text style={styles.capacityText}>
                    Capacity per unit: {bookingConfig.unitAdultCapacity} people
                  </Text>
                  <Text style={styles.capacityText}>
                    Total capacity: {bookingConfig.unitAdultCapacity * units}{" "}
                    people
                  </Text>

                  {/* Check if we need more units */}
                  {adults + children >
                    bookingConfig.unitAdultCapacity * units && (
                    <Text
                      style={[
                        styles.capacityText,
                        {
                          color: bookingConfig.allowExtraCapacity
                            ? "#F59E0B"
                            : "#EF4444",
                          fontWeight: "600",
                        },
                      ]}
                    >
                      {bookingConfig.allowExtraCapacity
                        ? `Extra: ${
                            adults +
                            children -
                            bookingConfig.unitAdultCapacity * units
                          } people`
                        : `⚠️ Need ${Math.ceil(
                            (adults + children) /
                              bookingConfig.unitAdultCapacity
                          )} unit${
                            Math.ceil(
                              (adults + children) /
                                bookingConfig.unitAdultCapacity
                            ) > 1
                              ? "s"
                              : ""
                          } for ${adults + children} people`}
                    </Text>
                  )}

                  {/* Show if optimal */}
                  {(() => {
                    const optimalUnits = Math.ceil(
                      (adults + children) / bookingConfig.unitAdultCapacity
                    );
                    if (
                      units === optimalUnits &&
                      adults + children <=
                        bookingConfig.unitAdultCapacity * units
                    ) {
                      return (
                        <Text
                          style={[
                            styles.capacityText,
                            { color: "#059669", fontWeight: "600" },
                          ]}
                        >
                          ✓ Optimal unit selection
                        </Text>
                      );
                    }
                    return null;
                  })()}
                </View>
              ) : (
                <Text style={styles.capacityText}>
                  {units} unit{units > 1 ? "s" : ""} selected
                </Text>
              )}

              {/* Show constraints */}
              {(bookingConfig.minUnitsPerBooking ||
                bookingConfig.maxUnitsPerBooking ||
                bookingConfig.totalUnits) && (
                <Text
                  style={[
                    styles.capacityText,
                    { fontSize: 11, color: "#6B7280", marginTop: 4 },
                  ]}
                >
                  Constraints:
                  {bookingConfig.minUnitsPerBooking &&
                    ` Min: ${bookingConfig.minUnitsPerBooking}`}
                  {bookingConfig.maxUnitsPerBooking &&
                    ` Max: ${bookingConfig.maxUnitsPerBooking}`}
                  {bookingConfig.totalUnits &&
                    ` Available: ${bookingConfig.totalUnits}`}
                </Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <LongButton
            label="Continue to Dates"
            onPress={() => {
              const validation = validateTravelersAndUnits();
              if (!validation.isValid) {
                Alert.alert("Invalid Selection", validation.errorMessage);
                return;
              }
              setCurrentStep(FlowStep.DATE_SELECTION);
            }}
          />
        </View>
      </View>
    );
  };

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
    const currentServiceDetail = getCurrentServiceDetail();
    const bookingType =
      currentServiceDetail?.bookingConfig?.bookingType || "WHOLE_DAY";

    console.log("Date selection - serviceDetail:", currentServiceDetail);
    console.log(
      "Date selection - bookingConfig:",
      currentServiceDetail?.bookingConfig
    );
    console.log("Date selection - bookingType:", bookingType);

    return (
      <View style={styles.content}>
        {/* <Text style={styles.subtitle}>
          {bookingType === "MULTI_DAY"
            ? "Select your check-in and check-out dates"
            : bookingType === "TIME_SLOTS"
            ? "Select the date for your time slot"
            : "Select your preferred date(s)"}
        </Text> */}

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
              needsTimeSelection(bookingType)
                ? "Continue to Time Selection"
                : shouldShowPricing()
                ? "Continue to Pricing"
                : "Continue to Confirmation"
            }
            onPress={() => {
              // Enhanced validation for dates before proceeding
              const validation = validateDateSelection(
                selectedDates,
                checkInDate || undefined,
                checkOutDate || undefined
              );
              if (!validation.isValid) {
                Alert.alert(
                  "Please Select Valid Dates",
                  validation.errorMessage
                );
                return;
              }

              // Additional check for multi-day bookings
              if (bookingType === "MULTI_DAY") {
                if (!checkInDate || !checkOutDate) {
                  Alert.alert(
                    "Incomplete Selection",
                    "Please select both check-in and check-out dates."
                  );
                  return;
                }

                if (checkOutDate <= checkInDate) {
                  Alert.alert(
                    "Invalid Date Range",
                    "Check-out date must be after check-in date."
                  );
                  return;
                }
              }

              const nextStep = getNextStepAfterDates(bookingType);
              setCurrentStep(nextStep);
            }}
          />
        </View>
      </View>
    );
  };

  const renderTimeSelectionContent = () => {
    const currentServiceDetail = getCurrentServiceDetail();
    const bookingType =
      currentServiceDetail?.bookingConfig?.bookingType || "WHOLE_DAY";

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
          serviceDetail={getCurrentServiceDetail()}
          selectedTimeSlot={selectedTimeSlot}
          selectedDate={selectedDates[0] || checkInDate}
          availableTimeSlots={availableTimeSlots}
          isLoading={isLoading}
          customStartHour={customStartHour}
          customStartMinute={customStartMinute}
          customDuration={customDuration}
          onTimeSlotSelect={(timeSlot: TimeSlotsRequestDTO) => {
            setSelectedTimeSlot(timeSlot);
          }}
          onCustomTimeChange={(
            hour: number,
            minute: number,
            duration: number
          ) => {
            setCustomStartHour(hour);
            setCustomStartMinute(minute);
            setCustomDuration(duration);
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
              shouldShowPricing()
                ? "Continue to Pricing"
                : "Continue to Confirmation"
            }
            onPress={() => {
              const nextStep = getNextStepAfterTime();
              setCurrentStep(nextStep);
            }}
          />
        </View>
      </View>
    );
  };

  // Pricing calculation helper
  const calculatePricing = () => {
    const currentServiceDetail = getCurrentServiceDetail();
    if (!currentServiceDetail?.priceConfig) return null;

    const priceConfig = currentServiceDetail.priceConfig;
    const priceType = priceConfig.priceType;
    const bookingType = currentServiceDetail?.bookingConfig?.bookingType;
    let basePrice = 0;
    let breakdown: Array<{ label: string; amount: number }> = [];

    // Calculate duration for time-based pricing
    const calculateDuration = () => {
      if (bookingType === "MULTI_DAY" && checkInDate && checkOutDate) {
        const diffTime = Math.abs(
          checkOutDate.getTime() - checkInDate.getTime()
        );
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      } else if (bookingType === "FLEXIBLE_HOURS") {
        return customDuration;
      } else {
        return 1; // Default duration
      }
    };

    const duration = calculateDuration();

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
        const hourlyPrice =
          (priceConfig.pricePerUnit || priceConfig.fixedPrice || 0) * duration;
        basePrice = hourlyPrice;
        breakdown.push({
          label: `${duration} Hour${duration > 1 ? "s" : ""}`,
          amount: hourlyPrice,
        });
        break;

      case "PER_DAY":
        const dailyPrice =
          (priceConfig.pricePerUnit || priceConfig.fixedPrice || 0) * duration;
        basePrice = dailyPrice;
        breakdown.push({
          label: `${duration} Day${duration > 1 ? "s" : ""}`,
          amount: dailyPrice,
        });
        break;

      case "PER_NIGHT":
        const nightlyPrice =
          (priceConfig.pricePerUnit || priceConfig.fixedPrice || 0) *
          Math.max(duration - 1, 1);
        basePrice = nightlyPrice;
        breakdown.push({
          label: `${Math.max(duration - 1, 1)} Night${
            Math.max(duration - 1, 1) > 1 ? "s" : ""
          }`,
          amount: nightlyPrice,
        });
        break;

      case "PER_KM":
        // For distance-based pricing, we'd need additional distance data
        // For now, use a default or require distance input
        const distance = 10; // This should come from route calculation or user input
        const kmPrice = (priceConfig.pricePerUnit || 0) * distance;
        basePrice = kmPrice;
        breakdown.push({
          label: `${distance} KM`,
          amount: kmPrice,
        });
        break;

      default:
        basePrice = priceConfig.fixedPrice || 0;
        breakdown.push({ label: "Service Price", amount: basePrice });
    }

    // Apply unit multiplier for multi-unit bookings
    if (units > 1 && !["PER_UNIT", "HYBRID"].includes(priceType)) {
      basePrice *= units;
      breakdown = breakdown.map((item) => ({
        ...item,
        amount: item.amount * units,
        label: item.label + ` (×${units} units)`,
      }));
    }

    // Calculate extra charges if applicable
    let extraCharges = 0;
    if (priceConfig.extraChargePerUnit && units > 1) {
      extraCharges += priceConfig.extraChargePerUnit * (units - 1);
    }
    if (
      priceConfig.extraPerAdult &&
      adults > (serviceDetail?.bookingConfig?.unitAdultCapacity || 0)
    ) {
      const extraAdults =
        adults - (serviceDetail?.bookingConfig?.unitAdultCapacity || 0);
      extraCharges += priceConfig.extraPerAdult * extraAdults;
    }
    if (
      priceConfig.extraPerChild &&
      children > (serviceDetail?.bookingConfig?.unitChildCapacity || 0)
    ) {
      const extraChildren =
        children - (serviceDetail?.bookingConfig?.unitChildCapacity || 0);
      extraCharges += priceConfig.extraPerChild * extraChildren;
    }

    if (extraCharges > 0) {
      breakdown.push({ label: "Extra Charges", amount: extraCharges });
      basePrice += extraCharges;
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
      duration,
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
  capacityInfo: {
    backgroundColor: "#F0F8FF",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E6F7FF",
  },
  capacityText: {
    fontSize: 14,
    color: "#008080",
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
