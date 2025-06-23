import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle, StyleProp } from 'react-native';

interface ScaleInViewProps {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  initialScale?: number;
}

const ScaleInView: React.FC<ScaleInViewProps> = ({
  style,
  children,
  duration = 600,
  delay = 0,
  initialScale = 0.8,
}) => {
  const scaleAnim = useRef(new Animated.Value(initialScale)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

export default ScaleInView;
