import React from "react";
import { View, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { ServiceType } from "@/types/commonTypes";

interface TripMapMarkerProps {
  type: "start_location" | "trip_item";
  itemType?: "PLACE" | "SERVICE";
  serviceCategory?: ServiceType;
  isSelected?: boolean;
  size?: number;
}

const TripMapMarker: React.FC<TripMapMarkerProps> = ({
  type,
  itemType,
  serviceCategory,
  isSelected = false,
  size = 40,
}) => {
  // Define colors for different service categories and types
  const getMarkerColor = (): string => {
    if (type === "start_location") {
      return "#10B981"; // Green for start location
    }

    if (itemType === "PLACE") {
      return "#6366F1"; // Purple for places
    }

    // Colors for different service categories
    switch (serviceCategory) {
      case "ACCOMMODATION":
        return "#EF4444"; // Red
      case "ACTIVITY":
        return "#F59E0B"; // Orange
      case "TOUR_GUIDE":
        return "#8B5CF6"; // Purple
      case "TRANSPORT":
        return "#3B82F6"; // Blue
      case "FOOD_BEVERAGE":
        return "#EC4899"; // Pink
      default:
        return "#6B7280"; // Gray
    }
  };

  // Get appropriate icon for marker type
  const getMarkerIcon = (): string => {
    if (type === "start_location") {
      return "flag";
    }

    if (itemType === "PLACE") {
      return "location";
    }

    switch (serviceCategory) {
      case "ACCOMMODATION":
        return "bed";
      case "ACTIVITY":
        return "flash";
      case "TOUR_GUIDE":
        return "person";
      case "TRANSPORT":
        return "car";
      case "FOOD_BEVERAGE":
        return "restaurant";
      default:
        return "pin";
    }
  };

  const markerColor = getMarkerColor();
  const iconName = getMarkerIcon();

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: markerColor,
        },
        isSelected && styles.selected,
      ]}
    >
      <Icon name={iconName} size={size * 0.5} color="white" />
      {type === "start_location" && (
        <View
          style={[
            styles.pulse,
            {
              width: size * 1.5,
              height: size * 1.5,
              borderRadius: size * 0.75,
              borderColor: markerColor,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  selected: {
    borderWidth: 4,
    borderColor: "#FFD700",
    transform: [{ scale: 1.2 }],
  },
  pulse: {
    position: "absolute",
    borderWidth: 2,
    opacity: 0.3,
  },
});

export default TripMapMarker;
