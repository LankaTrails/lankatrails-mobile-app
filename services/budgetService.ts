import api from '@/api/axiosInstance';
import { 
    BudgetCategory, 
    TripBudget, 
    ApiResponse,
    TripBudgetCategoryDto
} from '@/types/budgetTypes';
import { logger } from "@/utils/logger";

/**
 * Service class for handling budget-related API calls
 */
export class BudgetService {
    
    /**
     * Gets trip budget details including all categories
     * @param tripId The ID of the trip
     * @returns Promise with the trip budget details
     */
    static async getTripBudgetDetails(tripId: number): Promise<ApiResponse<TripBudget>> {
        try {
            const response = await api.get<ApiResponse<TripBudget>>(`/trips-budget/${tripId}`);
            return response.data;
        } catch (error: any) {
            logger.error(`[BudgetService] Error fetching budget details for trip: ${tripId}`);
            logger.error(`[BudgetService] Error details:`, {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                url: error.config?.url,
                fullUrl: error.config?.baseURL + error.config?.url
            });
            
            // Handle specific error cases
            if (error.response?.status === 401 || error.response?.status === 403) {
                return {
                    success: false,
                    message: 'Authentication required. Please log in again.',
                    data: {
                        tripId,
                        totalBudgetLimit: 0,
                        totalSpentAmount: 0,
                        tripBudgetCategories: []
                    } as TripBudget
                };
            }
            
            if (error.response?.status === 404) {
                return {
                    success: false,
                    message: 'Budget data not found for this trip',
                    data: {
                        tripId,
                        totalBudgetLimit: 0,
                        totalSpentAmount: 0,
                        tripBudgetCategories: []
                    } as TripBudget
                };
            }

            if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
                return {
                    success: false,
                    message: 'Network error. Please check your connection and try again.',
                    data: {
                        tripId,
                        totalBudgetLimit: 0,
                        totalSpentAmount: 0,
                        tripBudgetCategories: []
                    } as TripBudget
                };
            }
            
            throw error;
        }
    }

    /**
     * Adds or updates a budget category for a trip
     * @param budgetData The budget category data
     * @returns Promise with the API response
     */
    static async addOrUpdateBudgetCategory(budgetData: TripBudgetCategoryDto): Promise<ApiResponse<TripBudgetCategoryDto>> {
        try {
            const response = await api.post<ApiResponse<TripBudgetCategoryDto>>(
                '/trips-budget/category-limit',
                budgetData
            );
            return response.data;
        } catch (error) {
            logger.error(`[BudgetService] Error adding/updating budget category:`, error);
            throw error;
        }
    }

    /**
     * Gets budget category limits for a trip
     * @param tripId The ID of the trip
     * @returns Promise with the budget category limits
     */
    static async getTripBudgetLimitsByTripId(tripId: number): Promise<ApiResponse<TripBudgetCategoryDto[]>> {
        try {
            const response = await api.get<ApiResponse<TripBudgetCategoryDto[]>>(`/trips-budget/category-limit/${tripId}`);
            return response.data;
        } catch (error) {
            logger.error(`[BudgetService] Error fetching budget limits for trip: ${tripId}`, error);
            throw error;
        }
    }

    /**
     * Updates the total budget for a trip
     * @param tripBudgetData The trip budget data
     * @returns Promise with the API response
     */
    static async updateTripTotalBudget(tripBudgetData: TripBudget): Promise<ApiResponse<TripBudget>> {
        try {
            const response = await api.put<ApiResponse<TripBudget>>(
                '/trips-budget/total-budget',
                tripBudgetData
            );
            return response.data;
        } catch (error) {
            logger.error(`[BudgetService] Error updating total budget:`, error);
            throw error;
        }
    }
}

// Legacy function for backward compatibility
export async function fetchBudget(
    tripId: number
): Promise<BudgetCategory> {
    try {
        const response = await api.get(`/trips-budget/${tripId}`);
        return response.data;
    } catch (error) {
        logger.error(`[BudgetService] Error fetching budget for trip: ${tripId}`, error);
        throw error;
    }
}