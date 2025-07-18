// fetchPopularPlacesSriLanka.ts
import { fetchGroupedPlaces } from "@/services/googlePlacesService";

// Replace with your actual Google Places API key or import from a config file
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || 'AIzaSyA47Q-I515EK0DU4pvk5jgUcatYcdnf8cY';

interface Place {
  place_id: string;
  name: string;
  vicinity?: string;
  rating?: number;
  photos?: { photo_reference: string }[];
}

export const fetchPopularPlacesSriLanka = async () => {
  const LOCS = [
    { name: "Colombo", lat: 6.9271, lng: 79.8612 },
    { name: "Galle", lat: 6.0535, lng: 80.2210 },
    { name: "Kandy", lat: 7.2906, lng: 80.6337 },
    { name: "Jaffna", lat: 9.6615, lng: 80.0255 },
    { name: "Anuradhapura", lat: 8.3114, lng: 80.4037 },
  ];

  const all: Place[] = [];
  for (const loc of LOCS) {
    try {
      const groups = await fetchGroupedPlaces(loc.lat, loc.lng);
      groups.forEach((g) => all.push(...g.places));
    } catch (err) {
      console.error(`Error fetch at ${loc.name}`, err);
    }
  }

  // Remove duplicates and pick top 4 by rating
  const uniq = Array.from(new Map(all.map((p) => [p.place_id, p])).values());
  return uniq
    .filter((p) => typeof p.rating === "number")
    .sort((a, b) => (b.rating! - (a.rating!)))
    .slice(0, 4)
    .map((p) => ({
      place_id: p.place_id,
      name: p.name,
      vicinity: p.vicinity,
      rating: p.rating,
      image: p.photos
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${p.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
        : undefined,
    }));
};
