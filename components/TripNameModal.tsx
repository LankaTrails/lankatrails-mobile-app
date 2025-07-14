import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
} from "react-native";
import LongButton from "./LongButton";
import InputField from "./InputField";
import {theme} from "../app/theme";

interface TripNameModalProps {
  visible: boolean;
  destination: string;
  suggestedName: string;
  onClose: () => void;
  onCreateTrip: (tripName: string) => void;
}

export default function TripNameModal({
  visible,
  destination,
  suggestedName,
  onClose,
  onCreateTrip,
}: TripNameModalProps) {
  const [tripName, setTripName] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (destination) {
      const tripSuggestions = [
        `${destination} Adventure`,
        `${destination} Explorer`,
        `${destination} Journey`,
        `${destination} Experience`,
        `Discover ${destination}`,
        `${destination} Getaway`,
        `${destination} Expedition`,
      ];
      setSuggestions(tripSuggestions);
      setTripName(suggestedName);
    }
  }, [destination, suggestedName]);

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
    setTripName("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
            handleClose();
          }}
        >
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Name your trip</Text>

          <InputField
            value={tripName}
            onChange={setTripName}
            placeholder="Enter trip name..."
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
              label="Create Trip"
              onPress={handleCreateTrip}
              disabled={!tripName.trim()}
            />
          </View>
        </View>
      </View>
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
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    color: "#111827",
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