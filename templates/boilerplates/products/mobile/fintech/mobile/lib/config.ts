/**
 * App Configuration
 * 
 * Environment-based configuration flags and settings.
 */

/**
 * Demo mode flag - enables skip authentication for app walkthroughs
 * Set EXPO_PUBLIC_DEMO_MODE=true in your environment to enable
 */
export const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO_MODE === 'true';

/**
 * Check if we're running in development mode
 */
export const IS_DEV = __DEV__;

/**
 * App version info (can be expanded)
 */
export const APP_VERSION = '1.0.0';

