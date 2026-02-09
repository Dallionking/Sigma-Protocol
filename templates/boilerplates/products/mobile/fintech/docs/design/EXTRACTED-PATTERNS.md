# Extracted Design Patterns — Trading Platform

**Date:** 2025-12-11  
**Purpose:** Copy-paste ready design tokens for implementation

---

## Color Palette (React Native / NativeWind)

```typescript
// theme/colors.ts
export const colors = {
  // Primary Colors
  primary: {
    DEFAULT: '#6366F1',
    50: '#E6FFF0',
    100: '#B3FFD1',
    200: '#80FFB3',
    300: '#4DFF94',
    400: '#1AFF75',
    500: '#6366F1', // Main accent
    600: '#00CC34',
    700: '#009927',
    800: '#00661A',
    900: '#00330D',
  },
  
  // Secondary (Spring Green variant)
  secondary: {
    DEFAULT: '#818CF8',
    500: '#818CF8',
  },
  
  // Neutral (True blacks and grays)
  neutral: {
    0: '#000000',   // Pure black (background)
    50: '#0A0A0A',  // Surface
    100: '#141414', // Elevated surface
    200: '#1A1A1A', // Borders
    300: '#333333', // Disabled
    400: '#666666', // Tertiary text
    500: '#808080', // Placeholder
    600: '#A0A0A0', // Secondary text
    700: '#CCCCCC', // Muted text
    800: '#E6E6E6', // Light text
    900: '#FFFFFF', // Primary text
  },
  
  // Semantic Colors
  success: '#6366F1',
  error: '#FF4136',
  warning: '#FFDC00',
  info: '#00BFFF',
  
  // Special
  glow: 'rgba(99, 102, 241, 0.3)',
  glowStrong: 'rgba(99, 102, 241, 0.5)',
  overlay: 'rgba(0, 0, 0, 0.7)',
};
```

---

## Typography (React Native StyleSheet)

```typescript
// theme/typography.ts
import { Platform, TextStyle } from 'react-native';

const fontFamily = Platform.select({
  ios: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
    mono: 'Menlo',
  },
  android: {
    regular: 'Roboto',
    medium: 'Roboto-Medium',
    semibold: 'Roboto-Medium',
    bold: 'Roboto-Bold',
    mono: 'monospace',
  },
});

export const typography = {
  // Display (Balance, Hero Numbers)
  display: {
    fontFamily: fontFamily?.mono,
    fontSize: 48,
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: -1,
    lineHeight: 56,
  },
  
  displayLarge: {
    fontFamily: fontFamily?.mono,
    fontSize: 64,
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: -2,
    lineHeight: 72,
  },
  
  // Headlines
  h1: {
    fontSize: 34,
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: 0.25,
    lineHeight: 41,
  },
  
  h2: {
    fontSize: 28,
    fontWeight: '600' as TextStyle['fontWeight'],
    letterSpacing: 0,
    lineHeight: 34,
  },
  
  h3: {
    fontSize: 22,
    fontWeight: '600' as TextStyle['fontWeight'],
    letterSpacing: 0,
    lineHeight: 28,
  },
  
  h4: {
    fontSize: 20,
    fontWeight: '600' as TextStyle['fontWeight'],
    letterSpacing: 0.15,
    lineHeight: 25,
  },
  
  // Body
  bodyLarge: {
    fontSize: 17,
    fontWeight: '400' as TextStyle['fontWeight'],
    letterSpacing: -0.4,
    lineHeight: 22,
  },
  
  body: {
    fontSize: 15,
    fontWeight: '400' as TextStyle['fontWeight'],
    letterSpacing: -0.2,
    lineHeight: 20,
  },
  
  bodySmall: {
    fontSize: 13,
    fontWeight: '400' as TextStyle['fontWeight'],
    letterSpacing: -0.1,
    lineHeight: 18,
  },
  
  // Labels
  label: {
    fontSize: 13,
    fontWeight: '500' as TextStyle['fontWeight'],
    letterSpacing: 0,
    lineHeight: 18,
  },
  
  labelSmall: {
    fontSize: 11,
    fontWeight: '500' as TextStyle['fontWeight'],
    letterSpacing: 0.5,
    lineHeight: 13,
    textTransform: 'uppercase' as TextStyle['textTransform'],
  },
  
  // Button
  button: {
    fontSize: 17,
    fontWeight: '600' as TextStyle['fontWeight'],
    letterSpacing: 0,
    lineHeight: 22,
  },
  
  // Mono (for numbers, code)
  mono: {
    fontFamily: fontFamily?.mono,
    fontSize: 15,
    fontWeight: '500' as TextStyle['fontWeight'],
    letterSpacing: 0,
    lineHeight: 20,
  },
  
  monoLarge: {
    fontFamily: fontFamily?.mono,
    fontSize: 24,
    fontWeight: '600' as TextStyle['fontWeight'],
    letterSpacing: -0.5,
    lineHeight: 29,
  },
};
```

---

## Spacing Scale

```typescript
// theme/spacing.ts
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
} as const;

// Common layout values
export const layout = {
  screenPaddingHorizontal: 20,
  screenPaddingTop: 16,
  cardPadding: 20,
  sectionGap: 24,
  itemGap: 12,
  tabBarHeight: 84, // includes safe area
  headerHeight: 44,
};
```

---

## Border Radius

```typescript
// theme/borderRadius.ts
export const borderRadius = {
  none: 0,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;
```

---

## Shadows (React Native)

```typescript
// theme/shadows.ts
import { Platform, ViewStyle } from 'react-native';

export const shadows = {
  none: {},
  
  sm: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.5,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
    },
  }),
  
  md: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 12,
    },
    android: {
      elevation: 6,
    },
  }),
  
  lg: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.6,
      shadowRadius: 24,
    },
    android: {
      elevation: 12,
    },
  }),
  
  // Neon glow effect (iOS only, use SVG/Skia for Android)
  glow: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#6366F1',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 20,
    },
    android: {
      // Use react-native-skia or SVG for glow on Android
    },
  }),
  
  glowStrong: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#6366F1',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 30,
    },
    android: {},
  }),
};
```

---

## Animation Presets (Reanimated)

```typescript
// theme/animations.ts
import { Easing } from 'react-native-reanimated';

export const animationPresets = {
  // Micro-interactions
  micro: {
    duration: 150,
    easing: Easing.out(Easing.ease),
  },
  
  // Standard transitions
  standard: {
    duration: 300,
    easing: Easing.out(Easing.cubic),
  },
  
  // Emphasis (success, important events)
  emphasis: {
    duration: 400,
    easing: Easing.out(Easing.back(1.5)),
  },
  
  // Spring configs
  spring: {
    gentle: {
      damping: 20,
      stiffness: 200,
      mass: 1,
    },
    bouncy: {
      damping: 12,
      stiffness: 150,
      mass: 1,
    },
    snappy: {
      damping: 15,
      stiffness: 400,
      mass: 0.8,
    },
  },
  
  // Pulse animation (for AI status)
  pulse: {
    duration: 2000,
    easing: Easing.inOut(Easing.ease),
  },
};

// Worklet-safe spring config
export const springConfigs = {
  button: { damping: 15, stiffness: 400 },
  card: { damping: 20, stiffness: 200 },
  modal: { damping: 25, stiffness: 300 },
  page: { damping: 20, stiffness: 250 },
};
```

---

## Component Styles (Copy-Paste Ready)

### Primary Button

```typescript
// components/Button/styles.ts
import { StyleSheet } from 'react-native';
import { colors, typography, borderRadius, spacing, shadows } from '@/theme';

export const primaryButtonStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glow,
  },
  text: {
    ...typography.button,
    color: colors.neutral[0],
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  disabled: {
    backgroundColor: colors.neutral[300],
    shadowOpacity: 0,
  },
});
```

### Card Component

```typescript
// components/Card/styles.ts
import { StyleSheet } from 'react-native';
import { colors, borderRadius, spacing } from '@/theme';

export const cardStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing[5],
  },
  active: {
    borderColor: 'rgba(99, 102, 241, 0.2)',
    ...shadows.glow,
  },
});
```

### Balance Display

```typescript
// components/Balance/styles.ts
import { StyleSheet, Platform } from 'react-native';
import { colors, typography } from '@/theme';

export const balanceStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  amount: {
    ...typography.display,
    color: colors.primary.DEFAULT,
    ...Platform.select({
      ios: {
        textShadowColor: colors.glow,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 40,
      },
    }),
  },
  amountLarge: {
    ...typography.displayLarge,
    color: colors.primary.DEFAULT,
  },
  change: {
    ...typography.monoLarge,
    marginTop: 8,
  },
  changePositive: {
    color: colors.success,
  },
  changeNegative: {
    color: colors.error,
  },
});
```

---

## NativeWind / Tailwind Config (if using)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366F1',
          50: '#E6FFF0',
          500: '#6366F1',
          600: '#00CC34',
          900: '#00330D',
        },
        secondary: '#818CF8',
        background: '#000000',
        surface: '#0A0A0A',
        'surface-elevated': '#141414',
        border: '#1A1A1A',
      },
      fontFamily: {
        mono: ['Menlo', 'monospace'],
      },
      borderRadius: {
        'card': '16px',
        'button': '12px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(99, 102, 241, 0.4)',
        'glow-strong': '0 0 30px rgba(99, 102, 241, 0.6)',
      },
    },
  },
};
```

---

**Status:** ✅ Ready for implementation in Step 6 (Design System)



