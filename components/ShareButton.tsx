import React, { useState } from "react";
import {
  TouchableWithoutFeedback,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { theme } from "../app/theme";
import { Ionicons } from "@expo/vector-icons";

export default function ShareButton() {
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
    alert("Route -> share social links!"); // Replace with `router.push('/chat')` if you have a chat screen
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handleBackToDays}
    >
      <Animated.View
        style={[
          styles.shareButton,
          {
            transform: [{ scale: scaleValue }],
          },
        ]}
      >
        <Ionicons name="share-social-outline" size={25} color={theme.colors.primary} />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({ 
shareButton: {
  paddingHorizontal: 5,
  paddingVertical: 5,
  borderRadius: 24,
  elevation: 6,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6, // If you're using icons
},

});