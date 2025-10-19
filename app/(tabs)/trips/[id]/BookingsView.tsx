import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from "../../../theme";
import { getAllBookings, cancelBooking } from "@/services/bookingService";
import type { BookingItem, BookingStatus } from "@/types/bookingTypes";
import { usePaymentGateway } from "@/components/PaymentGateway";

interface TripBookingsProps {
  onBack?: () => void;
}

// Use BookingItem directly with some computed display properties
interface BookingUIData extends BookingItem {
  // Computed display properties
  displayTime: string;
  displayDate: string;
  displayDayName: string;
  displayDuration: string;
  displayLocation: string;
  displayProviderName: string;
}

const BookingsView: React.FC<TripBookingsProps> = ({ onBack }) => {
  const { id: tripId } = useLocalSearchParams();
  const [viewMode, setViewMode] = useState<"overview" | "details">("overview");
  const [selectedService, setSelectedService] = useState<BookingUIData | null>(
    null
  );
  const [fadeAnim] = useState(new Animated.Value(1));
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(
    null
  );
  const [bookingServices, setBookingServices] = useState<BookingUIData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [currentPaymentTripItemId, setCurrentPaymentTripItemId] = useState<
    number | null
  >(null);

  // Payment gateway hook for handling payments
  const paymentGateway = usePaymentGateway({
    onPaymentStart: () => {
      setProcessingPayment(true);
    },
    onPaymentSuccess: (bookingId, paymentAmount, currency) => {
      if (currentPaymentTripItemId) {
        // Update UI to show booking as confirmed
        setBookingServices((prev) =>
          prev.map((s) =>
            s.tripItemId === currentPaymentTripItemId
              ? { ...s, status: "CONFIRMED" as BookingStatus }
              : s
          )
        );
        console.log(
          `Payment successful for service ${currentPaymentTripItemId}, booking ${bookingId}`
        );
      }
      setProcessingPayment(false);
      setCurrentPaymentTripItemId(null); // Reset after success
    },
    onPaymentFailure: (error) => {
      if (currentPaymentTripItemId) {
        // Revert booking status on failure
        setBookingServices((prev) =>
          prev.map((s) =>
            s.tripItemId === currentPaymentTripItemId
              ? { ...s, status: "CANCELED" as BookingStatus }
              : s
          )
        );
        console.error(
          `Payment failed for service ${currentPaymentTripItemId}:`,
          error
        );
      }
      setProcessingPayment(false);
      setCurrentPaymentTripItemId(null); // Reset after failure
    },
    onPaymentCancel: () => {
      if (currentPaymentTripItemId) {
        // Revert booking status on cancellation
        setBookingServices((prev) =>
          prev.map((s) =>
            s.tripItemId === currentPaymentTripItemId
              ? { ...s, status: "CANCELED" as BookingStatus }
              : s
          )
        );
        console.log(`Payment canceled for service ${currentPaymentTripItemId}`);
      }
      setProcessingPayment(false);
      setCurrentPaymentTripItemId(null); // Reset after cancellation
    },
  });

  // Transform BookingItem to BookingUIData with computed display properties
  const transformBookingToUI = (booking: BookingItem): BookingUIData => {
    const startDate = booking.startTime
      ? new Date(booking.startTime)
      : new Date();
    const endDate = booking.endTime ? new Date(booking.endTime) : new Date();

    return {
      ...booking, // Spread all BookingItem properties
      displayTime: startDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      displayDuration: `${Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)
      )} hours`,
      displayDate: startDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      displayDayName: startDate.toLocaleDateString("en-US", {
        weekday: "long",
      }),
      displayLocation: booking.service?.locations?.[0]?.city || "Location",
      displayProviderName:
        booking.service?.provider?.businessName || "Service Provider"
    };
  };

  // Fetch bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      if (!tripId) {
        setError("Trip ID not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await getAllBookings(Number(tripId));

        if (response.success && response.data) {
          console.log("Fetched bookings successfully:", response.data);
          const transformedBookings = response.data.map(transformBookingToUI);
          setBookingServices(transformedBookings);
        } else {
          setError(response.message || "Failed to load bookings");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [tripId]);

  const getStatusText = (service: BookingUIData) => {
    switch (service.status) {
      case "CONFIRMED":
        return "Booked";
      case "PENDING":
        return "Pending";
      case "CANCELED":
        return "Canceled";
      case "PAYMENT_FAILED":
        return "Payment Failed";
      case "NOT_AVAILABLE":
        return "Not Available";
      default:
        return "Available";
    }
  };

  const getStatusColor = (service: BookingUIData) => {
    switch (service.status) {
      case "CONFIRMED":
        return "#10B981";
      case "PENDING":
        return "#F59E0B";
      case "CANCELED":
      case "PAYMENT_FAILED":
      case "NOT_AVAILABLE":
        return "#EF4444";
      default:
        return "#F59E0B";
    }
  };


  // Handle payment processing with Payment Gateway
  const handlePayment = async (tripItemId: number) => {
    const service = bookingServices.find((s) => s.tripItemId === tripItemId);
    if (!service) return;

    if (processingPayment) {
      Alert.alert("Processing", "Please wait, payment is being processed...");
      return;
    }

    // Set the current trip item ID for payment processing (for UI state management)
    setCurrentPaymentTripItemId(tripItemId);

    // Update UI to show booking as pending
    setBookingServices((prev) =>
      prev.map((s) =>
        s.tripItemId === tripItemId
          ? { ...s, status: "PENDING" as BookingStatus }
          : s
      )
    );

    // Trigger payment process with the correct tripItemId
    await paymentGateway.processPayment(tripItemId);
  };

  const handleBookService = async (serviceId: number) => {
    const service = bookingServices.find((s) => s.tripItemId === serviceId);
    if (!service) return;

    if (processingPayment) {
      Alert.alert("Processing", "Please wait, payment is being processed...");
      return;
    }

    Alert.alert(
      "Confirm Booking",
      `Are you sure you want to book "${
        service.service?.serviceName || "this service"
      }"?\n\nYou will be redirected to payment after confirmation.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Proceed to Payment",
          onPress: () => handlePayment(service.tripItemId),
        },
      ]
    );
  };

  // Handle multiple bookings with individual payments
  const handleBookAllPayments = async (services: BookingUIData[]) => {
    if (processingPayment) {
      Alert.alert("Processing", "Please wait, payment is being processed...");
      return;
    }

    Alert.alert(
      "Bulk Booking Notice",
      `Due to payment processing requirements, each service will be booked and paid for individually. You will see ${services.length} payment screens.\n\nProceed?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          onPress: async () => {
            for (let i = 0; i < services.length; i++) {
              const service = services[i];
              try {
                await handlePayment(service.tripItemId);
                // Small delay between payments to prevent overwhelming the user
                if (i < services.length - 1) {
                  await new Promise((resolve) => setTimeout(resolve, 1000));
                }
              } catch (error) {
                console.error(
                  `Failed to process payment for service ${service.tripItemId}:`,
                  error
                );
                // Continue with next service even if one fails
              }
            }
          },
        },
      ]
    );
  };

  const handleBookAll = () => {
    const availableServices = bookingServices.filter(
      (s) => s.status !== "CONFIRMED" && s.status !== "NOT_AVAILABLE"
    );
    if (availableServices.length === 0) {
      Alert.alert("No Services", "No available services to book.");
      return;
    }

    const totalCost = availableServices.reduce(
      (sum, s) => sum + (s.totalPrice || 0),
      0
    );
    Alert.alert(
      "Book All Available",
      `Book ${availableServices.length} available services for LKR ${totalCost}?\n\nNote: Each service will require separate payment processing.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Book All",
          onPress: () => handleBookAllPayments(availableServices),
        },
      ]
    );
  };

  const handleViewServiceDetails = (serviceId: number) => {
    // Navigate to service details screen or open modal
    console.log("Viewing service details:", serviceId);
    // You can implement navigation to a service details screen here
  };

  const handleRemoveService = async (serviceId: number) => {
    const service = bookingServices.find((s) => s.tripItemId === serviceId);
    if (!service) return;

    const actionText = service.status === "CONFIRMED" ? "cancel this booking" : "remove this service from your trip";
    const warningText = service.status === "CONFIRMED" 
      ? "This will cancel your confirmed booking. You may be subject to cancellation fees."
      : "This will remove the service from your trip.";

    Alert.alert(
      service.status === "CONFIRMED" ? "Cancel Booking" : "Remove Service",
      `Are you sure you want to ${actionText}?\n\n${warningText}`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: service.status === "CONFIRMED" ? "Cancel Booking" : "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              // Use cancelBooking API for both confirmed and unconfirmed bookings
              const response = await cancelBooking(serviceId);
              if (response.success) {
                setBookingServices((prev) =>
                  prev.filter((s) => s.tripItemId !== serviceId)
                );
                const successMessage = service.status === "CONFIRMED" 
                  ? "Booking cancelled successfully" 
                  : "Service removed successfully";
                Alert.alert("Success", successMessage);
              } else {
                Alert.alert("Error", response.message || "Failed to process request");
              }
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to process request");
              console.error("Error processing service removal/cancellation:", error);
            }
          },
        },
      ]
    );
  };

  const toggleServiceOptions = (serviceId: number) => {
    const serviceIdString = serviceId.toString();
    setExpandedServiceId(
      expandedServiceId === serviceIdString ? null : serviceIdString
    );
  };

  const handleBackToOverview = () => {
    setViewMode("overview");
    setSelectedService(null);
  };

  // Calculate counts for UI
  const availableCount = bookingServices.filter(
    (s) => s.status !== "CONFIRMED" && s.status !== "NOT_AVAILABLE"
  ).length;

  const OverviewView = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#008080" />
          <Text style={styles.loadingText}>Loading bookings...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              if (tripId) {
                // Retry fetching
                const fetchBookings = async () => {
                  try {
                    setLoading(true);
                    setError(null);
                    const response = await getAllBookings(Number(tripId));
                    if (response.success && response.data) {
                      const transformedBookings = response.data.map(transformBookingToUI);
                      setBookingServices(transformedBookings);
                    } else {
                      setError(response.message || "Failed to load bookings");
                    }
                  } catch (err: any) {
                    setError(err.message || "Failed to load bookings");
                  } finally {
                    setLoading(false);
                  }
                };
                fetchBookings();
              }
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (bookingServices.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No bookings found for this trip
          </Text>
          <Text style={styles.emptySubtext}>
            Add services to your trip to see bookings here
          </Text>
        </View>
      );
    }

    return (
      <Animated.View style={[styles.animatedContainer, { opacity: fadeAnim }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {availableCount > 0 && (
            <TouchableOpacity
              style={[
                styles.bookAllButton,
                processingPayment && styles.bookAllButtonDisabled,
              ]}
              onPress={handleBookAll}
              disabled={processingPayment}
            >
              {processingPayment ? (
                <View style={styles.bookAllButtonContent}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={[styles.bookAllText, { marginLeft: 8 }]}>
                    Processing...
                  </Text>
                </View>
              ) : (
                <Text style={styles.bookAllText}>
                  Book All Available ({availableCount})
                </Text>
              )}
            </TouchableOpacity>
          )}

          {bookingServices.map((service) => (
            <View key={service.tripItemId} style={styles.serviceCard}>
              <View style={styles.serviceHeader}>
                <View style={styles.serviceInfo}>
                  <View style={styles.serviceMainInfo}>
                    <Text style={styles.serviceName}>
                      {service.service?.serviceName || "Service"}
                    </Text>
                    <Text style={styles.serviceDateTime}>
                      {service.displayDate || "Date"} •{" "}
                      {service.displayTime || "Time"}
                    </Text>
                    <View style={styles.serviceLocationContainer}>
                      <MaterialIcons name="location-on" size={16} color={theme.colors.primary} style={styles.serviceLocationIcon} />
                      <Text style={styles.serviceLocation}>
                        {service.displayLocation || "Unknown Location"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.serviceStatus}>
                    {/* Status-based button in top right */}
                    {service.status === "CONFIRMED" ? (
                      <TouchableOpacity style={styles.bookedButton} disabled>
                        <Text style={styles.bookedButtonText}>Booked</Text>
                      </TouchableOpacity>
                    ) : service.status === "NOT_AVAILABLE" ? (
                      <TouchableOpacity
                        style={styles.unavailableButton}
                        disabled
                      >
                        <Text style={styles.unavailableButtonText}>
                          Not Available
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[
                          styles.bookButton,
                          processingPayment && styles.bookButtonDisabled,
                        ]}
                        onPress={(e) => {
                          e.stopPropagation();
                          if (!processingPayment) {
                            handleBookService(service.tripItemId);
                          }
                        }}
                        disabled={processingPayment}
                      >
                        {processingPayment ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Text style={styles.bookButtonText}>Book Now</Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.serviceDetails}>
                <View style={styles.serviceDetailRow}>
                  <Text style={styles.serviceDetailLabel}>Provider:</Text>
                  <Text style={styles.serviceDetailValue}>
                    {service.displayProviderName || "Unknown Provider"}
                  </Text>
                </View>
                <View style={styles.serviceDetailRow}>
                  <Text style={styles.serviceDetailLabel}>
                    Adults/Children:
                  </Text>
                  <Text style={styles.serviceDetailValue}>
                    {service.numberOfAdults || 0}/
                    {service.numberOfChildren || 0}
                  </Text>
                </View>
                {service.status === "CONFIRMED" && (
                  <View style={styles.serviceDetailRow}>
                    <Text style={styles.serviceDetailLabel}>Reference:</Text>
                    <Text style={styles.serviceDetailValue}>
                      BK-{service.tripItemId || "N/A"}
                    </Text>
                  </View>
                )}
                {service.totalPrice && (
                  <View style={styles.serviceDetailRow}>
                    <Text style={styles.serviceDetailLabel}>Total Price:</Text>
                    <Text style={styles.serviceDetailValue}>
                      LKR {service.totalPrice || 0}
                    </Text>
                  </View>
                )}
                {service.paidAmount && (
                  <View style={styles.serviceDetailRow}>
                    <Text style={styles.serviceDetailLabel}>Paid:</Text>
                    <Text style={styles.serviceDetailValue}>
                      LKR {service.paidAmount || 0}
                    </Text>
                  </View>
                )}
                {service.dueAmount && (
                  <View style={styles.serviceDetailRow}>
                    <Text style={styles.serviceDetailLabel}>Due:</Text>
                    <Text style={styles.serviceDetailValue}>
                      LKR {service.dueAmount || 0}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.serviceFooter}>
                <View style={styles.servicePriceContainer}>
                  <Text style={styles.servicePrice}>
                    LKR {service.totalPrice || 0}
                  </Text>
                  <Text style={styles.serviceDuration}>
                    {service.displayDuration || "Duration"}
                  </Text>
                </View>
                <View style={styles.serviceActions}>
                  <TouchableOpacity
                    onPress={() => toggleServiceOptions(service.tripItemId)}
                  >
                    <Text style={styles.editDetailsButton}>
                      {expandedServiceId === service.tripItemId.toString()
                        ? "Close"
                        : "Options"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Expanded Options */}
              {expandedServiceId === service.tripItemId.toString() && (
                <View style={styles.expandedOptions}>
                  <TouchableOpacity
                    style={styles.optionButton}
                    onPress={() => handleViewServiceDetails(service.tripItemId)}
                  >
                    <Text style={styles.optionButtonText}>View Details</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.optionButton, styles.removeButton]}
                    onPress={() => handleRemoveService(service.tripItemId)}
                  >
                    <Text
                      style={[styles.optionButtonText, styles.removeButtonText]}
                    >
                      {service.status === "CONFIRMED" ? "Cancel Booking" : "Remove"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </Animated.View>
    );
  };

  const DetailsView = () => {
    if (!selectedService) return null;

    return (
      <Animated.View style={[styles.animatedContainer, { opacity: fadeAnim }]}>
        <View style={styles.detailsHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToOverview}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.detailsHeaderText}>
            <Text style={styles.detailsTitle}>
              {selectedService.service?.serviceName || "Service"}
            </Text>
            <Text style={styles.detailsSubtitle}>
              {selectedService.displayDate} • {selectedService.displayDayName}
            </Text>
          </View>
          <View style={styles.detailsStatus}>
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(selectedService) },
              ]}
            >
              {getStatusText(selectedService)}
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.viewContainer}>
        {viewMode === "overview" && <OverviewView />}
        {viewMode === "details" && selectedService && <DetailsView />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  animatedContainer: {
    flex: 1,
  },
  viewContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#DC2626",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#008080",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 26,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
  bookAllButton: {
    backgroundColor: "#008080",
    borderRadius: 26,
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  bookAllText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  bookAllButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  bookAllButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  serviceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceHeader: {
    marginBottom: 12,
  },
  serviceInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  serviceMainInfo: {
    flex: 1,
    marginRight: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  serviceDateTime: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
  },
  serviceLocation: {
    fontSize: 14,
    color: "#6B7280",
  },
  serviceLocationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  serviceLocationIcon: {
    marginRight: 6,
  },
    serviceDetailText: {
    fontSize: 14,
    color: '#6B7280',
  },
  serviceStatus: {
    alignItems: "center",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  serviceDetails: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  serviceDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  serviceDetailLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  serviceDetailValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
  },
  serviceFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  servicePriceContainer: {
    flex: 1,
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  serviceDuration: {
    fontSize: 12,
    color: "#6B7280",
  },
  bookButton: {
    backgroundColor: "#008080",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 26,
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  bookButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  bookedButton: {
    backgroundColor: "#10B981",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 26,
    opacity: 0.8,
  },
  bookedButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  unavailableButton: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 26,
    opacity: 0.8,
  },
  unavailableButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  bookedIndicator: {
    backgroundColor: "#10B981",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bookedText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  fullIndicator: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  fullText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  detailsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#F3F4F6",
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  backIcon: {
    fontSize: 18,
    color: "#6B7280",
  },
  detailsHeaderText: {
    flex: 1,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  detailsSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  detailsStatus: {
    alignItems: "center",
  },
  detailsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsDescription: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
    marginBottom: 24,
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailsSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailsIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 20,
  },
  detailsContent: {
    flex: 1,
  },
  detailsLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
  },
  detailsValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
  },
  bookedSection: {
    backgroundColor: "#F0FDF4",
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  priceSection: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  priceSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  priceSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  priceSectionAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  priceSectionSubtext: {
    fontSize: 14,
    color: "#6B7280",
  },
  detailsBookButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  detailsBookButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  unavailableNotice: {
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  unavailableIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  unavailableText: {
    fontSize: 16,
    color: "#DC2626",
    fontWeight: "500",
  },
  serviceActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  editDetailsButton: {
    fontSize: 14,
    fontWeight: "600",
    color: "#008080",
  },
  expandedOptions: {
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    flexDirection: "row",
    gap: 12,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.lightPrimary,
    borderWidth: 1,
    borderColor: "#008080",
    alignItems: "center",
  },
  removeButton: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#008080",
  },
  removeButtonText: {
    color: "#DC2626",
  },
});

export default BookingsView;
