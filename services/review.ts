import api from "@/api/axiosInstance";
import type { reviewRequest, ReviewResponse } from "@/types/reviewTypes";

// Get reviews for a service 
export const getReviews = async (id: number): Promise<ReviewResponse> => {
    try {
        console.log('Fetching reviews for service ID:', id);
        const response = await api.get(`/reviews/${id}`);
        console.log('getReviews response: ', response);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching reviews: ', error);
        throw new Error('Failed to fetch reviews');
    }
}

export const submitReview = async (id: number, reviewRequest: reviewRequest): Promise<void> => {
    try {
        console.log('Submitting review: ', reviewRequest);
        await api.post(`/reviews/${id}`, reviewRequest);
    } catch (error) {
        console.error('Error submitting review: ', error);
        throw new Error('Failed to submit review');
    }   
}

export const updateReview = async (id: number, reviewRequest: reviewRequest): Promise<void> => {
    try {
        console.log('Updating review ID:', id, 'with data:', reviewRequest);    
        await api.put(`/reviews/${id}`, reviewRequest);
    } catch (error) {
        console.error('Error updating review: ', error);
        throw new Error('Failed to update review');
    }
}

export const deleteReview = async (id: number): Promise<void> => {
    try {
        console.log('Deleting review ID:', id);
        await api.delete(`/reviews/${id}`);
    } catch (error) {
        console.error('Error deleting review: ', error);
        throw new Error('Failed to delete review');
    }
}
