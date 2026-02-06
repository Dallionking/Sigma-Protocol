---
name: react-native-patterns
description: "React Native and Expo best practices for 2026. FlashList v2, Reanimated 4 CSS API, NativeWind/Uniwind/Unistyles 3, NitroImage, Expo Router, Zustand + MMKV, New Architecture patterns, and bundle optimization."
version: "1.0.0"
source: "sigma-mobile"
triggers:
  - react-native
  - expo
  - mobile
  - nativewind
  - implement-prd
---

# React Native Patterns Skill

Modern React Native and Expo patterns for production mobile apps. Covers rendering, animations, styling, navigation, state management, and bundle optimization.

## When to Invoke

Invoke this skill when:

- Building React Native or Expo mobile applications
- Implementing list-heavy screens or adding animations
- Choosing a styling solution or setting up navigation
- Configuring state management and persistence
- Optimizing bundle size or verifying New Architecture compliance

---

## 1. List Rendering — FlashList v2

FlashList v2 replaces FlatList. Always provide `estimatedItemSize` and use `getItemType` for heterogeneous lists.

### Bad Pattern

```typescript
// SLOW: FlatList with inline renderItem
<FlatList
  data={items}
  renderItem={({ item }) => (
    <View style={{ padding: 16 }}>
      <Text>{item.title}</Text>
      <Image source={{ uri: item.image }} style={{ width: '100%', height: 200 }} />
    </View>
  )}
/>
```

### Good Pattern

```typescript
import { FlashList } from '@shopify/flash-list';

const FeedCard = memo(({ item }: { item: FeedItem }) => (
  <View style={styles.card}>
    <ExpoImage source={item.image} style={styles.image} contentFit="cover" />
    <Text style={styles.title}>{item.title}</Text>
  </View>
));

<FlashList
  data={items}
  renderItem={({ item }) => <FeedCard item={item} />}
  estimatedItemSize={280}
  getItemType={(item) => item.type}
  drawDistance={250}
/>
```

| Prop | Purpose |
|------|---------|
| `estimatedItemSize` | Avg item height — required for recycling accuracy |
| `getItemType` | Separate recycling pools for heterogeneous lists |
| `drawDistance` | Pixels ahead to render offscreen (default 250) |

---

## 2. Animations — Reanimated 4 CSS API

Prefer CSS transitions and keyframes over manual `useAnimatedStyle`. Reserve `useAnimatedStyle` for gesture-driven animations.

### Bad Pattern

```typescript
// VERBOSE: Manual shared values for a fade-in
const opacity = useSharedValue(0);
useEffect(() => { opacity.value = withTiming(1, { duration: 300 }); }, []);
const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
```

### Good Pattern

```typescript
import Animated, { CSSTransition, CSSKeyframe } from 'react-native-reanimated';

// CSS Transitions
<Animated.View style={[
  { opacity: visible ? 1 : 0 },
  CSSTransition.create({ property: ['opacity'], duration: 300, timingFunction: 'ease-out' }),
]} />

// CSS Keyframes
const bounceIn = CSSKeyframe.create({
  from: { transform: [{ scale: 0.3 }] },
  '50%': { transform: [{ scale: 1.05 }] },
  to: { transform: [{ scale: 1 }] },
});

<Animated.View style={{ animationName: bounceIn, animationDuration: 600 }} />
```

| Approach | Use For |
|----------|---------|
| `CSSTransition` | State-driven property changes (opacity, transform) |
| `CSSKeyframe` | Multi-step sequences (bounce, pulse, shake) |
| `useAnimatedStyle` + gestures | Pan, pinch, drag-to-dismiss, spring physics |

---

## 3. Styling Decision Matrix

Choose one per project. Mixing causes bundle bloat and style conflicts.

| Criteria | NativeWind 5 | Uniwind | Unistyles 3 |
|----------|-------------|---------|-------------|
| **Approach** | Tailwind CSS classes | Tailwind-like, minimal | JSS with themes |
| **Web Compat** | Full | Limited | None |
| **Babel Plugin** | Yes | No (runtime) | No (C++ JSI) |
| **Theming** | Tailwind config | CSS variables | Built-in themes + breakpoints |
| **Best For** | Cross-platform web+mobile | Small apps, no Babel | Design-system-heavy native apps |

```tsx
// NativeWind 5
<Pressable className="bg-white dark:bg-gray-900 rounded-2xl p-4 active:scale-95" onPress={onPress}>
  <Text className="text-lg font-semibold text-gray-900 dark:text-white">{title}</Text>
</Pressable>
```

```typescript
// Unistyles 3: JSS with themes and breakpoints (C++ JSI)
const stylesheet = createStyleSheet((theme) => ({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    width: { xs: '100%', md: '48%', lg: '32%' },
  },
}));
```

---

## 4. Image Handling

Use `expo-image` for display. Use NitroImage for processing before upload.

### Bad Pattern

```typescript
// SLOW: RN Image — no caching, no placeholder
import { Image } from 'react-native';
<Image source={{ uri }} style={{ width: 48, height: 48, borderRadius: 24 }} />
```

### Good Pattern

```typescript
import { Image } from 'expo-image';

<Image source={uri} placeholder={{ blurhash }} transition={200}
  contentFit="cover" cachePolicy="memory-disk"
  style={{ width: 48, height: 48, borderRadius: 24 }} />

// NitroImage for processing before upload
const processed = await NitroImage.resize(localUri, {
  width: 1200, height: 1200, fit: 'inside', format: 'webp', quality: 80,
});
```

---

## 5. Navigation — Expo Router v4

File-based routing with typed routes and automatic deep linking.

```
app/
  _layout.tsx          # Root layout
  (tabs)/_layout.tsx   # Tab layout
  (tabs)/feed.tsx      # /feed
  product/[id].tsx     # /product/123 (dynamic)
  (auth)/login.tsx     # /login
```

```typescript
import { router } from 'expo-router';
// Typed navigation — compile-time route safety
router.push({ pathname: '/product/[id]', params: { id: productId } });
// Deep linking automatic: myapp://product/123
```

---

## 6. State Management — Zustand + MMKV v4

Zustand for global state. MMKV v4 for synchronous persistence. Replaces AsyncStorage + Context.

### Bad Pattern

```typescript
// SLOW: AsyncStorage + Context — async reads, full-tree re-renders
const AppContext = createContext<AppState | null>(null);
useEffect(() => { AsyncStorage.getItem('user').then(/* ... */); }, []);
```

### Good Pattern

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({ id: 'app-storage' });
const mmkvStorage = createJSONStorage(() => ({
  getItem: (key) => storage.getString(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: (key) => storage.delete(key),
}));

const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      user: null,
      theme: 'light',
      setUser: (user) => set({ user }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
    }),
    { name: 'app-store', storage: mmkvStorage },
  ),
);

// Granular subscription — only re-renders when theme changes
const theme = useAppStore((s) => s.theme);
```

---

## 7. New Architecture Checklist

New Architecture (Bridgeless, Fabric, TurboModules) is default since RN 0.76.

| Check | How |
|-------|-----|
| Bridgeless mode | `newArchEnabled=true` in `gradle.properties` and Podfile |
| Fabric renderer | Custom native views use `codegenNativeComponent` |
| TurboModules | Use `TurboModuleRegistry.get()` not `NativeModules` |
| Compatibility | `npx react-native-new-arch-check` / `npx expo-doctor` |

```typescript
// TurboModule spec (codegen-compatible)
export interface Spec extends TurboModule {
  getDeviceId(): Promise<string>;
  getBatteryLevel(): number; // Sync via JSI
}
export default TurboModuleRegistry.getEnforcing<Spec>('DeviceInfo');
```

---

## 8. Bundle Optimization

```typescript
// BAD: Importing entire library
import _ from 'lodash';
// GOOD: Cherry-pick for tree shaking
import groupBy from 'lodash/groupBy';

// GOOD: Lazy imports for heavy screens
const AnalyticsScreen = lazy(() => import('./screens/AnalyticsScreen'));
```

### Optimization Checklist

- [ ] Hermes engine enabled (`hermesEnabled: true`)
- [ ] Cherry-pick imports for large libraries
- [ ] Lazy-load screens not in the initial render path
- [ ] Use `expo-image` instead of `Image`
- [ ] ProGuard/R8 enabled for Android release builds
- [ ] Inline requires enabled (`inlineRequires: true`)
- [ ] Bundle audited with `npx react-native-bundle-visualizer`

---

## Integration with Sigma Protocol

- **Step 2 (Architecture):** Reference list rendering and state patterns for mobile data flows.
- **Step 6 (Design System):** Choose styling from the decision matrix; configure tokens.
- **Step 8 (Technical Spec):** Include New Arch verification and bundle optimization.
- **/implement-prd:** Apply all patterns when implementing mobile features.

---

_Pin dependency versions, verify New Architecture compatibility before adding native modules, and profile on real devices._
