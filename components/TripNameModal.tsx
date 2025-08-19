import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  Animated,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import LongButton from "./LongButton";

interface TripNameModalProps {
  visible: boolean;
  destination: string;
  suggestedName: string;
  onClose: () => void;
  onCreateTrip: (tripName: string) => void;
  startFromIntermediate?: boolean;
  animateToTripDetailsHeight?: boolean;
}

export default function TripNameModal({
  visible,
  destination,
  suggestedName,
  onClose,
  onCreateTrip,
  startFromIntermediate = false,
  animateToTripDetailsHeight = false,
}: TripNameModalProps) {
  const [tripName, setTripName] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const hasSetInitialSelection = useRef(false);
  const slideAnim = useRef(new Animated.Value(startFromIntermediate ? 0.3 : 0)).current;
  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    if (destination) {
      // Parse destinations - they come as "Dest1, Dest2 & Dest3" or "Dest1, Dest2, Dest3..." format
      const destinationParts = destination.split(/,|\s&\s/).map(d => d.trim());
      const hasEllipsis = destination.includes('...');
      const destinationCount = hasEllipsis ? destinationParts.length + 1 : destinationParts.length; // +1 for truncated destinations
      
      // Get the primary destination for naming
      const primaryDestination = destinationParts[0];
      
      let tripSuggestions;
      if (destinationCount === 1) {
        // Single destination suggestions
        tripSuggestions = [
          `${destination} Explorer`,
          `${destination} Journey`,
          `${destination} Experience`,
          `Discover ${destination}`,
          `${destination} Getaway`,
          `${destination} Expedition`,
        ];
      } else {
        // Multi-destination suggestions
        const displayText = hasEllipsis || destinationCount > 3 ? primaryDestination : destination;
        tripSuggestions = [
          `${displayText} Multi-City Trip`,
          `${primaryDestination} & Beyond`,
          `${displayText} Adventure`,
          `Explore ${displayText}`,
          `${primaryDestination} Journey`,
          `${destinationCount > 5 ? 'Grand' : 'Multi'}-Destination Tour`,
        ];
      }
      
      setSuggestions(tripSuggestions);
    }
  }, [destination]);

  // Separate effect to handle default selection when modal becomes visible
  useEffect(() => {
    if (visible && suggestions.length > 0 && !hasSetInitialSelection.current) {
      // Set default selection only once per modal session
      setTripName(suggestedName || suggestions[0]);
      hasSetInitialSelection.current = true;
    } else if (visible && suggestedName) {
      // Update if a specific suggested name is provided
      setTripName(suggestedName);
    }
  }, [visible, suggestions, suggestedName]);

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: startFromIntermediate ? 200 : 300,
        useNativeDriver: true,
      }).start();
    } else {
      if (animateToTripDetailsHeight) {
        // Animate to TripDetails modal height position - smoother transition
        Animated.timing(slideAnim, {
          toValue: 0.3, // Partial slide down to where TripDetails modal will appear
          duration: 250,
          useNativeDriver: true,
        }).start(() => {
          // Reset animation value for next time
          slideAnim.setValue(startFromIntermediate ? 0.3 : 0);
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
  }, [visible, slideAnim, startFromIntermediate, animateToTripDetailsHeight]);

  const handleCreateTrip = () => {
    if (tripName.trim()) {
      onCreateTrip(tripName.trim());
      setTripName("");
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    setTripName(suggestion);
  };

  const handleClose = () => {
    onClose();
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      // Reset tripName when modal is closed to ensure fresh state on next open
      setTimeout(() => {
        setTripName("");
        hasSetInitialSelection.current = false; // Reset the flag for next session
      }, 300);
    }
  }, [visible]);

  const modalTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight * 0.3, 0], // Start at intermediate position (30% from bottom) or slide from bottom
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
          <Text style={styles.modalTitle}>Name your trip</Text>

          <TextInput
            style={styles.inputField}
            value={tripName}
            onChangeText={setTripName}
            placeholder="Enter trip name..."
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.sectionTitle}>Suggested Names</Text>
          
          <View style={styles.suggestionsContainer}>
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.suggestionChip,
                  tripName === suggestion && styles.selectedSuggestion
                ]}
                onPress={() => handleSuggestionPress(suggestion)}
              >
                <Text
                  style={[
                    styles.suggestionText,
                    tripName === suggestion && styles.selectedSuggestionText
                  ]}
                >
                  {suggestion}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.buttonContainer}>
            <LongButton
              label="Next"
              onPress={handleCreateTrip}
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
    maxHeight: "100%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    color: "#111827",
    marginBottom: 20,
  },
  inputField: {
    backgroundColor: "#F9FAFB",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#374151",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#008080",
    marginTop: 20,
    marginBottom: 12,
  },
  suggestionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 30,
  },
  suggestionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#F9FAFB",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  selectedSuggestion: {
    backgroundColor: "#008080",
    borderColor: "#008080",
  },
  suggestionText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  selectedSuggestionText: {
    color: "#FFFFFF",
  },
  buttonContainer: {
    marginTop: "auto",
  },
});