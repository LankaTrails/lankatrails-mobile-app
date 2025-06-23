import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { theme } from "../app/theme";


const FilterButton = ({ filter, isActive, onPress }) => (
  <TouchableOpacity
    style={[styles.filterButton, isActive && styles.activeFilterButton]}
    onPress={onPress}
  >
    <Text style={[styles.filterText, isActive && styles.activeFilterText]}>
      {filter}
    </Text>
  </TouchableOpacity>
);

const styles = {
  
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(175, 175, 175, 0.13)',
    backgroundColor: theme.colors.lightPrimary,
  },
  activeFilterButton: {
    backgroundColor: theme.colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  activeFilterText: {
    color: theme.colors.white,
  },
};

export default FilterButton;