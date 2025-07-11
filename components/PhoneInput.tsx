import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { countries } from "countries-list";

type CountryData = {
  code: string;
  name: string;
  emoji: string;
  callingCode: string;
};

type Props = {
  label: string;
  value: string;
  onChange: (phone: string) => void;
  onCountryChange?: (country: CountryData) => void;
};

// Country code to emoji mapping
const getCountryEmoji = (countryCode: string): string => {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

// Convert countries-list data to our format
const getCountryList = (): CountryData[] => {
  return Object.entries(countries)
    .map(([code, country]) => ({
      code,
      name: country.name,
      emoji: getCountryEmoji(code),
      callingCode: country.phone[0] || "", // Get first phone code
    }))
    .filter(country => country.callingCode) // Filter out countries without calling codes
    .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically
};

const PhoneInput: React.FC<Props> = ({ label, value, onChange, onCountryChange }) => {
  const countryList = getCountryList();
  const [selectedCountry, setSelectedCountry] = useState<CountryData>(
    countryList.find(c => c.code === "LK") || countryList[0] // Default to Sri Lanka or first country
  );
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const handleCountrySelect = (country: CountryData) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
    onCountryChange?.(country);
  };

  const openCountryPicker = () => {
    setShowCountryPicker(true);
  };

  const closeCountryPicker = () => {
    setShowCountryPicker(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.label}>
        <Ionicons name="call-outline" size={18} color="#008080" style={styles.icon} />
        <Text style={styles.labelText}>{label}</Text>
      </View>
      
      <View style={styles.inputRow}>
        <TouchableOpacity 
          style={styles.countryButton} 
          onPress={openCountryPicker}
          activeOpacity={0.7}
        >
          <Text style={styles.flag}>{selectedCountry.emoji}</Text>
          <Text style={styles.callingCode}>
            +{selectedCountry.callingCode}
          </Text>
          <MaterialIcons 
            name={showCountryPicker ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
            size={16} 
            color="#666" 
          />
        </TouchableOpacity>
        
        <View style={styles.separator} />
        
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          keyboardType="phone-pad"
          maxLength={15}
        />
      </View>

      {showCountryPicker && (
        <>
          <TouchableOpacity 
            style={styles.backdrop} 
            onPress={closeCountryPicker}
            activeOpacity={1}
          />
          <View style={styles.dropdownList}>
            <ScrollView
              style={styles.scrollView}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 10 }}
            >
              {countryList.map((country) => (
                <TouchableOpacity
                  key={country.code}
                  style={[
                    styles.dropdownItem,
                    selectedCountry.code === country.code && styles.selectedItem
                  ]}
                  onPress={() => handleCountrySelect(country)}
                  activeOpacity={0.6}
                >
                  <Text style={styles.flag}>{country.emoji}</Text>
                  <Text style={styles.countryName}>{country.name}</Text>
                  <Text style={styles.countryCode}>+{country.callingCode}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
    position: "relative",
    zIndex: 1,
  },
  label: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  icon: {
    marginRight: 6,
  },
  labelText: {
    fontWeight: "600",
    color: "#008080",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.07)",
    borderRadius: 20,
    backgroundColor: "transparent",
    height: 45,
  },
  countryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    height: "100%",
    backgroundColor: "rgba(0, 128, 128, 0.03)",
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    minWidth: 90,
  },
  flag: {
    fontSize: 16,
    marginRight: 4,
  },
  callingCode: {
    fontSize: 14,
    marginRight: 4,
    color: "#1f2937",
    fontWeight: "500",
  },
  separator: {
    width: 1,
    height: 20,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
    paddingRight: 12,
    height: "100%",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: -1000,
    right: -1000,
    bottom: -1000,
    zIndex: 999,
  },
  dropdownList: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.07)",
    borderRadius: 20,
    maxHeight: 200,
    backgroundColor: "white",
    position: "absolute",
    top: 75,
    left: 0,
    right: 0,
    zIndex: 1001,
    elevation: 10, // For Android shadow
    shadowColor: "#000", // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scrollView: {
    maxHeight: 200,
    flex: 1,
  },
  dropdownItem: {
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  selectedItem: {
    backgroundColor: "rgba(0, 128, 128, 0.05)",
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
  },
  countryCode: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
});

export default PhoneInput;