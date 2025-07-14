import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
} from "react-native";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import BackButton from "@/components/BackButton";

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  icon: keyof typeof Ionicons.glyphMap;
}

export default function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: "general",
      title: "General Notifications",
      description: "App updates, news, and important announcements",
      enabled: true,
      icon: "notifications",
    },
    {
      id: "bookings",
      title: "Booking Notifications",
      description: "Booking confirmations, reminders, and updates",
      enabled: true,
      icon: "calendar",
    },
    {
      id: "chat",
      title: "Chat Messages",
      description: "New messages and chat notifications",
      enabled: true,
      icon: "chatbubble",
    },
    {
      id: "reminders",
      title: "Trip Reminders",
      description: "Upcoming trip reminders and check-in alerts",
      enabled: true,
      icon: "alarm",
    },
    {
      id: "reviews",
      title: "Review Requests",
      description: "Requests to review your completed trips",
      enabled: true,
      icon: "star",
    },
  ]);

  const toggleSetting = (id: string) => {
    setSettings(prev => {
      const newSettings = prev.map(setting =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      );
      
      // Auto-save the settings immediately
      console.log("Auto-saving notification settings:", newSettings);
      // Here you would typically save to AsyncStorage or API
      
      return newSettings;
    });
  };

  const toggleAllSettings = (value: boolean) => {
    setSettings(prev => {
      const newSettings = prev.map(setting => ({ ...setting, enabled: value }));
      
      // Auto-save the settings immediately
      console.log("Auto-saving all notification settings:", newSettings);
      // Here you would typically save to AsyncStorage or API
      
      return newSettings;
    });
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
          <Text style={styles.heading}>Notification Settings</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Main Toggle */}
          <View style={styles.mainToggleContainer}>
            <View style={styles.mainToggleContent}>
              <Ionicons name="notifications-outline" size={24} color="#008080" />
              <View style={styles.mainToggleText}>
                <Text style={styles.settingTitle}>Push Notifications</Text>
                <Text style={styles.mainToggleDescription}>
                  Allow LankaTrails to send you notifications
                </Text>
              </View>
              <Switch
                value={settings.some(s => s.enabled)}
                onValueChange={toggleAllSettings}
                trackColor={{ false: "#e5e7eb", true: "#4ECDC4" }}
                thumbColor="#008080"
              />
            </View>
          </View>

          {/* Notification Categories */}
          <View style={styles.categoriesContainer}>
            
            {settings.map((setting) => (
              <View key={setting.id} style={styles.settingItem}>
                <View style={styles.settingContent}>
                  <View style={styles.settingIcon}>
                    <Ionicons name={setting.icon} size={20} color="#008080" />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>{setting.title}</Text>
                  </View>
                  <Switch
                    value={setting.enabled}
                    onValueChange={() => toggleSetting(setting.id)}
                    trackColor={{ false: "#e5e7eb", true: "#4ECDC4" }}
                    thumbColor={setting.enabled ? "#008080" : "#9ca3af"}
                  />
                </View>
              </View>
            ))}
          </View>


          {/* Info Section */}
          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <Ionicons name="information-circle-outline" size={20} color="#6b7280" />
              <Text style={styles.infoText}>
                You can manage these settings at any time. Some notifications may still be sent for important account and security updates.
              </Text>
            </View>
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
    alignItems: "center",
    position: "relative",
  },
  headerLeft: {
    flex: 1,
    alignItems: "flex-start",
    zIndex: 2,
  },
  headerRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    zIndex: 1,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  mainToggleContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mainToggleContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  mainToggleText: {
    flex: 1,
    marginLeft: 16,
  },
  mainToggleTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  mainToggleDescription: {
    fontSize: 14,
    color: "#6b7280",
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
    marginLeft: 4,
  },
  settingItem: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: "#6b7280",
  },
  additionalSettings: {
    marginBottom: 24,
  },
  infoSection: {
    marginBottom: 40,
  },
  infoCard: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
});
