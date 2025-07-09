import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TextInput,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Card from "../../components/Card";
import BackButton from "@/components/BackButton";

const { width } = Dimensions.get('window');

export default function FavouritesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const favouritePlaces = [
    {
      id: 1,
      name: "Nine Arch Bridge",
      location: "Ella",
      image:
        "https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=200&h=150&fit=crop",
      rating: 4.6,
    },
    {
      id: 2,
      name: "Temple of Tooth",
      location: "Kandy",
      image:
        "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=200&h=150&fit=crop",
      rating: 4.8,
    },
    {
      id: 3,
      name: "Galle Fort",
      location: "Galle",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=150&fit=crop",
      rating: 4.7,
    },
    {
      id: 4,
      name: "Adam's Peak",
      location: "Ratnapura",
      image:
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200&h=150&fit=crop",
      rating: 4.5,
    },
  ];

  // Filter places based on search query
  const filteredPlaces = favouritePlaces.filter((place) =>
    place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    place.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                  <View style={styles.headerLeft}>
                    <BackButton />
                  </View>
                  <Text style={styles.heading}>Favourites</Text>
                  <View style={styles.headerRight} />
                </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search-outline" size={20} color="#008080" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or location..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearButton}>
              <Icon name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.gridContainer}>
          {filteredPlaces.length === 0 ? (
            <View style={styles.noResults}>
              <Icon name="search-outline" size={48} color="#D1D5DB" />
              <Text style={styles.noResultsText}>
                {searchQuery ? "No places found matching your search" : "No favourites yet"}
              </Text>
            </View>
          ) : (
            filteredPlaces.map((place, index) => (
              <View key={place.id} style={styles.cardWrapper}>
                <Card
                  item={{
                    id: place.id,
                    title: place.name,
                    subtitle: place.location,
                    rating: place.rating || 0,
                    image: place.image,
                  }}
                  width={width * 0.45}
                  onPress={(selectedPlace) => {
                    console.log("Pressed:", selectedPlace.title);
                  }}
                />
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContainer: {
    flex: 1,
    padding: 14,
    paddingBottom: 60,
    marginBottom: 80,
  },
  header: {
    marginTop: 60,
    marginBottom: 20,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    zIndex: 1,
  },
  headerLeft: {
    flex: 1,
    alignItems: "flex-start",
    zIndex: 2,
  },
  headerCenter: {
    flex: 2,
    alignItems: "center",
  },
  headerRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#008080',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
  },
  searchIcon: {
    marginRight: 12,
    color: '#008080',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
    width: '100%',
  },
  noResultsText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 32,
  },
});