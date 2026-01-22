# Step 11: Monitoring Setup

> Application monitoring, alerting, and observability

## Monitoring Stack

| Tool | Purpose |
|------|---------|
| Vercel Analytics | Performance metrics |
| Sentry | Error tracking |
| Supabase Dashboard | Database metrics |
| Custom Health Checks | Application health |

## Error Tracking (Sentry)

### Setup

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### Configuration

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // Capture 10% of transactions for performance
  tracesSampleRate: 0.1,
  
  // Capture 100% of errors
  sampleRate: 1.0,
  
  // Don't send errors in development
  enabled: process.env.NODE_ENV === 'production',
  
  // Ignore specific errors
  ignoreErrors: [
    'ResizeObserver loop',
    'Network request failed',
  ],
  
  // Add context to errors
  beforeSend(event) {
    // Remove PII if present
    if (event.user) {
      delete event.user.email;
    }
    return event;
  },
});
```

```typescript
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

### Usage in API Routes

```typescript
// app/api/orders/route.ts
import * as Sentry from '@sentry/nextjs';

export async function POST(request: NextRequest) {
  try {
    // Order processing...
  } catch (error) {
    // Capture with context
    Sentry.captureException(error, {
      tags: {
        operation: 'place_order',
      },
      extra: {
        symbol: orderData.symbol,
        side: orderData.side,
      },
    });
    
    // Return sanitized error
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Order failed' } },
      { status: 500 }
    );
  }
}
```

## Health Check Endpoint

```typescript
// app/api/health/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    checks: {} as Record<string, { status: string; latency?: number }>,
  };
  
  // Database check
  const dbStart = Date.now();
  try {
    const supabase = createClient();
    await supabase.from('stocks').select('symbol').limit(1);
    checks.checks.database = {
      status: 'healthy',
      latency: Date.now() - dbStart,
    };
  } catch (error) {
    checks.checks.database = { status: 'unhealthy' };
    checks.status = 'degraded';
  }
  
  // External API check (if applicable)
  const apiStart = Date.now();
  try {
    // Check market data provider
    checks.checks.marketData = {
      status: 'healthy',
      latency: Date.now() - apiStart,
    };
  } catch {
    checks.checks.marketData = { status: 'unhealthy' };
    checks.status = 'degraded';
  }
  
  const statusCode = checks.status === 'healthy' ? 200 : 503;
  
  return NextResponse.json(checks, { status: statusCode });
}
```

## Performance Monitoring

### Web Vitals

```typescript
// app/providers.tsx
'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function Providers({ children }: { children: React.ReactNode }) {
  useReportWebVitals((metric) => {
    // Send to analytics
    console.log(metric);
    
    // Or send to custom endpoint
    fetch('/api/analytics/vitals', {
      method: 'POST',
      body: JSON.stringify(metric),
    });
  });
  
  return <>{children}</>;
}
```

### Custom Performance Tracking

```typescript
// lib/monitoring/performance.ts
export function trackTiming(name: string, duration: number) {
  if (typeof window !== 'undefined' && 'performance' in window) {
    performance.mark(`${name}-end`);
    
    // Report to analytics
    fetch('/api/analytics/timing', {
      method: 'POST',
      body: JSON.stringify({ name, duration, timestamp: Date.now() }),
    });
  }
}

// Usage
const start = performance.now();
await placeOrder(orderData);
trackTiming('order_placement', performance.now() - start);
```

## Logging

### Structured Logging

```typescript
// lib/logging/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

function log(level: LogLevel, message: string, context?: Record<string, unknown>) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
  };
  
  // In production, send to logging service
  if (process.env.NODE_ENV === 'production') {
    // Send to Datadog, LogRocket, etc.
    console.log(JSON.stringify(entry));
  } else {
    console[level](entry);
  }
}

export const logger = {
  debug: (msg: string, ctx?: Record<string, unknown>) => log('debug', msg, ctx),
  info: (msg: string, ctx?: Record<string, unknown>) => log('info', msg, ctx),
  warn: (msg: string, ctx?: Record<string, unknown>) => log('warn', msg, ctx),
  error: (msg: string, ctx?: Record<string, unknown>) => log('error', msg, ctx),
};

// Usage
logger.info('Order placed', { orderId: order.id, symbol: order.symbol });
logger.error('Order failed', { error: error.message, userId: user.id });
```

## Alerting Rules

### Sentry Alerts

| Alert | Condition | Action |
|-------|-----------|--------|
| Error Spike | >10 errors in 5 min | Slack + Email |
| Performance Degradation | P95 > 3s | Slack |
| New Error Type | First occurrence | Email |

### Uptime Monitoring

```typescript
// External uptime monitor configuration
// Use services like Better Uptime, Pingdom, or UptimeRobot

const uptimeChecks = [
  {
    name: 'API Health',
    url: 'https://sigmatrade.com/api/health',
    interval: 60, // seconds
    alertThreshold: 2, // consecutive failures
  },
  {
    name: 'Homepage',
    url: 'https://sigmatrade.com',
    interval: 60,
    alertThreshold: 2,
  },
];
```

## Dashboards

### Key Metrics to Track

```
Application Health
├── Error Rate (errors/minute)
├── Response Time (P50, P95, P99)
├── Request Volume (requests/minute)
└── Active Users

Business Metrics
├── Orders Placed
├── Order Success Rate
├── Average Order Value
└── Active Portfolios

Infrastructure
├── Database Connections
├── Memory Usage
├── CPU Usage
└── Realtime Connections
```

### Example Dashboard Query

```sql
-- Supabase SQL for order metrics
SELECT 
  date_trunc('hour', created_at) as hour,
  count(*) as total_orders,
  count(*) FILTER (WHERE status = 'filled') as filled_orders,
  avg(quantity * average_fill_price) as avg_order_value
FROM orders
WHERE created_at > now() - interval '24 hours'
GROUP BY 1
ORDER BY 1;
```

## Incident Response

### Runbook Template

```markdown
## Incident: [Name]

### Detection
- Alert triggered: [time]
- Alert source: [Sentry/Uptime/etc.]
- Severity: [P1/P2/P3]

### Impact
- Users affected: [estimate]
- Features impacted: [list]

### Investigation
1. Check error logs in Sentry
2. Review recent deployments
3. Check database status
4. Review external service status

### Resolution
- Root cause: [description]
- Fix applied: [description]
- Deployed at: [time]

### Follow-up
- [ ] Post-mortem scheduled
- [ ] Monitoring improved
- [ ] Documentation updated
```

## Next Steps

Proceed to Step 12: Documentation.


