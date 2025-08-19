import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import BackButton from "@/components/BackButton";

interface SupportOption {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  action: () => void;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  expanded: boolean;
}

export default function HelpAndSupport() {
  const [faqs, setFaqs] = useState<FAQItem[]>([
    {
      id: "1",
      question: "How do I book a trip?",
      answer: "To book a trip, browse our destinations, select your preferred package, choose your dates, and proceed to payment. You'll receive a confirmation email once your booking is complete.",
      expanded: false,
    },
    {
      id: "2",
      question: "Can I cancel my booking?",
      answer: "Yes, you can cancel your booking up to 24 hours before your trip starts. Go to 'My Trips' and select 'Cancel Booking'. Refund policies may apply based on the cancellation timing.",
      expanded: false,
    },
    {
      id: "3",
      question: "How do I contact my tour guide?",
      answer: "Once your booking is confirmed, you can find your tour guide's contact information in the trip details. You can also use the in-app chat feature to communicate directly.",
      expanded: false,
    },
    {
      id: "4",
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, and digital payment methods including PayPal and Apple Pay. All transactions are secure and encrypted.",
      expanded: false,
    },
    {
      id: "5",
      question: "How do I change my profile information?",
      answer: "Go to your Profile page, tap 'Edit Profile', make your changes, and tap 'Done' to save. You can update your name, phone number, and profile picture.",
      expanded: false,
    },
  ]);

  const supportOptions: SupportOption[] = [
    {
      id: "email",
      title: "Email Support",
      description: "Send us an email and we'll respond within 24 hours",
      icon: "mail-outline",
      action: () => {
        Linking.openURL("mailto:support@lankatrails.com?subject=Support Request");
      },
    },
    {
      id: "phone",
      title: "Call Us",
      description: "Speak directly with our support team",
      icon: "call-outline",
      action: () => {
        Linking.openURL("tel:+94112345678");
      },
    },
  ];

  const toggleFAQ = (id: string) => {
    setFaqs(prev =>
      prev.map(faq =>
        faq.id === id ? { ...faq, expanded: !faq.expanded } : faq
      )
    );
  };

  const handleReportBug = () => {
    Alert.alert(
      "Report a Bug",
      "Please describe the issue you're experiencing:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send Email",
          onPress: () =>
            Linking.openURL("mailto:bugs@lankatrails.com?subject=Bug Report"),
        },
      ]
    );
  };

  const handleFeatureRequest = () => {
    Alert.alert(
      "Feature Request",
      "We'd love to hear your suggestions!",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send Email",
          onPress: () =>
            Linking.openURL("mailto:feedback@lankatrails.com?subject=Feature Request"),
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <BackButton />
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.heading}>Help & Support</Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Ionicons name="help-circle" size={40} color="#008080" />
            <Text style={styles.welcomeTitle}>How can we help you?</Text>
            <Text style={styles.welcomeDescription}>
              Get quick answers to your questions or contact our support team
            </Text>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsSection}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity style={styles.quickActionItem} onPress={handleReportBug}>
                <Ionicons name="bug-outline" size={24} color="#008080" />
                <Text style={styles.quickActionText}>Report Bug</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionItem} onPress={handleFeatureRequest}>
                <Ionicons name="bulb-outline" size={24} color="#008080" />
                <Text style={styles.quickActionText}>Suggest Feature</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Contact Support */}
          <View style={styles.contactSection}>
            <Text style={styles.sectionTitle}>Contact Support</Text>
            {supportOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.supportItem}
                onPress={option.action}
              >
                <View style={styles.supportIcon}>
                  <Ionicons name={option.icon} size={24} color="#008080" />
                </View>
                <View style={styles.supportText}>
                  <Text style={styles.supportTitle}>{option.title}</Text>
                  <Text style={styles.supportDescription}>{option.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            ))}
          </View>

         {/* 
          <View style={styles.faqSection}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            {faqs.map((faq) => (
              <View key={faq.id} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => toggleFAQ(faq.id)}
                >
                  <Text style={styles.faqQuestionText}>{faq.question}</Text>
                  <Ionicons
                    name={faq.expanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#008080"
                  />
                </TouchableOpacity>
                {faq.expanded && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            ))}
          </View> */}

          {/* App Info */}
          <View style={styles.appInfoSection}>
            <Text style={styles.sectionTitle}>App Information</Text>
            <View style={styles.appInfoItem}>
              <Text style={styles.appInfoLabel}>Version</Text>
              <Text style={styles.appInfoValue}>1.0.0</Text>
            </View>
            <View style={styles.appInfoItem}>
              <Text style={styles.appInfoLabel}>Build</Text>
              <Text style={styles.appInfoValue}>2025.05.01</Text>
            </View>
            <TouchableOpacity
              style={styles.appInfoItem}
              //onPress={() => Linking.openURL("https://lankatrails.com/privacy")}
            >
              <Text style={styles.appInfoLabel}>Privacy Policy</Text>
              <Ionicons name="open-outline" size={16} color="#008080" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.appInfoItem}
              //onPress={() => Linking.openURL("https://lankatrails.com/terms")}
            >
              <Text style={styles.appInfoLabel}>Terms of Service</Text>
              <Ionicons name="open-outline" size={16} color="#008080" />
            </TouchableOpacity>
          </View>

          {/* Emergency Contact */}
          <View style={styles.emergencySection}>
            <View style={styles.emergencyHeader}>
              <Ionicons name="warning-outline" size={20} color="#ef4444" />
              <Text style={styles.emergencyTitle}>Emergency Contact</Text>
            </View>
            <Text style={styles.emergencyDescription}>
              If you&apos;re experiencing an emergency during your trip, please contact The Sri Lanka Tourist Police (available 24/7)
            </Text>
            <TouchableOpacity
              style={styles.emergencyButton}
              onPress={() => Linking.openURL("tel:+9411-2421052")}
            >
              <Ionicons name="call" size={20} color="#ffffff" />
              <Text style={styles.emergencyButtonText}>+94 11 234 5678</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    marginTop: 60,
    marginBottom: 20,
    paddingHorizontal: 16,
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
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  welcomeSection: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginTop: 12,
    marginBottom: 8,
  },
  welcomeDescription: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  quickActionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
    marginLeft: 4,
  },
  quickActionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickActionItem: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f2937",
    marginTop: 8,
    textAlign: "center",
  },
  contactSection: {
    marginBottom: 24,
  },
  supportItem: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  supportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0, 128, 128, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  supportText: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
    marginBottom: 4,
  },
  supportDescription: {
    fontSize: 14,
    color: "#6b7280",
  },
  faqSection: {
    marginBottom: 24,
  },
  faqItem: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  faqQuestion: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  faqAnswerText: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  appInfoSection: {
    marginBottom: 24,
  },
  appInfoItem: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  appInfoLabel: {
    fontSize: 16,
    color: "#1f2937",
  },
  appInfoValue: {
    fontSize: 16,
    color: "#6b7280",
  },
  emergencySection: {
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    padding: 16,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  emergencyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ef4444",
    marginLeft: 8,
  },
  emergencyDescription: {
    fontSize: 14,
    color: "#7f1d1d",
    marginBottom: 16,
    lineHeight: 20,
  },
  emergencyButton: {
    backgroundColor: "#ef4444",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  emergencyButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
