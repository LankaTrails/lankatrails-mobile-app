import { signUp } from "@/services/userService";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
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
import InputField from "@/components/InputField";
import LongButton from "@/components/LongButton";
import CountryDropdown from "@/components/CountryDropdown";

const { width, height } = Dimensions.get("window");

const SignUp = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    country: "",
  });

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    country: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    firstName: string;
    lastName: string;
    country: string;
  }

  type FormKey = keyof SignUpForm;

  const handleChange = (key: FormKey, value: string) => {
    setForm({ ...form, [key]: value });
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors({ ...errors, [key]: "" });
    }
  };

  const validateStep1 = () => {
    const newErrors = { ...errors };
    let hasErrors = false;

    if (!form.firstName.trim()) {
      newErrors.firstName = "First name is required";
      hasErrors = true;
    }

    if (!form.lastName.trim()) {
      newErrors.lastName = "Last name is required";
      hasErrors = true;
    }

    if (!form.country.trim()) {
      newErrors.country = "Country is required";
      hasErrors = true;
    }

    setErrors(newErrors);
    return !hasErrors;
  };

  const validateStep2 = () => {
    const newErrors = { ...errors };
    let hasErrors = false;

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
      hasErrors = true;
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Please enter a valid email";
      hasErrors = true;
    }

    if (!form.password) {
      newErrors.password = "Password is required";
      hasErrors = true;
    } else {
      const passwordErrors = [];

      if (form.password.length < 8) {
        passwordErrors.push("at least 8 characters");
      }
      if (!/[A-Z]/.test(form.password)) {
        passwordErrors.push("one uppercase letter");
      }
      if (!/[0-9]/.test(form.password)) {
        passwordErrors.push("one number");
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) {
        passwordErrors.push("one special character");
      }

      if (passwordErrors.length > 0) {
        newErrors.password = `Password must contain ${passwordErrors.join(
          ", "
        )}`;
        hasErrors = true;
      }
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      hasErrors = true;
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      hasErrors = true;
    }

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSignUp = async () => {
    if (!validateStep2()) {
      return;
    }

    try {
      setIsLoading(true);

      const response = await signUp(
        form.firstName,
        form.lastName,
        form.country,
        form.email,
        form.password
      );

      // Success - show success message with more details
      // alert message to say please check your email and verify your account to continue
      Alert.alert(
        "Success",
        `Welcome ${response.data.email}! Your account has been created successfully. Please check your email and verify your account to continue.`,
        [
          {
            text: "OK",
            onPress: () => router.replace("/signIn"),
          },
        ]
      );
    } catch (error: any) {
      console.error("Sign Up Error:", error);

      // Show specific error message from the service
      Alert.alert(
        "Sign Up Failed",
        error.message || "An unexpected error occurred. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const ErrorMessage = ({ error }: { error: string }) => {
    if (!error) return null;
    return <Text style={styles.errorText}>{error}</Text>;
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
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Animated.View
              style={[
                styles.formContainer,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
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

              {/* Back button at the top */}
              {currentStep === 2 && (
                <TouchableOpacity
                  style={styles.topBackButton}
                  onPress={handleBack}
                >
                  <Ionicons name="arrow-back" size={24} color="#008080" />
                </TouchableOpacity>
              )}

              <Text style={styles.header}>
                {currentStep === 1 ? "Personal Information" : "Account Details"}
              </Text>

              {/* Step indicator */}
              <View style={styles.stepIndicator}>
                <View
                  style={[
                    styles.stepDot,
                    currentStep === 1 && styles.activeStep,
                  ]}
                />
                <View style={styles.stepLine} />
                <View
                  style={[
                    styles.stepDot,
                    currentStep === 2 && styles.activeStep,
                  ]}
                />
              </View>

              {currentStep === 1 ? (
                <>
                  {/* Step 1: Name and Country */}
                  <View style={styles.inputWrapper}>
                    <InputField
                      label="First Name"
                      placeholder="Enter your first name"
                      value={form.firstName}
                      onChange={(text) => handleChange("firstName", text)}
                      icon="person"
                    />
                    <ErrorMessage error={errors.firstName} />
                  </View>

                  <View style={styles.inputWrapper}>
                    <InputField
                      label="Last Name"
                      placeholder="Enter your last name"
                      value={form.lastName}
                      onChange={(text) => handleChange("lastName", text)}
                      icon="person"
                    />
                    <ErrorMessage error={errors.lastName} />
                  </View>

                  <View style={styles.inputWrapper}>
                    <CountryDropdown
                      label="Country"
                      placeholder="Select your country"
                      value={form.country}
                      onChange={(text) => handleChange("country", text)}
                      icon="earth"
                    />
                    <ErrorMessage error={errors.country} />
                  </View>

                  <LongButton label="Next" onPress={handleNext} />
                </>
              ) : (
                <>
                  {/* Step 2: Email and Password */}
                  <View style={styles.inputWrapper}>
                    <InputField
                      label="Email"
                      placeholder="Enter your email"
                      value={form.email}
                      onChange={(text) => handleChange("email", text)}
                      icon="mail"
                    />
                    <ErrorMessage error={errors.email} />
                  </View>

                  <View style={styles.inputWrapper}>
                    <View style={styles.passwordContainer}>
                      <InputField
                        label="Password"
                        placeholder="Enter your password"
                        value={form.password}
                        onChange={(text) => handleChange("password", text)}
                        icon="key"
                        secureTextEntry={!showPassword}
                      />
                      <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        <Ionicons
                          name={showPassword ? "eye-off" : "eye"}
                          size={20}
                          color="#757575"
                        />
                      </TouchableOpacity>
                    </View>
                    <ErrorMessage error={errors.password} />
                  </View>

                  <View style={styles.inputWrapper}>
                    <View style={styles.passwordContainer}>
                      <InputField
                        label="Confirm Password"
                        placeholder="Re-enter password"
                        value={form.confirmPassword}
                        onChange={(text) =>
                          handleChange("confirmPassword", text)
                        }
                        icon="key"
                        secureTextEntry={!showConfirmPassword}
                      />
                      <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        <Ionicons
                          name={showConfirmPassword ? "eye-off" : "eye"}
                          size={20}
                          color="#757575"
                        />
                      </TouchableOpacity>
                    </View>
                    <ErrorMessage error={errors.confirmPassword} />
                  </View>

                  <LongButton
                    label={isLoading ? "Signing Up..." : "Sign Up"}
                    onPress={handleSignUp}
                  />
                </>
              )}

              {
                <View style={styles.signInContainer}>
                  <Text style={styles.signInText}>
                    Already have an account?{" "}
                  </Text>
                  <TouchableOpacity onPress={() => router.replace("/signIn")}>
                    <Text style={styles.signInLink}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              }
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingTop: StatusBar.currentHeight || 40,
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
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#008080",
    textAlign: "center",
    marginBottom: 20,
  },
  signInContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    // marginTop: 10,
    marginBottom: 10,
  },
  signInText: {
    color: "rgba(0, 0, 0, 0.39)",
    fontSize: 16,
    fontWeight: "500",
  },
  signInLink: {
    color: "#008080",
    fontSize: 16,
    fontWeight: "700",
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(0, 128, 128, 0.3)",
  },
  activeStep: {
    backgroundColor: "#008080",
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: "rgba(0, 128, 128, 0.3)",
    marginHorizontal: 10,
  },
  topBackButton: {
    position: "absolute",
    top: 15,
    left: 15,
    zIndex: 10,
    // backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // elevation: 3,
  },
  passwordContainer: {
    position: "relative",
    // marginBottom: 16,
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
    top: 30,
    zIndex: 1,
    padding: 5,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 12,
    marginTop: -8,
    marginLeft: 10,
    fontWeight: "500",
  },
});

export default SignUp;
