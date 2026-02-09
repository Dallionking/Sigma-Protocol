# State Coverage — Trading Platform

**Date:** 2025-12-11  
**Step:** 3 — UX Design & Interface Planning  
**Philosophy:** Every state is a piece of art, not an afterthought

---

## State Philosophy

> "If it's not pixel-perfect and delightful, it's a bug."

Every screen must handle **five states** beautifully:
1. **Empty** — First-time user, no data yet
2. **Loading** — Data being fetched
3. **Error** — Something went wrong
4. **Success** — Normal populated state
5. **Offline** — No network connection

---

## Home Screen States

### Empty State (First Launch, Pre-Deposit)

```
┌─────────────────────────────────────┐
│                                     │
│           [ TRADING PLATFORM ]          │
│                                     │
│              $0.00                  │
│           (glowing, ready)          │
│                                     │
│     ┌─────────────────────────┐     │
│     │                         │     │
│     │   🔗 Connect Your Bank  │     │
│     │                         │     │
│     │   Start building your   │     │
│     │   passive income vault  │     │
│     │                         │     │
│     │  [ CONNECT BANK ]       │     │
│     │                         │     │
│     └─────────────────────────┘     │
│                                     │
│     AI Trading Assistant            │
│     Status: WAITING                 │
│     ░░░░░░░░░░░░ (inactive)         │
│                                     │
└─────────────────────────────────────┘

Copy:
- Headline: "Your Vault Awaits"
- Body: "Connect your bank to start growing your wealth on autopilot."
- CTA: "Connect Bank" (primary button)
```

### Loading State

```
┌─────────────────────────────────────┐
│                                     │
│           [ TRADING PLATFORM ]          │
│                                     │
│         ████████████████            │
│         (skeleton shimmer)          │
│                                     │
│         ████████                    │
│         (skeleton)                  │
│                                     │
│     ┌─────────────────────────┐     │
│     │  ████████████████████   │     │
│     │  ████████████           │     │
│     │  ████████████████       │     │
│     └─────────────────────────┘     │
│                                     │
│     AI Trading Assistant            │
│     ████████████                    │
│     ████████████████                │
│                                     │
└─────────────────────────────────────┘

Animation:
- Skeleton shimmer: left-to-right gradient
- Duration: 1.5s per cycle
- Easing: ease-in-out
```

### Error State

```
┌─────────────────────────────────────┐
│                                     │
│           [ TRADING PLATFORM ]          │
│                                     │
│              $---.--                │
│           (muted, no glow)          │
│                                     │
│     ┌─────────────────────────┐     │
│     │                         │     │
│     │   ⚠️ Connection Issue   │     │
│     │                         │     │
│     │   We couldn't reach     │     │
│     │   the server.           │     │
│     │                         │     │
│     │   [ TRY AGAIN ]         │     │
│     │                         │     │
│     └─────────────────────────┘     │
│                                     │
│     Last updated: 5 min ago         │
│     (cached balance shown)          │
│                                     │
└─────────────────────────────────────┘

Copy:
- Headline: "Connection Issue"
- Body: "We couldn't reach the server. Your data is safe."
- CTA: "Try Again"
- Fallback: Show cached balance with timestamp
```

### Success State (Normal)

```
┌─────────────────────────────────────┐
│                                     │
│           [ TRADING PLATFORM ]          │
│                                     │
│            $12,847.31               │
│          (glowing green)            │
│                                     │
│            +$42.17 today            │
│           (green, animated)         │
│                                     │
│     [ AUTO INVEST: ON ]             │
│     (toggle, glowing border)        │
│                                     │
│     AI Trading Assistant            │
│     Status: ACTIVE                  │
│     ████ ████ ████ (pulsing bars)   │
│     Confidence: HIGH                │
│     Mode: BALANCED                  │
│     Environment: STABLE             │
│                                     │
│     Recent Activity                 │
│     +$12.31 — AI Cycle Complete     │
│     +$7.14 — Auto-Yield Event       │
│     +$22.72 — Market Sync           │
│                                     │
└─────────────────────────────────────┘
```

### Offline State

```
┌─────────────────────────────────────┐
│  ░░░░░░░░░░ OFFLINE ░░░░░░░░░░      │
│                                     │
│           [ TRADING PLATFORM ]          │
│                                     │
│            $12,847.31               │
│          (muted, no glow)           │
│                                     │
│            +$42.17 today            │
│           (muted green)             │
│                                     │
│     ┌─────────────────────────┐     │
│     │                         │     │
│     │   📡 You're Offline     │     │
│     │                         │     │
│     │   Your AI is still      │     │
│     │   working. Data will    │     │
│     │   sync when connected.  │     │
│     │                         │     │
│     └─────────────────────────┘     │
│                                     │
│     Last synced: 10:32 AM           │
│                                     │
└─────────────────────────────────────┘

Behavior:
- Show cached balance
- Disable actions that require network
- Queue actions locally
- Auto-sync when connection restored
```

---

## Income Screen States

### Empty State (No Income Yet)

```
┌─────────────────────────────────────┐
│                                     │
│           INCOME STREAM             │
│                                     │
│              $0.00                  │
│           Total Earned              │
│                                     │
│     ┌─────────────────────────┐     │
│     │                         │     │
│     │    📈 No income yet     │     │
│     │                         │     │
│     │    Your AI will start   │     │
│     │    generating returns   │     │
│     │    within 24-48 hours.  │     │
│     │                         │     │
│     │    [ VIEW AI STATUS ]   │     │
│     │                         │     │
│     └─────────────────────────┘     │
│                                     │
│     Time Periods                    │
│     [ 7D ][ 30D ][ 90D ]            │
│     (all disabled/empty)            │
│                                     │
└─────────────────────────────────────┘

Copy:
- Headline: "Your AI is Warming Up"
- Body: "First returns typically appear within 24-48 hours of activation."
- CTA: "View AI Status" (secondary)
```

### Loading State

```
┌─────────────────────────────────────┐
│                                     │
│           INCOME STREAM             │
│                                     │
│         ████████████████            │
│           (skeleton)                │
│                                     │
│     ┌─────────────────────────┐     │
│     │  ▁▂▃▄▅▆▇█▇▆▅▄▃▂▁       │     │
│     │  (skeleton chart)        │     │
│     └─────────────────────────┘     │
│                                     │
│     ████████████████████            │
│     ████████████████                │
│     ████████████████████            │
│     (skeleton list items)           │
│                                     │
└─────────────────────────────────────┘
```

### Success State (With Data)

```
┌─────────────────────────────────────┐
│                                     │
│           INCOME STREAM             │
│                                     │
│             $847.31                 │
│           Total Earned              │
│           (glowing green)           │
│                                     │
│     ┌─────────────────────────┐     │
│     │  ▁▂▃▄▅▆▇█▇▆▅▆▇█▇▆▅▄▃▂▁ │     │
│     │  (minimalist line chart)│     │
│     │  Gradient fill below    │     │
│     └─────────────────────────┘     │
│                                     │
│     [ 7D ][ 30D ][ 90D ]            │
│     (30D selected, glowing)         │
│                                     │
│     Today's Events                  │
│     +$12.31 — AI Cycle Complete     │
│     +$7.14 — Auto-Yield Event       │
│     +$22.72 — Market Sync           │
│                                     │
│     Yesterday                       │
│     +$18.44 — AI Cycle Complete     │
│     +$9.21 — Auto-Yield Event       │
│                                     │
└─────────────────────────────────────┘
```

---

## AI Status Screen States

### Empty State (Not Activated)

```
┌─────────────────────────────────────┐
│                                     │
│        AI TRADING ASSISTANT         │
│                                     │
│     ┌─────────────────────────┐     │
│     │                         │     │
│     │      Status: IDLE       │     │
│     │                         │     │
│     │   ░░░░░░░░░░░░░░░░░░░  │     │
│     │   (inactive bars)       │     │
│     │                         │     │
│     └─────────────────────────┘     │
│                                     │
│     Your AI is ready to work.       │
│     Activate Auto-Invest to         │
│     start generating returns.       │
│                                     │
│     [ ACTIVATE NOW ]                │
│     (primary button)                │
│                                     │
└─────────────────────────────────────┘
```

### Loading State (Initializing)

```
┌─────────────────────────────────────┐
│                                     │
│        AI TRADING ASSISTANT         │
│                                     │
│     ┌─────────────────────────┐     │
│     │                         │     │
│     │   Status: INITIALIZING  │     │
│     │                         │     │
│     │   ████ ░░░░ ░░░░ ░░░░  │     │
│     │   (bars lighting up     │     │
│     │    sequentially)        │     │
│     │                         │     │
│     └─────────────────────────┘     │
│                                     │
│     Setting up your AI...           │
│     This takes about 30 seconds.    │
│                                     │
│     ■□□□□ Connecting                │
│     □□□□□ Analyzing                 │
│     □□□□□ Optimizing                │
│     □□□□□ Ready                     │
│                                     │
└─────────────────────────────────────┘
```

### Success State (Active)

```
┌─────────────────────────────────────┐
│                                     │
│        AI TRADING ASSISTANT         │
│                                     │
│     ┌─────────────────────────┐     │
│     │                         │     │
│     │      Status: ACTIVE     │     │
│     │      (glowing green)    │     │
│     │                         │     │
│     │   ████ ████ ████ ████  │     │
│     │   (pulsing bars)        │     │
│     │                         │     │
│     └─────────────────────────┘     │
│                                     │
│     Confidence     HIGH ●●●○        │
│     Mode           BALANCED         │
│     Environment    STABLE           │
│     Last Cycle     2 min ago        │
│     Next Cycle     ~15 min          │
│     (Pro shows: Cycles Today: 8)  │
│                                     │
│     "Your AI is monitoring          │
│      market conditions and          │
│      optimizing your returns."      │
│                                     │
└─────────────────────────────────────┘
```

---

## Deposit Flow States

### Empty State (No Bank Linked)

```
┌─────────────────────────────────────┐
│                                     │
│              DEPOSIT                │
│                                     │
│     ┌─────────────────────────┐     │
│     │                         │     │
│     │   🏦 Link a Bank First  │     │
│     │                         │     │
│     │   Connect your bank     │     │
│     │   account to make       │     │
│     │   deposits.             │     │
│     │                         │     │
│     │   [ CONNECT BANK ]      │     │
│     │                         │     │
│     └─────────────────────────┘     │
│                                     │
│     🔒 Secure & encrypted           │
│     via Plaid                       │
│                                     │
└─────────────────────────────────────┘
```

### Success State (Bank Linked)

```
┌─────────────────────────────────────┐
│                                     │
│              DEPOSIT                │
│                                     │
│     From: Chase Bank (...4521)      │
│     [ Change ]                      │
│                                     │
│     Quick Deposit                   │
│     ┌──────┐ ┌──────┐ ┌──────┐     │
│     │ $50  │ │ $100 │ │ $500 │     │
│     └──────┘ └──────┘ └──────┘     │
│                                     │
│     Custom Amount                   │
│     ┌─────────────────────────┐     │
│     │ $                       │     │
│     └─────────────────────────┘     │
│                                     │
│     Processing time: 1-2 days       │
│                                     │
│     [ CONTINUE ]                    │
│     (disabled until amount set)     │
│                                     │
└─────────────────────────────────────┘
```

### Processing State

```
┌─────────────────────────────────────┐
│                                     │
│              DEPOSIT                │
│                                     │
│     ┌─────────────────────────┐     │
│     │                         │     │
│     │   ⏳ Processing...      │     │
│     │                         │     │
│     │   $500.00               │     │
│     │   to Trading Platform       │     │
│     │                         │     │
│     │   ████████░░░░░░        │     │
│     │   (progress indicator)  │     │
│     │                         │     │
│     └─────────────────────────┘     │
│                                     │
│     Do not close this screen.       │
│                                     │
└─────────────────────────────────────┘
```

### Success State (Deposit Complete)

```
┌─────────────────────────────────────┐
│                                     │
│     ┌─────────────────────────┐     │
│     │                         │     │
│     │         ✓               │     │
│     │   (animated checkmark)  │     │
│     │                         │     │
│     │   Deposit Initiated     │     │
│     │                         │     │
│     │       $500.00           │     │
│     │   (glowing, large)      │     │
│     │                         │     │
│     └─────────────────────────┘     │
│                                     │
│     Expected arrival:               │
│     Dec 13-14, 2025                 │
│                                     │
│     Your AI will start working      │
│     as soon as funds arrive.        │
│                                     │
│     [ DONE ]                        │
│                                     │
└─────────────────────────────────────┘

Animation:
- Checkmark draws in (0.5s)
- Amount counts up from $0
- Subtle confetti burst
- Success haptic
```

### Error State (Deposit Failed)

```
┌─────────────────────────────────────┐
│                                     │
│     ┌─────────────────────────┐     │
│     │                         │     │
│     │         ✕               │     │
│     │   (red, subtle shake)   │     │
│     │                         │     │
│     │   Deposit Failed        │     │
│     │                         │     │
│     │   Insufficient funds    │     │
│     │   in your bank account. │     │
│     │                         │     │
│     └─────────────────────────┘     │
│                                     │
│     [ TRY DIFFERENT AMOUNT ]        │
│     [ CONTACT SUPPORT ]             │
│                                     │
└─────────────────────────────────────┘
```

---

## Subscription/Account States

### Current Tier Display

```
┌─────────────────────────────────────┐
│                                     │
│             ACCOUNT                 │
│                                     │
│     ┌─────────────────────────┐     │
│     │  🦅 Pro              │     │
│     │     Member since Dec 11│     │
│     │                         │     │
│     │  $15/month              │     │
│     │  Renews Jan 11, 2026    │     │
│     │                         │     │
│     │  [ MANAGE SUBSCRIPTION ]│     │
│     └─────────────────────────┘     │
│                                     │
│     Your Benefits:                  │
│     ✓ 4x faster AI cycles           │
│     ✓ Hourly balance updates        │
│     ✓ 30-day income history         │
│     ✓ Email support (24h)           │
│                                     │
│     [ UPGRADE TO ELITE ]            │
│                                     │
└─────────────────────────────────────┘
```

---

## State Coverage Checklist

| Screen | Empty | Loading | Error | Success | Offline |
|--------|-------|---------|-------|---------|---------|
| **Home** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Income** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **AI Status** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Auto-Invest** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Deposit** | ✅ | ✅ | ✅ | ✅ | N/A |
| **Withdraw** | ✅ | ✅ | ✅ | ✅ | N/A |
| **Account** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Onboarding** | N/A | ✅ | ✅ | ✅ | ✅ |

---

## Animation Specifications by State

### Loading → Success Transition

```typescript
// Transition from skeleton to content
const loadingToSuccess = {
  skeleton: {
    exit: {
      opacity: 0,
      duration: 200,
    },
  },
  content: {
    enter: {
      opacity: [0, 1],
      translateY: [10, 0],
      duration: 300,
      easing: 'ease-out',
      stagger: 50, // for list items
    },
  },
};
```

### Empty → Content Transition

```typescript
// When data arrives for first time
const emptyToContent = {
  emptyState: {
    exit: {
      opacity: 0,
      scale: 0.95,
      duration: 200,
    },
  },
  content: {
    enter: {
      opacity: [0, 1],
      scale: [0.95, 1],
      duration: 400,
      easing: 'spring',
    },
  },
};
```

### Success → Error Transition

```typescript
// When an error occurs
const successToError = {
  content: {
    exit: {
      opacity: 0.5,
      duration: 150,
    },
  },
  error: {
    enter: {
      opacity: [0, 1],
      translateX: [-5, 5, -3, 3, 0], // shake
      duration: 300,
    },
  },
};
```

---

**Status:** ✅ All states documented for key screens  
**Ready for:** Phase C (Information Architecture)



