// components/transitions/ScrollReveal.tsx (optional)
import React, { useRef, useEffect, useState } from 'react';
import { Animated, View, ViewStyle, LayoutRectangle } from 'react-native';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

const ScrollReveal: React.FC<Props> = ({ children, style }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const [visible, setVisible] = useState(false);

  const onLayout = (event: any) => {
    const layout: LayoutRectangle = event.nativeEvent.layout;
    if (layout.y < 700) { // screen height threshold
      setVisible(true);
    }
  };

  useEffect(() => {
    if (visible) {
      Animated.timing(anim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Animated.View
      style={[style, { opacity: anim }]}
      onLayout={onLayout}
    >
      {children}
    </Animated.View>
  );
};

export default ScrollReveal;
