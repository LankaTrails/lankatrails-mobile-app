/**
 * Google Directions Service - Migrated to Routes API
 * 
 * This service now uses Google's modern Routes API (v2) as the primary method
 * for getting directions, with automatic fallback to the legacy Directions API
 * when the Routes API is unavailable.
 * 
 * Key improvements:
 * - Uses the modern Routes API for better performance and features
 * - Automatic fallback to legacy API ensures compatibility
 * - Better error handling and user feedback
 * - Traffic-aware routing when available
 * 
 * Setup Requirements:
 * 1. Enable the Routes API in Google Cloud Console
 * 2. Ensure billing is enabled for your Google Cloud project
 * 3. Make sure your API key has Routes API permissions
 */

import axios from 'axios';

const GOOGLE_ROUTES_API_KEY = process.env.EXPO_GOOGLE_DIRECTIONS_API_KEY || 'AIzaSyBWrR4H7o9PTXVot7DQJ7woNDODNwD5LwA';

// Routes API base URL
const ROUTES_API_BASE_URL = 'https://routes.googleapis.com/directions/v2:computeRoutes';

export interface DirectionsWaypoint {
    latitude: number;
    longitude: number;
}

export interface DirectionsRoute {
    coordinates: DirectionsWaypoint[];
    distance: string;
    duration: string;
    steps: DirectionsStep[];
    summary?: {
        description?: string;
        warnings?: string[];
        tollInfo?: {
            hasTolls: boolean;
            estimatedPrice?: string;
        };
        trafficInfo?: {
            hasTrafficData: boolean;
            congestionLevel?: string;
        };
        keyWaypoints?: {
            expressways?: string[];
            majorRoads?: string[];
            transitHubs?: string[];
        };
    };
}

export interface DirectionsStep {
    instruction: string;
    distance: string;
    duration: string;
    startLocation: DirectionsWaypoint;
    endLocation: DirectionsWaypoint;
    travelMode?: string;
    maneuver?: string;
    roadInfo?: {
        isHighway?: boolean;
        isExpressway?: boolean;
        roadName?: string;
        roadType?: string;
    };
    transitDetails?: {
        stopDetails?: {
            arrivalStop?: {
                name: string;
                location: DirectionsWaypoint;
            };
            departureStop?: {
                name: string;
                location: DirectionsWaypoint;
            };
        };
        transitLine?: {
            name: string;
            shortName: string;
            color: string;
            vehicle: {
                name: string;
                type: string;
            };
        };
        headsign?: string;
        headway?: string;
        numStops?: number;
    };
}

export interface RouteApiResponse {
    route: DirectionsRoute;
    apiUsed: 'routes' | 'legacy';
}

/**
 * Extract road information from navigation instruction
 */
function extractRoadInfo(instruction: string): {
    isHighway?: boolean;
    isExpressway?: boolean;
    roadName?: string;
    roadType?: string;
} {
    const roadInfo: {
        isHighway?: boolean;
        isExpressway?: boolean;
        roadName?: string;
        roadType?: string;
    } = {};

    // Convert to lowercase for easier matching
    const lowerInstruction = instruction.toLowerCase();

    // Check for expressways (Sri Lankan context)
    const expresswayPatterns = [
        /southern\s+expressway|e01/i,
        /outer\s+circular\s+expressway|e02/i,
        /colombo\s+katunayake\s+expressway|e03/i,
        /central\s+expressway|e04/i,
        /ruwanpura\s+expressway|e05/i,
        /expressway/i
    ];

    for (const pattern of expresswayPatterns) {
        const match = instruction.match(pattern);
        if (match) {
            roadInfo.isExpressway = true;
            roadInfo.roadName = match[0];
            roadInfo.roadType = 'expressway';
            break;
        }
    }

    // Check for highways
    const highwayPatterns = [
        /a\d+|b\d+/i, // A1, A2, B1, etc.
        /highway/i,
        /(kandy|galle|negombo|anuradhapura|trincomalee|batticaloa|matara|hambantota|ratnapura|kurunegala|puttalam|chilaw|kalutara)\s+(road|highway)/i
    ];

    if (!roadInfo.isExpressway) {
        for (const pattern of highwayPatterns) {
            const match = instruction.match(pattern);
            if (match) {
                roadInfo.isHighway = true;
                roadInfo.roadName = match[0];
                roadInfo.roadType = 'highway';
                break;
            }
        }
    }

    // Extract general road names
    if (!roadInfo.roadName) {
        const roadNamePattern = /([\w\s]+(?:road|street|lane|avenue|highway|route|mawatha|para|gama))/i;
        const match = instruction.match(roadNamePattern);
        if (match) {
            roadInfo.roadName = match[1].trim();
            roadInfo.roadType = 'local_road';
        }
    }

    return roadInfo;
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
 * Get driving directions using the new Routes API
 */
export async function getDirections(
    origin: DirectionsWaypoint,
    destination: DirectionsWaypoint,
    waypoints: DirectionsWaypoint[] = [],
    travelMode: 'driving' | 'walking' | 'transit' | 'motorcycle' = 'driving'
): Promise<DirectionsRoute | null> {
    try {
        console.log('Getting directions from', origin, 'to', destination, 'via', waypoints.length, 'waypoints');

        // First try the new Routes API
        const routesApiResult = await getDirectionsRoutesAPI(origin, destination, waypoints, travelMode);
        if (routesApiResult) {
            return routesApiResult;
        }

        // Fallback to legacy API if Routes API fails
        console.warn('Routes API failed, falling back to legacy Directions API');
        return await getDirectionsLegacyAPI(origin, destination, waypoints, travelMode);
    } catch (error) {
        console.error('Error in getDirections:', error);
        return null;
    }
}

/**
 * Get directions using the new Routes API (v2)
 */
async function getDirectionsRoutesAPI(
    origin: DirectionsWaypoint,
    destination: DirectionsWaypoint,
    waypoints: DirectionsWaypoint[] = [],
    travelMode: 'driving' | 'walking' | 'transit' | 'motorcycle' = 'driving'
): Promise<DirectionsRoute | null> {
    try {
        console.log(`Getting directions via Routes API - Mode: ${travelMode}, From: ${origin.latitude},${origin.longitude} To: ${destination.latitude},${destination.longitude}`);

        // Map travel modes to Routes API format
        const travelModeMap: { [key: string]: string } = {
            driving: 'DRIVE',
            walking: 'WALK',
            transit: 'TRANSIT',
            motorcycle: 'TWO_WHEELER' // Changed from bicycling to motorcycle
        };

        // Prepare the request body for Routes API
        const requestBody: any = {
            origin: {
                location: {
                    latLng: {
                        latitude: origin.latitude,
                        longitude: origin.longitude
                    }
                }
            },
            destination: {
                location: {
                    latLng: {
                        latitude: destination.latitude,
                        longitude: destination.longitude
                    }
                }
            },
            travelMode: travelModeMap[travelMode] || 'DRIVE',
            computeAlternativeRoutes: false,
            languageCode: 'en-US',
            units: 'METRIC'
        };

        // Set routing preference and modifiers based on travel mode
        if (travelMode === 'driving') {
            requestBody.routingPreference = 'TRAFFIC_AWARE';
            requestBody.routeModifiers = {
                avoidTolls: false,
                avoidHighways: false,
                avoidFerries: false
            };
        } else if (travelMode === 'walking') {
            // Walking mode - no routing preference needed, just basic route
            requestBody.routeModifiers = {
                avoidFerries: false
            };
        } else if (travelMode === 'motorcycle') {
            // Motorcycle/Two-wheeler mode - can use highway avoidance
            requestBody.routeModifiers = {
                avoidTolls: false,
                avoidHighways: false, // Motorcycles can use highways
                avoidFerries: false
            };
        } else if (travelMode === 'transit') {
            // Transit mode - no routing preference allowed, only basic route modifiers
            requestBody.routeModifiers = {
                avoidFerries: false
            };
        }

        // Add waypoints if provided
        if (waypoints.length > 0) {
            requestBody.intermediates = waypoints.map(wp => ({
                location: {
                    latLng: {
                        latitude: wp.latitude,
                        longitude: wp.longitude
                    }
                }
            }));
        }

        const response = await axios.post(ROUTES_API_BASE_URL, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': GOOGLE_ROUTES_API_KEY,
                'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs.steps.navigationInstruction,routes.legs.steps.localizedValues,routes.legs.steps.startLocation,routes.legs.steps.endLocation,routes.legs.steps.polyline.encodedPolyline,routes.legs.steps.travelMode,routes.legs.steps.transitDetails,routes.description,routes.warnings,routes.travelAdvisory'
            }
        });

        if (response.data.routes && response.data.routes.length > 0) {
            const route = response.data.routes[0];

            // Decode the polyline to get detailed route coordinates
            const coordinates = decodePolyline(route.polyline.encodedPolyline);

            // Extract turn-by-turn steps from legs with detailed information
            const steps: DirectionsStep[] = [];
            const expressways: string[] = [];
            const majorRoads: string[] = [];
            const transitHubs: string[] = [];

            if (route.legs) {
                for (const leg of route.legs) {
                    if (leg.steps) {
                        for (const step of leg.steps) {
                            // Extract road information from instruction
                            const instruction = step.navigationInstruction?.instructions || 'Continue';
                            const roadInfo = extractRoadInfo(instruction);

                            // Collect expressways and major roads
                            if (roadInfo.isExpressway && roadInfo.roadName) {
                                if (!expressways.includes(roadInfo.roadName)) {
                                    expressways.push(roadInfo.roadName);
                                }
                            } else if (roadInfo.isHighway && roadInfo.roadName) {
                                if (!majorRoads.includes(roadInfo.roadName)) {
                                    majorRoads.push(roadInfo.roadName);
                                }
                            }

                            // Parse transit details if available
                            let transitDetails = undefined;
                            if (step.transitDetails) {
                                transitDetails = {
                                    stopDetails: {
                                        arrivalStop: step.transitDetails.stopDetails?.arrivalStop ? {
                                            name: step.transitDetails.stopDetails.arrivalStop.name || 'Arrival Stop',
                                            location: {
                                                latitude: step.transitDetails.stopDetails.arrivalStop.location?.latLng?.latitude || 0,
                                                longitude: step.transitDetails.stopDetails.arrivalStop.location?.latLng?.longitude || 0
                                            }
                                        } : undefined,
                                        departureStop: step.transitDetails.stopDetails?.departureStop ? {
                                            name: step.transitDetails.stopDetails.departureStop.name || 'Departure Stop',
                                            location: {
                                                latitude: step.transitDetails.stopDetails.departureStop.location?.latLng?.latitude || 0,
                                                longitude: step.transitDetails.stopDetails.departureStop.location?.latLng?.longitude || 0
                                            }
                                        } : undefined
                                    },
                                    transitLine: step.transitDetails.transitLine ? {
                                        name: step.transitDetails.transitLine.name || 'Transit Line',
                                        shortName: step.transitDetails.transitLine.shortName || '',
                                        color: step.transitDetails.transitLine.color || '#0066CC',
                                        vehicle: {
                                            name: step.transitDetails.transitLine.vehicle?.name || 'Public Transport',
                                            type: step.transitDetails.transitLine.vehicle?.type || 'BUS'
                                        }
                                    } : undefined,
                                    headsign: step.transitDetails.headsign,
                                    headway: step.transitDetails.headway,
                                    numStops: step.transitDetails.numStops
                                };

                                // Collect transit hubs
                                if (transitDetails.stopDetails?.departureStop?.name) {
                                    if (!transitHubs.includes(transitDetails.stopDetails.departureStop.name)) {
                                        transitHubs.push(transitDetails.stopDetails.departureStop.name);
                                    }
                                }
                                if (transitDetails.stopDetails?.arrivalStop?.name) {
                                    if (!transitHubs.includes(transitDetails.stopDetails.arrivalStop.name)) {
                                        transitHubs.push(transitDetails.stopDetails.arrivalStop.name);
                                    }
                                }
                            }

                            steps.push({
                                instruction,
                                distance: step.localizedValues?.distance?.text || `${Math.round((step.distanceMeters || 0) / 1000 * 10) / 10} km`,
                                duration: step.localizedValues?.duration?.text || `${Math.round((step.duration || '0s').replace('s', '') / 60)} min`,
                                startLocation: {
                                    latitude: step.startLocation?.latLng?.latitude || 0,
                                    longitude: step.startLocation?.latLng?.longitude || 0,
                                },
                                endLocation: {
                                    latitude: step.endLocation?.latLng?.latitude || 0,
                                    longitude: step.endLocation?.latLng?.longitude || 0,
                                },
                                travelMode: step.travelMode || travelMode.toUpperCase(),
                                maneuver: step.navigationInstruction?.maneuver,
                                roadInfo,
                                transitDetails
                            });
                        }
                    }
                }
            }

            const distanceKm = `${(route.distanceMeters / 1000).toFixed(1)} km`;
            const durationMin = `${Math.round(parseInt(route.duration.replace('s', '')) / 60)} min`;

            // Create summary with route information
            const summary = {
                description: route.description || `${travelMode} route via ${expressways.length > 0 ? expressways.join(', ') : majorRoads.slice(0, 2).join(', ')}`,
                warnings: route.warnings || [],
                tollInfo: {
                    hasTolls: route.travelAdvisory?.tollInfo?.estimatedPrice ? true : false,
                    estimatedPrice: route.travelAdvisory?.tollInfo?.estimatedPrice
                },
                trafficInfo: {
                    hasTrafficData: route.travelAdvisory?.speedReadingIntervals ? true : false,
                    congestionLevel: route.travelAdvisory?.trafficCongestion || 'unknown'
                },
                keyWaypoints: {
                    expressways: expressways.length > 0 ? expressways : undefined,
                    majorRoads: majorRoads.length > 0 ? majorRoads : undefined,
                    transitHubs: transitHubs.length > 0 ? transitHubs : undefined
                }
            };

            console.log(`Route found via Routes API: ${distanceKm}, ${durationMin}, ${coordinates.length} points`);
            if (expressways.length > 0) {
                console.log(`Expressways used: ${expressways.join(', ')}`);
            }
            if (majorRoads.length > 0) {
                console.log(`Major roads used: ${majorRoads.join(', ')}`);
            }
            if (transitHubs.length > 0) {
                console.log(`Transit hubs: ${transitHubs.join(', ')}`);
            }

            return {
                coordinates,
                distance: distanceKm,
                duration: durationMin,
                steps,
                summary
            };
        } else {
            console.warn('No routes found via Routes API');
            return null;
        }
    } catch (error: any) {
        console.error('Routes API error:', error?.response?.data || error.message);

        // Handle specific errors for different travel modes
        if (error?.response?.data?.error) {
            const apiError = error.response.data.error;

            if (apiError.message?.includes('Routing preference cannot be set')) {
                console.warn(`Travel mode ${travelMode} doesn't support the specified routing preference. This should not happen with the updated code.`);
            } else if (apiError.message?.includes('TRANSIT')) {
                console.warn(`Transit routing may not be available in this area. Try driving or walking instead.`);
            } else if (apiError.message?.includes('TWO_WHEELER')) {
                console.warn(`Motorcycle routing may not be available in this area. Try driving or walking instead.`);
            }
        }

        return null;
    }
}

/**
 * Legacy Directions API fallback function
 */
async function getDirectionsLegacyAPI(
    origin: DirectionsWaypoint,
    destination: DirectionsWaypoint,
    waypoints: DirectionsWaypoint[] = [],
    travelMode: 'driving' | 'walking' | 'transit' | 'motorcycle' = 'driving'
): Promise<DirectionsRoute | null> {
    try {
        // Format waypoints for Google API
        const waypointsParam = waypoints.length > 0
            ? waypoints.map(wp => `${wp.latitude},${wp.longitude}`).join('|')
            : undefined;

        const params: any = {
            origin: `${origin.latitude},${origin.longitude}`,
            destination: `${destination.latitude},${destination.longitude}`,
            mode: travelMode === 'motorcycle' ? 'driving' : travelMode, // Legacy API doesn't have motorcycle, use driving
            key: GOOGLE_ROUTES_API_KEY,
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

            // Extract turn-by-turn steps with enhanced information
            const steps: DirectionsStep[] = [];
            const expressways: string[] = [];
            const majorRoads: string[] = [];

            for (const leg of route.legs) {
                for (const step of leg.steps) {
                    const instruction = step.html_instructions.replace(/<[^>]*>/g, ''); // Remove HTML tags
                    const roadInfo = extractRoadInfo(instruction);

                    // Collect expressways and major roads
                    if (roadInfo.isExpressway && roadInfo.roadName) {
                        if (!expressways.includes(roadInfo.roadName)) {
                            expressways.push(roadInfo.roadName);
                        }
                    } else if (roadInfo.isHighway && roadInfo.roadName) {
                        if (!majorRoads.includes(roadInfo.roadName)) {
                            majorRoads.push(roadInfo.roadName);
                        }
                    }

                    steps.push({
                        instruction,
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
                        travelMode: travelMode.toUpperCase(),
                        roadInfo
                    });
                }
            }

            // Create summary for legacy API
            const summary = {
                description: `${travelMode} route${expressways.length > 0 ? ` via ${expressways.join(', ')}` : majorRoads.length > 0 ? ` via ${majorRoads.slice(0, 2).join(', ')}` : ''}`,
                warnings: route.warnings?.map((w: any) => w.warning_text) || [],
                tollInfo: {
                    hasTolls: false, // Legacy API doesn't provide toll info easily
                    estimatedPrice: undefined
                },
                trafficInfo: {
                    hasTrafficData: route.legs[0].duration_in_traffic ? true : false,
                    congestionLevel: 'unknown'
                },
                keyWaypoints: {
                    expressways: expressways.length > 0 ? expressways : undefined,
                    majorRoads: majorRoads.length > 0 ? majorRoads : undefined,
                    transitHubs: undefined
                }
            };

            console.log(`Route found via Legacy API: ${route.legs[0].distance.text}, ${route.legs[0].duration.text}, ${coordinates.length} points`);
            if (expressways.length > 0) {
                console.log(`Expressways used: ${expressways.join(', ')}`);
            }
            if (majorRoads.length > 0) {
                console.log(`Major roads used: ${majorRoads.join(', ')}`);
            }

            return {
                coordinates,
                distance: route.legs[0].distance.text,
                duration: route.legs[0].duration.text,
                steps,
                summary
            };
        } else {
            // Handle specific API errors
            if (response.data.status === 'REQUEST_DENIED') {
                console.error('Google Directions API access denied. Please check your API key and billing settings.');
                console.error('Error message:', response.data.error_message);
            } else if (response.data.status === 'OVER_QUERY_LIMIT') {
                console.error('Google Directions API quota exceeded. Please check your usage limits.');
            } else if (response.data.status === 'ZERO_RESULTS') {
                console.warn('No routes found between the specified locations.');
            } else {
                console.warn('No routes found:', response.data.status, response.data.error_message);
            }
            return null;
        }
    } catch (error) {
        console.error('Legacy Directions API error:', error);
        return null;
    }
}

/**
 * Get optimized route for multiple destinations (traveling salesman problem)
 * Note: Routes API doesn't support optimization yet, so this uses legacy API
 */
export async function getOptimizedRoute(
    origin: DirectionsWaypoint,
    destinations: DirectionsWaypoint[],
    returnToOrigin: boolean = false,
    travelMode: 'driving' | 'walking' | 'transit' | 'motorcycle' = 'driving'
): Promise<{
    routes: DirectionsRoute[];
    order: number[];
    totalDistance: string;
    totalDuration: string;
} | null> {
    try {
        if (destinations.length === 0) return null;

        console.log('Getting optimized route for', destinations.length, 'destinations');
        console.warn('Using legacy API for route optimization as Routes API doesn\'t support optimization yet');

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
            mode: travelMode === 'motorcycle' ? 'driving' : travelMode, // Legacy API doesn't have motorcycle, use driving
            key: GOOGLE_ROUTES_API_KEY,
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

            console.log(`Optimized route via Legacy API: ${totalDistance}, ${totalDuration}, ${routes.length} segments`);

            return {
                routes,
                order: waypointOrder,
                totalDistance,
                totalDuration,
            };
        } else {
            // Handle specific API errors
            if (response.data.status === 'REQUEST_DENIED') {
                console.error('Google Directions API access denied. Please check your API key and billing settings.');
                console.error('Error message:', response.data.error_message);
            } else if (response.data.status === 'OVER_QUERY_LIMIT') {
                console.error('Google Directions API quota exceeded. Please check your usage limits.');
            } else if (response.data.status === 'ZERO_RESULTS') {
                console.warn('No optimized route found between the specified locations.');
            } else {
                console.warn('No optimized route found:', response.data.status, response.data.error_message);
            }
            return null;
        }
    } catch (error) {
        console.error('Optimized directions API error:', error);
        return null;
    }
}

/**
 * Get directions with information about which API was used
 */
export async function getDirectionsWithApiInfo(
    origin: DirectionsWaypoint,
    destination: DirectionsWaypoint,
    waypoints: DirectionsWaypoint[] = [],
    travelMode: 'driving' | 'walking' | 'transit' | 'motorcycle' = 'driving'
): Promise<RouteApiResponse | null> {
    try {
        console.log('Getting directions with API info from', origin, 'to', destination, 'via', waypoints.length, 'waypoints');

        // Try Routes API first
        const routesApiResult = await getDirectionsRoutesAPI(origin, destination, waypoints, travelMode);
        if (routesApiResult) {
            return {
                route: routesApiResult,
                apiUsed: 'routes'
            };
        }

        // Fallback to legacy API
        console.warn('Routes API failed, falling back to legacy Directions API');
        const legacyResult = await getDirectionsLegacyAPI(origin, destination, waypoints, travelMode);
        if (legacyResult) {
            return {
                route: legacyResult,
                apiUsed: 'legacy'
            };
        }

        return null;
    } catch (error) {
        console.error('Error in getDirectionsWithApiInfo:', error);
        return null;
    }
}

/**
 * Check if Routes API is available and working
 */
export async function checkRoutesApiAvailability(): Promise<boolean> {
    try {
        // Test with a simple route from Colombo to Kandy
        const testOrigin: DirectionsWaypoint = { latitude: 6.9271, longitude: 79.8612 };
        const testDestination: DirectionsWaypoint = { latitude: 7.2906, longitude: 80.6337 };

        const result = await getDirectionsRoutesAPI(testOrigin, testDestination, [], 'driving');
        return result !== null;
    } catch (error) {
        console.error('Routes API availability check failed:', error);
        return false;
    }
}

/**
 * Get API usage recommendations
 */
export function getApiUsageRecommendations(): string[] {
    return [
        'The Routes API is the recommended modern API with better performance and features.',
        'If Routes API fails, the service automatically falls back to the legacy Directions API.',
        'For route optimization (traveling salesman problem), only the legacy API is currently supported.',
        'Ensure your Google Cloud project has the Routes API enabled and properly configured.',
        'Check that your API key has the necessary permissions for the Routes API service.'
    ];
}

/**
 * Get travel mode availability and recommendations for a region
 */
export function getTravelModeRecommendations(region: 'sri_lanka' | 'global' = 'global'): { [key: string]: { available: boolean; notes: string } } {
    const recommendations = {
        driving: {
            available: true,
            notes: 'Available worldwide with traffic data in major areas'
        },
        walking: {
            available: true,
            notes: 'Available in most mapped areas'
        },
        transit: {
            available: region === 'sri_lanka' ? false : true,
            notes: region === 'sri_lanka'
                ? 'Limited public transit data available in Sri Lanka. Use driving or walking instead.'
                : 'Available in major cities worldwide'
        },
        motorcycle: {
            available: region === 'sri_lanka' ? true : true,
            notes: region === 'sri_lanka'
                ? 'Available on motorable roads. Please follow traffic rules.'
                : 'Available on motorable roads worldwide'
        }
    };

    return recommendations;
}

/**
 * Log detailed route information in a user-friendly format
 */
export function logRouteDetails(route: DirectionsRoute, travelMode: string): void {
    console.log(`\n📍 ROUTE DETAILS (${travelMode.toUpperCase()})`);
    console.log(`Distance: ${route.distance}`);
    console.log(`Duration: ${route.duration}`);

    if (route.summary) {
        if (route.summary.description) {
            console.log(`Description: ${route.summary.description}`);
        }

        if (route.summary.keyWaypoints?.expressways?.length) {
            console.log(`🛣️  Expressways: ${route.summary.keyWaypoints.expressways.join(', ')}`);
        }

        if (route.summary.keyWaypoints?.majorRoads?.length) {
            console.log(`🚗 Major Roads: ${route.summary.keyWaypoints.majorRoads.join(', ')}`);
        }

        if (route.summary.keyWaypoints?.transitHubs?.length) {
            console.log(`🚌 Transit Hubs: ${route.summary.keyWaypoints.transitHubs.join(', ')}`);
        }

        if (route.summary.tollInfo?.hasTolls) {
            console.log(`💰 Tolls: Expected${route.summary.tollInfo.estimatedPrice ? ` (~${route.summary.tollInfo.estimatedPrice})` : ''}`);
        }

        if (route.summary.warnings?.length) {
            console.log(`⚠️  Warnings:`);
            route.summary.warnings.forEach(warning => console.log(`   - ${warning}`));
        }
    }

    // Log transit details if available
    const transitSteps = route.steps.filter(step => step.transitDetails);
    if (transitSteps.length > 0) {
        console.log(`\n🚌 TRANSIT DETAILS:`);
        transitSteps.forEach((step, index) => {
            const transit = step.transitDetails!;
            console.log(`   Step ${index + 1}:`);
            if (transit.stopDetails?.departureStop) {
                console.log(`     From: ${transit.stopDetails.departureStop.name}`);
            }
            if (transit.transitLine) {
                console.log(`     Line: ${transit.transitLine.shortName || transit.transitLine.name} (${transit.transitLine.vehicle.name})`);
            }
            if (transit.headsign) {
                console.log(`     Direction: ${transit.headsign}`);
            }
            if (transit.stopDetails?.arrivalStop) {
                console.log(`     To: ${transit.stopDetails.arrivalStop.name}`);
            }
            if (transit.numStops) {
                console.log(`     Stops: ${transit.numStops}`);
            }
        });
    }

    console.log(`\n`);
}
