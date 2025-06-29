import { saveToken as originalSaveToken, getToken as originalGetToken, clearAllTokens as originalClearAllTokens } from './secureStore';

let saveTokenQueue: Array<{ key: "ACCESS_TOKEN" | "REFRESH_TOKEN"; value: string }> = [];
let saveTimeout: ReturnType<typeof setTimeout> | null = null;
const SAVE_DELAY = 200; // ms

export async function saveToken(key: "ACCESS_TOKEN" | "REFRESH_TOKEN", value: string) {
    saveTokenQueue.push({ key, value });

    if (!saveTimeout) {
        saveTimeout = setTimeout(async () => {
            const batch = [...saveTokenQueue];
            saveTokenQueue = [];
            saveTimeout = null;

            await Promise.all(batch.map(({ key, value }) => originalSaveToken(key, value)));
        }, SAVE_DELAY);
    }
}

export async function getToken(key: "ACCESS_TOKEN" | "REFRESH_TOKEN") {
    return originalGetToken(key);
}

export async function clearAllTokens() {
    return originalClearAllTokens();
}
