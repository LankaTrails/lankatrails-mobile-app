// components/ImageSlider.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Animated,
  useWindowDimensions,
} from 'react-native';

const ImageSlider = ({ images }) => {
  const scrollX = React.useRef(new Animated.Value(0)).current;
  const { width: windowWidth } = useWindowDimensions();

  return (
    <View style={styles.scrollContainer}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {images.map((image, index) => (
          <View style={{ width: windowWidth, height: 200 }} key={index}>
            <ImageBackground source={{ uri: image }} style={styles.card}>
              <View style={styles.overlay}>
                <Text style={styles.imageLabel}>{'Image ' + (index + 1)}</Text>
              </View>
            </ImageBackground>
          </View>
        ))}
      </ScrollView>

      <View style={styles.indicatorContainer}>
        {images.map((_, index) => {
          const width = scrollX.interpolate({
            inputRange: [
              windowWidth * (index - 1),
              windowWidth * index,
              windowWidth * (index + 1),
            ],
            outputRange: [8, 16, 8],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[styles.normalDot, { width }]}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    marginBottom: 10,
  },
  card: {
    flex: 1,
    marginHorizontal: 10,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
  },
  imageLabel: {
    color: '#fff',
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
    justifyContent: 'center',
    marginTop: 8,
  },
});

export default ImageSlider;
