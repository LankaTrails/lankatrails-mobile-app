import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { ServiceDetail } from "../types/serviceTypes";
import LongButton from "./LongButton";

interface TravelersUnitsModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (adults: number, children: number, units: number) => void;
  initialAdults?: number;
  initialChildren?: number;
  initialUnits?: number;
  serviceDetail?: ServiceDetail;
}

const MODAL_HEIGHT = 0.7; // 70% of screen
const screenHeight = Dimensions.get("window").height;

export default function TravelersUnitsModal({
  visible,
  onClose,
  onConfirm,
  initialAdults = 1,
  initialChildren = 0,
  initialUnits = 1,
  serviceDetail,
}: TravelersUnitsModalProps) {
  const [adults, setAdults] = useState(initialAdults);
  const [children, setChildren] = useState(initialChildren);
  const [units, setUnits] = useState(initialUnits);

  // Modal animation
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto-calculate units when travelers change
      const totalTravelers = adults + children;
      const unitCapacity = serviceDetail?.bookingConfig?.unitAdultCapacity || 4;
      const recommendedUnits = Math.max(
        1,
        Math.ceil(totalTravelers / unitCapacity)
      );
      setUnits(recommendedUnits);
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  useEffect(() => {
    // Auto-calculate units when travelers change
    const totalTravelers = adults + children;
    const unitCapacity = serviceDetail?.bookingConfig?.unitAdultCapacity || 4;
    const recommendedUnits = Math.max(
      1,
      Math.ceil(totalTravelers / unitCapacity)
    );
    setUnits(recommendedUnits);
  }, [adults, children, serviceDetail]);

  const handleAdultsChange = (increment: boolean) => {
    if (increment) {
      setAdults((prev) => prev + 1);
    } else {
      setAdults((prev) => Math.max(1, prev - 1)); // Minimum 1 adult
    }
  };

  const handleChildrenChange = (increment: boolean) => {
    if (increment) {
      setChildren((prev) => prev + 1);
    } else {
      setChildren((prev) => Math.max(0, prev - 1)); // Minimum 0 children
    }
  };

  const handleUnitsChange = (increment: boolean) => {
    const minUnits = serviceDetail?.bookingConfig?.minUnitsPerBooking || 1;
    const maxUnits = serviceDetail?.bookingConfig?.maxUnitsPerBooking || 10;

    if (increment) {
      setUnits((prev) => Math.min(maxUnits, prev + 1));
    } else {
      setUnits((prev) => Math.max(minUnits, prev - 1));
    }
  };

  const handleConfirm = () => {
    onConfirm(adults, children, units);
  };

  const getTotalCount = () => adults + children;

  const getUnitType = () => {
    // Try to determine unit type from service detail
    if ((serviceDetail as any)?.accommodationType) return "rooms";
    if ((serviceDetail as any)?.vehicleCategory) return "vehicles";
    return "units";
  };

  const getUnitCapacity = () => {
    return serviceDetail?.bookingConfig?.unitAdultCapacity || 4;
  };

  const getTotalCapacity = () => {
    return units * getUnitCapacity();
  };

  const isOverCapacity = () => {
    return getTotalCapacity() < getTotalCount();
  };

  const modalTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight * MODAL_HEIGHT, 0],
  });

  const needsUnits =
    serviceDetail?.bookingConfig?.totalUnits &&
    serviceDetail?.bookingConfig?.totalUnits > 1;

  return (
    <Modal visible={visible} transparent animationType="none">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[styles.modal, { transform: [{ translateY: modalTranslateY }] }]}
      >
        <View style={styles.header}>
          {/* Header with back button */}
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backButton} onPress={onClose}>
              <Ionicons name="arrow-back" size={24} color="#008080" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.modalTitle}>Travelers & {getUnitType()}</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            Select the number of travelers and {getUnitType()} needed
          </Text>
        </View>

        <View style={styles.content}>
          {/* Adults Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Travelers</Text>

            <View style={styles.personSection}>
              <View style={styles.personInfo}>
                <Text style={styles.personTitle}>Adults</Text>
                <Text style={styles.personSubtitle}>Age 18+</Text>
              </View>
              <View style={styles.counterContainer}>
                <TouchableOpacity
                  style={[
                    styles.counterButton,
                    adults <= 1 && styles.counterButtonDisabled,
                  ]}
                  onPress={() => handleAdultsChange(false)}
                  disabled={adults <= 1}
                >
                  <Ionicons
                    name="remove"
                    size={20}
                    color={adults <= 1 ? "#D1D5DB" : "#008080"}
                  />
                </TouchableOpacity>
                <View style={styles.countDisplay}>
                  <Text style={styles.countNumber}>{adults}</Text>
                </View>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => handleAdultsChange(true)}
                >
                  <Ionicons name="add" size={20} color="#008080" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Children Section */}
            <View style={styles.personSection}>
              <View style={styles.personInfo}>
                <Text style={styles.personTitle}>Children</Text>
                <Text style={styles.personSubtitle}>Age 0-17</Text>
              </View>
              <View style={styles.counterContainer}>
                <TouchableOpacity
                  style={[
                    styles.counterButton,
                    children <= 0 && styles.counterButtonDisabled,
                  ]}
                  onPress={() => handleChildrenChange(false)}
                  disabled={children <= 0}
                >
                  <Ionicons
                    name="remove"
                    size={20}
                    color={children <= 0 ? "#D1D5DB" : "#008080"}
                  />
                </TouchableOpacity>
                <View style={styles.countDisplay}>
                  <Text style={styles.countNumber}>{children}</Text>
                </View>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => handleChildrenChange(true)}
                >
                  <Ionicons name="add" size={20} color="#008080" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Units Section - only show if needed */}
          {needsUnits && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>
                {getUnitType().charAt(0).toUpperCase() + getUnitType().slice(1)}
              </Text>

              <View style={styles.personSection}>
                <View style={styles.personInfo}>
                  <Text style={styles.personTitle}>
                    {getUnitType().charAt(0).toUpperCase() +
                      getUnitType().slice(1)}
                  </Text>
                  <Text style={styles.personSubtitle}>
                    Up to {getUnitCapacity()} people per{" "}
                    {getUnitType().slice(0, -1)}
                  </Text>
                </View>
                <View style={styles.counterContainer}>
                  <TouchableOpacity
                    style={[
                      styles.counterButton,
                      units <=
                        (serviceDetail?.bookingConfig?.minUnitsPerBooking ||
                          1) && styles.counterButtonDisabled,
                    ]}
                    onPress={() => handleUnitsChange(false)}
                    disabled={
                      units <=
                      (serviceDetail?.bookingConfig?.minUnitsPerBooking || 1)
                    }
                  >
                    <Ionicons
                      name="remove"
                      size={20}
                      color={
                        units <=
                        (serviceDetail?.bookingConfig?.minUnitsPerBooking || 1)
                          ? "#D1D5DB"
                          : "#008080"
                      }
                    />
                  </TouchableOpacity>
                  <View style={styles.countDisplay}>
                    <Text style={styles.countNumber}>{units}</Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.counterButton,
                      units >=
                        (serviceDetail?.bookingConfig?.maxUnitsPerBooking ||
                          10) && styles.counterButtonDisabled,
                    ]}
                    onPress={() => handleUnitsChange(true)}
                    disabled={
                      units >=
                      (serviceDetail?.bookingConfig?.maxUnitsPerBooking || 10)
                    }
                  >
                    <Ionicons
                      name="add"
                      size={20}
                      color={
                        units >=
                        (serviceDetail?.bookingConfig?.maxUnitsPerBooking || 10)
                          ? "#D1D5DB"
                          : "#008080"
                      }
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Summary */}
          <View style={styles.summaryContainer}>
            <View
              style={[
                styles.summaryContent,
                isOverCapacity() && styles.summaryContentWarning,
              ]}
            >
              <Ionicons
                name={isOverCapacity() ? "warning" : "people"}
                size={24}
                color={isOverCapacity() ? "#F59E0B" : "#008080"}
              />
              <View style={styles.summaryTextContainer}>
                <Text
                  style={[
                    styles.summaryTitle,
                    isOverCapacity() && styles.summaryTitleWarning,
                  ]}
                >
                  {isOverCapacity() ? "Capacity Warning" : "Booking Summary"}
                </Text>
                <Text style={styles.summarySubtitle}>
                  {adults} adult{adults > 1 ? "s" : ""}
                  {children > 0 &&
                    `, ${children} child${children > 1 ? "ren" : ""}`}
                  {needsUnits && (
                    <>
                      {" • "}
                      {units} {getUnitType().slice(0, -1)}
                      {units > 1 ? "s" : ""} ({getTotalCapacity()} capacity)
                    </>
                  )}
                </Text>
              </View>
              <Text
                style={[
                  styles.totalCount,
                  isOverCapacity() && styles.totalCountWarning,
                ]}
              >
                {getTotalCount()}
              </Text>
            </View>

            {isOverCapacity() && (
              <Text style={styles.warningText}>
                Selected {getUnitType()} may not accommodate all travelers
                comfortably
              </Text>
            )}
          </View>
        </View>

        {/* Confirm Button */}
        <View style={styles.buttonContainer}>
          <LongButton
            label={`Continue with ${getTotalCount()} traveler${
              getTotalCount() > 1 ? "s" : ""
            }${
              needsUnits
                ? ` & ${units} ${getUnitType().slice(0, -1)}${
                    units > 1 ? "s" : ""
                  }`
                : ""
            }`}
            onPress={handleConfirm}
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
    alignItems: "stretch",
    marginBottom: 24,
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
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 16,
  },
  personSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  personInfo: {
    flex: 1,
  },
  personTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 2,
  },
  personSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  counterContainer: {
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
  countDisplay: {
    width: 60,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
  },
  countNumber: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
  },
  summaryContainer: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  summaryContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F8FF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E6F7FF",
  },
  summaryContentWarning: {
    backgroundColor: "#FEF3C7",
    borderColor: "#F3E8FF",
  },
  summaryTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#008080",
    marginBottom: 2,
  },
  summaryTitleWarning: {
    color: "#F59E0B",
  },
  summarySubtitle: {
    fontSize: 14,
    color: "#374151",
  },
  totalCount: {
    fontSize: 24,
    fontWeight: "700",
    color: "#008080",
  },
  totalCountWarning: {
    color: "#F59E0B",
  },
  buttonContainer: {
    paddingTop: 20,
  },
  warningText: {
    fontSize: 12,
    color: "#F59E0B",
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
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
    paddingLeft: 0,
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
});
