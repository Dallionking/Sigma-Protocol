# Sigma Expo Mobile - Features

> Production-ready mobile app with Supabase auth and RevenueCat purchases.

## Included Modules

| Module | Status | Description |
|--------|--------|-------------|
| Mobile Onboarding | ✅ Included | Welcome, value props, permissions |
| Auth | ✅ Included | Supabase auth with email, OAuth |
| Dashboard (Home) | ✅ Included | Main home tab with quick actions |
| Settings | ✅ Included | Profile, preferences, account |
| Purchases | ✅ Included | RevenueCat subscriptions |
| Error States | ✅ Included | Error boundaries, offline handling |

## Optional Modules

| Module | Status | Description | How to Enable |
|--------|--------|-------------|---------------|
| AI Chat | 🔲 Disabled | Chat interface with AI | Add chat tab to `(tabs)/_layout.tsx` |
| Notifications | 🔲 Disabled | Push notifications | Add notifications tab and expo-notifications |

## Feature Backlog

> Edit this list to track what you want to add or remove.

### To Add
- [ ] Profile picture upload
- [ ] Social sharing
- [ ] Deep linking
- [ ] Widget extensions (iOS/Android)
- [ ] App shortcuts
- [ ] Biometric auth
- [ ] Offline mode
- [ ] Analytics dashboard

### To Remove
- [ ] Purchases (if not monetizing)
- [ ] Push notifications (if not needed)

### To Customize
- [ ] Add more onboarding screens
- [ ] Customize subscription tiers
- [ ] Add more OAuth providers
- [ ] Custom theming

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Expo 52+ |
| Navigation | Expo Router |
| Auth | Supabase Auth |
| Purchases | RevenueCat |
| Styling | NativeWind (Tailwind) |
| State | Zustand |
| Analytics | PostHog |

## Environment Variables

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=

# RevenueCat
REVENUECAT_API_KEY=   # iOS key
REVENUECAT_API_KEY_ANDROID=  # Android key

# Analytics
EXPO_PUBLIC_POSTHOG_KEY=
```

## Quick Start

```bash
npm install
npm run setup   # Interactive setup wizard
npm run ios     # Start iOS simulator
npm run android # Start Android emulator
npm run web     # Web preview
```

## App Structure

```
app/
├── _layout.tsx          # Root layout
├── index.tsx            # Entry redirect
├── (onboarding)/        # Onboarding flow
├── (auth)/              # Authentication screens
└── (tabs)/              # Main tab navigation
    ├── index.tsx        # Home tab
    ├── purchases/       # Premium/subscription
    └── settings/        # Settings
```

## Tab Configuration

Tabs are configured in `app/(tabs)/_layout.tsx`. Maximum 5 tabs recommended for mobile UX.

---

*Last updated: 2025-12-20*

