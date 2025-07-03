import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  FlatList,
  TouchableOpacity,
} from "react-native";
import LongButton from "./LongButton";
import InputField from "./InputField";

const popularDestinations = [
  "Ella",
  "Sigiriya",
  "Kandy",
  "Galle",
  "Nuwara Eliya",
  "Jaffna",
  "Mirissa",
  "Anuradhapura",
  "Polonnaruwa",
  "Bentota",
  "Colombo",
  "Negombo",
  "Hikkaduwa",
  "Trincomalee",
];

interface DestinationModalProps {
  visible: boolean;
  onClose: () => void;
  onDestinationSelect: (destination: string) => void;
}

export default function DestinationModal({
  visible,
  onClose,
  onDestinationSelect,
}: DestinationModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [customDestination, setCustomDestination] = useState("");

  const filteredDestinations = popularDestinations.filter((destination) =>
    destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDestinationPress = (destination: string) => {
    onDestinationSelect(destination);
    setSearchQuery("");
    setCustomDestination("");
  };

  const handleCustomDestination = () => {
    if (customDestination.trim()) {
      onDestinationSelect(customDestination.trim());
      setSearchQuery("");
      setCustomDestination("");
    }
  };

  const handleClose = () => {
    setSearchQuery("");
    setCustomDestination("");
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
          <Text style={styles.modalTitle}>Where do you want to go?</Text>
          
  

          <Text style={styles.sectionTitle}>Popular Destinations</Text>
                  <InputField
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Type to search..."
          />
          
          <FlatList
            data={filteredDestinations}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
            style={styles.destinationsList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.destinationItem}
                onPress={() => handleDestinationPress(item)}
              >
                <Text style={styles.destinationText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
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
    height: "70%",
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

  },
  destinationItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  destinationText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
});