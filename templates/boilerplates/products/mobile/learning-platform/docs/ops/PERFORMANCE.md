# Learning Platform — Performance Strategy

**Version:** 1.0 | **Date:** 2025-12-17  
**Focus:** Mobile app performance, API latency, AI response times

---

## Performance Targets

### Mobile App Metrics

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| Cold Start | < 3s | < 5s |
| Screen Transition | < 300ms | < 500ms |
| Time to Interactive | < 4s | < 6s |
| JS Bundle Size | < 10MB | < 15MB |
| Frame Rate | 60fps | 30fps minimum |

### API Metrics

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| API P50 Latency | < 200ms | < 500ms |
| API P95 Latency | < 500ms | < 1s |
| API P99 Latency | < 1s | < 2s |
| Error Rate | < 0.5% | < 2% |
| Availability | 99.9% | 99.5% |

### AI Service Metrics

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| Chat Response (P95) | < 3s | < 5s |
| Voice-to-Voice (P95) | < 4s | < 7s |
| Pronunciation Score (P95) | < 2s | < 4s |
| TTS Generation (P95) | < 2s | < 4s |

---

## Mobile Performance Optimizations

### Bundle Optimization

```typescript
// metro.config.js - Tree shaking and minification
module.exports = {
  transformer: {
    minifierConfig: {
      mangle: { toplevel: true },
      compress: {
        dead_code: true,
        unused: true,
      },
    },
  },
};
```

### Image Optimization

```typescript
// Use expo-image for optimized image loading
import { Image } from 'expo-image';

// Component usage
<Image
  source={imageUrl}
  placeholder={blurhash}
  contentFit="cover"
  transition={200}
  cachePolicy="memory-disk"
/>
```

### List Virtualization

```typescript
// Use FlashList for large lists
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={lessons}
  renderItem={renderLessonCard}
  estimatedItemSize={120}
  keyExtractor={(item) => item.id}
/>
```

### Lazy Loading

```typescript
// Lazy load heavy screens
const VideoCallScreen = lazy(() => import('./screens/VideoCall'));
const AIVoiceScreen = lazy(() => import('./screens/AIVoice'));

// Route configuration with Expo Router
// app/video-call/[id].tsx - automatically code-split
```

### State Management Optimization

```typescript
// Zustand with persistence and selective updates
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useProgressStore = create(
  persist(
    (set) => ({
      currentLesson: null,
      completedLessons: [],
      // Selective updates prevent unnecessary re-renders
      markComplete: (lessonId) => set((state) => ({
        completedLessons: [...state.completedLessons, lessonId],
      })),
    }),
    {
      name: 'progress-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ completedLessons: state.completedLessons }),
    }
  )
);
```

### Memory Management

```typescript
// Clean up resources on unmount
useEffect(() => {
  const audioPlayer = new Audio.Sound();
  
  return () => {
    audioPlayer.unloadAsync();
  };
}, []);

// Use useFocusEffect for screen-specific cleanup
useFocusEffect(
  useCallback(() => {
    // Start resources
    return () => {
      // Clean up when screen loses focus
    };
  }, [])
);
```

---

## API Performance Optimizations

### Supabase Query Optimization

```typescript
// Good: Select only needed columns
const { data } = await supabase
  .from('lessons')
  .select('id, title, description, thumbnail_url')
  .eq('category_id', categoryId)
  .limit(20);

// Bad: Select all columns
const { data } = await supabase
  .from('lessons')
  .select('*');

// Good: Use foreign key joins efficiently
const { data } = await supabase
  .from('lessons')
  .select(`
    id, title,
    progress:lesson_progress!inner(status, completion_percent)
  `)
  .eq('lesson_progress.user_id', userId);
```

### Caching Strategy

```typescript
// TanStack Query caching configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      retry: 2,
      refetchOnWindowFocus: false, // Mobile-specific
    },
  },
});

// Lesson data - longer cache (content rarely changes)
useQuery({
  queryKey: ['lesson', lessonId],
  queryFn: () => fetchLesson(lessonId),
  staleTime: 60 * 60 * 1000, // 1 hour
});

// Progress data - shorter cache (updates frequently)
useQuery({
  queryKey: ['progress', userId],
  queryFn: () => fetchProgress(userId),
  staleTime: 30 * 1000, // 30 seconds
});
```

### Optimistic Updates

```typescript
// Update UI immediately, sync in background
const updateProgressMutation = useMutation({
  mutationFn: updateLessonProgress,
  onMutate: async (newProgress) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['progress'] });
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(['progress']);
    
    // Optimistically update
    queryClient.setQueryData(['progress'], (old) => ({
      ...old,
      [newProgress.lessonId]: newProgress,
    }));
    
    return { previous };
  },
  onError: (err, newProgress, context) => {
    // Rollback on error
    queryClient.setQueryData(['progress'], context.previous);
  },
  onSettled: () => {
    // Refetch to sync
    queryClient.invalidateQueries({ queryKey: ['progress'] });
  },
});
```

### Connection Pooling

Supabase handles connection pooling automatically via PgBouncer:
- Default pool mode: Transaction
- Max connections: Based on plan (Pro: 100+)
- Connection timeouts: Configured in dashboard

---

## AI Service Optimizations

### Streaming Responses

```typescript
// Stream AI responses for perceived faster UX
async function streamChatResponse(messages: Message[]) {
  const response = await fetch('/functions/v1/ai-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, stream: true }),
  });
  
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  
  let content = '';
  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;
    
    content += decoder.decode(value);
    // Update UI with partial response
    setPartialResponse(content);
  }
  
  return content;
}
```

### Response Caching

```typescript
// Cache common responses (greetings, corrections)
const commonResponseCache = new Map<string, CachedResponse>();

async function getChatResponse(prompt: string) {
  const cacheKey = hashPrompt(prompt);
  const cached = commonResponseCache.get(cacheKey);
  
  if (cached && !isExpired(cached)) {
    return cached.response;
  }
  
  const response = await callOpenAI(prompt);
  
  // Cache if it's a common pattern
  if (isCommonPattern(prompt)) {
    commonResponseCache.set(cacheKey, {
      response,
      timestamp: Date.now(),
    });
  }
  
  return response;
}
```

### Audio Optimization

```typescript
// Pre-generate TTS for common phrases
const pregeneratedAudio = {
  'hello': 'https://storage.../hello.mp3',
  'good morning': 'https://storage.../good_morning.mp3',
  'thanks': 'https://storage.../thanks.mp3',
};

// Compress audio before upload
async function compressAudio(audioUri: string): Promise<string> {
  return await Audio.compress(audioUri, {
    quality: 'medium',
    bitrate: 64000,
  });
}
```

---

## Database Performance

### Index Strategy

| Table | Index | Purpose |
|-------|-------|---------|
| lessons | (category_id, order_index) | Category browsing |
| lesson_progress | (user_id, status) | Dashboard queries |
| exercise_results | (user_id, created_at DESC) | History lookup |
| ai_conversations | (user_id, created_at DESC) | Conversation list |
| vocabulary | (lesson_id) | Lesson vocabulary |

### Query Analysis

```sql
-- Analyze slow queries
EXPLAIN ANALYZE
SELECT l.*, lp.status, lp.completion_percent
FROM lessons l
LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.user_id = $1
WHERE l.category_id = $2
ORDER BY l.order_index;

-- Expected: Index Scan, not Seq Scan
```

### Partitioning (Future)

```sql
-- Partition exercise_results by month (when data grows)
CREATE TABLE exercise_results (
  -- columns
) PARTITION BY RANGE (created_at);

CREATE TABLE exercise_results_2025_12 PARTITION OF exercise_results
FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');
```

---

## SLO/SLI Definitions

### Service Level Indicators (SLIs)

| SLI | Measurement | Target |
|-----|-------------|--------|
| Availability | % of successful API requests | 99.9% |
| Latency | P95 API response time | < 500ms |
| Error Rate | % of 5xx responses | < 0.5% |
| Throughput | Requests per second capacity | 1000 RPS |

### Service Level Objectives (SLOs)

| SLO | Target | Error Budget |
|-----|--------|--------------|
| API Availability | 99.9% monthly | 43.8 min/month |
| API Latency | 95% < 500ms | 5% can exceed |
| Chat Latency | 95% < 3s | 5% can exceed |
| Error Rate | < 0.5% monthly | 0.5% of requests |

### Error Budget Calculation

```
Monthly Minutes: 43,200 (30 days)
SLO: 99.9%
Error Budget: 43,200 × 0.1% = 43.2 minutes

If availability drops below 99.9%, pause deployments until budget recovers.
```

---

## Monitoring & Alerting

### Key Metrics Dashboard

```typescript
// Custom metrics to track
const performanceMetrics = {
  // App Performance
  'app.cold_start_time': 'histogram',
  'app.screen_transition_time': 'histogram',
  'app.js_bundle_size': 'gauge',
  
  // API Performance
  'api.request_duration': 'histogram',
  'api.error_count': 'counter',
  'api.cache_hit_rate': 'gauge',
  
  // AI Performance
  'ai.chat_response_time': 'histogram',
  'ai.tts_generation_time': 'histogram',
  'ai.token_usage': 'counter',
  
  // Business Metrics
  'lessons.completed': 'counter',
  'exercises.attempted': 'counter',
  'streak.active_users': 'gauge',
};
```

### Alert Thresholds

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| API Error Rate | > 1% | > 5% | Investigate immediately |
| API P95 Latency | > 1s | > 2s | Scale up / optimize |
| Database CPU | > 70% | > 90% | Scale database |
| App Crash Rate | > 0.5% | > 2% | Rollback release |

### Alerting Configuration

```yaml
# Example Sentry alert rules
rules:
  - name: High Error Rate
    conditions:
      - type: error_frequency
        value: 100
        interval: 5m
    actions:
      - type: slack
        channel: '#alerts'
      - type: email
        recipients: ['team@app.example.com']

  - name: Slow API Response
    conditions:
      - type: transaction_duration
        metric: p95
        threshold: 2000
        interval: 10m
    actions:
      - type: slack
        channel: '#performance'
```

---

## Performance Testing

### Load Testing

```bash
# K6 load test configuration
k6 run -u 100 -d 5m load-test.js
```

```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramp up
    { duration: '3m', target: 100 }, // Sustained load
    { duration: '1m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const res = http.get('https://api.app.example.com/functions/v1/health');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
```

### Profiling

```typescript
// React Native performance profiling
import { InteractionManager } from 'react-native';

// Defer expensive operations
InteractionManager.runAfterInteractions(() => {
  // Heavy computation here
});

// Measure render performance
if (__DEV__) {
  const Profiler = ({ children, id }) => (
    <React.Profiler
      id={id}
      onRender={(id, phase, actualDuration) => {
        if (actualDuration > 16) { // Slower than 60fps
          console.warn(`Slow render: ${id} took ${actualDuration}ms`);
        }
      }}
    >
      {children}
    </React.Profiler>
  );
}
```

---

## Performance Budget

### Bundle Size Budget

| Component | Budget | Current |
|-----------|--------|---------|
| Initial JS Bundle | 8 MB | TBD |
| Per-Route Chunk (avg) | 500 KB | TBD |
| Total Assets | 20 MB | TBD |
| Third-party Libraries | 3 MB | TBD |

### Runtime Budget

| Metric | Budget |
|--------|--------|
| Main Thread Work | < 200ms on load |
| Memory Usage | < 200 MB |
| Background Tasks | < 30s |

---

*Performance Document Version: 1.0*  
*Last Updated: 2025-12-17*

