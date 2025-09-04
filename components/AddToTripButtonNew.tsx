import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Service, ServiceDetail } from "../types/serviceTypes";
import AddToTripFlow from "./AddToTripFlow";

interface AddToTripButtonProps {
  service: Service;
  serviceDetail?: ServiceDetail;
  onTripAdded?: () => void;
  style?: ViewStyle;
  buttonText?: string;
}

const AddToTripButton: React.FC<AddToTripButtonProps> = ({
  service,
  serviceDetail,
  onTripAdded,
  style,
  buttonText = "Add to Trip",
}) => {
  const [showAddToTripFlow, setShowAddToTripFlow] = useState(false);

  const handleAddToTripPress = () => {
    setShowAddToTripFlow(true);
  };

  const handleTripAdded = () => {
    setShowAddToTripFlow(false);
    onTripAdded?.();
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.addToTripButton, style]}
        onPress={handleAddToTripPress}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.addToTripButtonText}>{buttonText}</Text>
      </TouchableOpacity>

      <AddToTripFlow
        visible={showAddToTripFlow}
        onClose={() => setShowAddToTripFlow(false)}
        service={service}
        serviceDetail={serviceDetail}
        onTripAdded={handleTripAdded}
      />
    </>
  );
};

const styles = StyleSheet.create({
  addToTripButton: {
    backgroundColor: "#008080",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginVertical: 8,
  },
  addToTripButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default AddToTripButton;
