import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ImageBackground,
  StatusBar,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import InputField from '../../components/InputField';
import { BlurView } from "expo-blur";
import LongButton from '../../components/LongButton';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

const { width, height } = Dimensions.get('window');

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const blurFadeAnim = useRef(new Animated.Value(0)).current;

  const { signIn, isLoading, error, clearError, isAuthenticated } = useAuth();

  useEffect(() => {
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

  useEffect(() => {
    if (error) {
      Alert.alert('Login Failed', error);
      clearError();
    }
  }, [error]);

  useEffect(() => {
  console.log('Login Screen Auth State:', { isAuthenticated, isLoading, error });
  if (isAuthenticated) {
    router.replace('/(tabs)/home');
  }
}, [isAuthenticated]);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    await signIn(email, password);
  };

  const handleSocialSignIn = (provider: string) => {
    Alert.alert('Coming Soon', `${provider} login will be available soon`);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80'
        }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.gradientOverlay} />
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <Animated.View
              style={[
                styles.header,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Text style={styles.welcomeText}>Step in!</Text>
              <Text style={styles.subtitle}>
                Welcome to <Text style={styles.brandText}>LankaTrails</Text>
              </Text>
              <Text style={styles.tagline}>Start Your Journey!</Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.formContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Animated.View style={{ ...StyleSheet.absoluteFillObject, opacity: blurFadeAnim }}>
                <BlurView intensity={15} tint="light" style={StyleSheet.absoluteFill} />
              </Animated.View>
              
              <InputField
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChange={setEmail}
                icon="mail"
                keyboardType="email-address"
              />

              <InputField
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={setPassword}
                secureTextEntry={!showPassword}
                icon="key"
                // rightIcon={showPassword ? 'eye-off' : 'eye'}
                // onRightIconPress={() => setShowPassword(!showPassword)}
              />

              <TouchableOpacity 
                style={styles.forgotPassword}
                // onPress={() => router.push('/forgot-password')}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <LongButton 
                label={isLoading ? 'Signing In...' : 'Sign In'} 
                onPress={handleSignIn}
              />
              
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or sign in with</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialContainer}>
                {['Google', 'Facebook', 'Apple'].map((provider) => (
                  <TouchableOpacity
                    key={provider}
                    style={styles.socialButton}
                    onPress={() => handleSocialSignIn(provider)}
                  >
                    <Text style={styles.socialButtonText}>
                      {provider === 'Google' ? 'G' : 
                       provider === 'Facebook' ? 'f' : '🍎'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.replace('/signUp')}>
                  <Text style={styles.signUpLink}>Sign Up</Text>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingTop: StatusBar.currentHeight || 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
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
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontWeight: '400',
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 14,
  },
  forgotPasswordText: {
    color: '#008080',
    fontSize: 14,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.39)',
  },
  dividerText: {
    color: 'rgba(0, 0, 0, 0.39)',
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: 16,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 32,
  },
  socialButton: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(115, 115, 115, 0)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#008080',
  },
  socialButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#008080',
  },
  signUpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpText: {
    color: 'rgba(0, 0, 0, 0.39)',
    fontSize: 16,
    fontWeight: '500',
  },
  signUpLink: {
    color: '#008080',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default SignIn;