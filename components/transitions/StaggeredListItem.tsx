import React, { useEffect } from 'react';
import { Animated, useAnimatedValue } from 'react-native';

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
  const fadeAnim = useAnimatedValue(0);
  const slideAnim = useAnimatedValue(30);

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
