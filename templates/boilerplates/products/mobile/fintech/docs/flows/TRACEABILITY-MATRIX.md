# PRD Feature-to-Screen Traceability Matrix — Trading Platform

**Generated:** 2025-12-12  
**Step:** 4 — Flow Tree & Screen Architecture  
**PRD Source:** `/docs/specs/MASTER_PRD.md`  
**Flow Tree Source:** `/docs/flows/FLOW-TREE.md`  
**Screen Inventory Source:** `/docs/flows/SCREEN-INVENTORY.md`

---

## Verification Summary

| Metric | Count |
|--------|-------|
| Total PRD Features Extracted | 34 |
| Features with Screens Mapped | 34 |
| Features WITHOUT Screens | **0 ✅** |
| Total Screens in Flow Tree | 114 |
| Avg Screens per Feature | 114 / 34 = **3.35** |

**Rule:** If “Features WITHOUT Screens” > 0, Step 4 is blocked.

---

## Complete Traceability Matrix

| Feature # | PRD Feature / Requirement | PRD Section | Screen(s) Implementing | Screen Count | Verified |
|-----------|----------------------------|-------------|-------------------------|--------------|:--------:|
| F-001 | First-run welcome experience | UX Spec / Onboarding | `onboard-welcome`, `onboard-value-prop-1`, `onboard-value-prop-2`, `onboard-value-prop-3` | 4 | ✅ |
| F-002 | Sign up (Apple Sign-In + email/password) | Feature 1.1 Secure Sign-Up/Login | `auth-signup`, `auth-oauth-callback` | 2 | ✅ |
| F-003 | Sign in (Apple + email/password) | Feature 1.1 Secure Sign-Up/Login | `auth-signin`, `auth-oauth-callback` | 2 | ✅ |
| F-004 | Forgot password + reset | Feature 1.1 Secure Sign-Up/Login | `auth-forgot-password`, `auth-check-email`, `auth-reset-password` | 3 | ✅ |
| F-005 | Enable Face ID / Touch ID after first login | Feature 1.1 Secure Sign-Up/Login | `onboard-permission-biometric`, `security-biometric-toggle` | 2 | ✅ |
| F-006 | Notification opt-in prompt | Feature 7.1 Push Notifications | `onboard-permission-notifications`, `notif-permission-denied-help` | 2 | ✅ |
| F-007 | Customize notification preferences | Feature 7.1 Push Notifications | `notif-settings` | 1 | ✅ |
| F-008 | Bank account linking via Plaid | Feature 1.2 Bank Account Linking | `bank-link-start`, `bank-link-plaid`, `bank-link-success`, `bank-link-failure` | 4 | ✅ |
| F-009 | Manage linked banks (add/relink/remove) | Feature 1.2 Bank Account Linking | `banks-list`, `banks-add-start`, `banks-relink-required`, `banks-remove-confirm` | 4 | ✅ |
| F-010 | Deposit flow with quick amounts + custom | Feature 2.4 Deposit Flow | `deposit-amount`, `deposit-custom-amount`, `deposit-review` | 3 | ✅ |
| F-011 | Deposit processing state + success/failure | Feature 2.4 Deposit Flow | `deposit-processing`, `deposit-success`, `deposit-failure` | 3 | ✅ |
| F-012 | Deposit receipt / details | Feature 2.4 Deposit Flow | `deposit-receipt` | 1 | ✅ |
| F-013 | Balance display (hero number, daily change, realtime) | Feature 2.1 Balance Display | `home-dashboard`, `home-balance-detail` | 2 | ✅ |
| F-014 | Activity detail (events + receipts) | Feature 2.1 Balance Display + Income | `activity-detail` | 1 | ✅ |
| F-015 | Auto-Invest activation (CTA) | Feature 2.2 Auto-Invest Activation | `activate-protocol`, `activate-success` | 2 | ✅ |
| F-016 | Risk selection (Safe/Balanced/Aggressive) | Feature 2.3 Risk Mode Selection | `risk-select` | 1 | ✅ |
| F-017 | Optional custom risk slider | Feature 2.3 Risk Mode Selection | `risk-customize` | 1 | ✅ |
| F-018 | Auto-Invest settings (pause/change risk) | Feature 2.2 + 2.3 | `auto-invest-settings` | 1 | ✅ |
| F-019 | AI status dashboard (active/paused/confidence/env) | Feature 3.1 AI Assistant Dashboard | `ai-dashboard`, `ai-detail` | 2 | ✅ |
| F-020 | AI cycle history | Feature 3.1 AI Assistant Dashboard | `ai-cycle-history` | 1 | ✅ |
| F-021 | Explain AI signals (education) | Offer + Trust (AI confidence) | `ai-signal-explainer`, `bonus-masterclass` | 2 | ✅ |
| F-022 | Income overview (chart + feed) | Feature 4.1 Income Stream Display | `income-dashboard` | 1 | ✅ |
| F-023 | Income event detail | Feature 4.1 Income Stream Display | `income-event-detail` | 1 | ✅ |
| F-024 | Income export | IA / Income | `income-export` | 1 | ✅ |
| F-025 | Income time toggles gated (7D/30D/90D) | IA / Feature gating | `income-history-gate`, `system-access-denied` | 2 | ✅ |
| F-026 | Tier display + upgrade path | Feature 5.1 Tier Display & Upgrade | `sub-current-plan`, `sub-compare-plans`, `sub-paywall` | 3 | ✅ |
| F-027 | Purchase processing + success/failure | Feature 5.1 Tier Display & Upgrade | `sub-purchase-processing`, `sub-purchase-success`, `sub-purchase-failure` | 3 | ✅ |
| F-028 | Restore purchases | Billing lifecycle | `sub-restore-purchases` | 1 | ✅ |
| F-029 | Manage/cancel subscription | Billing lifecycle | `sub-manage-billing`, `sub-cancel-subscription` | 2 | ✅ |
| F-030 | Founding Member price lock + badge surface | Offer Architecture (scarcity) | `sub-founding-member` | 1 | ✅ |
| F-031 | Withdraw funds to linked bank + timeline | Feature 6.1 Fund Withdrawal | `withdraw-amount`, `withdraw-confirm`, `withdraw-processing`, `withdraw-success`, `withdraw-failure`, `withdraw-detail` | 6 | ✅ |
| F-032 | Share earnings (branded image) | Growth Loops | `income-share-earnings` | 1 | ✅ |
| F-033 | Referral program (give/get credits) | Growth Loops / Referral | `referral-overview`, `referral-invite`, `referral-redeem`, `referral-rewards`, `referral-terms` | 5 | ✅ |
| F-034 | Guarantee flow (48-hour claim) | Offer Architecture (Guarantee) | `ai-guarantee-info`, `ai-guarantee-claim`, `ai-guarantee-claim-success` | 3 | ✅ |

---

## Verification Formulas

### Formula 1: Feature Coverage

```
Coverage = Features with Screens / Total PRD Features
Coverage = 34 / 34 = 100%
```

### Formula 2: Screen Density Check

```
Avg Screens per Feature = Total Screens / Total Features
Avg = 114 / 34 = 3.35 (within expected 1.5–4.0)
```

---

## Unmapped Features (BLOCKERS)

| Feature # | PRD Feature | Why Unmapped | Action Required |
|----------|-------------|--------------|-----------------|
| NONE | — | — | — |

---

## 🛡️ ZERO OMISSION CERTIFICATE

I have verified complete PRD-to-Screen traceability:

**METRICS:**
- PRD Features Extracted: **34**
- Features Mapped to Screens: **34 (100%)**
- Features WITHOUT Screens: **0 ✅**
- Total Screens Created: **114**
- Avg Screens per Feature: **3.35**

**VERIFICATION:**
- ✅ Every PRD feature has at least one screen
- ✅ Feature-gated areas route to paywall/upgrade surfaces
- ✅ Bank link, deposit, risk, activation, AI status, income, subscription, withdrawal are all covered
- ✅ Referral/share + founding member + guarantee included

**Artifacts:**
- `/docs/flows/FLOW-TREE.md`
- `/docs/flows/SCREEN-INVENTORY.md`
- `/docs/flows/TRANSITION-MAP.md`

---

**Status:** ✅ Step 4 traceability complete  
**Next Step:** Step 5 (Wireframe Prototypes) should import `SCREEN-INVENTORY.md` and produce **114 corresponding wireframes** (or explicitly exclude P2/P3 by decision).


