# User Journeys — Trading Platform

**Date:** 2025-12-11  
**Step:** 3 — UX Design & Interface Planning  
**Framework:** Jobs-to-be-Done + Emotional Design

---

## Journey Overview

| Journey | Persona | Goal | Target Time | Delight Moment |
|---------|---------|------|-------------|----------------|
| **J1: First Investment** | Tech-Savvy Tyler | Download → Auto-Invest Active | <3 minutes | AI activation animation |
| **J2: Daily Check-In** | All Users | Open → See Progress → Close | <30 seconds | Income event notification |
| **J3: Tier Upgrade** | Engaged Users | Discover → Compare → Upgrade | <2 minutes | Premium UI unlock |
| **J4: Withdrawal** | All Users | Request → Confirm → Track | <1 minute | Clear timeline |

---

## Journey 1: First-Time Onboarding → First Investment

**Persona:** Tech-Savvy Tyler (Primary)  
**Job-to-be-Done:** "Help me start growing my money without learning anything"  
**Emotional Arc:** Curious → Impressed → Confident → Excited

### Step-by-Step Flow

| Step | Screen | User Action | System Response | Emotional State | Time |
|------|--------|-------------|-----------------|-----------------|------|
| 1 | Splash | Sees app icon, taps to open | Dark splash with subtle logo pulse | Curious | 0:00 |
| 2 | Welcome | Views welcome screen | "Trade Smarter. Execute Faster." tagline, neon glow | Intrigued | 0:05 |
| 3 | Auth | Taps "Get Started" | Shows Apple Sign-In + Email options | Neutral | 0:10 |
| 4 | Auth | Signs in with Apple (1 tap) | Account created, welcome animation | Impressed | 0:20 |
| 5 | Onboarding | Views value prop slides (optional) | 3 swipeable cards showing benefits | Interested | 0:35 |
| 6 | Bank Link | Taps "Connect Bank" | Plaid flow opens | Cautious | 0:45 |
| 7 | Bank Link | Selects bank, authenticates | Success animation, returns to app | Relieved | 1:15 |
| 8 | Deposit | Sees quick-deposit options | $50 / $100 / $500 / Custom buttons | Considering | 1:25 |
| 9 | Deposit | Selects amount, confirms | Processing → Success with confetti | Committed | 1:45 |
| 10 | Risk | Views risk options | Safe / Balanced / Aggressive with tooltips | Empowered | 2:00 |
| 11 | Risk | Selects "Balanced" | Visual feedback, glow intensifies | Confident | 2:10 |
| 12 | Activate | Taps "ACTIVATE THE PROTOCOL" | Epic activation sequence, AI status lights up | 🎉 **DELIGHT PEAK** | 2:30 |
| 13 | Home | Views dashboard | Balance glowing, AI pulsing "Active" | Excited | 2:45 |

### Delight Moment: AI Activation Sequence

```
Animation Sequence (2.5 seconds total):

1. Button tap → Haptic (medium impact)
2. Button glow intensifies (0.3s)
3. Screen dims slightly, focus on center
4. AI status bars animate in sequentially (0.5s)
5. "AI Trading Assistant: ACTIVE" text fades in
6. Subtle particle burst from center
7. Balance display pulses once with glow
8. Status: "Confidence: HIGH" appears
9. Final haptic (success)
```

### Friction Points & Mitigations

| Friction Point | Risk | Mitigation |
|----------------|------|------------|
| Plaid bank selection | User can't find bank | Search-first UI, "Other" option with manual entry |
| Deposit amount decision | Analysis paralysis | Preset amounts, "Start with $50" suggestion |
| Risk level confusion | Fear of wrong choice | Simple tooltips, "You can change anytime" messaging |
| Trust concerns | Drop-off before deposit | Security badges, "Your data is encrypted" messaging |

### Success Criteria

- [ ] Time from download to Auto-Invest: **<3 minutes**
- [ ] Drop-off rate at bank link: **<20%**
- [ ] Deposit completion rate: **>60%**
- [ ] Auto-Invest activation rate: **>80%** of depositors

---

## Journey 2: Daily Check-In

**Persona:** All active users  
**Job-to-be-Done:** "Show me my money grew without making me think"  
**Emotional Arc:** Neutral → Satisfied → Reassured

### Step-by-Step Flow

| Step | Screen | User Action | System Response | Emotional State | Time |
|------|--------|-------------|-----------------|-----------------|------|
| 1 | Home | Opens app | Face ID auth (instant) | Neutral | 0:00 |
| 2 | Home | Sees balance | Large green number with +$X.XX change | Satisfied | 0:02 |
| 3 | Home | Glances at AI status | Pulsing bars, "Active" indicator | Reassured | 0:05 |
| 4 | Home | Scrolls to income feed (optional) | Recent events: "+$12.31 — AI Cycle Complete" | Pleased | 0:15 |
| 5 | Home | Closes app | — | Content | 0:20 |

### Delight Moment: Positive Daily Change

```
When daily change is positive:

1. Balance displays with subtle glow
2. "+$X.XX" animates with count-up effect
3. Green arrow indicator
4. Optional: micro-confetti on first daily open

When daily change is negative:
1. Balance displays normally (no glow)
2. "-$X.XX" in muted red
3. "Environment: Volatile" status (no alarm)
4. Tooltip: "Markets fluctuate. Your AI is adapting."
```

### Success Criteria

- [ ] Time to view balance: **<3 seconds**
- [ ] D7 retention: **>50%**
- [ ] D30 retention: **>35%**
- [ ] Daily check-in rate: **>40%** of active users

---

## Journey 3: Tier Upgrade (Free → Pro)

**Persona:** Engaged user on Basic tier  
**Job-to-be-Done:** "Get more out of my investment without complexity"  
**Emotional Arc:** Curious → Convinced → Satisfied

### Step-by-Step Flow

| Step | Screen | User Action | System Response | Emotional State | Time |
|------|--------|-------------|-----------------|-----------------|------|
| 1 | Home/Income | Sees upgrade prompt | "Upgrade to Pro for 4x faster AI cycles" | Curious | 0:00 |
| 2 | Upgrade Modal | Taps "Learn More" | Tier comparison slides in from bottom | Interested | 0:05 |
| 3 | Comparison | Views feature comparison | Clear table: Basic vs Pro vs Elite | Evaluating | 0:30 |
| 4 | Comparison | Focuses on Pro (recommended) | Subtle highlight, "Most Popular" badge | Leaning | 0:45 |
| 5 | Purchase | Taps "Upgrade to Pro" | Apple Pay sheet appears | Committed | 1:00 |
| 6 | Purchase | Confirms with Face ID | Processing → Success | Relieved | 1:15 |
| 7 | Success | Sees confirmation | "Welcome to Pro" + feature unlock animation | 🎉 **DELIGHT** | 1:30 |
| 8 | Home | Returns to dashboard | Enhanced UI elements visible | Satisfied | 1:45 |

### Delight Moment: Pro Unlock

```
Animation Sequence:

1. "Welcome to Pro" text with glow
2. Pro badge animates into nav bar
3. AI status expands to show 6 stats (was 3)
4. "4x Faster AI Cycles Activated" message
5. Subtle UI enhancement (brighter glows, richer colors)
```

### Upgrade Triggers

| Trigger | Location | Timing |
|---------|----------|--------|
| Feature gate | Income history | When trying to view 30+ days |
| Performance nudge | AI status | After 5 successful cycles |
| Value reminder | Home | Weekly for Basic users |
| Comparison CTA | Account | Always visible |

---

## Journey 4: Withdrawal

**Persona:** All users  
**Job-to-be-Done:** "Get my money back quickly when I need it"  
**Emotional Arc:** Anxious → Informed → Reassured → Satisfied

### Step-by-Step Flow

| Step | Screen | User Action | System Response | Emotional State | Time |
|------|--------|-------------|-----------------|-----------------|------|
| 1 | Account | Taps "Withdraw" | Withdrawal screen slides up | Anxious | 0:00 |
| 2 | Withdraw | Views available balance | Clear display of withdrawable amount | Informed | 0:05 |
| 3 | Withdraw | Enters amount or "Withdraw All" | Real-time validation, bank destination shown | Deciding | 0:20 |
| 4 | Confirm | Reviews details | Amount, bank name, timeline (1-3 days) | Careful | 0:35 |
| 5 | Confirm | Taps "Confirm Withdrawal" | Face ID + confirmation animation | Committed | 0:45 |
| 6 | Success | Sees confirmation | "Withdrawal initiated" + estimated arrival | Reassured | 0:50 |
| 7 | Home | Returns to dashboard | Pending withdrawal badge visible | Informed | 1:00 |

### Trust Signals

| Signal | Implementation |
|--------|----------------|
| **No lock-up messaging** | "Withdraw anytime — your money is yours" |
| **Clear timeline** | "Arrives in 1-3 business days" with date range |
| **Bank confirmation** | Shows last 4 digits of linked account |
| **Progress tracking** | Status in Activity feed |

---

## Emotional Journey Maps

### Journey 1: First Investment

```
EMOTION
   ↑
   │         😊 AI Activated!
   │        ╱    (DELIGHT PEAK)
   │       ╱
   │      ╱  😊 Deposit Success
   │     ╱  ╱
   │    ╱  ╱    😊 Risk Selected
   │   ╱  ╱    ╱
   │  ╱  ╱    ╱
 ──┼─╱──╱────╱─────────────────→ Time
   │          ╲
   │           😟 Bank Link (friction)
   │               (but overcome quickly)
   │
```

### Journey 2: Daily Check-In

```
EMOTION
   ↑
   │    😊 Positive Change
   │   ╱ ╲
   │  ╱   ╲
 ──┼─╱─────╲───────────────→ Time
   │         ╲
   │          ╲ Neutral close
   │           ╲
   │
```

---

## AARRR Funnel Metrics

### Acquisition
| Metric | Target | Measurement |
|--------|--------|-------------|
| App Store conversion | 30% | Impressions → Downloads |
| Install to signup | 60% | Downloads → Account created |

### Activation
| Metric | Target | Measurement |
|--------|--------|-------------|
| Bank link completion | 80% | Signup → Bank linked |
| First deposit | 70% | Bank linked → Deposit made |
| Auto-Invest activation | 90% | Deposit → AI activated |
| **Time to activation** | **<3 min** | Download → AI active |

### Retention
| Metric | Target | Measurement |
|--------|--------|-------------|
| D1 retention | 70% | Return next day |
| D7 retention | 50% | Return within week |
| D30 retention | 35% | Return within month |
| Daily check-in rate | 40% | DAU / Total active |

### Revenue
| Metric | Target | Measurement |
|--------|--------|-------------|
| Free to paid conversion | 20% | Basic → Pro or Elite |
| Upgrade rate (30 days) | 15% | New users → Paid in 30d |
| ARPU | $14.50 | Total revenue / Users |
| LTV | $290 | 20-month average |

### Referral
| Metric | Target | Measurement |
|--------|--------|-------------|
| Share rate | 10% | Users who share |
| Referral conversion | 25% | Shared links → Signups |
| Viral coefficient | 0.3 | Referrals per user |

---

## Decision Points & Branches

### Risk Selection Decision Tree

```
User at Risk Selection
         │
         ▼
    ┌─────────────┐
    │ Show 3 options │
    │ with tooltips  │
    └─────────────┘
         │
    ┌────┴────┬────────┐
    ▼         ▼        ▼
  Safe    Balanced  Aggressive
   │         │         │
   │         │         │
   ▼         ▼         ▼
Tooltip:  Tooltip:   Tooltip:
"Steady   "Optimal   "Maximum
growth,   balance    growth,
minimal   of risk    higher
volatil-  and        volatil-
ity"      reward"    ity"
   │         │         │
   └────┬────┴────┬────┘
        │         │
        ▼         ▼
   [Confirm]   [Custom %]
        │         │
        ▼         ▼
  AI Configured  Slider UI
```

### Upgrade Decision Points

```
When to show upgrade prompts:

1. Feature gate hit
   → User tries to access Pro feature
   → Show comparison modal

2. Value delivered
   → After 5 successful AI cycles
   → "Get 4x faster with Pro"

3. Time-based
   → 7 days on Basic tier
   → Subtle home banner

4. Never during:
   → Onboarding
   → Withdrawal flow
   → Error states
```

---

## Approval Checkpoint: User Journeys

**Journeys Documented:**
- ✅ J1: First Investment (primary flow, <3 min target)
- ✅ J2: Daily Check-In (retention flow, <30 sec)
- ✅ J3: Tier Upgrade (monetization flow)
- ✅ J4: Withdrawal (trust-building flow)

**AARRR Metrics Defined:**
- ✅ Acquisition targets
- ✅ Activation targets (Time to activation: <3 min)
- ✅ Retention targets (D7: 50%, D30: 35%)
- ✅ Revenue targets (ARPU: $14.50, LTV: $290)
- ✅ Referral targets

**Delight Moments Identified:**
- ✅ AI Activation Sequence (Journey 1)
- ✅ Positive Daily Change (Journey 2)
- ✅ Pro Unlock Animation (Journey 3)

---

*Ready for Phase C: Information Architecture*



