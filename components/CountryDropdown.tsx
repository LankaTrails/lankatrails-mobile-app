import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { countries } from "countries-list";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type DropdownItem = {
  code: string;
  name: string;
  emoji: string;
};

type Props = {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  icon: string;
};

// Country code to emoji mapping
const getCountryEmoji = (countryCode: string): string => {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

const CountryDropdown: React.FC<Props> = ({
  label,
  value,
  onChange,
  icon,
  placeholder,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const countryList: DropdownItem[] = Object.entries(countries).map(
    ([code, country]) => ({
      code,
      name: country.name,
      emoji: getCountryEmoji(code),
    })
  );

  const selectedCountry = countryList.find((item) => item.name === value);

  return (
    <View style={{ marginBottom: 14 }}>
      <View style={styles.label}>
        <Ionicons
          name={icon as any}
          size={18}
          color="#008080"
          style={styles.icon}
        />
        <Text style={styles.labelText}>{label}</Text>
      </View>

      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text
          style={[
            styles.dropdownText,
            !selectedCountry && { color: "#6b7280" },
          ]}
        >
          {selectedCountry
            ? `${selectedCountry.emoji} ${selectedCountry.name}`
            : placeholder}
        </Text>
        <MaterialIcons
          name={isOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={20}
          color="#008080"
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdownList}>
          <ScrollView
            style={styles.scrollView}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
          >
            {countryList.map((item) => (
              <TouchableOpacity
                key={item.code}
                style={styles.dropdownItem}
                onPress={() => {
                  onChange(item.name);
                  setIsOpen(false);
                }}
              >
                <Text style={styles.flag}>{item.emoji}</Text>
                <Text style={styles.countryName}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  dropdown: {
    borderWidth: 1,
    width: "100%",
    borderColor: "rgba(0, 0, 0, 0.07)",
    borderRadius: 12,
    height: 45,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownText: {
    fontSize: 16,
  },
  dropdownList: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.07)",
    borderRadius: 12,
    maxHeight: 200,
    backgroundColor: "white",
  },
  scrollView: {
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  flag: {
    fontSize: 20,
    marginRight: 12,
  },
  countryName: {
    fontSize: 16,
  },
});

export default CountryDropdown;
