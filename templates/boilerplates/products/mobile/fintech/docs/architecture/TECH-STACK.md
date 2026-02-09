# Trading Platform - Technology Stack

**Version:** 1.0  
**Date:** 2025-12-11  
**MCP Compatibility Score:** 9/10

---

## Stack Overview

| Layer | Technology | Version | Justification |
|-------|------------|---------|---------------|
| **Mobile Framework** | Expo SDK | 52+ | Managed workflow, OTA updates, EAS builds |
| **UI Framework** | React Native | 0.76+ | New architecture ready, Fabric support |
| **Navigation** | Expo Router | 4.x | File-based, deep linking, type-safe |
| **State (Server)** | TanStack Query | 5.x | Caching, real-time sync, offline |
| **State (Local)** | Zustand | 5.x | Lightweight, minimal boilerplate |
| **Database** | Supabase | Latest | PostgreSQL, RLS, Realtime, Edge Functions |
| **Auth** | Supabase Auth | Latest | JWT, Apple SSO, session management |
| **Subscriptions** | RevenueCat | 8.x | Cross-platform billing, webhooks |
| **Banking** | Plaid | Latest | Account linking (via Edge Functions) |
| **Styling** | NativeWind | 4.x | Tailwind for React Native |
| **Animations** | Reanimated | 3.x | 60fps native thread animations |
| **Icons** | Lucide React Native | Latest | Consistent icon set, tree-shakeable |
| **Forms** | React Hook Form + Zod | Latest | Type-safe validation |
| **Local Storage** | expo-sqlite | 14+ | Offline caching |
| **Secure Storage** | expo-secure-store | Latest | Keychain/Keystore access |
| **Push Notifications** | Expo Notifications | Latest | APNs integration |
| **Analytics** | Mixpanel | Latest | User behavior tracking |
| **Error Tracking** | Sentry | Latest | Crash reporting |

---

## Frontend Stack

### Core Framework

```json
{
  "expo": "~52.0.0",
  "react": "18.3.1",
  "react-native": "0.76.x",
  "expo-router": "~4.0.0",
  "typescript": "~5.3.0"
}
```

### State Management

```json
{
  "@tanstack/react-query": "^5.0.0",
  "zustand": "^5.0.0",
  "@tanstack/query-async-storage-persister": "^5.0.0"
}
```

**TanStack Query Configuration:**

```typescript
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      networkMode: 'offlineFirst',
      retry: 3,
    },
  },
});

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});
```

### UI & Styling

```json
{
  "nativewind": "^4.0.0",
  "tailwindcss": "^3.4.0",
  "react-native-reanimated": "~3.16.0",
  "react-native-gesture-handler": "~2.20.0",
  "lucide-react-native": "^0.450.0",
  "react-native-svg": "15.8.0"
}
```

**Theme Configuration:**

```typescript
// theme/colors.ts
export const colors = {
  background: '#000000',        // Pure black (OLED)
  primary: '#6366F1',           // Coder green
  primaryAlt: '#818CF8',        // Spring green
  text: '#FFFFFF',
  textMuted: '#666666',
  success: '#6366F1',
  warning: '#FFD700',
  error: '#FF4444',
  card: '#0A0A0A',
  border: '#1A1A1A',
};
```

### Forms & Validation

```json
{
  "react-hook-form": "^7.50.0",
  "zod": "^3.22.0",
  "@hookform/resolvers": "^3.3.0"
}
```

---

## Backend Stack (Supabase)

### Supabase Client

```json
{
  "@supabase/supabase-js": "^2.45.0"
}
```

**Client Configuration:**

```typescript
// lib/supabase.ts
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
```

### Edge Functions (Deno)

Used for:
- Plaid integration (secure token handling)
- RevenueCat webhooks
- Push notification dispatch
- AI Engine triggers

```typescript
// supabase/functions/plaid-create-link-token/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  // Verify JWT from request
  const authHeader = req.headers.get('Authorization')!;
  const { data: { user }, error } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  );
  
  if (error || !user) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Create Plaid link token...
});
```

---

## Subscription Stack (RevenueCat)

```json
{
  "react-native-purchases": "^8.0.0"
}
```

**RevenueCat Configuration:**

```typescript
// lib/revenuecat.ts
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { Platform } from 'react-native';

const API_KEYS = {
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY!,
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY!,
};

export async function initializeRevenueCat(userId: string) {
  Purchases.configure({
    apiKey: Platform.OS === 'ios' ? API_KEYS.ios : API_KEYS.android,
    appUserID: userId,
  });
}

export async function getOfferings() {
  const offerings = await Purchases.getOfferings();
  return offerings.current?.availablePackages || [];
}

export async function purchasePackage(pkg: PurchasesPackage) {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
}

export async function getCustomerInfo() {
  return await Purchases.getCustomerInfo();
}

export async function restorePurchases() {
  return await Purchases.restorePurchases();
}
```

---

## Storage Stack

### Local Database (Offline Cache)

```json
{
  "expo-sqlite": "~14.0.0"
}
```

**SQLite Schema:**

```typescript
// lib/localDb.ts
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('tradingplatform.db');

export function initializeLocalDb() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS cached_balance (
      id TEXT PRIMARY KEY,
      total_balance INTEGER,
      daily_change INTEGER,
      updated_at TEXT
    );
    
    CREATE TABLE IF NOT EXISTS cached_income_events (
      id TEXT PRIMARY KEY,
      amount INTEGER,
      event_type TEXT,
      description TEXT,
      created_at TEXT
    );
  `);
}
```

### Secure Storage

```json
{
  "expo-secure-store": "~14.0.0"
}
```

Used for:
- Biometric authentication state
- Sensitive configuration
- Encryption keys (if needed)

---

## DevOps & Infrastructure

### Build & Deploy (EAS)

```json
// eas.json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": { "appleId": "...", "ascAppId": "..." }
    }
  }
}
```

### CI/CD (GitHub Actions)

```yaml
# .github/workflows/eas-build.yml
name: EAS Build
on:
  push:
    branches: [main, develop]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install -g eas-cli
      - run: npm ci
      - run: eas build --platform ios --non-interactive
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

### Monitoring

| Tool | Purpose |
|------|---------|
| **Sentry** | Error tracking, crash reporting |
| **Mixpanel** | User analytics, funnel tracking |
| **Supabase Dashboard** | Database monitoring, Realtime stats |
| **RevenueCat Dashboard** | Subscription analytics |

---

## MCP Compatibility Matrix

| Component | MCP Server | Status |
|-----------|------------|--------|
| **Supabase** | Built-in (Cursor) | ✅ Full support |
| **RevenueCat** | `https://mcp.revenuecat.ai/mcp` | ✅ Remote MCP |
| **Expo** | `https://mcp.expo.dev/mcp` | ✅ Remote MCP |
| **Stripe** | `@stripe/mcp` | ✅ Available |
| **Plaid** | Via Edge Functions | ⚠️ Indirect |

**MCP Score: 9/10** — Excellent AI-first compatibility.

---

## Development Tools

```json
{
  "devDependencies": {
    "@types/react": "~18.3.0",
    "typescript": "~5.3.0",
    "eslint": "^8.57.0",
    "prettier": "^3.2.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "vitest": "^2.0.0",
    "@testing-library/react-native": "^12.0.0"
  }
}
```

---

## Environment Variables

```bash
# .env (example)

# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# RevenueCat
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_...
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_...

# Analytics
EXPO_PUBLIC_MIXPANEL_TOKEN=...
EXPO_PUBLIC_SENTRY_DSN=...

# Feature Flags
EXPO_PUBLIC_ENABLE_FOUNDING_MEMBER=true
```

---

*Technology stack finalized for Trading Platform.*



