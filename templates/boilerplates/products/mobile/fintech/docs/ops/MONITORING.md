# Trading Platform - Monitoring & Observability

**Version:** 1.0  
**Date:** 2025-12-11

---

## Monitoring Stack

| Tool | Purpose | Data |
|------|---------|------|
| **Sentry** | Error tracking, crash reporting | Exceptions, crashes |
| **Mixpanel** | User analytics, funnels | User behavior |
| **Supabase Dashboard** | Database, API, Realtime | Infrastructure |
| **RevenueCat Dashboard** | Subscription analytics | Revenue |
| **Expo Dashboard** | Builds, updates, crashes | App delivery |

---

## Sentry Configuration

### Setup

```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: __DEV__ ? 'development' : 'production',
  tracesSampleRate: 1.0,
  enableAutoSessionTracking: true,
  attachStacktrace: true,
  
  // Don't send PII
  beforeSend(event) {
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }
    return event;
  },
});
```

### Error Boundaries

```typescript
// components/ErrorBoundary.tsx
import * as Sentry from '@sentry/react-native';

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error }) => <ErrorScreen error={error} />}
      onError={(error) => {
        Sentry.captureException(error);
      }}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}
```

### Custom Error Tracking

```typescript
// Track business-logic errors
function trackError(error: Error, context: Record<string, unknown>) {
  Sentry.captureException(error, {
    tags: {
      feature: context.feature,
      action: context.action,
    },
    extra: context,
  });
}

// Usage
try {
  await initiateDeposit(amount);
} catch (error) {
  trackError(error, {
    feature: 'deposit',
    action: 'initiate',
    amount,
    linkedAccountId,
  });
}
```

---

## Mixpanel Analytics

### Setup

```typescript
// lib/analytics.ts
import { Mixpanel } from 'mixpanel-react-native';

const mixpanel = new Mixpanel(process.env.EXPO_PUBLIC_MIXPANEL_TOKEN!);

export async function initializeAnalytics(userId: string) {
  await mixpanel.init();
  mixpanel.identify(userId);
}

export function track(event: string, properties?: Record<string, unknown>) {
  mixpanel.track(event, properties);
}

export function setUserProperties(properties: Record<string, unknown>) {
  mixpanel.getPeople().set(properties);
}
```

### Key Events to Track

```typescript
// User lifecycle
track('User Signed Up', { method: 'apple' });
track('User Logged In', { method: 'biometric' });

// Onboarding
track('Onboarding Started');
track('Bank Account Linked', { institution: 'Chase' });
track('First Deposit Made', { amount: 100 });
track('Auto-Invest Activated', { risk_level: 'balanced' });
track('Onboarding Completed', { duration_seconds: 180 });

// Core features
track('Balance Viewed');
track('Income Feed Viewed', { days: 7 });
track('AI Status Viewed');
track('Risk Level Changed', { from: 'safe', to: 'balanced' });

// Monetization
track('Paywall Viewed', { trigger: 'upgrade_prompt' });
track('Subscription Started', { tier: 'pro', price: 15 });
track('Subscription Upgraded', { from: 'basic', to: 'pro' });
track('Subscription Cancelled', { reason: 'too_expensive' });

// Errors
track('Error Occurred', { type: 'deposit_failed', code: 'INSUFFICIENT_FUNDS' });
```

### Funnel Analysis

```
Onboarding Funnel:
1. App Opened
2. Sign Up Started
3. Account Created
4. Bank Linked
5. First Deposit
6. Auto-Invest Activated

Conversion Funnel:
1. Balance Viewed
2. Paywall Viewed
3. Tier Selected
4. Purchase Initiated
5. Purchase Completed
```

---

## Supabase Monitoring

### Dashboard Metrics

Access via: `https://supabase.com/dashboard/project/<project-id>`

**Key Metrics:**
- Database connections (active, pooler)
- API requests (count, latency, errors)
- Realtime connections
- Edge Function invocations
- Storage usage

### Alerts

Configure alerts in Supabase Dashboard:
- Database CPU > 80%
- API error rate > 1%
- Realtime connections > 10,000
- Edge Function errors > 10/min

### Query Performance

```sql
-- Find slow queries
SELECT 
  query,
  calls,
  mean_exec_time,
  total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

---

## RevenueCat Analytics

### Key Metrics

| Metric | Description |
|--------|-------------|
| **MRR** | Monthly recurring revenue |
| **Active Subscribers** | Current paying users |
| **Churn Rate** | Monthly subscription cancellations |
| **Trial Conversion** | Free → Paid conversion |
| **ARPU** | Average revenue per user |
| **LTV** | Lifetime value estimate |

### Cohort Analysis

Track by:
- Acquisition date
- Subscription tier
- Platform (iOS/Android)
- Founding member status

---

## Health Checks

### App Health

```typescript
// Check critical services on app start
async function performHealthCheck(): Promise<HealthStatus> {
  const checks = await Promise.all([
    checkSupabaseConnection(),
    checkRevenueCatConnection(),
    checkNetworkConnectivity(),
  ]);
  
  return {
    supabase: checks[0],
    revenuecat: checks[1],
    network: checks[2],
    overall: checks.every(c => c.healthy),
  };
}

async function checkSupabaseConnection(): Promise<ServiceHealth> {
  try {
    const start = Date.now();
    await supabase.from('subscription_tiers').select('id').limit(1);
    return { healthy: true, latency: Date.now() - start };
  } catch {
    return { healthy: false, error: 'Connection failed' };
  }
}
```

### Backend Health

Edge Function health endpoint:

```typescript
// supabase/functions/health/index.ts
serve(async () => {
  const checks = {
    database: await checkDatabase(),
    plaid: await checkPlaidConnection(),
    timestamp: new Date().toISOString(),
  };
  
  const healthy = Object.values(checks).every(c => 
    typeof c === 'string' || c.healthy
  );
  
  return new Response(JSON.stringify(checks), {
    status: healthy ? 200 : 503,
    headers: { 'Content-Type': 'application/json' },
  });
});
```

---

## Alerting Rules

### Critical Alerts (PagerDuty/Slack)

| Condition | Threshold | Action |
|-----------|-----------|--------|
| API Error Rate | >5% for 5 min | Page on-call |
| Database Down | Any duration | Page on-call |
| Edge Function Failures | >10/min | Page on-call |
| Payment Failures | >3 in 1 hour | Alert team |

### Warning Alerts (Slack only)

| Condition | Threshold | Action |
|-----------|-----------|--------|
| API Latency P95 | >500ms for 15 min | Notify team |
| Realtime Disconnections | >100/hour | Notify team |
| Subscription Churn | >10% daily | Notify team |
| Error Rate | >1% for 15 min | Notify team |

---

## Dashboards

### Real-Time Dashboard

```
┌────────────────────────────────────────────────────┐
│  TRADING PLATFORM HQ - REAL-TIME DASHBOARD             │
├────────────────────────────────────────────────────┤
│                                                    │
│  Active Users: 1,234    API Latency: 45ms (P95)   │
│  Realtime Connections: 892   Error Rate: 0.02%    │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │ Requests/min                                 │ │
│  │ ████████████████████████░░░░░░░░░  1,200    │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  Recent Errors:                                   │
│  • 10:45 - INSUFFICIENT_FUNDS (user: abc123)     │
│  • 10:42 - PLAID_RATE_LIMITED                    │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

*Monitoring strategy ready for implementation.*



