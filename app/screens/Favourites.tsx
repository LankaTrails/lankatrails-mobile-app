import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Card from "../../components/Card";
import BackButton from "@/components/BackButton";
import { getFavorites } from "@/services/favouriteService";
import { FavoriteItem } from "@/types/triptypes";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

export default function FavouritesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [favourites, setFavourites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch favorites on component mount
  useEffect(() => {
    const fetchFavoritesData = async () => {
      try {
        setLoading(true);
        setError(null);
        const favoritesData = await getFavorites();
        setFavourites(favoritesData);
      } catch (err) {
        console.error("Error fetching favorites:", err);
        setError("Failed to load favorites");
      } finally {
        setLoading(false);
      }
    };

    fetchFavoritesData();
  }, []);

  // Convert FavoriteItem to Card item format
  const convertToCardItem = (favorite: FavoriteItem) => {
    if (favorite.type === "SERVICE" && favorite.service) {
      return {
        id: favorite.service.serviceId,
        title: favorite.service.serviceName || "Unknown Service",
        subtitle:
          favorite.service.locations && favorite.service.locations.length > 0
            ? favorite.service.locations[0].city ||
              favorite.service.locations[0].district ||
              "Location not available"
            : "Location not available",
        rating: 0, // Services don't have ratings in the current structure
        image: favorite.service.mainImageUrl || "",
        category: favorite.service.category,
      };
    } else if (favorite.type === "PLACE" && favorite.place) {
      return {
        id: favorite.place.placeId,
        title: favorite.place.placeName || "Unknown Place",
        subtitle: "Place",
        rating: favorite.place.rating || 0,
        image: favorite.place.photoReference || "",
        category: "PLACE",
      };
    }
    return null;
  };

  // Filter favorites based on search query
  const filteredFavourites = favourites
    .map(convertToCardItem)
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Handle navigation to service detail
  const handlePress = (item: any) => {
    if (item.category === "PLACE") {
      // Handle place navigation if needed
      console.log("Navigate to place:", item.title);
    } else {
      // Navigate to service detail page based on category
      const categoryMap: { [key: string]: string } = {
        ACCOMMODATION: "accommodation",
        ACTIVITY: "activity",
        FOOD_BEVERAGE: "food-beverage",
        TOUR_GUIDE: "tour-guide",
        TRANSPORT: "transport",
      };

      const categoryPath = categoryMap[item.category];
      if (categoryPath) {
        router.push(`/(tabs)/explore/services/${categoryPath}/${item.id}`);
      }
    }
  };

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
          <Icon
            name="search-outline"
            size={20}
            color="#008080"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or location..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
            >
              <Icon name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.gridContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#008080" />
              <Text style={styles.loadingText}>Loading favorites...</Text>
            </View>
          ) : error ? (
            <View style={styles.noResults}>
              <Icon name="alert-circle" size={48} color="#ef4444" />
              <Text style={styles.noResultsText}>{error}</Text>
            </View>
          ) : filteredFavourites.length === 0 ? (
            <View style={styles.noResults}>
              <Icon name="heart-outline" size={48} color="#D1D5DB" />
              <Text style={styles.noResultsText}>
                {searchQuery
                  ? "No favorites found matching your search"
                  : "No favorites yet"}
              </Text>
              <Text style={styles.noResultsSubtext}>
                {!searchQuery &&
                  "Start exploring and add items to your favorites!"}
              </Text>
            </View>
          ) : (
            filteredFavourites.map((item, index) => (
              <View
                key={`${item.category}-${item.id}`}
                style={styles.cardWrapper}
              >
                <Card
                  item={{
                    id:
                      typeof item.id === "string"
                        ? parseInt(item.id) || 0
                        : item.id,
                    title: item.title,
                    subtitle: item.subtitle,
                    rating: item.rating || 0,
                    image: item.image,
                  }}
                  width={width * 0.45}
                  onPress={() => handlePress(item)}
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
    backgroundColor: "#f9fafb",
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#008080",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
  },
  searchIcon: {
    marginRight: 12,
    color: "#008080",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  noResults: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
    width: "100%",
  },
  noResultsText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 16,
    paddingHorizontal: 32,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
    width: "100%",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 16,
  },
});
