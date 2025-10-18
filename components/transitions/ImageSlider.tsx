import React, { useState, useRef, useEffect } from 'react';
import {
  ScrollView,
  Image,
  Dimensions,
  View,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Text,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface ImageSliderProps {
  images: string[];
  autoSlide?: boolean;
  slideInterval?: number;
  showCounter?: boolean;
  showArrows?: boolean;
  borderRadius?: number;
  height?: number;
}

const ImageSlider: React.FC<ImageSliderProps> = ({
  images,
  autoSlide = true,
  slideInterval = 4000,
  showCounter = true,
  showArrows = true,
  borderRadius = 15,
  height: customHeight = height * 0.35,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Auto-slide functionality
  useEffect(() => {
    if (!autoSlide) return;

    const interval = setInterval(() => {
      fadeAnim.setValue(0.8);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      let nextIndex = activeIndex + 1;
      if (nextIndex >= images.length) {
        nextIndex = 0;
      }
      
      scrollRef.current?.scrollTo({ 
        x: nextIndex * width, 
        animated: true 
      });
      setActiveIndex(nextIndex);
    }, slideInterval);

    return () => clearInterval(interval);
  }, [activeIndex, images.length, autoSlide, slideInterval, fadeAnim]);

  const handleMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(newIndex);
  };

  const goToSlide = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
    setActiveIndex(index);
  };

  const goToPrevious = () => {
    const prevIndex = activeIndex === 0 ? images.length - 1 : activeIndex - 1;
    goToSlide(prevIndex);
  };

  const goToNext = () => {
    const nextIndex = activeIndex === images.length - 1 ? 0 : activeIndex + 1;
    goToSlide(nextIndex);
  };

  return (
    <View style={[styles.container, { borderRadius }]}>
      {/* Main Image Container */}
      <Animated.View 
        style={[
          styles.imageContainer, 
          { 
            opacity: fadeAnim,
            height: customHeight,
            borderRadius 
          }
        ]}
      >
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          decelerationRate="fast"
          scrollEventThrottle={16}
        >
          {images.map((img, idx) => (
            <View key={idx} style={styles.imageWrapper}>
              <Image
                source={{ uri: img }}
                style={[
                  styles.image, 
                  { 
                    height: customHeight,
                    borderRadius: idx === 0 ? borderRadius : 0
                  }
                ]}
                resizeMode="cover"
              />
              {/* Gradient Overlay */}
              <View style={styles.gradientOverlay} />
            </View>
          ))}
        </ScrollView>

        {/* Navigation Arrows */}
        {showArrows && images.length > 1 && (
          <>
            <TouchableOpacity 
              style={[styles.arrow, styles.leftArrow]} 
              onPress={goToPrevious}
              activeOpacity={0.7}
            >
              <Text style={styles.arrowText}>‹</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.arrow, styles.rightArrow]} 
              onPress={goToNext}
              activeOpacity={0.7}
            >
              <Text style={styles.arrowText}>›</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Counter */}
        {showCounter && images.length > 1 && (
          <View style={styles.counter}>
            <Text style={styles.counterText}>
              {activeIndex + 1} / {images.length}
            </Text>
          </View>
        )}
      </Animated.View>

      {/* Enhanced Dots Indicator */}
      {images.length > 1 && (
        <View style={styles.dotsContainer}>
          {images.map((_, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.dot,
                activeIndex === idx && styles.activeDot,
              ]}
              onPress={() => goToSlide(idx)}
              activeOpacity={0.7}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    backgroundColor: '#fff',
  },
  imageContainer: {
    position: 'relative',
    overflow: 'hidden',
    
  },
  imageWrapper: {
    position: 'relative',
    width: width,
  },
  image: {
    width: width,
    backgroundColor: '#f5f5f5',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  arrow: {
    position: 'absolute',
    top: '50%',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -22.5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  leftArrow: {
    left: 15,
  },
  rightArrow: {
    right: 15,
  },
  arrowText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: -2,
  },
  counter: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  counterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  dot: {
    height: 10,
    width: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  activeDot: {
    backgroundColor: '#007AFF',
    width: 24,
    borderRadius: 12,
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
});

export default ImageSlider;