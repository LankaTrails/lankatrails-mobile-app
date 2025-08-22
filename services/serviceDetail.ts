import api from '@/api/axiosInstance';
import type {
    AccommodationServiceDetail,
    ActivityServiceDetail,
    FoodBeverageServiceDetail,
    ServiceDetailResponse,
    TourGuideServiceDetail,
    TransportServiceDetail
} from '@/types/serviceTypes';
import { logger } from '@/utils/logger';

/**
 * Fetch accommodation service details by ID
 */
export async function fetchAccommodationService(
    serviceId: number
): Promise<ServiceDetailResponse> {
    try {
        logger.info(`[ServiceDetail] Fetching accommodation service: ${serviceId}`);
        const response = await api.get<ServiceDetailResponse>(`/provider/accommodation/${serviceId}`);
        return response.data;
    } catch (error) {
        logger.error('[ServiceDetail] Error fetching accommodation service:', error);
        throw error;
    }
}

/**
 * Fetch activity service details by ID
 */
export async function fetchActivityService(
    serviceId: number
): Promise<ServiceDetailResponse> {
    try {
        logger.info(`[ServiceDetail] Fetching activity service: ${serviceId}`);
        const response = await api.get<ServiceDetailResponse>(`/provider/activity-service/${serviceId}`);
        console.log('Activity Service Response:', response.data.data.locations);
        return response.data;
    } catch (error) {
        logger.error('[ServiceDetail] Error fetching activity service:', error);
        throw error;
    }
}

/**
 * Fetch food & beverage service details by ID
 */
export async function fetchFoodBeverageService(
    serviceId: number
): Promise<ServiceDetailResponse> {
    try {
        logger.info(`[ServiceDetail] Fetching food & beverage service: ${serviceId}`);
        const response = await api.get<ServiceDetailResponse>(`/provider/food-beverage/${serviceId}`);
        return response.data;
    } catch (error) {
        logger.error('[ServiceDetail] Error fetching food & beverage service:', error);
        throw error;
    }
}

/**
 * Fetch tour guide service details by ID
 */
export async function fetchTourGuideService(
    serviceId: number
): Promise<ServiceDetailResponse> {
    try {
        logger.info(`[ServiceDetail] Fetching tour guide service: ${serviceId}`);
        const response = await api.get<ServiceDetailResponse>(`/provider/tour-guide/${serviceId}`);
        return response.data;
    } catch (error) {
        logger.error('[ServiceDetail] Error fetching tour guide service:', error);
        throw error;
    }
}

/**
 * Fetch transport service details by ID
 */
export async function fetchTransportService(
    serviceId: number
): Promise<ServiceDetailResponse> {
    try {
        logger.info(`[ServiceDetail] Fetching transport service: ${serviceId}`);
        const response = await api.get<ServiceDetailResponse>(`/provider/transport/${serviceId}`);
        return response.data;
    } catch (error) {
        logger.error('[ServiceDetail] Error fetching transport service:', error);
        throw error;
    }
}

/**
 * Generic service detail fetcher based on category
 * This is a helper function that routes to the appropriate service method
 */
export async function fetchServiceDetail(
    serviceId: number,
    category: 'ACCOMMODATION' | 'ACTIVITY' | 'FOOD_BEVERAGE' | 'TOUR_GUIDE' | 'TRANSPORT'
): Promise<ServiceDetailResponse> {
    switch (category) {
        case 'ACCOMMODATION':
            return fetchAccommodationService(serviceId);
        case 'ACTIVITY':
            return fetchActivityService(serviceId);
        case 'FOOD_BEVERAGE':
            return fetchFoodBeverageService(serviceId);
        case 'TOUR_GUIDE':
            return fetchTourGuideService(serviceId);
        case 'TRANSPORT':
            return fetchTransportService(serviceId);
        default:
            throw new Error(`Unknown service category: ${category}`);
    }
}

/**
 * Type guard functions to help with type narrowing
 */
export function isAccommodationService(service: any): service is AccommodationServiceDetail {
    return 'accommodationType' in service;
}

export function isActivityService(service: any): service is ActivityServiceDetail {
    return 'activityType' in service;
}

export function isFoodBeverageService(service: any): service is FoodBeverageServiceDetail {
    return 'foodAndBeverageType' in service;
}

export function isTourGuideService(service: any): service is TourGuideServiceDetail {
    return 'languages' in service;
}

export function isTransportService(service: any): service is TransportServiceDetail {
    return 'vehicleCategory' in service;
}
