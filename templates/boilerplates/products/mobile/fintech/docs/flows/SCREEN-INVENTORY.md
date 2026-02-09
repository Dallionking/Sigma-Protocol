# Screen Inventory — Trading Platform

**Date:** 2025-12-12  
**Step:** 4 — Flow Tree & Screen Architecture  
**Total Screens:** 114

---

## Screen Table

> Columns include **Entry/Exit** so no screens are orphaned.

| # | Screen ID | Screen Name | Flow | Sub-Flow | Priority | Complexity | Entry Points (examples) | Exit Points (examples) |
|---:|----------|-------------|------|----------|:--------:|:----------:|-------------------------|------------------------|
| 1 | `launch-splash` | Splash / Logo Animation | Launch | — | P0 | Simple | App cold start | Gate / Onboarding / Auth / Home |
| 2 | `launch-force-update` | Update Required | Launch | — | P1 | Simple | Version < minVersion | App Store / Quit |
| 3 | `launch-maintenance` | Maintenance Mode | Launch | — | P2 | Simple | Backend maintenance flag | Retry / Quit |
| 4 | `gate-early-access` | Early Access Gate | Access Gating | Beta | P1 | Medium | Launch router (prelaunch) | Waitlist Join / Invite Code |
| 5 | `gate-waitlist-join` | Join Waitlist | Access Gating | Waitlist | P1 | Medium | From early access gate | Waitlist Status |
| 6 | `gate-waitlist-status` | Waitlist Status (position + share) | Access Gating | Waitlist | P1 | Simple | After join / returning | Share Invite / Onboarding |
| 7 | `gate-invite-code` | Enter Invite Code | Access Gating | Beta | P1 | Medium | From early access gate | Onboarding / Error |
| 8 | `onboard-welcome` | Welcome / Tagline + CTA | Onboarding | Welcome | P0 | Simple | First launch / logged out | Sign Up / Sign In / Value Props |
| 9 | `onboard-value-prop-1` | Value Prop Slide: Set & Forget | Onboarding | Value Props | P0 | Simple | From welcome | Next / Skip |
| 10 | `onboard-value-prop-2` | Value Prop Slide: AI Works 24/7 | Onboarding | Value Props | P0 | Simple | From value prop 1 | Next / Back / Skip |
| 11 | `onboard-value-prop-3` | Value Prop Slide: Withdraw Anytime | Onboarding | Value Props | P0 | Simple | From value prop 2 | Permissions / Skip |
| 12 | `onboard-permission-notifications` | Notifications Pre-Prompt | Onboarding | Permissions | P0 | Medium | After value props / setup | System prompt / Denied Help |
| 13 | `onboard-permission-biometric` | Face ID Pre-Prompt | Onboarding | Permissions | P1 | Medium | After first auth | Continue / Skip |
| 14 | `auth-signup` | Create Account (Apple + Email) | Authentication | Sign Up | P0 | Medium | Welcome CTA / deep link | OAuth Callback / Bank Link |
| 15 | `auth-signin` | Sign In (Apple + Email) | Authentication | Sign In | P0 | Medium | Welcome / session expired | OAuth Callback / Home |
| 16 | `auth-forgot-password` | Forgot Password | Authentication | Recovery | P0 | Medium | From Sign In | Check Email |
| 17 | `auth-check-email` | Check Email (reset link sent) | Authentication | Recovery | P0 | Simple | From Forgot Password | Reset Password / Sign In |
| 18 | `auth-reset-password` | Reset Password | Authentication | Recovery | P0 | Medium | Deep link with token | Sign In |
| 19 | `auth-oauth-callback` | OAuth Callback / Processing | Authentication | System | P0 | Simple | Apple Sign-In return | Bank Link / Home |
| 20 | `bank-link-start` | Connect Bank | Bank Linking | Plaid | P0 | Medium | Post-auth onboarding / Banks add | Plaid / Back |
| 21 | `bank-link-plaid` | Plaid Link Modal/WebView | Bank Linking | Plaid | P0 | Complex | From bank link start | Success / Failure |
| 22 | `bank-link-success` | Bank Connected | Bank Linking | Plaid | P0 | Simple | Plaid success | Deposit Amount / Home |
| 23 | `bank-link-failure` | Bank Link Failed | Bank Linking | Plaid | P0 | Simple | Plaid error | Retry / Support |
| 24 | `deposit-amount` | Choose Amount (quick picks) | Deposit | Deposit | P0 | Medium | Deposit FAB / onboarding / reminders | Review / Custom Amount |
| 25 | `deposit-custom-amount` | Custom Amount Entry | Deposit | Deposit | P0 | Medium | From deposit amount | Review / Back |
| 26 | `deposit-review` | Review + Confirm Deposit | Deposit | Deposit | P0 | Medium | From amount screens | Processing / Back |
| 27 | `deposit-processing` | Deposit Processing | Deposit | Deposit | P0 | Simple | Confirm deposit | Success / Failure |
| 28 | `deposit-success` | Deposit Submitted | Deposit | Deposit | P0 | Simple | Processing success | Risk Select (first-time) / Home |
| 29 | `deposit-failure` | Deposit Failed (Retry) | Deposit | Deposit | P0 | Simple | Processing failure | Retry / Back |
| 30 | `deposit-receipt` | Deposit Receipt / Detail | Deposit | Receipt | P1 | Simple | From success / activity | Back |
| 31 | `risk-select` | Select Risk (Safe/Balanced/Aggressive) | Risk | Activation | P0 | Medium | After deposit / AI settings | Activate / Customize |
| 32 | `risk-customize` | Custom Risk Slider | Risk | Activation | P1 | Medium | From risk select | Back / Activate |
| 33 | `activate-protocol` | Activate the Protocol | Activation | Activation | P0 | Complex | After risk selection | Activated / Error |
| 34 | `activate-success` | AI Activated (Success) | Activation | Activation | P0 | Simple | Activation completed | Home / AI |
| 35 | `auto-invest-settings` | Auto-Invest Settings | Activation | Settings | P1 | Medium | From AI / Account | Risk Select / Pause / Back |
| 36 | `home-dashboard` | Home Dashboard | Main App | Home | P0 | Complex | Launch (authed) / activation | Activity / Balance Detail / Tabs |
| 37 | `home-balance-detail` | Balance Detail / Breakdown | Main App | Home | P1 | Medium | Tap balance on home | Withdraw / Back |
| 38 | `activity-detail` | Activity Detail | Main App | Home | P1 | Medium | Tap activity item | Receipt / Withdraw Detail / Back |
| 39 | `notifications-center` | In-App Notifications Center | Main App | Home | P2 | Medium | From Account / deep link | Tap notification → target screen |
| 40 | `income-dashboard` | Income Overview (chart + feed) | Main App | Income | P0 | Medium | Income tab | Event Detail / Export / Share |
| 41 | `income-event-detail` | Income Event Detail | Main App | Income | P1 | Medium | Tap income event | Back |
| 42 | `income-export` | Export History | Main App | Income | P2 | Medium | From Income | Share sheet / Back |
| 43 | `income-history-gate` | Feature Gate (30D/90D) | Main App | Income | P1 | Simple | Toggle 30D/90D gated | Paywall / Back |
| 44 | `income-share-earnings` | Share Earnings (branded image) | Main App | Income | P1 | Medium | From Income | System share sheet / Back |
| 45 | `ai-dashboard` | AI Status Overview | Main App | AI | P0 | Medium | AI tab / activation | Detail / Risk / Guarantee |
| 46 | `ai-detail` | AI Status Detail | Main App | AI | P1 | Medium | From AI dashboard | Back |
| 47 | `ai-cycle-history` | AI Cycle History | Main App | AI | P1 | Medium | From AI dashboard | Activity detail / Back |
| 48 | `ai-guarantee-info` | 48-Hour AI Guarantee (Info) | Main App | AI | P1 | Simple | From AI dashboard | Claim / Back |
| 49 | `ai-guarantee-claim` | Claim Guarantee | Main App | AI | P1 | Medium | From guarantee info | Claim Success / Error |
| 50 | `ai-guarantee-claim-success` | Guarantee Claim Submitted | Main App | AI | P1 | Simple | After claim submit | AI dashboard |
| 51 | `ai-signal-explainer` | What Signals Mean (education) | Main App | AI | P2 | Medium | From AI dashboard | Bonus Masterclass / Back |
| 52 | `account-home` | Account Hub | Main App | Account | P0 | Medium | Account tab | Profile / Subscription / Settings |
| 53 | `profile-view` | Profile | Account | Profile | P1 | Medium | From account hub | Edit / Back |
| 54 | `profile-edit` | Edit Profile | Account | Profile | P1 | Medium | From profile | Save / Avatar / Back |
| 55 | `profile-avatar` | Update Avatar | Account | Profile | P2 | Medium | From profile edit | Save / Back |
| 56 | `banks-list` | Linked Banks | Account | Banks | P1 | Medium | From account hub | Add / Remove / Relink |
| 57 | `banks-add-start` | Add Bank | Account | Banks | P1 | Medium | From banks list | Bank Link Start / Back |
| 58 | `banks-relink-required` | Relink Required | Account | Banks | P1 | Simple | From banks list / failed transfers | Bank Link Start |
| 59 | `banks-remove-confirm` | Remove Bank Confirm | Account | Banks | P1 | Simple | From banks list | Banks list |
| 60 | `sub-current-plan` | Subscription Overview | Account | Subscription | P0 | Medium | Account hub / post purchase | Compare / Manage / Restore |
| 61 | `sub-compare-plans` | Compare Plans | Account | Subscription | P0 | Medium | From subscription / paywall gate | Paywall / Back |
| 62 | `sub-paywall` | Upgrade Paywall (Modal) | Account | Subscription | P0 | Medium | From compare / feature gate | Purchase / Back |
| 63 | `sub-purchase-processing` | Purchase Processing | Account | Subscription | P0 | Simple | Start purchase | Success / Failure |
| 64 | `sub-purchase-success` | Purchase Success | Account | Subscription | P0 | Simple | Purchase approved | Return with unlock |
| 65 | `sub-purchase-failure` | Purchase Failure | Account | Subscription | P1 | Simple | Purchase failed/cancelled | Retry / Back |
| 66 | `sub-restore-purchases` | Restore Purchases | Account | Subscription | P1 | Simple | From subscription | Updated plan / Error |
| 67 | `sub-manage-billing` | Manage Billing | Account | Subscription | P1 | Medium | From subscription | iOS Manage Subs / Back |
| 68 | `sub-cancel-subscription` | Cancel Subscription | Account | Subscription | P1 | Medium | From subscription | iOS Manage Subs / Back |
| 69 | `sub-founding-member` | Founding Member / Price Lock | Account | Subscription | P1 | Simple | From subscription | Referral / Back |
| 70 | `security-center` | Security & Privacy | Account | Security | P1 | Medium | From account hub | Password / Face ID / Delete |
| 71 | `security-change-password` | Change Password | Account | Security | P1 | Medium | From security center | Success / Back |
| 72 | `security-biometric-toggle` | Face ID Toggle | Account | Security | P1 | Simple | From security center | Back |
| 73 | `security-sessions` | Active Sessions | Account | Security | P2 | Medium | From security center | Back |
| 74 | `security-logout-confirm` | Log Out Confirm | Account | Security | P0 | Simple | From account hub/security | Welcome / Cancel |
| 75 | `security-delete-account` | Delete Account | Account | Security | P1 | Medium | From security center | Confirm / Back |
| 76 | `security-delete-account-confirm` | Confirm Delete Account | Account | Security | P1 | Simple | From delete account | Deleted / Back |
| 77 | `security-delete-account-success` | Account Deleted | Account | Security | P1 | Simple | After deletion | Welcome |
| 78 | `notif-settings` | Notification Preferences | Account | Notifications | P1 | Medium | From account hub | Back |
| 79 | `notif-permission-denied-help` | Enable Notifications (iOS Settings) | Account | Notifications | P1 | Simple | From notif settings/onboarding | Open Settings / Back |
| 80 | `support-center` | Help Center | Account | Support | P1 | Medium | From account hub | Article / Contact |
| 81 | `support-article` | Support Article | Account | Support | P2 | Medium | From help center | Back |
| 82 | `support-contact` | Contact Support | Account | Support | P1 | Medium | From help center | Ticket Submitted / Back |
| 83 | `support-ticket-success` | Ticket Submitted | Account | Support | P1 | Simple | After submit | Account hub |
| 84 | `legal-center` | Legal Hub | Account | Legal | P2 | Simple | From account hub | Terms/Privacy/Risk |
| 85 | `legal-terms` | Terms of Service | Account | Legal | P2 | Simple | From legal hub / sign-up | Back |
| 86 | `legal-privacy` | Privacy Policy | Account | Legal | P2 | Simple | From legal hub / sign-up | Back |
| 87 | `legal-risk-disclosure` | Risk Disclosure | Account | Legal | P1 | Simple | Onboarding/AI/withdraw | Back / Continue |
| 88 | `legal-subscription-terms` | Subscription Terms | Account | Legal | P1 | Simple | Paywall / subscription | Back |
| 89 | `referral-overview` | Referral Program | Account | Referral | P1 | Medium | Account hub / waitlist | Invite / Redeem / Rewards |
| 90 | `referral-invite` | Invite Friends | Account | Referral | P1 | Medium | From referral overview | Share sheet / Back |
| 91 | `referral-redeem` | Redeem Code | Account | Referral | P1 | Medium | From referral overview | Success / Back |
| 92 | `referral-rewards` | Rewards History | Account | Referral | P2 | Medium | From referral overview | Back |
| 93 | `referral-terms` | Referral Terms | Account | Referral | P2 | Simple | From referral overview | Back |
| 94 | `bonus-quickstart` | Quick-Start Library | Account | Bonuses | P2 | Medium | Account hub | Guide Detail / Back |
| 95 | `bonus-quickstart-detail` | Quick-Start Guide Detail | Account | Bonuses | P2 | Medium | From quick-start library | Back |
| 96 | `bonus-masterclass` | AI Confidence Masterclass | Account | Bonuses | P2 | Medium | Account hub / AI explainer | Back |
| 97 | `bonus-weekly-digest` | Weekly Digest Settings | Account | Bonuses | P2 | Medium | Account hub | Back |
| 98 | `community-discord` | Private Discord (“The Vault”) | Account | Community | P2 | Simple | Account hub | Open link / Back |
| 99 | `feature-voting` | Priority Feature Voting | Account | Community | P3 | Medium | Account hub | Back |
| 100 | `theme-dashboard-skins` | Elite Dashboard Skins | Account | Theme | P3 | Medium | Account hub (Elite) | Preview / Back |
| 101 | `about-app` | About / Version | Account | App Info | P3 | Simple | Account hub | Back |
| 102 | `theme-dashboard-skin-preview` | Dashboard Skin Preview | Account | Theme | P3 | Medium | From skins list | Apply / Back |
| 103 | `withdraw-amount` | Withdraw Amount | Withdrawal | Withdraw | P1 | Medium | Home / Balance detail / Account | Confirm / Back |
| 104 | `withdraw-confirm` | Confirm Withdrawal | Withdrawal | Withdraw | P1 | Medium | From withdraw amount | Processing / Back |
| 105 | `withdraw-processing` | Withdrawal Processing | Withdrawal | Withdraw | P1 | Simple | Confirm withdrawal | Success / Failure |
| 106 | `withdraw-success` | Withdrawal Initiated | Withdrawal | Withdraw | P1 | Simple | Processing success | Detail / Home |
| 107 | `withdraw-failure` | Withdrawal Failed | Withdrawal | Withdraw | P1 | Simple | Processing failure | Retry / Back |
| 108 | `withdraw-detail` | Withdrawal Detail / Tracking | Withdrawal | Withdraw | P1 | Medium | Activity / withdrawal success | Back |
| 109 | `system-offline` | Offline / No Internet | Global | Error/Empty | P0 | Simple | Network unavailable | Retry / Continue offline |
| 110 | `system-no-bank-linked` | No Bank Linked | Global | Error/Empty | P0 | Simple | Deposit/withdraw attempted w/o bank | Connect Bank / Back |
| 111 | `system-no-deposit-yet` | No Deposit Yet | Global | Error/Empty | P0 | Simple | First-run empty home/income | Deposit / Connect Bank |
| 112 | `system-session-expired` | Session Expired | Global | Error/Empty | P1 | Simple | Auth token expired | Sign In |
| 113 | `system-access-denied` | Access Denied / Paywall | Global | Error/Empty | P1 | Simple | Feature gate hit | Paywall / Back |
| 114 | `system-generic-error` | Something Went Wrong | Global | Error/Empty | P1 | Simple | Unexpected failure | Retry / Support |

---

## Priority Summary

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

---

## Shared / Reusable Screens

| Screen | Used In | Notes |
|--------|---------|------|
| `bank-link-start` + `bank-link-plaid` | Setup + Account/Banks | Single Plaid integration flow reused |
| Deposit flow (`deposit-*`) | Onboarding + Deposit FAB + reminders | Same deposit UX everywhere |
| `risk-select` | Onboarding + AI/Settings | Single source of truth for risk mode |
| `sub-paywall` | Account + feature gates (Income) | Central upsell surface |
| Global error/empty (`system-*`) | All flows | Full-screen fallbacks when needed |

---

**Status:** ✅ Inventory enumerated (114 screens)  
**Next Artifact:** `/docs/flows/TRANSITION-MAP.md`


