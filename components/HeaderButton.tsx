import React, { useState, useRef } from "react";
import {
  TouchableWithoutFeedback,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { theme } from "../app/theme";
import { Ionicons } from "@expo/vector-icons";

interface HeaderButtonProps {
  tripId?: string;
  tripTitle?: string;
  onEdit?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
}

export default function HeaderButton({ 
  tripId, 
  tripTitle, 
  onEdit, 
  onShare, 
  onDelete 
}: HeaderButtonProps) {
  const [scaleValue] = useState(new Animated.Value(1));
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const toggleDropdown = () => {
    if (showDropdown) {
      // Close dropdown
      Animated.timing(dropdownAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setShowDropdown(false));
    } else {
      // Open dropdown
      setShowDropdown(true);
      Animated.timing(dropdownAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleShare = () => {
    setShowDropdown(false);
    dropdownAnim.setValue(0);
    if (onShare) {
      onShare();
    } else {
      Alert.alert("Share", `Share "${tripTitle || 'this trip'}" with friends and family`);
    }
  };

  const handleEdit = () => {
    setShowDropdown(false);
    dropdownAnim.setValue(0);
    if (onEdit) {
      onEdit();
    } else {
      Alert.alert("Edit", "Edit trip functionality will be implemented here");
    }
  };

  const handleDelete = () => {
    setShowDropdown(false);
    dropdownAnim.setValue(0);
    
    const tripName = tripTitle || 'this trip';
    Alert.alert(
      "Delete Trip",
      `Are you sure you want to delete "${tripName}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => {
            if (onDelete) {
              onDelete();
            } else {
              console.log(`Trip ${tripId || 'unknown'} deleted`);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={toggleDropdown}
      >
        <Animated.View
          style={[
            styles.headerButton,
            {
              transform: [{ scale: scaleValue }],
            },
          ]}
        >
          <Ionicons name="options-outline" size={25} color={theme.colors.primary} />
        </Animated.View>
      </TouchableOpacity>

      {showDropdown && (
        <Animated.View 
          style={[
            styles.dropdown,
            {
              opacity: dropdownAnim,
              transform: [
                {
                  translateY: dropdownAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-10, 0],
                  }),
                },
                {
                  scale: dropdownAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.95, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity 
            style={styles.dropdownItem} 
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Ionicons name="share-outline" size={20} color="#374151" />
            <Text style={styles.dropdownText}>Share</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.dropdownItem} 
            onPress={handleEdit}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={20} color="#374151" />
            <Text style={styles.dropdownText}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.dropdownItem, styles.deleteItem]} 
            onPress={handleDelete}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
            <Text style={[styles.dropdownText, styles.deleteText]}>Delete</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {showDropdown && (
        <TouchableWithoutFeedback onPress={toggleDropdown}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  headerButton: {
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderRadius: 24,
    elevation: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  dropdown: {
    position: 'absolute',
    top: 45,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 140,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    zIndex: 1000,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  dropdownText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  deleteItem: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  deleteText: {
    color: '#EF4444',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: -1000,
    right: -1000,
    bottom: -1000,
    zIndex: 999,
  },
});