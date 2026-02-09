export const colors = {
  primary: {
    50: "#EEF2FF",
    100: "#E0E7FF",
    200: "#C7D2FE",
    300: "#A5B4FC",
    400: "#818CF8",
    500: "#6366F1",
    600: "#4F46E5",
    700: "#4338CA",
    800: "#3730A3",
    900: "#312E81",
  },
  secondary: {
    50: "#F0FDFA",
    100: "#CCFBF1",
    200: "#99F6E4",
    300: "#5EEAD4",
    400: "#2DD4BF",
    500: "#14B8A6",
    600: "#0D9488",
    700: "#0F766E",
    800: "#115E59",
    900: "#134E4A",
  },
  accent: {
    400: "#FBBF24",
    500: "#F59E0B",
    600: "#D97706",
  },
  bg: {
    900: "#0F172A",
    850: "#101B30",
    800: "#1E293B",
    750: "#1E3044",
    700: "#334155",
    600: "#475569",
  },
  text: {
    primary: "#F8FAFC",
    secondary: "#94A3B8",
    muted: "#64748B",
  },
  surface: {
    glass: "rgba(30, 41, 59, 0.80)",
    base: "#0F172A",
    elevated: "#1E293B",
  },
  surfaceStrong: "rgba(17, 24, 39, 0.86)",
  stroke: "rgba(255, 255, 255, 0.10)",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
} as const;

export const gradients = {
  nightSky: [colors.bg[900], colors.bg[850], "#0B1120"],
  primaryGlow: ["rgba(99, 102, 241, 0.30)", "rgba(99, 102, 241, 0.00)"],
  secondaryGlow: ["rgba(20, 184, 166, 0.25)", "rgba(20, 184, 166, 0.00)"],
  primaryButton: [colors.primary[500], colors.primary[600]],
} as const;

export const durations = {
  instant: 90,
  fast: 160,
  normal: 260,
  slow: 420,
  celebration: 800,
} as const;

export const springs = {
  snappy: { damping: 20, stiffness: 420 },
  gentle: { damping: 16, stiffness: 120 },
  bouncy: { damping: 12, stiffness: 180 },
  slow: { damping: 22, stiffness: 60 },
} as const;
