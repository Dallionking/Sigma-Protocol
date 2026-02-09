# Transition Map — Trading Platform

**Date:** 2025-12-12  
**Step:** 4 — Flow Tree & Screen Architecture  
**Platform:** iOS Mobile (Expo Router)

---

## Navigation Model

- **Root:** Launch router → (Gating?) → (Onboarding/Auth?) → Main Tabs
- **Primary Navigation:** Bottom tabs (Home / Income / Deposit modal / AI / Account)
- **Secondary Navigation:** Stack push for drill-down (detail screens)
- **Modal Navigation:** Deposit, Withdraw, Upgrade paywall

---

## Navigation Diagram

```mermaid
flowchart TD
  %% Launch
  A[launch-splash] --> B{Prelaunch gating enabled?}
  B -->|Yes| G1[gate-early-access]
  B -->|No| C{First launch?}

  %% Gating
  G1 --> G2[gate-waitlist-join]
  G2 --> G3[gate-waitlist-status]
  G1 --> G4[gate-invite-code]
  G4 --> C
  G3 -->|Unlocked| C

  %% Onboarding
  C -->|Yes| O1[onboard-welcome]
  C -->|No| D{Has valid session?}

  %% Returning
  D -->|Yes| H[home-dashboard]
  D -->|No| O1

  O1 --> AU1[auth-signup]
  O1 --> AU2[auth-signin]
  O1 --> VP1[onboard-value-prop-1]
  VP1 --> VP2[onboard-value-prop-2]
  VP2 --> VP3[onboard-value-prop-3]
  VP3 --> P1[onboard-permission-notifications]

  %% Auth
  AU2 -->|Forgot| AU3[auth-forgot-password]
  AU3 --> AU4[auth-check-email]
  AU4 -->|Deep link| AU5[auth-reset-password]
  AU5 --> AU2

  AU1 --> OC[auth-oauth-callback]
  AU2 --> OC
  OC --> BL1[bank-link-start]

  %% Bank link
  BL1 --> BL2[bank-link-plaid]
  BL2 -->|Success| BL3[bank-link-success]
  BL2 -->|Fail| BL4[bank-link-failure]
  BL4 --> BL1

  %% Deposit
  BL3 --> DP1[deposit-amount]
  DP1 --> DP2[deposit-custom-amount]
  DP1 --> DP3[deposit-review]
  DP2 --> DP3
  DP3 --> DP4[deposit-processing]
  DP4 -->|Success| DP5[deposit-success]
  DP4 -->|Fail| DP6[deposit-failure]
  DP6 --> DP1

  %% Risk + Activation
  DP5 --> R1[risk-select]
  R1 --> R2[risk-customize]
  R2 --> R1
  R1 --> ACT1[activate-protocol]
  ACT1 --> ACT2[activate-success]
  ACT2 --> H

  %% Main tabs
  subgraph Tabs[Main Tabs]
    H --> IN[income-dashboard]
    H --> AI[ai-dashboard]
    H --> AC[account-home]
    IN --> H
    AI --> H
    AC --> H
  end

  %% Cross-cutting modals
  H -->|Deposit FAB| DP1
  AC -->|Withdraw| WD1[withdraw-amount]
  WD1 --> WD2[withdraw-confirm]
  WD2 --> WD3[withdraw-processing]
  WD3 -->|Success| WD4[withdraw-success]
  WD3 -->|Fail| WD5[withdraw-failure]
  WD4 --> WD6[withdraw-detail]

  %% Upgrade
  IN -->|30D/90D gated| GATE[income-history-gate]
  GATE --> PAY[sub-paywall]
  PAY --> PPROC[sub-purchase-processing]
  PPROC -->|Success| PSUC[sub-purchase-success]
  PPROC -->|Fail| PFAIL[sub-purchase-failure]
  PSUC --> IN
```

---

## Transition Table (Core)

| From | Action | To | Condition |
|------|--------|----|-----------|
| `launch-splash` | Auto | `gate-early-access` | Prelaunch gating enabled |
| `launch-splash` | Auto | `onboard-welcome` | First launch / no session |
| `launch-splash` | Auto | `home-dashboard` | Valid session |
| `onboard-welcome` | Tap “Get Started” | `auth-signup` | Default primary CTA |
| `auth-signin` | Tap “Forgot Password” | `auth-forgot-password` | — |
| `auth-forgot-password` | Submit | `auth-check-email` | Email sent |
| `auth-check-email` | Deep link | `auth-reset-password` | Has token |
| `auth-oauth-callback` | Auto | `bank-link-start` | New user setup |
| `bank-link-success` | Continue | `deposit-amount` | Setup flow |
| `deposit-success` | Continue | `risk-select` | First deposit |
| `activate-success` | Continue | `home-dashboard` | Setup complete |
| `home-dashboard` | Tap Balance | `home-balance-detail` | — |
| `income-dashboard` | Tap event | `income-event-detail` | — |
| `income-dashboard` | Toggle 30D/90D | `income-history-gate` | Feature gated |
| `income-history-gate` | Tap upgrade | `sub-paywall` | — |
| `sub-paywall` | Purchase | `sub-purchase-processing` | RevenueCat/StoreKit |
| `sub-purchase-success` | Done | `income-dashboard` | Unlock applied |
| `account-home` | Tap Withdraw | `withdraw-amount` | Has linked bank |
| `withdraw-success` | View details | `withdraw-detail` | — |

---

## Deep Link Entry Points

> Based on Expo Router conventions (see `/docs/ux/INFORMATION-ARCHITECTURE.md`).

| Deep Link | Target Screen | Notes |
|----------|---------------|------|
| `tradingplatform://` | `home-dashboard` (or `onboard-welcome`) | Router chooses based on auth |
| `tradingplatform://income` | `income-dashboard` | Push notifications, campaigns |
| `tradingplatform://ai` | `ai-dashboard` | AI status updates |
| `tradingplatform://deposit` | `deposit-amount` | Deposit reminders |
| `tradingplatform://upgrade` | `sub-paywall` | Upsell campaigns |
| `tradingplatform://activity/[id]` | `activity-detail` | Transaction notification |
| `tradingplatform://income/[id]` | `income-event-detail` | Income event deep link |
| `tradingplatform://account/subscription` | `sub-current-plan` | Account management |

---

**Status:** ✅ Transitions mapped  
**Next Artifact:** `/docs/flows/TRACEABILITY-MATRIX.md` (PRD feature → screens)


