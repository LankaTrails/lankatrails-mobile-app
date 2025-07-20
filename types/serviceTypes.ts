export type ServiceType = 'ACTIVITY' | 'TOUR_GUIDE' | 'TRANSPORT' | 'ACCOMMODATION' | 'FOOD_BEVERAGE';

export type PriceType = 'FIXED' | 'PER_PERSON' | 'PER_KM' | 'PER_HOUR' | 'PER_DAY' | 'PER_NIGHT' | 'PER_WEEK' | 'PER_MONTH';

export type ActivityType = 'ADVENTURE' | 'CULTURAL' | 'NATURE' | 'RELAXATION' | 'SPORTS' | 'WATER_SPORTS' | 'WELLNESS' | 'EDUCATIONAL' | 'NIGHTLIFE';

export type VehicleType = 'CAR' | 'VAN' | 'BUS' | 'TRUCK' | 'MOTORCYCLE' | 'BICYCLE' | 'SCOOTER' | 'PICKUP' | 'SUV' | 'TUK_TUK';

export type AccommodationType = 'HOTEL' | 'HOSTEL' | 'GUEST_HOUSE' | 'APARTMENT' | 'VILLA' | 'HOMESTAY' | 'CAMPING' | 'RESORT' | 'LODGE';

export type FoodBeverageType = 'RESTAURANT' | 'CAFE' | 'BAR' | 'PUB' | 'FOOD_COURT' | 'FOOD_TRUCK' | 'BAKERY' | 'BREWERY' | 'WINERY' | 'DISTILLERY' | 'STREET_FOOD' | 'BUFFET';

export type TourGuideType = 'NATIONAL' | 'CHAUFFEUR' | 'SITE' | 'AREA';

export type FuelType = 'PETROL' | 'DIESEL' | 'ELECTRIC' | 'HYBRID';

export type TransmissionType = 'MANUAL' | 'AUTOMATIC' | 'SEMI_AUTOMATIC';

export interface ServiceSearchRequest {
    lat?: number;
    lng?: number;
    radiusKm?: number;

    city?: string;
    category?: ServiceCategory;
    accommodationType?: AccommodationType;
    activityType?: ActivityType;
    vehicleType?: VehicleType;
    foodAndBeverageType?: FoodBeverageType;
    tourGuideType?: TourGuideType;
}

export enum ServiceCategory {
    ACCOMMODATION = "ACCOMMODATION",
    ACTIVITY = "ACTIVITY",
    TOUR_GUIDE = "TOUR_GUIDE",
    TRANSPORT = "TRANSPORT",
    FOOD_BEVERAGE = "FOOD_BEVERAGE",
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
    data: GroupedProviderService[];
    details: any;
}

export interface GroupedProviderService {
    providerId: number;
    businessName: string;
    coverImageUrl: string;
    groupedLocation: Location;
    services: Service[];
}