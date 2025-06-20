import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Icon from "react-native-vector-icons/Ionicons"; // You can change to Feather if needed
import { theme } from "../app/theme"; 

const screenHeight = Dimensions.get("window").height;

const EmptyState = ({ selectedFilter }) => {
  return (
    <View style={styles.container}>
      <Icon
        name="airplane-outline" // or "map-outline"
        size={64}
        color={theme.colors.primary} // use primary from theme
        style={styles.icon}
      />
      <Text style={styles.title}>No trips found</Text>
      <Text style={styles.subtitle}>
        {selectedFilter === "All"
          ? "Start planning your first adventure!"
          : `No ${selectedFilter.toLowerCase()} trips yet.`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: screenHeight * 0.5,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    backgroundColor: "#f9fafb",
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
  },
});

export default EmptyState;