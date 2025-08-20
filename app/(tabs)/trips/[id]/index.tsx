import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import BackButton from "../../../../components/BackButton";
import FilterButton from "../../../../components/FilterButton";
import HeaderButton from "../../../../components/HeaderButton";
import FloatingActionButton from "../../../../components/OptionsButton";
import QRCodeModal from "../../../../components/QRCodeModal";
import SummaryCard from "../../../../components/SummaryCard";
import TripDetailsModal, {
  TripDetails as TripDetailsType,
} from "../../../../components/TripDetailsModal";
import BookingsView from "./BookingsView";
import ScheduleView from "./ScheduleView";

const prefix = Linking.createURL("/");

interface Service {
  id: string;
  name: string;
  description: string;
  time: string;
  duration: string;
  cost: number;
  location: string;
  weather?: "sunny" | "cloudy" | "rainy";
}

interface TripDay {
  date: string;
  dayName: string;
  services: Service[];
  weather: "sunny" | "cloudy" | "rainy";
}

import {
  generateTripInvitation,
  getTripById,
  getTripItemsByTripId,
} from "@/services/tripService";
import { TripInvitationRequest } from "@/types/triptypes";

const TripDetails = () => {
  const tripID = useLocalSearchParams().id as string;
  const [viewMode, setViewMode] = useState<"schedule" | "bookings">("schedule");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [currentInvitationLink, setCurrentInvitationLink] =
    useState<string>("");
  const [currentInvitationRole, setCurrentInvitationRole] =
    useState<string>("");
  const [currentInvitationType, setCurrentInvitationType] =
    useState<string>("");
  const [trip, setTrip] = useState<any>(null);
  const [tripDays, setTripDays] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Animation for header hide/show
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);

  // Header animation based on scroll direction
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const currentScrollY = event.nativeEvent.contentOffset.y;
        const scrollDelta = currentScrollY - lastScrollY.current;
        if (currentScrollY > 150) {
          if (scrollDelta > 5 && currentScrollY > lastScrollY.current) {
            Animated.timing(headerTranslateY, {
              toValue: -100,
              duration: 200,
              useNativeDriver: true,
            }).start();
          } else if (scrollDelta < -5 && currentScrollY < lastScrollY.current) {
            Animated.timing(headerTranslateY, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }).start();
          }
        } else {
          Animated.timing(headerTranslateY, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
        lastScrollY.current = currentScrollY;
      },
    }
  );

  // Trip details state for the SummaryCard
  const [tripDetails, setTripDetails] = useState<TripDetailsType>({
    budget: "45000",
    startDate: new Date("2024-06-22"),
    endDate: new Date("2024-06-26"),
    currency: "LKR",
    distance: "120km",
    title: "Galle Adventure",
    numberOfAdults: 2,
    numberOfChildren: 1,
  });

  // Fetch trip and trip days from API or hardcoded
  React.useEffect(() => {
    const fetchTrip = async () => {
      setLoading(true);
      setError(null);
      try {
        if (tripID === "hardcoded") {
          // Use the same hardcoded trip as ScheduleView
          const hardcodedTrip = {
            tripId: 999,
            tripName: "Sample Adventure",
            days: [
              {
                date: "2025-07-22",
                dayName: "Tuesday",
                weather: "sunny",
                services: [
                  {
                    id: "1",
                    name: "Sigiriya Rock Climb",
                    description: "Climb the famous Sigiriya Rock Fortress",
                    time: "08:00",
                    duration: "2 hours",
                    cost: 2500,
                    location: "Sigiriya",
                    weather: "sunny",
                  },
                  {
                    id: "2",
                    name: "Village Lunch",
                    description: "Traditional lunch in a local village",
                    time: "12:30",
                    duration: "1 hour",
                    cost: 1200,
                    location: "Habarana",
                    weather: "sunny",
                  },
                ],
              },
              {
                date: "2025-07-23",
                dayName: "Wednesday",
                weather: "cloudy",
                services: [
                  {
                    id: "3",
                    name: "Safari at Minneriya",
                    description: "Wildlife safari in Minneriya National Park",
                    time: "15:00",
                    duration: "3 hours",
                    cost: 3500,
                    location: "Minneriya",
                    weather: "cloudy",
                  },
                ],
              },
            ],
          };
          setTrip(hardcodedTrip);
          setTripDays(hardcodedTrip.days);
        } else {
          const tripRes = await getTripById(Number(tripID));
          if (tripRes.success && tripRes.data) {
            setTrip(tripRes.data);
            // Fetch trip items and group by day
            const itemsRes = await getTripItemsByTripId(Number(tripID));
            if (itemsRes.success && itemsRes.data) {
              // Group items by date (assuming item has startTime)
              const grouped: { [date: string]: any } = {};
              itemsRes.data.forEach((item: any) => {
                const date = item.startTime.split("T")[0];
                if (!grouped[date]) {
                  grouped[date] = {
                    date,
                    dayName: new Date(date).toLocaleDateString("en-US", {
                      weekday: "long",
                    }),
                    weather: "sunny",
                    services: [],
                  };
                }
                grouped[date].services.push({
                  id:
                    item.service?.serviceId?.toString() ||
                    item.place?.placeId?.toString() ||
                    item.id?.toString() ||
                    "",
                  name:
                    item.service?.serviceName ||
                    item.place?.placeName ||
                    "Unknown",
                  description:
                    item.service?.description || item.place?.description || "",
                  time: item.startTime
                    ? item.startTime.split("T")[1]?.slice(0, 5)
                    : "",
                  duration: item.duration || "",
                  cost: item.price || 0,
                  location:
                    item.service?.locationBased?.city ||
                    item.place?.location?.city ||
                    "",
                  weather: "sunny",
                });
              });
              setTripDays(Object.values(grouped));
            } else {
              setTripDays([]);
            }
          } else {
            setError("Trip not found");
          }
        }
      } catch (err) {
        setError("Failed to load trip");
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [tripID]);

  const tabs = ["Schedule", "Bookings"];

  const TabNavigation = () => (
    <View style={styles.tabContainer}>
      {tabs.map((tab) => (
        <FilterButton
          key={tab}
          filter={tab}
          isActive={viewMode === tab.toLowerCase()}
          onPress={() =>
            setViewMode(tab.toLowerCase() as "schedule" | "bookings")
          }
        />
      ))}
    </View>
  );

  // Header/modal handlers (restored)
  const handleEdit = () => setShowEditModal(true);

  const handleShare = async () => {
    try {
      if (!trip?.tripId) {
        Alert.alert("Error", "Trip not found");
        return;
      }

      // First, ask user what type of invitation they want to create
      Alert.alert(
        "Invitation Type",
        "What type of invitation do you want to create?\n\n• Individual: Single-use invitation for one person\n• Group: Reusable invitation link for multiple people",
        [
          {
            text: "Individual Invitation",
            onPress: () => selectRole(false),
          },
          {
            text: "Group Invitation",
            onPress: () => selectRole(true),
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
    } catch (error: any) {
      console.error("Failed to show invitation type selection:", error);
      Alert.alert("Error", "Failed to initiate invitation process");
    }
  };

  const selectRole = (isGroupInvitation: boolean) => {
    // Second, ask user what role they want to assign to the invitee(s)
    const invitationType = isGroupInvitation ? "group" : "individual";
    Alert.alert(
      "Invitation Role",
      `What role should the invited ${
        isGroupInvitation ? "people" : "person"
      } have?\n\n• Member: Can view and join trip\n• Editor: Can modify trip details\n• Admin: Full trip management access`,
      [
        {
          text: "Member (View Only)",
          onPress: () => generateInvitation("MEMBER", isGroupInvitation),
        },
        {
          text: "Editor (Can Modify)",
          onPress: () => generateInvitation("EDITOR", isGroupInvitation),
        },
        {
          text: "Admin (Full Access)",
          onPress: () => generateInvitation("ADMIN", isGroupInvitation),
        },
        {
          text: "Back",
          onPress: () => handleShare(), // Go back to invitation type selection
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };
  const generateInvitation = async (
    role: "MEMBER" | "EDITOR" | "ADMIN",
    isGroupInvitation: boolean
  ) => {
    try {
      setLoading(true);

      // Prepare invitation data
      const invitationData: TripInvitationRequest = {
        tripId: Number(tripID),
        role: role,
        isGroupInvitation: isGroupInvitation,
      };

      const response = await generateTripInvitation(
        Number(tripID),
        invitationData
      );

      if (response.success && response.data) {
        const invitationToken = response.data;
        // const invitationLink = `https://lankatrails.app/invite/${invitationToken}`;
        // const invitationLink = `lankatrailsmobileapp://invite/${invitationToken}`;
        const invitationLink = `${prefix}invite/${invitationToken}`;

        // Show options to user
        const invitationType = isGroupInvitation ? "group" : "individual";
        Alert.alert(
          "Share Trip Invitation",
          `Share this ${invitationType} ${role.toLowerCase()} invitation for "${
            trip?.tripName || tripDetails.title
          }":`,
          [
            {
              text: "Show QR Code",
              onPress: () => {
                setCurrentInvitationLink(invitationLink);
                setCurrentInvitationRole(role);
                setCurrentInvitationType(invitationType);
                setShowQRModal(true);
              },
            },
            {
              text: "Copy Link",
              onPress: async () => {
                try {
                  await Clipboard.setStringAsync(invitationLink);
                  Alert.alert(
                    "Success",
                    "Invitation link copied to clipboard!"
                  );
                } catch (error) {
                  console.error("Error copying to clipboard:", error);
                  Alert.alert("Error", "Failed to copy invitation link");
                }
              },
            },
            {
              text: "Share",
              onPress: async () => {
                try {
                  const inviteMessage = isGroupInvitation
                    ? `You're invited to join our trip "${
                        trip?.tripName || tripDetails.title
                      }" with ${role.toLowerCase()} access! This group invitation can be used by multiple people. Click this link to join: ${invitationLink}`
                    : `You're invited to join our trip "${
                        trip?.tripName || tripDetails.title
                      }" with ${role.toLowerCase()} access! Click this link to join: ${invitationLink}`;

                  await Share.share({
                    message: inviteMessage,
                    title: `Join ${trip?.tripName || tripDetails.title}`,
                  });
                } catch (error) {
                  console.error("Error sharing:", error);
                  Alert.alert("Error", "Failed to share invitation link");
                }
              },
            },
            {
              text: "Cancel",
              style: "cancel",
            },
          ]
        );
      } else {
        throw new Error(response.message || "Failed to generate invitation");
      }
    } catch (error: any) {
      console.error("Failed to generate trip invitation:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to generate invitation link";
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Trip",
      `Are you sure you want to delete "${
        trip?.tripName || tripDetails.title
      }"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // Implement delete functionality
            console.log("Deleting trip:", trip?.tripName || tripDetails.title);
            // You would call your delete API here
          },
        },
      ]
    );
  };
  const handleEditModalClose = () => setShowEditModal(false);
  const handleEditModalConfirm = (updatedDetails: TripDetailsType) => {
    setTripDetails(updatedDetails);
    setShowEditModal(false);
  };

  const renderCurrentView = () => {
    switch (viewMode) {
      case "schedule":
        return <ScheduleView />;
      case "bookings":
        return <BookingsView />;
      default:
        return <ScheduleView />;
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <Animated.View
          style={[
            styles.header,
            {
              transform: [{ translateY: headerTranslateY }],
            },
          ]}
        >
          <BackButton />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>
              {trip?.tripName || tripDetails.title}
            </Text>
          </View>
          <HeaderButton
            tripId={tripID}
            tripTitle={trip?.tripName || tripDetails.title}
            onEdit={handleEdit}
            onShare={handleShare}
            onDelete={handleDelete}
          />
        </Animated.View>

        <ScrollView
          style={styles.content}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <SummaryCard
            tripDetails={{
              ...tripDetails,
              ...(trip && {
                title: trip.tripName || tripDetails.title,
                startDate: trip.startDate
                  ? new Date(trip.startDate)
                  : tripDetails.startDate,
                endDate: trip.endDate
                  ? new Date(trip.endDate)
                  : tripDetails.endDate,
                budget: trip.budget ? String(trip.budget) : tripDetails.budget,
                currency: trip.currency || tripDetails.currency,
                distance: trip.distance || tripDetails.distance,
                numberOfAdults:
                  trip.numberOfAdults ?? tripDetails.numberOfAdults,
                numberOfChildren:
                  trip.numberOfChildren ?? tripDetails.numberOfChildren,
              }),
            }}
          />

          <TabNavigation />

          <View style={styles.viewContainer}>{renderCurrentView()}</View>
        </ScrollView>

        {/* Floating Action Button positioned absolutely */}
      </SafeAreaView>
      <View style={styles.fabContainer}>
        <FloatingActionButton />
      </View>

      <TripDetailsModal
        visible={showEditModal}
        onClose={handleEditModalClose}
        onConfirm={handleEditModalConfirm}
        initialDetails={tripDetails}
        isEditing={true}
      />

      <QRCodeModal
        visible={showQRModal}
        onClose={() => setShowQRModal(false)}
        invitationLink={currentInvitationLink}
        tripName={trip?.tripName || tripDetails.title}
        role={currentInvitationRole}
        invitationType={currentInvitationType}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 15,
    paddingVertical: 16,
    paddingTop: 50, // Add extra padding for status bar
    flexDirection: "row",
    borderRadius: 30,
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 1000,
  },
  headerText: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  headerRightSpace: {
    width: 56, // Same width as the FAB to center the title properly
  },
  content: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 50, // Add padding to account for fixed header
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 24,
  },
  viewContainer: {
    flex: 1,
    minHeight: 400,
    marginBottom: 80, // Add margin to prevent content from being hidden behind FAB
  },
  comingSoonContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  comingSoonContent: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  comingSoonIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
    textAlign: "center",
  },
  comingSoonText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 280,
  },
  fabContainer: {
    position: "absolute",
    bottom: 30,
    right: 20,
    zIndex: 1000,
  },
});

export default TripDetails;
