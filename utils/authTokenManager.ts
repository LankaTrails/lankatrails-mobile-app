import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { getToken, saveToken, clearAllTokens } from './tokenStorage';
import { router } from 'expo-router';
import { logger } from './logger';

interface JwtPayload {
    exp: number;
}

let isRefreshing = false;
let requestQueue: Array<(token: string) => void> = [];

/**
 * Check if token expired
 */
export function isTokenExpired(token: string): boolean {
    try {
        const { exp } = jwtDecode<JwtPayload>(token);
        const now = Date.now() / 1000;
        return exp < now;
    } catch {
        return true; // Treat invalid token as expired
    }
}

/**
 * Check if token about to expire (buffer in seconds)
 */
export function isTokenAboutToExpire(token: string, buffer = 30): boolean {
    try {
        const { exp } = jwtDecode<JwtPayload>(token);
        const now = Date.now() / 1000;
        return exp < now + buffer;
    } catch {
        return true;
    }
}

/**
 * Refresh token with rotation
 */
export async function handleTokenRefresh(): Promise<string> {
    if (isRefreshing) {
        logger.info('[AUTH] Waiting for ongoing token refresh...');
        return new Promise((resolve) => requestQueue.push(resolve));
    }

    isRefreshing = true;

    try {
        const refreshToken = await getToken('REFRESH_TOKEN');
        console.log('[AUTH] Retrieved refresh token:', refreshToken);

        if (!refreshToken) throw new Error('No refresh token');

        logger.info('[AUTH] Sending refresh token request...');
        const response = await axios.post(
            `${process.env.EXPO_PUBLIC_API_URL}/auth/refresh-token`,
            {}, // no body
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Refresh-Token': refreshToken,
                }
            }
        );
        logger.info('[AUTH] Refresh token response received', response.data);

        const { jwtToken, refreshToken: newRefreshToken } = response.data.data;

        if (!jwtToken) throw new Error('Invalid refresh response: missing access token');

        await saveToken('ACCESS_TOKEN', jwtToken);
        logger.info('[AUTH] New access token saved');

        if (newRefreshToken) {
            await saveToken('REFRESH_TOKEN', newRefreshToken);
            logger.info('[AUTH] New refresh token saved (rotation)');
        }

        requestQueue.forEach((cb) => cb(jwtToken));
        requestQueue = [];

        return jwtToken;
    } catch (err) {
        logger.error('[AUTH] Token refresh failed', err);

        await clearAllTokens();
        router.replace('/signIn');
        requestQueue = [];

        throw new Error('Session expired. Please login again.');
    } finally {
        isRefreshing = false;
    }
}
