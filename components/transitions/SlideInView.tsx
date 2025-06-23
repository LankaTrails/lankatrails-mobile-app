import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle, StyleProp } from 'react-native';

interface Props {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'bottom' | 'top';
  duration?: number;
  delay?: number;
}

const SlideInView: React.FC<Props> = ({ style, children, direction = 'bottom', duration = 800, delay = 0 }) => {
  const slideAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration,
      delay,
      useNativeDriver: true,
    }).start();
  }, []);

  const translateStyle =
    direction === 'left'
      ? { transform: [{ translateX: slideAnim }] }
      : direction === 'right'
      ? { transform: [{ translateX: slideAnim.interpolate({ inputRange: [0, 100], outputRange: [0, -100] }) }] }
      : direction === 'top'
      ? { transform: [{ translateY: slideAnim.interpolate({ inputRange: [0, 100], outputRange: [0, -100] }) }] }
      : { transform: [{ translateY: slideAnim }] };

  return (
    <Animated.View style={[style, translateStyle]}>
      {children}
    </Animated.View>
  );
};

export default SlideInView;
