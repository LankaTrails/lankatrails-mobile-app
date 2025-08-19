import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Location, TripTagType } from "../types/triptypes";
import LongButton from "./LongButton";

interface DestinationModalProps {
  visible: boolean;
  onClose: () => void;
  onDestinationSelect: (
    destinations: Location[],
    selectedVibes?: TripTagType[]
  ) => void;
  animateToTripNameHeight?: boolean;
  cities?: Location[];
  availableVibes?: TripTagType[];
  loadingCities?: boolean;
}

const DESTINATION_MODAL_HEIGHT = 0.7; // 70% of screen

export default function DestinationModal({
  visible,
  onClose,
  onDestinationSelect,
  animateToTripNameHeight = false,
  cities = [],
  availableVibes = [],
  loadingCities = false,
}: DestinationModalProps) {
  console.log("DestinationModal props:", {
    visible,
    citiesCount: cities.length,
    availableVibesCount: availableVibes.length,
    loadingCities,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVibes, setSelectedVibes] = useState<TripTagType[]>([]);
  const [selectedDestinations, setSelectedDestinations] = useState<Location[]>(
    []
  );
  const slideAnim = useRef(new Animated.Value(0)).current;
  const screenHeight = Dimensions.get("window").height;

  // Filter and sort destinations based on selected vibes and search query
  const getFilteredDestinations = () => {
    console.log("Filtering destinations. Cities available:", cities.length);
    console.log("Search query:", searchQuery);
    console.log("Loading cities:", loadingCities);

    let filtered = cities.filter(
      (city) =>
        city.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.formattedAddress.toLowerCase().includes(searchQuery.toLowerCase())
    );

    console.log("Filtered destinations:", filtered.length);

    // For now, we don't have vibe data in Location objects
    // TODO: Add vibe data to Location objects or create a separate endpoint
    // Just return filtered by search for now
    return filtered;
  };

  const filteredDestinations = getFilteredDestinations();

  const toggleVibe = (vibe: TripTagType) => {
    setSelectedVibes((prev) =>
      prev.includes(vibe) ? prev.filter((v) => v !== vibe) : [...prev, vibe]
    );
  };

  useEffect(() => {
    if (visible) {
      // Modal is opening - slide up from bottom
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Modal is closing
      if (animateToTripNameHeight) {
        // Animate to TripName modal height position - smoother transition
        Animated.timing(slideAnim, {
          toValue: 0.3, // Partial slide down to where TripName modal will appear
          duration: 250,
          useNativeDriver: true,
        }).start(() => {
          // Reset animation value for next time
          slideAnim.setValue(0);
        });
      } else {
        // Normal close - slide down completely
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    }
  }, [visible, animateToTripNameHeight, slideAnim, screenHeight]);

  const toggleDestination = (destination: Location) => {
    setSelectedDestinations((prev) =>
      prev.some((d) => d.city === destination.city)
        ? prev.filter((d) => d.city !== destination.city)
        : [...prev, destination]
    );
  };

  const handleNext = () => {
    if (selectedDestinations.length === 0) {
      // Could show an alert or just return
      return;
    }
    onDestinationSelect(
      selectedDestinations,
      selectedVibes.length > 0 ? selectedVibes : undefined
    );
    setSearchQuery("");
    setSelectedVibes([]);
    setSelectedDestinations([]);
  };

  const handleClose = () => {
    setSearchQuery("");
    setSelectedVibes([]);
    setSelectedDestinations([]);
    onClose();
  };

  const modalTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight * DESTINATION_MODAL_HEIGHT, 0],
  });

  return (
    <Modal visible={visible} transparent animationType="none">
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
            handleClose();
          }}
        >
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        <Animated.View
          style={[
            styles.modal,
            {
              transform: [{ translateY: modalTranslateY }],
            },
          ]}
        >
          {/* Header with back button */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={onClose}
            >
              <Ionicons name="arrow-back" size={24} color="#008080" />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, styles.headerTitle]}>Where do you want to go?</Text>
            <View style={styles.headerSpacer} />
          </View>

          <Text style={styles.sectionTitle}>What&apos;s Your Trip Vibe?</Text>
          <View style={styles.vibesScrollContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.vibesContent}
            >
              <View style={styles.vibesGrid}>
                <View style={styles.vibesRow}>
                  {availableVibes.slice(0, 4).map((vibe) => (
                    <TouchableOpacity
                      key={vibe}
                      style={[
                        styles.vibeChip,
                        selectedVibes.includes(vibe) && styles.selectedVibeChip,
                      ]}
                      onPress={() => toggleVibe(vibe)}
                    >
                      <Text style={styles.vibeIcon}>✨</Text>
                      <Text
                        style={[
                          styles.vibeText,
                          selectedVibes.includes(vibe) &&
                            styles.selectedVibeText,
                        ]}
                      >
                        {vibe.replace("_", " ")}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.vibesRow}>
                  {availableVibes.slice(4, 8).map((vibe) => (
                    <TouchableOpacity
                      key={vibe}
                      style={[
                        styles.vibeChip,
                        selectedVibes.includes(vibe) && styles.selectedVibeChip,
                      ]}
                      onPress={() => toggleVibe(vibe)}
                    >
                      <Text style={styles.vibeIcon}>✨</Text>
                      <Text
                        style={[
                          styles.vibeText,
                          selectedVibes.includes(vibe) &&
                            styles.selectedVibeText,
                        ]}
                      >
                        {vibe.replace("_", " ")}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
          </View>

          <Text style={styles.sectionTitle}>
            {selectedVibes.length > 0
              ? "Suggested Destinations"
              : "Popular Destinations"}
          </Text>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Type to search..."
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <FlatList
            data={filteredDestinations}
            keyExtractor={(item) => `${item.city}-${item.district}`}
            showsVerticalScrollIndicator={false}
            style={styles.destinationsList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.destinationItem,
                  selectedDestinations.some((d) => d.city === item.city) &&
                    styles.selectedDestinationItem,
                ]}
                onPress={() => toggleDestination(item)}
              >
                <View style={styles.destinationContent}>
                  <Text
                    style={[
                      styles.destinationText,
                      selectedDestinations.some((d) => d.city === item.city) &&
                        styles.selectedDestinationText,
                    ]}
                  >
                    {item.city}
                  </Text>
                  <Text style={styles.destinationSubText}>
                    {item.district}, {item.province}
                  </Text>
                  <View style={styles.destinationIndicators}>
                    {selectedDestinations.some((d) => d.city === item.city) && (
                      <Text style={styles.selectedIndicator}>✓</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              loadingCities ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Loading cities...</Text>
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No cities found</Text>
                </View>
              )
            }
          />

          <View style={styles.buttonContainer}>
            <LongButton
              label={
                selectedDestinations.length > 0
                  ? `Next (${selectedDestinations.length} selected)`
                  : "Select Destinations"
              }
              onPress={handleNext}
            />
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "transparent",
  },
  modal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 20,
    height: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    color: "#111827",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#008080",
    marginTop: 20,
    marginBottom: 12,
  },
  vibesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  vibesScrollContainer: {
    height: 100, // Fixed height for two rows
    marginBottom: 16,
  },
  vibesContent: {
    paddingRight: 20, // Add padding for horizontal scroll
  },
  vibesGrid: {
    flexDirection: "column",
    gap: 8,
  },
  vibesRow: {
    flexDirection: "row",
    gap: 8,
  },
  vibeChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#F9FAFB",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 6,
  },
  selectedVibeChip: {
    backgroundColor: "#008080",
    borderColor: "#008080",
  },
  vibeIcon: {
    fontSize: 16,
  },
  vibeText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  selectedVibeText: {
    color: "#FFFFFF",
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: "#F9FAFB",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#374151",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  destinationsList: {
    flex: 1,
  },
  destinationItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  destinationContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  destinationText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
    flex: 1,
  },
  matchingVibes: {
    flexDirection: "row",
    gap: 4,
  },
  matchingVibeText: {
    fontSize: 16,
  },
  selectedDestinationItem: {
    backgroundColor: "#E6F7FF",
    borderColor: "#008080",
    borderWidth: 2,
  },
  selectedDestinationText: {
    color: "#008080",
    fontWeight: "600",
  },
  destinationIndicators: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  selectedIndicator: {
    fontSize: 18,
    color: "#008080",
    fontWeight: "bold",
  },
  destinationSubText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
  },
  buttonContainer: {
    marginTop: 16,
    paddingHorizontal: 0,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    marginBottom: 0,
  },
  headerSpacer: {
    width: 24,
  },
});
