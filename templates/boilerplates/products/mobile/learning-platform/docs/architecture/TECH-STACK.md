# Learning Platform — Technology Stack

**Version:** 1.0 | **Date:** 2025-12-17  
**MCP Compatibility Score:** 10/10

---

## Stack Summary

| Layer | Technology | Version | Rationale |
|-------|------------|---------|-----------|
| **Mobile Framework** | Expo (React Native) | SDK 52+ | Cross-platform, managed workflow |
| **Language** | TypeScript | 5.3+ | Type safety, DX |
| **UI Styling** | NativeWind | v4 | Tailwind CSS for RN |
| **Navigation** | Expo Router | v4 | File-based routing |
| **State** | Zustand + TanStack Query | v5 / v5 | Simple + server state |
| **Database** | Supabase (PostgreSQL) | 15+ | BaaS with RLS |
| **Auth** | Supabase Auth | latest | Email, social, phone |
| **Storage** | Supabase Storage | latest | Media files |
| **API** | Supabase Edge Functions | Deno | Serverless |
| **AI LLM** | OpenAI GPT-4o | latest | Conversational AI |
| **AI TTS** | ElevenLabs | v2 | Pronunciation audio |
| **AI STT** | OpenAI Whisper | latest | Speech recognition |
| **Video Calls** | LiveKit | latest | WebRTC infrastructure |
| **Payments** | RevenueCat | latest | IAP management |
| **Builds** | Expo EAS | latest | iOS/Android builds |

---

## Frontend Stack

### Mobile Framework

**Expo SDK 52+**

```json
{
  "expo": {
    "sdkVersion": "52.0.0",
    "platforms": ["ios", "android"]
  }
}
```

**Why Expo:**
- Single codebase for iOS + Android
- Managed workflow reduces native complexity
- EAS for builds, submissions, OTA updates
- Rich ecosystem of pre-built packages

### UI & Styling

**NativeWind v4 (Tailwind CSS for React Native)**

```typescript
// Consistent styling with Tailwind utilities
<View className="flex-1 bg-zinc-900 p-4">
  <Text className="text-2xl font-bold text-white">
    Welcome!
  </Text>
  <TouchableOpacity className="bg-amber-500 rounded-xl py-4 mt-4">
    <Text className="text-black font-semibold text-center">
      Start Learning
    </Text>
  </TouchableOpacity>
</View>
```

**Why NativeWind:**
- Familiar Tailwind syntax
- Consistent design tokens
- Dark mode support built-in
- Smaller bundle than alternatives

### Navigation

**Expo Router v4 (File-based routing)**

```
app/
├── (auth)/
│   ├── login.tsx        → /login
│   └── register.tsx     → /register
├── (tabs)/
│   ├── home.tsx         → /home
│   ├── learn.tsx        → /learn
│   └── _layout.tsx      → Tab navigator
├── lessons/
│   └── [id].tsx         → /lessons/:id
└── _layout.tsx          → Root layout
```

**Why Expo Router:**
- Familiar file-based routing (like Next.js)
- Deep linking out of the box
- Type-safe route parameters
- Automatic code splitting

### State Management

**Zustand (Local State) + TanStack Query (Server State)**

```typescript
// Local state with Zustand
const useAppStore = create((set) => ({
  soundEnabled: true,
  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
}));

// Server state with TanStack Query
const { data: lessons } = useQuery({
  queryKey: ['lessons', categoryId],
  queryFn: () => fetchLessons(categoryId),
});
```

**Why This Combination:**
- Zustand: Minimal boilerplate, easy persistence
- TanStack Query: Caching, background refresh, optimistic updates
- Clear separation of concerns

### Icons

**Lucide React Native**

```typescript
import { Book, Mic, Video, Trophy } from 'lucide-react-native';

<Book size={24} color="#fbbf24" />
```

**Why Lucide:**
- Consistent, modern icon set
- Tree-shakeable (only import what you need)
- React Native compatible

---

## Backend Stack

### Database & Auth

**Supabase (PostgreSQL 15+)**

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
    },
  }
);
```

**Supabase Features Used:**
- PostgreSQL database with RLS
- Authentication (email, Apple, Google)
- Realtime subscriptions
- Storage for media files
- Edge Functions for serverless API

**Why Supabase:**
- All-in-one BaaS (reduces complexity)
- PostgreSQL (relational model fits learning data)
- RLS for authorization at database level
- Official Expo integration

### Edge Functions

**Deno Runtime**

```typescript
// supabase/functions/ai-chat/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const { messages } = await req.json();
  
  // Call OpenAI
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages,
    }),
  });
  
  return new Response(JSON.stringify(await response.json()));
});
```

---

## AI Services Stack

### OpenAI GPT-4o (LLM)

**Use Cases:**
- AI Tutor chat
- Grammar explanations
- Story mode generation
- Drill mode exercises
- Corrections and feedback

```typescript
const completion = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [
    {
      role: 'system',
      content: `You are AI Tutor's AI teaching assistant. 
                Help students learn conversational skills with 
                warmth, humor, and cultural context.`,
    },
    ...userMessages,
  ],
  temperature: 0.7,
});
```

**Pricing:** $2.50/1M input tokens, $10/1M output tokens

### ElevenLabs (TTS)

**Use Cases:**
- Lesson narration
- Vocabulary pronunciation
- "Talk to AI Tutor Mode" voice output
- Voice responses in AI chat

```typescript
const audioStream = await elevenlabs.textToSpeech.convert(voiceId, {
  text: 'Hello, how are you today?',
  model_id: 'eleven_multilingual_v2',
  voice_settings: {
    stability: 0.5,
    similarity_boost: 0.75,
  },
});
```

**Why ElevenLabs:**
- Best-in-class pronunciation
- Voice cloning for AI Tutor's voice
- Low latency streaming
- Multilingual model

**Pricing:** ~$0.18/minute at Creator tier

### OpenAI Whisper (STT)

**Use Cases:**
- Speaking exercise transcription
- Pronunciation feedback input
- Voice chat transcription

```typescript
const transcription = await openai.audio.transcriptions.create({
  file: audioFile,
  model: 'whisper-1',
  language: 'es',
  response_format: 'verbose_json',
  timestamp_granularities: ['word'],
});
```

**Why Whisper:**
- Excellent speech recognition
- Word-level timestamps for analysis
- Affordable pricing ($0.006/min)
- Same provider as LLM (unified billing)

---

## Video & Real-time Stack

### LiveKit (Video Calls)

**Use Cases:**
- 1:1 tutoring sessions
- Group classes
- Screen sharing for worksheets
- Future: Voice AI agents

```typescript
import { useRoom, VideoTrack } from '@livekit/react-native';

function VideoCallScreen({ token }) {
  const room = useRoom();
  
  useEffect(() => {
    room.connect(LIVEKIT_URL, token);
    return () => room.disconnect();
  }, [token]);
  
  return (
    <View>
      {room.remoteParticipants.map((p) => (
        <VideoTrack key={p.sid} participant={p} />
      ))}
    </View>
  );
}
```

**Why LiveKit:**
- Official React Native SDK
- Expo plugin available
- <500ms latency
- Open-source (can self-host)
- AI agents framework for future

**Pricing:** $0.004/min voice, $0.03/min video

---

## Payments Stack

### RevenueCat (In-App Purchases)

**Use Cases:**
- iOS App Store subscriptions
- Google Play subscriptions
- Cross-platform purchase restoration
- Subscription analytics

```typescript
import Purchases from 'react-native-purchases';

// Initialize
await Purchases.configure({
  apiKey: Platform.OS === 'ios' 
    ? REVENUECAT_IOS_KEY 
    : REVENUECAT_ANDROID_KEY,
});

// Get offerings
const offerings = await Purchases.getOfferings();

// Make purchase
const { customerInfo } = await Purchases.purchasePackage(
  offerings.current.availablePackages[0]
);
```

**Why RevenueCat:**
- Abstracts StoreKit/Play Billing complexity
- Webhooks sync to Supabase
- Built-in analytics dashboard
- Expo-compatible

**Pricing:** Free to $2,500 MTR, then 1%

---

## Infrastructure Stack

### Expo EAS (Builds & Updates)

**Services:**
- **EAS Build:** iOS/Android builds in the cloud
- **EAS Submit:** Automated store submissions
- **EAS Update:** OTA updates without store review
- **EAS Metadata:** App store metadata management

```bash
# Build for production
eas build --profile production --platform all

# Submit to stores
eas submit --platform all

# OTA update
eas update --channel production --message "Bug fix v1.0.1"
```

### Hosting

| Component | Provider | Notes |
|-----------|----------|-------|
| Mobile App | EAS Build | Binary builds |
| Database | Supabase Cloud | Managed PostgreSQL |
| Edge Functions | Supabase Edge | Deno runtime |
| Media Storage | Supabase Storage | CDN included |
| Admin Dashboard | Vercel | Web-based (future) |

---

## Development Tools

### Code Quality

| Tool | Purpose |
|------|---------|
| TypeScript | Type safety |
| ESLint | Code linting |
| Prettier | Code formatting |
| Husky | Git hooks |
| lint-staged | Pre-commit linting |

### Testing

| Tool | Purpose |
|------|---------|
| Vitest | Unit testing |
| React Native Testing Library | Component testing |
| Maestro | E2E testing |
| MSW | API mocking |

### Monitoring

| Tool | Purpose |
|------|---------|
| Sentry | Error tracking |
| Expo Analytics | Usage analytics |
| RevenueCat Dashboard | Subscription analytics |
| Supabase Dashboard | Database monitoring |

---

## MCP Compatibility

| Service | MCP Server | Status |
|---------|------------|--------|
| Supabase | Built-in Cursor | ✅ Ready |
| Expo | `https://mcp.expo.dev/mcp` | ✅ Ready |
| RevenueCat | `https://mcp.revenuecat.ai/mcp` | ✅ Ready |
| Render | Built-in Cursor | ✅ Ready |
| Vercel | `@vercel/mcp-adapter` | ✅ Ready |

**Total MCP Score: 10/10** — All core services have MCP support.

---

## Package Summary

### Core Dependencies

```json
{
  "dependencies": {
    "expo": "~52.0.0",
    "expo-router": "~4.0.0",
    "react-native": "0.76.x",
    "nativewind": "^4.0.0",
    "@supabase/supabase-js": "^2.45.0",
    "zustand": "^5.0.0",
    "@tanstack/react-query": "^5.0.0",
    "@livekit/react-native": "^2.0.0",
    "react-native-purchases": "^8.0.0",
    "expo-image": "~2.0.0",
    "expo-av": "~15.0.0",
    "expo-notifications": "~0.30.0",
    "lucide-react-native": "^0.400.0",
    "react-hook-form": "^7.50.0",
    "zod": "^3.23.0"
  }
}
```

### Dev Dependencies

```json
{
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/react": "~18.3.0",
    "eslint": "^8.50.0",
    "prettier": "^3.2.0",
    "vitest": "^2.0.0",
    "@testing-library/react-native": "^12.5.0"
  }
}
```

---

*Tech Stack Document Version: 1.0*  
*Last Updated: 2025-12-17*

