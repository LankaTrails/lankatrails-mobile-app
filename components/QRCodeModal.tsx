import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import React from "react";
import {
  Alert,
  Dimensions,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";

interface QRCodeModalProps {
  visible: boolean;
  onClose: () => void;
  invitationLink: string;
  tripName: string;
}

const { width } = Dimensions.get("window");
const QR_SIZE = Math.min(width * 0.7, 280);

export default function QRCodeModal({
  visible,
  onClose,
  invitationLink,
  tripName,
}: QRCodeModalProps) {
  const handleCopyLink = async () => {
    try {
      await Clipboard.setStringAsync(invitationLink);
      Alert.alert("Success", "Invitation link copied to clipboard!");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      Alert.alert("Error", "Failed to copy invitation link");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Trip Invitation QR Code</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Trip Name */}
            <Text style={styles.tripName}>{tripName}</Text>

            {/* QR Code Container */}
            <View style={styles.qrContainer}>
              <QRCode
                value={invitationLink}
                size={QR_SIZE}
                backgroundColor="white"
                color="black"
                logoSize={30}
                logoBackgroundColor="transparent"
              />
            </View>

            {/* Instructions */}
            <Text style={styles.instructions}>
              Scan this QR code with any camera app to join the trip, or share
              the link below
            </Text>

            {/* Link Display */}
            <TouchableOpacity
              style={styles.linkContainer}
              onPress={handleCopyLink}
            >
              <Text style={styles.linkText} numberOfLines={2}>
                {invitationLink}
              </Text>
              <Ionicons name="copy-outline" size={20} color="#008080" />
            </TouchableOpacity>

            {/* Copy Button */}
            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopyLink}
            >
              <Ionicons name="copy" size={20} color="white" />
              <Text style={styles.copyButtonText}>Copy Link</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  safeArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    maxWidth: width * 0.9,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  tripName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#008080",
    marginBottom: 24,
    textAlign: "center",
  },
  qrContainer: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructions: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
  linkContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    width: "100%",
  },
  linkText: {
    flex: 1,
    fontSize: 12,
    color: "#374151",
    marginRight: 8,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#008080",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    justifyContent: "center",
    minWidth: 120,
  },
  copyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
