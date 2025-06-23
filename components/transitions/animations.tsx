// components/animations.tsx
import React, { useRef, useEffect } from 'react';
import { Animated, View } from 'react-native';

// Page Transition Animation
export const PageTransition = ({
  children,
  animationType = 'fadeIn',
  isVisible = true,
}: {
  children: React.ReactNode;
  animationType?: 'fadeIn' | 'slideUp' | 'scaleIn' | 'bounceIn';
  isVisible?: boolean;
}) => {
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
              useNativeDriver: true,
            }),
          ]).start();
          break;

        case 'bounceIn':
          fadeAnim.setValue(1);
          Animated.sequence([
            Animated.spring(scaleAnim, {
              toValue: 1.1,
              useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
              toValue: 1,
              useNativeDriver: true,
            }),
          ]).start();
          break;
      }
    }
  }, [isVisible, animationType]);

  const getAnimatedStyle = () => {
    switch (animationType) {
      case 'fadeIn': return { opacity: fadeAnim };
      case 'slideUp': return { opacity: fadeAnim, transform: [{ translateY: slideAnim }] };
      case 'scaleIn': return { opacity: fadeAnim, transform: [{ scale: scaleAnim }] };
      case 'bounceIn': return { opacity: fadeAnim, transform: [{ scale: scaleAnim }] };
      default: return { opacity: fadeAnim };
    }
  };

  return <Animated.View style={[{ flex: 1 }, getAnimatedStyle()]}>{children}</Animated.View>;
};

// Staggered List Item Animation
export const StaggeredListItem = ({
  children,
  delay = 0,
  index = 0,
}: {
  children: React.ReactNode;
  delay?: number;
  index?: number;
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    const animationDelay = delay + (index * 100);
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
        }),
      ]).start();
    }, animationDelay);
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      {children}
    </Animated.View>
  );
};

// Loading Skeleton Animation
export const LoadingSkeleton = () => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
      ]).start(() => pulse());
    };
    pulse();
  }, []);

  return (
    <View className="px-4 py-4">
      <Animated.View style={{ opacity: pulseAnim }} className="bg-gray-200 h-12 rounded-full mb-4" />
      <Animated.View style={{ opacity: pulseAnim }} className="bg-gray-200 h-16 rounded-lg mb-4" />
      {[1, 2, 3].map((item) => (
        <Animated.View
          key={item}
          style={{ opacity: pulseAnim }}
          className="bg-gray-200 h-12 rounded-lg mb-3"
        />
      ))}
    </View>
  );
};
