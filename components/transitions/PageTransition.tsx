import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

type PageTransitionProps = {
  children: React.ReactNode;
  animationType?: 'fadeIn' | 'slideUp' | 'scaleIn' | 'bounceIn';
  isVisible?: boolean;
};

const PageTransition = ({
  children,
  animationType = 'fadeIn',
  isVisible = true,
}: PageTransitionProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (isVisible) {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      scaleAnim.setValue(0.9);

      switch (animationType) {
        case 'fadeIn':
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }).start();
          break;
        case 'slideUp':
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
              toValue: 0,
              tension: 100,
              friction: 8,
              useNativeDriver: true,
            }),
          ]).start();
          break;
        case 'scaleIn':
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
              toValue: 1,
              tension: 150,
              friction: 6,
              useNativeDriver: true,
            }),
          ]).start();
          break;
        case 'bounceIn':
          fadeAnim.setValue(1);
          Animated.sequence([
            Animated.spring(scaleAnim, {
              toValue: 1.1,
              tension: 200,
              friction: 4,
              useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
              toValue: 1,
              tension: 200,
              friction: 8,
              useNativeDriver: true,
            }),
          ]).start();
          break;
      }
    }
  }, [isVisible, animationType]);

  const animatedStyle = () => {
    switch (animationType) {
      case 'fadeIn':
        return { opacity: fadeAnim };
      case 'slideUp':
        return { opacity: fadeAnim, transform: [{ translateY: slideAnim }] };
      case 'scaleIn':
      case 'bounceIn':
        return { opacity: fadeAnim, transform: [{ scale: scaleAnim }] };
      default:
        return { opacity: fadeAnim };
    }
  };

  return (
    <Animated.View style={[{ flex: 1 }, animatedStyle()]}>
      {children}
    </Animated.View>
  );
};

export default PageTransition;
