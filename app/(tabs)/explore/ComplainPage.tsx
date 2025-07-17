import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  ToastAndroid,
  Image,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

function ComplainPage() {
  const [complaintHeading, setComplaintHeading] = useState('');
  const [userComplaint, setUserComplaint] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const MAX_IMAGE_SIZE_MB = 5;

  const handleComplaintSubmit = () => {
    if (complaintHeading.trim() === '' || userComplaint.trim() === '') {
      Alert.alert('Incomplete Complaint', 'Please enter both a heading and a detailed complaint.');
      return;
    }

    // Send complaintHeading, userComplaint, selectedImages to backend

    if (Platform.OS === 'android') {
      ToastAndroid.show('Complaint submitted successfully.', ToastAndroid.SHORT);
    } else {
      Alert.alert('Submitted', 'Your complaint has been recorded.');
    }

    setComplaintHeading('');
    setUserComplaint('');
    setSelectedImages([]);
  };

  const pickImage = async () => {
    if (selectedImages.length >= 4) {
      Alert.alert('Limit Reached', 'You can only attach up to 4 images.');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'We need access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const newImageUri = result.assets[0].uri;

      // Check image size
      const fileInfo = await FileSystem.getInfoAsync(newImageUri);
      const sizeInMB = fileInfo.size ? fileInfo.size / (1024 * 1024) : 0;

      if (sizeInMB > MAX_IMAGE_SIZE_MB) {
        Alert.alert(
          'File Too Large',
          `Each image must be less than ${MAX_IMAGE_SIZE_MB}MB. This one is ${sizeInMB.toFixed(2)}MB.`
        );
        return;
      }

      setSelectedImages((prev) => [...prev, newImageUri]);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setSelectedImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  return (
    <ScrollView className="px-8 mt-36">
      <Text className="text-gray-500 font-medium mb-8 text-2xl">Submit a Complaint</Text>

      {/* Heading Input */}
      <View className="bg-gray-100 rounded-lg px-3 py-2 mb-4">
        <TextInput
          placeholder="Complaint Heading (Required)"
          placeholderTextColor="rgba(107, 114, 128, 0.5)"
          value={complaintHeading}
          onChangeText={setComplaintHeading}
          className="text-xl text-gray-500 font-bold"
        />
      </View>

      {/* Complaint Body */}
      <View className="bg-gray-100 rounded-lg px-3 py-2 mb-4">
        <TextInput
          multiline
          placeholder="Mention any issues or complaints..."
          value={userComplaint}
          onChangeText={setUserComplaint}
          className="text-lg text-primary"
          style={{ minHeight: 100 }}
        />
      </View>

      {/* Image Picker Button */}
      <TouchableOpacity
        onPress={pickImage}
        disabled={selectedImages.length >= 4}
        className={`py-2 px-4 rounded-lg mb-4 border ${
          selectedImages.length >= 4
            ? 'bg-gray-200 border-gray-400'
            : 'bg-teal-100 border-teal-500'
        }`}
      >
        <Text
          className={`text-base font-medium ${
            selectedImages.length >= 4 ? 'text-gray-400' : 'text-teal-700'
          }`}
        >
          {selectedImages.length >= 4
            ? 'Maximum of 4 images selected'
            : 'Attach an Image (Optional)'}
        </Text>
      </TouchableOpacity>

      {/* Show selected image previews */}
      {selectedImages.length > 0 && (
        <View className="mb-4">
          <Text className="text-gray-500 mb-2">Attached Images:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {selectedImages.map((uri, index) => (
              <View key={index} style={{ position: 'relative', marginRight: 10 }}>
                <Image
                  source={{ uri }}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: '#ccc',
                  }}
                />
                <TouchableOpacity
                  onPress={() => removeImage(index)}
                  style={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    backgroundColor: '#f87171',
                    borderRadius: 16,
                    padding: 2,
                    zIndex: 1,
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12, padding:4 }}>X</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Submit Button */}
      <TouchableOpacity
        onPress={handleComplaintSubmit}
        className="bg-primary py-3 rounded-lg items-center mb-10"
      >
        <Text className="text-white text-lg font-semibold">Submit Complaint</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

export default ComplainPage;
