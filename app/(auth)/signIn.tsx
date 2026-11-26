import { useAuth } from "@/hooks/useAuth";
import { BlurView } from "expo-blur";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import InputField from "../../components/InputField";
import LongButton from "../../components/LongButton";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { redirect } = useLocalSearchParams(); // Get redirect parameter

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
      Alert.alert("Login Failed", error);
      clearError();
    }
  }, [error]);

  useEffect(() => {
    if (isAuthenticated) {
      // If there's a redirect parameter (e.g. a trip invite), go there; otherwise go home
      if (redirect && typeof redirect === "string" && redirect.startsWith("/")) {
        router.replace(redirect as never);
      } else {
        router.replace("/(tabs)/home" as any);
      }
    }
  }, [isAuthenticated, redirect]);

  const handleSignIn = async () => {
    if (isLoading) return;
    if (!email.trim() || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }
    await signIn(email, password);
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <ImageBackground
        source={require("../../assets/images/login.jpeg")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.gradientOverlay} />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
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
                Welcome to{" "}
                <Text style={styles.brandText}>
                  Lanka<Text style={{ color: "#ff6600" }}>Trails</Text>
                </Text>
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
              <Animated.View
                style={{
                  ...StyleSheet.absoluteFillObject,
                  opacity: blurFadeAnim,
                }}
              >
                <BlurView
                  intensity={15}
                  tint="light"
                  style={StyleSheet.absoluteFill}
                />
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
                secureTextEntry
                icon="key"
              />

              <View style={styles.buttonSpacer} />
              <LongButton
                label={isLoading ? "Signing In..." : "Sign In"}
                onPress={handleSignIn}
              />

              <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>
                  Don&#39;t have an account?{" "}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    // If there's a redirect parameter, pass it to sign-up; otherwise just go to sign-up
                    if (redirect && typeof redirect === "string") {
                      router.replace({
                        pathname: "/(auth)/signUp" as any,
                        params: { redirect },
                      });
                    } else {
                      router.replace("/(auth)/signUp" as any);
                    }
                  }}
                >
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
    width: "100%",
    height: "100%",
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingTop: StatusBar.currentHeight || 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 4,
  },
  brandText: {
    color: "#008080",
    fontWeight: "700",
  },
  tagline: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    fontWeight: "400",
  },
  formContainer: {
    backgroundColor: "rgba(247, 247, 247, 0.84)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    overflow: "hidden",
  },
  buttonSpacer: {
    height: 14,
  },
  signUpContainer: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  signUpText: {
    color: "rgba(0, 0, 0, 0.39)",
    fontSize: 16,
    fontWeight: "500",
  },
  signUpLink: {
    color: "#008080",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default SignIn;
