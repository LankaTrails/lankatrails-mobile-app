import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

type StaggeredListItemProps = {
  children: React.ReactNode;
  delay?: number;
  index?: number;
};

const StaggeredListItem = ({
  children,
  delay = 0,
  index = 0,
}: StaggeredListItemProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    const animationDelay = delay + index * 100;

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, animationDelay);
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      {children}
    </Animated.View>
  );
};

export default StaggeredListItem;
