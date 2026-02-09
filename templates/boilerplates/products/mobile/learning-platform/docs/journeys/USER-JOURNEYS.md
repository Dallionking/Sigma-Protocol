# Learning Platform — User Journeys

**Version:** 1.0 | **Date:** 2025-12-17  
**Status:** Approved  
**Primary Persona:** Adult English speaker (25-35), wants conversational skills  
**Animation Philosophy:** Quittr Cosmic + Cal AI Clean

---

## Journey Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    LEARNING PLATFORM USER JOURNEYS                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ONBOARDING           DAILY LEARNING            ENGAGEMENT              │
│  ──────────           ─────────────             ──────────              │
│  [Download]           [Open App]                [Book Session]          │
│      │                    │                          │                  │
│      ▼                    ▼                          ▼                  │
│  [First Open]         [Continue]                [Join Call]             │
│      │                    │                          │                  │
│      ▼                    ▼                          ▼                  │
│  [Select Goal]        [Lesson]                  [Learn Live]            │
│      │                    │                          │                  │
│      ▼                    ▼                          ▼                  │
│  [First Lesson]       [Practice]                [Celebrate]             │
│      │                    │                                             │
│      ▼                    ▼                                             │
│  [Fast Win! 🎯]       [AI Chat]                                         │
│                           │                                             │
│                           ▼                                             │
│                       [Streak! 🔥]                                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Primary Journey

The **Primary Journey** for this product is **Journey 1: First-Time User Onboarding** (activation + fast win).

---

## Journey 1: First-Time User Onboarding

### Goal
Transform curious downloader into engaged learner in **under 90 seconds**.

### Emotional Arc

```
EMOTION
   ↑
   │         😊 DELIGHT: First first success!
   │        ╱
   │       ╱
   │      ╱   😌 Relief: This is different
   │     ╱
   │────╱───────────────────────────────────────→
   │   ╱
   │  🤔 Skepticism: Is this another generic app?
   │
```

### Steps

| Step | Screen | Action | Emotion Target | Delight Moment |
|------|--------|--------|----------------|----------------|
| 1 | Splash | App opens | Anticipation | Cosmic fade-in animation |
| 2 | Welcome | See AI Tutor introduction | Trust | AI Tutor waving animation, warm greeting |
| 3 | Goal Selection | Choose learning goal | Ownership | Goals animate in with spring physics |
| 4 | Experience Level | Select current level | Validation | Level cards have icons, not just text |
| 5 | Why Learn? | Optional context | Connection | Skip option visible, no pressure |
| 6 | Quick Lesson | 30-second pronunciation | **FAST WIN 🎯** | Say "Hello" → AI Tutor celebrates! |
| 7 | Notification Ask | Enable reminders | Habit setup | Show streak preview |
| 8 | Home | Dashboard ready | Accomplishment | XP counter animates, lesson 1 ready |

### State Coverage

| State | Design |
|-------|--------|
| Loading | AI Tutor walking animation with "Preparing your journey..." |
| Error | AI Tutor confused + "Oops! Let's try that again" + Retry button |
| Offline | "Connect to continue — your progress is saved!" |

### Conversion Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Onboarding completion | >80% | Users who reach Home |
| Time to first success | <90 seconds | First correct pronunciation |
| Notification opt-in | >60% | Permission granted |

---

## Journey 2: Daily Learning Session

### Goal
Complete a lesson, practice with AI, maintain streak.

### Emotional Arc

```
EMOTION
   ↑
   │                       😊 DELIGHT: Streak extended!
   │                      ╱
   │     😊 Progress     ╱
   │    ╱               ╱
   │   ╱   😐 Effort   ╱
   │──╱───────╲───────╱─────────────────────────→
   │ ╱         ╲     ╱
   │╱           ╲   ╱
   │ 😴 Low energy ╲╱ 😤 Challenge (speaking exercise)
   │
```

### Steps

| Step | Screen | Action | Emotion Target | Delight Moment |
|------|--------|--------|----------------|----------------|
| 1 | Home | Open app | Return momentum | Streak counter animates, "Welcome back!" |
| 2 | Continue Lesson | Tap lesson card | Purpose | Card scales on press, smooth transition |
| 3 | Lesson Content | Read/listen | Learning | Audio auto-plays, lesson text highlighted |
| 4 | Vocabulary | Review words | Recognition | Cards flip with spring animation |
| 5 | Exercise (Quiz) | Answer questions | Challenge | Correct = green pulse, Wrong = gentle correction |
| 6 | Exercise (Speaking) | Pronounce phrase | Achievement | Real-time waveform, pronunciation score |
| 7 | Lesson Complete | See results | Pride | XP rains down, level progress ring animates |
| 8 | AI Practice | Chat with AI AI Tutor | Confidence | AI responds naturally, corrections inline |
| 9 | Streak Update | Daily complete | **DELIGHT 🔥** | Fire animation, streak count increments |

### State Coverage

| State | Design |
|-------|--------|
| Empty (No lessons) | "AI Tutor is preparing new lessons for you!" |
| Loading | Skeleton screens matching content layout |
| Error (Network) | "Can't load lesson — check your connection" + Retry |
| Error (AI) | "AI is thinking hard... Try again?" |
| Success | Confetti, XP animation, next lesson preview |
| Offline | "Downloaded lessons available" (future: offline mode) |

### Conversion Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Lesson completion | >70% | Users who finish lesson they start |
| AI practice engagement | >40% | Users who chat after lesson |
| Daily streak retention | >50% | Users who return within 24 hours |

---

## Journey 3: Booking & Live Session

### Goal
Schedule and complete a 1:1 call with AI Tutor.

### Emotional Arc

```
EMOTION
   ↑
   │                          😊 DELIGHT: Real conversation!
   │                         ╱
   │        😊 Excitement   ╱
   │       ╱               ╱
   │      ╱    😰 Nervous ╱
   │─────╱───────────╲───╱─────────────────────→
   │    ╱             ╲ ╱
   │   ╱               ╲
   │  😐 Browsing      😬 Call starts
   │
```

### Steps

| Step | Screen | Action | Emotion Target | Delight Moment |
|------|--------|--------|----------------|----------------|
| 1 | Schedule Tab | View calendar | Exploration | Available slots glow subtly |
| 2 | Select Slot | Tap time | Decision | Slot expands with confirmation preview |
| 3 | Confirm Booking | Review details | Commitment | "AI Tutor is excited to meet you!" |
| 4 | Booking Confirmed | See confirmation | Anticipation | Calendar invite animation, reminder set |
| 5 | Pre-Call (D-1) | Reminder notification | Preparation | "Your session is tomorrow!" |
| 6 | Pre-Call (H-1) | Open booking | Nervous excitement | "Prepare your questions" tips show |
| 7 | Join Call | Tap "Join" button | Courage | Button pulses, "AI Tutor is waiting..." |
| 8 | Video Call | In LiveKit room | Engagement | Clean UI, AI Tutor visible, chat available |
| 9 | Call Ends | Post-call screen | Accomplishment | Summary card, "You spoke for X minutes!" |
| 10 | Feedback | Rate session | Reflection | Star rating with haptic feedback |

### State Coverage

| State | Design |
|-------|--------|
| No Bookings | "Schedule your first call with AI Tutor!" + CTA |
| No Availability | "AI Tutor is fully booked this week — check next week!" |
| Loading Slots | Skeleton calendar grid |
| Call Connecting | AI Tutor avatar with pulse + "Connecting..." |
| Call Failed | "Connection lost — Reconnecting..." + auto-retry |
| Subscription Required | Paywall with benefits, "Unlock 1:1 Sessions" |

### Conversion Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Booking completion | >80% | Users who confirm after selecting slot |
| Call attendance | >90% | Users who join scheduled call |
| Post-call rating | >4.5 stars | Average session rating |

---

## Journey 4: AI Tutor Conversation

### Goal
Practice speaking with AI AI Tutor without judgment.

### Emotional Arc

```
EMOTION
   ↑
   │    😊 DELIGHT: "I just had a conversation with AI Tutor!"
   │   ╱
   │  ╱
   │ ╱     😊 Growing confidence
   │╱     ╱
│────────╱──────────────────────────────────→
   │    ╱
   │   ╱
   │  😬 Nervous to start
   │
```

### Steps

| Step | Screen | Action | Emotion Target | Delight Moment |
|------|--------|--------|----------------|----------------|
| 1 | Practice Tab | Open AI section | Curiosity | AI AI Tutor avatar animates |
| 2 | Mode Select | Choose chat mode | Control | Cards show mode benefits |
| 3 | Start Conversation | Send first message | Courage | Typing indicator is playful |
| 4 | AI Responds | Read response | Engagement | Response types in naturally |
| 5 | Correction (if any) | See inline fix | Learning | Correction is gentle, not harsh |
| 6 | Voice Mode | Tap mic button | Vulnerability | Waveform visualizes speech |
| 7 | AI Voice Response | Hear AI Tutor speak | **DELIGHT** | Voice is warm, natural (ElevenLabs) |
| 8 | Pronunciation Score | See feedback | Achievement | Score ring animates to value |
| 9 | End Session | Leave chat | Satisfaction | "Great practice! +50 XP" |

### State Coverage

| State | Design |
|-------|--------|
| Empty Chat | "Hello! What would you like to practice today?" |
| Loading Response | Typing indicator (three dots animation) |
| Error (AI Timeout) | "Thinking hard... Try a simpler message?" |
| Error (Voice) | "Couldn't hear you — tap to try again" |
| Tier Limit (Free) | "Upgrade to Essential for unlimited AI chat" |
| Offline | "AI AI Tutor needs internet to respond" |

### Conversion Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| AI session length | >5 messages | Average messages per session |
| Voice mode usage | >30% | Users who use microphone |
| Return to AI | >60% | Users who start 2nd session in week |

---

## Journey 5: Subscription Upgrade

### Goal
Convert free user to paid subscriber (Essential or Pro).

### Emotional Arc

```
EMOTION
   ↑
   │              😊 DELIGHT: Worth it!
   │             ╱
   │   😊 Value ╱
   │   seen    ╱
   │  ╱       ╱
   │─╱───────╱────────────────────────────────→
   │╱       ╱
   │       ╱
   │  😐 Skeptical    😤 Friction (payment)
   │
```

### Steps

| Step | Screen | Action | Emotion Target | Delight Moment |
|------|--------|--------|----------------|----------------|
| 1 | Hit Limit | Reach free tier limit | Frustration (minimal) | Gentle upsell, not aggressive block |
| 2 | Paywall | View pricing | Evaluation | Pricing cards are beautiful, not cluttered |
| 3 | Compare Tiers | Toggle Essential/Pro | Clarity | Feature comparison is visual (checkmarks) |
| 4 | Select Plan | Tap "Get [Tier]" | Decision | Plan card glows on selection |
| 5 | Confirm Purchase | RevenueCat modal | Commitment | Native iOS/Android UI (trust) |
| 6 | Success | Welcome back | **DELIGHT** | Celebration animation, "Welcome to [Tier]!" |
| 7 | New Features | Explore unlocked | Discovery | New features highlighted with "NEW" badges |

### State Coverage

| State | Design |
|-------|--------|
| Loading Prices | Skeleton pricing cards |
| Purchase Failed | "Payment didn't go through — try again?" |
| Already Subscribed | "You're on [Tier] — Thank you!" |
| Restore Purchases | Link visible for returning users |

### Conversion Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Paywall conversion | >5% | Free users who subscribe |
| Plan selection | Pro > Essential | Preferred plan distribution |
| Trial to paid | >40% | Trial users who convert |

---

## Funnel Overview (AARRR)

```
ACQUISITION          ACTIVATION          RETENTION          REVENUE          REFERRAL
─────────────        ──────────          ─────────          ───────          ────────
App Store            Onboarding          Daily open         Subscribe        Share
Download             Complete            Streak             Upgrade          Invite
     │                    │                  │                  │                │
     ▼                    ▼                  ▼                  ▼                ▼
[100%]               [80% target]       [50% D7]          [5% convert]     [10% refer]
     │                    │                  │                  │                │
     │                    │                  │                  │                │
     └────────────────────┴──────────────────┴──────────────────┴────────────────┘
```

| Stage | Key Metric | Target | Optimization |
|-------|------------|--------|--------------|
| Acquisition | App Store installs | N/A | ASO, paid ads |
| Activation | Onboarding completion | >80% | Fast win in <90 sec |
| Retention | D7 streak | >50% | Push notifications, streaks |
| Revenue | Free → Paid | >5% | Value before ask, soft paywall |
| Referral | Invite sends | >10% | "Learn together" feature |

---

## Friction Points & Mitigations

| Journey | Friction Point | Mitigation |
|---------|----------------|------------|
| Onboarding | Too many steps | Reduce to 5 screens, skip option |
| Onboarding | Account creation | Allow guest mode, ask for account later |
| Daily Learning | Lesson too long | Chunk into 5-minute segments |
| Daily Learning | Exercise too hard | Hint system, adaptive difficulty |
| AI Chat | Embarrassed to speak | Emphasize "no judgment" messaging |
| Booking | No available times | Waitlist option, "AI Tutor will notify you" |
| Upgrade | Price objection | Annual discount highlighted, trial offer |

---

## Success Metrics Summary

| Metric | Definition | Target |
|--------|------------|--------|
| **Time to First Value** | Download → First correct answer | <90 seconds |
| **Onboarding Rate** | Complete onboarding | >80% |
| **D1 Retention** | Return within 24 hours | >60% |
| **D7 Retention** | Active on day 7 | >50% |
| **D30 Retention** | Active on day 30 | >30% |
| **Lesson Completion** | Finish started lesson | >70% |
| **AI Engagement** | Use AI chat weekly | >40% |
| **Conversion Rate** | Free → Paid | >5% |
| **NPS** | Promoter score | >50 |

---

*User Journeys Version: 1.0*  
*Last Updated: 2025-12-17*

