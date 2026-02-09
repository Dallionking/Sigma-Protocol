# Learning Platform — Design Inspiration

**Date:** 2025-12-17  
**Status:** Approved  
**Animation Philosophy:** Quittr Cosmic + Cal AI Clean Hybrid  
**Aesthetic Direction:** Dark Gradient Sky — warm, vibrant, immersive

---

## Design Concept: "Dark Gradient Sky"

> **The app should feel immersive, ambient, and alive with personality — like learning under the stars.**

This is NOT a sterile education app. It's an experience. AI Tutor's warmth and energy should permeate every pixel.

### Aesthetic Pillars

1. **Cosmic Depth** — Dark gradients with celestial accents (inspired by Quittr)
2. **Cool Vibrancy** — dark gradient colors: indigo, gold, teal against deep navy
3. **Organic Motion** — Breathing elements, floating particles, spring physics
4. **Distinctive Texture** — Subtle patterns that reinforce brand identity
5. **Clean Data** — Progress rings and micro-infographics (Cal AI influence)

---

## Visual References

### Reference 1: Quittr App
**Type:** Mobile App (iOS)  
**Why this reference:** Cosmic gamification, deep atmosphere, achievement "light up" moments

**Key Takeaways:**
- Dark backgrounds with gradient depth
- Glowing orbs for achievements
- Particle effects for celebration
- Atmospheric layers create immersion
- Numbers feel alive (counters, progress rings)

### Reference 2: Cal AI
**Type:** Mobile App (iOS)  
**Why this reference:** Apple-esque micro-infographics, clean data presentation

**Key Takeaways:**
- Circular progress rings as hero elements
- Monochrome foundation with earned color
- Aggressive rounding on all elements
- Generous whitespace within cards
- Typography hierarchy: massive numbers + tiny labels

### Reference 3: Duolingo
**Type:** Mobile App (iOS/Android)  
**Why this reference:** Proven language learning gamification patterns

**Key Takeaways:**
- XP progress bar always visible
- Streak fire animation on completion
- Mascot personality (Duo ↔ AI Tutor)
- Lesson cards with progress indicators
- Celebration animations on achievement

### Reference 4: Cash App
**Type:** Mobile App (iOS)  
**Why this reference:** Bold branding, trust with personality

**Key Takeaways:**
- Strong brand color usage
- Spatial illustrations (not flat)
- Card materiality with depth
- Confident, bold typography

---

## Extracted Design Tokens

### Color Palette: "Dark Gradient"

```css
/* PRIMARY — Indigo */
--color-primary-50: #EEF2FF;
--color-primary-100: #E0E7FF;
--color-primary-200: #C7D2FE;
--color-primary-300: #A5B4FC;
--color-primary-400: #818CF8;
--color-primary-500: #6366F1;  /* Main accent — indigo */
--color-primary-600: #4F46E5;
--color-primary-700: #4338CA;
--color-primary-800: #3730A3;
--color-primary-900: #312E81;

/* SECONDARY — Teal */
--color-secondary-50: #F0FDFA;
--color-secondary-100: #CCFBF1;
--color-secondary-200: #99F6E4;
--color-secondary-300: #5EEAD4;
--color-secondary-400: #2DD4BF;
--color-secondary-500: #14B8A6;  /* Main secondary — teal */
--color-secondary-600: #0D9488;
--color-secondary-700: #0F766E;
--color-secondary-800: #115E59;
--color-secondary-900: #134E4A;

/* ACCENT — Golden Sun */
--color-accent-400: #FACC15;
--color-accent-500: #EAB308;  /* XP, achievements, celebration */
--color-accent-600: #CA8A04;

/* BACKGROUND — Night Sky */
--color-bg-900: #0A0F1E;   /* Deep navy-black */
--color-bg-800: #111827;   /* Card backgrounds */
--color-bg-700: #1E293B;   /* Elevated surfaces */
--color-bg-600: #334155;   /* Borders, dividers */

/* SURFACE — Translucent Cards */
--color-surface: rgba(30, 41, 59, 0.8);  /* Glass-like cards */
--color-surface-glow: rgba(99, 102, 241, 0.2);  /* Indigo glow on focus */

/* TEXT */
--color-text-primary: #F8FAFC;    /* White-ish */
--color-text-secondary: #94A3B8;  /* Slate-400 */
--color-text-muted: #64748B;      /* Slate-500 */

/* SEMANTIC */
--color-success: #10B981;  /* Green for correct */
--color-error: #EF4444;    /* Red for incorrect */
--color-warning: #F59E0B;  /* Amber for hints */
--color-streak: #6366F1;   /* Indigo fire */
```

### Typography: "Bold Warmth"

```css
/* FONTS — Distinctive, not generic */
--font-display: 'Satoshi', -apple-system, sans-serif;  /* Headlines, numbers */
--font-body: 'Plus Jakarta Sans', -apple-system, sans-serif;  /* Body, UI */
--font-mono: 'JetBrains Mono', monospace;  /* Code, scores */

/* 
 * WHY SATOSHI: Modern, geometric, warm. Not overused like Inter/Space Grotesk.
 * WHY PLUS JAKARTA SANS: Clean, readable, slightly rounded = friendly
 * FALLBACK: System fonts for performance
 */

/* SIZES — Mobile-first scale */
--text-xs: 0.75rem;     /* 12px — Captions, labels */
--text-sm: 0.875rem;    /* 14px — Secondary text */
--text-base: 1rem;      /* 16px — Body text */
--text-lg: 1.125rem;    /* 18px — Large body */
--text-xl: 1.25rem;     /* 20px — Small headings */
--text-2xl: 1.5rem;     /* 24px — Section headings */
--text-3xl: 1.875rem;   /* 30px — Screen titles */
--text-4xl: 2.25rem;    /* 36px — Hero numbers */
--text-5xl: 3rem;       /* 48px — XP counters, streaks */
--text-6xl: 3.75rem;    /* 60px — Celebration numbers */

/* WEIGHTS */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-black: 900;  /* For hero numbers */
```

### Spacing: "Breathing Room"

```css
/* BASE UNIT: 4px (matches React Native standard) */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;

/* CARD PADDING */
--card-padding-sm: 16px;
--card-padding-md: 20px;
--card-padding-lg: 24px;

/* SCREEN PADDING */
--screen-padding-x: 20px;
--screen-padding-y: 16px;
```

### Border Radius: "Soft Edges"

```css
/* AGGRESSIVE ROUNDING — Cal AI influence */
--radius-sm: 8px;     /* Small buttons, tags */
--radius-md: 12px;    /* Inputs, small cards */
--radius-lg: 16px;    /* Cards, modals */
--radius-xl: 20px;    /* Large cards, bottom sheets */
--radius-2xl: 24px;   /* Hero elements */
--radius-full: 9999px; /* Pills, avatars */
```

### Shadows: "Glowing Depth"

```css
/* SUBTLE SHADOWS — Not flat, not harsh */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 
             0 2px 4px -2px rgba(0, 0, 0, 0.3);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5),
             0 4px 6px -4px rgba(0, 0, 0, 0.4);

/* GLOW SHADOWS — For focus, achievement states */
--shadow-glow-primary: 0 0 20px rgba(99, 102, 241, 0.5);
--shadow-glow-secondary: 0 0 20px rgba(20, 184, 166, 0.5);
--shadow-glow-accent: 0 0 20px rgba(234, 179, 8, 0.5);
--shadow-glow-success: 0 0 20px rgba(16, 185, 129, 0.5);
```

---

## Animation Philosophy

### Chosen Style: "Quittr Cosmic + Cal AI Clean"

**Core Principles:**
1. **Everything breathes** — Subtle scale/opacity pulses on idle elements
2. **Celebrate success** — Particle bursts, glows, confetti for achievements
3. **Spring physics** — Natural, bouncy feel (not mechanical)
4. **Respect preferences** — Honor `prefers-reduced-motion`

### Animation Timing

```typescript
// Spring configurations (Reanimated 3 / Moti)
export const springs = {
  // Snappy — buttons, toggles
  snappy: { damping: 20, stiffness: 400 },
  
  // Gentle — cards appearing, transitions
  gentle: { damping: 15, stiffness: 100 },
  
  // Bouncy — celebrations, achievements
  bouncy: { damping: 10, stiffness: 150 },
  
  // Slow — background elements
  slow: { damping: 20, stiffness: 50 },
};

// Duration guidelines
export const durations = {
  instant: 100,    // Micro-feedback
  fast: 200,       // Buttons, toggles
  normal: 300,     // Transitions
  slow: 500,       // Complex animations
  celebration: 800, // Achievement reveals
};
```

### Required Animations

| Element | Animation | Library |
|---------|-----------|---------|
| Buttons | Press scale (0.95) + haptic | Reanimated + Haptics |
| Cards | Fade in + slide up on mount | Moti |
| Progress rings | SVG stroke animation | react-native-svg |
| XP counter | Count up with spring | Reanimated |
| Streak fire | Lottie animation | lottie-react-native |
| Lesson complete | Confetti burst | react-native-confetti |
| Tab bar | Spring icon animation | Reanimated |
| Loading | Shimmer skeleton | Moti skeleton |
| Achievement | Glow pulse + scale | Reanimated |

---

## Component Style Guide

### Buttons

```typescript
// Primary button — Indigo gradient with glow
<TouchableOpacity
  className="bg-gradient-to-r from-primary-500 to-primary-600
             rounded-xl px-6 py-4 shadow-lg shadow-primary-500/30"
>
  <Text className="text-white font-semibold text-base text-center">
    Start Learning
  </Text>
</TouchableOpacity>

// Press state: scale to 0.95, increase glow
// Success state: green gradient with pulse
// Disabled state: opacity 0.5, no glow
```

### Cards

```typescript
// Lesson card — Glassy surface with subtle border
<View className="bg-surface backdrop-blur-xl rounded-2xl 
                p-5 border border-white/10">
  {/* Content */}
</View>

// Hover/focus: Add glow shadow
// Completed: Green checkmark badge, dimmed opacity
```

### Progress Rings

```typescript
// Cal AI style — Clean, animated SVG circles
// Primary ring: Indigo fill
// Background ring: Dark slate
// Label: Center-aligned percentage + tiny description
```

### Input Fields

```typescript
// Dark input with focus glow
<TextInput
  className="bg-bg-800 border border-bg-600 rounded-xl 
             px-4 py-3 text-text-primary text-base
             focus:border-primary-500 focus:shadow-glow-primary"
  placeholderTextColor="var(--color-text-muted)"
/>
```

---

## Pattern Library

### Empty States

**Requirement:** Every empty state should delight, not bore.

| Screen | Empty State |
|--------|-------------|
| Lessons | Illustration of AI Tutor pointing forward + "Let's begin your journey!" |
| Progress | Rocket on launchpad + "Your stats will appear after your first lesson" |
| Bookings | Calendar with sparkles + "No sessions yet — book your first call with AI Tutor!" |
| Achievements | Trophy case with placeholders + "Earn your first badge!" |

### Loading States

**Requirement:** Skeleton screens > spinners.

- Use `Moti.Skeleton` with shimmer effect
- Match exact layout of loaded state
- 3-second timeout before showing message: "Still loading..."

### Error States

**Requirement:** Friendly, actionable.

- Illustration of confused AI Tutor character
- Clear error message in plain language
- Primary action: "Try Again" button
- Secondary: "Get Help" link

### Success States

**Requirement:** Celebrate meaningfully.

- Correct answer: Green glow, subtle confetti, haptic
- Lesson complete: Full-screen celebration, XP animation
- Streak milestone: Fire animation, achievement unlock
- Achievement: Cosmic reveal animation with glow

---

## Recommendations for Implementation

### Fonts Setup (Expo)

```typescript
// app/_layout.tsx
import { useFonts } from 'expo-font';

const [fontsLoaded] = useFonts({
  'Satoshi-Regular': require('../assets/fonts/Satoshi-Regular.otf'),
  'Satoshi-Medium': require('../assets/fonts/Satoshi-Medium.otf'),
  'Satoshi-Bold': require('../assets/fonts/Satoshi-Bold.otf'),
  'Satoshi-Black': require('../assets/fonts/Satoshi-Black.otf'),
  'PlusJakartaSans-Regular': require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
  'PlusJakartaSans-Medium': require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
  'PlusJakartaSans-SemiBold': require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
  'PlusJakartaSans-Bold': require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
});
```

### NativeWind Config

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        'display': ['Satoshi-Bold'],
        'display-black': ['Satoshi-Black'],
        'sans': ['PlusJakartaSans-Regular'],
        'sans-medium': ['PlusJakartaSans-Medium'],
        'sans-semibold': ['PlusJakartaSans-SemiBold'],
        'sans-bold': ['PlusJakartaSans-Bold'],
      },
      colors: {
        primary: {
          50: '#FFF7ED',
          // ... full palette
          500: '#6366F1',
          // ...
        },
        // ... all color tokens
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
    },
  },
};
```

---

## Quality Checklist

Before implementation, verify:

- [x] Color palette is WCAG AA compliant (contrast checked)
- [x] Fonts are licensed for commercial use (Satoshi: Free, Plus Jakarta Sans: OFL)
- [x] Touch targets are 44×44pt minimum
- [x] Animation philosophy documented
- [x] Empty/loading/error states designed
- [x] Dark mode is primary (not an afterthought)
- [x] Brand identity reflected (dark gradient atmosphere)
- [x] NOT generic AI slop (distinctive, memorable)

---

**Created:** 2025-12-17  
**Animation Philosophy:** Quittr Cosmic + Cal AI Clean  
**Status:** ✅ Ready for Step 4 (Flow Tree) → Step 6 (Design System)

