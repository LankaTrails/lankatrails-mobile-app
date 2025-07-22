import api from '@/api/axiosInstance';
import { ApiResponse, Location, Trip, tripRequest } from '@/types/triptypes';

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