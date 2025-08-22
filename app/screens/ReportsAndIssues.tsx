import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import BackButton from "@/components/BackButton";

interface Issue {
  id: string;
  title: string;
  description: string;
  date: string;
  status: "Pending" | "In Review" | "Resolved" | "Rejected";
  adminActions: { action: string; date: string; note?: string }[];
  expanded: boolean;
}

export default function ReportsAndIssues() {
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([
    {
      id: "1",
      title: "Payment failed on booking #123",
      description: "I tried to pay with Visa but transaction failed.",
      date: "2025-08-10",
      status: "Resolved",
      adminActions: [
        { action: "Refund issued", date: "2025-08-12", note: "Refund sent to your card" },
      ],
      expanded: false,
    },
    {
      id: "2",
      title: "Tour guide did not show up",
      description: "My tour guide was late for 2 hours.",
      date: "2025-08-14",
      status: "In Review",
      adminActions: [
        { action: "Under investigation", date: "2025-08-15", note: "We are contacting the guide" },
      ],
      expanded: false,
    },
    {
      id: "3",
      title: "Hotel booking mismatch",
      description: "I booked a deluxe room, but got a standard room.",
      date: "2025-08-18",
      status: "Pending",
      adminActions: [],
      expanded: false,
    },
    {
      id: "4",
      title: "Unresponsive customer support",
      description: "I couldn't reach support during my trip.",
      date: "2025-08-20",
      status: "Rejected",
      adminActions: [
        { action: "Reviewed", date: "2025-08-21", note: "We couldn’t verify the issue" },
      ],
      expanded: false,
    },
  ]);

  const toggleIssue = (id: string) => {
    setIssues(prev =>
      prev.map(issue =>
        issue.id === id ? { ...issue, expanded: !issue.expanded } : issue
      )
    );
  };

  const getStatusColor = (status: Issue["status"]) => {
    switch (status) {
      case "Pending":
        return "#fbbf24"; // Yellow
      case "In Review":
        return "#3b82f6"; // Blue
      case "Resolved":
        return "#10b981"; // Green
      case "Rejected":
        return "#ef4444"; // Red
      default:
        return "#6b7280";
    }
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
            <Text style={styles.heading}>Reports & Issues</Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Welcome Section */}
          <TouchableOpacity
            onPress={() => router.push("/screens/TrackReports" as any)}
          >
            <View style={styles.welcomeSection}>
              <Ionicons name="alert-circle" size={40} color="#008080" />
              <Text style={styles.welcomeTitle}>Track Your Complaints</Text>
              <Text style={styles.welcomeDescription}>
                Here you can view all your reported issues and the actions taken by our support team.
              </Text>
            </View>
          </TouchableOpacity>

          {/* Quick Actions */}
          <View style={styles.quickActionsSection}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity style={styles.quickActionItem}>
                <Ionicons name="create-outline" size={24} color="#008080" />
                <Text style={styles.quickActionText}>New Report</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionItem}
                onPress={() => router.push("/screens/TrackReports" as any)}>
                <Ionicons name="time-outline" size={24} color="#008080" />
                <Text style={styles.quickActionText}>Track Reports</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* My Reports */}
          <View style={styles.reportSection}>
            <Text style={styles.sectionTitle}>My Reports</Text>
            {issues.map(issue => (
              <View key={issue.id} style={styles.issueCard}>
                <TouchableOpacity
                  style={styles.issueHeader}
                  onPress={() => toggleIssue(issue.id)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.issueTitle}>{issue.title}</Text>
                    <Text style={styles.issueDate}>{issue.date}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(issue.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>{issue.status}</Text>
                  </View>
                  <Ionicons
                    name={issue.expanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#008080"
                    style={{ marginLeft: 8 }}
                  />
                </TouchableOpacity>

                {issue.expanded && (
                  <View style={styles.issueDetails}>
                    <Text style={styles.issueDescription}>{issue.description}</Text>
                    {issue.adminActions.length > 0 ? (
                      issue.adminActions.map((action, index) => (
                        <View key={index} style={styles.adminAction}>
                          <Ionicons name="checkmark-done-outline" size={18} color="#10b981" />
                          <View style={{ marginLeft: 8 }}>
                            <Text style={styles.adminActionText}>
                              {action.action} ({action.date})
                            </Text>
                            {action.note && (
                              <Text style={styles.adminNote}>{action.note}</Text>
                            )}
                          </View>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noActionText}>
                        No admin action has been taken yet.
                      </Text>
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: {
    marginTop: 60,
    marginBottom: 20,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: { flex: 1, alignItems: "flex-start" },
  headerCenter: { flex: 2, alignItems: "center" },
  headerRight: { flex: 1 },
  heading: { fontSize: 20, fontWeight: "700", color: "#1f2937" },
  scrollContainer: { flex: 1, paddingHorizontal: 16 },
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
  welcomeTitle: { fontSize: 20, fontWeight: "600", color: "#1f2937", marginTop: 12, marginBottom: 8 },
  welcomeDescription: { fontSize: 14, color: "#6b7280", textAlign: "center" },
  quickActionsSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#1f2937", marginBottom: 16, marginLeft: 4 },
  quickActionsGrid: { flexDirection: "row", justifyContent: "space-between" },
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
  quickActionText: { fontSize: 14, fontWeight: "500", color: "#1f2937", marginTop: 8, textAlign: "center" },
  reportSection: { marginBottom: 24 },
  issueCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  issueHeader: { padding: 16, flexDirection: "row", alignItems: "center" },
  issueTitle: { fontSize: 16, fontWeight: "500", color: "#1f2937" },
  issueDate: { fontSize: 12, color: "#6b7280" },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6 },
  statusText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  issueDetails: { padding: 16, borderTopWidth: 1, borderTopColor: "#f3f4f6" },
  issueDescription: { fontSize: 14, color: "#374151", marginBottom: 12 },
  adminAction: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  adminActionText: { fontSize: 14, fontWeight: "500", color: "#1f2937" },
  adminNote: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  noActionText: { fontSize: 13, color: "#9ca3af", fontStyle: "italic" },
});
