import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Region, PROVIDER_GOOGLE } from "react-native-maps";

interface MapLocationSelectorProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (location: {
    latitude: number;
    longitude: number;
    address?: string;
  }) => void;
  initialLocation?: {
    latitude: number;
    longitude: number;
  };
}

const DEFAULT_REGION: Region = {
  latitude: 7.8731, // Sri Lanka center
  longitude: 80.7718,
  latitudeDelta: 2.0,
  longitudeDelta: 2.0,
};

export const MapLocationSelector: React.FC<MapLocationSelectorProps> = ({
  visible,
  onClose,
  onLocationSelect,
  initialLocation,
}) => {
  const [selectedLocation, setSelectedLocation] = useState(
    initialLocation || {
      latitude: DEFAULT_REGION.latitude,
      longitude: DEFAULT_REGION.longitude,
    }
  );
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState<string>("");
  const mapRef = useRef<MapView>(null);

  const getCurrentLocationOnStart = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const newLocation = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        };

        setSelectedLocation(newLocation);

        // Animate map to current location
        setTimeout(() => {
          mapRef.current?.animateToRegion({
            ...newLocation,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }, 500); // Small delay to ensure map is ready

        // Get address for current location
        try {
          const [reverseGeocodedAddress] = await Location.reverseGeocodeAsync(
            newLocation
          );
          if (reverseGeocodedAddress) {
            const addressString = [
              reverseGeocodedAddress.name,
              reverseGeocodedAddress.city,
              reverseGeocodedAddress.region,
            ]
              .filter(Boolean)
              .join(", ");
            setAddress(addressString);
          }
        } catch {
          setAddress("Current Location");
        }
      } else {
        // If permission denied, use initialLocation or default
        const fallbackLocation = initialLocation || {
          latitude: DEFAULT_REGION.latitude,
          longitude: DEFAULT_REGION.longitude,
        };
        setSelectedLocation(fallbackLocation);
        setAddress("");
      }
    } catch {
      // On error, use initialLocation or default
      const fallbackLocation = initialLocation || {
        latitude: DEFAULT_REGION.latitude,
        longitude: DEFAULT_REGION.longitude,
      };
      setSelectedLocation(fallbackLocation);
      setAddress("");
    }
  }, [initialLocation]);

  // Auto-fetch current location when modal becomes visible
  useEffect(() => {
    if (visible) {
      getCurrentLocationOnStart();
    } else {
      // Reset address when modal is closed for fresh start next time
      setAddress("");
    }
  }, [visible, getCurrentLocationOnStart]);

  const handleMapPress = useCallback(async (event: any) => {
    const { coordinate } = event.nativeEvent;
    setSelectedLocation(coordinate);

    // Reverse geocode to get address
    try {
      const [reverseGeocodedAddress] = await Location.reverseGeocodeAsync({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
      });

      if (reverseGeocodedAddress) {
        const addressString = [
          reverseGeocodedAddress.name,
          reverseGeocodedAddress.city,
          reverseGeocodedAddress.region,
        ]
          .filter(Boolean)
          .join(", ");
        setAddress(addressString);
      }
    } catch {
      console.log("Reverse geocoding failed");
      setAddress("Selected Location");
    }
  }, []);

  const handleCurrentLocation = useCallback(async () => {
    setIsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to use this feature."
        );
        setIsLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newLocation = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      setSelectedLocation(newLocation);

      // Animate map to current location
      mapRef.current?.animateToRegion({
        ...newLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      // Get address for current location
      try {
        const [reverseGeocodedAddress] = await Location.reverseGeocodeAsync(
          newLocation
        );
        if (reverseGeocodedAddress) {
          const addressString = [
            reverseGeocodedAddress.name,
            reverseGeocodedAddress.city,
            reverseGeocodedAddress.region,
          ]
            .filter(Boolean)
            .join(", ");
          setAddress(addressString);
        }
      } catch {
        setAddress("Current Location");
      }
    } catch {
      Alert.alert("Error", "Failed to get current location. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleConfirmSelection = useCallback(() => {
    onLocationSelect({
      ...selectedLocation,
      address: address || "Selected Location",
    });
    onClose();
  }, [selectedLocation, address, onLocationSelect, onClose]);

  const initialRegion = {
    latitude: selectedLocation.latitude,
    longitude: selectedLocation.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  console.log("MapLocationSelector - visible:", visible);
  console.log("MapLocationSelector - initialRegion:", initialRegion);
  console.log("MapLocationSelector - selectedLocation:", selectedLocation);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View
          className="flex-row items-center justify-between px-4 bg-white/95 border-b border-gray-200"
          style={{ paddingTop: 10, paddingBottom: 10 }}
        >
          <TouchableOpacity
            onPress={onClose}
            className="p-2 rounded-full bg-gray-100"
          >
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>

          <Text className="text-lg font-semibold text-gray-900">
            Select Location
          </Text>

          <TouchableOpacity
            className="p-2 rounded-full bg-cyan-50"
            onPress={handleCurrentLocation}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#008080" />
            ) : (
              <Ionicons name="locate" size={20} color="#008080" />
            )}
          </TouchableOpacity>
        </View>

        {/* Map */}
        <View style={{ flex: 1, backgroundColor: "#f0f0f0" }}>
          <MapView
            // provider={PROVIDER_GOOGLE} // Force Google Maps on all platforms
            key={`${selectedLocation.latitude}-${selectedLocation.longitude}`}
            ref={mapRef}
            style={{ flex: 1 }}
            initialRegion={initialRegion}
            onPress={handleMapPress}
            showsUserLocation
            showsMyLocationButton={false}
            onMapReady={() => console.log("Google Map is ready!")}
            onRegionChangeComplete={(region) =>
              console.log("Region changed:", region)
            }
            loadingEnabled={true}
            loadingIndicatorColor="#008080"
            loadingBackgroundColor="#ffffff"
          >
            <Marker
              coordinate={selectedLocation}
              draggable
              onDragEnd={handleMapPress}
              anchor={{ x: 0.5, y: 1 }}
              pinColor="#ff6600" // Custom pin color
            />
          </MapView>
        </View>

        {/* Floating Address Info */}
        {address && (
          <View
            className="absolute left-4 right-4 bg-white/95 rounded-xl p-3 shadow-lg"
            style={{
              top: 70,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <View className="flex-row items-start">
              <Ionicons name="location-outline" size={18} color="#008080" />
              <Text
                className="flex-1 ml-2 text-base text-gray-900 font-medium leading-5"
                numberOfLines={2}
              >
                {address}
              </Text>
            </View>
          </View>
        )}

        {/* Bottom Sheet */}
        <View
          className="bg-white px-4 pt-2 rounded-t-2xl"
          style={{
            paddingBottom: 34,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          {/* Drag Indicator */}
          <View className="w-9 h-1 bg-gray-300 rounded-sm self-center mb-4" />

          {/* Instruction Text */}
          {!address && (
            <Text className="text-center text-gray-500 text-sm mb-4 italic">
              Tap anywhere on the map to select a location
            </Text>
          )}

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 bg-cyan-50 border border-teal-600 rounded-lg py-3.5 items-center justify-center"
              onPress={handleCurrentLocation}
              disabled={isLoading}
            >
              <View className="flex-row items-center gap-1.5">
                {isLoading ? (
                  <ActivityIndicator size="small" color="#008080" />
                ) : (
                  <Ionicons name="locate" size={18} color="#008080" />
                )}
                <Text className="text-teal-600 text-base font-medium">
                  {isLoading ? "Locating..." : "Current Location"}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 rounded-lg py-3.5 items-center justify-center ${
                address ? "bg-teal-600" : "bg-gray-100 border border-gray-300"
              }`}
              onPress={handleConfirmSelection}
              disabled={!address}
            >
              <Text
                className={`text-base font-semibold ${
                  address ? "text-white" : "text-gray-400"
                }`}
              >
                Confirm Location
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default MapLocationSelector;
