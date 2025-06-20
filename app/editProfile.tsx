import React, { useState } from "react";
import Icon from "react-native-vector-icons/Ionicons";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Stack, router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import ProfileInput from '../components/InputField';


export default function Profile() {
  const [fieldValues, setFieldValues] = useState({
    Name: "Eran Wijesekara",
    Email: "eran@email.com",
    Phone: "+94 712 345 678",
  });
  const [tempValues, setTempValues] = useState({ ...fieldValues });
  const [imageUri, setImageUri] = useState<string | null>(null);

  const handleSave = () => {
    setFieldValues(tempValues);
    router.back();
  };

  const hasChanges = JSON.stringify(fieldValues) !== JSON.stringify(tempValues);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };
  const iconName = {
    Name: "person-outline",
    Email: "mail-outline",
    Phone: "call-outline",
  };

  return (
    <>
    <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.heading}>Edit Profile</Text>
          <TouchableOpacity
            onPress={() => {
              if (hasChanges) {
                handleSave();
              } else {
                router.push("../profile");
              }
            }}
          >
            <Text style={styles.editButton}>{hasChanges ? "Done" : "Cancel"}</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Photo */}
        <View style={styles.imageContainer}>
          <TouchableOpacity onPress={pickImage}>
            <Image
              source={
                imageUri
                  ? { uri: imageUri }
                  : require("../assets/images/profile.png")
              }
              style={styles.image}
            />
          </TouchableOpacity>
          <Text style={styles.changePhotoText}>Change Profile Photo</Text>
        </View>

        {/* Editable Fields */}
        <View style={styles.section}>
          {Object.entries(tempValues).map(([key, value]) => (
  <ProfileInput
    key={key}
    label={key}
    value={value}
    onChange={(text) => setTempValues((prev) => ({ ...prev, [key]: text }))}
    icon={iconName[key]}
  />
))}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 60,
    backgroundColor: "#f9fafb",
  },
  header: {
    marginTop: 24,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heading: {
    fontSize: 32,
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
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },

  imageContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  image: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 3,
    borderColor: "#008080",
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

  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    height: 48,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  editButton: {
    flexDirection: 'row',
    color: '#008080',
    alignItems: 'center',
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 6,
    borderColor: '#4ECDC4',
  },
});
