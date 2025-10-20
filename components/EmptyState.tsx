import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { theme } from "../app/theme";

const screenHeight = Dimensions.get("window").height;

interface EmptyStateProps {
  selectedFilter: string;
  onCreateTrip?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  selectedFilter,
  onCreateTrip,
}) => {
  const getEmptyStateContent = () => {
    return {
      icon: "map-outline",
      title: "No trips created yet",
      subtitle: "Start planning your Sri Lankan adventure",
      showButton: false,
    };
  };

  const content = getEmptyStateContent();

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Icon
          name={content.icon}
          size={80}
          color={theme.colors.primary}
          style={styles.icon}
        />
      </View>

      <Text style={styles.title}>{content.title}</Text>
      <Text style={styles.subtitle}>{content.subtitle}</Text>

      {content.showButton && onCreateTrip && (
        <TouchableOpacity style={styles.createButton} onPress={onCreateTrip}>
          <Icon
            name="add"
            size={20}
            color={theme.colors.white}
            style={styles.buttonIcon}
          />
          <Text style={styles.buttonText}>Create Trip</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: screenHeight * 0.4,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    backgroundColor: "#ffffff",
    marginTop: 40,
  },
  iconContainer: {
    backgroundColor: theme.colors.lightPrimary,
    borderRadius: 40,
    padding: 16,
    marginBottom: 20,
  },
  icon: {
    marginBottom: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 16,
  },
  createButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  buttonIcon: {
    marginRight: 6,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
});

export default EmptyState;
