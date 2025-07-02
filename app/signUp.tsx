import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ImageBackground,
  StatusBar,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import InputField from '../components/InputField';
import LongButton from '../components/LongButton';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const SignUp = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const blurFadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(blurFadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  interface SignUpForm {
    email: string;
    password: string;
    confirmPassword: string;
  }

  type FormKey = keyof SignUpForm;

  const handleChange = (key: FormKey, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleSignUp = () => {
    const { email, password, confirmPassword } = form;
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    // Mock success
    Alert.alert('Success', 'Account created!');
    router.replace('/(tabs)/home');
  };
  

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ImageBackground
        source={require('../assets/images/login.jpeg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.gradientOverlay} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Animated.View
              style={[styles.formContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
            >
              
              
              <Animated.View style={{ ...StyleSheet.absoluteFillObject, opacity: blurFadeAnim }}>
                <BlurView intensity={15} tint="light" style={StyleSheet.absoluteFill} />
              </Animated.View>

              <Text style={styles.header}>Create Account</Text>
              <InputField
                label="Email"
                placeholder="Enter your email"
                value={form.email}
                onChange={(text) => handleChange('email', text)}
                icon="mail"
              />
              <InputField
                label="Password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(text) => handleChange('password', text)}
                icon="key"
                secureTextEntry
              />
              <InputField
                label="Confirm Password"
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={(text) => handleChange('confirmPassword', text)}
                icon="key"
                secureTextEntry
              />

              <LongButton label="Sign Up" onPress={handleSignUp} />

              <View style={styles.signInContainer}>
                <Text style={styles.signInText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.replace('/signIn')}>
                  <Text style={styles.signInLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  keyboardAvoid: {
    flex: 1,
  },
   welcomeText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  brandText: {
    color: '#008080',
    fontWeight: '700',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingTop: StatusBar.currentHeight || 40,
  },
  formContainer: {
    backgroundColor: 'rgba(247, 247, 247, 0.84)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#008080',
    textAlign: 'center',
    marginBottom: 20,
  },
  signInContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  signInText: {
    color: 'rgba(0, 0, 0, 0.39)',
    fontSize: 16,
    fontWeight: '500',
  },
  signInLink: {
    color: '#008080',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default SignUp;