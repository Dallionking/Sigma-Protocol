# Fitness App Boilerplate

> Complete mobile fitness application shell for workout trackers, coaching apps, and health platforms

## Overview

The Fitness boilerplate provides everything you need to build a comprehensive health and fitness mobile application. From workout logging to progress tracking, this shell handles the complex fitness app patterns so you can focus on your unique value proposition.

**Extends**: [expo-mobile](../../../expo-mobile)

## Screenshots

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   🏋️ Today's    │  │   📊 Progress   │  │   🏃 Workout    │
│     Workout     │  │     Stats       │  │     Active      │
│                 │  │                 │  │                 │
│  ┌───────────┐  │  │  ████░░░░ 65%   │  │   ⏱️ 12:34     │
│  │ Bench     │  │  │                 │  │                 │
│  │ Press 4x8 │  │  │  Streak: 🔥14   │  │  Set 3 of 4    │
│  └───────────┘  │  │                 │  │                 │
│  ┌───────────┐  │  │  This Week      │  │  [ REST 45s ]  │
│  │ Squats    │  │  │  ● ● ● ○ ○ ○ ○  │  │                 │
│  │ 5x5       │  │  │                 │  │  [ COMPLETE ]  │
│  └───────────┘  │  │  [ DETAILS ]    │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## Quick Start

```bash
# Initialize new fitness app
sigma scaffold my-fitness-app --boilerplate=mobile-fitness

# Install dependencies
cd my-fitness-app
npm install

# Start development
npx expo start
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Expo SDK 52+ / React Native |
| Navigation | Expo Router v3 |
| State | Zustand + React Query |
| Backend | Supabase |
| Payments | RevenueCat |
| Health Data | expo-health (HealthKit/Google Fit) |
| Charts | Victory Native |
| Animations | Reanimated 3 |

## Project Structure

```
mobile-fitness/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx           # Dashboard/Today
│   │   ├── workouts/           # Workout library
│   │   ├── progress/           # Stats & charts
│   │   └── profile/            # Settings
│   ├── (modals)/
│   │   ├── workout-active.tsx  # Active workout screen
│   │   ├── exercise-detail.tsx # Exercise info
│   │   └── log-entry.tsx       # Manual logging
│   └── (auth)/                 # Authentication
├── components/
│   ├── workout/
│   │   ├── ExerciseCard.tsx
│   │   ├── SetRow.tsx
│   │   ├── RestTimer.tsx
│   │   └── WorkoutSummary.tsx
│   ├── progress/
│   │   ├── StreakBadge.tsx
│   │   ├── ProgressChart.tsx
│   │   └── WeeklyCalendar.tsx
│   └── ui/                     # Shared UI components
├── hooks/
│   ├── use-workout.ts          # Workout state management
│   ├── use-health-kit.ts       # HealthKit integration
│   └── use-timer.ts            # Countdown/rest timers
├── lib/
│   ├── health/                 # HealthKit/Google Fit
│   └── exercises/              # Exercise database
└── modules/
    ├── workouts/               # Workout logic
    ├── exercises/              # Exercise management
    ├── progress/               # Progress tracking
    └── coaching/               # AI coaching (optional)
```

## Key Features

### 🏋️ Workout Management
- Pre-built workout templates
- Custom workout builder
- Exercise library with 500+ exercises
- Rest timer with haptic feedback
- Workout history & calendar

### 📊 Progress Tracking
- Body measurements logging
- Progress photos with comparison
- Strength progression charts
- Streak tracking & gamification
- Weekly/monthly reports

### 🍎 Health Integration
- HealthKit sync (iOS)
- Google Fit sync (Android)
- Calories & nutrition logging
- Sleep tracking correlation
- Heart rate zones

### 🎯 Goals & Coaching
- Goal setting wizard
- AI workout recommendations
- Personal records tracking
- Achievement badges
- Push notification reminders

## Database Schema

```sql
-- Core tables included
workouts
exercises
workout_exercises
workout_logs
exercise_sets
user_measurements
user_goals
achievements
streaks
```

## Configuration

```typescript
// config/fitness.ts
export const fitnessConfig = {
  defaultRestTime: 60,        // seconds
  enableHealthKit: true,
  enableGoogleFit: true,
  exerciseDatabase: 'built-in', // or 'api'
  gamification: {
    streakThreshold: 3,
    badges: true,
    leaderboard: false
  }
}
```

## Premium Features (RevenueCat)

The boilerplate includes subscription gates for:
- Advanced analytics dashboard
- AI-powered workout recommendations
- Unlimited workout history
- Custom exercise creation
- Export data features

## Customization Guide

### Swap Exercise Database
Replace the built-in exercise data with your own API:

```typescript
// lib/exercises/provider.ts
export const exerciseProvider = {
  search: async (query) => { /* your API */ },
  getById: async (id) => { /* your API */ }
}
```

### Add Wearable Support
Extend health integrations:

```typescript
// lib/health/wearables.ts
import { AppleWatch, Fitbit, Garmin } from './integrations'
```

## See Also

- [FEATURES.md](./FEATURES.md) - Complete feature breakdown
- [expo-mobile](../../../expo-mobile) - Base boilerplate
- [Fitness Demo](../../../../demos/full/fitness-coaching) - Demo project


