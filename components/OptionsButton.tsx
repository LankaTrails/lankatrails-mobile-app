import React, { useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from "react-native-vector-icons/Ionicons";
import { router } from 'expo-router';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const OptionsButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Individual animation values for staggered effect
  const option1Anim = useRef(new Animated.Value(0)).current;
  const option2Anim = useRef(new Animated.Value(0)).current;
  const option3Anim = useRef(new Animated.Value(0)).current;
  const option4Anim = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    if (isVisible) {
      // Close animation with staggered timing
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.stagger(50, [
          Animated.timing(option4Anim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(option3Anim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(option2Anim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(option1Anim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => setIsVisible(false));
    } else {
      // Open animation with staggered timing
      setIsVisible(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.stagger(80, [
          Animated.spring(option1Anim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.spring(option2Anim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.spring(option3Anim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.spring(option4Anim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  };

  const handleOptionPress = (option) => {
    console.log(`${option} pressed`);
    toggleMenu();
    // Add your navigation logic here
    if (option === 'Budget')
      router.push('./{id}/BudgetView');
    else if (option === 'Map')
      alert("Route -> map view!");
    else if (option === 'Chat')
     router.push('./{id}/Chat');

  };

  const options = [
    { name: 'Budget', icon: 'wallet-outline', color: '#008080' },
    { name: 'Map', icon: 'map-outline', color: '#008080' },
    { name: 'Chat', icon: 'chatbubble-outline', color: '#008080' },
   
  ];

  const animationValues = [option1Anim, option2Anim, option3Anim, option4Anim];

  const getOptionStyle = (index) => {
    const animValue = animationValues[index];
    const angle = (index * 60) + 150; // Spread options in an arc
    const radius = 80;
    
    return {
      opacity: animValue,
      transform: [
        {
          scale: animValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 1],
          }),
        },
        {
          translateX: animValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, radius * Math.cos((angle * Math.PI) / 180)],
          }),
        },
        {
          translateY: animValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, radius * Math.sin((angle * Math.PI) / 180)],
          }),
        },
        {
          rotate: animValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['180deg', '0deg'],
          }),
        },
      ],
    };
  };

  return (
    <>
      {/* Main FAB Button */}
      <TouchableOpacity
        style={styles.fabButton}
        onPress={toggleMenu}
        activeOpacity={0.9}
      >
        <Animated.View
          style={[
            styles.fabIcon,
            {
              transform: [
                {
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '135deg'],
                  }),
                },
                {
                  scale: rotateAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 0.8, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <Icon name="grid" size={28} color="white" />
        </Animated.View>
      </TouchableOpacity>

      {/* Modal with Blur Overlay */}
      <Modal
        visible={isVisible}
        transparent={true}
        animationType="none"
        statusBarTranslucent={true}
      >
        <TouchableWithoutFeedback onPress={toggleMenu}>
          <View style={styles.overlay}>
            <Animated.View
              style={[
                styles.blurBackground,
                {
                  opacity: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }),
                },
              ]}
            />
            
            {/* Options Container */}
            <View style={styles.optionsContainer}>
              {options.map((option, index) => (
                <Animated.View
                  key={option.name}
                  style={[
                    styles.optionWrapper,
                    getOptionStyle(index),
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.optionButton, 
                      { 
                        backgroundColor: option.color,
                        shadowColor: option.color,
                      }
                    ]}
                    onPress={() => handleOptionPress(option.name)}
                    activeOpacity={0.8}
                  >
                    <Icon name={option.icon} size={24} color="white" />
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
            
            {/* Main FAB in overlay */}
            <View style={styles.fabInOverlay}>
              <TouchableOpacity
                style={[styles.fabButton, styles.fabInOverlayButton]}
                onPress={toggleMenu}
                activeOpacity={0.9}
              >
                <Animated.View
                  style={[
                    styles.fabIcon,
                    {
                      transform: [
                        {
                          rotate: rotateAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '135deg'],
                          }),
                        },
                        {
                          scale: rotateAnim.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: [1, 0.8, 1],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Icon name="grid" size={28} color="white" />
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  fabButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#008080',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#008080',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 12,
    marginBottom: 120,
  },
  fabIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    width: screenWidth,
    height: screenHeight,
    position: 'relative',
  },
  blurBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    backdropFilter: 'blur(9px)',
  },
  optionsContainer: {
    position: 'absolute',
    bottom: 180,
    right: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  fabInOverlay: {
    position: 'absolute',
    bottom: 30,
    right: 20,
  },
  fabInOverlayButton: {
    backgroundColor: '#008080',
    shadowColor: '#008080',
  },
});

export default OptionsButton;