import api from '@/api/axiosInstance';
import { ChatRoom, DirectChatRoom, GroupChatRoom } from '@/types/chatTypes';
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
        logger.error('[Chatroom] Error fetching chat room:', error);
        
        // Log more details about the error
        if (error instanceof Error) {
            logger.error(`[Chatroom] Error message: ${error.message}`);
        }
        
        // Check if it's an Axios error with response data
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as any;
            logger.error(`[Chatroom] HTTP Status: ${axiosError.response?.status}`);
            logger.error(`[Chatroom] Response data:`, axiosError.response?.data);
            
            // Handle 302 status - backend returns this when chat room already exists with valid data
            if (axiosError.response?.status === 302 && axiosError.response?.data) {
                logger.info(`[Chatroom] Chat room already exists (302), returning data:`, axiosError.response.data);
                return axiosError.response.data;
            }
            
            // Handle other specific error cases
            if (axiosError.response?.status === 403) {
                throw new Error('Authentication required. Please log in to access chat rooms.');
            } else if (axiosError.response?.status === 404) {
                throw new Error('Chat room service not found. Please check if the backend is running.');
            } else if (axiosError.response?.status === 500) {
                throw new Error('Server error. Please try again later.');
            }
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