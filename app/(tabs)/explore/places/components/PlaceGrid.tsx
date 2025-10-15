import Card from "@/components/Card";
import React from "react";
import { Dimensions, FlatList } from "react-native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;
const GOOGLE_PLACES_API_KEY = "AIzaSyA47Q-I515EK0DU4pvk5jgUcatYcdnf8cY";

interface Place {
  place_id: string;
  name: string;
  vicinity: string;
  rating?: number | string;
  photos?: { photo_reference: string }[];
}

interface CardItem {
  id: number;
  title: string;
  subtitle: string;
  rating: number;
  image: string;
}

interface PlaceGridProps {
  places: Place[];
  horizontal?: boolean;
  onItemPress: (placeId: string) => void;
}

const convertPlaceToCardItem = (place: Place): CardItem => ({
  id: Number(place.place_id),
  title: place.name,
  subtitle: place.vicinity,
  rating:
    typeof place.rating === "number"
      ? place.rating
      : typeof place.rating === "string"
      ? Number(place.rating)
      : 0,
  image: place.photos?.[0]
    ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
    : "",
});

export const PlaceGrid: React.FC<PlaceGridProps> = ({
  places,
  horizontal = false,
  onItemPress,
}) => (
  <FlatList
    data={places}
    keyExtractor={(item) => item.place_id}
    horizontal={horizontal}
    numColumns={horizontal ? 1 : 2}
    columnWrapperStyle={
      !horizontal && places.length > 1
        ? { justifyContent: "space-between" }
        : undefined
    }
    renderItem={({ item }) => (
      <Card
        item={convertPlaceToCardItem(item)}
        onPress={() => onItemPress(item.place_id)}
        width={horizontal ? 180 : CARD_WIDTH}
      />
    )}
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={
      horizontal
        ? { paddingHorizontal: 4, gap: 16, paddingBottom: 16 }
        : { paddingBottom: 16 }
    }
    scrollEnabled={!horizontal ? false : true}
  />
);

export default PlaceGrid;
