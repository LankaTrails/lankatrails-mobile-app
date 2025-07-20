import api from '@/api/axiosInstance';
import type { ApiResponse, SearchResponse, ServiceSearchRequest } from '@/types/serviceTypes';
import { ServiceCategory } from '@/types/serviceTypes';

export async function searchServices(
    request: ServiceSearchRequest
): Promise<ApiResponse<SearchResponse>> {
    try {
        const response = await api.post('/service/search', request);
        return response.data;
    } catch (error) {
        console.error('Error searching services:', error);
        throw error;
    }
}

// Helper function to search services by location
export async function searchServicesByLocation(
    location: string,
    category?: ServiceCategory,
    radius?: number
): Promise<ApiResponse<SearchResponse>> {
    const request: ServiceSearchRequest = {
        city: location,
        category,
        radiusKm: radius,
    };

    return searchServices(request);
}

// Helper function to search services by coordinates
export async function searchServicesByCoordinates(
    lat: number,
    lng: number,
    category?: ServiceCategory,
    radius: number = 10
): Promise<ApiResponse<SearchResponse>> {
    const request: ServiceSearchRequest = {
        lat,
        lng,
        radiusKm: radius,
        category,
    };

    return searchServices(request);
}