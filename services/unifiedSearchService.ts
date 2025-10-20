import { geocodeLocation, fetchGroupedPlaces, getPlaceDetails, type PlaceGroup, type GooglePlace, type PlaceDetails } from './googlePlacesService';
import { searchServicesByLocation, searchServicesByCoordinates } from './serviceSearch';
import { ServiceCategory } from '@/types/commonTypes';
import type { SearchResponse, ServiceSearchResponse } from '@/types/serviceTypes';

export interface UnifiedSearchRequest {
  location: string;
  lat?: number;
  lng?: number;
  radius?: number;
  includeServices?: boolean;
  includePlaces?: boolean;
  serviceCategories?: ServiceCategory[];
}

export interface UnifiedSearchResult {
  places: PlaceGroup[];
  services: ServiceSearchResponse[];
  searchLocation: {
    name: string;
    coordinates: { lat: number; lng: number };
    formattedAddress: string;
  };
  error?: string;
}

/**
 * Unified search service that combines Google Places API with database services
 */
export class UnifiedSearchService {
  /**
   * Search for places and services in a given location
   */
  static async searchLocationData(request: UnifiedSearchRequest): Promise<UnifiedSearchResult> {
    const {
      location,
      lat,
      lng,
      radius = 10000,
      includeServices = true,
      includePlaces = true,
      serviceCategories
    } = request;

    let coordinates: { lat: number; lng: number };
    let formattedAddress: string;

    try {
      // Step 1: Get coordinates for the location
      if (lat && lng) {
        coordinates = { lat, lng };
        formattedAddress = location;
      } else {
        console.log(`🔍 Geocoding location: ${location}`);
        const geocodeResult = await geocodeLocation(location);
        
        if (!geocodeResult) {
          throw new Error(`Could not find coordinates for location: ${location}`);
        }
        
        coordinates = { lat: geocodeResult.lat, lng: geocodeResult.lng };
        formattedAddress = geocodeResult.formattedAddress;
      }

      console.log(`📍 Search coordinates: ${coordinates.lat}, ${coordinates.lng}`);

      // Step 2: Parallel search for places and services
      const searchPromises: Promise<any>[] = [];

      // Search for places using Google Places API
      if (includePlaces) {
        searchPromises.push(
          fetchGroupedPlaces(coordinates.lat, coordinates.lng, radius)
            .catch(error => {
              console.warn('Places search failed:', error);
              return [] as PlaceGroup[];
            })
        );
      } else {
        searchPromises.push(Promise.resolve([] as PlaceGroup[]));
      }

      // Search for services from database
      if (includeServices) {
        if (serviceCategories && serviceCategories.length > 0) {
          // Search for specific categories
          const servicePromises = serviceCategories.map(category =>
            searchServicesByCoordinates(coordinates.lat, coordinates.lng, category, radius / 1000)
              .then(response => response.success ? response.data.services : [])
              .catch(error => {
                console.warn(`Service search failed for category ${category}:`, error);
                return [];
              })
          );
          
          searchPromises.push(
            Promise.all(servicePromises).then(results =>
              results.flat().reduce((unique, service) => {
                if (service && !unique.find(s => s.serviceId === service.serviceId)) {
                  unique.push(service);
                }
                return unique;
              }, [] as ServiceSearchResponse[])
            )
          );
        } else {
          // Search for all services
          searchPromises.push(
            searchServicesByCoordinates(coordinates.lat, coordinates.lng, undefined, radius / 1000)
              .then(response => response.success ? response.data.services : [])
              .catch(error => {
                console.warn('Service search failed:', error);
                return [] as ServiceSearchResponse[];
              })
          );
        }
      } else {
        searchPromises.push(Promise.resolve([] as ServiceSearchResponse[]));
      }

      // Wait for all searches to complete
      const [places, services] = await Promise.all(searchPromises);

      console.log(`✅ Search completed: ${places.length} place groups, ${services.length} services`);

      return {
        places: places as PlaceGroup[],
        services: services as ServiceSearchResponse[],
        searchLocation: {
          name: location,
          coordinates,
          formattedAddress,
        },
      };

    } catch (error) {
      console.error('Unified search error:', error);
      return {
        places: [],
        services: [],
        searchLocation: {
          name: location,
          coordinates: { lat: 0, lng: 0 },
          formattedAddress: location,
        },
        error: error instanceof Error ? error.message : 'Unknown search error',
      };
    }
  }

  /**
   * Search for places and services near a specific place
   */
  static async searchNearPlace(
    placeId: string,
    radius: number = 5000,
    serviceCategories?: ServiceCategory[]
  ): Promise<UnifiedSearchResult> {
    try {
      // Get place details to get coordinates
      const placeDetails = await getPlaceDetails(placeId);
      
      if (!placeDetails) {
        throw new Error(`Could not find details for place: ${placeId}`);
      }

      return this.searchLocationData({
        location: placeDetails.name,
        lat: placeDetails.geometry.location.lat,
        lng: placeDetails.geometry.location.lng,
        radius,
        serviceCategories,
      });

    } catch (error) {
      console.error('Near place search error:', error);
      return {
        places: [],
        services: [],
        searchLocation: {
          name: 'Unknown Place',
          coordinates: { lat: 0, lng: 0 },
          formattedAddress: 'Unknown Location',
        },
        error: error instanceof Error ? error.message : 'Unknown search error',
      };
    }
  }

  /**
   * Get recommendations for services near specific places
   */
  static async getServiceRecommendationsForPlaces(
    places: GooglePlace[],
    serviceCategories?: ServiceCategory[]
  ): Promise<Map<string, ServiceSearchResponse[]>> {
    const recommendations = new Map<string, ServiceSearchResponse[]>();

    for (const place of places) {
      try {
        const services = serviceCategories 
          ? await Promise.all(
              serviceCategories.map(category =>
                searchServicesByCoordinates(
                  place.geometry.location.lat,
                  place.geometry.location.lng,
                  category,
                  2 // 2km radius for nearby services
                ).then(response => response.success ? response.data.services : [])
                .catch(() => [])
              )
            ).then(results => results.flat())
          : await searchServicesByCoordinates(
              place.geometry.location.lat,
              place.geometry.location.lng,
              undefined,
              2
            ).then(response => response.success ? response.data.services : [])
            .catch(() => []);

        recommendations.set(place.place_id, services as ServiceSearchResponse[]);
      } catch (error) {
        console.warn(`Failed to get recommendations for place ${place.name}:`, error);
        recommendations.set(place.place_id, []);
      }
    }

    return recommendations;
  }

  /**
   * Filter services by distance from a location
   */
  static filterServicesByDistance(
    services: ServiceSearchResponse[],
    centerLat: number,
    centerLng: number,
    maxDistanceKm: number
  ): ServiceSearchResponse[] {
    return services.filter(service => {
      if (!service.locations || service.locations.length === 0) {
        return false;
      }

      return service.locations.some(location => {
        const distance = this.calculateDistance(
          centerLat,
          centerLng,
          location.latitude,
          location.longitude
        );
        return distance <= maxDistanceKm;
      });
    });
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  private static calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

export default UnifiedSearchService;