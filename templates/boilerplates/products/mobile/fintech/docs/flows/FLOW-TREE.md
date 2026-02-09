# Flow Tree — Trading Platform

**Date:** 2025-12-12  
**Step:** 4 — Flow Tree & Screen Architecture  
**Platform:** Mobile (iOS, Expo / React Native)  
**Principle:** *If it’s not in the tree, it doesn’t exist.*

---

## Complete Flow Hierarchy

**Total Screens:** **114**

```
TRADING PLATFORM HQ — COMPLETE FLOW TREE
====================================

├── 1. LAUNCH (3 screens)
│   ├── launch-splash — Splash / Logo Animation (P0)
│   ├── launch-force-update — Update Required (P1)
│   └── launch-maintenance — Maintenance Mode (P2)
│
├── 2. ACCESS GATING (4 screens)  [launch-phase / beta]
│   ├── gate-early-access — Early Access Gate (capacity / status)
│   ├── gate-waitlist-join — Join Waitlist
│   ├── gate-waitlist-status — Waitlist Status (position + share)
│   └── gate-invite-code — Enter Invite Code
│
├── 3. ONBOARDING (6 screens)
│   ├── onboard-welcome — Welcome / Tagline + Primary CTA (P0)
│   ├── onboard-value-prop-1 — Value Prop Slide: Set & Forget (P0)
│   ├── onboard-value-prop-2 — Value Prop Slide: AI Works 24/7 (P0)
│   ├── onboard-value-prop-3 — Value Prop Slide: Withdraw Anytime (P0)
│   ├── onboard-permission-notifications — Notifications Pre-Prompt (P0)
│   └── onboard-permission-biometric — Face ID Pre-Prompt (P1)
│
├── 4. AUTHENTICATION (6 screens)
│   ├── auth-signup — Create Account (Apple Sign-In + Email) (P0)
│   ├── auth-signin — Sign In (Apple Sign-In + Email) (P0)
│   ├── auth-forgot-password — Forgot Password (P0)
│   ├── auth-check-email — Check Email (Reset Link Sent) (P0)
│   ├── auth-reset-password — Reset Password (P0)
│   └── auth-oauth-callback — OAuth Callback / Processing (P0)
│
├── 5. BANK LINKING (4 screens)
│   ├── bank-link-start — Connect Bank (P0)
│   ├── bank-link-plaid — Plaid Link Modal/WebView (P0)
│   ├── bank-link-success — Bank Connected (P0)
│   └── bank-link-failure — Bank Link Failed (Retry) (P0)
│
├── 6. DEPOSIT (7 screens)
│   ├── deposit-amount — Choose Amount (quick picks) (P0)
│   ├── deposit-custom-amount — Custom Amount Entry (P0)
│   ├── deposit-review — Review + Confirm Deposit (P0)
│   ├── deposit-processing — Processing State (P0)
│   ├── deposit-success — Deposit Submitted (P0)
│   ├── deposit-failure — Deposit Failed (Retry) (P0)
│   └── deposit-receipt — Deposit Receipt / Detail (P1)
│
├── 7. RISK + ACTIVATION (5 screens)
│   ├── risk-select — Select Risk (Safe/Balanced/Aggressive) (P0)
│   ├── risk-customize — Custom Risk Slider (P1)
│   ├── activate-protocol — “Activate the Protocol” Orchestration (P0)
│   ├── activate-success — AI Activated (Success) (P0)
│   └── auto-invest-settings — Auto-Invest Settings (pause, change risk) (P1)
│
├── 8. MAIN APP (Tabs)
│   │
│   ├── 8.1 HOME (4 screens)
│   │   ├── home-dashboard — Home Dashboard (Balance + AI Status + Activity) (P0)
│   │   ├── home-balance-detail — Balance Detail / Breakdown (P1)
│   │   ├── activity-detail — Activity Detail (P1)
│   │   └── notifications-center — In-App Notifications Center (P2)
│   │
│   ├── 8.2 INCOME (5 screens)
│   │   ├── income-dashboard — Income Overview (chart + feed) (P0)
│   │   ├── income-event-detail — Income Event Detail (P1)
│   │   ├── income-export — Export History (P2)
│   │   ├── income-history-gate — Feature Gate: 30D/90D (P1)
│   │   └── income-share-earnings — Share Earnings (branded image) (P1)
│   │
│   ├── 8.3 AI (7 screens)
│   │   ├── ai-dashboard — AI Status Overview (P0)
│   │   ├── ai-detail — AI Status Detail (P1)
│   │   ├── ai-cycle-history — AI Cycle History (P1)
│   │   ├── ai-guarantee-info — 48-Hour AI Guarantee (Info) (P1)
│   │   ├── ai-guarantee-claim — Claim Guarantee (P1)
│   │   ├── ai-guarantee-claim-success — Claim Submitted (P1)
│   │   └── ai-signal-explainer — What Signals Mean (education) (P2)
│   │
│   └── 8.4 ACCOUNT (51 screens)
│       ├── account-home — Account Hub (P0)
│       │
│       ├── Profile (3)
│       │   ├── profile-view — Profile (P1)
│       │   ├── profile-edit — Edit Profile (P1)
│       │   └── profile-avatar — Update Avatar (P2)
│       │
│       ├── Banks (4)
│       │   ├── banks-list — Linked Banks (P1)
│       │   ├── banks-add-start — Add Bank (P1) → (bank-link-plaid)
│       │   ├── banks-relink-required — Relink Required (P1)
│       │   └── banks-remove-confirm — Remove Bank Confirm (P1)
│       │
│       ├── Subscription (10)
│       │   ├── sub-current-plan — Current Plan (P0)
│       │   ├── sub-compare-plans — Compare Plans (P0)
│       │   ├── sub-paywall — Upgrade Paywall Modal (P0)
│       │   ├── sub-purchase-processing — Purchase Processing (P0)
│       │   ├── sub-purchase-success — Purchase Success (P0)
│       │   ├── sub-purchase-failure — Purchase Failure (P1)
│       │   ├── sub-restore-purchases — Restore Purchases (P1)
│       │   ├── sub-manage-billing — Manage Billing (P1)
│       │   ├── sub-cancel-subscription — Cancel Subscription (P1)
│       │   └── sub-founding-member — Founding Member / Price Lock (P1)
│       │
│       ├── Security (8)
│       │   ├── security-center — Security & Privacy (P1)
│       │   ├── security-change-password — Change Password (P1)
│       │   ├── security-biometric-toggle — Face ID Toggle (P1)
│       │   ├── security-sessions — Active Sessions (P2)
│       │   ├── security-logout-confirm — Log Out Confirm (P0)
│       │   ├── security-delete-account — Delete Account (P1)
│       │   ├── security-delete-account-confirm — Confirm Delete (P1)
│       │   └── security-delete-account-success — Deleted (P1)
│       │
│       ├── Notifications (2)
│       │   ├── notif-settings — Notification Preferences (P1)
│       │   └── notif-permission-denied-help — Enable in iOS Settings (P1)
│       │
│       ├── Support (4)
│       │   ├── support-center — Help Center (P1)
│       │   ├── support-article — Support Article (P2)
│       │   ├── support-contact — Contact Support (P1)
│       │   └── support-ticket-success — Ticket Submitted (P1)
│       │
│       ├── Legal (5)
│       │   ├── legal-center — Legal Hub (P2)
│       │   ├── legal-terms — Terms of Service (P2)
│       │   ├── legal-privacy — Privacy Policy (P2)
│       │   ├── legal-risk-disclosure — Risk Disclosure (P1)
│       │   └── legal-subscription-terms — Subscription Terms (P1)
│       │
│       ├── Referral & Sharing (5)
│       │   ├── referral-overview — Referral Program (P1)
│       │   ├── referral-invite — Invite Friends (P1)
│       │   ├── referral-redeem — Redeem Code (P1)
│       │   ├── referral-rewards — Rewards History (P2)
│       │   └── referral-terms — Referral Terms (P2)
│       │
│       ├── Bonuses / Community (8)
│       │   ├── bonus-quickstart — Quick-Start Library (P2)
│       │   ├── bonus-quickstart-detail — Quick-Start Detail (P2)
│       │   ├── bonus-masterclass — AI Confidence Masterclass (P2)
│       │   ├── bonus-weekly-digest — Weekly Digest Settings (P2)
│       │   ├── community-discord — Private Discord (P2)
│       │   ├── feature-voting — Feature Voting (P3)
│       │   ├── theme-dashboard-skins — Elite Dashboard Skins (P3)
│       │   └── theme-dashboard-skin-preview — Skin Preview (P3)
│       │
│       └── App Info (1)
│           └── about-app — About / Version (P3)
│
├── 9. WITHDRAWAL (6 screens)
│   ├── withdraw-amount — Withdraw Amount (P1)
│   ├── withdraw-confirm — Confirm Withdrawal (P1)
│   ├── withdraw-processing — Processing (P1)
│   ├── withdraw-success — Withdrawal Initiated (P1)
│   ├── withdraw-failure — Withdrawal Failed (P1)
│   └── withdraw-detail — Withdrawal Detail / Tracking (P1)
│
└── 10. GLOBAL ERROR / EMPTY STATES (6 screens)
    ├── system-offline — Offline / No Internet (P0)
    ├── system-no-bank-linked — No Bank Linked (P0)
    ├── system-no-deposit-yet — No Deposit Yet (P0)
    ├── system-session-expired — Session Expired (P1)
    ├── system-access-denied — Access Denied / Paywall (P1)
    └── system-generic-error — Something Went Wrong (P1)
```

---

## Screen Counts

### Count Summary (by Flow)

| Flow Category | Screens | P0 | P1 | P2 | P3 |
|---------------|---------|----|----|----|----|
| Launch | 3 | 1 | 1 | 1 | 0 |
| Access Gating | 4 | 0 | 4 | 0 | 0 |
| Onboarding | 6 | 5 | 1 | 0 | 0 |
| Authentication | 6 | 6 | 0 | 0 | 0 |
| Bank Linking | 4 | 4 | 0 | 0 | 0 |
| Deposit | 7 | 6 | 1 | 0 | 0 |
| Risk + Activation | 5 | 3 | 2 | 0 | 0 |
| Home | 4 | 1 | 2 | 1 | 0 |
| Income | 5 | 1 | 3 | 1 | 0 |
| AI | 7 | 1 | 5 | 1 | 0 |
| Account | 51 | 7 | 27 | 13 | 4 |
| Withdrawal | 6 | 0 | 6 | 0 | 0 |
| Global Error/Empty | 6 | 3 | 3 | 0 | 0 |
| **TOTAL** | **114** | **38** | **55** | **17** | **4** |

### Screen Count Verification

- **Total Screens** = 114  
- **Sum of category screens** = 3+4+6+6+4+7+5+4+5+7+51+6+6 = **114 ✅**

---

## Notes (Scope + Assumptions)

- **Waitlist + gating screens** are included because they are explicitly referenced in PRD/offer docs (launch strategy). If you decide to remove prelaunch gating, these become **P3/removed** and the total drops by 4.
- **Bonuses/community** screens are included because they are part of the approved offer architecture; they are **P2/P3** and non-blocking for MVP.

---

**Status:** Drafted for Step 4 execution  
**Next Artifact:** `/docs/flows/SCREEN-INVENTORY.md` (every screen with purpose + entry/exit)


