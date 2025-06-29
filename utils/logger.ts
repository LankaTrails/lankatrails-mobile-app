const isProduction = process.env.NODE_ENV === 'production';

export const logger = {
    info: (...args: any[]) => {
        if (!isProduction) console.info('[INFO]', ...args);
    },
    warn: (...args: any[]) => {
        if (!isProduction) console.warn('[WARN]', ...args);
    },
    error: (...args: any[]) => {
        if (!isProduction) console.error('[ERROR]', ...args);
    },
    debug: (...args: any[]) => {
        if (!isProduction) console.debug('[DEBUG]', ...args);
    },
};
