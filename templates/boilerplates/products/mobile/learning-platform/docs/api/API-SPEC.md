# Learning Platform — API Specification

**Version:** 1.0 | **Date:** 2025-12-17  
**API Style:** Supabase Client SDK + Edge Functions  
**Base URL:** `https://[PROJECT_REF].supabase.co`

---

## Overview

The API consists of two parts:
1. **Supabase Client SDK** — Direct database operations with RLS
2. **Edge Functions** — Custom endpoints for AI, video tokens, webhooks

---

## Authentication

### Auth Endpoints (Supabase Auth)

All authentication is handled by Supabase Auth SDK:

```typescript
// Sign up with email
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
});

// Sign in with email
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});

// Sign in with Apple
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'apple',
});

// Sign in with Google
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
});

// Sign out
await supabase.auth.signOut();

// Get current user
const { data: { user } } = await supabase.auth.getUser();
```

### Token Management

- **Access Token:** JWT, expires in 1 hour
- **Refresh Token:** Opaque string, expires in 7 days
- **Auto-refresh:** Supabase SDK handles token refresh automatically
- **Storage:** `@react-native-async-storage/async-storage`

---

## Edge Functions

### POST `/functions/v1/ai-chat`

Send message to AI Tutor.

**Request:**
```json
{
  "mode": "conversation" | "grammar" | "drill" | "story",
  "messages": [
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ],
  "context": {
    "lesson_id": "uuid (optional)",
    "user_level": "beginner" | "intermediate" | "advanced",
    "topic": "greetings"
  }
}
```

**Response:**
```json
{
  "response": {
    "role": "assistant",
    "content": "Hello! I'm doing great, thanks for asking! And you? 😊\n\nYour progress is looking great! I noticed you used the informal 'how are you?' which is perfect for casual conversations."
  },
  "corrections": [
    {
      "original": "none",
      "corrected": "none",
      "explanation": "Perfect usage!"
    }
  ],
  "vocabulary": [
    {
      "word": "preguntar",
      "translation": "to ask",
      "example": "Thanks for asking"
    }
  ],
  "usage": {
    "prompt_tokens": 245,
    "completion_tokens": 87
  }
}
```

**Rate Limits:**
| Tier | Daily Limit |
|------|-------------|
| Free | 10 messages |
| Essential | Unlimited |
| Pro | Unlimited |
| VIP | Unlimited |

---

### POST `/functions/v1/ai-voice`

Voice-to-voice conversation with AI tutor.

**Request:**
```json
{
  "audio_base64": "BASE64_ENCODED_AUDIO",
  "mode": "conversation" | "pronunciation",
  "context": {
    "lesson_id": "uuid (optional)",
    "target_phrase": "Hello (for pronunciation mode)"
  }
}
```

**Response:**
```json
{
  "transcription": "Hello, how are you today",
  "response_text": "Good morning! Doing great, thanks.",
  "response_audio_url": "https://storage.supabase.co/audio/response_123.mp3",
  "pronunciation_feedback": {
    "overall_score": 85,
    "phoneme_scores": [
      { "phoneme": "b", "score": 90 },
      { "phoneme": "u", "score": 80 }
    ],
    "suggestions": ["Try to elongate the 'u' sound in 'buenos'"]
  }
}
```

**Tier Requirements:**
- Essential+: Required
- Free: Not available

---

### POST `/functions/v1/pronunciation-score`

Score a speaking exercise attempt.

**Request:**
```json
{
  "audio_base64": "BASE64_ENCODED_AUDIO",
  "target_text": "Mucho gusto en conocerte",
  "exercise_id": "uuid (optional)"
}
```

**Response:**
```json
{
  "transcription": "Mucho gusto en conocerte",
  "scores": {
    "pronunciation": 78,
    "accuracy": 92,
    "fluency": 75,
    "overall": 82
  },
  "feedback": {
    "strengths": ["Good rhythm", "Clear consonants"],
    "improvements": ["Work on the 'rr' rolling sound", "Slow down slightly for clarity"],
    "next_step": "Try practicing with tongue twisters to improve fluency"
  },
  "xp_earned": 15
}
```

---

### POST `/functions/v1/generate-token`

Generate LiveKit room token for video calls.

**Request:**
```json
{
  "room_name": "booking-uuid-123",
  "participant_name": "John Doe"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "url": "wss://learning-platform-xxx.livekit.cloud"
}
```

**Authorization:** 
- User must have confirmed booking for the room
- Verified via booking ID matching

---

### POST `/functions/v1/sync-subscription`

RevenueCat webhook handler (server-to-server).

**Request (from RevenueCat):**
```json
{
  "api_version": "1.0",
  "event": {
    "type": "INITIAL_PURCHASE" | "RENEWAL" | "CANCELLATION" | "EXPIRATION",
    "app_user_id": "user-uuid",
    "product_id": "pro_monthly",
    "subscriber": {
      "entitlements": {
        "premium": {
          "product_identifier": "pro_monthly",
          "is_active": true,
          "expires_date": "2025-01-17T00:00:00Z"
        }
      }
    }
  }
}
```

**Response:**
```json
{
  "success": true
}
```

**Security:** Webhook signature verification required.

---

### POST `/functions/v1/send-notification`

Trigger push notification (internal use).

**Request:**
```json
{
  "user_id": "uuid",
  "title": "Time to practice! 🎯",
  "body": "Your streak is at risk! Complete a lesson to keep it going.",
  "data": {
    "type": "streak_reminder",
    "deep_link": "/learn"
  }
}
```

**Response:**
```json
{
  "success": true,
  "notification_id": "notif-uuid"
}
```

**Authorization:** Service role only (internal).

---

## Supabase Client Operations

### Profiles

```typescript
// Get current user profile
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single();

// Update profile
const { error } = await supabase
  .from('profiles')
  .update({ display_name: 'New Name', learning_goal: 'fluency' })
  .eq('id', user.id);
```

### Lessons

```typescript
// Get lessons by category
const { data: lessons } = await supabase
  .from('lessons')
  .select(`
    *,
    category:lesson_categories(name, slug),
    progress:lesson_progress(status, completion_percent)
  `)
  .eq('category_id', categoryId)
  .order('order_index');

// Get single lesson with exercises
const { data: lesson } = await supabase
  .from('lessons')
  .select(`
    *,
    vocabulary(*),
    exercises(*)
  `)
  .eq('id', lessonId)
  .single();
```

### Lesson Progress

```typescript
// Start or update lesson progress
const { error } = await supabase
  .from('lesson_progress')
  .upsert({
    user_id: user.id,
    lesson_id: lessonId,
    status: 'in_progress',
    completion_percent: 50,
    last_position: { section_index: 3 },
    started_at: new Date().toISOString(),
  });

// Mark lesson complete
const { error } = await supabase
  .from('lesson_progress')
  .update({
    status: 'completed',
    completion_percent: 100,
    completed_at: new Date().toISOString(),
  })
  .eq('user_id', user.id)
  .eq('lesson_id', lessonId);
```

### Exercise Results

```typescript
// Submit exercise answer
const { error } = await supabase
  .from('exercise_results')
  .insert({
    user_id: user.id,
    exercise_id: exerciseId,
    user_answer: { selected: 'option_b' },
    is_correct: true,
    xp_earned: 5,
  });
```

### Bookings

```typescript
// Get available time slots
const { data: slots } = await supabase
  .from('time_slots')
  .select('*')
  .eq('is_available', true)
  .gte('start_time', new Date().toISOString())
  .order('start_time');

// Create booking
const { data: booking, error } = await supabase
  .from('bookings')
  .insert({
    user_id: user.id,
    time_slot_id: slotId,
    booking_type: '1on1',
  })
  .select()
  .single();

// Get my upcoming bookings
const { data: bookings } = await supabase
  .from('bookings')
  .select(`
    *,
    time_slot:time_slots(start_time, end_time)
  `)
  .eq('user_id', user.id)
  .eq('status', 'confirmed')
  .order('time_slot(start_time)');
```

### Streaks

```typescript
// Update streak (call after completing activity)
const { data, error } = await supabase
  .rpc('update_streak', { p_user_id: user.id });

// Returns: { current_streak: 5, is_new_day: true }
```

### Content Feed

```typescript
// Get posts
const { data: posts } = await supabase
  .from('posts')
  .select(`
    *,
    likes:post_likes(count),
    user_liked:post_likes!inner(user_id)
  `)
  .eq('is_published', true)
  .order('is_pinned', { ascending: false })
  .order('created_at', { ascending: false });

// Like a post
const { error } = await supabase
  .from('post_likes')
  .insert({ user_id: user.id, post_id: postId });

// Unlike a post
const { error } = await supabase
  .from('post_likes')
  .delete()
  .eq('user_id', user.id)
  .eq('post_id', postId);
```

---

## Realtime Subscriptions

### Lesson Progress Updates

```typescript
// Subscribe to own progress changes
const channel = supabase
  .channel('my-progress')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'lesson_progress',
      filter: `user_id=eq.${user.id}`,
    },
    (payload) => {
      console.log('Progress updated:', payload);
    }
  )
  .subscribe();
```

### New Content Notifications

```typescript
// Subscribe to new posts
const channel = supabase
  .channel('new-posts')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'posts',
      filter: 'is_published=eq.true',
    },
    (payload) => {
      showNotification('New post from AI Tutor!');
    }
  )
  .subscribe();
```

---

## Error Handling

### Standard Error Response

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "You've reached your daily AI chat limit. Upgrade to Essential for unlimited access.",
    "details": {
      "limit": 10,
      "used": 10,
      "reset_at": "2025-12-18T00:00:00Z"
    }
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing auth token |
| `FORBIDDEN` | 403 | Tier doesn't allow this action |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `RATE_LIMIT_EXCEEDED` | 429 | Tier limit reached |
| `VALIDATION_ERROR` | 400 | Invalid request body |
| `INTERNAL_ERROR` | 500 | Server error |
| `AI_SERVICE_ERROR` | 502 | OpenAI/ElevenLabs error |

---

## Rate Limiting

### By Tier

| Endpoint | Free | Essential | Pro | VIP |
|----------|------|-----------|-----|-----|
| AI Chat | 10/day | Unlimited | Unlimited | Unlimited |
| AI Voice | 0 | 30 min/mo | Unlimited | Unlimited |
| Speaking Score | 5/day | 50/day | Unlimited | Unlimited |
| API Calls | 30/min | 100/min | 300/min | 500/min |

### Response Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1702857600
```

---

*API Version: 1.0*  
*Last Updated: 2025-12-17*

