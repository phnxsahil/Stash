/**
 * Production-safe logging utility
 * Respects environment mode and only logs in development
 */

const isDev = import.meta.env.DEV;

export const logger = {
    /**
     * Log informational messages (development only)
     */
    log: (...args: any[]) => {
        if (isDev) {
            console.log(...args);
        }
    },

    /**
     * Log errors (always logged)
     */
    error: (...args: any[]) => {
        console.error(...args);
    },

    /**
     * Log warnings (development only)
     */
    warn: (...args: any[]) => {
        if (isDev) {
            console.warn(...args);
        }
    },

    /**
     * Log debug information (development only)
     */
    debug: (...args: any[]) => {
        if (isDev) {
            console.debug(...args);
        }
    },
};
