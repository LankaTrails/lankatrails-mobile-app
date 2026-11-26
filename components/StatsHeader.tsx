import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "@/constants/theme";

interface StatsHeaderProps {
  trips: { status?: string }[];
}

const StatsHeader = ({ trips }: StatsHeaderProps) => (
  <View style={styles.statsContainer}>
    <View style={styles.statCard}>
      <Text style={styles.statNumber}>{trips.length}</Text>
      <Text style={styles.statLabel}>Total Trips</Text>
    </View>
    <View style={styles.statCard}>
      <Text style={styles.statNumber}>
        {trips.filter(t => t.status === "Completed").length}
      </Text>
      <Text style={styles.statLabel}>Completed</Text>
    </View>
    <View style={styles.statCard}>
      <Text style={styles.statNumber}>
        {trips.filter(t => t.status === "Upcoming").length}
      </Text>
      <Text style={styles.statLabel}>Upcoming</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.lightPrimary,
    paddingVertical: 16,
    marginHorizontal: 4,
    alignSelf: "center",
    height: 100,
    borderRadius: 20,
    marginTop: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  statNumber: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#111827",
  },
  statLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
});

export default StatsHeader;