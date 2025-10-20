import locationCache from '@/utils/locationCache';
import axios from 'axios';

const GOOGLE_PLACES_API_KEY = 'AIzaSyA09s82YaJw6_VmK2bCW5SkLnUXeniQgrw';

// Simple rate limiting
class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests = 100; // Max requests per minute
  private readonly timeWindow = 60000; // 1 minute in milliseconds

  canMakeRequest(): boolean {
    const now = Date.now();
    // Remove requests older than the time window
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }

  getWaitTime(): number {
    if (this.requests.length === 0) return 0;
    const oldestRequest = Math.min(...this.requests);
    return Math.max(0, this.timeWindow - (Date.now() - oldestRequest));
  }
}

const rateLimiter = new RateLimiter();

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export type PlaceGroup = {
  group: string;
  places: GooglePlace[];
};

export type GooglePlace = {
  place_id: string;
  name: string;
  vicinity?: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  types: string[];
  opening_hours?: {
    open_now: boolean;
  };
};

export type GeocodeResult = {
  lat: number;
  lng: number;
  formattedAddress: string;
};

export type PlaceDetails = {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  opening_hours?: {
    open_now: boolean;
    periods: any[];
    weekday_text: string[];
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  reviews?: Array<{
    author_name: string;
    author_url: string;
    profile_photo_url: string;
    rating: number;
    relative_time_description: string;
    text: string;
    time: number;
  }>;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
  url: string;
  vicinity?: string;
};

/**
 * Geocode a location name to get coordinates with caching
 */
export async function geocodeLocation(locationName: string): Promise<GeocodeResult | null> {
  try {
    // Validate input
    if (!locationName?.trim()) {
      console.warn('Empty location name provided to geocodeLocation');
      return null;
    }

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
    
    // Check rate limiting
    if (!rateLimiter.canMakeRequest()) {
      const waitTime = rateLimiter.getWaitTime();
      console.warn(`Rate limit exceeded. Waiting ${waitTime}ms before making request.`);
      await delay(waitTime);
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: locationName,
        key: GOOGLE_PLACES_API_KEY,
      },
      timeout: 10000, // 10 second timeout
    });

    // Check for API errors
    if (response.data.status === 'REQUEST_DENIED') {
      console.error('Geocoding API request denied:', response.data.error_message);
      throw new Error('Geocoding API access denied. Please check your API key and permissions.');
    }

    if (response.data.status === 'OVER_QUERY_LIMIT') {
      console.error('Geocoding API quota exceeded');
      throw new Error('Geocoding API quota exceeded. Please try again later.');
    }

    if (response.data.status === 'ZERO_RESULTS') {
      console.warn(`No geocoding results found for: ${locationName}`);
      return null;
    }

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
    if (axios.isAxiosError(error)) {
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        console.error('Network error during geocoding:', error.message);
        throw new Error('Network connection failed. Please check your internet connection.');
      }
      if (error.response?.status === 403) {
        console.error('Geocoding API forbidden:', error.response.data);
        throw new Error('Geocoding API access forbidden. Please check your API key.');
      }
      if (error.response?.status === 429) {
        console.error('Geocoding API rate limit exceeded');
        throw new Error('Too many requests. Please try again later.');
      }
    }
    console.error('Geocoding error:', error);
    throw error;
  }
}

// Optimized for public tourist attractions
const groupConfigs = [
  {
    group: 'Beaches',
    types: ['natural_feature'],
    keywords: ['beach'],
    excludeKeywords: ['resort', 'private', 'tour', 'hotel'],
    minRating: 2
  },
  {
    group: 'Waterfalls & Nature',
    types: ['natural_feature'],
    keywords: ['waterfall', 'forest', 'hike', 'trail'],
    excludeKeywords: ['tour', 'guide required', 'private', 'booking'],
    minRating: 2
  },
  {
    group: 'Viewpoints',
    types: ['point_of_interest'],
    keywords: ['viewpoint', 'sunset', 'panoramic'],
    excludeKeywords: ['reservation', 'private', 'booking'],
    minRating: 2
  },
  {
    group: 'Temples & Religious Sites',
    types: ['place_of_worship'],
    keywords: ['temple', 'buddhist', 'hindu', 'church'],
    excludeKeywords: ['private', 'booking', 'reservation', 'hotel'],
    minRating: 2
  },
  {
    group: 'Historical Sites',
    types: ['museum', 'tourist_attraction'],
    keywords: ['fort', 'historical', 'museum'],
    excludeKeywords: ['private', 'booking', 'reservation'],
    minRating: 2
  },
  {
    group: 'Public Parks & Gardens',
    types: ['park'],
    keywords: ['park', 'garden', 'botanical'],
    excludeKeywords: ['resort', 'private'],
    minRating: 2
  },
];

export async function fetchGroupedPlaces(
  latitude: number,
  longitude: number,
  radius = 10000
): Promise<PlaceGroup[]> {
  // Validate input parameters
  if (!latitude || !longitude) {
    throw new Error('Invalid coordinates provided');
  }

  if (radius <= 0 || radius > 50000) {
    throw new Error('Radius must be between 1 and 50000 meters');
  }

  const results: PlaceGroup[] = [];

  for (const config of groupConfigs) {
    const placesForGroup: GooglePlace[] = [];

    // For each place type and keyword combination
    for (const type of config.types) {
      for (const keyword of config.keywords) {
        try {
          // Check rate limiting
          if (!rateLimiter.canMakeRequest()) {
            const waitTime = rateLimiter.getWaitTime();
            console.warn(`Rate limit exceeded. Waiting ${waitTime}ms before making request.`);
            await delay(waitTime);
          }

          const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
            params: {
              location: `${latitude},${longitude}`,
              radius,
              type,
              keyword,
              key: GOOGLE_PLACES_API_KEY,
            },
            timeout: 15000, // 15 second timeout
          });

          // Check for API errors
          if (response.data.status === 'REQUEST_DENIED') {
            console.error('Places API request denied:', response.data.error_message);
            throw new Error('Places API access denied. Please check your API key and permissions.');
          }

          if (response.data.status === 'OVER_QUERY_LIMIT') {
            console.error('Places API quota exceeded');
            throw new Error('Places API quota exceeded. Please try again later.');
          }

          if (response.data.status === 'INVALID_REQUEST') {
            console.error('Invalid request to Places API:', response.data.error_message);
            continue; // Skip this request but continue with others
          }

          if (response.data.results) {
            // Filter out unwanted places
            const filteredPlaces = response.data.results.filter((place: GooglePlace) => {
              const name = place.name?.toLowerCase() || '';
              const isExcluded = config.excludeKeywords?.some(excludeKeyword =>
                name.includes(excludeKeyword.toLowerCase())
              );
              // Handle cases where rating might be undefined
              const meetsRating = (place.rating ?? 0) >= (config.minRating || 0);
              return !isExcluded && meetsRating;
            });
            placesForGroup.push(...filteredPlaces);
          }
        } catch (err) {
          if (axios.isAxiosError(err)) {
            if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
              console.error(`Network error for ${config.group} with keyword "${keyword}":`, err.message);
              continue; // Skip this request but continue with others
            }
            if (err.response?.status === 403) {
              console.error('Places API forbidden:', err.response.data);
              throw new Error('Places API access forbidden. Please check your API key.');
            }
            if (err.response?.status === 429) {
              console.error('Places API rate limit exceeded');
              throw new Error('Too many requests. Please try again later.');
            }
          }
          console.error(`[${config.group}] Fetch failed for keyword "${keyword}":`, err);
          // Continue with other keywords/types instead of failing completely
        }
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

/**
 * Get detailed information about a specific place
 */
export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  try {
    // Validate input
    if (!placeId?.trim()) {
      console.warn('Empty place ID provided to getPlaceDetails');
      return null;
    }

    console.log(`Fetching details for place: ${placeId}`);
    
    // Check rate limiting
    if (!rateLimiter.canMakeRequest()) {
      const waitTime = rateLimiter.getWaitTime();
      console.warn(`Rate limit exceeded. Waiting ${waitTime}ms before making request.`);
      await delay(waitTime);
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
      params: {
        place_id: placeId,
        fields: 'place_id,name,formatted_address,formatted_phone_number,international_phone_number,website,rating,user_ratings_total,price_level,opening_hours,photos,reviews,geometry,types,url,vicinity',
        key: GOOGLE_PLACES_API_KEY,
      },
      timeout: 10000, // 10 second timeout
    });

    // Check for API errors
    if (response.data.status === 'REQUEST_DENIED') {
      console.error('Place Details API request denied:', response.data.error_message);
      throw new Error('Place Details API access denied. Please check your API key and permissions.');
    }

    if (response.data.status === 'OVER_QUERY_LIMIT') {
      console.error('Place Details API quota exceeded');
      throw new Error('Place Details API quota exceeded. Please try again later.');
    }

    if (response.data.status === 'NOT_FOUND') {
      console.warn(`Place not found for ID: ${placeId}`);
      return null;
    }

    if (response.data.status === 'INVALID_REQUEST') {
      console.error('Invalid request to Place Details API:', response.data.error_message);
      return null;
    }

    if (response.data.result) {
      console.log(`Retrieved details for place: ${response.data.result.name}`);
      return response.data.result as PlaceDetails;
    }

    console.warn(`No details found for place ID: ${placeId}`);
    return null;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        console.error('Network error during place details fetch:', error.message);
        throw new Error('Network connection failed. Please check your internet connection.');
      }
      if (error.response?.status === 403) {
        console.error('Place Details API forbidden:', error.response.data);
        throw new Error('Place Details API access forbidden. Please check your API key.');
      }
      if (error.response?.status === 429) {
        console.error('Place Details API rate limit exceeded');
        throw new Error('Too many requests. Please try again later.');
      }
    }
    console.error('Place details error:', error);
    throw error;
  }
}

/**
 * Get photo URL for a place photo reference
 */
export function getPlacePhotoUrl(photoReference: string, maxWidth = 400): string {
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;
}