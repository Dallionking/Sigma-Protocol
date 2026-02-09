# ADR-003: Use RevenueCat for Subscription Management

## Status
**Accepted**

## Context
Trading Platform has a subscription-based business model:
- 3 tiers: Basic ($7), Pro ($15), Elite ($29)
- iOS primary platform (Apple IAP required)
- Android planned for Phase 2
- Need webhook sync to backend

Options considered:
1. **RevenueCat** — Subscription infrastructure with SDK + webhooks
2. **Native StoreKit 2** — Direct Apple integration
3. **Stripe + Web** — Bypass App Store (against Apple guidelines)

## Decision
We will use **RevenueCat** for all subscription management.

## Consequences

### ✅ Benefits
- **Cross-Platform** — Same API for iOS, Android, Web
- **Unified Dashboard** — Revenue analytics, cohort analysis
- **Webhook Integration** — Sync subscription state to Supabase
- **Expo Support** — First-class `react-native-purchases` SDK
- **Handles Edge Cases** — Refunds, family sharing, grace periods
- **MCP Support** — Remote MCP server available

### ⚠️ Trade-offs
- 1% of revenue fee (after $2.5K monthly free tier)
- Additional dependency in the stack
- Must keep RevenueCat and Supabase in sync

### ❌ Risks
- RevenueCat outage could affect subscription checks (mitigate with cached entitlements)
- Webhook failures could cause data drift (implement retry logic)

## Alternatives Considered

### Native StoreKit 2
- **Rejected:** iOS-only, would need separate Android implementation
- Complex receipt validation logic to implement ourselves
- No unified analytics

### Stripe (Web-based)
- **Rejected:** Apple requires App Store billing for in-app purchases
- Would violate App Store guidelines

### Paddle / Lemon Squeezy
- **Considered:** Good alternatives but less mobile SDK maturity
- RevenueCat has stronger Expo ecosystem integration

## Implementation Notes
- App User ID = Supabase `auth.uid()`
- Webhook endpoint: `/webhooks/revenuecat` (Edge Function)
- Entitlement name: `premium` (active for all paid tiers)
- Products: `basic_monthly`, `pro_monthly`, `elite_monthly`

---
*Decision made: 2025-12-11*



