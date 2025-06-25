import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { theme } from '../app/theme';

interface Props {
  label: string;
  value: string;
}

const ProfileInfoItem: React.FC<Props> = ({ label, value}) => {
  const iconName = {
    Name: "person-outline",
    Email: "mail-outline",
    Phone: "call-outline",
  }[label] || "information-circle-outline";

  return (
    <TouchableOpacity >
      <View style={styles.infoItem}>
        <View style={styles.row}>
          <Icon name={iconName} size={18} color='#008080' style={styles.icon} />
          <Text style={styles.labelText}>{label}</Text>
        </View>
        <Text style={styles.value}>{value}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default ProfileInfoItem;

const styles = StyleSheet.create({
  infoItem: {
  marginBottom: 15, // more vertical space


  paddingBottom: 12,
},
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 6,
    marginBottom: 8,
  },
  labelText: {
    fontWeight: "600",
    color: "#008080",
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
});
