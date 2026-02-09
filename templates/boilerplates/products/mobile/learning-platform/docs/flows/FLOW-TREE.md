# Learning Platform — Flow Tree

**Version:** 1.0 | **Date:** 2025-12-17  
**Platform:** iOS & Android (Expo)  
**Total Screens:** 113  
**Design DNA:** Gamified/Engaging + Recovery/Transformation Hybrid

---

## Flow Tree Philosophy

> **"If it's not in the tree, it doesn't exist."**

Every screen in this app has been:
1. Named explicitly following `flow-subflow-screen` convention
2. Placed in a clear flow hierarchy
3. Given entry/exit points
4. Assigned priority (P0/P1/P2)
5. Counted toward total screen inventory

---

## Design DNA: Dark Gradient Gamification

| Attribute | Implementation |
|-----------|----------------|
| **Primary DNA** | Gamified/Engaging (Duolingo-style XP, streaks, levels) |
| **Secondary DNA** | Recovery/Transformation (deep personalization, quantified progress) |
| **Visual Theme** | Dark Gradient — dark gradients, indigo/teal accents, cosmic depth |
| **Animation Style** | Quittr Cosmic + Cal AI Clean (spring physics, progress rings, celebration bursts) |

---

## Complete Flow Hierarchy

```
LEARNING PLATFORM — COMPLETE FLOW TREE
==========================================
Total Screens: 113

├── 1. LAUNCH (3 screens)
│   ├── 1.1 launch-splash
│   ├── 1.2 launch-update-required
│   └── 1.3 launch-maintenance
│
├── 2. ONBOARDING (8 screens)
│   ├── 2.1 onboard-welcome
│   ├── 2.2 onboard-goal-select
│   ├── 2.3 onboard-level-select
│   ├── 2.4 onboard-why-learn
│   ├── 2.5 onboard-fast-win
│   ├── 2.6 onboard-fast-win-success
│   ├── 2.7 onboard-notifications
│   └── 2.8 onboard-complete
│
├── 3. AUTHENTICATION (12 screens)
│   ├── 3.1 Sign Up Flow (5 screens)
│   │   ├── 3.1.1 auth-signup-email
│   │   ├── 3.1.2 auth-signup-verify
│   │   ├── 3.1.3 auth-signup-password
│   │   ├── 3.1.4 auth-signup-name
│   │   └── 3.1.5 auth-signup-success
│   ├── 3.2 Sign In Flow (3 screens)
│   │   ├── 3.2.1 auth-signin-credentials
│   │   ├── 3.2.2 auth-signin-2fa
│   │   └── 3.2.3 auth-signin-success
│   ├── 3.3 Forgot Password Flow (3 screens)
│   │   ├── 3.3.1 auth-forgot-email
│   │   ├── 3.3.2 auth-forgot-check-email
│   │   └── 3.3.3 auth-forgot-reset
│   └── 3.4 Social Auth (1 screen)
│       └── 3.4.1 auth-oauth-callback
│
├── 4. HOME / DASHBOARD (5 screens)
│   ├── 4.1 home-dashboard
│   ├── 4.2 home-verb-of-day
│   ├── 4.3 home-streak-detail
│   ├── 4.4 home-daily-challenge
│   └── 4.5 home-weekly-challenge
│
├── 5. LEARN / LESSONS (18 screens)
│   ├── 5.1 Lesson Navigation (4 screens)
│   │   ├── 5.1.1 learn-home
│   │   ├── 5.1.2 learn-category-list
│   │   ├── 5.1.3 learn-lesson-list
│   │   └── 5.1.4 learn-lesson-detail
│   ├── 5.2 Lesson Content (5 screens)
│   │   ├── 5.2.1 learn-lesson-content
│   │   ├── 5.2.2 learn-lesson-audio
│   │   ├── 5.2.3 learn-lesson-complete
│   │   ├── 5.2.4 learn-lesson-locked
│   │   └── 5.2.5 learn-assessment
│   ├── 5.3 Vocabulary (3 screens)
│   │   ├── 5.3.1 learn-vocab-list
│   │   ├── 5.3.2 learn-vocab-detail
│   │   └── 5.3.3 learn-vocab-flashcard
│   ├── 5.4 Slang Modules (3 screens)
│   │   ├── 5.4.1 learn-slang-regions
│   │   ├── 5.4.2 learn-slang-list
│   │   └── 5.4.3 learn-slang-detail
│   └── 5.5 Stories & Worksheets (3 screens)
│       ├── 5.5.1 learn-story-list
│       ├── 5.5.2 learn-story-reader
│       └── 5.5.3 learn-worksheet
│
├── 6. PRACTICE / EXERCISES (12 screens)
│   ├── 6.1 Exercise Navigation (2 screens)
│   │   ├── 6.1.1 practice-home
│   │   └── 6.1.2 practice-exercise-select
│   ├── 6.2 Exercise Types (8 screens)
│   │   ├── 6.2.1 practice-quiz-mcq
│   │   ├── 6.2.2 practice-fill-blank
│   │   ├── 6.2.3 practice-speaking
│   │   ├── 6.2.4 practice-sentence-build
│   │   ├── 6.2.5 practice-listening
│   │   ├── 6.2.6 practice-translation
│   │   ├── 6.2.7 practice-pronunciation-score
│   │   └── 6.2.8 practice-timed-drill
│   └── 6.3 Exercise Results (2 screens)
│       ├── 6.3.1 practice-result
│       └── 6.3.2 practice-result-detail
│
├── 7. AI TUTOR (10 screens)
│   ├── 7.1 AI Navigation (2 screens)
│   │   ├── 7.1.1 ai-home
│   │   └── 7.1.2 ai-mode-select
│   ├── 7.2 Chat Modes (4 screens)
│   │   ├── 7.2.1 ai-chat-conversation
│   │   ├── 7.2.2 ai-chat-grammar
│   │   ├── 7.2.3 ai-chat-story
│   │   └── 7.2.4 ai-chat-drill
│   ├── 7.3 Voice Mode (3 screens)
│   │   ├── 7.3.1 ai-voice-talk
│   │   ├── 7.3.2 ai-voice-listening
│   │   └── 7.3.3 ai-voice-response
│   └── 7.4 AI Results (1 screen)
│       └── 7.4.1 ai-session-summary
│
├── 8. SCHEDULE / BOOKING (10 screens)
│   ├── 8.1 Booking Flow (5 screens)
│   │   ├── 8.1.1 schedule-home
│   │   ├── 8.1.2 schedule-calendar
│   │   ├── 8.1.3 schedule-slot-select
│   │   ├── 8.1.4 schedule-confirm
│   │   └── 8.1.5 schedule-success
│   ├── 8.2 Session Management (3 screens)
│   │   ├── 8.2.1 schedule-upcoming
│   │   ├── 8.2.2 schedule-session-detail
│   │   └── 8.2.3 schedule-past-sessions
│   └── 8.3 Video Call (2 screens)
│       ├── 8.3.1 schedule-video-room
│       └── 8.3.2 schedule-video-ended
│
├── 9. CONTENT HUB / FEED (6 screens)
│   ├── 9.1 feed-home
│   ├── 9.2 feed-post-detail
│   ├── 9.3 feed-homework
│   ├── 9.4 feed-homework-submit
│   ├── 9.5 feed-comments
│   └── 9.6 feed-create-post (admin)
│
├── 10. PROFILE & SETTINGS (15 screens)
│   ├── 10.1 Profile (4 screens)
│   │   ├── 10.1.1 profile-home
│   │   ├── 10.1.2 profile-stats
│   │   ├── 10.1.3 profile-achievements
│   │   └── 10.1.4 profile-edit
│   ├── 10.2 Account Settings (5 screens)
│   │   ├── 10.2.1 settings-home
│   │   ├── 10.2.2 settings-account
│   │   ├── 10.2.3 settings-change-email
│   │   ├── 10.2.4 settings-change-password
│   │   └── 10.2.5 settings-delete-account
│   ├── 10.3 Preferences (4 screens)
│   │   ├── 10.3.1 settings-notifications
│   │   ├── 10.3.2 settings-privacy
│   │   ├── 10.3.3 settings-language
│   │   └── 10.3.4 settings-appearance
│   └── 10.4 Support (2 screens)
│       ├── 10.4.1 settings-help
│       └── 10.4.2 settings-contact
│
├── 11. SUBSCRIPTION / PAYWALL (6 screens)
│   ├── 11.1 sub-paywall
│   ├── 11.2 sub-plan-compare
│   ├── 11.3 sub-checkout
│   ├── 11.4 sub-success
│   ├── 11.5 sub-manage
│   └── 11.6 sub-cancel
│
└── 12. ERROR / EMPTY STATES (8 screens)
    ├── 12.1 error-offline
    ├── 12.2 error-generic
    ├── 12.3 error-server
    ├── 12.4 error-access-denied
    ├── 12.5 error-session-expired
    ├── 12.6 empty-lessons
    ├── 12.7 empty-bookings
    └── 12.8 empty-achievements
```

---

## Screen Counts

| Flow Category | Sub-Flows | Screens | P0 | P1 | P2 |
|---------------|-----------|---------|----|----|-----|
| 1. Launch | 0 | 3 | 1 | 1 | 1 |
| 2. Onboarding | 0 | 8 | 8 | 0 | 0 |
| 3. Authentication | 4 | 12 | 10 | 2 | 0 |
| 4. Home/Dashboard | 0 | 5 | 3 | 2 | 0 |
| 5. Learn/Lessons | 5 | 18 | 12 | 4 | 2 |
| 6. Practice/Exercises | 3 | 12 | 10 | 2 | 0 |
| 7. AI Tutor | 4 | 10 | 8 | 2 | 0 |
| 8. Schedule/Booking | 3 | 10 | 8 | 2 | 0 |
| 9. Content Hub/Feed | 0 | 6 | 3 | 2 | 1 |
| 10. Profile & Settings | 4 | 15 | 6 | 7 | 2 |
| 11. Subscription | 0 | 6 | 4 | 2 | 0 |
| 12. Error/Empty States | 0 | 8 | 5 | 3 | 0 |
| **TOTAL** | **23** | **113** | **78** | **29** | **6** |

---

## Priority Breakdown

### P0 — MVP Critical (78 screens)
Must ship in v1.0. Blocks core user journey.

### P1 — Important (29 screens)
Ship in v1.1. Enhances experience but not blocking.

### P2 — Nice-to-Have (6 screens)
Ship in v1.2+. Future enhancements.

---

## Shared/Reusable Screens

| Screen/Component | Used In Flows | Notes |
|------------------|---------------|-------|
| Loading Overlay | All flows | Universal loading indicator |
| Error Modal | All flows | Generic error with retry |
| Success Toast | Auth, Practice, Booking | Confirmation messages |
| Confirmation Dialog | Settings, Booking, Subscription | Destructive action confirmation |
| Paywall Soft Block | Learn, Practice, AI, Booking | Upgrade prompt on premium features |
| XP Animation | Practice, Lessons, Challenges | Shared celebration component |

---

## Tab Bar Navigation

```
┌─────────────────────────────────────────────────────────────┐
│                        TAB BAR                               │
│  ┌─────────┬─────────┬─────────┬─────────┬─────────┐        │
│  │  Home   │  Learn  │Practice │Schedule │ Profile │        │
│  │  🏠     │  📚     │  🎯     │  📅     │  👤     │        │
│  └─────────┴─────────┴─────────┴─────────┴─────────┘        │
└─────────────────────────────────────────────────────────────┘
```

| Tab | Icon | Root Screen | Key Flows |
|-----|------|-------------|-----------|
| Home | 🏠 | home-dashboard | Streaks, Verb of Day, Challenges |
| Learn | 📚 | learn-home | Lessons, Vocab, Slang, Stories |
| Practice | 🎯 | practice-home | AI Tutor, Exercises |
| Schedule | 📅 | schedule-home | Booking, Video Calls |
| Profile | 👤 | profile-home | Settings, Achievements, Subscription |

---

## Navigation Patterns

### Stack Navigation (within tabs)
- Push/pop screens within each tab
- Back gesture enabled (iOS swipe, Android back button)
- Deep linking supported for all screens

### Modal Presentations
- Paywall (bottom sheet → full screen)
- Video call (full screen)
- Confirmation dialogs (alert modal)
- Success celebrations (overlay)

### Bottom Sheets
- Verb of Day detail
- Slot selection
- Filter options

---

## Flow Entry Points

| Entry Method | Target Screen | Auth Required |
|--------------|---------------|---------------|
| Cold launch | launch-splash | No |
| Push notification (lesson) | learn-lesson-detail | Yes |
| Push notification (booking) | schedule-session-detail | Yes |
| Push notification (streak) | home-streak-detail | Yes |
| Deep link: `/lesson/:id` | learn-lesson-detail | Yes |
| Deep link: `/chat` | ai-chat-conversation | Yes |
| Deep link: `/subscribe` | sub-paywall | No |
| Deep link: `/booking/:id` | schedule-session-detail | Yes |

---

*Flow Tree Version: 1.0*  
*Last Updated: 2025-12-17*

