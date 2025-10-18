import api from '@/api/axiosInstance';
import { Trip, TripInvitationRequest, TripItem, tripRequest, AvailabilityDto, TimeSlotsResponseDTO } from '@/types/triptypes';
import type { ApiResponse, Location } from '@/types/commonTypes';

/**
 * Creates a new trip
 * @param tripData The trip data to create
 * @returns Promise containing the API response with the created trip
 */
export const createTrip = async (tripData: tripRequest): Promise<ApiResponse<Trip>> => {
    try {
        console.log('Creating trip with data:', tripData);
        console.log('Person count - Adults:', tripData.numberOfAdults, 'Children:', tripData.numberOfChildren);
        const response = await api.post<ApiResponse<Trip>>('/trips/create', tripData);
        console.log('Trip creation response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error creating trip:', error);
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
 * Adds an item to a trip
 * @param tripId The ID of the trip
 * @param tripitem The trip item to add
 * @returns Promise containing the API response with the success status
 */
export const addToTrip = async (tripId: number, tripitem: TripItem): Promise<ApiResponse<string>> => {
    try {
        console.log('Adding to trip:', tripId, tripitem);
        console.log('Trip item details - Adults:', tripitem.numberOfAdults, 'Children:', tripitem.numberOfChildren, 'Units:', tripitem.noOfUnits);
        const response = await api.post<ApiResponse<string>>(`/trips/add-trip-item/${tripId}`, tripitem);
        console.log('Add to trip response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error adding to trip:', error);
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

/**
 * Gets available time slots for a service
 * @param availabilityDto The availability criteria
 * @param serviceId The ID of the service
 * @returns Promise containing the API response with available time slots
 */
export const getAvailableTimeSlots = async (availabilityDto: AvailabilityDto, serviceId: number): Promise<ApiResponse<TimeSlotsResponseDTO>> => {
    try {
        const response = await api.post<ApiResponse<TimeSlotsResponseDTO>>(`/tourist/booking/available-slots/${serviceId}`, availabilityDto);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get trip participants
export const getTripParticipants = async (tripId: number): Promise<ApiResponse<any[]>> => {
    try {
        const response = await api.get<ApiResponse<any[]>>(`/trips/${tripId}/participants`);
        return response.data;
    } catch (error) {
        throw error;
    }
};