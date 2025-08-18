import { createTrip, fetchAllCities } from "@/services/tripService";
import {
  ApiResponse,
  Location,
  Trip,
  tripRequest,
  TripTagType,
} from "@/types/triptypes";
import { BlurView } from "expo-blur";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Animated, StyleSheet, View } from "react-native";
import DestinationModal from "./DestinationModal";
import PersonCountModal from "./PersonCountModal";
import StartLocationModal from "./StartLocationModal";
import TripDetailsModal, { TripDetails } from "./TripDetailsModal";
import TripNameModal from "./TripNameModal";

interface TripCreationFlowProps {
  visible: boolean;
  onClose: () => void;
  onTripCreated: (trip: Trip) => void;
}

export default function TripCreationFlow({
  visible,
  onClose,
  onTripCreated,
}: TripCreationFlowProps) {
  // Modal states
  const [showStartLocationModal, setShowStartLocationModal] = useState(false);
  const [showDestinationModal, setShowDestinationModal] = useState(false);
  const [showPersonCountModal, setShowPersonCountModal] = useState(false);
  const [showTripNameModal, setShowTripNameModal] = useState(false);
  const [showTripDetailsModal, setShowTripDetailsModal] = useState(false);

  // Trip data states
  const [startLocation, setStartLocation] = useState<Location | null>(null);
  const [selectedDestinations, setSelectedDestinations] = useState<Location[]>(
    []
  );
  const [selectedVibes, setSelectedVibes] = useState<TripTagType[]>([]);
  const [selectedDestination, setSelectedDestination] = useState("");
  const [numberOfAdults, setNumberOfAdults] = useState(1);
  const [numberOfChildren, setNumberOfChildren] = useState(0);
  const [suggestedTripName, setSuggestedTripName] = useState("");
  const [tripName, setTripName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Data from API
  const [cities, setCities] = useState<Location[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  // Available vibes from TripTagType (limited to 8 most popular)
  const availableVibes: TripTagType[] = [
    "ADVENTURE",
    "CULTURAL",
    "RELAXATION",
    "FAMILY",
    "ROMANTIC",
    "NATURE",
    "HISTORICAL",
    "LEISURE",
  ];

  // Animation
  const blurOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setShowStartLocationModal(true);
      // Fetch cities when the flow becomes visible
      loadCities();
      Animated.timing(blurOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      handleModalClose();
    }
  }, [visible]);

  const loadCities = async () => {
    if (cities.length > 0) return; // Don't reload if already loaded

    console.log("Loading cities...");
    setLoadingCities(true);
    try {
      const response = await fetchAllCities();
      console.log("Cities response:", response);
      if (response.success && response.data) {
        console.log("Cities loaded:", response.data.length, "cities");
        setCities(response.data);
      } else {
        console.error("Failed to fetch cities:", response.message);
        // Fallback to some sample cities for testing
        const fallbackCities: Location[] = [
          {
            formattedAddress: "Colombo, Western Province, Sri Lanka",
            city: "Colombo",
            district: "Colombo",
            province: "Western",
            country: "Sri Lanka",
            postalCode: "00100",
            latitude: 6.9271,
            longitude: 79.8612,
          },
          {
            formattedAddress: "Kandy, Central Province, Sri Lanka",
            city: "Kandy",
            district: "Kandy",
            province: "Central",
            country: "Sri Lanka",
            postalCode: "20000",
            latitude: 7.2906,
            longitude: 80.6337,
          },
          {
            formattedAddress: "Galle, Southern Province, Sri Lanka",
            city: "Galle",
            district: "Galle",
            province: "Southern",
            country: "Sri Lanka",
            postalCode: "80000",
            latitude: 6.0535,
            longitude: 80.221,
          },
        ];
        setCities(fallbackCities);
        console.log("Using fallback cities");
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
      // Fallback cities in case of network error
      const fallbackCities: Location[] = [
        {
          formattedAddress: "Colombo, Western Province, Sri Lanka",
          city: "Colombo",
          district: "Colombo",
          province: "Western",
          country: "Sri Lanka",
          postalCode: "00100",
          latitude: 6.9271,
          longitude: 79.8612,
        },
        {
          formattedAddress: "Kandy, Central Province, Sri Lanka",
          city: "Kandy",
          district: "Kandy",
          province: "Central",
          country: "Sri Lanka",
          postalCode: "20000",
          latitude: 7.2906,
          longitude: 80.6337,
        },
      ];
      setCities(fallbackCities);
      console.log("Using fallback cities due to error");
    } finally {
      setLoadingCities(false);
    }
  };

  const handleStartLocationSelect = (location: Location) => {
    setStartLocation(location);
    setShowStartLocationModal(false);
    setShowDestinationModal(true);
  };

  // Remove the problematic useEffect that was closing the flow immediately
  // useEffect(() => {
  //   const isAnyModalVisible =
  //     showDestinationModal || showTripNameModal || showTripDetailsModal;
  //   if (!isAnyModalVisible && visible) {
  //     // All modals closed, close the entire flow
  //     onClose();
  //   }
  // }, [
  //   showDestinationModal,
  //   showTripNameModal,
  //   showTripDetailsModal,
  //   visible,
  //   onClose,
  // ]);

  const handleDestinationSelect = (
    destinations: Location[],
    selectedVibes?: TripTagType[]
  ) => {
    setSelectedDestinations(destinations);
    setSelectedVibes(selectedVibes || []);

    const primaryDestination = destinations[0];

    // Format destination text with proper truncation for many destinations
    let destinationText;
    if (destinations.length === 1) {
      destinationText = primaryDestination.city;
    } else if (destinations.length <= 5) {
      destinationText =
        destinations.length === 2
          ? `${destinations[0].city} & ${destinations[1].city}`
          : `${destinations
              .slice(0, -1)
              .map((d) => d.city)
              .join(", ")} & ${destinations[destinations.length - 1].city}`;
    } else {
      const first5 = destinations.slice(0, 5);
      destinationText = `${first5.map((d) => d.city).join(", ")}...`;
    }

    setSelectedDestination(destinationText);

    // Generate suggested trip name based on primary destination
    const suggestions = [
      `${primaryDestination.city} Adventure`,
      `${primaryDestination.city} Explorer`,
      `${primaryDestination.city} Journey`,
      `${primaryDestination.city} Experience`,
      `Discover ${primaryDestination.city}`,
    ];
    setSuggestedTripName(
      suggestions[Math.floor(Math.random() * suggestions.length)]
    );

    // Transition to person count modal
    setTimeout(() => {
      setShowDestinationModal(false);
      setShowPersonCountModal(true);
    }, 250);
  };

  const handlePersonCountConfirm = (adults: number, children: number) => {
    setNumberOfAdults(adults);
    setNumberOfChildren(children);

    // Transition to trip name modal
    setTimeout(() => {
      setShowPersonCountModal(false);
      setShowTripNameModal(true);
    }, 250);
  };

  const handleTripNameConfirm = (name: string) => {
    setTripName(name);

    // Transition to trip details modal
    setTimeout(() => {
      setShowTripNameModal(false);
      setShowTripDetailsModal(true);
    }, 250);
  };

  const handleTripDetailsConfirm = async (details: TripDetails) => {
    setIsCreating(true);

    try {
      // Use selected destinations directly since they are already Location objects
      const locations: Location[] = selectedDestinations;

      // Ensure we have a start location
      if (!startLocation) {
        Alert.alert("Error", "Please select a start location first.");
        setIsCreating(false);
        return;
      }

      // Create trip request object
      const tripData: tripRequest = {
        tripName: tripName,
        startDate: details.startDate.toISOString(),
        endDate: details.endDate.toISOString(),
        startLocation: startLocation, // Use the selected start location
        locations: locations,
        numberOfAdults: details.numberOfAdults,
        numberOfChildren: details.numberOfChildren,
        tripStatus: "PLANNING",
        totalBudget: parseFloat(details.budget) || 0,
        totalBudgetLimit: parseFloat(details.budget) || 0,
        totalDistance: 0, // Will be calculated by backend
        accommodationLimit: 0, // Could be extended later
        foodLimit: 0,
        transportLimit: 0,
        activityLimit: 0,
        shoppingLimit: 0,
        miscellaneousLimit: 0,
        tags: selectedVibes.length > 0 ? selectedVibes : undefined, // Include selected vibes as tags
      };

      // Call the API service
      const response: ApiResponse<Trip> = await createTrip(tripData);

      if (response.success && response.data) {
        // Trip created successfully
        onTripCreated(response.data);
        handleModalClose();
        Alert.alert(
          "Trip Created!",
          `Your trip "${tripName}" has been created successfully.`,
          [{ text: "OK" }]
        );
      } else {
        throw new Error(response.message || "Failed to create trip");
      }
    } catch (error) {
      console.error("Error creating trip:", error);
      Alert.alert("Error", "Failed to create trip. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setIsCreating(false);
    }
  };

  const handleModalClose = () => {
    // Animate blur out
    Animated.timing(blurOpacity, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      // Reset all states
      setShowStartLocationModal(false);
      setShowDestinationModal(false);
      setShowPersonCountModal(false);
      setShowTripNameModal(false);
      setShowTripDetailsModal(false);
      setStartLocation(null);
      setSelectedDestinations([]);
      setSelectedVibes([]);
      setSelectedDestination("");
      setNumberOfAdults(1);
      setNumberOfChildren(0);
      setSuggestedTripName("");
      setTripName("");
      setIsCreating(false);
      // Close the entire flow
      onClose();
    });
  };

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Blur Overlay */}
      {(showDestinationModal ||
        showPersonCountModal ||
        showTripNameModal ||
        showTripDetailsModal) && (
        <Animated.View
          style={[
            styles.blurContainer,
            {
              opacity: blurOpacity,
            },
          ]}
          pointerEvents="none"
        >
          <BlurView intensity={50} style={StyleSheet.absoluteFill} />
        </Animated.View>
      )}

      <StartLocationModal
        visible={showStartLocationModal}
        onLocationSelect={handleStartLocationSelect}
        onClose={handleModalClose}
      />

      <DestinationModal
        visible={showDestinationModal}
        onClose={handleModalClose}
        onDestinationSelect={handleDestinationSelect}
        animateToTripNameHeight={!!selectedDestination}
        cities={cities}
        availableVibes={availableVibes}
        loadingCities={loadingCities}
      />

      <PersonCountModal
        visible={showPersonCountModal}
        onClose={handleModalClose}
        onConfirm={handlePersonCountConfirm}
        initialAdults={numberOfAdults}
        initialChildren={numberOfChildren}
      />

      <TripNameModal
        visible={showTripNameModal}
        destination={selectedDestination}
        suggestedName={suggestedTripName}
        onClose={handleModalClose}
        onCreateTrip={handleTripNameConfirm}
        startFromIntermediate={!!selectedDestination}
        animateToTripDetailsHeight={!!tripName}
      />

      <TripDetailsModal
        visible={showTripDetailsModal}
        onClose={handleModalClose}
        onConfirm={handleTripDetailsConfirm}
        tripTitle={tripName}
        startFromIntermediate={!!tripName}
        numberOfAdults={numberOfAdults}
        numberOfChildren={numberOfChildren}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  blurContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1001,
  },
});
