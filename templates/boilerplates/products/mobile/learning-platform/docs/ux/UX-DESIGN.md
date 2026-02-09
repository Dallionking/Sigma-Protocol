# Learning Platform — UX Design Specification

**Version:** 1.0 | **Date:** 2025-12-17  
**Platform:** iOS & Android (Expo)  
**Design Philosophy:** Dark Gradient — Warm, Immersive, Culturally Rich

---

## Design Principles

### The Three Levels of Emotional Design (Don Norman)

Every screen and interaction is designed at all three levels:

| Level | Application in Learning Platform |
|-------|-------------------------------------|
| **Visceral** | First impression is warm, vibrant, inviting — not sterile or generic. Dark gradients with indigo/teal accents feel premium and distinctive. |
| **Behavioral** | Every tap responds in <100ms. Spring physics make interactions feel alive. Progress is always visible. Errors are helpful, not scary. |
| **Reflective** | Users feel accomplished ("I completed a lesson today!"), part of a community, and connected to the brand experience. Learning feels like a journey, not a chore. |

### Core Principles

1. **Progress Over Perfection**
   - Show XP, streaks, completion percentages everywhere
   - Celebrate small wins (every correct answer, every lesson)
   - Never punish — guide and encourage

2. **Culture as Context**
   - the subject isn't just grammar — it's connection
   - dark gradient warmth in every interaction
   - AI Tutor's personality makes learning human

3. **Speed is Respect**
   - <90 seconds to first value (Fast Win)
   - Skeleton screens, not spinners
   - Instant feedback on every action

4. **Delight in Details**
   - Every state is designed (empty, loading, error, success)
   - Micro-interactions on every touch point
   - Sounds and haptics enhance, not distract

5. **Accessibility is Default**
   - WCAG 2.2 AA compliance
   - Touch targets 44×44pt minimum
   - VoiceOver/TalkBack tested
   - Reduced motion respected

---

## User Personas

### Primary Persona: "The Reconnector"

**Name:** Maria  
**Age:** 28  
**Occupation:** Marketing Manager  
**Location:** Miami, FL  
**Language Background:** Heritage speaker — understands the subject from family but can't speak it fluently

**Pain Points:**
- Embarrassed to speak — scared of sounding "dumb"
- Current apps feel robotic and inauthentic
- Doesn't have time for long lessons
- Wants real conversation, not just vocabulary drills

**Goals:**
- Order at a restaurant in the subject in 30 days
- Have a real conversation in 90 days
- Connect with her heritage and community

**Quote:** *"I understand the basics, but I freeze when I try to apply what I've learned."*

### Secondary Persona: "The Traveler"

**Name:** James  
**Age:** 35  
**Occupation:** Software Engineer  
**Location:** Austin, TX  
**Language Background:** Complete beginner

**Pain Points:**
- Tried Duolingo but got bored
- Wants to learn for an upcoming trip to Mexico
- Needs practical phrases, not textbook grammar
- Prefers visual/audio learning over reading

**Goals:**
- Basic survival phrases before his trip (8 weeks)
- Understand menus and signs
- Make a good impression with locals

**Quote:** *"I want to be able to say more than 'una cerveza, por favor.'"*

### Tertiary Persona: "The Committed Learner"

**Name:** Sarah  
**Age:** 42  
**Occupation:** Teacher  
**Location:** Chicago, IL  
**Language Background:** Intermediate — took the subject in high school

**Pain Points:**
- Plateaued at intermediate level
- Wants advanced grammar and slang
- Needs speaking practice with feedback
- Looking for structured curriculum

**Goals:**
- Achieve conversational fluency
- Understand movies without subtitles
- Help the subject-speaking students at work

**Quote:** *"I know the basics, but I want to sound natural, not like a textbook."*

---

## Information Architecture

### Navigation Model: Hub-and-Spoke with Bottom Tabs

```
┌─────────────────────────────────────────────────────────────┐
│                        TAB BAR                               │
│  ┌─────────┬─────────┬─────────┬─────────┬─────────┐        │
│  │  Home   │  Learn  │Practice │Schedule │ Profile │        │
│  └─────────┴─────────┴─────────┴─────────┴─────────┘        │
└─────────────────────────────────────────────────────────────┘
         │           │          │          │          │
         ▼           ▼          ▼          ▼          ▼
    Dashboard    Lessons    AI Tutor   Booking    Settings
         │           │          │          │          │
         │           ▼          ▼          ▼          ▼
         │      Lesson     Voice Mode   Calendar   Subscription
         │      Detail                  Slots
         │           │                     │
         │           ▼                     ▼
         │      Exercise               Video Call
         │           │
         │           ▼
         │      Results
         │
         └──────────────────────────────────────────────────────
                        (Quick access from Home)
```

### Tab Structure

| Tab | Purpose | Key Screens |
|-----|---------|-------------|
| **Home** | Dashboard, quick resume | Progress cards, continue lesson, streak |
| **Learn** | Browse & complete lessons | Category list, lesson list, lesson player, exercises |
| **Practice** | AI conversation & speaking | Mode select, chat, voice, pronunciation |
| **Schedule** | Book & manage sessions | Availability, booking confirm, video call |
| **Profile** | Settings & account | Stats, subscription, settings |

### Deep Linking Structure

```
learning-platform://                    → Home
learning-platform://lesson/{id}         → Lesson detail
learning-platform://lesson/{id}/ex/{n}  → Exercise
learning-platform://chat                → AI Chat
learning-platform://booking/{id}        → Booking detail
learning-platform://subscribe           → Paywall
```

### Progressive Disclosure

| Level | Content | When Visible |
|-------|---------|--------------|
| 1 | Main tabs, primary actions | Always |
| 2 | Lesson content, exercise types | On navigation |
| 3 | Advanced settings, history | On explicit request |
| 4 | Debug/developer options | Hidden, gesture-activated |

---

## Conversion Optimization

### Fast Win Requirement (≤90 seconds)

**Goal:** User says their first first concept and feels successful within 90 seconds of opening the app.

**Flow:**
1. App opens (0 sec)
2. Welcome screen with AI Tutor (5 sec)
3. Goal selection (15 sec)
4. Level selection (25 sec)
5. Quick first exercise: complete first challenge (60 sec)
6. AI Tutor celebrates, XP earned (90 sec) ✅

### Outcome-Based CTAs

| Screen | Bad CTA ❌ | Good CTA ✅ |
|--------|-----------|-------------|
| Onboarding | "Start" | "Start Learning effectively" |
| Lesson complete | "Continue" | "Unlock Next Lesson" |
| Paywall | "Subscribe" | "Get Unlimited Practice" |
| AI Chat | "Send" | "Practice Now" (initial) |
| Booking | "Book" | "Reserve Your Spot" |

### 2-Step Opt-In Pattern

**When to use:** Account creation, subscription

**Step 1:** Low commitment button
- "Yes, I want to learn effectively!" (big, inviting)

**Step 2:** Reveal minimal form
- Email only (social auth buttons prominent)
- "No spam. Cancel anytime."
- Social proof: "1,847 people started learning this week"

### Trust Signals

| Location | Trust Signal |
|----------|--------------|
| Paywall | "Join 10,000+ learners" |
| Paywall | "90-Day Confidence Guarantee" |
| Booking | "4.9★ average session rating" |
| AI Chat | "Powered by advanced AI" |
| Footer | App Store rating badge |

### Friction Analysis

| Friction Point | Current | Target | Solution |
|----------------|---------|--------|----------|
| Account creation | 5 fields | 1 field | Email only, social auth |
| First lesson | 3 taps | 1 tap | "Start Learning" on home |
| Upgrade prompt | Aggressive | Gentle | Show value first, soft paywall |
| Booking flow | 4 screens | 2 screens | Inline calendar + confirm |

---

## 5. Interface Patterns

### Touch Targets

| Element | Size | Platform Notes |
|---------|------|----------------|
| Buttons | 44×44pt minimum | iOS/Android standard |
| List items | 48pt height | Comfortable tapping |
| Icons | 24×24pt | With 44×44pt touch area |
| Tab bar items | 49pt height | iOS default |

### Gesture Patterns

| Gesture | Action | Screen |
|---------|--------|--------|
| Tap | Primary action | All buttons, cards |
| Long press | Secondary menu | Lesson card (download) |
| Swipe left | Delete / dismiss | Notifications, messages |
| Swipe right | Complete / mark done | Vocabulary cards |
| Pull down | Refresh | Lists, dashboard |
| Pinch | Zoom | Images only |

### Feedback Patterns

| Action | Visual | Haptic | Audio |
|--------|--------|--------|-------|
| Button press | Scale 0.95 | Light tap | None |
| Correct answer | Green glow | Success pattern | Soft "ding" |
| Wrong answer | Red border | Error pattern | Soft "thud" |
| XP earned | Number flies up | Medium tap | Coin sound |
| Streak fire | Flame animation | Heavy tap | Whoosh |
| Lesson complete | Confetti burst | Success | Celebration |

### Loading Patterns

| Pattern | Use Case | Implementation |
|---------|----------|----------------|
| Skeleton | List screens, cards | Moti.Skeleton with shimmer |
| Inline spinner | Button loading | Replace text with spinner |
| Progress bar | Long operations | Determinate if possible |
| Typing indicator | AI response | Three-dot animation |

### Empty State Patterns

| Type | Illustration | Headline | CTA |
|------|--------------|----------|-----|
| First use | AI Tutor waving | "Let's start your journey!" | "Begin Learning" |
| No results | AI Tutor searching | "No lessons match your filter" | "Clear Filters" |
| No bookings | Calendar sparkle | "Book your first session!" | "See Availability" |
| No achievements | Trophy case | "Earn your first badge!" | "Start a Lesson" |

---

## 6. Accessibility Requirements

### WCAG 2.2 Level AA Compliance

#### Perceivable

| Requirement | Implementation |
|-------------|----------------|
| Text contrast | 4.5:1 minimum (7:1 for small text) |
| Non-text contrast | 3:1 for UI components |
| Alt text | All images have descriptive alt |
| Captions | Video content has captions |
| Audio descriptions | Lesson audio has transcripts |

#### Operable

| Requirement | Implementation |
|-------------|----------------|
| Keyboard nav | Full functionality via keyboard |
| Focus visible | 2px outline on focused elements |
| Skip links | "Skip to main content" on all screens |
| Touch targets | 44×44pt minimum |
| Timing | Adjustable timers for exercises |
| Motion | Respect `prefers-reduced-motion` |

#### Understandable

| Requirement | Implementation |
|-------------|----------------|
| Language | Page language declared (en) |
| Labels | All inputs have visible labels |
| Error ID | Errors identified in text, not just color |
| Consistency | Navigation consistent across screens |
| Help | Help text available for complex inputs |

#### Robust

| Requirement | Implementation |
|-------------|----------------|
| Valid markup | Semantic components used |
| ARIA | Landmarks, labels, live regions |
| Status messages | Live regions for dynamic content |

### Screen Reader Support

```typescript
// Example accessible button
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Start learning the subject"
  accessibilityHint="Begins your first lesson"
  accessibilityRole="button"
>
  <Text>Start Learning</Text>
</TouchableOpacity>
```

### Color Blind Friendly

- Never rely on color alone for information
- Use icons alongside colored indicators
- Green/red contrast enhanced (not pure green/red)
- Pattern option for charts (future)

### Reduced Motion

```typescript
// Check preference and adapt
const prefersReducedMotion = useReducedMotion();

const animationConfig = prefersReducedMotion 
  ? { duration: 0 }
  : { type: 'spring', damping: 15 };
```

---

## 7. Mobile Design

### Platform: Expo (iOS + Android)

Since this is a React Native app, not web, focus is on native mobile patterns.

### iOS Conventions (Human Interface Guidelines)

| Element | iOS Style |
|---------|-----------|
| Navigation | Large titles, swipe-back gesture |
| Tab bar | SF Symbols, 49pt height |
| Sheets | Presentable as cards, swipe to dismiss |
| Haptics | UIFeedbackGenerator patterns |
| Fonts | SF Pro as fallback |

### Android Conventions (Material Design 3)

| Element | Android Style |
|---------|---------------|
| Navigation | Top app bar, predictive back |
| Tab bar | Bottom navigation with labels |
| Sheets | Bottom sheets, edge-to-edge |
| Haptics | VibrationEffect patterns |
| Fonts | Roboto as fallback |

### Safe Areas

```typescript
// Always respect safe areas
import { SafeAreaView } from 'react-native-safe-area-context';

<SafeAreaView edges={['top', 'bottom']}>
  {/* Content */}
</SafeAreaView>
```

### Orientation

- **Primary:** Portrait only
- **Exception:** Video call screen supports landscape

### Dark Mode

- **Default:** Dark (Dark Gradient theme)
- **Light option:** Available in settings
- **System:** Respect system preference option

---

## 8. Animation Philosophy

### Chosen Style: Quittr Cosmic + Cal AI Clean

| Animation | Use Case | Library |
|-----------|----------|---------|
| Spring physics | All transitions | Reanimated 3 |
| Fade + slide | Screen entry | Moti |
| Progress rings | XP, completion | SVG animation |
| Confetti | Celebration | react-native-confetti |
| Lottie | Complex illustrations | lottie-react-native |
| Haptics | Feedback | expo-haptics |

### Timing Guidelines

| Animation | Duration | Easing |
|-----------|----------|--------|
| Micro-feedback | 100ms | Linear |
| Button press | 150ms | Spring (snappy) |
| Card appearance | 300ms | Spring (gentle) |
| Screen transition | 350ms | Spring |
| Celebration | 800ms | Spring (bouncy) |

### Required Animations

1. **Onboarding:** Staggered card entrance
2. **Lesson card:** Press scale + glow on tap
3. **XP counter:** Animated count-up
4. **Streak fire:** Lottie flame animation
5. **Correct answer:** Green pulse + mini confetti
6. **Lesson complete:** Full celebration sequence
7. **AI typing:** Breathing dots
8. **Progress ring:** SVG stroke animation

---

## 9. Testing & Validation

### Usability Testing Plan

| Test | Method | Participants | Metrics |
|------|--------|--------------|---------|
| Onboarding flow | Moderated remote | 5 users | Time to complete, drop-off points |
| Lesson completion | Unmoderated | 10 users | Completion rate, errors |
| AI chat | Think-aloud | 5 users | Engagement, confusion points |
| Booking flow | Task-based | 5 users | Success rate, time on task |

### A/B Testing Opportunities

| Element | Variant A | Variant B | Metric |
|---------|-----------|-----------|--------|
| Paywall timing | After 3 lessons | After 5 lessons | Conversion rate |
| CTA copy | "Start Learning" | "Learn effectively Today" | Tap rate |
| Streak notification | 9 AM | Based on past activity | Open rate |
| Onboarding length | 5 screens | 3 screens | Completion rate |

### Accessibility Testing

| Tool | Purpose |
|------|---------|
| VoiceOver (iOS) | Screen reader testing |
| TalkBack (Android) | Screen reader testing |
| Accessibility Inspector | iOS audit |
| Accessibility Scanner | Android audit |
| Color contrast checker | Contrast validation |

---

## 10. Quality Gates

### Heuristics Checklist (Hormozi + Norman)

- [x] **Readability:** All copy at F-K grade 5-8
- [x] **CTAs:** All buttons state outcomes (not just actions)
- [x] **Fast Win:** ≤90 seconds to first success
- [x] **2-Step Opt-In:** Used for signup/subscribe
- [x] **Visceral:** First impression is premium, not generic
- [x] **Behavioral:** <100ms feedback on all interactions
- [x] **Reflective:** Users feel accomplished, not frustrated
- [x] **Contrast:** WCAG AA passed (4.5:1 text, 3:1 UI)
- [x] **Touch Targets:** 44×44pt minimum
- [x] **States:** All screens have empty/loading/error/success

---

## References

- **Research Sources:** `/docs/research/UX-SOURCES-2025-12-17.md`
- **Inspiration:** `/docs/design/INSPIRATION.md`
- **User Journeys:** `/docs/journeys/USER-JOURNEYS.md`
- **State Coverage:** `/docs/journeys/STATE-COVERAGE.md`

---

*UX Design Specification Version: 1.0*  
*Last Updated: 2025-12-17*

