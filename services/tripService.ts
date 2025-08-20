import api from '@/api/axiosInstance';
import { ApiResponse, Location, Trip, TripInvitationRequest, TripItem, tripRequest } from '@/types/triptypes';

/**
 * Creates a new trip
 * @param tripData The trip data to create
 * @returns Promise containing the API response with the created trip
 */
export const createTrip = async (tripData: tripRequest): Promise<ApiResponse<Trip>> => {
    try {
        console.log('Creating trip with data:', tripData);
        const response = await api.post<ApiResponse<Trip>>('/trips/create', tripData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Creates a new trip
 * @param tripData The trip data to create
 * @returns Promise containing the API response with the created trip
 */
export const getMyTrips = async (): Promise<ApiResponse<Trip[]>> => {
    try {
        const response = await api.get<ApiResponse<Trip[]>>('/trips/my-trips');
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Creates a new trip
 * @param tripData The trip data to create
 * @returns Promise containing the API response with the created trip
 */
export const getTripById = async (tripId: number): Promise<ApiResponse<Trip>> => {
    try {
        const response = await api.get<ApiResponse<Trip>>(`/trips/${tripId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
/**
 * Creates a new trip
 * @param tripData The trip data to create
 * @returns Promise containing the API response with the created trip
 */
export const getTripItemsByTripId = async (tripId: number): Promise<ApiResponse<TripItem[]>> => {
    try {
        const response = await api.get<ApiResponse<TripItem[]>>(`/trips/${tripId}/items`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Creates a new trip
 * @param tripData The trip data to create
 * @returns Promise containing the API response with the created trip
 */
export const addToTrip = async (tripId: number, tripitem: TripItem): Promise<ApiResponse<Trip>> => {
    try {
        const response = await api.post<ApiResponse<Trip>>(`/trips/add-trip-item/${tripId}`, tripitem);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Fetches all cities from the backend
 * @returns Promise containing the API response with array of cities
 */
export const fetchAllCities = async (): Promise<ApiResponse<Location[]>> => {
    try {
        const response = await api.get<ApiResponse<Location[]>>('/locations/cities');
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Generate invitation for the trip
export const generateTripInvitation = async (tripId: number, invitationData: TripInvitationRequest): Promise<ApiResponse<string>> => {
    try {
        const response = await api.post<ApiResponse<string>>(`/trips/invitations/generate`, invitationData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Accept the invitation
export const acceptTripInvitation = async (token: string): Promise<ApiResponse<Trip>> => {
    try {
        const response = await api.post<ApiResponse<Trip>>(`/trips/invitations/${token}/accept`);
        return response.data;
    } catch (error) {
        throw error;
    }
};