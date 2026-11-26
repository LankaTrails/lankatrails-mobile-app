import Constants from 'expo-constants';

/**
 * Runtime configuration. EXPO_PUBLIC_* values are inlined at build time; app.config.ts copies the
 * same values into `extra` so they are also readable from native builds.
 */
const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;

// Each process.env.EXPO_PUBLIC_* must be written out in full: Expo only inlines static references.
function pick(inlined: string | undefined, fromExtra?: string): string {
    return inlined || (fromExtra ? extra[fromExtra] : undefined) || '';
}

/** Backend REST API, e.g. http://192.168.1.20:8080/api (use the machine's LAN IP on a device). */
export const API_URL = pick(process.env.EXPO_PUBLIC_API_URL, 'apiUrl').replace(/\/$/, '');

/** Backend origin that serves /uploads/... files. Defaults to API_URL without /api. */
export const BACKEND_URL = (pick(process.env.EXPO_PUBLIC_URL, 'backendUrl') || API_URL.replace(/\/api$/, '')).replace(/\/$/, '');

/** SockJS/STOMP endpoint for chat. */
export const WS_URL = `${BACKEND_URL}/ws`;

export const GOOGLE_PLACES_API_KEY = pick(process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY);
export const GOOGLE_DIRECTIONS_API_KEY = pick(process.env.EXPO_PUBLIC_GOOGLE_DIRECTIONS_API_KEY) || GOOGLE_PLACES_API_KEY;
export const STRIPE_PUBLISHABLE_KEY = pick(process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY, 'stripePublishableKey');
export const OPENWEATHER_API_KEY = pick(process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY);
export const APP_SCHEME = (pick(process.env.EXPO_PUBLIC_SCHEME) || 'lankatrailsmobileapp').replace(/:\/\/$/, '');

/** Absolute URL for a backend upload path such as /uploads/service-pictures/x.jpg. */
export function fileUrl(path?: string | null): string {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    return `${BACKEND_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}
