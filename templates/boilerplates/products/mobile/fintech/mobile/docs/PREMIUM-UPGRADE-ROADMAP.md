# Premium Upgrade Roadmap

**Status:** IN PROGRESS  
**Date:** December 15, 2025

---

## Summary

This roadmap outlines the prioritized implementation plan for upgrading the Trading Platform mobile app with premium UI/UX features.

---

## P0 - Critical (COMPLETE)

- [x] Install all premium libraries
  - lucide-react-native
  - lottie-react-native
  - expo-linear-gradient
  - victory-native
  - @gorhom/bottom-sheet
  - react-native-confetti-cannon

- [x] Create Icon component with Lucide
  - Location: `components/primitives/Icon.tsx`
  - 100+ icon mappings
  - Support for IconName | ReactNode

- [x] Replace all emoji icons with Lucide
  - Tab bar icons
  - Account menu icons
  - Risk selection icons
  - System state icons
  - All other screens

- [x] Fix splash screen (already unique)
  - 3D spinning glow rings
  - Logo breathing animation
  - Staggered text fade-in

---

## P1 - High Priority (COMPLETE)

- [x] Add screen transitions using react-native-screen-transitions
  - Auth flow: Fade, ZoomIn, SlideFromRight
  - Onboarding flow: Fade, SlideFromBottom, ZoomIn
  - Broker flow: SlideFromBottom, Fade, ZoomIn, DraggableCard
  - Portfolio flow: SlideFromRight, SlideFromBottom, ElasticCard, ZoomIn
  - Risk flow: SlideFromBottom, ElasticCard, Fade, ZoomIn
  - System states: Various contextual transitions

- [x] Replace ActivityIndicator with branded loading states
  - Only 1 ActivityIndicator found (maintenance.tsx)
  - Custom NeonLoader used throughout

- [x] Add haptic feedback to key interactions
  - Already implemented with expo-haptics

---

## P2 - Polish (PLANNED)

### Bottom Sheets
- [ ] Replace custom modals with @gorhom/bottom-sheet
- [ ] Settings screens
- [ ] Filter/sort overlays
- [ ] Action sheets

**Files to update:**
- Account settings modals
- Broker connection modals
- Time range selectors

### Celebration Effects
- [ ] Add confetti for achievements/success

**Screens to add confetti:**
- `app/(tabs)/withdraw/success.tsx`
- `app/(tabs)/account/subscription/success.tsx`
- `app/(broker)/connect-success.tsx`
- `app/(risk)/success.tsx`

### Victory Native Charts
- [ ] Replace View-based charts

**Files to update:**
- `app/(tabs)/income/index.tsx` - Bar chart
- `app/(tabs)/home/balance-detail.tsx` - Performance chart
- `app/(tabs)/account/bonuses/skin-preview.tsx` - Mock chart

### Lottie Animations
- [ ] Add Lottie loader variants

**Use cases:**
- Data fetching states
- Empty states
- Success confirmations
- Error illustrations

### Skeleton Loaders
- [ ] Add Moti skeletons for data fetching

**Components to add:**
- Card skeleton
- List item skeleton
- Chart skeleton

---

## Effort Estimates

| Task | Files | Effort |
|------|-------|--------|
| Bottom sheet integration | 5-10 | 2 hours |
| Confetti integration | 3-5 | 1 hour |
| Victory Native charts | 3 | 2 hours |
| Lottie animations | 5-10 | 3 hours |
| Skeleton loaders | 10-15 | 2 hours |

**Total P2 Effort:** 10-12 hours

---

## Quality Checklist

### Icons
- [x] No emoji icons in production UI
- [x] Consistent icon sizing (16, 20, 24, 28)
- [x] Proper color theming

### Animations
- [x] Contextual screen transitions
- [x] Staggered list animations
- [x] Micro-interactions on buttons
- [x] Loading state animations

### Haptics
- [x] Button press feedback
- [x] Success/error notifications
- [x] Selection feedback

### Polish
- [ ] Bottom sheet modals
- [ ] Celebration effects
- [ ] Skeleton loaders
- [ ] Victory Native charts

---

## Libraries Reference

| Package | Version | Docs |
|---------|---------|------|
| lucide-react-native | ^0.561.0 | https://lucide.dev |
| lottie-react-native | ~7.3.1 | https://github.com/lottie-react-native/lottie-react-native |
| expo-linear-gradient | ~15.0.8 | https://docs.expo.dev/versions/latest/sdk/linear-gradient |
| victory-native | ^41.20.2 | https://formidable.com/open-source/victory/docs/native |
| @gorhom/bottom-sheet | ^5.2.8 | https://gorhom.github.io/react-native-bottom-sheet |
| react-native-confetti-cannon | ^1.5.2 | https://github.com/VincentCATILLON/react-native-confetti-cannon |
| react-native-screen-transitions | ^3.1.0 | https://github.com/nicholascm/react-native-screen-transitions |

