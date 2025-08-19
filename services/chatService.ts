import api from '@/api/axiosInstance';
import { ChatRoom } from '@/types/chatTypes';
import { ApiResponse } from '@/types/serviceTypes';
import { logger } from '@/utils/logger';

/**
 * Fetch or create direct chat room with a user
 */
export async function getDirectChatRoom(
    userId: number
): Promise<ApiResponse<ChatRoom>> {
    try {
        logger.info(`[Chatroom] Fetching/creating direct chat room with user: ${userId}`);
        const response = await api.get<ApiResponse<ChatRoom>>(`/chat/rooms/direct/${userId}`);
        return response.data;
    } catch (error) {
        logger.error('[Chatroom] Error fetching chat room:', error);
        throw error;
    }
}