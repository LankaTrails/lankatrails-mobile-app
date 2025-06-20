// components/ProfileInput.tsx
import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";


type Props = {
  label: string;
  value: string;
  onChange: (text: string) => void;
  icon: string;
};

const ProfileInput: React.FC<Props> = ({ label, value, onChange, icon }) => {
  return (
    <View style={{ marginBottom: 24 }}>
      <View style={styles.label}>
        <Icon name={icon} size={18} color="#6b7280" style={styles.icon} />
        <Text style={styles.labelText}>{label}</Text>
      </View>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={`Enter ${label}`}
      />
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
    color: "#008080",
  },
  labelText: {
    fontWeight: "600",
    color: "#008080",
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 10,
    height: 48,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'transparent',
  },
});

export default ProfileInput;