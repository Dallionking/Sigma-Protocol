# Learning Platform — State Coverage

**Version:** 1.0 | **Date:** 2025-12-17  
**Requirement:** Every screen has 4 core states + optional offline state

---

## State Philosophy

> **"Every state is a design opportunity, not an afterthought."**

Empty states, loading states, and error states are often where users form their deepest impressions. These moments of vulnerability or waiting should delight, not frustrate.

### Core States (Mandatory)

| State | Purpose | Design Principle |
|-------|---------|------------------|
| **Empty** | No data yet | Encourage first action, show potential |
| **Loading** | Data fetching | Show progress, reduce perceived wait |
| **Error** | Something failed | Be helpful, not scary |
| **Success** | Data present | Celebrate achievements, enable actions |

### Optional States

| State | When Needed |
|-------|-------------|
| **Offline** | PWA/mobile with expected offline use |
| **Partial** | Paginated or streaming content |
| **Expired** | Session timeout, stale data |

---

## Empty States

All screens include an **Empty State** (first-run / no data yet). See each screen’s `#### Empty State` spec below.

## Loading States

All screens include a **Loading State** (skeletons preferred over spinners). See each screen’s `#### Loading State` spec below.

## Error States

All screens include an **Error State** (actionable copy + retry). See each screen’s `#### Error State` spec below.

---

## Screen-by-Screen State Coverage

### 1. Home Dashboard

**Route:** `/(tabs)/home`

#### Empty State
```
┌─────────────────────────────────────────┐
│                                         │
│       ┌─────────────────────────┐       │
│       │    [AI Tutor waving 👋]     │       │
│       │    (Lottie animation)   │       │
│       └─────────────────────────┘       │
│                                         │
│    "Welcome to Learning Platform!"   │
│                                         │
│    Your learning journey starts here.   │
│    Let's unlock your first lesson!      │
│                                         │
│       ┌─────────────────────────┐       │
│       │   Start Your Journey    │       │
│       │   (Primary Button)      │       │
│       └─────────────────────────┘       │
│                                         │
└─────────────────────────────────────────┘
```
- **Illustration:** AI Tutor waving with sparkles
- **Headline:** "Welcome to Learning Platform!"
- **Subtext:** "Your learning journey starts here."
- **CTA:** "Start Your Journey" → Goes to first lesson

#### Loading State
```
┌─────────────────────────────────────────┐
│  [Skeleton: User greeting bar]          │
│  ┌─────────────────────────────────┐    │
│  │ [Shimmer: Progress ring]        │    │
│  │ [Shimmer: Streak counter]       │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [Skeleton: "Continue Learning" card]   │
│  ┌─────────────────────────────────┐    │
│  │ [Shimmer effect]                │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [Skeleton: Recent lessons list]        │
│  ┌─────────────────────────────────┐    │
│  │ [Shimmer]                       │    │
│  │ [Shimmer]                       │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```
- **Pattern:** Skeleton screens matching exact layout
- **Library:** Moti Skeleton with shimmer
- **Duration:** Show for <3 seconds, then show timeout message

#### Error State
```
┌─────────────────────────────────────────┐
│                                         │
│       ┌─────────────────────────┐       │
│       │  [AI Tutor confused 🤔]     │       │
│       │  (Static illustration)  │       │
│       └─────────────────────────┘       │
│                                         │
│      "Couldn't load your progress"      │
│                                         │
│   Check your internet connection and    │
│           try again.                    │
│                                         │
│       ┌─────────────────────────┐       │
│       │      Try Again          │       │
│       │   (Primary Button)      │       │
│       └─────────────────────────┘       │
│                                         │
│          Need help? Contact us          │
│                                         │
└─────────────────────────────────────────┘
```
- **Illustration:** AI Tutor confused but friendly
- **Headline:** "Couldn't load your progress"
- **Subtext:** Actionable help text
- **Primary CTA:** "Try Again"
- **Secondary:** "Need help?" link

#### Success State
```
┌─────────────────────────────────────────┐
│  Good morning, Alex! 👋                 │
│                                         │
│  ┌────────────────────────────────────┐ │
│  │ [XP Ring]  [Streak Fire 🔥]        │ │
│  │  1,250 XP     7 days               │ │
│  │  Level 3      Keep going!          │ │
│  └────────────────────────────────────┘ │
│                                         │
│  Continue Learning                      │
│  ┌────────────────────────────────────┐ │
│  │ [Lesson Card]                      │ │
│  │ Greetings & Introductions          │ │
│  │ ▓▓▓▓▓▓▓░░░ 70%                     │ │
│  └────────────────────────────────────┘ │
│                                         │
│  Recent Lessons                         │
│  ┌────────────────────────────────────┐ │
│  │ [Completed] ✓ Basic Phrases        │ │
│  │ [In Progress] Numbers 1-100        │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```
- **Personalization:** User name in greeting
- **Gamification:** XP ring animates, streak shows fire
- **Clear CTA:** Continue lesson is prominent
- **Progress visibility:** Percentage shown on cards

---

### 2. Lessons List

**Route:** `/(tabs)/learn`

#### Empty State
```
┌─────────────────────────────────────────┐
│                                         │
│       ┌─────────────────────────┐       │
│       │  [AI Tutor building 🏗️]    │       │
│       │  (Lottie animation)     │       │
│       └─────────────────────────┘       │
│                                         │
│    "Lessons are being prepared!"        │
│                                         │
│    AI Tutor is creating new content         │
│    just for you. Check back soon!       │
│                                         │
│       ┌─────────────────────────┐       │
│       │   Notify Me When Ready  │       │
│       │   (Secondary Button)    │       │
│       └─────────────────────────┘       │
│                                         │
└─────────────────────────────────────────┘
```
- **Illustration:** AI Tutor building/crafting
- **Tone:** Optimistic, not apologetic
- **CTA:** "Notify Me" for engagement

#### Loading State
- Skeleton cards matching lesson card layout
- Category headers visible (not skeleton)
- Shimmer effect on cards

#### Error State
- "Couldn't load lessons"
- Network check hint
- Retry button

#### Success State (Content Loaded)
```
┌─────────────────────────────────────────┐
│  Learn                                  │
│  ─────────────────────────────────────  │
│                                         │
│  FOUNDATIONS                            │
│  ┌────────────────────────────────────┐ │
│  │ ✓ Greetings & Intros      10 min  │ │
│  │ ▶ Numbers & Counting       8 min  │ │
│  │ 🔒 Days & Months          12 min  │ │
│  └────────────────────────────────────┘ │
│                                         │
│  CONVERSATIONS                          │
│  ┌────────────────────────────────────┐ │
│  │ 🔒 At the Restaurant      15 min  │ │
│  │ 🔒 Making Friends         10 min  │ │
│  └────────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```
- **Progress indicators:** Checkmark, play icon, lock icon
- **Duration visible:** Set expectations
- **Locked content:** Shows value, encourages upgrade

---

### 3. Lesson Detail / Player

**Route:** `/lessons/[id]`

#### Empty State
- N/A (lesson always has content if it exists)

#### Loading State
```
┌─────────────────────────────────────────┐
│  ←  [Skeleton: Title]                   │
│                                         │
│  ┌────────────────────────────────────┐ │
│  │ [Shimmer: Audio waveform]          │ │
│  └────────────────────────────────────┘ │
│                                         │
│  [Shimmer: Content block]               │
│  [Shimmer: Content block]               │
│  [Shimmer: Content block]               │
│                                         │
│  ┌────────────────────────────────────┐ │
│  │ [Shimmer: Continue button]         │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

#### Error State
- "Couldn't load this lesson"
- "Try again" button
- "Go back" secondary option

#### Success State
- Full lesson content visible
- Audio player functional
- Progress bar at top
- Next/Previous navigation

#### Offline State (If Downloaded)
```
┌─────────────────────────────────────────┐
│  ←  Greetings & Introductions  📥       │
│      (Downloaded for offline)           │
│                                         │
│  [Lesson content loads from cache]      │
│                                         │
│  ⚠️ Some features require internet:     │
│     • Pronunciation feedback            │
│     • AI practice                       │
│                                         │
└─────────────────────────────────────────┘
```

---

### 4. Exercise Screen

**Route:** `/lessons/[id]/exercise/[index]`

#### Loading State
- Skeleton question card
- Shimmer on answer options

#### Error State
- "Couldn't load exercise"
- Skip option + Retry

#### Answer States

**Unanswered:**
```
┌─────────────────────────────────────────┐
│  ←  2/10                     ❤️ ❤️ ❤️   │
│                                         │
│  What does "synthesis" mean?          │
│                                         │
│  ┌────────────────────────────────────┐ │
│  │  ○  Good night                     │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │  ○  Good morning                   │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │  ○  Goodbye                        │ │
│  └────────────────────────────────────┘ │
│                                         │
│  ┌────────────────────────────────────┐ │
│  │        Check Answer                │ │
│  │        (Disabled)                  │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Correct Answer:**
```
┌─────────────────────────────────────────┐
│  ←  2/10                     ❤️ ❤️ ❤️   │
│                                         │
│  What does "synthesis" mean?          │
│                                         │
│  ┌────────────────────────────────────┐ │
│  │  ○  Good night                     │ │
│  └────────────────────────────────────┘ │
│  ┌─────────────GREEN GLOW─────────────┐ │
│  │  ✓  Good morning                   │ │  ← Selected + Correct
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │  ○  Goodbye                        │ │
│  └────────────────────────────────────┘ │
│                                         │
│  ┌───────GREEN BACKGROUND─────────────┐ │
│  │  ✓  Correct! +5 XP                 │ │
│  │        Continue                    │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```
- **Feedback:** Green glow on correct option
- **Animation:** Subtle confetti, haptic tap
- **Bottom bar:** Green, shows XP earned

**Incorrect Answer:**
```
┌─────────────────────────────────────────┐
│  ←  2/10                     ❤️ ❤️ ░   │  ← Heart lost
│                                         │
│  What does "synthesis" mean?          │
│                                         │
│  ┌─────────────RED BORDER─────────────┐ │
│  │  ✗  Good night                     │ │  ← User's wrong choice
│  └────────────────────────────────────┘ │
│  ┌────────────GREEN GLOW──────────────┐ │
│  │  ✓  Good morning                   │ │  ← Correct answer shown
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │  ○  Goodbye                        │ │
│  └────────────────────────────────────┘ │
│                                         │
│  ┌───────ERROR BACKGROUND─────────────┐ │
│  │  Almost! The correct answer is     │ │
│  │        Continue                    │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```
- **Feedback:** Red border on wrong choice, green on correct
- **Tone:** Encouraging ("Almost!"), not punishing
- **Explanation:** Brief, helpful

---

### 5. AI Chat

**Route:** `/ai-tutor`

#### Empty State (New Conversation)
```
┌─────────────────────────────────────────┐
│  ←  AI Tutor                    │
│                                         │
│       ┌─────────────────────────┐       │
│       │  [AI Tutor avatar 🎓]       │       │
│       │  (Breathing animation)  │       │
│       └─────────────────────────┘       │
│                                         │
│   "Hello! I'm your AI Tutor."   │
│                                         │
│   Ask me anything about the subject, or     │
│   let's have a conversation!            │
│                                         │
│   Quick starters:                       │
│   ┌─────────────┐ ┌──────────────────┐  │
│   │ Greet me!   │ │ Teach me slang   │  │
│   └─────────────┘ └──────────────────┘  │
│   ┌─────────────┐ ┌──────────────────┐  │
│   │ Grammar Q   │ │ Random vocab     │  │
│   └─────────────┘ └──────────────────┘  │
│                                         │
│  ┌────────────────────────────────────┐ │
│  │ Type a message...            🎤   │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```
- **Illustration:** AI Tutor avatar with subtle animation
- **Quick starters:** Reduce blank page anxiety
- **Voice option:** Mic button visible

#### Loading State (AI Thinking)
```
┌─────────────────────────────────────────┐
│  ...                                    │
│  [User message bubble]                  │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  [AI Tutor avatar]                  │    │
│  │  ● ● ●  (typing animation)      │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```
- **Animation:** Three-dot typing indicator
- **Timeout:** After 10 seconds, show "Still thinking..."

#### Error State
```
┌─────────────────────────────────────────┐
│  [Conversation history]                 │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  [AI Tutor avatar]                  │    │
│  │  "I got a bit confused.         │    │
│  │   Could you try rephrasing?"    │    │
│  │                                 │    │
│  │  [Retry] [Ask differently]      │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```
- **Tone:** AI Tutor takes responsibility, not user
- **Options:** Retry or try different approach

#### Tier Limit Reached (Free)
```
┌─────────────────────────────────────────┐
│  [Conversation so far...]               │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  [AI Tutor avatar]                  │    │
│  │  "Great practice today!         │    │
│  │   You've used your 10 free      │    │
│  │   messages. Upgrade to keep     │    │
│  │   chatting!"                    │    │
│  │                                 │    │
│  │  ┌─────────────────────────┐    │    │
│  │  │  Upgrade to Essential   │    │    │
│  │  │  Unlimited AI Chat      │    │    │
│  │  └─────────────────────────┘    │    │
│  │                                 │    │
│  │  Come back tomorrow for 10 more │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```
- **Friendly:** Not a hard wall, AI Tutor explains
- **Value prop:** Shows what's unlocked
- **Alternative:** Return tomorrow for free users

---

### 6. Booking / Schedule

**Route:** `/(tabs)/schedule`

#### Empty State (No Bookings)
```
┌─────────────────────────────────────────┐
│                                         │
│       ┌─────────────────────────┐       │
│       │  [Calendar with ✨]     │       │
│       │  (Lottie animation)     │       │
│       └─────────────────────────┘       │
│                                         │
│    "No sessions scheduled yet"          │
│                                         │
│    Book a live session with AI Tutor        │
│    and take your skills to the         │
│    next level!                          │
│                                         │
│       ┌─────────────────────────┐       │
│       │   Book Your First Call  │       │
│       │   (Primary Button)      │       │
│       └─────────────────────────┘       │
│                                         │
│   ┌───────────────────────────────────┐ │
│   │ 🎥 1:1 with AI Tutor • 30 minutes    │ │
│   │ 👥 Group Class • 45 minutes      │ │
│   └───────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

#### Loading State
- Skeleton calendar grid
- Shimmer on time slots

#### No Availability State
```
┌─────────────────────────────────────────┐
│                                         │
│       ┌─────────────────────────┐       │
│       │  [AI Tutor busy 📚]         │       │
│       └─────────────────────────┘       │
│                                         │
│    "AI Tutor is fully booked this week!"    │
│                                         │
│    New slots open every Monday.         │
│    Get notified when available?         │
│                                         │
│       ┌─────────────────────────┐       │
│       │      Notify Me          │       │
│       │   (Primary Button)      │       │
│       └─────────────────────────┘       │
│                                         │
│       ← Check next week →               │
│                                         │
└─────────────────────────────────────────┘
```

#### Success State (Has Bookings)
```
┌─────────────────────────────────────────┐
│  Schedule                               │
│                                         │
│  UPCOMING                               │
│  ┌────────────────────────────────────┐ │
│  │ 🎥 1:1 with AI Tutor                   │ │
│  │ Thursday, Dec 19 • 3:00 PM EST     │ │
│  │ [Add to Calendar] [Join Call]      │ │
│  └────────────────────────────────────┘ │
│                                         │
│  PAST SESSIONS                          │
│  ┌────────────────────────────────────┐ │
│  │ ✓ 1:1 with AI Tutor • Dec 12           │ │
│  │ ⭐⭐⭐⭐⭐ "Great session!"          │ │
│  └────────────────────────────────────┘ │
│                                         │
│  ┌────────────────────────────────────┐ │
│  │   + Book Another Session           │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

### 7. Profile / Settings

**Route:** `/(tabs)/profile`

#### Loading State
- Skeleton avatar + name
- Shimmer on stats cards

#### Error State
- "Couldn't load your profile"
- Retry with cached data fallback

#### Success State
```
┌─────────────────────────────────────────┐
│  Profile                                │
│                                         │
│  ┌────────────────────────────────────┐ │
│  │      [Avatar photo]                │ │
│  │      Alex Rodriguez                │ │
│  │      Member since Dec 2025         │ │
│  │      Essential Plan                │ │
│  └────────────────────────────────────┘ │
│                                         │
│  STATS                                  │
│  ┌────────────────────────────────────┐ │
│  │ 🔥 7 day streak                    │ │
│  │ ⭐ 1,250 XP • Level 3              │ │
│  │ 📚 12 lessons completed            │ │
│  │ 🎯 85% quiz accuracy               │ │
│  └────────────────────────────────────┘ │
│                                         │
│  SETTINGS                               │
│  ┌────────────────────────────────────┐ │
│  │ Notifications                   →  │ │
│  │ Subscription                    →  │ │
│  │ Help & Support                  →  │ │
│  │ Sign Out                           │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## Animation Guidelines for States

### Loading → Success Transition
```typescript
// Skeleton fades out, content fades in with stagger
const transition = {
  type: 'spring',
  damping: 15,
  stiffness: 100,
  staggerChildren: 50,
};
```

### Error Appearance
```typescript
// Gentle fade + slide up
const errorTransition = {
  opacity: [0, 1],
  translateY: [10, 0],
  duration: 300,
};
```

### Success Celebration
```typescript
// XP counter: spring count-up
// Confetti: particle burst from center
// Haptic: success pattern
```

---

## Accessibility for States

| State | Screen Reader | Focus |
|-------|---------------|-------|
| Loading | "Loading content, please wait" | Focus stays in place |
| Error | "Error: [message]. Retry button available" | Focus moves to retry |
| Empty | "[Description]. [CTA] button available" | Focus on primary CTA |
| Success | Content announces normally | Focus on first interactive |

---

*State Coverage Version: 1.0*  
*Last Updated: 2025-12-17*

