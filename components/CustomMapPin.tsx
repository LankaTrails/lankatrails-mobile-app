import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import { Path, Svg } from "react-native-svg";

interface CustomMapPinProps {
  size?: number;
  color?: string;
  selected?: boolean;
}

const CustomMapPin: React.FC<CustomMapPinProps> = ({
  size = 40,
  color = "#ff6600",
  selected = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entry animation - bounce in
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous subtle bounce animation
    const bounceAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -5,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    bounceAnimation.start();

    return () => {
      bounceAnimation.stop();
    };
  }, []);

  useEffect(() => {
    // Scale animation when selected
    Animated.timing(scaleAnim, {
      toValue: selected ? 1.15 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [selected]);

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }, { translateY: bounceAnim }],
        }}
      >
        <Svg viewBox="0 0 24 50" width={size} height={size * 1.2}>
          <Path
            fill={color}
            d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0zm0 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12z"
          />
        </Svg>
      </Animated.View>
    </View>
  );
};

export default CustomMapPin;
