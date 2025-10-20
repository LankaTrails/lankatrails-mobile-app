import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import BackButton from "@/components/BackButton";
import { getMyComplaints } from "@/services/complaintService";
import { Complaint } from "../../types/complaint";

interface ExtendedComplaint extends Complaint {
  expanded: boolean;
}

export default function ReportsAndIssues() {
  const router = useRouter();
  const [issues, setIssues] = useState<ExtendedComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComplaints = async () => {
    try {
      setError(null);
      const response = await getMyComplaints();
      if (response.success && response.data) {
        const complaintsWithExpanded = response.data.map(complaint => ({
          ...complaint,
          expanded: false,
        }));
        setIssues(complaintsWithExpanded);
      } else {
        setError(response.message || "Failed to load complaints");
      }
    } catch (err: any) {
      console.error("Error fetching complaints:", err);
      setError(err.message || "An error occurred while loading complaints");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchComplaints();
  };

  const toggleIssue = (id: string) => {
    setIssues(prev =>
      prev.map(issue =>
        issue.complaintId === id ? { ...issue, expanded: !issue.expanded } : issue
      )
    );
  };

  const getStatusColor = (status?: string) => {
    if (!status) return "#6b7280"; // Default gray color for undefined/null status
    
    switch (status.toUpperCase()) {
      case "PENDING":
        return "#fbbf24";
      case "IN_PROGRESS":
      case "IN PROGRESS":
        return "#3b82f6";
      case "RESOLVED":
        return "#10b981";
      case "REJECTED":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const formatStatus = (status?: string) => {
    if (!status) return "Unknown"; // Default text for undefined/null status
    return status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown Date";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const createTitle = (description?: string) => {
    if (!description) return "Complaint";
    
    // Split by double newline to separate title from description (since the service combines them with \n\n)
    const parts = description.split('\n\n');
    if (parts.length > 1) {
      // If there are multiple parts, the first part is likely the title
      const title = parts[0].trim();
      // Limit title length for display
      return title.length > 60 ? title.substring(0, 60) + "..." : title;
    }
    
    // Fallback: create title from first line or first 60 characters
    const firstLine = description.split('\n')[0];
    const title = firstLine.length > 60 ? firstLine.substring(0, 60) + "..." : firstLine;
    return title || "Complaint";
  };

  const getDescriptionOnly = (description?: string) => {
    if (!description) return "No description provided";
    
    // Split by double newline to separate title from description
    const parts = description.split('\n\n');
    if (parts.length > 1) {
      // Return everything after the first part (the title)
      return parts.slice(1).join('\n\n').trim();
    }
    
    // If no title separator found, return the full description
    return description;
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <BackButton />
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.heading}>Reports & Issues</Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        <ScrollView 
          style={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#008080"]} />
          }
        >
          <TouchableOpacity
            onPress={() => router.push("/screens/complaints" as any)}
          >
            <View style={styles.welcomeSection}>
              <Ionicons name="alert-circle" size={40} color="#008080" />
              <Text style={styles.welcomeTitle}>Track Your Complaints</Text>
              <Text style={styles.welcomeDescription}>
                Here you can view all your reported issues and the actions taken by our support team.
              </Text>
            </View>
          </TouchableOpacity>

          {loading && (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#008080" />
              <Text style={styles.loadingText}>Loading complaints...</Text>
            </View>
          )}

          {error && !loading && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchComplaints}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {!loading && !error && issues.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color="#9ca3af" />
              <Text style={styles.emptyTitle}>No Complaints Yet</Text>
              <Text style={styles.emptyDescription}>
                You haven&apos;t submitted any complaints. If you face any issues, feel free to report them.
              </Text>
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={() => router.push("/screens/complaints" as any)}
              >
                <Text style={styles.submitButtonText}>Submit a Complaint</Text>
              </TouchableOpacity>
            </View>
          )}

          {!loading && !error && issues.length > 0 && (
            <View style={styles.reportSection}>
              <Text style={styles.sectionTitle}>My Reports ({issues.length})</Text>
              {issues.map(issue => (
                <View key={issue.complaintId} style={styles.issueCard}>
                  <TouchableOpacity
                    style={styles.issueHeader}
                    onPress={() => toggleIssue(issue.complaintId)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.issueTitle}>{createTitle(issue.description)}</Text>
                      <Text style={styles.issueDate}>{formatDate(issue.complaintDateTime)}</Text>
                      {issue.serviceName && (
                        <Text style={styles.serviceIdText}>Service: {issue.serviceName}</Text>
                      )}
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(issue.complaintStatus) },
                      ]}
                    >
                      <Text style={styles.statusText}>{formatStatus(issue.complaintStatus)}</Text>
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
                      <Text style={styles.issueDescription}>{getDescriptionOnly(issue.description)}</Text>
                      
                      {issue.complaintImgs && issue.complaintImgs.length > 0 && (
                        <View style={styles.imagesSection}>
                          <Text style={styles.imagesSectionTitle}>Attached Images:</Text>
                          <View style={styles.imagesList}>
                            {issue.complaintImgs.map((imageUrl: string, index: number) => (
                              <View key={index} style={styles.imageItem}>
                                <Ionicons name="image-outline" size={16} color="#008080" />
                                <Text style={styles.imageText}>Image {index + 1}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}

                      {issue.adminToTourist ? (
                        <View style={styles.adminAction}>
                          <Ionicons name="checkmark-done-outline" size={18} color="#10b981" />
                          <View style={{ marginLeft: 8, flex: 1 }}>
                            <Text style={styles.adminActionText}>
                              Admin Response ({formatDate(issue.complaintDateTime)})
                            </Text>
                            <Text style={styles.adminNote}>{issue.adminToTourist}</Text>
                          </View>
                        </View>
                      ) : (
                        <Text style={styles.noActionText}>
                          No admin response yet. Your complaint is being reviewed.
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
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
  issueHeader: { padding: 16, flexDirection: "row", alignItems: "center" },
  issueTitle: { fontSize: 16, fontWeight: "500", color: "#1f2937" },
  issueDate: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6 },
  statusText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  issueDetails: { padding: 16, borderTopWidth: 1, borderTopColor: "#f3f4f6" },
  issueDescription: { fontSize: 14, color: "#374151", marginBottom: 12 },
  adminAction: { flexDirection: "row", alignItems: "flex-start", marginTop: 12, backgroundColor: "#f0fdf4", padding: 12, borderRadius: 8 },
  adminActionText: { fontSize: 14, fontWeight: "500", color: "#1f2937" },
  adminNote: { fontSize: 13, color: "#6b7280", marginTop: 4 },
  noActionText: { fontSize: 13, color: "#9ca3af", fontStyle: "italic", marginTop: 8 },
  reportSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#1f2937", marginBottom: 16 },
  issueCard: { backgroundColor: "#ffffff", borderRadius: 12, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 48 },
  loadingText: { fontSize: 14, color: "#6b7280", marginTop: 12 },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 48, paddingHorizontal: 24 },
  errorText: { fontSize: 16, color: "#ef4444", textAlign: "center", marginTop: 12, marginBottom: 16 },
  retryButton: { backgroundColor: "#008080", paddingVertical: 10, paddingHorizontal: 24, borderRadius: 8 },
  retryButtonText: { color: "#ffffff", fontSize: 14, fontWeight: "600" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 48, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: "#1f2937", marginTop: 16 },
  emptyDescription: { fontSize: 14, color: "#6b7280", textAlign: "center", marginTop: 8, marginBottom: 24 },
  submitButton: { backgroundColor: "#008080", paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  submitButtonText: { color: "#ffffff", fontSize: 14, fontWeight: "600" },
  serviceIdText: { fontSize: 12, color: "#008080", marginTop: 2 },
  imagesSection: { marginTop: 12, padding: 12, backgroundColor: "#f3f4f6", borderRadius: 8 },
  imagesSectionTitle: { fontSize: 13, fontWeight: "600", color: "#1f2937", marginBottom: 8 },
  imagesList: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  imageItem: { flexDirection: "row", alignItems: "center", backgroundColor: "#ffffff", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 },
  imageText: { fontSize: 12, color: "#374151", marginLeft: 4 },
});
