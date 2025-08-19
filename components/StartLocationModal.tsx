import { Location } from "@/types/triptypes";
import { Ionicons } from "@expo/vector-icons";
import * as ExpoLocation from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import LongButton from "./LongButton";
import { BlurView } from 'expo-blur';
import { Animated as RNAnimated } from 'react-native';

interface StartLocationModalProps {
  visible: boolean;
  onLocationSelect: (location: Location) => void;
  onClose: () => void;
}

const START_LOCATION_MODAL_HEIGHT = 0.7; // 70% of screen
const screenHeight = Dimensions.get("window").height;

export default function StartLocationModal({
  visible,
  onLocationSelect,
  onClose,
}: StartLocationModalProps) {
  // Blur animation
  const blurAnim = useRef(new RNAnimated.Value(0)).current;
  // Modal animation
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Location states
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Map states
  const [showMap, setShowMap] = useState(false);
  const [region, setRegion] = useState<Region>({
    latitude: 7.8731, // Center of Sri Lanka
    longitude: 80.7718,
    latitudeDelta: 2.0,
    longitudeDelta: 2.0,
  });
  const [mapLocation, setMapLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
      RNAnimated.timing(blurAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
      RNAnimated.timing(blurAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location Permission Required",
          "Please grant location permission to use your current location as start point."
        );
        setIsLoadingLocation(false);
        return;
      }

      const location = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.High,
      });

      const reverseGeocode = await ExpoLocation.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const startLocation: Location = {
          locationId: null,
          formattedAddress: `${address.street || ""} ${
            address.streetNumber || ""
          }, ${address.city || ""}, ${address.region || ""}`.trim(),
          city: address.city || "Unknown City",
          district: address.subregion || address.region || "Unknown District",
          province: address.region || "Unknown Province",
          country: address.country || "Sri Lanka",
          postalCode: address.postalCode || "",
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        setSelectedLocation(startLocation);
      } else {
        Alert.alert(
          "Error",
          "Could not determine your address. Please try again."
        );
      }
    } catch (error) {
      console.error("Error getting current location:", error);
      Alert.alert(
        "Location Error",
        "Could not get your current location. Please check your GPS and try again."
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleCoordinateInput = () => {
    Alert.prompt(
      "Enter Coordinates",
      "Enter latitude and longitude separated by comma\n(e.g., 6.9271, 79.8612 for Colombo)",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK",
          onPress: async (coordinates) => {
            if (coordinates) {
              const coords = coordinates.split(",");
              if (coords.length !== 2) {
                Alert.alert(
                  "Invalid Format",
                  "Please enter coordinates in the format: latitude, longitude"
                );
                return;
              }

              const [lat, lng] = coords.map((coord) =>
                parseFloat(coord.trim())
              );

              if (isNaN(lat) || isNaN(lng)) {
                Alert.alert(
                  "Invalid Coordinates",
                  "Please enter valid numeric coordinates."
                );
                return;
              }

              if (lat < 5.9 || lat > 9.9 || lng < 79.6 || lng > 81.9) {
                Alert.alert(
                  "Location Outside Sri Lanka",
                  "The coordinates you entered appear to be outside Sri Lanka. Are you sure you want to continue?",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Continue",
                      onPress: () => processCoordinates(lat, lng),
                    },
                  ]
                );
                return;
              }

              processCoordinates(lat, lng);
            }
          },
        },
      ],
      "plain-text"
    );
  };

  const processCoordinates = async (lat: number, lng: number) => {
    setIsLoadingLocation(true);
    try {
      const reverseGeocode = await ExpoLocation.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const startLocation: Location = {
          locationId: null,
          formattedAddress: `${address.street || ""} ${
            address.streetNumber || ""
          }, ${address.city || ""}, ${address.region || ""}`.trim(),
          city: address.city || "Unknown City",
          district: address.subregion || address.region || "Unknown District",
          province: address.region || "Unknown Province",
          country: address.country || "Sri Lanka",
          postalCode: address.postalCode || "",
          latitude: lat,
          longitude: lng,
        };

        setSelectedLocation(startLocation);
      } else {
        const startLocation: Location = {
          locationId: null,
          formattedAddress: `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          city: "Unknown City",
          district: "Unknown District",
          province: "Unknown Province",
          country: "Sri Lanka",
          postalCode: "",
          latitude: lat,
          longitude: lng,
        };

        setSelectedLocation(startLocation);
      }
    } catch (error) {
      console.error("Error processing coordinates:", error);
      Alert.alert(
        "Error",
        "Could not process the coordinates. Please try again or use a different method."
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const searchLocations = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const geocodeResult = await ExpoLocation.geocodeAsync(query);
      const results: Location[] = [];

      for (const result of geocodeResult.slice(0, 5)) {
        try {
          const reverseGeocode = await ExpoLocation.reverseGeocodeAsync({
            latitude: result.latitude,
            longitude: result.longitude,
          });

          if (reverseGeocode.length > 0) {
            const address = reverseGeocode[0];
            results.push({
              locationId: null,
              formattedAddress: `${address.street || ""} ${
                address.streetNumber || ""
              }, ${address.city || ""}, ${address.region || ""}`.trim(),
              city: address.city || "Unknown City",
              district:
                address.subregion || address.region || "Unknown District",
              province: address.region || "Unknown Province",
              country: address.country || "Sri Lanka",
              postalCode: address.postalCode || "",
              latitude: result.latitude,
              longitude: result.longitude,
            });
          }
        } catch (error) {
          continue;
        }
      }

      setSearchResults(results);
    } catch (error) {
      console.error("Error searching locations:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInputChange = (text: string) => {
    setSearchQuery(text);
    searchLocations(text);
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setMapLocation({ latitude, longitude });
    processCoordinates(latitude, longitude);
  };

  const handleLocationSelect = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
    }
  };

  const modalTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight * START_LOCATION_MODAL_HEIGHT, 0],
  });

  const popularLocations = [
    {
      name: "Bandaranaike International Airport",
      city: "Katunayake",
      lat: 7.1808,
      lng: 79.8841,
    },
    {
      name: "Colombo Fort Railway Station",
      city: "Colombo",
      lat: 6.9344,
      lng: 79.8428,
    },
    { name: "Galle Face Green", city: "Colombo", lat: 6.9237, lng: 79.842 },
    { name: "Kandy City Center", city: "Kandy", lat: 7.2906, lng: 80.6337 },
    { name: "Ella Railway Station", city: "Ella", lat: 6.8719, lng: 81.0463 },
    { name: "Unawatuna Beach", city: "Galle", lat: 6.0104, lng: 80.2489 },
  ];

  return (
    <Modal visible={visible} transparent animationType="none">
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >

        {/* Blur background with fade-in animation */}
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
            onClose();
          }}
        >
          <RNAnimated.View style={[StyleSheet.absoluteFill, { opacity: blurAnim }]}> 
            <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
          </RNAnimated.View>
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.modal,
            { 
              transform: [{ translateY: modalTranslateY }],
              height: selectedLocation ? "80%" : "70%" // Increase height when location is selected
            },
          ]}
        >
          {!showMap ? (
            <Text style={styles.modalTitle}>Choose Start Location</Text>
          ) : (
            // Header with back button for map view
            <View style={styles.mapHeaderRow}>
              <TouchableOpacity
                style={styles.mapBackButton}
                onPress={() => setShowMap(false)}
              >
                <Ionicons name="arrow-back" size={24} color="#008080" />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, styles.mapHeaderTitle]}>Choose Start Location</Text>
              <View style={styles.mapHeaderSpacer} />
            </View>
          )}

          {!showMap ? (
            // Main selection screen
            <View style={styles.content}>
              <Text style={styles.sectionTitle}>
                How would you like to set your start location?
              </Text>


              {/* Row of location selection buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.optionButton, styles.optionButtonRow]}
                  onPress={getCurrentLocation}
                  disabled={isLoadingLocation}
                >
                  <Ionicons name="location" size={24} color="#008080" />
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>Use Current Location</Text>
                  </View>
                  {isLoadingLocation && (
                    <ActivityIndicator size="small" color="#008080" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.optionButton, styles.optionButtonRow]}
                  onPress={() => setShowMap(true)}
                >
                  <Ionicons name="map" size={24} color="#008080" />
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>Select on Map</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Popular Locations */}
              <Text style={styles.sectionTitle}>Popular Start Locations</Text>
              <FlatList
                data={popularLocations}
                keyExtractor={(item, index) => `${item.name}-${item.city}-${index}`}
                style={styles.popularLocationsList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.popularLocationItem}
                    onPress={() => processCoordinates(item.lat, item.lng)}
                  >
                    <Ionicons
                      name="location-outline"
                      size={20}
                      color="#008080"
                    />
                    <View style={styles.locationTextContainer}>
                      <Text style={styles.locationTitle}>{item.name}</Text>
                      <Text style={styles.locationSubtitle}>{item.city}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />

              {selectedLocation && (
                <View style={styles.selectedLocationContainer}>
                  <Text style={styles.selectedLocationTitle}>
                    Selected Location:
                  </Text>
                  <Text style={styles.selectedLocationText}>
                    {selectedLocation.formattedAddress}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            // Map interface
            <View style={styles.mapContainer}>
              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <Ionicons
                  name="search"
                  size={20}
                  color="#6B7280"
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search for a location..."
                  value={searchQuery}
                  onChangeText={handleSearchInputChange}
                />
                {isSearching && (
                  <ActivityIndicator size="small" color="#008080" />
                )}
              </View>

              {/* Map */}
              <MapView
                style={styles.map}
                region={region}
                onPress={handleMapPress}
                showsUserLocation={true}
                mapType="standard"
                onRegionChangeComplete={setRegion}
              >
                {mapLocation && (
                  <Marker
                    coordinate={mapLocation}
                    title="Selected Start Location"
                    pinColor="#008080"
                  />
                )}
              </MapView>

              {/* Search Results */}
              {searchQuery.length >= 3 && (
                <View style={styles.searchResultsContainer}>
                  <FlatList
                    data={searchResults}
                    keyExtractor={(item, index) => index.toString()}
                    style={styles.searchResultsList}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.searchResultItem}
                        onPress={() => {
                          setSelectedLocation(item);
                          setMapLocation({
                            latitude: item.latitude,
                            longitude: item.longitude,
                          });
                          setRegion({
                            latitude: item.latitude,
                            longitude: item.longitude,
                            latitudeDelta: 0.02,
                            longitudeDelta: 0.02,
                          });
                          setSearchQuery("");
                          setSearchResults([]);
                        }}
                      >
                        <Ionicons
                          name="location-outline"
                          size={20}
                          color="#6B7280"
                        />
                        <View style={styles.resultTextContainer}>
                          <Text style={styles.resultTitle}>{item.city}</Text>
                          <Text style={styles.resultSubtitle}>
                            {item.formattedAddress}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              )}
            </View>
          )}

          {/* Confirm Button */}
          {selectedLocation && (
            <View style={styles.buttonContainer}>
              <LongButton
                label="Confirm Start Location"
                onPress={handleLocationSelect}
              />
            </View>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "transparent",
  },
  modal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 20,
    height: "70%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    color: "#111827",
    marginBottom: 20,
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#008080",
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flex: 1,
    marginRight: 8,
    marginBottom: 0,
  },
  optionButtonRow: {
    marginBottom: 0,
    marginRight: 0,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  optionTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  optionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  popularLocationsList: {
    flex: 1,
    marginBottom: 16,
  },
  popularLocationItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
  },
  locationTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  locationSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  selectedLocationContainer: {
    backgroundColor: "#E6F7FF",
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#008080",
  },
  selectedLocationTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#008080",
    marginBottom: 4,
  },
  selectedLocationText: {
    fontSize: 14,
    color: "#374151",
  },
  mapContainer: {
    flex: 1,
  },
  mapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    fontSize: 16,
    color: "#008080",
    marginLeft: 8,
    fontWeight: "500",
  },
  coordinateButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#F0F8FF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#008080",
  },
  coordinateButtonText: {
    fontSize: 14,
    color: "#008080",
    marginLeft: 6,
    fontWeight: "500",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#374151",
  },
  map: {
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  searchResultsContainer: {
    maxHeight: 150,
    backgroundColor: "#fff",
  },
  searchResultsList: {
    maxHeight: 150,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  resultTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  resultSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  buttonContainer: {
    marginTop: 16,
    paddingHorizontal: 0,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    flex: 1,
    marginBottom: 0,
  },
  headerSpacer: {
    width: 24,
  },
  mapHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
    height: 24, // Reduced height to match main title
  },
  mapBackButton: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    zIndex: 2,
  },
  mapHeaderTitle: {
    flex: 1,
    marginBottom: 0,
    textAlign: "center",
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    zIndex: 1,
  },
  mapHeaderSpacer: {
    width: 24,
  },
});
