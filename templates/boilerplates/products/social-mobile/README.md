# Social Mobile Boilerplate

A social network mobile app with feed, stories, chat, and camera. Built on Expo with real-time features.

## 🎯 Overview

Mobile-first social app with Instagram/Twitter-style features. Optimized for content creation and consumption.

## ✨ Features

### Feed
- Home feed
- Following feed
- Explore page
- Pull to refresh
- Infinite scroll

### Content
- Create posts
- Camera capture
- Gallery upload
- Filters & editing
- Stories (24h)

### Engagement
- Like posts
- Comments
- Share/repost
- Save posts

### Social
- User profiles
- Follow/unfollow
- Direct messages
- Notifications

## 🛠️ Tech Stack

- **Framework**: Expo (React Native)
- **Navigation**: Expo Router
- **Camera**: expo-camera, expo-image-manipulator
- **Gestures**: react-native-gesture-handler
- **Animations**: react-native-reanimated
- **Real-time**: Supabase Realtime
- **Styling**: NativeWind

## 📁 Project Structure

```
social-mobile/
├── app/
│   ├── (auth)/
│   │   └── login.tsx
│   ├── (tabs)/
│   │   ├── index.tsx         # Home feed
│   │   ├── search.tsx        # Explore
│   │   ├── create.tsx        # Create post
│   │   ├── activity.tsx      # Notifications
│   │   └── profile.tsx       # My profile
│   ├── post/[id].tsx         # Post detail
│   ├── user/[id].tsx         # User profile
│   ├── chat/[id].tsx         # DM chat
│   └── stories/[id].tsx      # Story viewer
├── components/
│   ├── feed/
│   │   ├── PostCard.tsx
│   │   ├── FeedList.tsx
│   │   └── StoryRing.tsx
│   ├── create/
│   │   ├── Camera.tsx
│   │   ├── Editor.tsx
│   │   └── PostComposer.tsx
│   ├── profile/
│   │   ├── ProfileHeader.tsx
│   │   └── PostGrid.tsx
│   └── chat/
│       ├── MessageList.tsx
│       └── ChatInput.tsx
└── lib/
    ├── api.ts
    ├── media.ts
    └── notifications.ts
```

## 📱 Key Components

### Feed with Pull-to-Refresh

```tsx
import { FlashList } from '@shopify/flash-list';
import Animated, { 
  useAnimatedScrollHandler 
} from 'react-native-reanimated';

export function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    const newPosts = await fetchPosts();
    setPosts(newPosts);
    setRefreshing(false);
  };

  return (
    <FlashList
      data={posts}
      renderItem={({ item }) => <PostCard post={item} />}
      estimatedItemSize={400}
      refreshing={refreshing}
      onRefresh={onRefresh}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
    />
  );
}
```

### Story Viewer with Gestures

```tsx
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  withTiming 
} from 'react-native-reanimated';

export function StoryViewer({ stories }) {
  const currentIndex = useSharedValue(0);
  const progress = useSharedValue(0);

  const tap = Gesture.Tap()
    .onEnd((event) => {
      if (event.x < width / 2) {
        // Previous story
        currentIndex.value = Math.max(0, currentIndex.value - 1);
      } else {
        // Next story
        currentIndex.value = Math.min(stories.length - 1, currentIndex.value + 1);
      }
    });

  const longPress = Gesture.LongPress()
    .onBegin(() => {
      // Pause story
      pauseTimer();
    })
    .onEnd(() => {
      // Resume story
      resumeTimer();
    });

  return (
    <GestureDetector gesture={Gesture.Exclusive(longPress, tap)}>
      <Animated.View>
        <StoryContent story={stories[currentIndex.value]} />
        <ProgressBar progress={progress} count={stories.length} />
      </Animated.View>
    </GestureDetector>
  );
}
```

## 🚀 Quick Start

```bash
cp -r templates/boilerplates/products/social-mobile ./my-social-mobile
cd my-social-mobile
npm install
npx expo start
```

## 📈 Extending

- **Reels/TikTok**: Vertical video feed
- **Live Streaming**: Go live feature
- **Voice Notes**: Audio messages
- **AR Filters**: Camera effects


