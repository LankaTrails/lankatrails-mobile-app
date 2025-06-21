import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

type Props = {
  label: string;
  value: string;
  secureTextEntry?: boolean;
  placeholder: string;
  onChange: (text: string) => void;
  icon: string;
};

const ProfileInput: React.FC<Props> = ({
  label,
  value,
  onChange,
  icon,
  secureTextEntry = false,
  placeholder,
}) => {
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={styles.label}>
        <Icon name={icon} size={18} color="#6b7280" style={styles.icon} />
        <Text style={styles.labelText}>{label}</Text>
      </View>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        placeholderTextColor="#6b7280"
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
    width: '100%',
    borderColor: 'rgba(0, 0, 0, 0.07)',
    borderRadius: 12,
    height: 45,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'transparent',
  },
});

export default ProfileInput;