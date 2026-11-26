import { useAuth } from "@/hooks/useAuth";
import { changePassword } from "@/services/userService";
import { BlurView } from "expo-blur";
import { router, useFocusEffect } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  Linking,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useAnimatedValue,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import EditPopup from "../../../components/EditPopup";
import { fileUrl } from "@/utils/config";

const getImageUrl = (profilePicUrl: string | undefined) => (profilePicUrl ? fileUrl(profilePicUrl) : null);

export default function Profile() {
  const [modalVisible, setModalVisible] = useState(false);
  const { logout, user, refreshProfile } = useAuth();
  const [fieldValues, setFieldValues] = useState<{
    Name: string;
    Email: string;
    Phone: string;
  }>({
    Name: user?.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : "",
    Email: user?.email ?? "",
    Phone: user?.phone ?? "",
  });

  // Refresh user data when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      refreshProfile();
    }, [refreshProfile])
  );

  useEffect(() => {
    setFieldValues({
      Name: user?.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : "",
      Email: user?.email ?? "",
      Phone: user?.phone ?? "",
    });
  }, [user]);
  const [tempValues, setTempValues] = useState({ ...fieldValues });
  const [imageUri, setImageUri] = useState<string | null>(null);

  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const blurOpacity = useAnimatedValue(0);

  useEffect(() => {
    const isAnyModalVisible = modalVisible || passwordModalVisible;
    if (isAnyModalVisible) {
      Animated.timing(blurOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      blurOpacity.setValue(0);
    }
  }, [modalVisible, passwordModalVisible]);

  const handleSave = () => {
    setFieldValues(tempValues);
    setModalVisible(false);
  };

  const handleLogout = () => {
    logout();
    router.replace("/signIn" as any);
  };

  const handleChangePassword = async () => {
    // Enhanced validation
    if (
      !passwords.current?.trim() ||
      !passwords.new?.trim() ||
      !passwords.confirm?.trim()
    ) {
      Alert.alert("Validation Error", "All password fields are required.");
      return;
    }

    if (passwords.current.trim().length < 6) {
      Alert.alert(
        "Validation Error",
        "Current password must be at least 6 characters."
      );
      return;
    }

    if (passwords.new.trim().length < 6) {
      Alert.alert(
        "Validation Error",
        "New password must be at least 6 characters."
      );
      return;
    }

    if (passwords.new !== passwords.confirm) {
      Alert.alert(
        "Validation Error",
        "New password and confirm password do not match."
      );
      return;
    }

    if (passwords.current === passwords.new) {
      Alert.alert(
        "Validation Error",
        "New password must be different from current password."
      );
      return;
    }

    // Add basic password strength validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/;
    if (!passwordRegex.test(passwords.new)) {
      Alert.alert(
        "Validation Error",
        "New password must contain at least one uppercase letter, one lowercase letter, and one number."
      );
      return;
    }

    try {
      await changePassword(passwords.current.trim(), passwords.new.trim());

      // Clear password fields immediately
      setPasswords({
        current: "",
        new: "",
        confirm: "",
      });

      // Close the modal immediately
      setPasswordModalVisible(false);

      // Show success message with forced logout
      Alert.alert(
        "Password Changed Successfully",
        "Your password has been changed successfully. You will be signed out and need to sign in with your new password.",
        [
          {
            text: "Continue",
            onPress: () => {
              // Force logout and redirect
              logout();
              setTimeout(() => {
                router.replace("/signIn"as any );
              }, 100);
            },
          },
        ],
        {
          cancelable: false,
          onDismiss: () => {
            // Fallback in case alert is dismissed
            logout();
            router.replace("/signIn" as any);
          },
        }
      );
    } catch (error: any) {

      // Enhanced error handling with specific messages
      let errorTitle = "Password Change Failed";
      let errorMessage = "An unexpected error occurred. Please try again.";

      if (error.message) {
        if (error.message.includes("Current password is incorrect")) {
          errorTitle = "Authentication Error";
          errorMessage =
            "The current password you entered is incorrect. Please try again.";
        } else if (
          error.message.includes("Password does not meet requirements")
        ) {
          errorTitle = "Password Requirements";
          errorMessage =
            "The new password does not meet the security requirements. Please ensure it contains at least one uppercase letter, one lowercase letter, and one number.";
        } else if (error.message.includes("Network error")) {
          errorTitle = "Connection Error";
          errorMessage =
            "Unable to connect to the server. Please check your internet connection and try again.";
        } else if (error.message.includes("Server error")) {
          errorTitle = "Server Error";
          errorMessage =
            "The server is currently unavailable. Please try again in a few moments.";
        } else if (error.message.includes("Too many")) {
          errorTitle = "Rate Limit";
          errorMessage =
            "Too many password change attempts. Please wait a few minutes before trying again.";
        } else {
          errorMessage = error.message;
        }
      }

      Alert.alert(errorTitle, errorMessage, [
        {
          text: "OK",
          style: "default",
        },
      ]);
    }
  };

  return (
    <>
      {/* Combined Blur Overlay */}
      {(modalVisible || passwordModalVisible) && (
        <Animated.View style={[styles.overlay, { opacity: blurOpacity }]}>
          <BlurView
            intensity={50}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}

      <EditPopup
        visible={passwordModalVisible}
        type="password"
        values={passwords}
        onChange={(key, value) =>
          setPasswords((prev) => ({ ...prev, [key]: value }))
        }
        onSubmit={handleChangePassword}
        onClose={() => setPasswordModalVisible(false)}
      />

      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.heading}>Profile</Text>
        </View>

        {/* Profile Photo */}
        <View style={styles.profileHeader}>
          <TouchableOpacity>
            <Image
              source={
                getImageUrl(user?.profilePicUrl)
                  ? { uri: getImageUrl(user?.profilePicUrl) }
                  : imageUri
                  ? { uri: imageUri }
                  : require("../../../assets/images/profile.png")
              }
              style={styles.profileImage}
            />
          </TouchableOpacity>
          <View>
            <Text style={styles.greetingText}>
              Hello, {fieldValues.Name.split(" ")[0]}!
            </Text>
            <Text style={styles.subtitleText}>{fieldValues.Email}</Text>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/screens/editProfile")}
          >
            <View style={styles.actionButtonContent}>
              <Icon name="pencil" size={20} color="#008080" />
              <Text style={styles.actionButtonText}>Edit Profile</Text>
            </View>
            <Icon name="chevron-forward" size={20} color="#008080" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/screens/Favourites" as any)}
          >
            <View style={styles.actionButtonContent}>
              <Icon name="heart" size={20} color="#008080" />
              <Text style={styles.actionButtonText}>Favourites</Text>
            </View>
            <Icon name="chevron-forward" size={20} color="#008080" />
          </TouchableOpacity>
       <TouchableOpacity
        style={styles.actionButton}
        onPress={() => router.push("/screens/ReportsAndIssues" as any)}
      >
        <View style={styles.actionButtonContent}>
          <Icon name="alert-circle" size={20} color="#008080" />
          <Text style={styles.actionButtonText}>Reports & Issues</Text>
        </View>
        <Icon name="chevron-forward" size={20} color="#008080" />
      </TouchableOpacity>

        </View>
        {/* Change Password Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <TouchableOpacity
            onPress={() => setPasswordModalVisible(true)}
            style={styles.actionButton}
          >
            <View style={styles.actionButtonContent}>
              <Icon name="key" size={20} color="#008080" />
              <Text style={styles.actionButtonText}>Change Password</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/screens/NotificationSettings" as any)}
          >
            <View style={styles.actionButtonContent}>
              <Icon name="settings" size={20} color="#008080" />
              <Text style={styles.actionButtonText}>Notifications</Text>
            </View>
            <Icon name="chevron-forward" size={20} color="#008080" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Linking.openSettings()}
          >
            <View style={styles.actionButtonContent}>
              <Icon name="shield" size={20} color="#008080" />
              <Text style={styles.actionButtonText}>Permissions</Text>
            </View>
            <Icon name="chevron-forward" size={20} color="#008080" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/screens/HelpAndSupport" as any)}
          >
            <View style={styles.actionButtonContent}>
              <Icon name="help-circle" size={20} color="#008080" />
              <Text style={styles.actionButtonText}>Help & Support</Text>
            </View>
            <Icon name="chevron-forward" size={20} color="#008080" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.logoutButton]}
            onPress={() => {
              handleLogout();
            }}
          >
            <View style={styles.actionButtonContent}>
              <Icon name="log-out" size={20} color="#FF6B6B" />
              <Text style={[styles.actionButtonText, styles.logoutText]}>
                Sign Out
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 14,
    paddingBottom: 60,
    marginBottom: 80,
    backgroundColor: "#f9fafb",
  },
  header: {
    marginTop: 60,
    paddingLeft: 10,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heading: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1f2937",
  },
  section: {
    marginBottom: 20,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 15,
  },
  infoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4b5563",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 16,
    paddingLeft: 10,
  },

  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#008080",
  },

  greetingText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1f2937",
  },
  subtitleText: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 1,
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    marginTop: 8,
  },
  actionButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButtonText: {
    color: "#008080",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 12,
  },
  logoutButton: {
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    borderColor: "rgba(255, 107, 107, 0.3)",
  },
  logoutText: {
    color: "#FF6B6B",
  },
});
