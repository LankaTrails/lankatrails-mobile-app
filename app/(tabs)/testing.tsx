import React, { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';

interface FadeInViewProps {
    style?: object;
    children?: React.ReactNode;
}

const FadeInView: React.FC<FadeInViewProps> = (props) => {
    const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value for opacity: 0

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    return (
        <Animated.View // Special animatable View
            style={{
                ...props.style,
                opacity: fadeAnim, // Bind opacity to animated value
            }}>
            {props.children}
        </Animated.View>
    );
};

// You can then use your `FadeInView` in place of a `View` in your components:
export default () => {
    return (
        <View
            style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
            }}>
            <FadeInView
                >
               <Text className="text-6xl font-bold">
        <Text className="text-primary">Lanka</Text>
        <Text className="text-secondary">Trails</Text>
      </Text>
            </FadeInView>
        </View>
    );
};