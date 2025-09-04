import { PriceType, ServiceType } from "./serviceTypes";

export type ChatRoomType = 'GROUP' | 'DIRECT';

export type ChatMessageType = 'TEXT' | 'IMAGE' | 'FILE' | 'SERVICE_CARD' | 'SYSTEM' | 'REPLY';

export interface LocationDTO {
    // Define location properties as needed
    [key: string]: any;
}

export interface TouristDto {
    id: number;
    firstName: string;
    lastName: string;
    country: string;
    profilePictureUrl: string;
}

export interface ProviderDto {
    id: number;
    businessName: string;
    profilePictureUrl: string;
}

export interface ServiceDTO {
    serviceId: number;
    serviceName: string;
    Category: ServiceType;
    locations: LocationDTO[];
    price: number;
    priceType: PriceType;
    mainImageUrl: string;
}

export interface ChatFilesDto {
    id: string; // MongoDB document ID
    fileName: string;
    fileType: string;
    fileUrl: string;
}

export interface ChatDataResponse {
    id: number;
    userId: number;
    message: string;
    timestamp: string;
    status: 'sent' | 'received' | 'read';
}

export interface ChatRoom {
    id: number | null;
    chatRoomType: ChatRoomType;
    createdAt?: string;
}

export interface DirectChatRoom extends ChatRoom {
    providerId: number | null;
    touristId: number | null;
    provider?: ProviderDto;
    tourist?: TouristDto;
}

export interface GroupChatRoom extends ChatRoom {
    tripId: number | null;
    participants: TouristDto[];
}

export interface ChatMessage {
    id: string | null;
    chatRoomId: number;
    senderId: number;
    messageType: ChatMessageType;
    content: string;
    sentAt: string; // ISO string representation of Instant
    replyToMessageId?: string | null;
    serviceCardId?: number | null;
    serviceCard?: ServiceDTO | null;
    files?: ChatFilesDto | null;
    readBy?: Record<number, string>; // userId -> timestamp when read
}