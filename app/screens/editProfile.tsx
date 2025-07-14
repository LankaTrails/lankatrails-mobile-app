import React, { useState } from "react";
import Icon from "react-native-vector-icons/Ionicons";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { Stack, router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import InputField from '../../components/InputField';


export default function Profile() {
  const [fieldValues, setFieldValues] = useState({
    Name: "Eran Wijesekara",
    Email: "eran@email.com",
    // Phone: "+94 712 345 678",
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
                  : require("../../assets/images/profile.png")
              }
              style={styles.image}
            />
          </TouchableOpacity>
          <Text style={styles.changePhotoText}>Change Profile Photo</Text>
        </View>

        {/* Editable Fields */}
        <View style={styles.section}>
          {Object.entries(tempValues).map(([key, value]) => (
          <InputField
          key={key}
          label={key}
          value={value}
          placeholder={`Enter your ${key.toLowerCase()}`}
          onChange={(text) => setTempValues((prev) => ({ ...prev, [key]: text }))}
          icon={iconName[key as keyof typeof iconName]}
  />
))}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 14,
    paddingBottom: 60,
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
  },
  image: {
    width: 110,
    height: 110,
    borderRadius: 55,
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
