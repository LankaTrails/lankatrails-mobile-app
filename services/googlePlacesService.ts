import locationCache from '@/utils/locationCache';
import axios from 'axios';

const GOOGLE_PLACES_API_KEY = 'AIzaSyA47Q-I515EK0DU4pvk5jgUcatYcdnf8cY';

type PlaceGroup = {
  group: string;
  places: any[];
};

type GeocodeResult = {
  lat: number;
  lng: number;
  formattedAddress: string;
};

/**
 * Geocode a location name to get coordinates with caching
 */
export async function geocodeLocation(locationName: string): Promise<GeocodeResult | null> {
  try {
    // Check cache first
    const cached = locationCache.get(locationName);
    if (cached) {
      console.log(`Using cached coordinates for ${locationName}:`, cached);
      return {
        lat: cached.lat,
        lng: cached.lng,
        formattedAddress: locationName, // Use the original name for cached results
      };
    }

    console.log(`Geocoding location: ${locationName}`);
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: locationName,
        key: GOOGLE_PLACES_API_KEY,
      },
    });

    if (response.data.results && response.data.results.length > 0) {
      const result = response.data.results[0];
      const coordinates = {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formattedAddress: result.formatted_address,
      };

      // Cache the result
      locationCache.set(locationName, coordinates.lat, coordinates.lng);
      console.log(`Geocoded ${locationName} to:`, coordinates);

      return coordinates;
    }

    console.warn(`No geocoding results found for: ${locationName}`);
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

// Optimized for public tourist attractions
const groupConfigs = [
  {
    group: 'Beaches',
    types: ['natural_feature'],
    keyword: 'beach',
    excludeKeywords: ['resort', 'private', 'tour', 'hotel'],
    minRating: 2
  },
  {
    group: 'Waterfalls & Nature',
    types: ['natural_feature'],
    keyword: 'waterfall|forest|hike|trail',
    excludeKeywords: ['tour', 'guide required', 'private', 'booking'],
    minRating: 2
  },
  {
    group: 'Viewpoints',
    types: ['point_of_interest'],
    keyword: 'viewpoint|sunset|panoramic',
    excludeKeywords: ['reservation', 'private', 'booking'],
    minRating: 2
  },
  {
    group: 'Temples & Religious Sites',
    types: ['place_of_worship'],
    keyword: 'temple|buddhist|hindu|church',
    excludeKeywords: ['private', 'booking', 'reservation', 'hotel'],
    minRating: 2
  },
  {
    group: 'Historical Sites',
    types: ['museum', 'tourist_attraction'],
    keyword: 'fort|historical|museum',
    excludeKeywords: ['private', 'booking', 'reservation'],
    minRating: 2
  },
  {
    group: 'Public Parks & Gardens',
    types: ['park'],
    keyword: 'park|garden|botanical',
    excludeKeywords: ['resort', 'private'],
    minRating: 2
  },
];

export async function fetchGroupedPlaces(
  latitude: number,
  longitude: number,
  radius = 10000
): Promise<PlaceGroup[]> {
  const results: PlaceGroup[] = [];

  for (const config of groupConfigs) {
    const placesForGroup: any[] = [];

    for (const type of config.types) {
      try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
          params: {
            location: `${latitude},${longitude}`,
            radius,
            type,
            keyword: config.keyword,
            key: GOOGLE_PLACES_API_KEY,
          },
        });

        if (response.data.results) {
          // Filter out unwanted places
          const filteredPlaces = response.data.results.filter((place: any) => {
            const name = place.name?.toLowerCase() || '';
            const isExcluded = config.excludeKeywords?.some(keyword =>
              name.includes(keyword.toLowerCase())
            );
            // Handle cases where rating might be undefined
            const meetsRating = (place.rating ?? 0) >= (config.minRating || 0);
            return !isExcluded && meetsRating;
          });
          placesForGroup.push(...filteredPlaces);
        }
      } catch (err) {
        console.error(`[${config.group}] Fetch failed:`, err);
      }
    }

    // Deduplicate and limit results
    const uniquePlaces = Array.from(new Map(
      placesForGroup.map(place => [place.place_id, place])
    ).values());

    results.push({
      group: config.group,
      places: uniquePlaces.slice(0, 10), // Limit to 10 per group
    });
  }

  return results;
}