export type TripStatus = "PLANNING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "ARCHIVED";

export type TripTagType =
    | "HONEYMOON"
    | "FAMILY"
    | "ADVENTURE"
    | "CULTURAL"
    | "BUSINESS"
    | "EDUCATIONAL"
    | "RELAXATION"
    | "SOLO"
    | "GROUP"
    | "ROMANTIC"
    | "NATURE"
    | "HISTORICAL"
    | "SPORTS"
    | "FESTIVAL"
    | "LEISURE";

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

export interface Trip {
    tripId: number;
    tripName: string;
    startDate: string; // ISO date string format
    endDate: string; // ISO date string format
    startLocation: Location;
    locations: Location[];
    numberOfAdults: number;
    numberOfChildren: number;
    totalBudget: number;
    totalBudgetLimit: number;
    totalDistance: number;
    status?: TripStatus;
    tags?: TripTagType[];
}

export interface tripRequest {
    tripName: string;
    startDate: string; // ISO date string format
    endDate: string; // ISO date string format
    startLocation: Location;
    locations: Location[];
    numberOfAdults?: number; // Default: 1
    numberOfChildren?: number; // Default: 0
    tripStatus?: TripStatus;
    totalBudget?: number; // Default: 0.0
    totalBudgetLimit?: number; // Default: 0.0
    totalDistance?: number; // Default: 0.0
    accommodationLimit?: number; // Default: 0.0
    foodLimit?: number; // Default: 0.0
    transportLimit?: number; // Default: 0.0
    activityLimit?: number; // Default: 0.0
    shoppingLimit?: number; // Default: 0.0
    miscellaneousLimit?: number; // Default: 0.0
    tags?: TripTagType[]; // Trip tags/vibes
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    details?: string;
}