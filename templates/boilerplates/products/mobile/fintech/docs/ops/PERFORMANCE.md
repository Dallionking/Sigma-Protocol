# Trading Platform - Performance Strategy

**Version:** 1.0  
**Date:** 2025-12-11

---

## Performance Targets

### Mobile App Performance

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Cold Start** | <2 seconds | Time to interactive home screen |
| **Warm Start** | <500ms | Resume from background |
| **Balance Refresh** | <500ms | Realtime update latency |
| **Animation FPS** | 60fps | Neon glow, pulse effects |
| **JS Bundle Size** | <2MB | After Hermes bytecode |
| **App Size** | <50MB | Initial download |
| **Memory Usage** | <200MB | Peak during use |

### API Performance

| Metric | P50 | P95 | P99 |
|--------|-----|-----|-----|
| **Database Queries** | 20ms | 100ms | 200ms |
| **Edge Functions** | 100ms | 300ms | 500ms |
| **Realtime Latency** | 50ms | 150ms | 300ms |
| **Auth Operations** | 150ms | 300ms | 500ms |

---

## SLO/SLI Definitions

### Service Level Objectives

| Service | Availability | Latency (P95) | Error Rate |
|---------|--------------|---------------|------------|
| **API** | 99.9% | 200ms | <0.1% |
| **Realtime** | 99.5% | 150ms | <0.5% |
| **Auth** | 99.9% | 300ms | <0.05% |
| **Edge Functions** | 99.5% | 500ms | <0.5% |

### Error Budget Calculation

```
Monthly Error Budget = 100% - SLO

API (99.9%):
- Error budget: 0.1% = 43.2 minutes/month of downtime
- Or ~4,320 failed requests per 4.32M requests

Realtime (99.5%):
- Error budget: 0.5% = 3.6 hours/month of degradation
```

---

## Optimization Strategies

### 1. App Startup Optimization

```typescript
// Lazy load non-critical screens
const SettingsScreen = lazy(() => import('./screens/SettingsScreen'));

// Preload critical data during splash
async function preloadCriticalData() {
  await Promise.all([
    queryClient.prefetchQuery(['balance']),
    queryClient.prefetchQuery(['subscription']),
    queryClient.prefetchQuery(['ai-status']),
  ]);
}
```

### 2. Animation Performance

```typescript
// Use Reanimated worklets for animations
const animatedStyle = useAnimatedStyle(() => {
  'worklet';
  return {
    opacity: withRepeat(
      withTiming(pulseValue.value, { duration: 1000 }),
      -1,
      true
    ),
    shadowRadius: interpolate(pulseValue.value, [0, 1], [5, 15]),
  };
});

// Use native driver for opacity/transform
Animated.timing(opacity, {
  toValue: 1,
  useNativeDriver: true, // Always true for performance
});
```

### 3. List Virtualization

```typescript
// Use FlashList for income events
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={incomeEvents}
  renderItem={({ item }) => <IncomeEventCard event={item} />}
  estimatedItemSize={80}
  keyExtractor={(item) => item.id}
/>
```

### 4. Image Optimization

```typescript
// Use expo-image for optimized loading
import { Image } from 'expo-image';

<Image
  source={avatarUrl}
  contentFit="cover"
  transition={200}
  placeholder={blurhash}
/>
```

### 5. Query Optimization

```typescript
// TanStack Query with stale-while-revalidate
const { data: balance } = useQuery({
  queryKey: ['balance'],
  queryFn: fetchBalance,
  staleTime: 1000 * 60 * 5,     // 5 min stale
  gcTime: 1000 * 60 * 60 * 24,  // 24 hour cache
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
});

// Optimistic updates for settings
const mutation = useMutation({
  mutationFn: updateSettings,
  onMutate: async (newSettings) => {
    await queryClient.cancelQueries(['settings']);
    const previous = queryClient.getQueryData(['settings']);
    queryClient.setQueryData(['settings'], newSettings);
    return { previous };
  },
  onError: (err, _, context) => {
    queryClient.setQueryData(['settings'], context?.previous);
  },
});
```

### 6. Database Query Optimization

```sql
-- Ensure indexes are used
EXPLAIN ANALYZE
SELECT * FROM income_events 
WHERE user_id = $1 
ORDER BY created_at DESC 
LIMIT 20;

-- Composite index for common query
CREATE INDEX idx_income_user_date 
ON income_events (user_id, created_at DESC);
```

---

## Caching Strategy

### Client-Side Caching

| Data | Cache Location | TTL | Invalidation |
|------|---------------|-----|--------------|
| **Balance** | TanStack Query | 5 min | Realtime event |
| **Income Events** | TanStack Query | 10 min | Realtime event |
| **AI Status** | TanStack Query | 1 min | Realtime event |
| **Subscription** | TanStack Query | 1 hour | RevenueCat sync |
| **User Settings** | TanStack Query | 30 min | Manual update |
| **Linked Accounts** | TanStack Query | 1 hour | Manual update |

### Offline Cache

```typescript
// Persist critical data to SQLite
async function cacheBalanceOffline(balance: Balance) {
  await db.runAsync(
    'INSERT OR REPLACE INTO cached_balance VALUES (?, ?, ?, ?)',
    [balance.id, balance.total_balance, balance.daily_change, new Date().toISOString()]
  );
}

// Read from offline cache first
async function getBalanceWithFallback(): Promise<Balance | null> {
  try {
    const { data } = await supabase.from('balances').select('*').single();
    if (data) {
      await cacheBalanceOffline(data);
      return data;
    }
  } catch {
    // Network error, read from cache
    const cached = await db.getFirstAsync<Balance>(
      'SELECT * FROM cached_balance LIMIT 1'
    );
    return cached;
  }
  return null;
}
```

---

## Scalability Strategy

### Horizontal Scaling

```
                    ┌─────────────────┐
                    │  Load Balancer  │
                    │   (Supabase)    │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  PostgREST  │     │  PostgREST  │     │  PostgREST  │
│  Instance   │     │  Instance   │     │  Instance   │
└─────────────┘     └─────────────┘     └─────────────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             │
                    ┌────────▼────────┐
                    │   PostgreSQL    │
                    │   (Primary)     │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Read Replica   │
                    │   (Optional)    │
                    └─────────────────┘
```

### Connection Pooling

Supabase uses PgBouncer for connection pooling:
- Transaction mode for short queries
- Session mode for long-running connections

### Realtime Scaling

- Shared channels where possible
- Filter subscriptions to minimize data transfer
- Batch updates for high-frequency events

---

## Monitoring & Alerting

See [MONITORING.md](./MONITORING.md) for detailed monitoring setup.

### Key Metrics to Track

1. **App Performance**
   - Cold start time (P50, P95)
   - JS bundle load time
   - Animation frame drops

2. **API Performance**
   - Request latency (P50, P95, P99)
   - Error rate
   - Throughput (requests/second)

3. **Business Metrics**
   - Time to first balance view
   - Auto-Invest activation rate
   - Subscription conversion time

---

*Performance strategy ready for implementation.*



