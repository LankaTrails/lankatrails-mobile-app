export interface ServiceSearchRequest {
    lat?: number;
    lng?: number;
    radiusKm?: number;

    city?: string;
    district?: string;
    province?: string;
    country?: string;

    category?: ServiceCategory;
}

export enum ServiceCategory {
    ACCOMMODATION = "Accommodation",
    ACTIVITY = "Activity",
    TOUR_GUIDE = "Tour Guide",
    TRANSPORT = "Transport",
    FOOD_BEVERAGE = "Food & Beverage",
}

export interface Location {
    formattedAddress: string;
    city: string;
    district: string;
    province: string;
    country: string;
    postalCode: string;
    latitude: number;
    longitude: number;
}

export interface Service {
    serviceId: number;
    serviceName: string;
    locationBased: Location;
    mainImageUrl: string;
    category: string;
}

export interface ServiceSearchResponse {
    success: boolean;
    message: string;
    data: Service[];
    details: any;
}