import * as Location from 'expo-location';
import { Alert } from 'react-native';

export interface LocationData {
    coords: {
        latitude: number;
        longitude: number;
        accuracy: number | null;
    };
    timestamp: number;
}

export interface LocationAddress {
    city?: string | null;
    district?: string | null;
    region?: string | null;
    country?: string | null;
    name?: string | null;
    street?: string | null;
    streetNumber?: string | null;
    postalCode?: string | null;
}

export class LocationService {
    private static instance: LocationService;

    private constructor() { }

    public static getInstance(): LocationService {
        if (!LocationService.instance) {
            LocationService.instance = new LocationService();
        }
        return LocationService.instance;
    }

    /**
     * Request location permissions
     */
    async requestPermissions(): Promise<Location.PermissionStatus> {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            return status;
        } catch (error) {
            console.error('Error requesting location permissions:', error);
            throw error;
        }
    }

    /**
     * Check if location permissions are granted
     */
    async hasPermissions(): Promise<boolean> {
        try {
            const { status } = await Location.getForegroundPermissionsAsync();
            return status === 'granted';
        } catch (error) {
            console.error('Error checking location permissions:', error);
            return false;
        }
    }

    /**
     * Get current location with high accuracy
     */
    async getCurrentLocation(): Promise<LocationData> {
        try {
            const hasPermission = await this.hasPermissions();
            if (!hasPermission) {
                throw new Error('Location permission not granted');
            }

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
                timeInterval: 5000,
                distanceInterval: 10,
            });

            return location;
        } catch (error) {
            console.error('Error getting current location:', error);
            throw error;
        }
    }

    /**
     * Reverse geocode coordinates to get address information
     */
    async reverseGeocode(latitude: number, longitude: number): Promise<LocationAddress[]> {
        try {
            const result = await Location.reverseGeocodeAsync({
                latitude,
                longitude,
            });

            return result;
        } catch (error) {
            console.error('Error reverse geocoding:', error);
            throw error;
        }
    }

    /**
     * Get formatted location name from coordinates
     */
    async getLocationName(latitude: number, longitude: number): Promise<string> {
        try {
            const addresses = await this.reverseGeocode(latitude, longitude);

            if (addresses.length > 0) {
                const address = addresses[0];
                return address.city || address.district || address.region || 'Unknown location';
            }

            return 'Unknown location';
        } catch (error) {
            console.error('Error getting location name:', error);
            return 'Unknown location';
        }
    }

    /**
     * Show location permission dialog
     */
    showPermissionDialog(): Promise<boolean> {
        return new Promise((resolve) => {
            Alert.alert(
                "Location Permission",
                "LankaTrails needs location access to show nearby services and improve your experience. Please enable location permissions.",
                [
                    {
                        text: "Cancel",
                        style: "cancel",
                        onPress: () => resolve(false)
                    },
                    {
                        text: "Enable",
                        onPress: async () => {
                            const status = await this.requestPermissions();
                            resolve(status === 'granted');
                        }
                    }
                ]
            );
        });
    }

    /**
     * Calculate distance between two coordinates (in kilometers)
     */
    calculateDistance(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ): number {
        const R = 6371; // Radius of the Earth in kilometers
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) *
            Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in kilometers
        return d;
    }

    private deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }
}

export default LocationService.getInstance();
