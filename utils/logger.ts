/** Dev-only logging: silent in release builds, so nothing sensitive reaches device logs. */
const enabled = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';

export const logger = {
    debug: (...args: unknown[]) => {
        if (enabled) console.debug('[DEBUG]', ...args);
    },
    info: (...args: unknown[]) => {
        if (enabled) console.info('[INFO]', ...args);
    },
    warn: (...args: unknown[]) => {
        if (enabled) console.warn('[WARN]', ...args);
    },
    error: (...args: unknown[]) => {
        if (enabled) console.error('[ERROR]', ...args);
    },
};
