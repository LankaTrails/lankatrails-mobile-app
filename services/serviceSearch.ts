import api from '@/api/axiosInstance';
import type { ProviderDetailRequest, ProviderDetailResponse, SearchResponse, ServiceSearchRequest } from '@/types/serviceTypes';
import type { ApiResponse } from '@/types/commonTypes';
import { ServiceCategory } from '@/types/commonTypes';

export async function searchProvider(
    request: ProviderDetailRequest
): Promise<ApiResponse<ProviderDetailResponse>> {
    try {
        const response = await api.post('/service/provider', request);
        return response.data;
    } catch (error) {
        console.error('Error searching providers:', error);
        throw error;
    }
}

export async function searchServices(
    request: ServiceSearchRequest
): Promise<ApiResponse<SearchResponse>> {
    try {
        const response = await api.post('/service/search', request);
        console.log('searchServices response:', response.data);
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