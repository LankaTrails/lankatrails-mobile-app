import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle, StyleProp } from 'react-native';

interface Props {
  style?: StyleProp<ViewStyle>;
  duration?: number;
  children: React.ReactNode;
  delay?: number;
}

const FadeInView: React.FC<Props> = ({ style, children, duration = 800, delay = 400 }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[style, { opacity: fadeAnim }]}>
      {children}
    </Animated.View>
  );
};

export default FadeInView;
