import { Location, ApiResponse } from "./commonTypes";
import type { ServiceType, ServiceCategory } from "./commonTypes";

// Re-export commonly used types
export { ServiceCategory, ApiResponse };

export type PriceType = 'FIXED' | 'PER_PERSON' | 'PER_UNIT' | 'HYBRID' | 'PER_HOUR' | 'PER_DAY' | 'PER_NIGHT' | 'PER_KM';

export type BookingType =
    | 'TIME_SLOTS'     // Bookings are made for specific time slots
    | 'MULTI_DAY'      // Bookings can span multiple days
    | 'WHOLE_DAY'      // Bookings are for the entire day
    | 'FIXED_TIME'     // Bookings are made for a fixed duration
    | 'FLEXIBLE_HOURS' // Bookings allow customers to choose start and end times
    | 'EVENT_BASED';   // Bookings are tied to specific events

export type ServiceStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';

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
    category?: ServiceType;
    accommodationType?: AccommodationType;
    activityType?: ActivityType;
    vehicleType?: VehicleType;
    foodAndBeverageType?: FoodBeverageType;
    tourGuideType?: TourGuideType;
}

export interface ProviderDetailRequest {
    providerId: number;
    category: ServiceType;

    // Location is required - either city OR coordinates with radius
    city?: string;
    lat?: number;
    lng?: number;
    radiusKm?: number;
}

export interface Service {
    serviceId: number;
    serviceName: string | null;
    category: ServiceType | null;
    locations: Location[] | null;
    prices: Price[] | null;
    mainImageUrl: string | null;
    provider : Provider | null;
}

export type Provider = {
    id: number;
    businessName: string | null;
    profilePictureUrl: string | null;
}

export interface Price {
    priceType: PriceType;
    amount: number;
}

export interface ServiceSearchResponse {
    serviceId: number;
    serviceName: string;
    mainImageUrl: string;
    locations: Location[];
    category: ServiceType;
    prices: Price[];
}

export interface ProviderSearchResponse {
    providerId: number;
    businessName: string;
    coverImageUrl: string;
    location: Location;
    category: ServiceType;
}

export interface SearchResponse {
    providers: ProviderSearchResponse[] | null;
    services: ServiceSearchResponse[] | null;
}

export interface ProviderDetailResponse {
    providerId: number;
    businessName: string;
    businessDescription: string;
    coverImageUrl: string;
    location: Location;
    category: ServiceType;
    services: Service[];
}

// Common interfaces for service details
export interface TabSection {
    id: number;
    heading: string;
    content: string;
}

export interface PolicySection {
    id: number;
    heading: string;
    content: string;
}

export interface ServiceImage {
    imageUrl: string;
    service: any; // Can be null based on the response
}

// Base service detail interface with common fields
export interface BaseServiceDetail {
    serviceId: number | null;
    serviceName: string;
    locations: Location[];
    contactNo: string;
    status: ServiceStatus | null;
    tabsSection: TabSection[];
    policySection: PolicySection[];
    images: ServiceImage[] | null;
    availableTimeDTOS: AvailableTimeDTO[];
    priceConfig?: PriceConfigDTO;
    bookingConfig?: BookingConfigDTO;

    // Legacy properties for backward compatibility
    price?: number;
    priceType?: PriceType;
}

// Tour Guide specific service detail
export interface TourGuideServiceDetail extends BaseServiceDetail {
    serviceAreas: any[] | null;
    languages: string[];
    tourGuideType: TourGuideType | null;
}

// Food & Beverage specific service detail
export interface FoodBeverageServiceDetail extends BaseServiceDetail {
    foodAndBeverageType: FoodBeverageType;
    vegetarianOptions: boolean;
    halalCertified: boolean;
    alcoholServed: boolean;
    outdoorSeating: boolean;
    liveMusic: boolean;
    cuisineType: string;

    // Additional properties that might be used in UI
    openHours?: string;
}

// Accommodation specific service detail
export interface AccommodationServiceDetail extends BaseServiceDetail {
    accommodationType: AccommodationType;
    freeWifi: boolean;
    parkingAvailable: boolean;
    breakfastIncluded: boolean;
    airConditioned: boolean;
    swimmingPool: boolean;
    petFriendly: boolean;
    laundryService: boolean;
    roomService: boolean;
    gymAccess: boolean;
    spaServices: boolean;

    // Additional properties that might be used in UI
    maxGuests?: number;
    numberOfRooms?: number;
}

// Activity specific service detail
export interface ActivityServiceDetail extends BaseServiceDetail {
    activityType: ActivityType;
    activityDetails: string;
    safetyInstructions: string;
}

// Transport specific service detail
export interface TransportServiceDetail extends BaseServiceDetail {
    vehicleCategory: VehicleType;
    driverIncluded: boolean;
    airConditioned: boolean;
    transmissionType: TransmissionType;
    fuelType: FuelType;

    // Additional properties that might be used in UI
    vehicleCapacity?: number;
    vehicleQty?: number;
}


export interface BreakTimeDTO {
    breakStart: string; // Format: "HH:mm"
    breakEnd: string;   // Format: "HH:mm"
}

export interface AvailableTimeDTO {
    dayOfWeek: string;
    openTime: string;     // Format: "HH:mm"
    closeTime: string;    // Format: "HH:mm"
    is24Hours: boolean;
    isClosed: boolean;
    breakTimes: BreakTimeDTO[];
}

export interface BookingConfigDTO {
    bookingType: BookingType;

    // Capacity and unit management
    totalUnits?: number;
    manageCapacity?: boolean;
    unitAdultCapacity?: number;
    unitChildCapacity?: number;
    minUnitsPerBooking?: number;
    maxUnitsPerBooking?: number;
    allowExtraCapacity?: boolean;
    extraAdultCapacity?: number;
    extraChildCapacity?: number;
    extraAdultCapacityLimit?: number;
    extraChildCapacityLimit?: number;

    // For time-based bookings
    slotDuration?: number; // in minutes
    bufferTime?: number;   // in minutes
    allowBackToBackBookings?: boolean;

    // For date-based bookings
    minimumBookingDays?: number;
    maximumBookingDays?: number;
    defaultCheckInTime?: string; // Format: "HH:mm"
    defaultCheckOutTime?: string; // Format: "HH:mm"

    // Common fields
    advanceBookingPeriod?: number; // in days
    lastMinuteBookingPeriod?: number; // in hours
}

export interface PriceConfigDTO {
    fixedPrice?: number;
    pricePerUnit?: number;
    pricePerAdult?: number;
    pricePerChild?: number;
    priceType: PriceType;
    extraChargePerUnit?: number;
    extraPerAdult?: number;
    extraPerChild?: number;
    extraChargeType?: PriceType;
    allowAdvancePayment?: boolean;
    advancePaymentPercentage?: number;
    advancePaymentFixedAmount?: number;
    requiresDeposit?: boolean;
    depositAmount?: number;
}

// Union type for all service details
export type ServiceDetail = TourGuideServiceDetail | FoodBeverageServiceDetail | AccommodationServiceDetail | ActivityServiceDetail | TransportServiceDetail;


