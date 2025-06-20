// import React, { useEffect, useRef } from 'react';
// import { Animated, Text, View } from 'react-native';
// import Card from '@/components/Card';

// interface FadeInViewProps {
//     style?: object;
//     children?: React.ReactNode;
// }

// const FadeInView: React.FC<FadeInViewProps> = (props) => {
//     const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value for opacity: 0

//     useEffect(() => {
//         Animated.timing(fadeAnim, {
//             toValue: 1,
//             duration: 1000,
//             useNativeDriver: true,
//         }).start();
//     }, [fadeAnim]);

//     return (
//         <Animated.View // Special animatable View
//             style={{
//                 ...props.style,
//                 opacity: fadeAnim, // Bind opacity to animated value
//             }}>
//             {props.children}
//         </Animated.View>
//     );
// };

// // You can then use your `FadeInView` in place of a `View` in your components:
// export default () => {
//     return (
//         <View
//             style={{
//                 flex: 1,
//                 alignItems: 'center',
//                 justifyContent: 'center',
//             }}>
//             <FadeInView
//                 >
//                <Text className="text-6xl font-bold">
//         <Text className="text-primary">Lanka</Text>
//         <Text className="text-secondary">Trails</Text>
//       </Text>
//             </FadeInView>
//             <Card/>
//         </View>
//     );
// };

import React from 'react';
import {
  ScrollView,
  Text,
  StyleSheet,
  View,
  ImageBackground,
  Animated,
  useWindowDimensions,
  useAnimatedValue,
} from 'react-native';
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';

const images = new Array(6).fill(
  'https://images.unsplash.com/photo-1556740749-887f6717d7e4',
);

const App = () => {
  const scrollX = useAnimatedValue(0);

  const {width: windowWidth} = useWindowDimensions();

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.scrollContainer}>
          <ScrollView
            horizontal={true}
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={Animated.event([
              {
                nativeEvent: {
                  contentOffset: {
                    x: scrollX,
                  },
                },
              },
            ])}
            scrollEventThrottle={1}>
            {images.map((image, imageIndex) => {
              return (
                <View
                  style={{width: windowWidth, height: 250}}
                  key={imageIndex}>
                  <ImageBackground source={{uri: image}} style={styles.card}>
                    <View style={styles.textContainer}>
                      <Text style={styles.infoText}>
                        {'Image - ' + imageIndex}
                      </Text>
                    </View>
                  </ImageBackground>
                </View>
              );
            })}
          </ScrollView>
          <View style={styles.indicatorContainer}>
            {images.map((image, imageIndex) => {
              const width = scrollX.interpolate({
                inputRange: [
                  windowWidth * (imageIndex - 1),
                  windowWidth * imageIndex,
                  windowWidth * (imageIndex + 1),
                ],
                outputRange: [8, 16, 8],
                extrapolate: 'clamp',
              });
              return (
                <Animated.View
                  key={imageIndex}
                  style={[styles.normalDot, {width}]}
                />
              );
            })}
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContainer: {
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    flex: 1,
    marginVertical: 4,
    marginHorizontal: 16,
    borderRadius: 5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    backgroundColor: 'rgba(0,0,0, 0.7)',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 5,
  },
  infoText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  normalDot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: 'silver',
    marginHorizontal: 4,
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;