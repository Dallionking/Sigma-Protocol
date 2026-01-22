# Social App - Feature Breakdown

## Core Features

### 📱 Feed System

#### Home Feed
- [ ] Infinite scroll with virtualization
- [ ] Pull to refresh
- [ ] New posts indicator
- [ ] Chronological sorting
- [ ] Algorithmic sorting (optional)
- [ ] Content type tabs (All, Photos, Videos)

#### Post Types
- [ ] Text posts
- [ ] Single image posts
- [ ] Multi-image carousels
- [ ] Video posts (short-form)
- [ ] Link previews
- [ ] Polls (optional)

#### Post Actions
- [ ] Like/unlike with animation
- [ ] Comment (nested threads)
- [ ] Share/repost
- [ ] Save/bookmark
- [ ] Copy link
- [ ] Report post

#### Post Creation
- [ ] Text composer with character limit
- [ ] Image picker (camera/gallery)
- [ ] Image editing/filters
- [ ] Video recording/upload
- [ ] Location tagging
- [ ] User mentions (@)
- [ ] Hashtags (#)
- [ ] Draft saving

### 👤 User Profiles

#### Profile Page
- [ ] Profile photo upload/edit
- [ ] Cover photo support
- [ ] Display name & username
- [ ] Bio (with link support)
- [ ] Location
- [ ] Website link
- [ ] Join date
- [ ] Follower/following counts

#### Profile Content
- [ ] Posts grid view
- [ ] Posts list view
- [ ] Media-only tab
- [ ] Liked posts (optional)
- [ ] Saved posts (private)

#### Profile Actions
- [ ] Follow/unfollow
- [ ] Message
- [ ] Block
- [ ] Report
- [ ] Share profile

### 👥 Social Graph

#### Following System
- [ ] Follow users
- [ ] Unfollow users
- [ ] Follow requests (private accounts)
- [ ] Remove followers
- [ ] Followers list
- [ ] Following list
- [ ] Mutual followers indicator

#### Discovery
- [ ] Suggested users algorithm
- [ ] Mutual connections suggestions
- [ ] Trending users
- [ ] User categories (optional)

### 💬 Messaging

#### Conversations List
- [ ] Recent conversations
- [ ] Unread indicators
- [ ] Search conversations
- [ ] New message button
- [ ] Conversation previews

#### Direct Messages
- [ ] Real-time message delivery
- [ ] Text messages
- [ ] Image sharing
- [ ] Emoji reactions
- [ ] Message deletion
- [ ] Read receipts
- [ ] Typing indicators
- [ ] Message timestamps

#### Group Messaging
- [ ] Create group conversations
- [ ] Group naming/avatar
- [ ] Add/remove members
- [ ] Admin controls
- [ ] Leave group

### 🔔 Notifications

#### Notification Types
- [ ] New follower
- [ ] Like on post
- [ ] Comment on post
- [ ] Reply to comment
- [ ] Mention in post/comment
- [ ] New message
- [ ] Follow request

#### Notification Management
- [ ] In-app notification feed
- [ ] Push notifications
- [ ] Notification grouping
- [ ] Mark as read
- [ ] Notification preferences
- [ ] Quiet hours

### 🔍 Search & Discovery

#### Search
- [ ] User search
- [ ] Hashtag search
- [ ] Content search
- [ ] Recent searches
- [ ] Search suggestions

#### Explore
- [ ] Trending hashtags
- [ ] Popular posts
- [ ] Suggested users
- [ ] Category browsing
- [ ] Location-based discovery

### ⚙️ Settings & Privacy

#### Account Settings
- [ ] Edit profile
- [ ] Change password
- [ ] Email/phone management
- [ ] Two-factor authentication
- [ ] Connected accounts

#### Privacy Settings
- [ ] Private account toggle
- [ ] Who can message me
- [ ] Who can see my activity
- [ ] Blocked users list
- [ ] Muted users list
- [ ] Muted keywords

#### Content Preferences
- [ ] Content language
- [ ] Sensitive content filter
- [ ] Notification sounds
- [ ] Auto-play videos

## Premium Features (Subscription)

### ✓ Verification
- [ ] Verified badge
- [ ] Priority in search
- [ ] Anti-impersonation protection

### 📊 Analytics
- [ ] Profile views
- [ ] Post performance
- [ ] Follower growth
- [ ] Best posting times
- [ ] Audience demographics

### 🎨 Customization
- [ ] Custom profile themes
- [ ] Exclusive post formats
- [ ] Extended media uploads
- [ ] Longer posts

### 🚫 Ad-Free
- [ ] Remove promoted content
- [ ] No in-feed ads

## Moderation Features

### User Safety
- [ ] Block users
- [ ] Restrict users (shadow block)
- [ ] Mute users
- [ ] Keyword filtering
- [ ] Comment filtering

### Reporting System
- [ ] Report posts
- [ ] Report users
- [ ] Report messages
- [ ] Report categories
- [ ] Report follow-up

### Admin Tools (Backend)
- [ ] Content review queue
- [ ] User moderation actions
- [ ] Automated flagging
- [ ] Appeal system

## Technical Features

### 💾 Data & Sync
- [ ] Optimistic updates
- [ ] Offline post queueing
- [ ] Background sync
- [ ] Cache management
- [ ] Data export

### ⚡ Performance
- [ ] Image lazy loading
- [ ] Feed virtualization
- [ ] Prefetching
- [ ] Memory optimization
- [ ] Battery-efficient realtime

### 🔒 Security
- [ ] End-to-end encryption ready (messages)
- [ ] Secure media storage
- [ ] Rate limiting
- [ ] Spam prevention
- [ ] Account security alerts

## Module Dependencies

```
┌─────────────────────────────────────────────────────────┐
│                      App Shell                          │
├─────────────────────────────────────────────────────────┤
│   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │
│   │  Feed   │  │ Social  │  │Messaging│  │ Notifs  │   │
│   │ Module  │  │ Module  │  │ Module  │  │ Module  │   │
│   └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘   │
│        │            │            │            │         │
│        └────────────┴──────┬─────┴────────────┘         │
│                            │                            │
│         ┌──────────────────┼──────────────────┐         │
│         │                  │                  │         │
│   ┌─────┴─────┐    ┌──────┴──────┐    ┌─────┴─────┐   │
│   │  Zustand  │    │ React Query │    │ Supabase  │   │
│   │  (Local)  │    │  (Remote)   │    │ Realtime  │   │
│   └───────────┘    └─────────────┘    └───────────┘   │
└─────────────────────────────────────────────────────────┘
```

## API Endpoints Required

```
# Posts
POST   /api/posts              # Create post
GET    /api/posts/feed         # Get feed
GET    /api/posts/:id          # Get single post
DELETE /api/posts/:id          # Delete post

# Comments
POST   /api/posts/:id/comments # Add comment
GET    /api/posts/:id/comments # Get comments
DELETE /api/comments/:id       # Delete comment

# Likes
POST   /api/posts/:id/like     # Like post
DELETE /api/posts/:id/like     # Unlike post

# Social
POST   /api/users/:id/follow   # Follow user
DELETE /api/users/:id/follow   # Unfollow user
GET    /api/users/:id/followers
GET    /api/users/:id/following

# Messaging
GET    /api/conversations      # List conversations
POST   /api/conversations      # Start conversation
GET    /api/conversations/:id/messages
POST   /api/conversations/:id/messages

# Notifications
GET    /api/notifications
PUT    /api/notifications/read

# Search
GET    /api/search/users
GET    /api/search/posts
GET    /api/search/hashtags
```

## Screen Flow

```
App Launch
    │
    ├── Not Authenticated ──► Onboarding ──► Profile Setup ──► Feed
    │
    └── Authenticated
            │
            ├── Feed Tab
            │       │
            │       ├── View Posts
            │       ├── Create Post ──► Composer Modal
            │       └── Post Detail ──► Comments
            │
            ├── Discover Tab
            │       │
            │       ├── Search
            │       └── Explore Grid
            │
            ├── Notifications Tab
            │       │
            │       └── Activity Feed
            │
            ├── Messages Tab
            │       │
            │       ├── Conversation List
            │       └── Chat View
            │
            └── Profile Tab
                    │
                    ├── My Profile
                    ├── Edit Profile
                    └── Settings
```

## Realtime Subscriptions

```typescript
// Required realtime channels
const channels = {
  feed: `feed:${userId}`,           // New posts in following
  messages: `messages:${userId}`,    // New messages
  notifications: `notifs:${userId}`, // New notifications
  conversation: `chat:${convId}`,    // Active chat typing/messages
}
```


