import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
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
import TripSharingModal from "../../../../components/TripSharingModal";
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
  updateTrip,
  deleteTrip,
} from "@/services/tripService";
import { TripInvitationRequest, tripRequest } from "@/types/triptypes";

const TripDetails = () => {
  const tripID = useLocalSearchParams().id as string;
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"schedule" | "bookings">("schedule");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showSharingModal, setShowSharingModal] = useState(false);
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
    budget: "0",
    startDate: new Date(),
    endDate: new Date(),
    currency: "LKR",
    distance: "0km",
    title: "Loading...",
    numberOfAdults: 1,
    numberOfChildren: 0,
  });

  // Fetch trip and trip days from API
  React.useEffect(() => {
    const fetchTrip = async () => {
      setLoading(true);
      setError(null);
      try {
        // Validate tripID
        if (!tripID || isNaN(Number(tripID))) {
          setError("Invalid trip ID");
          return;
        }

        const tripRes = await getTripById(Number(tripID));
        if (tripRes.success && tripRes.data) {
          console.log('Trip data received:', JSON.stringify(tripRes.data, null, 2));
          setTrip(tripRes.data);

          // Update tripDetails state with real data (keep as fallback)
          const updatedTripDetails = {
            budget: tripRes.data.totalBudgetLimit?.toString() || "0", // Use budget limit
            startDate: tripRes.data.startDate ? new Date(tripRes.data.startDate) : new Date(),
            endDate: tripRes.data.endDate ? new Date(tripRes.data.endDate) : new Date(),
            currency: "LKR", // You can make this dynamic if currency is in the API
            distance: tripRes.data.totalDistance ? tripRes.data.totalDistance.toString() + "km" : "0km",
            title: tripRes.data.tripName || "Trip",
            numberOfAdults: tripRes.data.numberOfAdults || 1,
            numberOfChildren: tripRes.data.numberOfChildren || 0,
          };
          console.log('Setting tripDetails as fallback:', {
            ...updatedTripDetails,
            startDate: updatedTripDetails.startDate.toISOString(),
            endDate: updatedTripDetails.endDate.toISOString(),
          });
          setTripDetails(updatedTripDetails);

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
      } catch (err) {
        console.error('Error fetching trip:', err);
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

      setShowSharingModal(true);
    } catch (error: any) {
      console.error("Failed to show invitation type selection:", error);
      Alert.alert("Error", "Failed to initiate invitation process");
    }
  };

  const handleDelete = async () => {
    if (!trip?.tripId) {
      Alert.alert("Error", "Trip not found");
      return;
    }

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
          onPress: async () => {
            try {
              console.log("Deleting trip:", trip.tripId);
              const response = await deleteTrip(trip.tripId);
              
              if (response.success) {
                Alert.alert(
                  "Success", 
                  "Trip deleted successfully",
                  [
                    {
                      text: "OK",
                      onPress: () => {
                        // Navigate back to trips list
                        router.back();
                      }
                    }
                  ]
                );
              } else {
                Alert.alert("Error", response.message || "Failed to delete trip");
              }
            } catch (error: any) {
              console.error("Error deleting trip:", error);
              Alert.alert("Error", "Failed to delete trip. Please try again.");
            }
          },
        },
      ]
    );
  };
  const handleEditModalClose = () => setShowEditModal(false);
  const handleEditModalConfirm = async (updatedDetails: TripDetailsType) => {
    if (!trip || !tripID) return;

    try {
      setLoading(true);
      
      // Prepare the trip data for API call
      const tripUpdateData: tripRequest = {
        tripName: updatedDetails.title || trip.tripName,
        startDate: updatedDetails.startDate.toISOString().split('T')[0], // Convert to YYYY-MM-DD format
        endDate: updatedDetails.endDate.toISOString().split('T')[0], // Convert to YYYY-MM-DD format
        startLocation: trip.startLocation, // Keep existing start location
        locations: trip.locations || [], // Keep existing locations
        numberOfAdults: updatedDetails.numberOfAdults,
        numberOfChildren: updatedDetails.numberOfChildren,
        totalBudgetLimit: Number(updatedDetails.budget) || 0,
        // Keep existing budget breakdown values (use 0 as defaults since these might not exist in current Trip interface)
        totalBudget: trip.totalBudget || 0,
        totalDistance: trip.totalDistance || 0,
        accommodationLimit: (trip as any).accommodationLimit || 0,
        foodLimit: (trip as any).foodLimit || 0,
        transportLimit: (trip as any).transportLimit || 0,
        activityLimit: (trip as any).activityLimit || 0,
        shoppingLimit: (trip as any).shoppingLimit || 0,
        miscellaneousLimit: (trip as any).miscellaneousLimit || 0,
        tripStatus: trip.status || 'PLANNING',
        tags: trip.tags || [],
      };

      console.log('Updating trip with data:', tripUpdateData);
      
      // Call the API to update the trip
      const response = await updateTrip(Number(tripID), tripUpdateData);
      
      if (response.success && response.data) {
        // Update local state with the response from the API
        setTrip(response.data);
        
        // Update tripDetails for fallback
        setTripDetails({
          ...updatedDetails,
          title: response.data.tripName,
        });
        
        console.log('Trip updated successfully:', response.data);
        Alert.alert("Success", "Trip updated successfully!");
      } else {
        Alert.alert("Error", response.message || "Failed to update trip");
      }
    } catch (error: any) {
      console.error('Error updating trip:', error);
      Alert.alert("Error", "Failed to update trip. Please try again.");
    } finally {
      setLoading(false);
      setShowEditModal(false);
    }
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
            <Text
              style={[
                styles.headerTitle,
                // Dynamically adjust font size based on title length
                (trip?.tripName || tripDetails.title).length > 15 &&
                  styles.headerTitleLong,
                (trip?.tripName || tripDetails.title).length > 25 &&
                  styles.headerTitleVeryLong,
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
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
            tripDetails={(() => {
              // Use trip data directly if available, otherwise fall back to tripDetails
              if (trip) {
                const finalTripDetails = {
                  title: trip.tripName || "Trip",
                  startDate: new Date(trip.startDate),
                  endDate: new Date(trip.endDate),
                  budget: trip.totalBudgetLimit?.toString() || "0", // Use budget limit for display
                  currency: "LKR",
                  distance: trip.totalDistance ? trip.totalDistance.toString() + "km" : "0km",
                  numberOfAdults: trip.numberOfAdults || 1,
                  numberOfChildren: trip.numberOfChildren || 0,
                };
                console.log('Final trip details passed to SummaryCard (from trip):', {
                  ...finalTripDetails,
                  startDate: finalTripDetails.startDate.toISOString(),
                  endDate: finalTripDetails.endDate.toISOString(),
                });
                return finalTripDetails;
              } else {
                console.log('Final trip details passed to SummaryCard (from tripDetails):', {
                  ...tripDetails,
                  startDate: tripDetails.startDate.toISOString(),
                  endDate: tripDetails.endDate.toISOString(),
                });
                return tripDetails;
              }
            })()}
          />

          <TabNavigation />

          <View style={styles.viewContainer}>{renderCurrentView()}</View>
        </ScrollView>

        {/* Floating Action Button positioned absolutely */}
      </SafeAreaView>
      <View style={styles.fabContainer}>
        <FloatingActionButton
          tripId={tripID}
          tripName={trip?.tripName || tripDetails.title}
        />
      </View>

      <TripDetailsModal
        visible={showEditModal}
        onClose={handleEditModalClose}
        onConfirm={handleEditModalConfirm}
        initialDetails={trip ? {
          title: trip.tripName || "Trip",
          budget: trip.totalBudgetLimit?.toString() || "0", // Use budget limit for editing
          startDate: new Date(trip.startDate),
          endDate: new Date(trip.endDate),
          currency: "LKR",
          distance: trip.totalDistance ? trip.totalDistance.toString() + "km" : "0km",
          numberOfAdults: trip.numberOfAdults || 1,
          numberOfChildren: trip.numberOfChildren || 0,
        } : tripDetails}
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

      <TripSharingModal
        visible={showSharingModal}
        onClose={() => setShowSharingModal(false)}
        tripId={Number(tripID)}
        tripName={trip?.tripName || tripDetails.title}
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
  headerTitleLong: {
    fontSize: 20,
  },
  headerTitleVeryLong: {
    fontSize: 16,
  },
  headerRightSpace: {
    width: 56, // Same width as the FAB to center the title properly
  },
  content: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 60, // Add padding to account for fixed header
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 24,
  },
  viewContainer: {
    flex: 1,
    minHeight: 400,
    marginBottom: 150, // Add margin to prevent content from being hidden behind FAB
  },
  fabContainer: {
    position: "absolute",
    bottom: 30,
    right: 20,
    zIndex: 1000,
  },
});

export default TripDetails;
