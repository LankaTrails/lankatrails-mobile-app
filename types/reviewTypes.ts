import type { TouristDto } from "@/types/chatTypes";

export interface ReviewItem {
    id: number;
    rate: number;
    review: string;
    createdDate: string; // ISO string format for LocalDateTime
    tourist: TouristDto;
}

export interface ReviewResponse {
    reviews: ReviewItem[];
    averageRating: number;
    totalReviews: number;
}

export interface reviewRequest {
    rate: number;
    review: string;
    createdDate: string; // ISO string format for LocalDateTime
}