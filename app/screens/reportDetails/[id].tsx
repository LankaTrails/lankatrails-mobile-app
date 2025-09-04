import { View, Text, ScrollView, Image, StyleSheet } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import BackButton from "@/components/BackButton";

const reports = [
  {
    id: "1",
    title: "Late Service Delivery",
    description: "The service was delayed by 2 hours.",
    status: "Resolved",
    action: "Admin has apologized and provided compensation.",
    date: "2025-08-18",
    images: ["https://via.placeholder.com/300", "https://via.placeholder.com/300"],
  },
  {
    id: "2",
    title: "Poor Communication",
    description: "No updates were given during the process.",
    status: "In Progress",
    action: "Admin is reviewing this complaint.",
    date: "2025-08-20",
    images: [],
  },
  {
    id: "3",
    title: "Incorrect Billing",
    description: "Charged extra than the agreed price.",
    status: "Pending",
    action: "Waiting for admin response.",
    date: "2025-08-21",
    images: ["https://via.placeholder.com/300"],
  },
];

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams();
  const report = reports.find((r) => r.id === id);

  if (!report) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFoundText}>Report not found</Text>
      </View>
    );
  }

  const badgeColor =
    report.status === "Resolved"
      ? "#22c55e" // green
      : report.status === "In Progress"
      ? "#facc15" // yellow
      : "#ef4444"; // red

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

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

      {/* Report Card */}
      <View style={styles.card}>
        <Text style={styles.title}>{report.title}</Text>
        <Text style={styles.description}>{report.description}</Text>
        <Text style={styles.date}>Reported on {report.date}</Text>

        <View style={[styles.statusBadge, { backgroundColor: badgeColor }]}>
          <Text style={styles.statusText}>{report.status}</Text>
        </View>

        <View style={styles.adminAction}>
          <Text style={styles.adminTitle}>Admin Action:</Text>
          <Text style={styles.adminDescription}>{report.action}</Text>
        </View>

        {report.images.length > 0 && (
          <View style={styles.imagesContainer}>
            <Text style={styles.imageLabel}>Attached Images</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {report.images.map((uri, index) => (
                <Image
                  key={index}
                  source={{ uri }}
                  style={styles.image}
                />
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6", // light gray background
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  notFoundText: {
    fontSize: 16,
    color: "#6b7280",
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
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginLeft: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  description: {
    fontSize: 16,
    color: "#374151",
    marginTop: 8,
    lineHeight: 22,
  },
  date: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 6,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  statusText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  adminAction: {
    marginTop: 16,
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 12,
  },
  adminTitle: {
    fontWeight: "600",
    fontSize: 16,
    color: "#111827",
    marginBottom: 4,
  },
  adminDescription: {
    fontSize: 14,
    color: "#374151",
  },
  imagesContainer: {
    marginTop: 16,
  },
  imageLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
  },
});
