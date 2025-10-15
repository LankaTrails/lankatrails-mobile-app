import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";

interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
}

const useAnimatedValue = (initialValue = 0) => {
  return useRef(new Animated.Value(initialValue)).current;
};

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  delay = 0,
}) => {
  const cardFade = useAnimatedValue(0);
  const cardSlide = useAnimatedValue(20);

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(cardFade, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(cardSlide, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Animated.View
      style={{
        opacity: cardFade,
        transform: [{ translateY: cardSlide }],
      }}
    >
      {children}
    </Animated.View>
  );
};

export default AnimatedCard;
