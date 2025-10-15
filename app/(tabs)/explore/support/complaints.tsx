import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function complaints() {
  const [complaintHeading, setComplaintHeading] = useState("");
  const [userComplaint, setUserComplaint] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const MAX_IMAGE_SIZE_MB = 5;

  const handleComplaintSubmit = () => {
    if (complaintHeading.trim() === "" || userComplaint.trim() === "") {
      Alert.alert(
        "Incomplete Information",
        "Please fill in both the issue title and detailed description to submit your complaint.",
        [{ text: "OK", style: "default" }]
      );
      return;
    }

    if (Platform.OS === "android") {
      ToastAndroid.show(
        "Complaint submitted successfully! We'll review it shortly.",
        ToastAndroid.LONG
      );
    } else {
      Alert.alert(
        "Complaint Submitted",
        "Thank you for your feedback! We'll review your complaint and get back to you soon.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
            style: "default",
          },
        ]
      );
    }

    // Reset form
    setComplaintHeading("");
    setUserComplaint("");
    setSelectedImages([]);

    // Navigate back after a short delay on Android
    if (Platform.OS === "android") {
      setTimeout(() => {
        router.back();
      }, 2000);
    }
  };

  const pickImage = async () => {
    if (selectedImages.length >= 4) {
      Alert.alert(
        "Image Limit Reached",
        "You can attach a maximum of 4 images to help illustrate your complaint.",
        [{ text: "OK", style: "default" }]
      );
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "We need access to your photo library to attach images to your complaint. Please enable this permission in your device settings.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Settings", onPress: () => {}, style: "default" },
        ]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const newImageUri = result.assets[0].uri;

      const fileInfo = await FileSystem.getInfoAsync(newImageUri);
      let sizeInMB = 0;
      if (fileInfo.exists && typeof fileInfo.size === "number") {
        sizeInMB = fileInfo.size / (1024 * 1024);
      }

      if (sizeInMB > MAX_IMAGE_SIZE_MB) {
        Alert.alert(
          "Image Too Large",
          `The selected image is too large (${sizeInMB.toFixed(
            1
          )}MB). Please choose an image smaller than ${MAX_IMAGE_SIZE_MB}MB to ensure faster upload.`,
          [{ text: "OK", style: "default" }]
        );
        return;
      }

      setSelectedImages((prev) => [...prev, newImageUri]);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setSelectedImages((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white shadow-sm">
        <View className="flex-row items-center justify-between px-4 py-3">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Ionicons name="arrow-back" size={24} color="#008080" />
          </TouchableOpacity>

          <Text className="text-xl font-bold text-primary flex-1 text-center">
            Submit Complaint
          </Text>

          {/* Empty view for balance */}
          <View className="w-8" />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Info Card */}
        <View className="mx-4 mt-4 mb-2 p-4 bg-white rounded-xl shadow-sm">
          <View className="flex-row items-center mb-2">
            <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center mr-3">
              <Ionicons name="warning" size={20} color="#ef4444" />
            </View>
            <Text className="text-lg font-semibold text-gray-800">
              Report an Issue
            </Text>
          </View>
          <Text className="text-sm text-gray-600 leading-5">
            Help us improve by reporting any issues you've encountered. Your
            feedback is valuable to us.
          </Text>
        </View>

        {/* Form Content */}
        <View className="mx-4">
          {/* Complaint Heading */}
          <View className="bg-white rounded-xl shadow-sm p-4 mb-3">
            <Text className="text-base font-semibold text-gray-700 mb-2">
              Issue Title *
            </Text>
            <View className="bg-gray-50 rounded-lg px-3 py-3 border border-gray-200">
              <TextInput
                placeholder="Brief description of the issue"
                placeholderTextColor="#9CA3AF"
                value={complaintHeading}
                onChangeText={setComplaintHeading}
                className="text-base text-gray-800"
                maxLength={100}
              />
            </View>
            <Text className="text-xs text-gray-500 mt-1">
              {complaintHeading.length}/100 characters
            </Text>
          </View>

          {/* Complaint Details */}
          <View className="bg-white rounded-xl shadow-sm p-4 mb-3">
            <Text className="text-base font-semibold text-gray-700 mb-2">
              Detailed Description *
            </Text>
            <View className="bg-gray-50 rounded-lg px-3 py-3 border border-gray-200">
              <TextInput
                multiline
                placeholder="Please provide detailed information about the issue, including when it occurred and any steps that led to it..."
                placeholderTextColor="#9CA3AF"
                value={userComplaint}
                onChangeText={setUserComplaint}
                className="text-base text-gray-800"
                style={{ minHeight: 120, textAlignVertical: "top" }}
                maxLength={500}
              />
            </View>
            <Text className="text-xs text-gray-500 mt-1">
              {userComplaint.length}/500 characters
            </Text>
          </View>

          {/* Image Attachment Section */}
          <View className="bg-white rounded-xl shadow-sm p-4 mb-3">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-base font-semibold text-gray-700">
                Attachments
              </Text>
              <View className="flex-row items-center">
                <Ionicons name="camera" size={16} color="#6B7280" />
                <Text className="text-xs text-gray-500 ml-1">
                  {selectedImages.length}/4
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={pickImage}
              disabled={selectedImages.length >= 4}
              className={`flex-row items-center justify-center py-3 px-4 rounded-lg border-2 border-dashed ${
                selectedImages.length >= 4
                  ? "bg-gray-100 border-gray-300"
                  : "bg-primary-50 border-primary-300"
              }`}
            >
              <Ionicons
                name="cloud-upload-outline"
                size={24}
                color={selectedImages.length >= 4 ? "#9CA3AF" : "#008080"}
              />
              <Text
                className={`ml-2 font-medium ${
                  selectedImages.length >= 4 ? "text-gray-400" : "text-primary"
                }`}
              >
                {selectedImages.length >= 4
                  ? "Maximum images attached"
                  : "Add Photo/Screenshot"}
              </Text>
            </TouchableOpacity>

            {/* Image Previews */}
            {selectedImages.length > 0 && (
              <View className="mt-4">
                <Text className="text-sm font-medium text-gray-600 mb-2">
                  Attached Images:
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="space-x-2"
                >
                  {selectedImages.map((uri, index) => (
                    <View key={index} className="relative mr-3">
                      <Image
                        source={{ uri }}
                        className="w-20 h-20 rounded-lg"
                        style={{
                          borderWidth: 2,
                          borderColor: "#E5E7EB",
                        }}
                      />
                      <TouchableOpacity
                        onPress={() => removeImage(index)}
                        className="absolute z-10 -top-2 -right-2 bg-red-500 rounded-full p-1"
                        style={{
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.25,
                          shadowRadius: 3.84,
                          elevation: 5,
                        }}
                      >
                        <Ionicons name="close" size={12} color="white" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Help Text */}
          <View className="bg-blue-50 rounded-xl p-4 border border-blue-200 mb-4">
            <View className="flex-row items-start">
              <Ionicons
                name="information-circle"
                size={20}
                color="#3B82F6"
                className="mt-0.5"
              />
              <View className="flex-1 ml-2">
                <Text className="text-sm font-medium text-blue-800 mb-1">
                  Tips for better support:
                </Text>
                <Text className="text-xs text-blue-700 leading-4">
                  • Be specific about the issue{"\n"}• Include screenshots if
                  possible{"\n"}• Mention the steps that led to the problem
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <View className="mx-4 mt-2">
          <TouchableOpacity
            onPress={handleComplaintSubmit}
            className="bg-primary py-4 rounded-xl items-center shadow-sm"
            style={{
              shadowColor: "#008080",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text className="text-white text-lg font-semibold">
              Submit Complaint
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default complaints;
