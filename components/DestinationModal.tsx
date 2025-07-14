import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  FlatList,
  TouchableOpacity,
  Animated,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import LongButton from "./LongButton";

const popularDestinations = [
  { name: "Ella", vibes: ["Adventure", "Relax"] },
  { name: "Sigiriya", vibes: ["Adventure", "Culture"] },
  { name: "Kandy", vibes: ["Culture", "Relax"] },
  { name: "Galle", vibes: ["Culture", "Relax", "Foodie"] },
  { name: "Nuwara Eliya", vibes: ["Relax", "Adventure"] },
  { name: "Jaffna", vibes: ["Culture", "Foodie"] },
  { name: "Mirissa", vibes: ["Party", "Relax", "Adventure"] },
  { name: "Anuradhapura", vibes: ["Culture"] },
  { name: "Polonnaruwa", vibes: ["Culture", "Adventure"] },
  { name: "Bentota", vibes: ["Party", "Relax"] },
  { name: "Colombo", vibes: ["Party", "Foodie", "Culture"] },
  { name: "Negombo", vibes: ["Party", "Relax", "Foodie"] },
  { name: "Hikkaduwa", vibes: ["Party", "Adventure"] },
  { name: "Trincomalee", vibes: ["Adventure", "Relax"] },
];

const tripVibes = [
  { name: "Party", icon: "🎉" },
  { name: "Relax", icon: "🧘" },
  { name: "Adventure", icon: "🏔️" },
  { name: "Culture", icon: "🏛️" },
  { name: "Foodie", icon: "🍜" },
];

interface DestinationModalProps {
  visible: boolean;
  onClose: () => void;
  onDestinationSelect: (destinations: string[], selectedVibes?: string[]) => void;
  animateToTripNameHeight?: boolean;
}

const DESTINATION_MODAL_HEIGHT = 0.7; // 70% of screen

export default function DestinationModal({
  visible,
  onClose,
  onDestinationSelect,
  animateToTripNameHeight = false,
}: DestinationModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const screenHeight = Dimensions.get('window').height;

  // Filter and sort destinations based on selected vibes and search query
  const getFilteredDestinations = () => {
    let filtered = popularDestinations.filter((destination) =>
      destination.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (selectedVibes.length > 0) {
      // Sort by relevance (number of matching vibes)
      filtered.sort((a, b) => {
        const aMatches = a.vibes.filter(vibe => selectedVibes.includes(vibe)).length;
        const bMatches = b.vibes.filter(vibe => selectedVibes.includes(vibe)).length;
        return bMatches - aMatches; // Sort in descending order (most matches first)
      });
    }

    return filtered;
  };

  const filteredDestinations = getFilteredDestinations();

  const toggleVibe = (vibe: string) => {
    setSelectedVibes(prev => 
      prev.includes(vibe) 
        ? prev.filter(v => v !== vibe)
        : [...prev, vibe]
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

  const toggleDestination = (destinationName: string) => {
    setSelectedDestinations(prev => 
      prev.includes(destinationName) 
        ? prev.filter(d => d !== destinationName)
        : [...prev, destinationName]
    );
  };

  const handleNext = () => {
    if (selectedDestinations.length === 0) {
      // Could show an alert or just return
      return;
    }
    onDestinationSelect(selectedDestinations, selectedVibes.length > 0 ? selectedVibes : undefined);
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
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
            }
          ]}
        >
          <Text style={styles.modalTitle}>Where do you want to go?</Text>
          
          <Text style={styles.sectionTitle}>What&apos;s Your Trip Vibe?</Text>
          <View style={styles.vibesContainer}>
            {tripVibes.map((vibe) => (
              <TouchableOpacity
                key={vibe.name}
                style={[
                  styles.vibeChip,
                  selectedVibes.includes(vibe.name) && styles.selectedVibeChip
                ]}
                onPress={() => toggleVibe(vibe.name)}
              >
                <Text style={styles.vibeIcon}>{vibe.icon}</Text>
                <Text style={[
                  styles.vibeText,
                  selectedVibes.includes(vibe.name) && styles.selectedVibeText
                ]}>
                  {vibe.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>
            {selectedVibes.length > 0 ? 'Suggested Destinations' : 'Popular Destinations'}
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
            keyExtractor={(item) => item.name}
            showsVerticalScrollIndicator={false}
            style={styles.destinationsList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.destinationItem,
                  selectedDestinations.includes(item.name) && styles.selectedDestinationItem
                ]}
                onPress={() => toggleDestination(item.name)}
              >
                <View style={styles.destinationContent}>
                  <Text style={[
                    styles.destinationText,
                    selectedDestinations.includes(item.name) && styles.selectedDestinationText
                  ]}>
                    {item.name}
                  </Text>
                  <View style={styles.destinationIndicators}>
                    {selectedVibes.length > 0 && (
                      <View style={styles.matchingVibes}>
                        {item.vibes
                          .filter(vibe => selectedVibes.includes(vibe))
                          .map(vibe => (
                            <Text key={vibe} style={styles.matchingVibeText}>
                              {tripVibes.find(tv => tv.name === vibe)?.icon}
                            </Text>
                          ))}
                      </View>
                    )}
                    {selectedDestinations.includes(item.name) && (
                      <Text style={styles.selectedIndicator}>✓</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
          
          <View style={styles.buttonContainer}>
            <LongButton
              label={selectedDestinations.length > 0 ? `Next (${selectedDestinations.length} selected)` : "Select Destinations"}
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  vibeChip: {
    flexDirection: 'row',
    alignItems: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  destinationText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
    flex: 1,
  },
  matchingVibes: {
    flexDirection: 'row',
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectedIndicator: {
    fontSize: 18,
    color: "#008080",
    fontWeight: "bold",
  },
  buttonContainer: {
    marginTop: 16,
    paddingHorizontal: 0,
  },
});