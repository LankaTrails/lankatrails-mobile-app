import React, { useState } from "react";
import {
  TouchableWithoutFeedback,
  Animated,
  StyleSheet,
  Text,
} from "react-native";

export default function LongButton({ label = "", onPress }) {
  const [scaleValue] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Animated.View
        style={[
          styles.LongButton,
          {
            transform: [{ scale: scaleValue }],
          },
        ]}
      >
        {label ? (
          <Text style={styles.text}>{label}</Text>
        ) : (
            <Text style={styles.text}>...</Text>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  LongButton: {
    backgroundColor: "#008080",
    borderRadius: 26,
    height: 48,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});