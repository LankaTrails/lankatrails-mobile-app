
export type ServiceType = 'ACTIVITY' | 'TOUR_GUIDE' | 'TRANSPORT' | 'ACCOMMODATION' | 'FOOD_BEVERAGE';

export enum ServiceCategory {
    ACCOMMODATION = "ACCOMMODATION",
    ACTIVITY = "ACTIVITY",
    TOUR_GUIDE = "TOUR_GUIDE",
    TRANSPORT = "TRANSPORT",
    FOOD_BEVERAGE = "FOOD_BEVERAGE",
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    details?: string;
}

export interface Location {
    locationId?: number | null;
    formattedAddress: string;
    city: string;
    district: string;
    province: string;
    country: string;
    postalCode: string;
    latitude: number;
    longitude: number;
}