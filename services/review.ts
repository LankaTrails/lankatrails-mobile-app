import api from "@/api/axiosInstance";
import type { reviewRequest, ReviewResponse } from "@/types/reviewTypes";
import { logger } from "@/utils/logger";

// Get reviews for a service 
export const getReviews = async (id: number): Promise<ReviewResponse> => {
    try {
        const response = await api.get(`/reviews/${id}`);
        return response.data.data;
    } catch (error) {
        logger.error('Error fetching reviews: ', error);
        throw new Error('Failed to fetch reviews');
    }
}

export const submitReview = async (id: number, reviewRequest: reviewRequest): Promise<void> => {
    try {
        await api.post(`/reviews/${id}`, reviewRequest);
    } catch (error) {
        logger.error('Error submitting review: ', error);
        throw new Error('Failed to submit review');
    }   
}

export const updateReview = async (id: number, reviewRequest: reviewRequest): Promise<void> => {
    try {
    
        await api.put(`/reviews/${id}`, reviewRequest);
    } catch (error) {
        logger.error('Error updating review: ', error);
        throw new Error('Failed to update review');
    }
}

export const deleteReview = async (id: number): Promise<void> => {
    try {
        await api.delete(`/reviews/${id}`);
    } catch (error) {
        logger.error('Error deleting review: ', error);
        throw new Error('Failed to delete review');
    }
}
