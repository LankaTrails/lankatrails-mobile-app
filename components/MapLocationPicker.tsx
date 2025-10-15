import { Location } from "@/types/triptypes";
import { Ionicons } from "@expo/vector-icons";
import * as ExpoLocation from "expo-location";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";

interface MapLocationPickerProps {
  onLocationSelect: (location: Location) => void;
  onClose: () => void;
}

export default function MapLocationPicker({
  onLocationSelect,
  onClose,
}: MapLocationPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [region, setRegion] = useState<Region>({
    latitude: 7.8731, // Center of Sri Lanka
    longitude: 80.7718,
    latitudeDelta: 2.0,
    longitudeDelta: 2.0,
  });
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Predefined popular regions in Sri Lanka
  const popularRegions = [
    { name: "Colombo", latitude: 6.9271, longitude: 79.8612, delta: 0.1 },
    { name: "Kandy", latitude: 7.2906, longitude: 80.6337, delta: 0.1 },
    { name: "Galle", latitude: 6.0535, longitude: 80.221, delta: 0.1 },
    { name: "Nuwara Eliya", latitude: 6.9497, longitude: 80.7891, delta: 0.1 },
    { name: "Anuradhapura", latitude: 8.3114, longitude: 80.4037, delta: 0.1 },
  ];

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await ExpoLocation.getCurrentPositionAsync({
          accuracy: ExpoLocation.Accuracy.High,
        });
        const coords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setCurrentLocation(coords);
        setRegion({
          ...coords,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        });
      }
    } catch (error) {
      console.error("Error getting current location:", error);
    }
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
  };

  const handleConfirmLocation = async () => {
    if (!selectedLocation) {
      Alert.alert(
        "No Location Selected",
        "Please tap on the map to select a location."
      );
      return;
    }

    setIsLoadingAddress(true);
    try {
      const reverseGeocode = await ExpoLocation.reverseGeocodeAsync({
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      });

      let locationData: Location;

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        locationData = {
          locationId: null,
          formattedAddress: `${address.street || ""} ${
            address.streetNumber || ""
          }, ${address.city || ""}, ${address.region || ""}`.trim(),
          city: address.city || "Unknown City",
          district: address.subregion || address.region || "Unknown District",
          province: address.region || "Unknown Province",
          country: address.country || "Sri Lanka",
          postalCode: address.postalCode || "",
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
        };
      } else {
        // Fallback if reverse geocoding fails
        locationData = {
          locationId: null,
          formattedAddress: `Coordinates: ${selectedLocation.latitude.toFixed(
            6
          )}, ${selectedLocation.longitude.toFixed(6)}`,
          city: "Unknown City",
          district: "Unknown District",
          province: "Unknown Province",
          country: "Sri Lanka",
          postalCode: "",
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
        };
      }

      onLocationSelect(locationData);
    } catch (error) {
      console.error("Error getting address:", error);
      Alert.alert(
        "Error",
        "Could not get address for this location. Please try again."
      );
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const centerOnCurrentLocation = () => {
    if (currentLocation) {
      setRegion({
        ...currentLocation,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    }
  };

  const centerOnPopularRegion = (regionData: (typeof popularRegions)[0]) => {
    setRegion({
      latitude: regionData.latitude,
      longitude: regionData.longitude,
      latitudeDelta: regionData.delta,
      longitudeDelta: regionData.delta,
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Select Location on Map</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructions}>
          Tap on the map to select your start location
        </Text>

        {/* Quick Region Buttons */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.regionsScrollView}
          contentContainerStyle={styles.regionsContainer}
        >
          {popularRegions.map((regionData, index) => (
            <TouchableOpacity
              key={index}
              style={styles.regionButton}
              onPress={() => centerOnPopularRegion(regionData)}
            >
              <Text style={styles.regionButtonText}>{regionData.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Map */}
      <MapView
        style={styles.map}
        region={region}
        onPress={handleMapPress}
        showsUserLocation={true}
        showsMyLocationButton={false}
        mapType="standard"
        onRegionChangeComplete={setRegion}
      >
        {selectedLocation && (
          <Marker
            coordinate={selectedLocation}
            title="Selected Start Location"
            pinColor="#007AFF"
          />
        )}
      </MapView>

      {/* Controls */}
      <View style={styles.controls}>
        {currentLocation && (
          <TouchableOpacity
            style={styles.locationButton}
            onPress={centerOnCurrentLocation}
          >
            <Ionicons name="locate" size={20} color="#007AFF" />
          </TouchableOpacity>
        )}

        {selectedLocation && (
          <View style={styles.selectedLocationInfo}>
            <Text style={styles.coordText}>
              {selectedLocation.latitude.toFixed(6)},{" "}
              {selectedLocation.longitude.toFixed(6)}
            </Text>
          </View>
        )}
      </View>

      {/* Confirm Button */}
      {selectedLocation && (
        <View style={styles.confirmContainer}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmLocation}
            disabled={isLoadingAddress}
          >
            {isLoadingAddress ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.confirmButtonText}>Confirm Location</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E1E5E9",
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  placeholder: {
    width: 34,
  },
  instructionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#F8F9FA",
    borderBottomWidth: 1,
    borderBottomColor: "#E1E5E9",
  },
  instructions: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  map: {
    flex: 1,
    width: width,
    height: height * 0.6,
  },
  controls: {
    position: "absolute",
    top: 140,
    right: 20,
    alignItems: "flex-end",
  },
  locationButton: {
    backgroundColor: "#FFF",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 10,
  },
  selectedLocationInfo: {
    backgroundColor: "#FFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    maxWidth: 200,
  },
  coordText: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
  },
  confirmContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#E1E5E9",
  },
  confirmButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  regionsScrollView: {
    marginTop: 12,
  },
  regionsContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  regionButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  regionButtonText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "500",
  },
});
