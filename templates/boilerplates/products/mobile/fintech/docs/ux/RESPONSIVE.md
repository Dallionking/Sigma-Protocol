# Mobile & Platform Design — Trading Platform

**Date:** 2025-12-11  
**Step:** 3 — UX Design & Interface Planning  
**Platform:** iOS (Expo SDK 52+ / React Native)  
**Target Devices:** iPhone 12+ (OLED optimized)

---

## Platform Strategy

### iOS-First Approach

Trading Platform is designed **mobile-first for iOS**, with Android as a Phase 2 expansion. This allows us to:
- Optimize for OLED displays (pure black #000000)
- Follow iOS Human Interface Guidelines precisely
- Use native iOS patterns (SF Symbols, haptics, gestures)
- Leverage Face ID/Touch ID for authentication

### Target Device Matrix

| Device | Screen | Safe Areas | Priority |
|--------|--------|------------|----------|
| iPhone 15 Pro Max | 430×932 | Top: 59, Bottom: 34 | Primary |
| iPhone 15 Pro | 393×852 | Top: 59, Bottom: 34 | Primary |
| iPhone 15 | 393×852 | Top: 59, Bottom: 34 | Primary |
| iPhone 14 | 390×844 | Top: 47, Bottom: 34 | Primary |
| iPhone 13 | 390×844 | Top: 47, Bottom: 34 | Primary |
| iPhone 12 | 390×844 | Top: 47, Bottom: 34 | Primary |
| iPhone SE (3rd) | 375×667 | Top: 20, Bottom: 0 | Secondary |

---

## Safe Areas & Layout

### Safe Area Handling

```
┌─────────────────────────────────────┐
│░░░░░░░░░ DYNAMIC ISLAND ░░░░░░░░░░░│ ← 59px (iPhone 15 Pro)
├─────────────────────────────────────┤
│                                     │
│         CONTENT AREA                │
│         (Full width)                │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
├─────────────────────────────────────┤
│░░░░░░░░░░░ HOME INDICATOR ░░░░░░░░░│ ← 34px
└─────────────────────────────────────┘
```

### Layout Constants

```typescript
// layout/constants.ts
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const LAYOUT = {
  // Screen padding
  screenPaddingHorizontal: 20,
  screenPaddingTop: 16,
  
  // Tab bar
  tabBarHeight: 84, // Includes 34px home indicator
  tabBarContentHeight: 50,
  
  // Header
  headerHeight: 44,
  
  // Cards
  cardBorderRadius: 16,
  cardPadding: 20,
  
  // Spacing
  sectionGap: 24,
  itemGap: 12,
  
  // Touch targets
  minTouchTarget: 44,
  recommendedTouchTarget: 48,
};
```

### Safe Area Implementation

```tsx
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

function Screen() {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={{
      flex: 1,
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: Math.max(insets.left, 20),
      paddingRight: Math.max(insets.right, 20),
    }}>
      {/* Content */}
    </View>
  );
}
```

---

## iOS Human Interface Guidelines Compliance

### Navigation Patterns

| Pattern | Implementation | iOS HIG Compliance |
|---------|----------------|-------------------|
| Tab bar | Bottom, 5 tabs max | ✅ Standard |
| Stack navigation | Push/pop with header | ✅ Standard |
| Modal sheets | Slide up from bottom | ✅ Standard |
| Gestures | Swipe back, swipe dismiss | ✅ Standard |

### Typography (iOS)

| Style | iOS Spec | Trading Platform |
|-------|----------|--------------|
| Large Title | 34pt, Bold | Screen headers |
| Title 1 | 28pt, Regular | Section headers |
| Title 2 | 22pt, Regular | Card titles |
| Title 3 | 20pt, Regular | Subsections |
| Body | 17pt, Regular | Primary text |
| Callout | 16pt, Regular | Secondary text |
| Subhead | 15pt, Regular | Labels |
| Footnote | 13pt, Regular | Captions |
| Caption 1 | 12pt, Regular | Metadata |
| Caption 2 | 11pt, Regular | Timestamps |

### SF Symbols Usage

| Context | Symbol | Fallback |
|---------|--------|----------|
| Home tab | `house.fill` | House icon |
| Income tab | `chart.line.uptrend.xyaxis` | Chart icon |
| Deposit | `plus.circle.fill` | Plus icon |
| AI tab | `cpu` | Robot/AI icon |
| Account tab | `person.fill` | Person icon |
| Settings | `gearshape` | Gear icon |
| Back | `chevron.left` | Chevron |
| Close | `xmark` | X icon |
| Success | `checkmark.circle.fill` | Check |
| Error | `exclamationmark.triangle.fill` | Warning |

### Haptic Feedback

```typescript
import * as Haptics from 'expo-haptics';

// Haptic patterns
const haptics = {
  // Light tap (button press, tab switch)
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  
  // Medium tap (toggle, selection)
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  
  // Heavy tap (significant action)
  heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  
  // Success (deposit complete, AI activated)
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  
  // Error (validation failure)
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  
  // Selection change (picker, slider)
  selection: () => Haptics.selectionAsync(),
};
```

---

## Native Navigation (Expo Router)

### Tab Navigator Configuration

```tsx
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#0A0A0A',
          borderTopColor: '#1A1A1A',
          borderTopWidth: 1,
          height: 84,
          paddingBottom: 34, // Safe area
        },
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#666666',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="income"
        options={{
          title: 'Income',
          tabBarIcon: ({ color }) => <ChartIcon color={color} />,
        }}
      />
      {/* Center deposit button */}
      <Tabs.Screen
        name="deposit"
        options={{
          title: '',
          tabBarIcon: () => <DepositFAB />,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            // Open deposit modal
          },
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: 'AI',
          tabBarIcon: ({ color }) => <AIIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => <AccountIcon color={color} />,
        }}
      />
    </Tabs>
  );
}
```

### Stack Navigation

```tsx
// Stack screen with custom header
<Stack.Screen
  name="activity/[id]"
  options={{
    headerStyle: {
      backgroundColor: '#000000',
    },
    headerTintColor: '#6366F1',
    headerTitleStyle: {
      fontWeight: '600',
    },
    headerBackTitle: 'Back',
    animation: 'slide_from_right',
  }}
/>
```

### Modal Presentation

```tsx
// Modal sheet presentation
<Stack.Screen
  name="deposit"
  options={{
    presentation: 'modal',
    animation: 'slide_from_bottom',
    headerShown: true,
    headerTitle: 'Deposit',
    headerLeft: () => null,
    headerRight: () => <CloseButton />,
  }}
/>
```

---

## Gesture Handling

### Supported Gestures

| Gesture | Action | Implementation |
|---------|--------|----------------|
| Swipe from left edge | Go back | Native navigation |
| Swipe down on modal | Dismiss modal | Native + custom |
| Pull down | Refresh content | `RefreshControl` |
| Long press | Context menu | `onLongPress` |
| Pinch | Zoom chart (future) | `PinchGestureHandler` |

### Swipe to Dismiss Modal

```tsx
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { 
  useAnimatedGestureHandler,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

function DismissibleModal({ onDismiss, children }) {
  const translateY = useSharedValue(0);
  
  const gestureHandler = useAnimatedGestureHandler({
    onActive: (event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    },
    onEnd: (event) => {
      if (event.translationY > 100) {
        runOnJS(onDismiss)();
      } else {
        translateY.value = withSpring(0);
      }
    },
  });
  
  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={{ transform: [{ translateY }] }}>
        {children}
      </Animated.View>
    </PanGestureHandler>
  );
}
```

---

## Device-Specific Optimizations

### OLED Display Optimization

```typescript
// Pure black backgrounds for OLED battery savings
const colors = {
  background: '#000000', // Pure black (pixels off on OLED)
  surface: '#0A0A0A',    // Near-black for cards
  elevated: '#141414',   // Elevated surfaces
};
```

### Dynamic Island Awareness

```tsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

function Header() {
  const insets = useSafeAreaInsets();
  
  // Extra padding for Dynamic Island on iPhone 14 Pro+
  const hasDynamicIsland = insets.top > 50;
  
  return (
    <View style={{
      paddingTop: insets.top + (hasDynamicIsland ? 8 : 0),
    }}>
      {/* Header content */}
    </View>
  );
}
```

### Screen Size Adaptations

```tsx
import { useWindowDimensions } from 'react-native';

function AdaptiveBalance() {
  const { width, height } = useWindowDimensions();
  
  // Smaller phones get slightly smaller balance text
  const isSmallPhone = width < 380 || height < 700;
  
  return (
    <Text style={{
      fontSize: isSmallPhone ? 40 : 48,
      fontFamily: 'Menlo',
      fontWeight: '700',
      color: '#6366F1',
    }}>
      $12,847.31
    </Text>
  );
}
```

---

## Performance Considerations

### Animation Performance

| Target | Metric | Strategy |
|--------|--------|----------|
| Frame rate | 60fps | Use Reanimated, avoid JS thread |
| Memory | <150MB | Lazy load screens, optimize images |
| App launch | <2s | Minimize bundle, code splitting |
| TTI | <3s | Progressive loading, skeleton screens |

### Image Optimization

```tsx
import { Image } from 'expo-image';

// Use expo-image for optimized loading
<Image
  source={{ uri: 'https://...' }}
  placeholder={blurhash}
  contentFit="cover"
  transition={200}
/>
```

### List Virtualization

```tsx
import { FlashList } from '@shopify/flash-list';

// Use FlashList for long lists
<FlashList
  data={incomeEvents}
  renderItem={({ item }) => <IncomeEventRow event={item} />}
  estimatedItemSize={64}
  keyExtractor={(item) => item.id}
/>
```

---

## Orientation & Multitasking

### Orientation Support

| Phase | Portrait | Landscape |
|-------|----------|-----------|
| MVP | ✅ Required | ❌ Locked |
| V2 | ✅ Required | ⚠️ Optional |

```json
// app.json
{
  "expo": {
    "orientation": "portrait"
  }
}
```

### iPad Support (Future)

| Phase | iPad Support | Notes |
|-------|--------------|-------|
| MVP | ❌ Not targeted | iPhone-sized on iPad |
| V2 | ⚠️ Compatible | Letterboxed |
| V3 | ✅ Native | Split view, side-by-side |

---

## Platform-Specific Components

### iOS-Specific Features

| Feature | Implementation | Expo API |
|---------|----------------|----------|
| Face ID | Biometric auth | `expo-local-authentication` |
| Haptics | Touch feedback | `expo-haptics` |
| Share sheet | Native sharing | `expo-sharing` |
| Push notifications | APNs | `expo-notifications` |
| Apple Sign-In | OAuth | `expo-apple-authentication` |
| App Clips | Entry points | Future consideration |

---

**Status:** ✅ Mobile & Platform Design Complete  
**Target:** iOS 15.0+, iPhone 12+  
**Ready for:** Phase G (Conversion Optimization)



