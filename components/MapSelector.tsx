// import React, { useState, useRef } from "react";
// import { View, Text, StyleSheet, Dimensions, Alert } from "react-native";
// import MapView, { Marker } from "react-native-maps";
// import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

// const { width, height } = Dimensions.get("window");

// const ExploreMapSelector = () => {
//   const [marker, setMarker] = useState({
//     latitude: 7.8731,
//     longitude: 80.7718,
//   });

//   const mapRef = useRef<MapView | null>(null);

//   const handlePlaceSelect = (data: any, details: any = null) => {
//     if (!details || !details.geometry || !details.geometry.location) {
//       Alert.alert("Place Error", "Failed to fetch place details. Please try again.");
//       return;
//     }

//     const lat = details.geometry.location.lat;
//     const lng = details.geometry.location.lng;

//     setMarker({ latitude: lat, longitude: lng });

//     mapRef.current?.animateToRegion(
//       {
//         latitude: lat,
//         longitude: lng,
//         latitudeDelta: 0.01,
//         longitudeDelta: 0.01,
//       },
//       500
//     );
//   };

//   return (
//     <View style={styles.container}>
//       {/* Google Places Search */}
//       <GooglePlacesAutocomplete
//         placeholder="Search for a place"
//         onPress={handlePlaceSelect}
//         fetchDetails={true}
//         query={{
//           key: "AIzaSyA47Q-I515EK0DU4pvk5jgUcatYcdnf8cY", // Replace with your own key!
//           language: "en",
//           components: "country:lk", // Sri Lanka filter
//         }}
//         styles={{
//           container: styles.autocompleteContainer,
//           textInput: styles.textInput,
//         }}
//         enablePoweredByContainer={false}
//         debounce={300}
//         nearbyPlacesAPI="GooglePlacesSearch"
//       />

//       {/* Map */}
//       <MapView
//         ref={mapRef}
//         style={styles.map}
//         initialRegion={{
//           latitude: marker.latitude,
//           longitude: marker.longitude,
//           latitudeDelta: 0.04,
//           longitudeDelta: 0.05,
//         }}
//         onPress={(e) => setMarker(e.nativeEvent.coordinate)}
//       >
//         <Marker
//           coordinate={marker}
//           draggable
//           onDragEnd={(e) => setMarker(e.nativeEvent.coordinate)}
//         />
//       </MapView>

//       {/* Coordinates box */}
//       <View style={styles.coordsBox}>
//         <Text style={styles.coordText}>
//           📍 {marker.latitude.toFixed(5)}, {marker.longitude.toFixed(5)}
//         </Text>
//       </View>
//     </View>
//   );
// };

// export default ExploreMapSelector;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   autocompleteContainer: {
//     position: "absolute",
//     top: 50,
//     width: "90%",
//     alignSelf: "center",
//     zIndex: 2,
//   },
//   textInput: {
//     height: 48,
//     backgroundColor: "#fff",
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     fontSize: 16,
//   },
//   map: {
//     flex: 1,
//   },
//   coordsBox: {
//     position: "absolute",
//     bottom: 40,
//     backgroundColor: "#fff",
//     padding: 10,
//     borderRadius: 12,
//     alignSelf: "center",
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowRadius: 10,
//     elevation: 5,
//   },
//   coordText: {
//     fontSize: 14,
//     color: "#333",
//   },
// });
