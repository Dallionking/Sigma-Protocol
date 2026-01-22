# Marketplace Mobile Boilerplate

A mobile marketplace app for buying and selling. Built on Expo with camera upload, messaging, and location-based search.

## 🎯 Overview

Mobile companion for the marketplace web platform. Optimized for browsing, selling with camera, and real-time messaging.

## ✨ Features

### Browsing
- Product feed
- Category browsing
- Search with filters
- Location-based results
- Saved/favorites

### Selling
- Camera photo capture
- Gallery upload
- Listing creation
- Price suggestions
- Quick listing flow

### Messaging
- Conversation threads
- Real-time messages
- Push notifications
- Image sharing
- Quick replies

### Transactions
- Order management
- Payment flow
- Order tracking
- Reviews

## 🛠️ Tech Stack

- **Framework**: Expo (React Native)
- **Navigation**: Expo Router
- **Camera**: expo-camera, expo-image-picker
- **Location**: expo-location
- **Push**: expo-notifications
- **Real-time**: Supabase Realtime
- **Styling**: NativeWind

## 📁 Project Structure

```
marketplace-mobile/
├── app/
│   ├── (auth)/
│   │   └── login.tsx
│   ├── (tabs)/
│   │   ├── index.tsx         # Home feed
│   │   ├── search.tsx        # Search & filters
│   │   ├── sell.tsx          # Create listing
│   │   ├── messages.tsx      # Conversations
│   │   └── profile.tsx       # My account
│   ├── listing/[id].tsx      # Listing detail
│   ├── chat/[id].tsx         # Chat screen
│   └── order/[id].tsx        # Order detail
├── components/
│   ├── listing/
│   │   ├── ListingCard.tsx
│   │   ├── ImageGallery.tsx
│   │   └── PriceTag.tsx
│   ├── sell/
│   │   ├── CameraCapture.tsx
│   │   ├── ListingForm.tsx
│   │   └── ImageEditor.tsx
│   └── chat/
│       ├── MessageBubble.tsx
│       └── ChatInput.tsx
└── lib/
    ├── api.ts
    ├── camera.ts
    ├── location.ts
    └── messaging.ts
```

## 📱 Key Components

### Camera Capture

```tsx
import { Camera, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

export function ListingCamera({ onCapture }) {
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const cameraRef = useRef<Camera>(null);

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });
      onCapture(photo.uri);
    }
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      onCapture(result.assets.map(a => a.uri));
    }
  };

  return (
    <Camera ref={cameraRef} type={CameraType.back}>
      <CameraControls 
        onCapture={takePicture}
        onGallery={pickFromGallery}
      />
    </Camera>
  );
}
```

### Real-time Chat

```tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useChat(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Load initial messages
    loadMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const sendMessage = async (content: string) => {
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      content,
      sender_id: userId,
    });
  };

  return { messages, sendMessage };
}
```

## 🚀 Quick Start

```bash
cp -r templates/boilerplates/products/marketplace-mobile ./my-marketplace-mobile
cd my-marketplace-mobile
npm install
npx expo start
```

## 📈 Extending

- **Barcode Scanner**: Scan product barcodes
- **AR Preview**: AR product visualization
- **Voice Search**: Voice-to-text search
- **Share Extension**: Share from other apps


