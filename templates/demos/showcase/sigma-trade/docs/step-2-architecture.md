# Step 2: Architecture Design

> System architecture and technical stack decisions

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                               │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      Next.js App                              │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐    │   │
│  │  │   Pages     │ │ Components  │ │    Hooks/State      │    │   │
│  │  │ (App Router)│ │  (React)    │ │ (Zustand + RQ)      │    │   │
│  │  └──────┬──────┘ └──────┬──────┘ └──────────┬──────────┘    │   │
│  │         │               │                    │               │   │
│  │         └───────────────┼────────────────────┘               │   │
│  │                         │                                     │   │
│  │                   ┌─────┴─────┐                               │   │
│  │                   │  API Layer │                              │   │
│  │                   │ (Next API) │                              │   │
│  │                   └─────┬─────┘                               │   │
│  └─────────────────────────│────────────────────────────────────┘   │
│                            │                                         │
├────────────────────────────│─────────────────────────────────────────┤
│                       SERVICE LAYER                                   │
│                            │                                         │
│    ┌───────────────────────┼───────────────────────────┐            │
│    │                       │                           │            │
│    ▼                       ▼                           ▼            │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────────────┐       │
│  │  Supabase   │   │  Supabase   │   │     Supabase        │       │
│  │    Auth     │   │  Database   │   │     Realtime        │       │
│  └─────────────┘   └─────────────┘   └─────────────────────┘       │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.x | React framework, App Router |
| React | 18.x | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Styling |
| Radix UI | Latest | Headless components |
| Zustand | 4.x | Client state management |
| React Query | 5.x | Server state management |
| Recharts | 2.x | Charts |
| Zod | 3.x | Schema validation |

### Backend (via Supabase)

| Technology | Purpose |
|------------|---------|
| PostgreSQL | Primary database |
| PostgREST | Auto-generated REST API |
| GoTrue | Authentication |
| Realtime | WebSocket subscriptions |
| Storage | File storage (if needed) |

### Development & Testing

| Technology | Purpose |
|------------|---------|
| Vitest | Unit testing |
| Playwright | E2E testing |
| ESLint | Code linting |
| Prettier | Code formatting |

## Directory Structure

```
sigma-trade/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth routes group
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── layout.tsx
│   │   ├── (app)/             # Authenticated routes
│   │   │   ├── portfolio/
│   │   │   ├── markets/
│   │   │   ├── activity/
│   │   │   ├── stock/[symbol]/
│   │   │   └── layout.tsx
│   │   ├── api/               # API routes
│   │   │   ├── portfolio/
│   │   │   ├── orders/
│   │   │   ├── quotes/
│   │   │   └── watchlist/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── ui/                # Primitive components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── modal.tsx
│   │   ├── portfolio/         # Portfolio feature
│   │   │   ├── portfolio-header.tsx
│   │   │   ├── holdings-list.tsx
│   │   │   └── performance-chart.tsx
│   │   ├── trading/           # Trading feature
│   │   │   ├── trade-modal.tsx
│   │   │   ├── order-form.tsx
│   │   │   └── order-preview.tsx
│   │   ├── market/            # Market data feature
│   │   │   ├── stock-quote.tsx
│   │   │   ├── stock-chart.tsx
│   │   │   └── movers-list.tsx
│   │   └── layout/            # Layout components
│   │       ├── header.tsx
│   │       ├── nav.tsx
│   │       └── footer.tsx
│   │
│   ├── hooks/
│   │   ├── use-portfolio.ts   # Portfolio data hook
│   │   ├── use-quotes.ts      # Real-time quotes hook
│   │   ├── use-orders.ts      # Order management hook
│   │   └── use-auth.ts        # Authentication hook
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts      # Browser client
│   │   │   ├── server.ts      # Server client
│   │   │   └── middleware.ts  # Auth middleware
│   │   ├── utils/
│   │   │   ├── format.ts      # Formatting utilities
│   │   │   ├── validation.ts  # Zod schemas
│   │   │   └── calculations.ts # Financial calculations
│   │   └── constants.ts       # App constants
│   │
│   ├── store/
│   │   ├── user-store.ts      # User preferences
│   │   └── trade-store.ts     # Trade modal state
│   │
│   └── types/
│       ├── portfolio.ts
│       ├── order.ts
│       ├── stock.ts
│       └── user.ts
│
├── supabase/
│   ├── migrations/            # Database migrations
│   └── seed.sql               # Seed data
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── public/
│   └── assets/
│
└── config files...
```

## State Management Strategy

### Client State (Zustand)

For UI state that doesn't need to sync with server:

```typescript
// store/trade-store.ts
interface TradeStore {
  isOpen: boolean;
  symbol: string | null;
  side: 'buy' | 'sell';
  openTrade: (symbol: string, side?: 'buy' | 'sell') => void;
  closeTrade: () => void;
}

export const useTradeStore = create<TradeStore>((set) => ({
  isOpen: false,
  symbol: null,
  side: 'buy',
  openTrade: (symbol, side = 'buy') => set({ isOpen: true, symbol, side }),
  closeTrade: () => set({ isOpen: false, symbol: null }),
}));
```

### Server State (React Query)

For data from the server:

```typescript
// hooks/use-portfolio.ts
export function usePortfolio() {
  return useQuery({
    queryKey: ['portfolio'],
    queryFn: async () => {
      const res = await fetch('/api/portfolio');
      return res.json();
    },
    staleTime: 30_000, // Consider fresh for 30s
  });
}
```

### Real-time Updates (Supabase Realtime)

For live data:

```typescript
// hooks/use-quotes.ts
export function useQuotes(symbols: string[]) {
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  
  useEffect(() => {
    const channel = supabase
      .channel('quotes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'quotes',
        filter: `symbol=in.(${symbols.join(',')})`,
      }, (payload) => {
        setQuotes(prev => ({
          ...prev,
          [payload.new.symbol]: payload.new,
        }));
      })
      .subscribe();
    
    return () => { channel.unsubscribe(); };
  }, [symbols]);
  
  return quotes;
}
```

## API Design

### Route Handlers (Next.js)

```typescript
// app/api/orders/route.ts
export async function POST(request: Request) {
  const supabase = createServerClient();
  
  // Validate session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Validate input
  const body = await request.json();
  const result = orderSchema.safeParse(body);
  if (!result.success) {
    return Response.json({ error: result.error }, { status: 400 });
  }
  
  // Execute order
  const order = await executeOrder(supabase, user.id, result.data);
  
  return Response.json(order);
}
```

### API Response Format

```typescript
// Success
{
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z"
  }
}

// Error
{
  "error": {
    "code": "INSUFFICIENT_FUNDS",
    "message": "Not enough buying power",
    "details": { ... }
  }
}
```

## Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │     │   Next.js   │     │  Supabase   │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │  Login Request    │                   │
       │──────────────────>│                   │
       │                   │  Verify Creds     │
       │                   │──────────────────>│
       │                   │                   │
       │                   │  Session Token    │
       │                   │<──────────────────│
       │  Set Cookie       │                   │
       │<──────────────────│                   │
       │                   │                   │
       │  API Request      │                   │
       │  (with cookie)    │                   │
       │──────────────────>│                   │
       │                   │  Validate Session │
       │                   │──────────────────>│
       │                   │                   │
       │                   │  User Data        │
       │                   │<──────────────────│
       │  Response         │                   │
       │<──────────────────│                   │
```

## Security Measures

### Row-Level Security (RLS)

```sql
-- Users can only see their own portfolio
CREATE POLICY "Users can view own portfolio"
  ON portfolios FOR SELECT
  USING (user_id = auth.uid());

-- Users can only create orders for themselves
CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  WITH CHECK (user_id = auth.uid());
```

### Input Validation

```typescript
// lib/utils/validation.ts
export const orderSchema = z.object({
  symbol: z.string().min(1).max(5),
  side: z.enum(['buy', 'sell']),
  type: z.enum(['market', 'limit']),
  quantity: z.number().positive(),
  limitPrice: z.number().positive().optional(),
});
```

### Rate Limiting

```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'),
});

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/orders')) {
    const ip = request.ip ?? '127.0.0.1';
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return Response.json({ error: 'Too many requests' }, { status: 429 });
    }
  }
}
```

## Performance Optimizations

### Code Splitting

```typescript
// Lazy load heavy components
const TradeModal = dynamic(() => import('@/components/trading/trade-modal'), {
  loading: () => <Spinner />,
});

const StockChart = dynamic(() => import('@/components/market/stock-chart'), {
  ssr: false, // Charts don't need SSR
});
```

### Caching Strategy

```typescript
// React Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,     // 30 seconds
      cacheTime: 5 * 60_000, // 5 minutes
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});
```

### Image Optimization

```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src={stockLogo}
  alt={stockName}
  width={40}
  height={40}
  loading="lazy"
/>
```

## Error Handling

### Global Error Boundary

```typescript
// app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

### API Error Handling

```typescript
// lib/utils/api.ts
export async function apiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const error = await response.json();
    throw new ApiError(error.error.code, error.error.message);
  }
  
  return response.json();
}
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Vercel                            │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Next.js Application                 │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │   │
│  │  │  Pages   │  │   API    │  │   Static     │  │   │
│  │  │  (SSR)   │  │  Routes  │  │   Assets     │  │   │
│  │  └──────────┘  └──────────┘  └──────────────┘  │   │
│  └─────────────────────────────────────────────────┘   │
│                         │                               │
└─────────────────────────│───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                       Supabase                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  Database   │  │    Auth     │  │  Realtime   │     │
│  │ (Postgres)  │  │  (GoTrue)   │  │  (Channels) │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
```

## Next Steps

With architecture defined, proceed to Step 3: Database Design to implement the schema.


