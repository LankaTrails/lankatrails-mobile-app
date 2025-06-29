import { AxiosError } from 'axios';

interface NormalizedError {
    message: string;
    isAuthError?: boolean;
    isNetworkError?: boolean;
    originalError?: any;
}

export function normalizeError(error: unknown): NormalizedError {
    if (!error) {
        return { message: 'Unknown error occurred' };
    }

    if (typeof error === 'string') {
        return { message: error };
    }

    if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
            return {
                message: error.response.data?.message || 'Authentication error',
                isAuthError: true,
                originalError: error,
            };
        }

        if (error.code === 'ERR_NETWORK') {
            return {
                message: 'Network error. Please check your connection.',
                isNetworkError: true,
                originalError: error,
            };
        }

        return {
            message: error.response?.data?.message || error.message || 'Request failed',
            originalError: error,
        };
    }

    if (error instanceof Error) {
        return { message: error.message, originalError: error };
    }

    return { message: 'An unexpected error occurred' };
}
