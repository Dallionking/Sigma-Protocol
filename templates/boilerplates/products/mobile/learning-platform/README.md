# Learning Platform Boilerplate

AI-powered mobile learning platform with gamification, community, scheduling, and subscription monetization. Built with Expo, React Native, and NativeWind.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | React Native 0.81 + Expo SDK 54 |
| Router | Expo Router v6 (file-based) |
| Styling | NativeWind (Tailwind for RN) |
| State | Zustand with AsyncStorage persistence |
| Animations | React Native Reanimated + Moti |
| Forms | React Hook Form + Zod validation |
| Icons | Lucide React Native |
| Fonts | Satoshi (display) + Plus Jakarta Sans (body) |

## Features

- **AI Tutor Chat** -- Multi-mode AI conversation (free chat, grammar, story, drill, voice)
- **Lesson Library** -- Categorized lessons with vocabulary, stories, and worksheets
- **Practice Exercises** -- MCQ, fill-blank, speaking, sentence-build, listening, translation, timed drills
- **Gamification** -- XP, streaks, achievements, leaderboard-ready
- **Community Feed** -- Posts, comments, homework assignments, pinned announcements
- **Tutor Scheduling** -- Calendar-based booking with time slots and video call stubs
- **Subscription Tiers** -- 4-tier monetization (Free, Essential, Pro, VIP) with paywall
- **Onboarding** -- 5-step onboarding with goal selection, level assessment, and fast win
- **Authentication** -- Full auth flow (email/password, OAuth, 2FA, forgot password)
- **Profile** -- Stats, achievements, settings, privacy controls
- **State Screens** -- Error, empty, offline, and maintenance states

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android
```

## Configuration

### Subject Configuration

Edit `src/config/subject.ts` to customize the learning subject:

```typescript
export const subject = {
  name: "Your Subject",
  slug: "subject",
  tagline: "Master your skills with AI-powered lessons",
  // ...
};
```

### Theme Customization

Edit `src/theme/tokens.ts` and `tailwind.config.js` to change the color scheme:

- **Primary**: Indigo (#6366F1) -- main brand color
- **Secondary**: Teal (#14B8A6) -- accent color
- **Accent**: Amber (#F59E0B) -- highlights
- **Background**: Slate (#0F172A) -- dark mode base

### Integration Providers

Edit `src/config/integrations.ts` to configure AI, speech, and TTS providers.

## Project Structure

```
app/
  (auth)/          # Authentication screens (12 screens)
  (onboarding)/    # Onboarding flow (7 screens)
  (tabs)/
    home/          # Home feed, challenges, streaks
    learn/         # Lesson library, categories, vocab
    practice/      # Exercises, AI chat, voice practice
    schedule/      # Tutor booking, calendar, video
    profile/       # Stats, achievements, settings
  (modals)/
    subscription/  # Paywall, checkout, manage
  (states)/        # Error and empty states
  (launch)/        # Splash, maintenance, update screens
src/
  components/      # Reusable UI components
  config/          # Subject and integration config
  hooks/           # Custom hooks
  lib/             # Utilities, schemas, mock data
  stores/          # Zustand state management
  theme/           # Design tokens
docs/              # PRDs, architecture, flows (40+ flow PRDs)
```

## PRD Template System

This boilerplate was generated from a full Sigma Protocol workflow and includes 40+ flow PRDs in `docs/flows/` covering every user journey. These serve as living documentation and can be used as templates for new features.

## Screens Overview

| Section | Count | Description |
|---------|-------|-------------|
| Auth | 12 | Sign in/up, OAuth, 2FA, forgot password |
| Onboarding | 7 | Welcome, goals, level, motivation, fast win |
| Home | 8 | Feed, challenges, streaks, verb of day |
| Learn | 14 | Categories, lessons, vocab, stories, worksheets |
| Practice | 16 | Exercises, AI modes, voice, timed drills |
| Schedule | 10 | Calendar, booking, video room, history |
| Profile | 14 | Stats, achievements, settings, privacy |
| Subscription | 6 | Paywall, compare, checkout, manage, cancel |
| States | 7 | Error, empty, offline states |
| Launch | 3 | Splash, maintenance, update required |
| **Total** | **97** | |

## License

MIT
