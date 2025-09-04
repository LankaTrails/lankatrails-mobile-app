import axios from 'axios';

const GOOGLE_DIRECTIONS_API_KEY = 'AIzaSyBWrR4H7o9PTXVot7DQJ7woNDODNwD5LwA';

export interface DirectionsWaypoint {
    latitude: number;
    longitude: number;
}

export interface DirectionsRoute {
    coordinates: DirectionsWaypoint[];
    distance: string;
    duration: string;
    steps: DirectionsStep[];
}

export interface DirectionsStep {
    instruction: string;
    distance: string;
    duration: string;
    startLocation: DirectionsWaypoint;
    endLocation: DirectionsWaypoint;
}

/**
 * Decode Google's encoded polyline string to coordinates
 */
function decodePolyline(encoded: string): DirectionsWaypoint[] {
    const points: DirectionsWaypoint[] = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
        let b;
        let shift = 0;
        let result = 0;

        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);

        const deltaLat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
        lat += deltaLat;

        shift = 0;
        result = 0;

        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);

        const deltaLng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
        lng += deltaLng;

        points.push({
            latitude: lat / 1e5,
            longitude: lng / 1e5,
        });
    }

    return points;
}

/**
 * Get driving directions between multiple waypoints
 */
export async function getDirections(
    origin: DirectionsWaypoint,
    destination: DirectionsWaypoint,
    waypoints: DirectionsWaypoint[] = [],
    travelMode: 'driving' | 'walking' | 'transit' | 'bicycling' = 'driving'
): Promise<DirectionsRoute | null> {
    try {
        console.log('Getting directions from', origin, 'to', destination, 'via', waypoints.length, 'waypoints');

        // Format waypoints for Google API
        const waypointsParam = waypoints.length > 0
            ? waypoints.map(wp => `${wp.latitude},${wp.longitude}`).join('|')
            : undefined;

        const params: any = {
            origin: `${origin.latitude},${origin.longitude}`,
            destination: `${destination.latitude},${destination.longitude}`,
            mode: travelMode,
            key: GOOGLE_DIRECTIONS_API_KEY,
        };

        if (waypointsParam) {
            params.waypoints = waypointsParam;
        }

        const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
            params,
        });

        if (response.data.status === 'OK' && response.data.routes.length > 0) {
            const route = response.data.routes[0];
            const leg = route.legs[0];

            // Decode the polyline to get detailed route coordinates
            const coordinates = decodePolyline(route.overview_polyline.points);

            // Extract turn-by-turn steps
            const steps: DirectionsStep[] = [];

            for (const leg of route.legs) {
                for (const step of leg.steps) {
                    steps.push({
                        instruction: step.html_instructions.replace(/<[^>]*>/g, ''), // Remove HTML tags
                        distance: step.distance.text,
                        duration: step.duration.text,
                        startLocation: {
                            latitude: step.start_location.lat,
                            longitude: step.start_location.lng,
                        },
                        endLocation: {
                            latitude: step.end_location.lat,
                            longitude: step.end_location.lng,
                        },
                    });
                }
            }

            console.log(`Route found: ${route.legs[0].distance.text}, ${route.legs[0].duration.text}, ${coordinates.length} points`);

            return {
                coordinates,
                distance: route.legs[0].distance.text,
                duration: route.legs[0].duration.text,
                steps,
            };
        } else {
            console.warn('No routes found:', response.data.status, response.data.error_message);
            return null;
        }
    } catch (error) {
        console.error('Directions API error:', error);
        return null;
    }
}

/**
 * Get optimized route for multiple destinations (traveling salesman problem)
 */
export async function getOptimizedRoute(
    origin: DirectionsWaypoint,
    destinations: DirectionsWaypoint[],
    returnToOrigin: boolean = false,
    travelMode: 'driving' | 'walking' | 'transit' | 'bicycling' = 'driving'
): Promise<{
    routes: DirectionsRoute[];
    order: number[];
    totalDistance: string;
    totalDuration: string;
} | null> {
    try {
        if (destinations.length === 0) return null;

        console.log('Getting optimized route for', destinations.length, 'destinations');

        // For Google Directions API optimization
        const waypointsParam = destinations
            .map(dest => `${dest.latitude},${dest.longitude}`)
            .join('|');

        const finalDestination = returnToOrigin ? origin : destinations[destinations.length - 1];
        const waypoints = returnToOrigin ? destinations : destinations.slice(0, -1);

        const params: any = {
            origin: `${origin.latitude},${origin.longitude}`,
            destination: `${finalDestination.latitude},${finalDestination.longitude}`,
            waypoints: waypoints.length > 0 ?
                `optimize:true|${waypoints.map(wp => `${wp.latitude},${wp.longitude}`).join('|')}` :
                undefined,
            mode: travelMode,
            key: GOOGLE_DIRECTIONS_API_KEY,
        };

        const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
            params,
        });

        if (response.data.status === 'OK' && response.data.routes.length > 0) {
            const route = response.data.routes[0];

            // Get the optimized waypoint order
            const waypointOrder = route.waypoint_order || [];

            // Create individual route segments
            const routes: DirectionsRoute[] = [];
            let totalDistanceMeters = 0;
            let totalDurationSeconds = 0;

            for (const leg of route.legs) {
                // Extract coordinates from each step and combine them
                const legCoordinates: DirectionsWaypoint[] = [];

                for (const step of leg.steps) {
                    const stepCoords = decodePolyline(step.polyline.points);
                    legCoordinates.push(...stepCoords);
                }

                const steps: DirectionsStep[] = leg.steps.map((step: any) => ({
                    instruction: step.html_instructions.replace(/<[^>]*>/g, ''),
                    distance: step.distance.text,
                    duration: step.duration.text,
                    startLocation: {
                        latitude: step.start_location.lat,
                        longitude: step.start_location.lng,
                    },
                    endLocation: {
                        latitude: step.end_location.lat,
                        longitude: step.end_location.lng,
                    },
                }));

                routes.push({
                    coordinates: legCoordinates,
                    distance: leg.distance.text,
                    duration: leg.duration.text,
                    steps,
                });

                totalDistanceMeters += leg.distance.value;
                totalDurationSeconds += leg.duration.value;
            }

            // Convert totals to readable format
            const totalDistance = `${(totalDistanceMeters / 1000).toFixed(1)} km`;
            const totalDuration = `${Math.round(totalDurationSeconds / 60)} min`;

            console.log(`Optimized route: ${totalDistance}, ${totalDuration}, ${routes.length} segments`);

            return {
                routes,
                order: waypointOrder,
                totalDistance,
                totalDuration,
            };
        } else {
            console.warn('No optimized route found:', response.data.status, response.data.error_message);
            return null;
        }
    } catch (error) {
        console.error('Optimized directions API error:', error);
        return null;
    }
}
