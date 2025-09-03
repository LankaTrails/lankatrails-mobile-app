import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  Region,
  Polyline,
} from "react-native-maps";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import { getTripById, getTripItemsByTripId } from "@/services/tripService";
import { Trip, TripItem } from "@/types/triptypes";
import { ServiceType } from "@/types/commonTypes";
import BackButton from "../../../../components/BackButton";
import TripMapMarker from "../../../../components/TripMapMarker";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import {
  getDirections,
  DirectionsRoute,
  DirectionsWaypoint,
} from "@/services/googleDirectionsService";

const { width, height } = Dimensions.get("window");

interface MapMarker {
  id: string;
  title: string;
  description: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  type: "start_location" | "trip_item";
  itemType?: "PLACE" | "SERVICE";
  serviceCategory?: ServiceType;
  startTime?: string;
  endTime?: string;
  cost?: number;
  participants?: {
    adults: number;
    children: number;
  };
}

const TripMapView: React.FC = () => {
  const navigation = useNavigation();
  const { id: tripId } = useLocalSearchParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [tripItems, setTripItems] = useState<TripItem[]>([]);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [showLegend, setShowLegend] = useState(false);
  const [showRoutes, setShowRoutes] = useState(true); // Enable routes by default
  const [routeSegments, setRouteSegments] = useState<DirectionsRoute[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<
    { latitude: number; longitude: number }[]
  >([]);
  const mapRef = useRef<MapView>(null);

  // Debug: Log the tripId to see what we're receiving
  useEffect(() => {
    console.log("TripMapView received tripId:", tripId, "Type:", typeof tripId);
  }, [tripId]);

  // Hide tab bar when this screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const parent = navigation.getParent();
      if (parent) {
        parent.setOptions({
          tabBarStyle: { display: "none" },
        });
      }

      return () => {
        if (parent) {
          parent.setOptions({
            tabBarStyle: {
              backgroundColor: "#ffffff",
              borderTopWidth: 0,
              height: 70,
              borderRadius: 35,
              marginHorizontal: 16,
              marginBottom: 16,
              position: "absolute",
              bottom: 10,
              left: 16,
              right: 16,
              elevation: 1,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
            },
          });
        }
      };
    }, [navigation])
  );

  // Create driving routes between trip items using Google Directions API
  useEffect(() => {
    const fetchRoutes = async () => {
      if (markers.length > 1 && showRoutes) {
        setLoadingRoutes(true);
        setRouteSegments([]);

        try {
          // Sort markers by time (start location first, then by startTime)
          const sortedMarkers = [...markers].sort((a, b) => {
            if (a.type === "start_location") return -1;
            if (b.type === "start_location") return 1;
            if (!a.startTime || !b.startTime) return 0;
            return (
              new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
            );
          });

          console.log("Creating routes for", sortedMarkers.length, "markers");

          const routes: DirectionsRoute[] = [];

          // Create route segments between consecutive markers
          for (let i = 0; i < sortedMarkers.length - 1; i++) {
            const origin: DirectionsWaypoint = {
              latitude: sortedMarkers[i].coordinate.latitude,
              longitude: sortedMarkers[i].coordinate.longitude,
            };

            const destination: DirectionsWaypoint = {
              latitude: sortedMarkers[i + 1].coordinate.latitude,
              longitude: sortedMarkers[i + 1].coordinate.longitude,
            };

            console.log(
              `Getting route ${i + 1}/${sortedMarkers.length - 1}: ${
                sortedMarkers[i].title
              } → ${sortedMarkers[i + 1].title}`
            );

            const route = await getDirections(
              origin,
              destination,
              [],
              "driving"
            );

            if (route) {
              routes.push(route);
              console.log(
                `Route ${i + 1} found: ${route.distance}, ${route.duration}, ${
                  route.coordinates.length
                } points`
              );
            } else {
              console.warn(
                `No route found between ${sortedMarkers[i].title} and ${
                  sortedMarkers[i + 1].title
                }`
              );
            }

            // Add small delay to avoid rate limiting
            await new Promise((resolve) => setTimeout(resolve, 200));
          }

          setRouteSegments(routes);

          // Also set the basic coordinates for fallback polyline
          const coordinates = sortedMarkers.map((marker) => marker.coordinate);
          setRouteCoordinates(coordinates);

          console.log("All routes fetched:", routes.length, "segments");
        } catch (error) {
          console.error("Error fetching routes:", error);
          // Fallback to simple straight lines
          const coordinates = markers.map((marker) => marker.coordinate);
          setRouteCoordinates(coordinates);
        } finally {
          setLoadingRoutes(false);
        }
      } else {
        setRouteSegments([]);
        setRouteCoordinates([]);
      }
    };

    fetchRoutes();
  }, [markers, showRoutes]);
  const getMarkerColor = (type: string): string => {
    if (type === "start_location") {
      return "#10B981"; // Green for start location
    }

    if (type === "PLACE") {
      return "#6366F1"; // Purple for places
    }

    // Colors for different service categories
    switch (type) {
      case "ACCOMMODATION":
        return "#EF4444"; // Red
      case "ACTIVITY":
        return "#F59E0B"; // Orange
      case "TOUR_GUIDE":
        return "#8B5CF6"; // Purple
      case "TRANSPORT":
        return "#3B82F6"; // Blue
      case "FOOD_BEVERAGE":
        return "#EC4899"; // Pink
      default:
        return "#6B7280"; // Gray
    }
  };

  // Fetch trip data and items
  useEffect(() => {
    const fetchTripData = async () => {
      console.log("MapView - tripId received:", tripId, "type:", typeof tripId);

      if (!tripId) {
        console.error("MapView - No tripId provided");
        Alert.alert("Error", "Trip ID is required");
        setLoading(false);
        return;
      }

      // Validate tripId - ensure it's a valid number
      const parsedTripId = Array.isArray(tripId) ? tripId[0] : tripId;
      console.log(
        "MapView - parsedTripId:",
        parsedTripId,
        "type:",
        typeof parsedTripId
      );

      const numericTripId = parseInt(parsedTripId as string, 10);
      console.log(
        "MapView - numericTripId:",
        numericTripId,
        "isNaN:",
        isNaN(numericTripId)
      );

      if (isNaN(numericTripId)) {
        console.error(
          "MapView - Invalid tripId:",
          tripId,
          "parsed:",
          parsedTripId,
          "numeric:",
          numericTripId
        );
        Alert.alert("Error", `Invalid trip ID: ${parsedTripId}`);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("MapView - Fetching trip with ID:", numericTripId);

        // Fetch trip details
        const tripResponse = await getTripById(numericTripId);
        if (!tripResponse.success || !tripResponse.data) {
          Alert.alert("Error", "Failed to load trip details");
          return;
        }

        setTrip(tripResponse.data);

        // Fetch trip items
        const itemsResponse = await getTripItemsByTripId(numericTripId);
        if (itemsResponse.success && itemsResponse.data) {
          setTripItems(itemsResponse.data);
        }
      } catch (error) {
        console.error("Error fetching trip data:", error);
        Alert.alert("Error", "Failed to load trip data");
      } finally {
        setLoading(false);
      }
    };

    fetchTripData();
  }, [tripId]);

  // Process trip data into map markers
  useEffect(() => {
    const processMarkers = () => {
      const newMarkers: MapMarker[] = [];

      // Add start location marker
      if (
        trip?.startLocation &&
        trip.startLocation.latitude &&
        trip.startLocation.longitude
      ) {
        newMarkers.push({
          id: "start-location",
          title: "Trip Start Location",
          description:
            trip.startLocation.formattedAddress ||
            `${trip.startLocation.city}, ${trip.startLocation.country}`,
          coordinate: {
            latitude: trip.startLocation.latitude,
            longitude: trip.startLocation.longitude,
          },
          type: "start_location",
        });
      }

      // Add trip item markers
      tripItems.forEach((item, index) => {
        let coordinate: { latitude: number; longitude: number } | null = null;
        let title = "";
        let description = "";

        if (item.type === "PLACE" && item.place) {
          if (
            item.place.latitude !== null &&
            item.place.longitude !== null &&
            item.place.latitude !== undefined &&
            item.place.longitude !== undefined
          ) {
            coordinate = {
              latitude: item.place.latitude,
              longitude: item.place.longitude,
            };
            title = item.place.placeName || "Unknown Place";
            description = `Visit this place`;
          }
        } else if (item.type === "SERVICE" && item.service) {
          // Get the first valid location from service locations
          if (item.service.locations && item.service.locations.length > 0) {
            const validLocation = item.service.locations.find(
              (loc) =>
                loc.latitude !== null &&
                loc.longitude !== null &&
                loc.latitude !== undefined &&
                loc.longitude !== undefined
            );

            if (validLocation) {
              coordinate = {
                latitude: validLocation.latitude,
                longitude: validLocation.longitude,
              };
              title = item.service.serviceName || "Unknown Service";
              description = item.service.category
                ? `${item.service.category} service`
                : "Service";
            }
          }
        }

        if (coordinate) {
          const startTime = item.startTime
            ? new Date(item.startTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : undefined;
          const endTime = item.endTime
            ? new Date(item.endTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : undefined;

          let timeString = "";
          if (startTime) {
            timeString = `\nTime: ${startTime}${
              endTime ? ` - ${endTime}` : ""
            }`;
          }

          newMarkers.push({
            id: `item-${index}`,
            title,
            description: `${description}${timeString}`,
            coordinate,
            type: "trip_item",
            itemType: item.type,
            serviceCategory: item.service?.category || undefined,
            startTime: item.startTime,
            endTime: item.endTime,
            participants: {
              adults: item.numberOfAdults || 0,
              children: item.numberOfChildren || 0,
            },
          });
        }
      });

      setMarkers(newMarkers);
    };

    if (trip || tripItems.length > 0) {
      processMarkers();
    }
  }, [trip, tripItems]);

  // Calculate map region to fit all markers
  const getMapRegion = (): Region => {
    if (markers.length === 0) {
      // Default to Sri Lanka if no markers
      return {
        latitude: 7.8731,
        longitude: 80.7718,
        latitudeDelta: 3.0,
        longitudeDelta: 3.0,
      };
    }

    if (markers.length === 1) {
      return {
        latitude: markers[0].coordinate.latitude,
        longitude: markers[0].coordinate.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }

    // Calculate bounds
    let minLat = markers[0].coordinate.latitude;
    let maxLat = markers[0].coordinate.latitude;
    let minLng = markers[0].coordinate.longitude;
    let maxLng = markers[0].coordinate.longitude;

    markers.forEach((marker) => {
      minLat = Math.min(minLat, marker.coordinate.latitude);
      maxLat = Math.max(maxLat, marker.coordinate.latitude);
      minLng = Math.min(minLng, marker.coordinate.longitude);
      maxLng = Math.max(maxLng, marker.coordinate.longitude);
    });

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const deltaLat = (maxLat - minLat) * 1.2; // Add 20% padding
    const deltaLng = (maxLng - minLng) * 1.2;

    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: Math.max(deltaLat, 0.01),
      longitudeDelta: Math.max(deltaLng, 0.01),
    };
  };

  // Handle marker press
  const handleMarkerPress = (marker: MapMarker) => {
    setSelectedMarker(marker);

    // Animate to marker
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          ...marker.coordinate,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    }
  };

  // Fit all markers on map
  const fitAllMarkers = () => {
    if (mapRef.current && markers.length > 0) {
      const region = getMapRegion();
      mapRef.current.animateToRegion(region, 1000);
    }
  };

  // Toggle route display
  const toggleRoutes = () => {
    setShowRoutes(!showRoutes);
  };

  // Legend items
  const legendItems = [
    {
      type: "start_location",
      label: "Start Location",
      color: getMarkerColor("start_location"),
      icon: "flag",
    },
    {
      type: "PLACE",
      label: "Places",
      color: getMarkerColor("PLACE"),
      icon: "location",
    },
    {
      type: "ACCOMMODATION",
      label: "Accommodation",
      color: getMarkerColor("ACCOMMODATION"),
      icon: "bed",
    },
    {
      type: "ACTIVITY",
      label: "Activities",
      color: getMarkerColor("ACTIVITY"),
      icon: "flash",
    },
    {
      type: "TOUR_GUIDE",
      label: "Tour Guide",
      color: getMarkerColor("TOUR_GUIDE"),
      icon: "person",
    },
    {
      type: "TRANSPORT",
      label: "Transport",
      color: getMarkerColor("TRANSPORT"),
      icon: "car",
    },
    {
      type: "FOOD_BEVERAGE",
      label: "Food & Beverage",
      color: getMarkerColor("FOOD_BEVERAGE"),
      icon: "restaurant",
    },
  ];

  if (loading) {
    return (
      <View style={styles.fullScreenContainer}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#008080" />
          <Text style={styles.loadingText}>Loading trip map...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.fullScreenContainer}>
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={getMapRegion()}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
        >
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              coordinate={marker.coordinate}
              title={marker.title}
              description={marker.description}
              onPress={() => handleMarkerPress(marker)}
            >
              <TripMapMarker
                type={marker.type}
                itemType={marker.itemType}
                serviceCategory={marker.serviceCategory}
                isSelected={selectedMarker?.id === marker.id}
                size={40}
              />
            </Marker>
          ))}

          {/* Google Directions Routes */}
          {showRoutes &&
            routeSegments.map((route, index) => (
              <Polyline
                key={`route-${index}`}
                coordinates={route.coordinates}
                strokeColor="#008080"
                strokeWidth={4}
                lineCap="round"
                lineJoin="round"
              />
            ))}

          {/* Fallback route polyline for simple connections */}
          {showRoutes &&
            routeSegments.length === 0 &&
            routeCoordinates.length > 1 && (
              <Polyline
                coordinates={routeCoordinates}
                strokeColor="#008080"
                strokeWidth={3}
                lineDashPattern={[10, 10]}
              />
            )}
        </MapView>

        {/* Floating Controls */}
        <View style={styles.topLeftControls}>
          <TouchableOpacity
            style={styles.floatingBackButton}
            onPress={() => router.back()}
          >
            <Icon name="arrow-back" size={24} color="#008080" />
          </TouchableOpacity>
        </View>

        <View style={styles.topRightControls}>
          <TouchableOpacity
            style={[
              styles.floatingControlButton,
              showRoutes && styles.activeFloatingButton,
            ]}
            onPress={toggleRoutes}
            disabled={loadingRoutes}
          >
            {loadingRoutes ? (
              <ActivityIndicator
                size={16}
                color={showRoutes ? "#ffffff" : "#008080"}
              />
            ) : (
              <Icon
                name="git-branch"
                size={20}
                color={showRoutes ? "#ffffff" : "#008080"}
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.floatingControlButton,
              showLegend && styles.activeFloatingButton,
            ]}
            onPress={() => setShowLegend(!showLegend)}
          >
            <Icon
              name="list"
              size={20}
              color={showLegend ? "#ffffff" : "#008080"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.floatingControlButton}
            onPress={fitAllMarkers}
          >
            <Icon name="scan" size={20} color="#008080" />
          </TouchableOpacity>
        </View>

        {/* Trip Summary Card */}
        {/* {trip && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>{trip.tripName}</Text>
            <View style={styles.summaryStats}>
              <View style={styles.statItem}>
                <Icon name="calendar" size={14} color="#6B7280" />
                <Text style={styles.statText}>
                  {new Date(trip.startDate).toLocaleDateString()} -{" "}
                  {new Date(trip.endDate).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="location" size={14} color="#6B7280" />
                <Text style={styles.statText}>{markers.length} locations</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="people" size={14} color="#6B7280" />
                <Text style={styles.statText}>
                  {trip.numberOfAdults} adults
                  {trip.numberOfChildren > 0 &&
                    `, ${trip.numberOfChildren} children`}
                </Text>
              </View>
            </View>
          </View>
        )} */}

        {/* Legend */}
        {showLegend && (
          <View style={styles.legend}>
            <View style={styles.legendHeader}>
              <Text style={styles.legendTitle}>Map Legend</Text>
              <TouchableOpacity
                onPress={() => setShowLegend(false)}
                style={styles.legendClose}
              >
                <Icon name="close" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.legendScroll}
              showsVerticalScrollIndicator={false}
            >
              {legendItems.map((item) => (
                <View key={item.type} style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendColor,
                      { backgroundColor: item.color },
                    ]}
                  >
                    <Icon name={item.icon} size={12} color="white" />
                  </View>
                  <Text style={styles.legendText}>{item.label}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Route Information */}
        {showRoutes && routeSegments.length > 0 && (
          <View style={styles.routeInfoPanel}>
            <View style={styles.routeInfoHeader}>
              <Icon name="car" size={16} color="#008080" />
              <Text style={styles.routeInfoTitle}>Driving Route</Text>
            </View>
            <View style={styles.routeStats}>
              <View style={styles.routeStat}>
                <Text style={styles.routeStatValue}>
                  {routeSegments
                    .reduce((total, segment) => {
                      const distance = parseFloat(
                        segment.distance.replace(/[^\d.]/g, "")
                      );
                      return total + (isNaN(distance) ? 0 : distance);
                    }, 0)
                    .toFixed(1)}{" "}
                  km
                </Text>
                <Text style={styles.routeStatLabel}>Total Distance</Text>
              </View>
              <View style={styles.routeStat}>
                <Text style={styles.routeStatValue}>
                  {routeSegments.reduce((total, segment) => {
                    const duration = parseInt(
                      segment.duration.replace(/[^\d]/g, "")
                    );
                    return total + (isNaN(duration) ? 0 : duration);
                  }, 0)}{" "}
                  min
                </Text>
                <Text style={styles.routeStatLabel}>Driving Time</Text>
              </View>
              <View style={styles.routeStat}>
                <Text style={styles.routeStatValue}>
                  {routeSegments.length}
                </Text>
                <Text style={styles.routeStatLabel}>Route Segments</Text>
              </View>
            </View>
          </View>
        )}

        {/* Selected Marker Info */}
        {selectedMarker && (
          <View style={styles.markerInfo}>
            <View style={styles.markerInfoHeader}>
              <View style={styles.markerTitleContainer}>
                <View
                  style={[
                    styles.markerTypeIndicator,
                    {
                      backgroundColor: getMarkerColor(
                        selectedMarker.type === "start_location"
                          ? "start_location"
                          : selectedMarker.itemType === "PLACE"
                          ? "PLACE"
                          : selectedMarker.serviceCategory || "default"
                      ),
                    },
                  ]}
                >
                  <Icon
                    name={
                      selectedMarker.type === "start_location"
                        ? "flag"
                        : selectedMarker.itemType === "PLACE"
                        ? "location"
                        : selectedMarker.serviceCategory === "ACCOMMODATION"
                        ? "bed"
                        : selectedMarker.serviceCategory === "ACTIVITY"
                        ? "flash"
                        : selectedMarker.serviceCategory === "TOUR_GUIDE"
                        ? "person"
                        : selectedMarker.serviceCategory === "TRANSPORT"
                        ? "car"
                        : selectedMarker.serviceCategory === "FOOD_BEVERAGE"
                        ? "restaurant"
                        : "pin"
                    }
                    size={16}
                    color="white"
                  />
                </View>
                <Text style={styles.markerTitle}>{selectedMarker.title}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedMarker(null)}
                style={styles.closeButton}
              >
                <Icon name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <Text style={styles.markerDescription}>
              {selectedMarker.description}
            </Text>
            {selectedMarker.participants && (
              <Text style={styles.participantsText}>
                👥 {selectedMarker.participants.adults} adults
                {selectedMarker.participants.children > 0 &&
                  `, ${selectedMarker.participants.children} children`}
              </Text>
            )}
            {selectedMarker.type === "trip_item" && (
              <View style={styles.markerActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Icon name="information-circle" size={16} color="#008080" />
                  <Text style={styles.actionButtonText}>Details</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  topLeftControls: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 1000,
  },
  topRightControls: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1000,
    gap: 12,
  },
  floatingBackButton: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  floatingControlButton: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  activeFloatingButton: {
    backgroundColor: "#008080",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  summaryCard: {
    position: "absolute",
    top: 120, // Position below floating controls
    left: 20,
    right: 20,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  statText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  map: {
    width: width,
    height: "100%",
  },
  legend: {
    position: "absolute",
    top: 200, // Position below floating controls
    left: 20,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    maxWidth: 300,
    maxHeight: 400,
  },
  legendHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  legendClose: {
    padding: 4,
  },
  legendScroll: {
    maxHeight: 200,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  legendText: {
    fontSize: 12,
    color: "#374151",
    flex: 1,
  },
  markerInfo: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  markerInfoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  markerTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  markerTypeIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  markerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  markerDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 8,
  },
  participantsText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 8,
  },
  markerActions: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F9FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  actionButtonText: {
    fontSize: 12,
    color: "#008080",
    marginLeft: 4,
    fontWeight: "500",
  },
  // Route Information Styles
  routeInfoPanel: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  routeInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  routeInfoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 8,
  },
  routeStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  routeStat: {
    alignItems: "center",
    flex: 1,
  },
  routeStatValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#008080",
    marginBottom: 4,
  },
  routeStatLabel: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
});

export default TripMapView;
