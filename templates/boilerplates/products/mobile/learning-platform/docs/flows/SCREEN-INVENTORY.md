# Learning Platform — Screen Inventory

**Version:** 1.0 | **Date:** 2025-12-17  
**Total Screens:** 113  
Total Screens: 113  
**Platform:** iOS & Android (Expo)

---

## Screen Table

### Legend

| Priority | Meaning |
|----------|---------|
| **P0** | MVP Critical — Must ship in v1.0 |
| **P1** | Important — Ship in v1.1 |
| **P2** | Nice-to-have — Future enhancement |

| Complexity | Criteria |
|------------|----------|
| **Simple** | Static content, <3 interactive elements |
| **Medium** | Form with validation, list with actions |
| **Complex** | Real-time data, multiple states, animations |

---

## 1. LAUNCH (3 screens)

| # | Screen ID | Screen Name | Priority | Complexity | Animation |
|---|-----------|-------------|----------|------------|-----------|
| 1 | `launch-splash` | Splash Screen | P0 | Simple | Complex |
| 2 | `launch-update-required` | App Update Required | P1 | Simple | Simple |
| 3 | `launch-maintenance` | Maintenance Mode | P2 | Simple | Simple |

### Screen Specifications

#### 1.1 launch-splash
**Purpose:** Display brand animation while app initializes and determines navigation path.

**Entry Points:**
- App cold start
- App warm start (if session expired)

**Exit Points:**
- → `onboard-welcome` (first launch)
- → `auth-signin-credentials` (returning, not logged in)
- → `home-dashboard` (returning, logged in)

**Key Elements:**
- [ ] Centered logo with cosmic glow animation
- [ ] "Learning Platform" text reveal
- [ ] dark gradient gradient background (navy → deep blue)
- [ ] Loading indicator (subtle pulse)

**Animation Profile:**
| Type | Implementation | Motion Primitive |
|------|----------------|------------------|
| Entry | Fade in + scale from 0.8 | Reanimated spring |
| Logo | Glow pulse animation | SVG glow effect |
| Text | Staggered character reveal | text-effect style |
| Exit | Fade out to white/destination | duration: 300ms |

**States:**
- **Loading:** Logo animation plays
- **Error (Network):** Show offline message after 5s timeout
- **Success:** Transition to appropriate screen

---

#### 1.2 launch-update-required
**Purpose:** Inform user that app update is required to continue.

**Entry Points:**
- Version check fails during splash

**Exit Points:**
- → App Store / Google Play (external)

**Key Elements:**
- [ ] Update illustration (phone with arrow)
- [ ] "New Version Available" headline
- [ ] Version number display
- [ ] "Update Now" primary button
- [ ] "What's New" expandable section

---

#### 1.3 launch-maintenance
**Purpose:** Display maintenance message when backend is unavailable.

**Entry Points:**
- Backend returns maintenance flag

**Exit Points:**
- → `launch-splash` (when maintenance ends, auto-retry)

**Key Elements:**
- [ ] Maintenance illustration (AI Tutor with tools)
- [ ] "Be Right Back" headline
- [ ] Estimated time (if available)
- [ ] Retry button

---

## 2. ONBOARDING (8 screens)

| # | Screen ID | Screen Name | Priority | Complexity | Animation |
|---|-----------|-------------|----------|------------|-----------|
| 4 | `onboard-welcome` | Welcome Screen | P0 | Simple | Complex |
| 5 | `onboard-goal-select` | Goal Selection | P0 | Medium | Medium |
| 6 | `onboard-level-select` | Level Selection | P0 | Medium | Medium |
| 7 | `onboard-why-learn` | Why Learn? (Optional) | P0 | Simple | Simple |
| 8 | `onboard-fast-win` | Fast Win Exercise | P0 | Complex | Complex |
| 9 | `onboard-fast-win-success` | Fast Win Success | P0 | Simple | Complex |
| 10 | `onboard-notifications` | Notification Permission | P0 | Simple | Medium |
| 11 | `onboard-complete` | Onboarding Complete | P0 | Simple | Complex |

### Screen Specifications

#### 2.1 onboard-welcome
**Purpose:** Introduce AI Tutor and the app's personality. First impression = warm, inviting, different.

**Entry Points:**
- First app launch (no user data)
- Tap "Get Started" after app install

**Exit Points:**
- → `onboard-goal-select` (tap "Start Learning effectively")
- → `auth-signin-credentials` (tap "I have an account")

**Key Elements:**
- [ ] AI Tutor avatar with wave animation
- [ ] "Hello! I'm AI Tutor" headline
- [ ] Brief value proposition (2 lines max)
- [ ] "Start Learning effectively" CTA (primary)
- [ ] "I have an account" link (secondary)
- [ ] Background: Dark Gradient gradient with subtle particles

**Animation Profile:**
| Type | Implementation | Motion Primitive |
|------|----------------|------------------|
| Entry | Staggered elements fade + slide up | animated-group |
| AI Tutor | Breathing animation + wave | Lottie |
| CTA | Glow pulse on idle | border-trail |
| Background | Floating particles | Custom shader |

---

#### 2.2 onboard-goal-select
**Purpose:** Capture learning goal for personalization.

**Entry Points:**
- → from `onboard-welcome`

**Exit Points:**
- → `onboard-level-select` (goal selected)
- ← Back to `onboard-welcome`

**Key Elements:**
- [ ] "What's your goal?" headline
- [ ] Goal cards (4 options):
  - 🌴 Travel confidently
  - 💬 Hold conversations
  - 💼 Career advancement
  - 🏠 Connect with family/culture
- [ ] Progress indicator (1/5)
- [ ] Each card with icon + brief description

**Animation Profile:**
| Type | Implementation | Motion Primitive |
|------|----------------|------------------|
| Entry | Cards stagger in from bottom | animated-group |
| Select | Card scales + glow + haptic | spring + glow-effect |
| Transition | Selected card grows, others fade | morphing-dialog |

---

#### 2.3 onboard-level-select
**Purpose:** Assess current the subject level.

**Entry Points:**
- → from `onboard-goal-select`

**Exit Points:**
- → `onboard-why-learn` (level selected)
- ← Back to `onboard-goal-select`

**Key Elements:**
- [ ] "What's your level?" headline
- [ ] Level cards (4 options):
  - 🌱 Complete beginner
  - 🌿 Know some basics
  - 🌳 Intermediate
  - 🌲 Advanced (need fluency)
- [ ] Progress indicator (2/5)

---

#### 2.4 onboard-why-learn
**Purpose:** Optional context for deeper personalization. Skippable.

**Entry Points:**
- → from `onboard-level-select`

**Exit Points:**
- → `onboard-fast-win` (answered or skipped)
- ← Back to `onboard-level-select`

**Key Elements:**
- [ ] "Why do you want to learn?" headline
- [ ] Multi-select options (trip planned, heritage, work, etc.)
- [ ] "Skip" link clearly visible
- [ ] Progress indicator (3/5)

---

#### 2.5 onboard-fast-win
**Purpose:** Deliver first success within 90 seconds. User speaks their first first concept.

**Entry Points:**
- → from `onboard-why-learn`

**Exit Points:**
- → `onboard-fast-win-success` (correct pronunciation)
- ← Back (discouraged, but available)

**Key Elements:**
- [ ] "Let's try something!" headline
- [ ] first concept display: "Hello" (large)
- [ ] Audio play button with AI Tutor's voice
- [ ] Microphone button to record
- [ ] Waveform visualization during recording
- [ ] Simple feedback: "Perfect!" or "Try again"

**Animation Profile:**
| Type | Implementation | Motion Primitive |
|------|----------------|------------------|
| Word | Scale up + glow on focus | text-effect |
| Recording | Waveform animation | Custom SVG |
| Success | Green pulse + confetti | react-native-confetti |

---

#### 2.6 onboard-fast-win-success
**Purpose:** Celebrate first achievement. Emotional high point.

**Entry Points:**
- → from `onboard-fast-win` (success)

**Exit Points:**
- → `onboard-notifications`

**Key Elements:**
- [ ] "Great job!" headline with celebration
- [ ] "+10 XP" animated counter
- [ ] AI Tutor celebrating animation
- [ ] "You just completed a lesson!" copy
- [ ] "Continue" button

**Animation Profile:**
| Type | Implementation | Motion Primitive |
|------|----------------|------------------|
| Entry | Confetti burst | react-native-confetti |
| XP | Count up animation | animated-number |
| AI Tutor | Dance/celebration Lottie | lottie-react-native |

---

#### 2.7 onboard-notifications
**Purpose:** Request push notification permission.

**Entry Points:**
- → from `onboard-fast-win-success`

**Exit Points:**
- → `onboard-complete` (allowed or denied)
- ← Back (discouraged)

**Key Elements:**
- [ ] Bell icon illustration
- [ ] "Stay on track" headline
- [ ] Streak preview (what notifications help with)
- [ ] "Enable Notifications" primary button
- [ ] "Not now" secondary link

---

#### 2.8 onboard-complete
**Purpose:** Transition to main app. Create account or continue.

**Entry Points:**
- → from `onboard-notifications`

**Exit Points:**
- → `auth-signup-email` (create account)
- → `home-dashboard` (continue as guest - limited)

**Key Elements:**
- [ ] "You're ready!" headline
- [ ] Summary: Goal + Level displayed
- [ ] "Create Free Account" primary CTA
- [ ] "Continue as Guest" secondary link
- [ ] Benefits of account (sync, progress, community)

---

## 3. AUTHENTICATION (12 screens)

| # | Screen ID | Screen Name | Priority | Complexity | Animation |
|---|-----------|-------------|----------|------------|-----------|
| 12 | `auth-signup-email` | Sign Up - Email | P0 | Medium | Medium |
| 13 | `auth-signup-verify` | Sign Up - Verify Code | P0 | Medium | Medium |
| 14 | `auth-signup-password` | Sign Up - Password | P0 | Medium | Simple |
| 15 | `auth-signup-name` | Sign Up - Name | P0 | Simple | Simple |
| 16 | `auth-signup-success` | Sign Up - Success | P0 | Simple | Complex |
| 17 | `auth-signin-credentials` | Sign In | P0 | Medium | Medium |
| 18 | `auth-signin-2fa` | Sign In - 2FA | P1 | Medium | Simple |
| 19 | `auth-signin-success` | Sign In - Success | P0 | Simple | Complex |
| 20 | `auth-forgot-email` | Forgot Password - Email | P0 | Medium | Simple |
| 21 | `auth-forgot-check-email` | Forgot Password - Check | P0 | Simple | Simple |
| 22 | `auth-forgot-reset` | Forgot Password - Reset | P0 | Medium | Simple |
| 23 | `auth-oauth-callback` | OAuth Callback | P1 | Simple | Simple |

### Screen Specifications

#### 3.1.1 auth-signup-email
**Purpose:** Capture email as first step of account creation.

**Entry Points:**
- → from `onboard-complete`
- → from `auth-signin-credentials` (tap "Create Account")

**Exit Points:**
- → `auth-signup-verify` (valid email submitted)
- ← Back to previous screen

**Key Elements:**
- [ ] "Create your account" headline
- [ ] Email input with validation
- [ ] "Continue" button (disabled until valid)
- [ ] Social auth buttons (Apple, Google)
- [ ] "Already have an account? Sign In" link
- [ ] Terms & Privacy links

**Animation Profile:**
| Type | Implementation | Motion Primitive |
|------|----------------|------------------|
| Entry | Fade up | Moti |
| Input focus | Border glow | border-trail |
| Validation | Check/X icon animate | spring |
| Error | Shake animation | spring (bouncy) |

---

#### 3.1.2 auth-signup-verify
**Purpose:** Verify email with 6-digit code.

**Entry Points:**
- → from `auth-signup-email`

**Exit Points:**
- → `auth-signup-password` (code verified)
- ← Back to `auth-signup-email`

**Key Elements:**
- [ ] "Check your email" headline
- [ ] Email address display (masked)
- [ ] 6-digit code input (auto-focus, auto-advance)
- [ ] Resend code timer (60s countdown)
- [ ] "Resend" button (after timer)
- [ ] "Change email" link

---

#### 3.1.3 auth-signup-password
**Purpose:** Create secure password.

**Entry Points:**
- → from `auth-signup-verify`

**Exit Points:**
- → `auth-signup-name` (password set)
- ← Back to `auth-signup-verify`

**Key Elements:**
- [ ] "Create a password" headline
- [ ] Password input with show/hide toggle
- [ ] Password strength indicator
- [ ] Requirements checklist (8+ chars, etc.)
- [ ] "Continue" button

---

#### 3.1.4 auth-signup-name
**Purpose:** Capture display name for personalization.

**Entry Points:**
- → from `auth-signup-password`

**Exit Points:**
- → `auth-signup-success` (name entered)
- ← Back to `auth-signup-password`

**Key Elements:**
- [ ] "What should we call you?" headline
- [ ] Name input (single field)
- [ ] "Continue" button
- [ ] Optional: Avatar selection/upload

---

#### 3.1.5 auth-signup-success
**Purpose:** Celebrate account creation.

**Entry Points:**
- → from `auth-signup-name`

**Exit Points:**
- → `home-dashboard` (auto or tap)

**Key Elements:**
- [ ] "Welcome, [Name]!" headline
- [ ] AI Tutor welcoming animation
- [ ] Brief next steps preview
- [ ] "Start Learning" button

---

## 4. HOME / DASHBOARD (5 screens)

| # | Screen ID | Screen Name | Priority | Complexity | Animation |
|---|-----------|-------------|----------|------------|-----------|
| 24 | `home-dashboard` | Dashboard | P0 | Complex | Complex |
| 25 | `home-verb-of-day` | Verb of the Day | P0 | Medium | Medium |
| 26 | `home-streak-detail` | Streak Detail | P0 | Medium | Complex |
| 27 | `home-daily-challenge` | Daily Challenge | P1 | Medium | Medium |
| 28 | `home-weekly-challenge` | Weekly Challenge | P1 | Medium | Medium |

### Screen Specifications

#### 4.1 home-dashboard
**Purpose:** Central hub. Resume learning, track progress, quick access to key features.

**Entry Points:**
- Tab bar "Home" tap
- Successful authentication
- Deep link: `learning-platform://`

**Exit Points:**
- → `learn-lesson-detail` (tap continue lesson)
- → `home-verb-of-day` (tap verb card)
- → `home-streak-detail` (tap streak)
- → `ai-chat-conversation` (tap AI quick access)
- → Other tabs via tab bar

**Key Elements:**
- [ ] Greeting with user name + time of day
- [ ] Continue Lesson card (prominent)
- [ ] Streak fire + count (top right)
- [ ] XP progress ring
- [ ] Verb of the Day card
- [ ] Daily Challenge preview
- [ ] Recent Feed posts preview
- [ ] AI Tutor quick access button

**Animation Profile:**
| Type | Implementation | Motion Primitive |
|------|----------------|------------------|
| Entry | Staggered children fade up | animated-group |
| Streak | Fire Lottie animation | lottie-react-native |
| XP Ring | SVG stroke animation | react-native-svg |
| Cards | Press scale + haptic | Reanimated |

---

## 5. LEARN / LESSONS (18 screens)

| # | Screen ID | Screen Name | Priority | Complexity | Animation |
|---|-----------|-------------|----------|------------|-----------|
| 29 | `learn-home` | Learn Home | P0 | Medium | Medium |
| 30 | `learn-category-list` | Category List | P0 | Medium | Simple |
| 31 | `learn-lesson-list` | Lesson List | P0 | Medium | Simple |
| 32 | `learn-lesson-detail` | Lesson Detail | P0 | Medium | Medium |
| 33 | `learn-lesson-content` | Lesson Content | P0 | Complex | Medium |
| 34 | `learn-lesson-audio` | Lesson Audio Player | P0 | Medium | Medium |
| 35 | `learn-lesson-complete` | Lesson Complete | P0 | Simple | Complex |
| 36 | `learn-lesson-locked` | Lesson Locked | P0 | Simple | Simple |
| 37 | `learn-assessment` | Module Assessment | P0 | Complex | Medium |
| 38 | `learn-vocab-list` | Vocabulary List | P0 | Medium | Simple |
| 39 | `learn-vocab-detail` | Vocabulary Detail | P0 | Medium | Medium |
| 40 | `learn-vocab-flashcard` | Flashcard Mode | P1 | Medium | Medium |
| 41 | `learn-slang-regions` | Slang Regions | P0 | Simple | Simple |
| 42 | `learn-slang-list` | Slang List | P0 | Medium | Simple |
| 43 | `learn-slang-detail` | Slang Detail | P1 | Medium | Medium |
| 44 | `learn-story-list` | Story List | P1 | Medium | Simple |
| 45 | `learn-story-reader` | Story Reader | P1 | Complex | Medium |
| 46 | `learn-worksheet` | Worksheet | P2 | Complex | Simple |

---

## 6. PRACTICE / EXERCISES (12 screens)

| # | Screen ID | Screen Name | Priority | Complexity | Animation |
|---|-----------|-------------|----------|------------|-----------|
| 47 | `practice-home` | Practice Home | P0 | Medium | Medium |
| 48 | `practice-exercise-select` | Exercise Select | P0 | Medium | Simple |
| 49 | `practice-quiz-mcq` | Multiple Choice Quiz | P0 | Medium | Medium |
| 50 | `practice-fill-blank` | Fill in the Blank | P0 | Medium | Medium |
| 51 | `practice-speaking` | Speaking Exercise | P0 | Complex | Complex |
| 52 | `practice-sentence-build` | Sentence Building | P0 | Medium | Medium |
| 53 | `practice-listening` | Listening Exercise | P0 | Medium | Medium |
| 54 | `practice-translation` | Translation Exercise | P0 | Medium | Simple |
| 55 | `practice-pronunciation-score` | Pronunciation Score | P0 | Medium | Complex |
| 56 | `practice-timed-drill` | Timed Drill | P1 | Complex | Medium |
| 57 | `practice-result` | Exercise Result | P0 | Simple | Complex |
| 58 | `practice-result-detail` | Result Detail | P1 | Medium | Simple |

---

## 7. AI TUTOR (10 screens)

| # | Screen ID | Screen Name | Priority | Complexity | Animation |
|---|-----------|-------------|----------|------------|-----------|
| 59 | `ai-home` | AI Tutor Home | P0 | Medium | Medium |
| 60 | `ai-mode-select` | Mode Selection | P0 | Simple | Medium |
| 61 | `ai-chat-conversation` | Conversation Mode | P0 | Complex | Medium |
| 62 | `ai-chat-grammar` | Grammar Help Mode | P0 | Complex | Medium |
| 63 | `ai-chat-story` | Story Mode | P1 | Complex | Medium |
| 64 | `ai-chat-drill` | Drill Mode | P0 | Complex | Medium |
| 65 | `ai-voice-talk` | Talk to AI Tutor | P0 | Complex | Complex |
| 66 | `ai-voice-listening` | AI Listening | P0 | Simple | Medium |
| 67 | `ai-voice-response` | AI Response | P0 | Medium | Complex |
| 68 | `ai-session-summary` | Session Summary | P1 | Medium | Medium |

### Screen Specifications

#### 7.5 ai-voice-talk
**Purpose:** Voice conversation with AI AI Tutor. Most premium feature.

**Entry Points:**
- → from `ai-mode-select` (tap "Talk to AI Tutor")
- → from `ai-home` (quick access)

**Exit Points:**
- → `ai-session-summary` (end session)
- ← Back to `ai-mode-select`

**Key Elements:**
- [ ] AI Tutor avatar (animated, breathing)
- [ ] Waveform visualization (during speech)
- [ ] Large microphone button (tap to talk)
- [ ] Transcript of conversation
- [ ] Inline corrections (gentle, non-blocking)
- [ ] End session button

**Animation Profile:**
| Type | Implementation | Motion Primitive |
|------|----------------|------------------|
| AI Tutor | Breathing + listening animation | Lottie |
| Waveform | Real-time audio visualization | Custom SVG |
| Speaking | Mic button pulse | scale + glow |
| Response | Text typing effect | text-effect |

**States:**
- **Idle:** AI Tutor breathing, mic ready
- **Listening:** Waveform active, mic highlighted
- **Processing:** AI Tutor "thinking" animation
- **Speaking:** Audio plays, transcript appears
- **Error:** "Couldn't hear you" + retry

---

## 8. SCHEDULE / BOOKING (10 screens)

| # | Screen ID | Screen Name | Priority | Complexity | Animation |
|---|-----------|-------------|----------|------------|-----------|
| 69 | `schedule-home` | Schedule Home | P0 | Medium | Simple |
| 70 | `schedule-calendar` | Calendar View | P0 | Complex | Medium |
| 71 | `schedule-slot-select` | Slot Selection | P0 | Medium | Medium |
| 72 | `schedule-confirm` | Booking Confirmation | P0 | Medium | Simple |
| 73 | `schedule-success` | Booking Success | P0 | Simple | Complex |
| 74 | `schedule-upcoming` | Upcoming Sessions | P0 | Medium | Simple |
| 75 | `schedule-session-detail` | Session Detail | P0 | Medium | Medium |
| 76 | `schedule-past-sessions` | Past Sessions | P1 | Medium | Simple |
| 77 | `schedule-video-room` | Video Call Room | P0 | Complex | Simple |
| 78 | `schedule-video-ended` | Call Ended | P1 | Simple | Medium |

---

## 9. CONTENT HUB / FEED (6 screens)

| # | Screen ID | Screen Name | Priority | Complexity | Animation |
|---|-----------|-------------|----------|------------|-----------|
| 79 | `feed-home` | Feed Home | P0 | Complex | Medium |
| 80 | `feed-post-detail` | Post Detail | P0 | Medium | Simple |
| 81 | `feed-homework` | Homework List | P0 | Medium | Simple |
| 82 | `feed-homework-submit` | Homework Submit | P1 | Medium | Medium |
| 83 | `feed-comments` | Comments | P1 | Medium | Simple |
| 84 | `feed-create-post` | Create Post (Admin) | P2 | Complex | Simple |

---

## 10. PROFILE & SETTINGS (15 screens)

| # | Screen ID | Screen Name | Priority | Complexity | Animation |
|---|-----------|-------------|----------|------------|-----------|
| 85 | `profile-home` | Profile Home | P0 | Medium | Medium |
| 86 | `profile-stats` | Statistics | P0 | Medium | Complex |
| 87 | `profile-achievements` | Achievements | P1 | Medium | Complex |
| 88 | `profile-edit` | Edit Profile | P1 | Medium | Simple |
| 89 | `settings-home` | Settings Home | P0 | Simple | Simple |
| 90 | `settings-account` | Account Settings | P0 | Medium | Simple |
| 91 | `settings-change-email` | Change Email | P1 | Medium | Simple |
| 92 | `settings-change-password` | Change Password | P1 | Medium | Simple |
| 93 | `settings-delete-account` | Delete Account | P2 | Medium | Simple |
| 94 | `settings-notifications` | Notification Settings | P0 | Medium | Simple |
| 95 | `settings-privacy` | Privacy Settings | P1 | Medium | Simple |
| 96 | `settings-language` | Language Settings | P1 | Simple | Simple |
| 97 | `settings-appearance` | Appearance (Theme) | P2 | Simple | Medium |
| 98 | `settings-help` | Help Center | P1 | Medium | Simple |
| 99 | `settings-contact` | Contact Support | P1 | Medium | Simple |

---

## 11. SUBSCRIPTION / PAYWALL (6 screens)

| # | Screen ID | Screen Name | Priority | Complexity | Animation |
|---|-----------|-------------|----------|------------|-----------|
| 100 | `sub-paywall` | Paywall | P0 | Complex | Complex |
| 101 | `sub-plan-compare` | Plan Comparison | P0 | Medium | Medium |
| 102 | `sub-checkout` | Checkout | P0 | Medium | Simple |
| 103 | `sub-success` | Subscription Success | P0 | Simple | Complex |
| 104 | `sub-manage` | Manage Subscription | P1 | Medium | Simple |
| 105 | `sub-cancel` | Cancel Subscription | P1 | Medium | Simple |

### Screen Specifications

#### 11.1 sub-paywall
**Purpose:** Convert free users to paid. Grand Slam Offer presentation.

**Entry Points:**
- Soft block on premium feature
- "Upgrade" tap from profile
- Deep link: `learning-platform://subscribe`

**Exit Points:**
- → `sub-checkout` (select plan)
- ← Dismiss/back

**Key Elements:**
- [ ] "Unlock Your the subject Journey" headline
- [ ] Tier cards (Essential, Pro ⭐, VIP)
- [ ] Feature comparison checklist
- [ ] Annual discount badge (Save 20%)
- [ ] Social proof: "Join 10,000+ learners"
- [ ] 90-Day Guarantee badge
- [ ] "Get [Tier]" CTAs with pricing
- [ ] "Restore Purchases" link

**Animation Profile:**
| Type | Implementation | Motion Primitive |
|------|----------------|------------------|
| Entry | Bottom sheet → full screen | spring |
| Cards | Stagger in | animated-group |
| Recommended | Glow pulse on Pro | glow-effect |
| Select | Card expand + glow | morphing-dialog |

---

## 12. ERROR / EMPTY STATES (8 screens)

| # | Screen ID | Screen Name | Priority | Complexity | Animation |
|---|-----------|-------------|----------|------------|-----------|
| 106 | `error-offline` | Offline Error | P0 | Simple | Simple |
| 107 | `error-generic` | Generic Error | P0 | Simple | Simple |
| 108 | `error-server` | Server Error | P0 | Simple | Simple |
| 109 | `error-access-denied` | Access Denied | P0 | Simple | Simple |
| 110 | `error-session-expired` | Session Expired | P0 | Simple | Simple |
| 111 | `empty-lessons` | No Lessons | P1 | Simple | Simple |
| 112 | `empty-bookings` | No Bookings | P1 | Simple | Simple |
| 113 | `empty-achievements` | No Achievements | P1 | Simple | Medium |

### Screen Specifications

#### 12.1 error-offline
**Purpose:** Friendly offline message with retry.

**Key Elements:**
- [ ] AI Tutor illustration (confused/searching)
- [ ] "No connection" headline
- [ ] "Check your internet and try again" copy
- [ ] "Try Again" button
- [ ] Background: Subtle pattern overlay

---

## Priority Summary

| Priority | Count | Percentage | Build Phase |
|----------|-------|------------|-------------|
| P0 | 78 | 69% | MVP (Weeks 1-8) |
| P1 | 29 | 26% | v1.1 (Weeks 9-12) |
| P2 | 6 | 5% | v1.2+ (Weeks 13+) |
| **Total** | **113** | **100%** | |

---

## Complexity Summary

| Complexity | Count | Animation Level |
|------------|-------|-----------------|
| Simple | 41 | Basic transitions |
| Medium | 52 | Forms, lists, validation |
| Complex | 20 | Real-time, multi-state |
| **Total** | **113** | |

---

*Screen Inventory Version: 1.0*  
*Last Updated: 2025-12-17*

