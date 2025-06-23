import React, { useState } from "react";
import {
  TouchableWithoutFeedback,
  Animated,
  StyleSheet,
  Text,
} from "react-native";
import { router } from "expo-router";
import { theme } from "../app/theme";
import { Ionicons } from "@expo/vector-icons";

export default function ChatButton() {
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
    alert("Route -> Chat Box!"); // Replace with `router.push('/chat')` if you have a chat screen
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handleBackToDays}
    >
      <Animated.View
        style={[
          styles.chatButton,
          {
            transform: [{ scale: scaleValue }],
          },
        ]}
      >
        <Ionicons name="chatbubble-ellipses-outline" size={25} color={theme.colors.primary} />
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({ 
chatButton: {
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