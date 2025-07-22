/**
 * Simple in-memory cache for storing geocoding results
 */
class LocationCache {
    private cache: Map<string, { lat: number; lng: number; timestamp: number }> = new Map();
    private readonly TTL = 30 * 60 * 1000; // 30 minutes

    constructor() {
        // Pre-populate with popular Sri Lankan locations
        this.initializePopularLocations();
    }

    /**
     * Initialize cache with popular Sri Lankan locations
     */
    private initializePopularLocations(): void {
        const popularLocations = [
            { name: 'galle', lat: 6.0329, lng: 80.2168 },
            { name: 'colombo', lat: 6.9271, lng: 79.8612 },
            { name: 'kandy', lat: 7.2966, lng: 80.6350 },
            { name: 'ella', lat: 6.8687, lng: 81.0462 },
            { name: 'sigiriya', lat: 7.9569, lng: 80.7603 },
            { name: 'nuwara eliya', lat: 6.9497, lng: 80.7891 },
            { name: 'mirissa', lat: 5.9487, lng: 80.4565 },
            { name: 'unawatuna', lat: 6.0104, lng: 80.2496 },
            { name: 'hikkaduwa', lat: 6.1408, lng: 80.0997 },
            { name: 'bentota', lat: 6.4257, lng: 79.9951 },
            { name: 'negombo', lat: 7.2083, lng: 79.8358 },
            { name: 'trincomalee', lat: 8.5874, lng: 81.2152 },
            { name: 'anuradhapura', lat: 8.3114, lng: 80.4037 },
            { name: 'polonnaruwa', lat: 7.9403, lng: 81.0188 },
            { name: 'dambulla', lat: 7.8731, lng: 80.6511 },
        ];

        popularLocations.forEach(location => {
            this.cache.set(location.name, {
                lat: location.lat,
                lng: location.lng,
                timestamp: Date.now(),
            });
        });

        console.log(`Initialized location cache with ${popularLocations.length} popular Sri Lankan locations`);
    }

    /**
     * Get cached coordinates for a location
     */
    get(locationName: string): { lat: number; lng: number } | null {
        const cached = this.cache.get(locationName.toLowerCase());

        if (!cached) {
            return null;
        }

        // Check if cache entry is still valid (skip TTL check for pre-populated locations)
        const isPrePopulated = this.isPrePopulatedLocation(locationName);
        if (!isPrePopulated && Date.now() - cached.timestamp > this.TTL) {
            this.cache.delete(locationName.toLowerCase());
            return null;
        }

        return { lat: cached.lat, lng: cached.lng };
    }

    /**
     * Check if location is pre-populated (popular location)
     */
    private isPrePopulatedLocation(locationName: string): boolean {
        const popularLocationNames = [
            'galle', 'colombo', 'kandy', 'ella', 'sigiriya', 'nuwara eliya',
            'mirissa', 'unawatuna', 'hikkaduwa', 'bentota', 'negombo',
            'trincomalee', 'anuradhapura', 'polonnaruwa', 'dambulla'
        ];
        return popularLocationNames.includes(locationName.toLowerCase());
    }

    /**
     * Store coordinates for a location
     */
    set(locationName: string, lat: number, lng: number): void {
        this.cache.set(locationName.toLowerCase(), {
            lat,
            lng,
            timestamp: Date.now(),
        });
    }

    /**
     * Clear all cached entries except pre-populated ones
     */
    clear(): void {
        const keysToDelete: string[] = [];
        this.cache.forEach((_, key) => {
            if (!this.isPrePopulatedLocation(key)) {
                keysToDelete.push(key);
            }
        });
        keysToDelete.forEach(key => this.cache.delete(key));
    }

    /**
     * Get cache size
     */
    size(): number {
        return this.cache.size;
    }
}

export default new LocationCache();
