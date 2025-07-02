import axios from 'axios';

const GOOGLE_PLACES_API_KEY = 'AIzaSyA47Q-I515EK0DU4pvk5jgUcatYcdnf8cY';

type PlaceGroup = {
  group: string;
  places: any[];
};

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
    group: 'Accommodation', 
    types: ['natural_feature'], 
    keyword: 'beach',
    excludeKeywords: ['resort', 'private', 'tour', 'hotel'],
    minRating: 2
  },
  { 
    group: 'Foods', 
    types: ['museum', 'tourist_attraction'], 
    keyword: 'tour|restaurant|cafe|food',
    excludeKeywords: [ 'guide required'],
    minRating: 2
  },
 { 
    group: 'Transport', 
    types: ['park'], 
    keyword: 'tour|restaurant|cafe|food',
    excludeKeywords: [ 'guide required'],
    minRating: 2
  },
  
  { 
    group: 'Waterfalls & Nature', 
    types: ['natural_feature'], 
    keyword: 'waterfall|forest|hike|trail',
    excludeKeywords: ['tour', 'guide required'],
    minRating: 2
  },
  { 
    group: 'Viewpoints', 
    types: ['point_of_interest'], 
    keyword: 'viewpoint|sunset|panoramic',
    excludeKeywords: ['reservation'],
    minRating: 2
  },
  { 
    group: 'Temples & Religious Sites', 
    types: ['place_of_worship'], 
    excludeKeywords: ['private', 'booking'],
    minRating: 2
  },
  { 
    group: 'Historical Sites', 
    types: ['museum', 'tourist_attraction'], 
    keyword: 'fort|historical|museum',
    minRating: 2
  },
  { 
    group: 'Public Parks & Gardens', 
    types: ['park'], 
    excludeKeywords: ['resort', 'private'],
    minRating: 2
  },
];

export async function fetchGroupedPlaces(
  latitude: number,
  longitude: number,
  radius = 20000 // ~20km for Galle District
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