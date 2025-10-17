import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import React, { useState, useRef, useEffect } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Animated,
  ScrollView,
  Share,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import QRCode from "react-native-qrcode-svg";
import { generateTripInvitation } from "@/services/tripService";
import { TripInvitationRequest } from "@/types/triptypes";

const prefix = Linking.createURL("/");
const { width } = Dimensions.get("window");

interface TripSharingModalProps {
  visible: boolean;
  onClose: () => void;
  tripId: number;
  tripName: string;
}

const TripSharingModal: React.FC<TripSharingModalProps> = ({
  visible,
  onClose,
  tripId,
  tripName,
}) => {
  const [currentStep, setCurrentStep] = useState<
    "type" | "role" | "share" | "qr" | "loading"
  >("type");
  const [invitationType, setInvitationType] = useState<
    "individual" | "group" | null
  >(null);
  const [selectedRole, setSelectedRole] = useState<
    "MEMBER" | "EDITOR" | "ADMIN" | null
  >(null);
  const [invitationLink, setInvitationLink] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Animation references
  const slideAnim = useRef(new Animated.Value(600)).current;
  const blurOpacity = useRef(new Animated.Value(0)).current;

  const resetModal = () => {
    setCurrentStep("type");
    setInvitationType(null);
    setSelectedRole(null);
    setInvitationLink("");
    setIsGenerating(false);
    setError(null);
  };

  // Animation effects
  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(blurOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations when not visible
      slideAnim.setValue(600);
      blurOpacity.setValue(0);
    }
  }, [visible]);

  const animateStepTransition = () => {
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleClose = () => {
    // Animate out
    Animated.parallel([
      Animated.timing(blurOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 600,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      resetModal();
      onClose();
    });
  };

  const handleTypeSelection = (type: "individual" | "group") => {
    setInvitationType(type);
    setCurrentStep("role");
    animateStepTransition();
  };

  const handleRoleSelection = (role: "MEMBER" | "EDITOR" | "ADMIN") => {
    setSelectedRole(role);
    generateInvitation(role);
    animateStepTransition();
  };

  const generateInvitation = async (role: "MEMBER" | "EDITOR" | "ADMIN") => {
    if (!invitationType) return;

    setCurrentStep("loading");
    setIsGenerating(true);
    setError(null);

    try {
      const invitationData: TripInvitationRequest = {
        tripId: tripId,
        role: role,
        isGroupInvitation: invitationType === "group",
      };

      const response = await generateTripInvitation(tripId, invitationData);

      if (response.success && response.data) {
        const invitationToken = response.data;
        const link = `${prefix}invite/${invitationToken}`;
        setInvitationLink(link);
        setCurrentStep("share");
        animateStepTransition();
      } else {
        throw new Error(response.message || "Failed to generate invitation");
      }
    } catch (error: any) {
      console.error("Failed to generate trip invitation:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to generate invitation link";
      setError(errorMessage);
      setCurrentStep("type"); // Go back to start
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      console.log("Copying link:", invitationLink);
      await Clipboard.setStringAsync(invitationLink);
      Alert.alert("Success", "Invitation link copied to clipboard!");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      Alert.alert("Error", "Failed to copy invitation link");
    }
  };

  const handleShare = async () => {
    try {
      console.log("Sharing invitation:", { invitationType, selectedRole, tripName, invitationLink });
      const inviteMessage =
        invitationType === "group"
          ? `You're invited to join our trip "${tripName}" with ${selectedRole?.toLowerCase()} access! This group invitation can be used by multiple people. Click this link to join: ${invitationLink}`
          : `You're invited to join our trip "${tripName}" with ${selectedRole?.toLowerCase()} access! Click this link to join: ${invitationLink}`;

      const result = await Share.share({
        message: inviteMessage,
        title: `Join ${tripName}`,
      });
      console.log("Share result:", result);
    } catch (error) {
      console.error("Error sharing:", error);
      Alert.alert("Error", "Failed to share invitation link");
    }
  };

  const handleShowQR = () => {
    console.log("Navigating to QR step with:", { invitationLink, tripName, selectedRole, invitationType });
    setCurrentStep("qr");
    animateStepTransition();
  };

  const renderTypeSelection = () => (
    <View style={styles.stepContainer}>
      <View style={styles.headerSection}>
        <View style={styles.iconContainer}>
          <Ionicons name="share-outline" size={32} color="#008080" />
        </View>
        <Text style={styles.stepTitle}>Share Your Trip</Text>
        <Text style={styles.stepDescription}>
          What type of invitation do you want to create?
        </Text>
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => handleTypeSelection("individual")}
          activeOpacity={0.7}
        >
          <View style={styles.optionIconContainer}>
            <Ionicons name="person-outline" size={28} color="#008080" />
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>Individual Invitation</Text>
            <Text style={styles.optionSubtitle}>
              Single-use invitation for one person
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => handleTypeSelection("group")}
          activeOpacity={0.7}
        >
          <View style={styles.optionIconContainer}>
            <Ionicons name="people-outline" size={28} color="#008080" />
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>Group Invitation</Text>
            <Text style={styles.optionSubtitle}>
              Reusable invitation link for multiple people
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRoleSelection = () => (
    <View style={styles.stepContainer}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          setCurrentStep("type");
          animateStepTransition();
        }}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-back" size={20} color="#008080" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.headerSection}>
        <View style={styles.iconContainer}>
          <Ionicons name="shield-checkmark-outline" size={32} color="#008080" />
        </View>
        <Text style={styles.stepTitle}>Invitation Role</Text>
        <Text style={styles.stepDescription}>
          What role should the invited{" "}
          {invitationType === "group" ? "people" : "person"} have?
        </Text>
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => handleRoleSelection("MEMBER")}
          activeOpacity={0.7}
        >
          <View style={styles.optionIconContainer}>
            <Ionicons name="eye-outline" size={28} color="#008080" />
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>Member (View Only)</Text>
            <Text style={styles.optionSubtitle}>Can view and join trip</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => handleRoleSelection("EDITOR")}
          activeOpacity={0.7}
        >
          <View style={styles.optionIconContainer}>
            <Ionicons name="create-outline" size={28} color="#008080" />
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>Editor (Can Modify)</Text>
            <Text style={styles.optionSubtitle}>Can modify trip details</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => handleRoleSelection("ADMIN")}
          activeOpacity={0.7}
        >
          <View style={styles.optionIconContainer}>
            <Ionicons name="settings-outline" size={28} color="#008080" />
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>Admin (Full Access)</Text>
            <Text style={styles.optionSubtitle}>
              Full trip management access
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <View style={styles.iconContainer}>
        <ActivityIndicator size="large" color="#008080" />
      </View>
      <Text style={styles.loadingTitle}>Generating Invitation</Text>
      <Text style={styles.loadingText}>Please wait while we create your invitation link...</Text>
    </View>
  );

  const renderShareOptions = () => (
    <View style={styles.stepContainer}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          setCurrentStep("role");
          animateStepTransition();
        }}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-back" size={20} color="#008080" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.headerSection}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle-outline" size={32} color="#10b981" />
        </View>
        <Text style={styles.stepTitle}>Share Trip Invitation</Text>
        <Text style={styles.stepDescription}>
          Share this {invitationType} {selectedRole?.toLowerCase()} invitation
          for "{tripName}":
        </Text>
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.shareOptionCard}
          onPress={handleShowQR}
          activeOpacity={0.7}
        >
          <View style={styles.optionIconContainer}>
            <Ionicons name="qr-code-outline" size={28} color="#008080" />
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={styles.shareOptionTitle}>Show QR Code</Text>
            <Text style={styles.optionSubtitle}>
              Display QR code for easy scanning
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shareOptionCard}
          onPress={handleCopyLink}
          activeOpacity={0.7}
        >
          <View style={styles.optionIconContainer}>
            <Ionicons name="copy-outline" size={28} color="#008080" />
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={styles.shareOptionTitle}>Copy Link</Text>
            <Text style={styles.optionSubtitle}>
              Copy invitation link to clipboard
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shareOptionCard}
          onPress={handleShare}
          activeOpacity={0.7}
        >
          <View style={styles.optionIconContainer}>
            <Ionicons name="share-outline" size={28} color="#008080" />
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={styles.shareOptionTitle}>Share</Text>
            <Text style={styles.optionSubtitle}>
              Share via messages, email, or other apps
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderQRStep = () => (
    <View style={styles.stepContainer}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          setCurrentStep("share");
          animateStepTransition();
        }}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-back" size={20} color="#008080" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.headerSection}>
        <View style={styles.iconContainer}>
          <Ionicons name="qr-code-outline" size={32} color="#008080" />
        </View>
        <Text style={styles.stepTitle}>QR Code Invitation</Text>
        <Text style={styles.stepDescription}>
          Scan this QR code to join "{tripName}"
        </Text>
      </View>

      <View style={styles.qrSection}>
        {/* Trip Details */}
        <View style={styles.qrDetailsContainer}>
          <View style={styles.badgeContainer}>
            {selectedRole && (
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{selectedRole} Access</Text>
              </View>
            )}
            {invitationType && (
              <View style={styles.typeBadge}>
                <Text style={styles.typeText}>
                  {invitationType} Invitation
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* QR Code */}
        <View style={styles.qrContainer}>
          <QRCode
            value={invitationLink}
            size={Math.min(width * 0.5, 200)}
            backgroundColor="white"
            color="black"
            logoSize={30}
            logoBackgroundColor="transparent"
          />
        </View>

        {/* Instructions */}
        <Text style={styles.qrInstructions}>
          Scan this QR code with any camera app to join the trip
        </Text>

        {/* Link Display and Copy */}
        <TouchableOpacity
          style={styles.linkDisplayContainer}
          onPress={handleCopyLink}
          activeOpacity={0.7}
        >
          <Text style={styles.linkDisplayText} numberOfLines={2}>
            {invitationLink}
          </Text>
          <Ionicons name="copy-outline" size={20} color="#008080" />
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.qrActionButtons}>
          <TouchableOpacity
            style={styles.qrCopyButton}
            onPress={handleCopyLink}
            activeOpacity={0.7}
          >
            <Ionicons name="copy" size={20} color="white" />
            <Text style={styles.qrCopyButtonText}>Copy Link</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.qrShareButton}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Ionicons name="share" size={20} color="#008080" />
            <Text style={styles.qrShareButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    console.log("Rendering step:", currentStep, { invitationType, selectedRole, invitationLink });
    switch (currentStep) {
      case "type":
        return renderTypeSelection();
      case "role":
        return renderRoleSelection();
      case "loading":
        return renderLoading();
      case "share":
        return renderShareOptions();
      case "qr":
        return renderQRStep();
      default:
        return renderTypeSelection();
    }
  };

  return (
    <Modal visible={visible} animationType="none" transparent={true}>
      <View style={styles.container}>
        {/* Blur Background */}
        <Animated.View
          style={[
            styles.blurContainer,
            {
              opacity: blurOpacity,
            },
          ]}
          pointerEvents="none"
        >
          <BlurView intensity={50} style={StyleSheet.absoluteFill} />
        </Animated.View>

        {/* Modal Content */}
        <Animated.View
          style={[
            styles.modalOverlay,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Share Trip</Text>
              <TouchableOpacity onPress={handleClose} activeOpacity={0.7}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {renderCurrentStep()}
            </ScrollView>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  blurContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 32,
    paddingBottom: 40,
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  scrollContent: {
    flexGrow: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    marginHorizontal: -32,
    paddingHorizontal: 32,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.5,
  },
  stepContainer: {
    paddingVertical: 24,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f0fdfa",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#008080",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  stepDescription: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 280,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "#f3f4f6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    flexDirection: "row",
    alignItems: "center",
  },
  shareOptionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f0fdfa",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  shareOptionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  optionSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
  },
  backButtonText: {
    color: "#008080",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
    minHeight: 200,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginTop: 24,
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 240,
  },
  errorContainer: {
    backgroundColor: "#fef2f2",
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#fecaca",
    shadowColor: "#dc2626",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 22,
  },
  // QR Step Styles
  qrSection: {
    alignItems: "center",
  },
  qrDetailsContainer: {
    marginBottom: 24,
  },
  badgeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  roleBadge: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleText: {
    color: "#1e40af",
    fontSize: 12,
    fontWeight: "600",
  },
  typeBadge: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  typeText: {
    color: "#15803d",
    fontSize: 12,
    fontWeight: "600",
  },
  qrContainer: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 24,
  },
  qrInstructions: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  linkDisplayContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
  },
  linkDisplayText: {
    flex: 1,
    fontSize: 14,
    color: "#475569",
    marginRight: 12,
  },
  qrActionButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  qrCopyButton: {
    flex: 1,
    backgroundColor: "#008080",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  qrCopyButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  qrShareButton: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#008080",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  qrShareButtonText: {
    color: "#008080",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default TripSharingModal;