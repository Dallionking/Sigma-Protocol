# Animation Enhancements

**Status:** IMPLEMENTED  
**Date:** December 15, 2025

---

## Overview

This document outlines the animation improvements made to the app, including screen transitions, micro-interactions, and planned enhancements.

---

## Screen Transitions (Implemented)

All navigation layouts now use `react-native-screen-transitions` for premium animations.

### Transition Presets by Screen Type

| Screen Type | Preset | Effect |
|-------------|--------|--------|
| Success/Celebration | `ZoomIn()` | Focuses attention, celebratory |
| Modal/Prompt | `SlideFromBottom()` | Native modal feel |
| Error/Dismissible | `DraggableCard()` | Easy to dismiss |
| Security/Serious | `Fade()` | Professional, calm |
| Flow Progression | `SlideFromRight()` | Natural progression |
| Info/Elastic | `ElasticCard()` | Playful, interactive |
| Alert/Urgent | `SlideFromTop()` | Attention-grabbing |

### Layout Configurations

#### Auth Layout (`(auth)/_layout.tsx`)
- Sign In/Up: `Fade()` - Smooth switching
- Forgot Password: `SlideFromRight()` - Flow progression
- Check Email: `ZoomIn()` - Focus on action
- OAuth Callback: `Fade()` - Background transition

#### Onboarding Layout (`(onboarding)/_layout.tsx`)
- Welcome: `Fade()` - Dramatic entrance
- Value Props: `SlideFromRight()` - Story progression
- Notifications: `SlideFromBottom()` - Permission modal
- Biometric: `ZoomIn()` - Security focus

#### Broker Layout (`(broker)/_layout.tsx`)
- Connect Start: `SlideFromBottom()` - Modal entry
- TradeLocker: `Fade()` - WebView integration
- Success: `ZoomIn()` - Celebration
- Failure: `DraggableCard()` - Dismissible

#### Portfolio Layout (`(portfolio)/_layout.tsx`)
- Balance: `SlideFromRight()` - Standard
- Fund Prompt: `SlideFromBottom()` - CTA modal
- Minimum Info: `ElasticCard()` - Informational
- Ready: `ZoomIn()` - Success celebration

#### Risk Layout (`(risk)/_layout.tsx`)
- Select: `SlideFromBottom()` - Modal selection
- Customize: `ElasticCard()` - Interactive config
- Activate: `Fade()` - Processing
- Success: `ZoomIn()` - Celebration

#### System Layout (`(system)/_layout.tsx`)
- Offline: `SlideFromTop()` - Alert style
- No Broker: `ZoomIn()` - Focus attention
- Insufficient Balance: `ElasticCard()` - Dismissible
- Session Expired: Custom fade+scale
- Access Denied: `SlideFromBottom()` - Paywall
- Error: `DraggableCard()` - Dismissible

---

## Animation Presets (Theme)

Located in `lib/theme/animations.ts`:

```typescript
export const animationPresets = {
  micro: { duration: 150, easing: Easing.out(Easing.ease) },
  standard: { duration: 300, easing: Easing.out(Easing.cubic) },
  emphasis: { duration: 400, easing: Easing.out(Easing.back(1.5)) },
  pulse: { duration: 2000, easing: Easing.inOut(Easing.ease) },
  
  spring: {
    gentle: { damping: 20, stiffness: 200, mass: 1 },
    bouncy: { damping: 12, stiffness: 150, mass: 1 },
    snappy: { damping: 15, stiffness: 400, mass: 0.8 },
  },
};

export const springConfigs = {
  button: { damping: 15, stiffness: 400 },
  card: { damping: 20, stiffness: 200 },
  modal: { damping: 25, stiffness: 300 },
  page: { damping: 20, stiffness: 250 },
  splash: { damping: 20, stiffness: 120 },
};
```

---

## Existing Premium Animations

### Splash Screen
- 3D spinning glow rings (counter-rotation)
- Logo breathing animation
- Staggered text fade-in

### NeonLoader
- Spinning ring with gradient
- Pulsing glow effect
- Center dot

### BorderBeam
- Animated gradient border
- Synchronized across cards (hook-based)

---

## P2 Enhancements (Planned)

### 1. Skeleton Loaders
Replace loading spinners with Moti skeletons:
```tsx
import { Skeleton } from 'moti/skeleton';

<Skeleton width={200} height={20} colorMode="dark" />
```

### 2. Celebration Effects
Add confetti for success states:
```tsx
import ConfettiCannon from 'react-native-confetti-cannon';

<ConfettiCannon count={200} origin={{x: -10, y: 0}} />
```

### 3. Lottie Animations
Add branded Lottie for:
- Loading states
- Success confirmations
- Empty states
- Error illustrations

### 4. Bottom Sheet Modals
Replace custom modals with `@gorhom/bottom-sheet`:
```tsx
import BottomSheet from '@gorhom/bottom-sheet';

<BottomSheet snapPoints={['25%', '50%']}>
  {/* Content */}
</BottomSheet>
```

### 5. Haptic Feedback Enhancement
Current: Basic haptics on button press
Planned: Contextual haptic patterns:
- Success: `notificationAsync(Success)`
- Error: `notificationAsync(Error)`
- Selection: `selectionAsync()`
- Impact: `impactAsync(Light/Medium/Heavy)`

