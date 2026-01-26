# Sigma Expo Mobile Starter

> Production-ready mobile app boilerplate with Supabase auth, RevenueCat subscriptions, and Sigma methodology.

## Quick Start

```bash
# Clone the repo
git clone https://github.com/your-org/sss-expo-starter.git my-app
cd my-app

# Run setup wizard
npm run setup

# Install dependencies
npm install

# Start development
npm run dev
```

## What's Included

### Core Features

| Feature | Implementation | Status |
|---------|---------------|--------|
| Authentication | Supabase Auth | ✅ Ready |
| Database | Supabase Postgres | ✅ Ready |
| In-App Purchases | RevenueCat | ✅ Ready |
| Push Notifications | Expo Notifications | ✅ Ready |
| Analytics | PostHog | ✅ Ready |
| Secure Storage | Expo SecureStore | ✅ Ready |
| Haptic Feedback | Expo Haptics | ✅ Ready |

### Tech Stack

- **Framework**: Expo SDK 52 + React Native
- **Navigation**: Expo Router (file-based)
- **Language**: TypeScript
- **Styling**: NativeWind (Tailwind for RN)
- **Database**: Supabase
- **Auth**: Supabase Auth
- **Payments**: RevenueCat
- **State**: Zustand
- **Analytics**: PostHog

### Sigma Commands (Bundled)

```
.cursor/commands/
├── audit/          # Security, performance audits
├── deploy/         # EAS deployment workflows
├── dev/            # Development helpers
├── generators/     # Code generators
├── marketing/      # Marketing workflows
├── ops/            # Operations & maintenance
├── steps/          # Sigma methodology (Steps 0-12)
└── Magic UI/       # UI templates
```

## Project Structure

```
app/                       # Expo Router (file-based routing)
├── (auth)/               # Auth screens (login, signup)
├── (tabs)/               # Tab-based navigation
│   ├── index.tsx        # Home tab
│   ├── settings.tsx     # Settings tab
│   └── _layout.tsx      # Tab layout
├── _layout.tsx           # Root layout
└── +not-found.tsx        # 404 screen
components/
├── auth/                 # Auth components
├── purchases/            # RevenueCat components
├── ui/                   # Base UI components
└── providers/            # Context providers
hooks/
├── use-auth.ts           # Auth hook
├── use-purchases.ts      # RevenueCat hook
└── use-notifications.ts  # Push notifications hook
lib/
├── supabase/             # Supabase clients
├── revenuecat/           # RevenueCat config
└── utils.ts              # Utilities
```

## Configuration

### 1. Supabase Setup

1. Create project at [supabase.com](https://supabase.com)
2. Copy URL and anon key to `.env.local`

### 2. RevenueCat Setup

1. Create account at [revenuecat.com](https://revenuecat.com)
2. Create apps for iOS and Android
3. Configure products and offerings
4. Copy API keys to `.env.local`

### 3. EAS Build Setup

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for development
eas build --profile development
```

## Extension Guidelines

### ✅ Safe to Customize

| Area | Location | How |
|------|----------|-----|
| Brand Colors | `tailwind.config.js` | Override theme colors |
| Screens | `app/` | Add new routes |
| Components | `components/[project]/` | Create new components |
| Tabs | `app/(tabs)/_layout.tsx` | Add new tabs |

### ❌ Don't Modify

| Area | Location | Why |
|------|----------|-----|
| Supabase Client | `lib/supabase/` | Core infrastructure |
| RevenueCat Config | `lib/revenuecat/` | Payment infrastructure |
| Base UI | `components/ui/` | Shared components |
| Sigma Commands | `.cursor/commands/` | Methodology source |

## Sigma Workflow

This boilerplate works with the Sigma methodology:

1. **Step 1-2**: Already decided (Expo + Supabase + RevenueCat)
2. **Step 3-7**: Design your UX and screens
3. **Step 8-12**: Technical spec and implementation

## Deployment

### iOS (TestFlight)

```bash
eas build --platform ios --profile production
eas submit --platform ios
```

### Android (Play Store)

```bash
eas build --platform android --profile production
eas submit --platform android
```

## License

MIT - Use freely for personal and commercial projects.

