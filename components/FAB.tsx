import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Animated, StyleSheet, TouchableOpacity } from "react-native";
import { theme } from "../app/theme";

interface FABProps {
  onPress: () => void;
}

const FAB = ({ onPress }: FABProps) => {
  const [scaleValue] = useState(new Animated.Value(1));
  const handlePressIn = () =>
    Animated.spring(scaleValue, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  const handlePressOut = () =>
    Animated.spring(scaleValue, { toValue: 1, useNativeDriver: true }).start();

  return (
    <TouchableOpacity
      style={styles.fabContainer}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[styles.fab, { transform: [{ scale: scaleValue }] }]}
      >
        <Ionicons name="add" size={28} color="white" />
      </Animated.View>
    </TouchableOpacity>
  );
};

export const styles = StyleSheet.create({
  fabContainer: {
    position: "absolute",
    bottom: 130,
    right: 20,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
export default FAB;
