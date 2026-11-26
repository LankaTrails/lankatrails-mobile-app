import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
} from "react-native";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import BackButton from "@/components/BackButton";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  type NotificationPreferences,
} from "@/services/preferencesService";

type Channel = Exclude<keyof NotificationPreferences, "notificationsEnabled">;

const CHANNELS: { key: Channel; title: string; description: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "pushNotifications", title: "Push", description: "Booking updates, trip invites and chat messages", icon: "phone-portrait-outline" },
  { key: "emailNotifications", title: "Email", description: "Booking receipts, complaint updates and account notices", icon: "mail-outline" },
  { key: "smsNotifications", title: "SMS", description: "Time-critical booking reminders", icon: "chatbox-ellipses-outline" },
];

export default function NotificationSettings() {
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getNotificationPreferences()
      .then(setPrefs)
      .catch(() => setLoadError(true));
  }, []);

  // Optimistic update; the previous values come back if the server rejects the change
  const save = async (changes: Partial<NotificationPreferences>) => {
    if (!prefs) return;
    const previous = prefs;
    setPrefs({ ...prefs, ...changes });
    setSaving(true);
    try {
      await updateNotificationPreferences(changes);
    } catch {
      setPrefs(previous);
      Alert.alert("Not saved", "Your notification settings could not be saved. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <BackButton />
          </View>
          <Text style={styles.heading}>Notification Settings</Text>
          <View style={styles.headerRight}>
            {saving && <ActivityIndicator size="small" color="#008080" />}
          </View>
        </View>

        {!prefs ? (
          <View style={styles.centered}>
            {loadError ? (
              <Text style={styles.infoText}>Could not load your settings. Check your connection and try again.</Text>
            ) : (
              <ActivityIndicator size="large" color="#008080" />
            )}
          </View>
        ) : (
          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.mainToggleContainer}>
              <View style={styles.mainToggleContent}>
                <Ionicons name="notifications-outline" size={24} color="#008080" />
                <View style={styles.mainToggleText}>
                  <Text style={styles.settingTitle}>Notifications</Text>
                  <Text style={styles.mainToggleDescription}>
                    Allow LankaTrails to contact you about your trips
                  </Text>
                </View>
                <Switch
                  value={prefs.notificationsEnabled}
                  onValueChange={(value) => save({ notificationsEnabled: value })}
                  trackColor={{ false: "#e5e7eb", true: "#4ECDC4" }}
                  thumbColor="#008080"
                />
              </View>
            </View>

            <View style={styles.categoriesContainer}>
              {CHANNELS.map((channel) => {
                const enabled = prefs.notificationsEnabled && prefs[channel.key];
                return (
                  <View key={channel.key} style={styles.settingItem}>
                    <View style={styles.settingContent}>
                      <View style={styles.settingIcon}>
                        <Ionicons name={channel.icon} size={20} color="#008080" />
                      </View>
                      <View style={styles.settingText}>
                        <Text style={styles.settingTitle}>{channel.title}</Text>
                        <Text style={styles.settingDescription}>{channel.description}</Text>
                      </View>
                      <Switch
                        value={enabled}
                        disabled={!prefs.notificationsEnabled}
                        onValueChange={(value) => save({ [channel.key]: value })}
                        trackColor={{ false: "#e5e7eb", true: "#4ECDC4" }}
                        thumbColor={enabled ? "#008080" : "#9ca3af"}
                      />
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={styles.infoSection}>
              <View style={styles.infoCard}>
                <Ionicons name="information-circle-outline" size={20} color="#6b7280" />
                <Text style={styles.infoText}>
                  Settings are saved to your account. Security and account notices may still be sent by email.
                </Text>
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
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
