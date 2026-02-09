# Architecture Research Sources - Trading Platform

**Date:** 2025-12-11  
**Project:** Trading Platform (Mobile Fintech App)  
**Stack:** Expo + React Native + Supabase + RevenueCat + Plaid

---

## Research Summary

### Key Architecture Patterns for Mobile Fintech (2024-2025)

1. **Clean Modular Architecture**
   - Domain layer with pure TypeScript use cases
   - Data layer with repository pattern (Supabase, RevenueCat, Plaid adapters)
   - Presentation layer with React Query + React Navigation/Expo Router

2. **Real-time Updates Pattern**
   - Supabase Realtime channels for live balance/transaction updates
   - TanStack Query for caching + initial load
   - Realtime events update cache via `queryClient.setQueryData`

3. **Subscription Management (RevenueCat)**
   - RevenueCat as source of truth for in-app purchases
   - Sync entitlements to Supabase via webhooks
   - App User ID = Supabase `auth.uid()` for correlation

4. **Plaid Integration (Secure)**
   - Never integrate Plaid directly from mobile client
   - Use Supabase Edge Functions as Plaid adapter
   - Store access tokens only on server, never on client
   - Client reads normalized financial data from Supabase via RLS

5. **Offline-First Pattern**
   - Local DB (WatermelonDB/SQLite) as primary read store
   - Background sync with Supabase
   - React Query with `networkMode: 'always'` for offline resilience

6. **Security Best Practices**
   - RLS on every table with `auth.uid()` binding
   - Service role keys only server-side
   - Expo secure store for sensitive tokens
   - Biometric auth gate for sensitive views

---

## Source List

### Official Documentation

| Source | URL | Date Accessed |
|--------|-----|---------------|
| Expo + Supabase Guide | https://docs.expo.dev/guides/using-supabase/ | 2025-12-11 |
| Supabase React Native Tutorial | https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native | 2025-12-11 |
| Supabase Realtime Guide | https://supabase.com/docs/guides/realtime/subscribing-to-database-changes | 2025-12-11 |
| RevenueCat Expo Integration | https://www.revenuecat.com/docs/getting-started/installation/expo | 2025-12-11 |
| RevenueCat Multi-platform Guide | https://www.revenuecat.com/blog/engineering/build-a-single-expo-app-with-subscriptions-on-ios-android-and-web-using-revenuecat/ | 2025-12-11 |

### Architecture Patterns

| Source | URL | Date Accessed |
|--------|-----|---------------|
| Offline-First with Expo + Supabase + WatermelonDB | https://www.themorrow.digital/blog/building-an-offline-first-app-with-expo-supabase-and-watermelondb | 2025-12-11 |
| Structured React Native + Supabase Guide | https://forum.cursor.com/t/prompt-for-ai-structured-guide-for-building-a-react-native-supabase-expo-app/109822 | 2025-12-11 |
| Ignite Cookbook - Auth Patterns | https://raw.githubusercontent.com/infinitered/ignite-cookbook/main/docs/recipes/Authentication.md | 2025-12-11 |

### Code Examples

| Source | URL | Date Accessed |
|--------|-----|---------------|
| Supabase Cache Helpers | https://github.com/psteinroe/supabase-cache-helpers | 2025-12-11 |
| Supabase Realtime Subscription Hook | https://raw.githubusercontent.com/instructa/ai-prompts/main/prompts/supabase-react/add-feature-supabase-react.md | 2025-12-11 |
| RevenueCat Ad-Free Pattern | https://www.revenuecat.com/blog/engineering/ad-free-subscriptions-in-react-native/ | 2025-12-11 |

---

## Technology Recommendations

### Recommended Stack (Based on Research)

| Layer | Technology | Version | Rationale |
|-------|------------|---------|-----------|
| **Mobile Framework** | Expo SDK | 52+ | Managed workflow, EAS builds, OTA updates |
| **UI Framework** | React Native | 0.76+ | Latest architecture (Fabric ready) |
| **Navigation** | Expo Router | 4.x | File-based routing, deep linking |
| **State Management** | TanStack Query | 5.x | Server state, caching, offline |
| **Local State** | Zustand | 5.x | Lightweight, minimal boilerplate |
| **Database** | Supabase | Latest | Realtime, RLS, Edge Functions |
| **Local DB** | expo-sqlite | 14+ | Offline caching (or WatermelonDB for complex sync) |
| **Auth** | Supabase Auth | Latest | JWT, Apple SSO, biometrics |
| **Subscriptions** | RevenueCat | 8.x | Cross-platform, webhook sync |
| **Banking** | Plaid | Via Edge Functions | Never on client |
| **Styling** | NativeWind | 4.x | Tailwind for React Native |
| **Animations** | Reanimated | 3.x | 60fps, native thread |
| **Forms** | React Hook Form + Zod | Latest | Type-safe validation |

### MCP Compatibility Score

| Component | MCP Support | Score |
|-----------|-------------|-------|
| Database: Supabase | ✅ Official | 2/2 |
| Auth: Supabase Auth | ✅ Via Supabase MCP | 2/2 |
| Payments: RevenueCat | ✅ Remote MCP | 2/2 |
| Deployment: Expo EAS | ✅ Official | 2/2 |
| Banking: Plaid | ⚠️ Via Edge Functions | 1/2 |
| **TOTAL** | | **9/10** |

---

## Key Insights for Trading Platform

1. **Real-time Balance Updates**
   - Use Supabase Realtime channels filtered by `user_id`
   - WebSocket connection maintained while app is foregrounded
   - Fallback to polling when backgrounded

2. **AI Engine Status Display**
   - Store AI status in Supabase (`ai_engine_status` table)
   - Real-time updates for status changes
   - Local state for immediate UI feedback

3. **Subscription Tier Enforcement**
   - RevenueCat entitlements checked on app launch
   - Sync to Supabase `subscriptions` table via webhooks
   - Feature gating via `subscription_tier` in user profile

4. **Security for Fintech**
   - Never store bank credentials on device
   - Use Plaid Link for secure bank connection
   - All financial data accessed via RLS-protected queries
   - Biometric lock for sensitive screens (settings, withdrawal)

---

*Research phase complete. Ready for architecture design.*



