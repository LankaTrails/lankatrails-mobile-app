import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

const LoadingSkeleton = () => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();
  }, []);

  return (
    <View className="px-4 py-4">
      <Animated.View
        style={{ opacity: pulseAnim }}
        className="bg-gray-200 h-12 rounded-full mb-4"
      />
      <Animated.View
        style={{ opacity: pulseAnim }}
        className="bg-gray-200 h-16 rounded-lg mb-4"
      />
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

export default LoadingSkeleton;
