export const colors = {
  // Primary - Indigo (neutral, professional)
  primary: {
    DEFAULT: '#6366F1',
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1', // Main accent
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },

  // Accent - Violet
  accent: {
    DEFAULT: '#8B5CF6',
    500: '#8B5CF6',
    600: '#7C3AED',
    muted: 'rgba(139, 92, 246, 0.15)',
  },

  // Neutral - Refined dark palette
  neutral: {
    0: '#000000',   // Pure black (background)
    50: '#0A0A0A',  // Surface (very subtle lift)
    100: '#141414', // Elevated surface / cards
    150: '#1A1A1A', // Card hover
    200: '#222222', // Borders
    300: '#333333', // Disabled / dividers
    400: '#555555', // Tertiary text
    500: '#777777', // Placeholder
    600: '#999999', // Secondary text
    700: '#BBBBBB', // Muted text
    800: '#DDDDDD', // Light text
    900: '#FFFFFF', // Primary text
  },

  // Semantic Colors
  success: '#22C55E',
  error: '#EF4444',
  warning: '#EAB308',
  info: '#3B82F6',
  sell: '#EF4444',

  // Special - Subtle glows
  glow: 'rgba(99, 102, 241, 0.2)',
  glowMedium: 'rgba(99, 102, 241, 0.35)',
  glowStrong: 'rgba(99, 102, 241, 0.5)',
  overlay: 'rgba(0, 0, 0, 0.8)',

  // Border beam effect
  armyGreen: '#4338CA',
  armyGreenMuted: 'rgba(67, 56, 202, 0.6)',
  armyGreenLight: '#6366F1',

  // Card backgrounds
  card: {
    DEFAULT: '#111111',
    elevated: '#151515',
    border: '#222222',
  },
} as const;
