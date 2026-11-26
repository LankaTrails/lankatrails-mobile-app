import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { API_URL } from '@/utils/config';
import { getToken, saveToken, clearAllTokens } from './tokenStorage';
import { logger } from './logger';

interface JwtPayload {
    exp: number;
}

/** Registered by the store so a failed refresh can clear Redux without a circular import. */
let onSessionExpired: (() => void) | null = null;
export function setSessionExpiredHandler(handler: () => void) {
    onSessionExpired = handler;
}

// Separate client without interceptors, so a refresh can never trigger another refresh.
const refreshClient = axios.create({ timeout: 15000 });

let refreshInFlight: Promise<string> | null = null;

export function isTokenExpired(token: string): boolean {
    try {
        const { exp } = jwtDecode<JwtPayload>(token);
        return exp < Date.now() / 1000;
    } catch {
        return true; // treat an unreadable token as expired
    }
}

/** True when the token expires within `buffer` seconds. */
export function isTokenAboutToExpire(token: string, buffer = 30): boolean {
    try {
        const { exp } = jwtDecode<JwtPayload>(token);
        return exp < Date.now() / 1000 + buffer;
    } catch {
        return true;
    }
}

/**
 * Exchanges the refresh token for a new pair (the backend rotates it). Concurrent callers share one
 * request; if it fails every caller is rejected, tokens are cleared and the session-expired handler
 * signs the user out.
 */
export function handleTokenRefresh(): Promise<string> {
    if (!refreshInFlight) {
        refreshInFlight = refresh().finally(() => {
            refreshInFlight = null;
        });
    }
    return refreshInFlight;
}

async function refresh(): Promise<string> {
    try {
        const refreshToken = await getToken('REFRESH_TOKEN');
        if (!refreshToken) throw new Error('No refresh token');

        const response = await refreshClient.post(`${API_URL}/auth/refresh-token`, {}, {
            headers: { 'Content-Type': 'application/json', 'Client-Type': 'mobile', 'X-Refresh-Token': refreshToken },
        });
        const { jwtToken, refreshToken: rotated } = response.data?.data ?? {};
        if (!jwtToken) throw new Error('Refresh response did not include an access token');

        await saveToken('ACCESS_TOKEN', jwtToken);
        if (rotated) await saveToken('REFRESH_TOKEN', rotated);
        return jwtToken;
    } catch (err) {
        logger.warn('[auth] token refresh failed', err instanceof Error ? err.message : err);
        await clearAllTokens();
        onSessionExpired?.();
        throw new Error('Session expired. Please sign in again.');
    }
}
