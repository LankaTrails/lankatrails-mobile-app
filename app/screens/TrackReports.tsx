import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { Stack, useRouter } from "expo-router";
import BackButton from "@/components/BackButton";

const reports = [
  {
    id: "1",
    title: "Late Service Delivery",
    description: "The service was delayed by 2 hours.",
    status: "Resolved",
    action: "Admin has apologized and provided compensation.",
    date: "2025-08-18",
    images: ["https://via.placeholder.com/150", "https://via.placeholder.com/150"],
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
    images: ["https://via.placeholder.com/150"],
  },
];

export default function ReportAndIssueScreen() {
  const router = useRouter();

  const renderItem = ({ item }: any) => {
    const badgeColor =
      item.status === "Resolved"
        ? "bg-green-600"
        : item.status === "In Progress"
        ? "bg-yellow-600"
        : "bg-red-600";

    return (
      <TouchableOpacity
  onPress={() => router.push(`/screens/reportDetails/${item.id}` as any) } // match folder structure        className="mb-5 p-5 rounded-2xl shadow-md bg-white border border-gray-200"
      >
        <Text className="text-xl font-bold text-gray-900">{item.title}</Text>
        <Text className="text-base text-gray-700 mt-2 leading-relaxed">{item.description}</Text>
        <Text className="text-sm text-gray-500 mt-1">Reported on {item.date}</Text>

        <View className={`mt-4 self-start px-4 py-1.5 rounded-full ${badgeColor}`}>
          <Text className="text-white text-sm font-semibold">{item.status}</Text>
        </View>

        <View className="mt-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <Text className="text-base text-gray-800">
            <Text className="font-semibold text-gray-900">Admin Action: </Text>
            {item.action}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>
        {/* Header with Back Button */}
        <View className="flex-row items-center px-4 py-5 mt-12 border-b border-gray-200 bg-white">
          <BackButton />
          <Text className="text-2xl font-bold text-gray-900 ml-4">My Reports & Issues</Text>
        </View>

        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
          ListEmptyComponent={
            <Text className="text-center text-gray-500 mt-10">
              No reports or issues found.
            </Text>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
});
