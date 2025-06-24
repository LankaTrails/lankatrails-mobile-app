import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Animated,
  Alert,
} from "react-native";
import { BlurView } from "expo-blur";
import Icon from "react-native-vector-icons/Ionicons";
import ProfileInfoItem from "../../../components/ProfileInfoItem";
import EditModal from "../../../components/EditPopup";
import { router } from "expo-router";
import { theme } from "../../theme";

export default function Profile() {
  const [modalVisible, setModalVisible] = useState(false);
  const [fieldValues, setFieldValues] = useState({
    Name: "Eren Wijesekara",
    Email: "eren@email.com",
    Phone: "+94 712 345 678",
  });
  const [tempValues, setTempValues] = useState({ ...fieldValues });
  const [imageUri, setImageUri] = useState<string | null>(null);

  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const blurOpacity = useRef(new Animated.Value(0)).current;

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

  const handleChangePassword = () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      Alert.alert("Error", "All fields are required.");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }

    // Replace this with actual backend password update logic
    Alert.alert("Success", "Password changed successfully.");
    setPasswords({ current: "", new: "", confirm: "" });
    setPasswordModalVisible(false);
  };

  return (
    <>
      {/* Combined Blur Overlay */}
      {(modalVisible || passwordModalVisible) && (
        <Animated.View style={[styles.overlay, { opacity: blurOpacity }]}>
          <BlurView intensity={50} tint="light" style={StyleSheet.absoluteFill} />
        </Animated.View>
      )}

      <EditModal
  visible={modalVisible}
  type="info"
  values={tempValues}
  onChange={(key, value) =>
    setTempValues((prev) => ({ ...prev, [key]: value }))
  }
  onSubmit={handleSave}
  onClose={() => setModalVisible(false)}
/>

<EditModal
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
          <TouchableOpacity onPress={() => router.push("/screens/editProfile")}>
                        <Icon name="pencil" size={20} color="#008080" />
                      </TouchableOpacity>
        </View>

        {/* Profile Photo */}
        <View style={styles.profileHeader}>
  <TouchableOpacity>
    <Image
      source={
        imageUri
          ? { uri: imageUri }
          : require("../../../assets/images/profile.png")
      }
      style={styles.profileImage}
    />
  </TouchableOpacity>
  <View>
    <Text style={styles.greetingText}>Hello, {fieldValues.Name.split(" ")[0]}!</Text>
  </View>
</View>

        {/* User Info */}
        <View style={styles.section}>
          <View style={styles.infoHeader}>
            <Text style={styles.sectionTitle}>User Info</Text>
          </View>

          {Object.entries(fieldValues).map(([key, value]) => (
            <ProfileInfoItem key={key} label={key} value={value} />
          ))}
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionButtonContent}>
                <Icon name="notifications" size={20} color="#008080" />
                <Text style={styles.actionButtonText}>Notification Settings</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#4ECDC4" />
            </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionButtonContent}>
                <Icon name="help-circle" size={20} color="#008080" />
                <Text style={styles.actionButtonText}>Help & Support</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#008080" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.logoutButton]}>
              <View style={styles.actionButtonContent}>
                <Icon name="log-out" size={20} color="#FF6B6B" />
                <Text style={[styles.actionButtonText, styles.logoutText]}>Sign Out</Text>
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },


  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginTop: 8,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#008080',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
   logoutButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  logoutText: {
    color: '#FF6B6B',
  },
  
});
