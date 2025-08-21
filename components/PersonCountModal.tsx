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

interface PersonCountModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (adults: number, children: number) => void;
  initialAdults?: number;
  initialChildren?: number;
}

const PERSON_COUNT_MODAL_HEIGHT = 0.5; // 50% of screen
const screenHeight = Dimensions.get("window").height;

export default function PersonCountModal({
  visible,
  onClose,
  onConfirm,
  initialAdults = 1,
  initialChildren = 0,
}: PersonCountModalProps) {
  const [adults, setAdults] = useState(initialAdults);
  const [children, setChildren] = useState(initialChildren);

  // Modal animation
  const slideAnim = useRef(new Animated.Value(0)).current;

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

  const handleConfirm = () => {
    onConfirm(adults, children);
  };

  const getTotalCount = () => adults + children;

  const modalTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight * PERSON_COUNT_MODAL_HEIGHT, 0],
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
            <TouchableOpacity
              style={styles.backButton}
              onPress={onClose}
            >
              <Ionicons name="arrow-back" size={24} color="#008080" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.modalTitle}>Number of Travelers</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            Select the number of adults and children for your trip
          </Text>
        </View>

        <View style={styles.content}>
          {/* Adults Section */}
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

          {/* Summary */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryContent}>
              <Ionicons name="people" size={24} color="#008080" />
              <View style={styles.summaryTextContainer}>
                <Text style={styles.summaryTitle}>Total Travelers</Text>
                <Text style={styles.summarySubtitle}>
                  {adults} adult{adults > 1 ? "s" : ""}
                  {children > 0 &&
                    `, ${children} child${children > 1 ? "ren" : ""}`}
                </Text>
              </View>
              <Text style={styles.totalCount}>{getTotalCount()}</Text>
            </View>
          </View>
        </View>

        {/* Confirm Button */}
        <View style={styles.buttonContainer}>
          <LongButton
            label={`Continue with ${getTotalCount()} traveler${
              getTotalCount() > 1 ? "s" : ""
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
  summarySubtitle: {
    fontSize: 14,
    color: "#374151",
  },
  totalCount: {
    fontSize: 24,
    fontWeight: "700",
    color: "#008080",
  },
  buttonContainer: {
    paddingTop: 20,
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
