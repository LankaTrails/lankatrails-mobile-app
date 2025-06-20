import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { theme } from '../app/theme';

interface Props {
  label: string;
  value: string;
  onPress: () => void;
}

const ProfileInfoItem: React.FC<Props> = ({ label, value, onPress }) => {
  const iconName = {
    Name: "person-outline",
    Email: "mail-outline",
    Phone: "call-outline",
  }[label] || "information-circle-outline";

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.infoItem}>
        <View style={styles.row}>
          <Icon name={iconName} size={18} color="#6b7280" style={styles.icon} />
          <Text style={styles.label}>{label}</Text>
        </View>
        <Text style={styles.value}>{value}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default ProfileInfoItem;

const styles = StyleSheet.create({
  infoItem: {
  marginBottom: 24, // more vertical space
  borderBottomWidth: 1,
  borderBottomColor: "#e5e7eb",
  paddingBottom: 12,
},
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: theme.colors.primary,
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  icon: {
    marginRight: 6,
    color: theme.colors.primary,
  },
});
