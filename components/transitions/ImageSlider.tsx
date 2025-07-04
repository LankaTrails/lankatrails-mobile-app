import React, { useState, useRef, useEffect } from 'react';
import {
  ScrollView,
  Image,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';

const { width } = Dimensions.get('window');

interface ImageSliderProps {
  images: string[];
}

const ImageSlider: React.FC<ImageSliderProps> = ({ images }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      let nextIndex = activeIndex + 1;
      if (nextIndex >= images.length) {
        nextIndex = 0;
        scrollRef.current?.scrollTo({ x: 0, animated: false });
      } else {
        scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
      }
      setActiveIndex(nextIndex);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [activeIndex, images.length]);

  const handleMomentumScrollEnd = (e: any) => {
    let newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    if (newIndex >= images.length) {
      newIndex = 0;
      scrollRef.current?.scrollTo({ x: 0, animated: false });
    }
    setActiveIndex(newIndex);
  };

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      onMomentumScrollEnd={handleMomentumScrollEnd}
    >
      {images.map((img, idx) => (
        <Image
          key={idx}
          source={{ uri: img }}
          style={{
            width: width - 30, // Adjust width to fit the screen with some margin
            height: 200,
            borderRadius: 30,
            marginBottom: 20,
            marginRight: 10,
          }}
          resizeMode="cover"
        />
      ))}
    </ScrollView>
  );
};

export default ImageSlider;
