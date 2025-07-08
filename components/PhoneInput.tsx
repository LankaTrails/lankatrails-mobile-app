import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import CountryPicker, {
  Country,
  CountryCode,
} from "react-native-country-picker-modal";
import Icon from "react-native-vector-icons/Ionicons";

type Props = {
  label: string;
  value: string;
  onChange: (phone: string) => void;
};

const PhoneInput: React.FC<Props> = ({ label, value, onChange }) => {
  const [countryCode, setCountryCode] = useState<CountryCode>("LK");
  const [country, setCountry] = useState<Country | null>(null);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const handleSelect = (country: Country) => {
    setCountryCode(country.cca2);
    setCountry(country);
    setShowCountryPicker(false);
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
        <Icon name="call-outline" size={18} color="#008080" style={styles.icon} />
        <Text style={styles.labelText}>{label}</Text>
      </View>
      
      <View style={styles.inputRow}>
        <TouchableOpacity 
          style={styles.countryButton} 
          onPress={openCountryPicker}
          activeOpacity={0.7}
        >
          <Text style={styles.callingCode}>
            +{country?.callingCode?.[0] ?? "94"}
          </Text>
          <Icon name="chevron-down" size={12} color="#666" />
        </TouchableOpacity>
        
        <View style={styles.separator} />
        
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
          maxLength={15}
        />
      </View>

      {showCountryPicker && (
        <CountryPicker
          countryCode={countryCode}
          withCallingCode
          withFlag
          withEmoji
          withFilter
          visible={showCountryPicker}
          onSelect={handleSelect}
          onClose={closeCountryPicker}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
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
    borderRadius: 12,
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
});

export default PhoneInput;