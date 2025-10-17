import api from '@/api/axiosInstance';
import { ChatRoom, DirectChatRoom, GroupChatRoom, ChatMessage } from '@/types/chatTypes';
import { ApiResponse } from '@/types/serviceTypes';
import { logger } from '@/utils/logger';

/**
 * Fetch or create direct chat room with a user
 */
export async function getDirectChatRoom(
    userId: number
): Promise<ApiResponse<DirectChatRoom>> {
    try {
        logger.info(`[Chatroom] Fetching/creating direct chat room with user: ${userId}`);
        const response = await api.get<ApiResponse<DirectChatRoom>>(`/chat/rooms/direct/${userId}`);
        logger.info(`[Chatroom] API Response:`, response.data);
        return response.data;
    } catch (error) {
        // Handle expected status codes first before logging as error
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as any;

            // Handle 302 status - backend returns this when chat room already exists with valid data
            if (axiosError.response?.status === 302 && axiosError.response?.data) {
                logger.info(`[Chatroom] Direct chat room already exists (302), returning data:`, axiosError.response.data);
                return axiosError.response.data;
            }

            // Handle 404 and 400 status - chat room not available, this is expected for invitation flow
            if (axiosError.response?.status === 404 || axiosError.response?.status === 400) {
                logger.info(`[Chatroom] Direct chat room not available with provider ${userId} (status: ${axiosError.response?.status}) - showing invitation flow`);
                throw new ChatRoomNotFoundError(
                    'Direct chat room not available. Start a conversation to create a chat room.',
                    undefined,
                    userId
                );
            }

            // Handle other specific error cases
            if (axiosError.response?.status === 403) {
                throw new Error('Authentication required. Please log in to access chat rooms.');
            } else if (axiosError.response?.status === 500) {
                throw new Error('Server error. Please try again later.');
            }
        }

        // Only log unexpected errors
        logger.error('[Chatroom] Unexpected error fetching direct chat room:', error);

        // Log more details about the error for debugging
        if (error instanceof Error) {
            logger.error(`[Chatroom] Error message: ${error.message}`);
        }

        throw error;
    }
}

export async function getChatRoomById(
    roomId: number
): Promise<ApiResponse<ChatRoom>> {
    try {
        logger.info(`[Chatroom] Fetching chat room by ID: ${roomId}`);
        const response = await api.get<ApiResponse<GroupChatRoom>>(`/chat/rooms/${roomId}`);
        return response.data;
    } catch (error) {
        logger.error('[Chatroom] Error fetching chat room:', error);
        throw error;
    }
}

// Custom error type for chat room not found
export class ChatRoomNotFoundError extends Error {
    constructor(
        message: string,
        public readonly tripId?: number,
        public readonly providerId?: number,
        public readonly roomId?: number
    ) {
        super(message);
        this.name = 'ChatRoomNotFoundError';
    }
}

/**
 * Fetch group chat room by trip ID
 */
export async function getGroupChatRoomByTripId(
    tripId: number
): Promise<ApiResponse<GroupChatRoom>> {
    try {
        logger.info(`[Chatroom] Fetching group chat room for trip ID: ${tripId}`);
        const response = await api.get<ApiResponse<GroupChatRoom>>(`/chat/rooms/trip/${tripId}`);
        logger.info(`[Chatroom] Group chat room fetched:`, response.data);
        return response.data;
    } catch (error) {
        // Handle expected status codes first before logging as error
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as any;

            // Handle 302 status - backend returns this when chat room exists
            if (axiosError.response?.status === 302 && axiosError.response?.data) {
                logger.info(`[Chatroom] Group chat room already exists (302), returning data:`, axiosError.response.data);
                return axiosError.response.data;
            }

            // Handle 404 and 400 status - chat room not available, this is expected for invitation flow
            if (axiosError.response?.status === 404 || axiosError.response?.status === 400) {
                logger.info(`[Chatroom] Group chat room not available for trip ${tripId} (status: ${axiosError.response?.status}) - showing invitation flow`);
                throw new ChatRoomNotFoundError(
                    'Group chat room not available. This trip may need more participants to start chatting.',
                    tripId
                );
            }
        }

        // Only log unexpected errors
        logger.error('[Chatroom] Unexpected error fetching group chat room:', error);
        throw error;
    }
}

/**
 * Get all messages for a specific chat room
 */
export async function getRoomMessages(
    roomId: number
): Promise<ApiResponse<ChatMessage[]>> {
    try {
        logger.info(`[Chat] Fetching messages for room ID: ${roomId}`);
        const response = await api.get<ApiResponse<ChatMessage[]>>(`/chat/rooms/${roomId}/messages`);
        logger.info(`[Chat] Messages fetched for room ${roomId}:`, response.data);
        return response.data;
    } catch (error) {
        logger.error('[Chat] Error fetching room messages:', error);

        // Handle 302 status
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as any;
            if (axiosError.response?.status === 302 && axiosError.response?.data) {
                logger.info(`[Chat] Messages found (302), returning data:`, axiosError.response.data);
                return axiosError.response.data;
            }
        }

        throw error;
    }
}

/**
 * Get messages between two users
 */
export async function getMessagesBetweenUsers(
    user1Id: number,
    user2Id: number
): Promise<ApiResponse<ChatMessage[]>> {
    try {
        logger.info(`[Chat] Fetching messages between users: ${user1Id} and ${user2Id}`);
        const response = await api.get<ApiResponse<ChatMessage[]>>(`/chat/users/${user1Id}/${user2Id}/messages`);
        logger.info(`[Chat] Messages fetched between users:`, response.data);
        return response.data;
    } catch (error) {
        logger.error('[Chat] Error fetching messages between users:', error);

        // Handle 302 status
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as any;
            if (axiosError.response?.status === 302 && axiosError.response?.data) {
                logger.info(`[Chat] Messages found (302), returning data:`, axiosError.response.data);
                return axiosError.response.data;
            }
        }

        throw error;
    }
}

/**
 * Send a file message to a chat room
 */
export async function sendFileMessage(
    roomId: number,
    message: ChatMessage,
    file: File
): Promise<void> {
    try {
        logger.info(`[Chat] Sending file message to room ${roomId}`);

        const formData = new FormData();
        formData.append('message', JSON.stringify(message));
        formData.append('file', file);

        await api.post(`/chat/${roomId}/send-file`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        logger.info(`[Chat] File message sent successfully to room ${roomId}`);
    } catch (error) {
        logger.error('[Chat] Error sending file message:', error);
        throw error;
    }
}

/**
 * Mark a specific message as read
 */
export async function markMessageAsRead(
    messageId: string
): Promise<ApiResponse<string>> {
    try {
        logger.info(`[Chat] Marking message as read: ${messageId}`);
        const response = await api.put<ApiResponse<string>>(`/chat/messages/${messageId}/read`);
        logger.info(`[Chat] Message marked as read:`, response.data);
        return response.data;
    } catch (error) {
        logger.error('[Chat] Error marking message as read:', error);
        throw error;
    }
}

/**
 * Mark all messages in a room as read
 */
export async function markAllMessagesAsRead(
    roomId: number
): Promise<ApiResponse<string>> {
    try {
        logger.info(`[Chat] Marking all messages as read in room: ${roomId}`);
        const response = await api.put<ApiResponse<string>>(`/chat/rooms/${roomId}/read-all`);
        logger.info(`[Chat] All messages marked as read in room ${roomId}:`, response.data);
        return response.data;
    } catch (error) {
        logger.error('[Chat] Error marking all messages as read:', error);
        throw error;
    }
}