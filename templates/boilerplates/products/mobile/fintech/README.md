# Fintech Trading Platform Boilerplate

Production-ready mobile trading platform with 114+ screens, 21 flow PRDs, broker OAuth integration, subscription management, and a Next.js landing page.

## What's Included

| Component | Description |
|-----------|-------------|
| `mobile/` | Expo SDK 52 + React Native app (114+ screens) |
| `landing/` | Next.js 15 marketing landing page with waitlist |
| `docs/` | Architecture docs, 21 flow PRDs, wireframes, API specs |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Expo SDK 52 / React Native (New Architecture) |
| Navigation | Expo Router v3 (typed routes) |
| State | Zustand + React Query |
| Styling | NativeWind + Tailwind CSS |
| Backend | Supabase (Auth, Database, Edge Functions, Realtime) |
| Subscriptions | RevenueCat (3-tier: Basic / Pro / Elite) |
| Broker | TradeLocker OAuth integration |
| Landing | Next.js 15 + shadcn/ui |

## App Screens & Flows

### 21 Flow PRDs (in `docs/prds/flows/`)

| # | Flow | Screens |
|---|------|---------|
| 01 | Launch | Splash, force update, maintenance |
| 02 | Access Gating | Waitlist join, invite code, early access |
| 03 | Onboarding | Welcome, value props (3), biometric, notifications |
| 04 | Auth | Sign in, sign up, forgot/reset password, OAuth callback |
| 05 | Broker Connection | Start, TradeLocker OAuth, success/failure |
| 06 | Portfolio Funding | Minimum info, balance, fund prompt, ready |
| 07 | Risk Activation | Select strategy, customize, activate, success |
| 08 | Home | Dashboard, AI status, portfolio summary, notifications |
| 09 | Income | History, earnings share, history gate (paywall) |
| 10 | AI | AI assistant, cycle status |
| 11 | Account Hub | Profile, settings |
| 12 | Account Brokers | Broker list, add broker |
| 13 | Subscription | Plans compare, manage, paywall, founding member |
| 14 | Security | Biometric settings, PIN, 2FA |
| 15 | Notifications | Preferences, history |
| 16 | Support | Help center, articles |
| 17 | Legal | Terms, privacy policy |
| 18 | Referral | Invite, terms, redeem |
| 19 | Bonuses | Discord, masterclass, quickstart, skins |
| 20 | Withdrawal | Confirm, processing, complete |
| 21 | System States | Offline, error, access denied, no broker, session expired |

### Screen Groups

```
app/
  (auth)/       - Sign in, sign up, forgot password, reset, OAuth callback
  (onboarding)/ - Welcome, value props, biometric setup, notifications
  (gate)/       - Waitlist, invite code, early access
  (broker)/     - Broker connection flow (TradeLocker)
  (portfolio)/  - Portfolio setup and funding
  (risk)/       - Risk strategy selection and activation
  (tabs)/       - Main app (home, income, AI, account, withdraw)
  (system)/     - Error states (offline, expired, denied)
```

## Broker OAuth Flow

The boilerplate includes a complete broker OAuth integration with TradeLocker:

1. User initiates connection from broker screen
2. App opens TradeLocker OAuth in WebView
3. User authenticates with their broker credentials
4. OAuth callback returns tokens to the app
5. Tokens stored in secure storage (expo-secure-store)
6. Broker accounts listed in account management

### Supported Brokers (via TradeLocker)

IC Markets, Pepperstone, OANDA, FTMO, FundedNext (configurable in `mobile/lib/constants/brokers.ts`)

## Quick Start

```bash
# 1. Copy to your project
cp -r templates/boilerplates/products/mobile/fintech/ my-trading-app/

# 2. Configure branding
# Edit: mobile/lib/config/brand.ts (app name, colors, bundle ID)
# Edit: mobile/tailwind.config.js (color palette)
# Edit: landing/src/lib/config.tsx (site name, copy, pricing)

# 3. Install mobile dependencies
cd my-trading-app/mobile
npm install

# 4. Set environment variables
cp .env.example .env.local
# Fill in: SUPABASE_URL, SUPABASE_ANON_KEY, REVENUECAT_API_KEY, TRADELOCKER_CLIENT_ID

# 5. Start development
npx expo start
```

## Environment Variables

| Variable | Service | Required |
|----------|---------|----------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase | Yes |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase | Yes |
| `REVENUECAT_API_KEY` | RevenueCat | For subscriptions |
| `TRADELOCKER_CLIENT_ID` | TradeLocker | For broker OAuth |
| `TRADELOCKER_REDIRECT_URI` | TradeLocker | For broker OAuth |
| `NEXT_PUBLIC_APP_URL` | Landing page | For landing page |

## Configuration Files

| File | Purpose |
|------|---------|
| `mobile/lib/config/brand.ts` | App name, colors, bundle ID |
| `mobile/lib/config/trading.ts` | Market data providers, trading hours, order types |
| `mobile/lib/config/integrations.ts` | Broker provider, API endpoints |
| `mobile/lib/constants/subscription.ts` | Plan tiers, pricing, IAP product IDs |
| `mobile/lib/constants/brokers.ts` | Supported brokers list |
| `mobile/tailwind.config.js` | Color palette and theme |
| `landing/src/lib/config.tsx` | Landing page content, pricing, FAQs |

## Documentation

| Doc | Location |
|-----|----------|
| Architecture | `docs/architecture/ARCHITECTURE.md` |
| Tech Stack | `docs/architecture/TECH-STACK.md` |
| API Spec | `docs/api/API-SPEC.md` |
| Database Schema | `docs/database/SCHEMA.md` |
| Security | `docs/security/SECURITY.md` |
| Flow Tree | `docs/flows/FLOW-TREE.md` |
| Screen Inventory | `docs/flows/SCREEN-INVENTORY.md` |
| UX Design | `docs/ux/UX-DESIGN.md` |
| All 21 Flow PRDs | `docs/prds/flows/` |

## See Also

- [FEATURES.md](./FEATURES.md) - Complete feature breakdown
- [mobile/BROKER-QUICK-START.md](./mobile/BROKER-QUICK-START.md) - Broker integration guide
- [mobile/SUBSCRIPTION-QUICK-START.md](./mobile/SUBSCRIPTION-QUICK-START.md) - Subscription setup guide
