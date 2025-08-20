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

export type TripItemType = "PLACE" | "SERVICE";

export type ServiceType = 'ACTIVITY' | 'TOUR_GUIDE' | 'TRANSPORT' | 'ACCOMMODATION' | 'FOOD_BEVERAGE';

export type TripRole = "EDITOR" | "ADMIN" | "MEMBER" | "VIEWER";

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

export interface PlaceDTO {
    placeId: string;
    placeName: string | null;
    photoReference?: string | null;
    latitude: number | null;
    longitude: number | null;
    rating?: number | null;
}

export interface ServiceDTO {
    serviceId: number;
    serviceName: string | null;
    category: ServiceType | null;
    locationBased: Location | null;
    mainImageUrl?: string | null;
}

export interface TripItem {
    type: TripItemType;
    place?: PlaceDTO;
    service?: ServiceDTO;
    startTime: string; // ISO date-time string format
    endTime: string; // ISO date-time string format
}

export interface TripInvitationRequest {
    tripId: number;
    role: TripRole;
    isGroupInvitation: boolean;
}