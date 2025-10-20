import api from '@/api/axiosInstance';
import type { ApiResponse, Location } from '@/types/commonTypes';
import type { BookingItem, PaymentRequest } from '@/types/bookingTypes';


export const createBooking = async (tripItemId: number): Promise<ApiResponse<PaymentRequest>> => {
    try {
        const response = await api.post<ApiResponse<PaymentRequest>>(`/tourist/booking/${tripItemId}/book`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const confirmBooking = async (paymentIntentId: string): Promise<ApiResponse<string>> => {
    try {
        const response = await api.post<ApiResponse<string>>(`/tourist/booking/${paymentIntentId}/confirm`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getAllBookings = async ( tripId : number): Promise<ApiResponse<BookingItem[]>> => {
    try {
        const response = await api.get<ApiResponse<BookingItem[]>>(`/tourist/booking/${tripId}/all`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const cancelBooking = async (tripItemId: number): Promise<ApiResponse<string>> => {
    try {
        const response = await api.delete<ApiResponse<string>>(`/tourist/booking/${tripItemId}/cancel`);
        return response.data;
    } catch (error) {
        throw error;
    }
};