import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
    SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

interface CancelRequest {
  id: string;
  bookingId: string;
  hotelName: string;
  checkInDate: string;
  checkOutDate: string;
  guestName: string;
  roomType: string;
  cancellationReason: string;
  requestDate: string;
  status: "pending" | "approved" | "cancelled";
  refundAmount: number;
  originalAmount: number;
}

const mockCancelRequests: CancelRequest[] = [
  {
    id: "CR001",
    bookingId: "BK001",
    hotelName: "Shangri-La Hotel, Colombo",
    checkInDate: "2024-08-15",
    checkOutDate: "2024-08-18",
    guestName: "John Smith",
    roomType: "Deluxe Room",
    cancellationReason: "Medical emergency",
    requestDate: "2024-08-10",
    status: "pending",
    refundAmount: 45000,
    originalAmount: 50000,
  },
  {
    id: "CR002",
    bookingId: "BK002",
    hotelName: "Cinnamon Grand Colombo",
    checkInDate: "2024-08-20",
    checkOutDate: "2024-08-23",
    guestName: "Sarah Johnson",
    roomType: "Superior Room",
    cancellationReason: "Change of plans",
    requestDate: "2024-08-12",
    status: "approved",
    refundAmount: 32000,
    originalAmount: 40000,
  },
  {
    id: "CR003",
    bookingId: "BK003",
    hotelName: "Galle Face Hotel",
    checkInDate: "2024-08-25",
    checkOutDate: "2024-08-28",
    guestName: "Michael Brown",
    roomType: "Ocean View Suite",
    cancellationReason: "Work commitments",
    requestDate: "2024-08-14",
    status: "cancelled",
    refundAmount: 0,
    originalAmount: 75000,
  },
  {
    id: "CR004",
    bookingId: "BK004",
    hotelName: "Heritance Kandalama",
    checkInDate: "2024-08-30",
    checkOutDate: "2024-09-02",
    guestName: "Emily Davis",
    roomType: "Deluxe Room",
    cancellationReason: "Weather concerns",
    requestDate: "2024-08-16",
    status: "pending",
    refundAmount: 28000,
    originalAmount: 35000,
  },
  {
    id: "CR005",
    bookingId: "BK005",
    hotelName: "Jetwing Vil Uyana",
    checkInDate: "2024-09-05",
    checkOutDate: "2024-09-08",
    guestName: "David Wilson",
    roomType: "Water Dwelling",
    cancellationReason: "Family emergency",
    requestDate: "2024-08-18",
    status: "approved",
    refundAmount: 48000,
    originalAmount: 60000,
  },
];

export default function CancelRequestsPage() {
  const filteredRequests = mockCancelRequests;


  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "#FFA500";
      case "approved": return "#22C55E";
      case "cancelled": return "#EF4444";
      default: return "#6B7280";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "pending": return "#FFF7ED";
      case "approved": return "#F0FDF4";
      case "cancelled": return "#FEF2F2";
      default: return "#F3F4F6";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString()}`;
  };


  const renderCancelRequest = ({ item }: { item: CancelRequest }) => (
    <View style={styles.requestCard}>
      <View style={styles.cardHeader}>
        <View style={styles.hotelInfo}>
          <Text style={styles.hotelName}>{item.hotelName}</Text>
          <Text style={styles.bookingId}>Booking ID: {item.bookingId}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusBgColor(item.status) }
        ]}>
          <Text style={[
            styles.statusText,
            { color: getStatusColor(item.status) }
          ]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.row}>
          <View style={styles.infoItem}>
            <Icon name="person-outline" size={16} color="#6B7280" />
            <Text style={styles.infoText}>{item.guestName}</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="bed-outline" size={16} color="#6B7280" />
            <Text style={styles.infoText}>{item.roomType}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.infoItem}>
            <Icon name="calendar-outline" size={16} color="#6B7280" />
            <Text style={styles.infoText}>
              {formatDate(item.checkInDate)} - {formatDate(item.checkOutDate)}
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.infoItem}>
            <Icon name="time-outline" size={16} color="#6B7280" />
            <Text style={styles.infoText}>
              Requested: {formatDate(item.requestDate)}
            </Text>
          </View>
        </View>
    
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.viewButton}>
          <Icon name="eye-outline" size={16} color="#008080" />
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Cancel Requests</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <FlatList
          data={mockCancelRequests}
          renderItem={renderCancelRequest}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContainer: {
    flex: 1,
    padding: 14,
    paddingBottom: 60,
    marginBottom: 80,
  },
   header: {
    marginTop: 80,
    paddingLeft: 24,
    paddingRight: 14,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: '#f9fafb',
    paddingBottom: 10,
  },
  heading: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1f2937",
  },

  list: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  listContent: {
    padding: 2,
  },
  requestCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,

    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  hotelInfo: {
    flex: 1,
  },
  hotelName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  bookingId: {
    fontSize: 14,
    color: "#6B7280",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  cardContent: {
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  infoText: {
    fontSize: 14,
    color: "#374151",
    marginLeft: 6,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 12,
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewButtonText: {
    fontSize: 14,
    color: "#008080",
    fontWeight: "600",
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
});