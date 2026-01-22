# Courses LMS Mobile Boilerplate

A mobile companion app for online courses. Built on Expo with video player, offline downloads, and progress sync.

## 🎯 Overview

Mobile app companion for the courses-lms web platform. Optimized for learning on-the-go with offline support.

## ✨ Features

### Video Learning
- Video player with controls
- Background playback
- Resume from last position
- Playback speed control
- Picture-in-picture

### Offline Support
- Download lessons for offline
- Download management
- Storage usage display
- Auto-delete watched
- Quality selection

### Progress
- Progress sync with web
- Continue watching
- Completion tracking
- Streak counter
- Study reminders

### Course Experience
- Course catalog
- Lesson navigation
- Notes per lesson
- Bookmarks
- Quiz support

### Account
- User profile
- Download settings
- Notification preferences
- Sign out

## 🛠️ Tech Stack

- **Framework**: Expo (React Native)
- **Navigation**: Expo Router
- **Video**: expo-av
- **Storage**: expo-file-system
- **State**: Zustand + React Query
- **Auth**: Supabase Auth
- **Styling**: NativeWind (TailwindCSS)

## 📁 Project Structure

```
courses-lms-mobile/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx          # Home / Continue learning
│   │   ├── courses.tsx        # My courses
│   │   ├── downloads.tsx      # Downloaded content
│   │   └── profile.tsx        # Settings
│   └── course/
│       ├── [id].tsx           # Course detail
│       └── lesson/[id].tsx    # Video player
├── components/
│   ├── video/
│   │   ├── VideoPlayer.tsx
│   │   ├── VideoControls.tsx
│   │   └── ProgressBar.tsx
│   ├── course/
│   │   ├── CourseCard.tsx
│   │   ├── LessonItem.tsx
│   │   └── ProgressIndicator.tsx
│   └── downloads/
│       ├── DownloadButton.tsx
│       └── DownloadManager.tsx
├── lib/
│   ├── api.ts
│   ├── auth.ts
│   ├── downloads.ts
│   └── progress.ts
└── stores/
    ├── downloads.ts
    └── progress.ts
```

## 📱 Key Components

### Video Player

```tsx
import { Video, ResizeMode } from 'expo-av';
import { useProgress } from '@/stores/progress';

export function VideoPlayer({ lesson, onComplete }) {
  const videoRef = useRef<Video>(null);
  const { updateProgress } = useProgress();

  const handlePlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      // Track watch time
      updateProgress(lesson.id, {
        watchTime: status.positionMillis / 1000,
        completed: status.didJustFinish,
      });

      if (status.didJustFinish) {
        onComplete();
      }
    }
  };

  return (
    <Video
      ref={videoRef}
      source={{ uri: lesson.videoUrl }}
      useNativeControls
      resizeMode={ResizeMode.CONTAIN}
      onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
      positionMillis={lesson.resumePosition}
    />
  );
}
```

### Download Manager

```tsx
import * as FileSystem from 'expo-file-system';
import { useDownloads } from '@/stores/downloads';

export async function downloadLesson(lesson: Lesson) {
  const downloadDir = FileSystem.documentDirectory + 'downloads/';
  const filePath = downloadDir + `${lesson.id}.mp4`;

  // Create directory if needed
  await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });

  // Start download
  const download = FileSystem.createDownloadResumable(
    lesson.videoUrl,
    filePath,
    {},
    (progress) => {
      const percent = progress.totalBytesWritten / progress.totalBytesExpectedToWrite;
      updateDownloadProgress(lesson.id, percent);
    }
  );

  const result = await download.downloadAsync();
  
  if (result?.uri) {
    saveDownload(lesson.id, result.uri);
  }
}
```

## 🚀 Quick Start

```bash
cp -r templates/boilerplates/products/courses-lms-mobile ./my-courses-mobile
cd my-courses-mobile
npm install
npx expo start
```

## 📈 Extending

- **Certificates**: View and share certificates
- **Push Notifications**: Course updates, reminders
- **Widgets**: iOS widgets for continue learning
- **AirPlay/Chromecast**: Cast to TV


