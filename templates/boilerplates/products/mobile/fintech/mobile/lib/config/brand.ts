/**
 * Brand Configuration
 *
 * Centralized branding for the trading platform.
 * Update these values to match your product identity.
 */

export const brand = {
  name: 'Trading Platform',
  tagline: 'AI-Powered Trading Intelligence',
  bundleId: 'com.example.tradingplatform',
  scheme: 'trading-platform',
  support: {
    email: 'support@example.com',
    website: 'https://example.com',
  },
} as const;

export const colors = {
  primary: {
    DEFAULT: '#6366F1', // Indigo
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1',
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },
  secondary: '#8B5CF6',
  background: '#000000',
  surface: '#0A0A0A',
  surfaceElevated: '#141414',
  border: '#1A1A1A',
  muted: '#808080',
  text: {
    primary: '#FFFFFF',
    secondary: '#A0A0A0',
    tertiary: '#666666',
  },
  status: {
    success: '#22C55E',
    error: '#EF4444',
    warning: '#EAB308',
    info: '#3B82F6',
  },
} as const;

export type BrandConfig = typeof brand;
export type ColorConfig = typeof colors;
