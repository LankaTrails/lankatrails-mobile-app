import { useAuth } from "@/hooks/useAuth";
import { addProfilePicture, updateUserProfile } from "@/services/userService";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Stack, router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import InputField from "../../components/InputField";
import PhoneInput from "../../components/PhoneInput";

export default function Profile() {
  const { user, checkAuth } = useAuth();
  const [fieldValues, setFieldValues] = useState({
    FName: user?.firstName || "",
    LName: user?.lastName || "",
    Phone: user?.phone || "",
    Country: user?.country || "LK",
  });
  const [tempValues, setTempValues] = useState({ ...fieldValues });
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const resetChanges = () => {
    setTempValues({ ...fieldValues });
    setImageUri(null);
  };

  const handleBackPress = () => {
    if (hasChanges) {
      Alert.alert(
        "Unsaved Changes",
        "You have unsaved changes. Are you sure you want to go back?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => {
              resetChanges();
              router.push("../profile");
            },
          },
        ]
      );
    } else {
      router.push("../profile");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // First, update the user profile with the new values
      await updateUserProfile(
        tempValues.FName,
        tempValues.LName,
        tempValues.Phone,
        tempValues.Country || "LK",
        user?.role || "ROLE_TOURIST"
      );

      // If there's a new image, upload it
      if (imageUri && user?.id) {
        setIsUploadingImage(true);
        try {
          await addProfilePicture(user.id, imageUri);
        } catch (uploadError: any) {
          console.error("Error uploading profile picture:", uploadError);
          Alert.alert(
            "Upload Error",
            uploadError.message || "Failed to upload profile picture"
          );
          return; // Don't proceed if image upload fails
        } finally {
          setIsUploadingImage(false);
        }
      }

      // Update the field values with the temporary values
      setFieldValues({ ...tempValues });

      // Clear the temporary image URI since it's now uploaded
      setImageUri(null);

      // Refresh auth to get updated profile data
      checkAuth();

      // Show success message
      Alert.alert("Success", "Profile updated successfully");

      // Navigate back to profile page
      router.push("../profile");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges =
    JSON.stringify(fieldValues) !== JSON.stringify(tempValues) ||
    imageUri !== null;

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        // Just set the local image URI, don't upload immediately
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };
  const iconName = {
    FName: "person-outline",
    LName: "person-outline",
    Phone: "call-outline",
  };

  const labelMap = {
    FName: "First Name",
    LName: "Last Name",
    Phone: "Phone",
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={handleBackPress}>
                <Ionicons name="arrow-back" size={24} color="#008080" />
              </TouchableOpacity>
            </View>
            <View style={styles.headerCenter}>
              <Text style={styles.heading}>Edit Profile</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity
                onPress={() => {
                  if (hasChanges) {
                    handleSave();
                  } else {
                    resetChanges();
                    router.push("../profile");
                  }
                }}
                disabled={isSaving || isUploadingImage}
              >
                <Text
                  style={[
                    styles.editButton,
                    (isSaving || isUploadingImage) && styles.editButtonDisabled,
                  ]}
                >
                  {isSaving ? "Saving..." : hasChanges ? "Done" : ""}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Profile Photo */}
          <View style={styles.imageContainer}>
            <TouchableOpacity onPress={pickImage} disabled={isSaving}>
              <View style={styles.imageWrapper}>
                <Image
                  source={
                    imageUri
                      ? { uri: imageUri }
                      : user?.profilePicUrl
                      ? { uri: user.profilePicUrl }
                      : require("../../assets/images/profile.png")
                  }
                  style={styles.image}
                />
                {isUploadingImage && (
                  <View style={styles.uploadingOverlay}>
                    <Text style={styles.uploadingText}>Uploading...</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
            <Text style={styles.changePhotoText}>
              {isSaving
                ? "Saving..."
                : imageUri
                ? "Image selected"
                : "Change Profile Photo"}
            </Text>
          </View>

          {/* Editable Fields */}
          <View style={styles.section}>
            {Object.entries(tempValues).map(([key, value]) => {
              const label = labelMap[key as keyof typeof labelMap];
              const icon = iconName[key as keyof typeof iconName];

              // Add safety check
              if (!label) {
                console.warn(`Missing label for key: ${key}`);
                return null;
              }

              if (key === "Phone") {
                return (
                  <PhoneInput
                    key={key}
                    label={label}
                    defaultCountry={user?.country || "LK"}
                    value={value}
                    onChange={(text) =>
                      setTempValues((prev) => ({ ...prev, [key]: text }))
                    }
                    onCountryChange={(country) =>
                      setTempValues((prev) => ({
                        ...prev,
                        Country: country.code,
                      }))
                    }
                  />
                );
              }

              return (
                <InputField
                  key={key}
                  label={label}
                  value={value}
                  placeholder={`Enter your ${label.toLowerCase()}`}
                  onChange={(text) =>
                    setTempValues((prev) => ({ ...prev, [key]: text }))
                  }
                  icon={icon}
                />
              );
            })}{" "}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 60,
  },
  header: {
    marginTop: 60,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flex: 1,
    alignItems: "flex-start",
  },
  headerCenter: {
    flex: 2,
    alignItems: "center",
  },
  headerRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
  },
  label: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  icon: {
    marginRight: 6,
    color: "#008080",
  },
  section: {
    marginBottom: 40,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 15,
  },

  imageContainer: {
    alignItems: "center",
    marginBottom: 26,
    marginTop: 16,
    flex: 2,
  },
  imageWrapper: {
    position: "relative",
  },
  image: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: "#008080",
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 55,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadingText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "500",
  },
  changePhotoText: {
    marginTop: 10,
    color: "#6b7280",
    fontSize: 13,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  editButton: {
    flexDirection: "row",
    color: "#008080",
    alignItems: "center",
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: "500",
    paddingVertical: 6,
    borderColor: "#4ECDC4",
  },
  editButtonDisabled: {
    color: "#9CA3AF",
  },
});
