# Information Architecture — Trading Platform

**Date:** 2025-12-11  
**Step:** 3 — UX Design & Interface Planning  
**Platform:** iOS Mobile (Expo/React Native)

---

## Navigation Model: Hub-and-Spoke

Trading Platform uses a **hub-and-spoke** navigation model, optimized for mobile:
- **Hub:** Bottom tab bar with 5 primary destinations
- **Spokes:** Stack navigation within each tab for drill-down
- **Modals:** Overlay screens for focused tasks (deposit, settings)

```
                    ┌──────────────────┐
                    │   BOTTOM TABS    │
                    │   (Hub - 5 tabs) │
                    └────────┬─────────┘
         ┌───────────────────┼───────────────────┐
         │           │       │       │           │
         ▼           ▼       ▼       ▼           ▼
    ┌─────────┐ ┌─────────┐ ┌───┐ ┌─────────┐ ┌─────────┐
    │  Home   │ │ Auto-   │ │ + │ │   AI    │ │ Account │
    │ (Stack) │ │ Invest  │ │   │ │ (Stack) │ │ (Stack) │
    └────┬────┘ └────┬────┘ └─┬─┘ └────┬────┘ └────┬────┘
         │           │        │        │           │
         ▼           ▼        ▼        ▼           ▼
      Income      Risk    Deposit   Status     Settings
      History   Settings   Modal   Details    Subscription
```

---

## Primary Navigation (Bottom Tab Bar)

### Tab Configuration

| Tab | Icon | Label | Screen | Priority |
|-----|------|-------|--------|----------|
| 1 | 🏠 House | Home | Balance + Activity | Primary |
| 2 | 📈 Chart | Income | Income Stream | Primary |
| 3 | ➕ Plus (Center) | — | Deposit (Modal) | Action |
| 4 | 🤖 AI/Robot | AI | AI Status | Primary |
| 5 | 👤 Person | Account | Settings + Profile | Secondary |

### Tab Bar Specifications

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  [🏠]      [📈]      [➕]      [🤖]      [👤]  │
│  Home     Income   Deposit     AI      Account  │
│                                                 │
└─────────────────────────────────────────────────┘

Visual Specs:
- Height: 84px (includes 34px safe area on iPhone X+)
- Background: #0A0A0A (surface color)
- Border Top: 1px solid #1A1A1A
- Active Icon: #6366F1 (primary green)
- Inactive Icon: #666666 (tertiary text)
- Label Font: SF Pro Text, 10px, Medium
- Center Button: 56px diameter, #6366F1, elevated

Animation:
- Active tab: Scale 1.0 → 1.1 → 1.0 (spring)
- Icon: Glow effect on active state
- Haptic: Light impact on tab switch
```

### Center Action Button (Deposit)

The center tab is a **floating action button** for the primary action:

```
        ┌─────┐
        │  +  │  ← 56px diameter
        │     │     Elevated above bar
        └─────┘     Opens deposit modal

Background: #6366F1
Icon: White "+" 
Shadow: Glow effect (0 0 20px rgba(99,102,241,0.4))
Press: Scale to 0.9, modal slides up
```

---

## Screen Hierarchy

### Level 0: Tab Screens (Always Accessible)

```
├── Home (/)
├── Income (/income)
├── [Deposit Modal] (/deposit)
├── AI (/ai)
└── Account (/account)
```

### Level 1: Stack Screens (Drill-Down)

```
├── Home (/)
│   ├── Activity Detail (/activity/[id])
│   └── Notification Settings (/notifications)
│
├── Income (/income)
│   ├── Income Event Detail (/income/[id])
│   └── Export History (/income/export)
│
├── AI (/ai)
│   ├── AI Status Detail (/ai/detail)
│   └── Risk Settings (/ai/risk)
│
└── Account (/account)
    ├── Profile (/account/profile)
    ├── Subscription (/account/subscription)
    │   ├── Tier Comparison (/account/subscription/compare)
    │   └── Manage Billing (/account/subscription/billing)
    ├── Linked Accounts (/account/banks)
    │   └── Add Bank (/account/banks/add)
    ├── Security (/account/security)
    ├── Notifications (/account/notifications)
    ├── Help & Support (/account/support)
    └── Legal (/account/legal)
```

### Level 2: Modal Screens (Overlay)

```
Modals (slide up from bottom):
├── Deposit (/deposit)
│   ├── Amount Selection
│   ├── Confirmation
│   └── Success/Error
│
├── Withdraw (/withdraw)
│   ├── Amount Selection
│   ├── Confirmation
│   └── Success/Error
│
├── Upgrade (/upgrade)
│   ├── Tier Comparison
│   └── Purchase Confirmation
│
└── Onboarding (/onboarding)
    ├── Welcome
    ├── Value Props (optional)
    ├── Bank Link
    ├── First Deposit
    ├── Risk Selection
    └── Activation
```

---

## URL Structure (Deep Linking)

### Expo Router File Structure

```
/app
├── (tabs)/
│   ├── _layout.tsx          # Tab navigator
│   ├── index.tsx             # Home tab
│   ├── income.tsx            # Income tab
│   ├── ai.tsx                # AI tab
│   └── account.tsx           # Account tab
│
├── (auth)/
│   ├── _layout.tsx           # Auth stack
│   ├── welcome.tsx           # Welcome screen
│   ├── login.tsx             # Login
│   └── signup.tsx            # Signup
│
├── (onboarding)/
│   ├── _layout.tsx           # Onboarding stack
│   ├── bank-link.tsx         # Plaid integration
│   ├── first-deposit.tsx     # Initial deposit
│   ├── risk-selection.tsx    # Risk mode
│   └── activation.tsx        # AI activation
│
├── deposit.tsx               # Deposit modal
├── withdraw.tsx              # Withdraw modal
├── upgrade.tsx               # Upgrade modal
│
├── activity/
│   └── [id].tsx              # Activity detail
│
├── income/
│   └── [id].tsx              # Income event detail
│
├── account/
│   ├── profile.tsx
│   ├── subscription/
│   │   ├── index.tsx
│   │   ├── compare.tsx
│   │   └── billing.tsx
│   ├── banks/
│   │   ├── index.tsx
│   │   └── add.tsx
│   ├── security.tsx
│   └── support.tsx
│
└── _layout.tsx               # Root layout
```

### Deep Link URLs

| Screen | Deep Link URL | Use Case |
|--------|---------------|----------|
| Home | `tradingplatform://` | Default launch |
| Income | `tradingplatform://income` | Push notification |
| AI Status | `tradingplatform://ai` | Status update |
| Deposit | `tradingplatform://deposit` | Deposit reminder |
| Upgrade | `tradingplatform://upgrade` | Upsell campaign |
| Activity | `tradingplatform://activity/[id]` | Transaction notification |

---

## Progressive Disclosure Strategy

### Principle: Show Essential, Reveal on Demand

| Level | What's Visible | How to Access More |
|-------|----------------|-------------------|
| **Glance** | Balance, daily change, AI status | — |
| **Scan** | Recent activity, quick actions | Scroll |
| **Engage** | Full history, settings, details | Tap to drill-down |
| **Deep** | Advanced settings, export, legal | Multiple taps |

### Home Screen Progressive Disclosure

```
┌─────────────────────────────────────┐
│                                     │
│  LEVEL 1: GLANCE (no scroll)        │
│  ─────────────────────────────      │
│  • Balance (hero, glowing)          │
│  • Daily change (+$X.XX)            │
│  • Auto-Invest status toggle        │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  LEVEL 2: SCAN (scroll down)        │
│  ─────────────────────────────      │
│  • AI Status card (condensed)       │
│  • Recent income events (3 items)   │
│  • Quick action buttons             │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  LEVEL 3: ENGAGE (tap cards)        │
│  ─────────────────────────────      │
│  • AI Status → Full AI screen       │
│  • Income event → Event detail      │
│  • "View All" → Full income list    │
│                                     │
└─────────────────────────────────────┘
```

### AI Status Progressive Disclosure

```
HOME VIEW (Condensed):
┌─────────────────────────┐
│ AI Trading Assistant    │
│ Status: ACTIVE          │
│ ████ ████ ████          │
└─────────────────────────┘
         │
         ▼ Tap to expand
         
AI SCREEN (Full):
┌─────────────────────────┐
│ AI Trading Assistant    │
│ Status: ACTIVE          │
│ ████ ████ ████ ████     │
│                         │
│ Confidence:    HIGH     │
│ Mode:          BALANCED │
│ Environment:   STABLE   │
│ Last Cycle:    2 min    │
│ Next Cycle:    ~15 min  │
│                         │
│ [ ADJUST RISK LEVEL ]   │
└─────────────────────────┘
```

---

## Content Hierarchy

### Visual Hierarchy Rules

1. **Balance is King** — Always largest, most prominent element
2. **Status Before Stats** — Show if AI is working before showing numbers
3. **Actions Over Information** — Primary CTAs above the fold
4. **Recency Wins** — Most recent events first in lists

### Typography Hierarchy

| Level | Use Case | Size | Weight | Color |
|-------|----------|------|--------|-------|
| **Display** | Balance | 48px | Bold | Primary Green |
| **H1** | Screen titles | 34px | Bold | White |
| **H2** | Section headers | 24px | Semibold | White |
| **H3** | Card titles | 20px | Semibold | White |
| **Body** | Descriptions | 15px | Regular | Secondary Gray |
| **Caption** | Labels, timestamps | 13px | Medium | Tertiary Gray |
| **Micro** | Status badges | 11px | Medium | Varies |

---

## Search & Filtering

### Global Search (Not in MVP)

Search is deferred to post-MVP. The app's simplicity means users rarely need to search.

### Filtering (Income Screen)

```
Time Period Filter:
┌──────┐ ┌──────┐ ┌──────┐
│  7D  │ │ 30D* │ │ 90D  │
└──────┘ └──────┘ └──────┘
         * selected

Behavior:
- Segmented control style
- Instant filter (no loading)
- Selected = glow effect
- 30D feature-gated for Basic tier
- 90D feature-gated for Basic/Pro
```

---

## Navigation Patterns

### Back Navigation

| Pattern | Implementation |
|---------|----------------|
| **iOS back gesture** | Swipe from left edge |
| **Back button** | Top-left chevron on stack screens |
| **Modal dismiss** | Swipe down or X button |
| **Tab return** | Tap active tab to scroll to top |

### Contextual Navigation

| Context | Navigation |
|---------|------------|
| From push notification | Deep link to relevant screen |
| After successful deposit | Return to Home with success state |
| After upgrade | Return to previous screen with UI update |
| After bank link | Continue to deposit flow |

### Navigation Gestures

| Gesture | Action | Screen Type |
|---------|--------|-------------|
| Swipe left edge → right | Go back | Stack screens |
| Swipe down | Dismiss | Modal screens |
| Long press | Preview/actions | List items |
| Pull down | Refresh | Scrollable content |

---

## Information Architecture Validation

### Heuristic Checklist (Nielsen)

- [x] **Visibility of system status** — AI status always visible, loading states clear
- [x] **Match with real world** — "Deposit," "Withdraw," "Income" (not jargon)
- [x] **User control and freedom** — Back gestures, modal dismiss, undo deposits
- [x] **Consistency and standards** — iOS HIG patterns, standard tab bar
- [x] **Error prevention** — Confirmation steps, amount validation
- [x] **Recognition over recall** — Icons + labels, recent activity visible
- [x] **Flexibility and efficiency** — Quick deposit amounts, one-tap actions
- [x] **Aesthetic and minimalist** — Progressive disclosure, no clutter
- [x] **Help users recover** — Clear error messages, retry options
- [x] **Help and documentation** — Support accessible, tooltips on complex items

### Navigation Depth

| Max Depth | Screen Path | Acceptable? |
|-----------|-------------|-------------|
| 1 | Home → Activity Detail | ✅ Yes |
| 2 | Account → Subscription → Compare | ✅ Yes |
| 2 | Account → Banks → Add | ✅ Yes |
| 3 | Account → Subscription → Billing → Cancel | ⚠️ Edge case |

**Rule:** Maximum 2 taps to any primary feature.

---

**Status:** ✅ Information Architecture Complete  
**Ready for:** Phase D (Interface States & Interactions)



