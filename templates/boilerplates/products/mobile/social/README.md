# Social App Boilerplate

> Complete mobile social networking shell for community apps, dating platforms, and professional networks

## Overview

The Social boilerplate provides the foundation for building engaging social mobile applications. From feed algorithms to messaging infrastructure, this shell handles the complex social patterns so you can focus on building your unique community.

**Extends**: [expo-mobile](../../../expo-mobile)

## Screenshots

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   📱 Feed       │  │   👤 Profile    │  │   💬 Messages   │
│                 │  │                 │  │                 │
│  ┌───────────┐  │  │  ┌─────────┐   │  │  ┌───────────┐  │
│  │ 👤 User   │  │  │  │  📷    │   │  │  │ Alex      │  │
│  │ Posted... │  │  │  └─────────┘   │  │  │ Hey! 👋   │  │
│  │ ❤️ 234 💬 12│  │  │  @username    │  │  └───────────┘  │
│  └───────────┘  │  │  │              │  │  ┌───────────┐  │
│  ┌───────────┐  │  │  │ 1.2K  │ 500 │  │  │ Jordan    │  │
│  │ 👤 User2  │  │  │  │Follow │Foll │  │  │ Nice! 🔥  │  │
│  │ Check...  │  │  │  │              │  │  └───────────┘  │
│  └───────────┘  │  │  │ [ Edit ]     │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## Quick Start

```bash
# Initialize new social app
sigma scaffold my-social-app --boilerplate=mobile-social

# Install dependencies
cd my-social-app
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
| Backend | Supabase + Realtime |
| Messaging | Supabase Realtime / Stream |
| Media | expo-image-picker + Supabase Storage |
| Push | expo-notifications + OneSignal |
| Analytics | Mixpanel / Amplitude ready |

## Project Structure

```
mobile-social/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx           # Feed
│   │   ├── discover/           # Explore/Search
│   │   ├── notifications/      # Activity feed
│   │   ├── messages/           # DMs list
│   │   └── profile/            # Current user profile
│   ├── (modals)/
│   │   ├── create-post.tsx     # New post composer
│   │   ├── comments.tsx        # Post comments
│   │   └── user-list.tsx       # Followers/Following
│   ├── user/
│   │   └── [id].tsx            # Other user profiles
│   ├── post/
│   │   └── [id].tsx            # Single post view
│   └── chat/
│       └── [id].tsx            # Conversation view
├── components/
│   ├── feed/
│   │   ├── PostCard.tsx
│   │   ├── FeedList.tsx
│   │   └── CreatePostButton.tsx
│   ├── profile/
│   │   ├── ProfileHeader.tsx
│   │   ├── ProfileTabs.tsx
│   │   └── FollowButton.tsx
│   ├── messaging/
│   │   ├── ChatBubble.tsx
│   │   ├── MessageInput.tsx
│   │   └── ConversationItem.tsx
│   └── ui/
├── hooks/
│   ├── use-feed.ts             # Feed data & pagination
│   ├── use-follow.ts           # Follow/unfollow logic
│   ├── use-realtime.ts         # Realtime subscriptions
│   └── use-upload.ts           # Media upload handling
├── lib/
│   ├── realtime/               # Realtime connection
│   └── media/                  # Media processing
└── modules/
    ├── feed/                   # Feed algorithm
    ├── social/                 # Follow/like system
    ├── messaging/              # Chat functionality
    └── notifications/          # Push & in-app
```

## Key Features

### 📱 Feed System
- Infinite scroll feed
- Pull to refresh
- Chronological & algorithmic options
- Content type filtering
- Muted users/keywords

### 👤 Profiles
- Customizable profile pages
- Profile photo & cover image
- Bio with links
- Followers/following counts
- User posts grid/list

### 💬 Messaging
- Real-time direct messages
- Group conversations
- Read receipts
- Typing indicators
- Media sharing in chat

### 🔔 Notifications
- Push notifications
- In-app activity feed
- Notification preferences
- Batch notification handling

### 🔍 Discovery
- User search
- Hashtag/topic search
- Suggested users
- Trending content

## Database Schema

```sql
-- Core tables included
users
posts
comments
likes
follows
conversations
messages
notifications
blocks
reports
```

## Realtime Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Mobile App                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │    Feed     │  │   Messages  │  │   Notifs    │     │
│  │  Component  │  │  Component  │  │  Component  │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
│         │                │                │             │
│         └────────────────┼────────────────┘             │
│                          │                              │
│                 ┌────────┴────────┐                     │
│                 │ Realtime Hook   │                     │
│                 │ (use-realtime)  │                     │
│                 └────────┬────────┘                     │
└─────────────────────────│──────────────────────────────┘
                          │
                 ┌────────┴────────┐
                 │    Supabase     │
                 │    Realtime     │
                 │   (WebSocket)   │
                 └─────────────────┘
```

## Configuration

```typescript
// config/social.ts
export const socialConfig = {
  feed: {
    algorithm: 'chronological', // or 'engagement'
    postsPerPage: 20,
    enableStories: false
  },
  messaging: {
    maxGroupSize: 50,
    enableReadReceipts: true,
    enableTypingIndicators: true
  },
  content: {
    maxPostLength: 280,
    allowedMediaTypes: ['image', 'video'],
    maxMediaPerPost: 4
  },
  moderation: {
    enableReporting: true,
    enableBlocking: true,
    autoModeration: false
  }
}
```

## Premium Features (RevenueCat)

The boilerplate includes subscription gates for:
- Verified badges
- Extended post length
- Priority in discovery
- Advanced analytics
- Ad-free experience

## Moderation System

Built-in moderation features:
- User blocking
- Content reporting
- Word filtering (customizable)
- Rate limiting
- Spam detection hooks

## Customization Guide

### Swap Feed Algorithm
Replace the default chronological feed:

```typescript
// lib/feed/algorithm.ts
export const feedAlgorithm = {
  rank: async (posts, userId) => {
    // Your ranking logic
    return rankedPosts
  }
}
```

### Add Content Types
Extend beyond text/image posts:

```typescript
// modules/feed/content-types.ts
export const contentTypes = {
  text: TextPostRenderer,
  image: ImagePostRenderer,
  video: VideoPostRenderer,
  poll: PollPostRenderer, // Add custom types
}
```

## See Also

- [FEATURES.md](./FEATURES.md) - Complete feature breakdown
- [expo-mobile](../../../expo-mobile) - Base boilerplate


