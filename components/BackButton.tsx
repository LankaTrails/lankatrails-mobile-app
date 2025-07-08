import React, { useState } from "react";
import { TouchableWithoutFeedback, Animated, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { theme } from "../app/theme";

export default function BackButton() {
  const [scaleValue] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleBackToDays = () => {
    router.back();
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handleBackToDays}
    >
      <Animated.View style={[styles.backButton, { transform: [{ scale: scaleValue }] }]}>
        <Ionicons name="arrow-back" size={22} color={theme.colors.primary} />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
});