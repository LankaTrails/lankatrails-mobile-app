import React, { useEffect, useState } from 'react';
import { View, Button, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import axios from 'axios';
import polyline from '@mapbox/polyline';

const { width, height } = Dimensions.get('window');

type Place = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  icon: any;
  type: 'provider' | 'public_place';
};

const SAMPLE_PLACES: Place[] = [
  {
    id: "1",
    name: "ABC Hotel",
    lat: 6.9271,
    lng: 79.8612,
    icon: require("../../assets/icons/hotel.png"),
    type: "provider",
  },
  {
    id: "2",
    name: "Galle Face Green",
    lat: 6.9275,
    lng: 79.8440,
    icon: require("../../assets/icons/park.png"),
    type: "public_place",
  },
  {
    id: "3",
    name: "Galle Fort",
    lat: 6.0260,
    lng: 80.2170,
    icon: require("../../assets/icons/park.png"),
    type: "public_place",
  },
  {
    id: "4",
    name: "Kandy Lake",
    lat: 7.2906,
    lng: 80.6337,
    icon: require("../../assets/icons/beach.png"),
    type: "public_place",
  },
  {
    id: "5",
    name: "Temple of the Tooth",
    lat: 7.2936,
    lng: 80.6413,
    icon: require("../../assets/icons/hotel.png"),
    type: "public_place",
  },
  {
    id: "6",
    name: "Sigiriya Rock Fortress",
    lat: 7.9569,
    lng: 80.7594,
    icon: require("../../assets/icons/park.png"),
    type: "public_place",
  }
];

const GOOGLE_API_KEY = "AIzaSyA47Q-I515EK0DU4pvk5jgUcatYcdnf8cY";

export default function MapScreen() {
  const [origin, setOrigin] = useState<Place | null>(null);
  const [destination, setDestination] = useState<Place | null>(null);
  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);
  const [mode, setMode] = useState('driving');

  useEffect(() => {
    if (origin && destination) {
      fetchAndSetRoute(origin, destination, mode);
    }
  }, [origin, destination, mode]);

  const fetchAndSetRoute = async (orig: Place, dest: Place, selectedMode: string) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/directions/json`;
      const response = await axios.get(url, {
        params: {
          origin: `${orig.lat},${orig.lng}`,
          destination: `${dest.lat},${dest.lng}`,
          mode: selectedMode,
          key: GOOGLE_API_KEY,
        },
      });

      if (response.data.routes.length > 0) {
        const points = response.data.routes[0].overview_polyline.points;
        const decoded = polyline.decode(points).map(([latitude, longitude]) => ({
          latitude,
          longitude,
        }));
        setRouteCoords(decoded);
      } else {
        setRouteCoords([]);
      }
    } catch (error) {
      console.error('Failed to fetch route', error);
    }
  };

  const handleMarkerPress = (place: Place) => {
    if (!origin) {
      setOrigin(place);
    } else if (!destination) {
      setDestination(place);
    } else {
      setOrigin(place);
      setDestination(null);
      setRouteCoords([]);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 7.8731,
          longitude: 80.7718,
          latitudeDelta: 3.5,
          longitudeDelta: 3.5,
        }}
      >
        {SAMPLE_PLACES.map((place) => (
          <Marker
            key={place.id}
            coordinate={{ latitude: place.lat, longitude: place.lng }}
            title={place.name}
            image={place.icon}
            pinColor={
              origin?.id === place.id
                ? 'green'
                : destination?.id === place.id
                ? 'red'
                : undefined
            }
            onPress={() => handleMarkerPress(place)}
          />
        ))}

        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor="#0000FF"
            strokeWidth={4}
          />
        )}
      </MapView>

      <View style={styles.controls}>
        {['driving', 'walking', 'bicycling', 'transit'].map((m) => (
          <Button
            key={m}
            title={m}
            onPress={() => setMode(m)}
            color={mode === m ? 'blue' : 'gray'}
          />
        ))}
        <Button
          title="Reset"
          onPress={() => {
            setOrigin(null);
            setDestination(null);
            setRouteCoords([]);
          }}
          color="tomato"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width,
    height,
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 10,
    padding: 5,
  },
});
