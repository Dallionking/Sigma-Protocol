# Social Community Boilerplate

A social network platform with profiles, posts, and real-time interactions. Built on Next.js with feeds, messaging, and notifications.

## 🎯 Overview

Build platforms like Twitter, Reddit, or Discord communities. Perfect for niche communities, fan platforms, or internal company networks.

## ✨ Features

### Profiles
- User profiles
- Bio and links
- Profile/cover photos
- Follow/following
- Activity feed
- Badge system

### Content
- Create posts
- Rich media (images, videos)
- Hashtags
- Mentions
- Comments & replies
- Reactions/likes
- Share/repost

### Feed
- Home feed
- Trending content
- Following feed
- Topic feeds
- Infinite scroll

### Messaging
- Direct messages
- Group chats
- Real-time updates
- Read receipts
- Media sharing

### Notifications
- Activity notifications
- Push notifications
- Email digests
- Notification preferences

### Discovery
- Search users
- Search posts
- Trending topics
- Suggested follows
- Explore page

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Storage**: Supabase Storage
- **AI**: OpenAI (content moderation)
- **Styling**: TailwindCSS + shadcn/ui

## 📊 Database Schema

```prisma
model User {
  id          String    @id @default(cuid())
  username    String    @unique
  email       String    @unique
  name        String?
  bio         String?
  avatar      String?
  coverImage  String?
  website     String?
  location    String?
  verified    Boolean   @default(false)
  posts       Post[]
  comments    Comment[]
  likes       Like[]
  followers   Follow[]  @relation("following")
  following   Follow[]  @relation("follower")
  messages    Message[]
  notifications Notification[]
  createdAt   DateTime  @default(now())
}

model Post {
  id          String    @id @default(cuid())
  content     String
  images      String[]
  author      User      @relation(fields: [authorId], references: [id])
  authorId    String
  parent      Post?     @relation("replies", fields: [parentId], references: [id])
  parentId    String?
  replies     Post[]    @relation("replies")
  likes       Like[]
  comments    Comment[]
  hashtags    String[]
  mentions    String[]
  repostOf    Post?     @relation("reposts", fields: [repostOfId], references: [id])
  repostOfId  String?
  reposts     Post[]    @relation("reposts")
  viewCount   Int       @default(0)
  createdAt   DateTime  @default(now())
}

model Comment {
  id          String   @id @default(cuid())
  content     String
  post        Post     @relation(fields: [postId], references: [id])
  postId      String
  author      User     @relation(fields: [authorId], references: [id])
  authorId    String
  parent      Comment? @relation("replies", fields: [parentId], references: [id])
  parentId    String?
  replies     Comment[] @relation("replies")
  likes       Like[]
  createdAt   DateTime @default(now())
}

model Like {
  id          String   @id @default(cuid())
  user        User     @relation(fields: [userId], references: [id])
  userId      String
  post        Post?    @relation(fields: [postId], references: [id])
  postId      String?
  comment     Comment? @relation(fields: [commentId], references: [id])
  commentId   String?
  createdAt   DateTime @default(now())
  
  @@unique([userId, postId])
  @@unique([userId, commentId])
}

model Follow {
  id          String   @id @default(cuid())
  follower    User     @relation("follower", fields: [followerId], references: [id])
  followerId  String
  following   User     @relation("following", fields: [followingId], references: [id])
  followingId String
  createdAt   DateTime @default(now())
  
  @@unique([followerId, followingId])
}

model Message {
  id              String   @id @default(cuid())
  content         String
  sender          User     @relation(fields: [senderId], references: [id])
  senderId        String
  conversationId  String
  read            Boolean  @default(false)
  createdAt       DateTime @default(now())
}

model Notification {
  id          String   @id @default(cuid())
  type        NotificationType
  user        User     @relation(fields: [userId], references: [id])
  userId      String
  actorId     String?
  postId      String?
  read        Boolean  @default(false)
  createdAt   DateTime @default(now())
}

enum NotificationType {
  LIKE
  COMMENT
  FOLLOW
  MENTION
  REPOST
}
```

## 🚀 Quick Start

```bash
cp -r templates/boilerplates/products/social-community ./my-community
cd my-community
npm install
cp .env.example .env.local
npx prisma migrate dev
npm run dev
```

## 📈 Extending

- **Stories**: Ephemeral content
- **Spaces**: Audio rooms
- **Communities**: Sub-groups
- **Monetization**: Tips, subscriptions
- **Mobile**: Use with social-mobile companion


