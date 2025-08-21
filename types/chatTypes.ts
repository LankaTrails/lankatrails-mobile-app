export type ChatRoomType = 'GROUP' | 'DIRECT';

export type ChatMessageType = 'TEXT' | 'IMAGE' | 'FILE' | 'SERVICE_CARD' | 'SYSTEM' | 'REPLY';

export type ServiceDTO = {
    serviceId: number;
    serviceName: string;
    serviceCategory: string;
    //LocationDTO:
    price: number;
    priceType: string;
    mainImageUrl: string;
}

export interface ChatFilesDto {
    id: number;
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
}

export interface GroupChatRoom extends ChatRoom {
    tripId: number | null;
    participantIds: number[];
}

export interface ChatMessage {
    id: string | null;
    chatRoomId: number;
    senderId: number;
    messageType: ChatMessageType;
    content: string;
    sentAt: string;
    replyToMessageId?: string | null;
    serviceCardId?: number | null;
    serviceCard?: ServiceDTO | null;
    files?: ChatFilesDto | null;
    readBy?: Record<number, string>;
}