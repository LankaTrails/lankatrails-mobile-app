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
import LongButton from "./LongButton";

interface UnitCountModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (units: number) => void;
  initialUnits?: number;
  unitType?: string; // e.g., "rooms", "vehicles", "tables"
  unitCapacity?: number; // How many people per unit
  totalTravelers?: number; // Total number of travelers
  minUnits?: number;
  maxUnits?: number;
}

const UNIT_COUNT_MODAL_HEIGHT = 0.5; // 50% of screen
const screenHeight = Dimensions.get("window").height;

export default function UnitCountModal({
  visible,
  onClose,
  onConfirm,
  initialUnits = 1,
  unitType = "units",
  unitCapacity = 4,
  totalTravelers = 1,
  minUnits = 1,
  maxUnits = 10,
}: UnitCountModalProps) {
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
      // Auto-calculate recommended units based on travelers
      const recommendedUnits = Math.max(
        minUnits,
        Math.ceil(totalTravelers / unitCapacity)
      );
      setUnits(Math.min(recommendedUnits, maxUnits));
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, totalTravelers, unitCapacity, minUnits, maxUnits]);

  const handleUnitsChange = (increment: boolean) => {
    if (increment) {
      setUnits((prev) => Math.min(maxUnits, prev + 1));
    } else {
      setUnits((prev) => Math.max(minUnits, prev - 1));
    }
  };

  const handleConfirm = () => {
    onConfirm(units);
  };

  const getCapacityInfo = () => {
    const totalCapacity = units * unitCapacity;
    if (totalCapacity >= totalTravelers) {
      return `${totalCapacity} capacity (${totalTravelers} needed)`;
    } else {
      return `${totalCapacity} capacity (${
        totalTravelers - totalCapacity
      } over capacity)`;
    }
  };

  const isOverCapacity = () => {
    return units * unitCapacity < totalTravelers;
  };

  const modalTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight * UNIT_COUNT_MODAL_HEIGHT, 0],
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
          {/* Header with back button */}
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backButton} onPress={onClose}>
              <Ionicons name="arrow-back" size={24} color="#008080" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.modalTitle}>Number of {unitType}</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            Select the number of {unitType} you need for your group
          </Text>
        </View>

        <View style={styles.content}>
          {/* Units Section */}
          <View style={styles.unitSection}>
            <View style={styles.unitInfo}>
              <Text style={styles.unitTitle}>
                {unitType.charAt(0).toUpperCase() + unitType.slice(1)}
              </Text>
              <Text style={styles.unitSubtitle}>
                Up to {unitCapacity} people per {unitType.slice(0, -1)}
              </Text>
            </View>
            <View style={styles.counterContainer}>
              <TouchableOpacity
                style={[
                  styles.counterButton,
                  units <= minUnits && styles.counterButtonDisabled,
                ]}
                onPress={() => handleUnitsChange(false)}
                disabled={units <= minUnits}
              >
                <Ionicons
                  name="remove"
                  size={20}
                  color={units <= minUnits ? "#D1D5DB" : "#008080"}
                />
              </TouchableOpacity>
              <View style={styles.countDisplay}>
                <Text style={styles.countNumber}>{units}</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.counterButton,
                  units >= maxUnits && styles.counterButtonDisabled,
                ]}
                onPress={() => handleUnitsChange(true)}
                disabled={units >= maxUnits}
              >
                <Ionicons
                  name="add"
                  size={20}
                  color={units >= maxUnits ? "#D1D5DB" : "#008080"}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Capacity Information */}
          <View style={styles.capacityContainer}>
            <View
              style={[
                styles.capacityContent,
                isOverCapacity() && styles.capacityContentWarning,
              ]}
            >
              <Ionicons
                name={isOverCapacity() ? "warning" : "checkmark-circle"}
                size={24}
                color={isOverCapacity() ? "#F59E0B" : "#008080"}
              />
              <View style={styles.capacityTextContainer}>
                <Text style={styles.capacityTitle}>
                  {isOverCapacity() ? "Over Capacity" : "Capacity Check"}
                </Text>
                <Text style={styles.capacitySubtitle}>{getCapacityInfo()}</Text>
              </View>
              <Text
                style={[
                  styles.totalCount,
                  isOverCapacity() && styles.totalCountWarning,
                ]}
              >
                {units}
              </Text>
            </View>
          </View>

          {/* Recommendation */}
          {totalTravelers > 0 && (
            <View style={styles.recommendationContainer}>
              <Text style={styles.recommendationTitle}>Recommendation</Text>
              <Text style={styles.recommendationText}>
                For {totalTravelers} traveler{totalTravelers > 1 ? "s" : ""}, we
                recommend {Math.ceil(totalTravelers / unitCapacity)}{" "}
                {unitType.slice(0, -1)}
                {Math.ceil(totalTravelers / unitCapacity) > 1 ? "s" : ""} to
                ensure everyone has comfortable space.
              </Text>
            </View>
          )}
        </View>

        {/* Confirm Button */}
        <View style={styles.buttonContainer}>
          <LongButton
            label={`Continue with ${units} ${
              units === 1 ? unitType.slice(0, -1) : unitType
            }`}
            onPress={handleConfirm}
          />
          {isOverCapacity() && (
            <Text style={styles.warningText}>
              Note: Selected {unitType} may not accommodate all travelers
              comfortably
            </Text>
          )}
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
  unitSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  unitInfo: {
    flex: 1,
  },
  unitTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 2,
  },
  unitSubtitle: {
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
  capacityContainer: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  capacityContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F8FF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E6F7FF",
  },
  capacityContentWarning: {
    backgroundColor: "#FEF3C7",
    borderColor: "#F3E8FF",
  },
  capacityTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  capacityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#008080",
    marginBottom: 2,
  },
  capacitySubtitle: {
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
  recommendationContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
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
