# ADR-001: Use Expo over Bare React Native

## Status
**Accepted**

## Context
Trading Platform is a mobile-first fintech app requiring:
- Fast development iteration
- OTA updates for quick bug fixes
- Reliable iOS/Android builds
- Minimal native code maintenance

We need to choose between:
1. **Expo (Managed Workflow)** — Managed builds, OTA updates, abstracted native modules
2. **Bare React Native** — Full native access, manual configuration

## Decision
We will use **Expo SDK 52+** with the managed workflow.

## Consequences

### ✅ Benefits
- **EAS Build** — Cloud builds without local Xcode/Android Studio setup
- **EAS Update** — OTA updates for JavaScript/TypeScript changes
- **Expo Modules** — Pre-configured camera, notifications, secure storage
- **Faster Onboarding** — New developers productive in hours, not days
- **Hermes Default** — Optimized JS engine out of the box

### ⚠️ Trade-offs
- Some native modules require custom dev client
- Slightly larger app size (~5-10MB overhead)
- Build queue times during peak hours

### ❌ Risks
- Expo config may not support all edge cases
- Must eject if requiring unsupported native features

## Alternatives Considered

### Bare React Native
- **Rejected:** Higher maintenance burden, slower iteration
- Would require dedicated mobile DevOps expertise

### Flutter
- **Rejected:** Team expertise is in React/TypeScript
- Smaller ecosystem for fintech integrations

## Notes
- RevenueCat, Plaid, and Supabase all have excellent Expo support
- Can use development builds for testing native modules
- Expo SDK 52+ supports the new React Native architecture

---
*Decision made: 2025-12-11*



