# Step 6: Implementation Notes

> Key implementation decisions and code snippets

## Setup

### Project Initialization

```bash
# Create Next.js project
npx create-next-app@latest sigma-trade --typescript --tailwind --eslint --app

# Install dependencies
npm install @supabase/supabase-js @supabase/ssr zustand @tanstack/react-query
npm install recharts zod react-hook-form @hookform/resolvers
npm install @radix-ui/react-dialog @radix-ui/react-tabs @radix-ui/react-popover
npm install date-fns clsx tailwind-merge

# Dev dependencies
npm install -D @types/node vitest @vitejs/plugin-react @testing-library/react
```

### Environment Setup

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Key Implementation Files

### Supabase Client

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

```typescript
// lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}
```

### Query Client Provider

```typescript
// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            refetchOnWindowFocus: true,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### Portfolio Hook Implementation

```typescript
// hooks/use-portfolio.ts
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export interface Portfolio {
  id: string;
  cashBalance: number;
  holdingsValue: number;
  totalValue: number;
  dayChange: number;
  dayChangePercent: number;
}

async function fetchPortfolio(): Promise<Portfolio> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  
  const { data, error } = await supabase
    .rpc('calculate_portfolio_value', { p_user_id: user.id });
  
  if (error) throw error;
  
  return {
    id: user.id,
    cashBalance: data[0].cash_balance,
    holdingsValue: data[0].holdings_value,
    totalValue: data[0].total_value,
    dayChange: data[0].day_change,
    dayChangePercent: data[0].day_change_percent,
  };
}

export function usePortfolio() {
  return useQuery({
    queryKey: ['portfolio'],
    queryFn: fetchPortfolio,
    staleTime: 30_000,
  });
}
```

### Order Placement API

```typescript
// app/api/orders/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const orderSchema = z.object({
  symbol: z.string().min(1).max(5).toUpperCase(),
  side: z.enum(['buy', 'sell']),
  type: z.enum(['market', 'limit']),
  quantity: z.number().positive(),
  limitPrice: z.number().positive().optional(),
}).refine(
  (data) => data.type !== 'limit' || data.limitPrice !== undefined,
  { message: 'Limit price required for limit orders' }
);

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }
    
    // Validate input
    const body = await request.json();
    const result = orderSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: result.error.message } },
        { status: 400 }
      );
    }
    
    const { symbol, side, type, quantity, limitPrice } = result.data;
    
    // Get current quote for market orders
    let fillPrice = limitPrice;
    if (type === 'market') {
      const { data: quote } = await supabase
        .from('quotes')
        .select('price')
        .eq('symbol', symbol)
        .single();
      
      fillPrice = quote?.price;
    }
    
    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        symbol,
        side,
        type,
        quantity,
        limit_price: limitPrice,
        status: 'pending',
      })
      .select()
      .single();
    
    if (orderError) throw orderError;
    
    // For market orders, execute immediately (demo purposes)
    if (type === 'market' && fillPrice) {
      const { error: executeError } = await supabase
        .rpc('execute_trade', {
          p_order_id: order.id,
          p_fill_price: fillPrice,
        });
      
      if (executeError) throw executeError;
      
      // Fetch updated order
      const { data: filledOrder } = await supabase
        .from('orders')
        .select()
        .eq('id', order.id)
        .single();
      
      return NextResponse.json({ data: filledOrder });
    }
    
    return NextResponse.json({ data: order });
    
  } catch (error) {
    console.error('Order error:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Failed to place order' } },
      { status: 500 }
    );
  }
}
```

### Trade Modal Component

```typescript
// components/trading/trade-modal.tsx
'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs } from '@/components/ui/tabs';
import { useTradeStore } from '@/store/trade-store';
import { useQuote } from '@/hooks/use-quote';
import { usePortfolio } from '@/hooks/use-portfolio';
import { useHolding } from '@/hooks/use-holding';
import { useCreateOrder } from '@/hooks/use-orders';
import { formatCurrency } from '@/lib/utils/format';

const tradeSchema = z.object({
  quantity: z.number().positive('Enter a valid quantity'),
  limitPrice: z.number().positive().optional(),
});

type TradeFormData = z.infer<typeof tradeSchema>;

export function TradeModal() {
  const { isOpen, symbol, side, closeTrade } = useTradeStore();
  const { data: quote } = useQuote(symbol || '');
  const { data: portfolio } = usePortfolio();
  const { data: holding } = useHolding(symbol || '');
  const createOrder = useCreateOrder();
  
  const [currentSide, setCurrentSide] = useState(side);
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<TradeFormData>({
    resolver: zodResolver(tradeSchema),
  });
  
  const quantity = watch('quantity') || 0;
  const limitPrice = watch('limitPrice');
  
  const estimatedCost = useMemo(() => {
    const price = orderType === 'limit' && limitPrice 
      ? limitPrice 
      : quote?.price || 0;
    return quantity * price;
  }, [quantity, limitPrice, orderType, quote]);
  
  const canSubmit = useMemo(() => {
    if (!quantity || quantity <= 0) return false;
    if (currentSide === 'buy') {
      return estimatedCost <= (portfolio?.cashBalance || 0);
    }
    return quantity <= (holding?.quantity || 0);
  }, [currentSide, quantity, estimatedCost, portfolio, holding]);
  
  const onSubmit = async (data: TradeFormData) => {
    if (!symbol) return;
    
    try {
      await createOrder.mutateAsync({
        symbol,
        side: currentSide,
        type: orderType,
        quantity: data.quantity,
        limitPrice: orderType === 'limit' ? data.limitPrice : undefined,
      });
      closeTrade();
    } catch (error) {
      // Error handling via toast
    }
  };
  
  if (!symbol) return null;
  
  return (
    <Modal open={isOpen} onClose={closeTrade} title={`Trade ${symbol}`}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Buy/Sell Tabs */}
        <Tabs
          value={currentSide}
          onValueChange={(v) => setCurrentSide(v as 'buy' | 'sell')}
          tabs={[
            { value: 'buy', label: 'Buy' },
            { value: 'sell', label: 'Sell' },
          ]}
        />
        
        {/* Order Type */}
        <Tabs
          value={orderType}
          onValueChange={(v) => setOrderType(v as 'market' | 'limit')}
          tabs={[
            { value: 'market', label: 'Market' },
            { value: 'limit', label: 'Limit' },
          ]}
        />
        
        {/* Quantity Input */}
        <Input
          label="Shares"
          type="number"
          step="0.000001"
          {...register('quantity', { valueAsNumber: true })}
          error={errors.quantity?.message}
        />
        
        {/* Limit Price (if limit order) */}
        {orderType === 'limit' && (
          <Input
            label="Limit Price"
            type="number"
            step="0.01"
            prefix="$"
            {...register('limitPrice', { valueAsNumber: true })}
            error={errors.limitPrice?.message}
          />
        )}
        
        {/* Order Preview */}
        <div className="bg-muted rounded-lg p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {orderType === 'market' ? 'Market Price' : 'Limit Price'}
            </span>
            <span>
              {formatCurrency(orderType === 'limit' && limitPrice 
                ? limitPrice 
                : quote?.price || 0)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shares</span>
            <span>{quantity || 0}</span>
          </div>
          <hr className="border-border" />
          <div className="flex justify-between font-semibold">
            <span>Estimated {currentSide === 'buy' ? 'Cost' : 'Credit'}</span>
            <span>{formatCurrency(estimatedCost)}</span>
          </div>
        </div>
        
        {/* Available Balance */}
        <p className="text-sm text-muted-foreground text-center">
          {currentSide === 'buy' 
            ? `Available: ${formatCurrency(portfolio?.cashBalance || 0)}`
            : `Shares owned: ${holding?.quantity || 0}`}
        </p>
        
        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={!canSubmit}
          loading={createOrder.isPending}
        >
          Review {currentSide === 'buy' ? 'Purchase' : 'Sale'}
        </Button>
      </form>
    </Modal>
  );
}
```

### Portfolio Page

```typescript
// app/(app)/portfolio/page.tsx
'use client';

import { PortfolioHeader } from '@/components/portfolio/portfolio-header';
import { PerformanceChart } from '@/components/portfolio/performance-chart';
import { HoldingsList } from '@/components/portfolio/holdings-list';
import { usePortfolio } from '@/hooks/use-portfolio';
import { useHoldings } from '@/hooks/use-holdings';
import { usePortfolioPerformance } from '@/hooks/use-portfolio-performance';
import { useState } from 'react';
import type { TimeRange } from '@/types';

export default function PortfolioPage() {
  const [range, setRange] = useState<TimeRange>('1M');
  
  const { data: portfolio, isLoading: portfolioLoading } = usePortfolio();
  const { data: holdings, isLoading: holdingsLoading } = useHoldings();
  const { data: performance, isLoading: performanceLoading } = usePortfolioPerformance(range);
  
  return (
    <div className="container py-6 space-y-6">
      <PortfolioHeader
        totalValue={portfolio?.totalValue || 0}
        dayChange={portfolio?.dayChange || 0}
        dayChangePercent={portfolio?.dayChangePercent || 0}
        isLoading={portfolioLoading}
      />
      
      <PerformanceChart
        data={performance?.dataPoints || []}
        range={range}
        onRangeChange={setRange}
        isLoading={performanceLoading}
      />
      
      <HoldingsList
        holdings={holdings || []}
        isLoading={holdingsLoading}
      />
      
      <div className="text-center py-4">
        <p className="text-muted-foreground">
          Buying Power: {formatCurrency(portfolio?.cashBalance || 0)}
        </p>
      </div>
    </div>
  );
}
```

## Performance Optimizations

### Dynamic Imports

```typescript
// Lazy load heavy components
const StockChart = dynamic(
  () => import('@/components/market/stock-chart'),
  { 
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);

const TradeModal = dynamic(
  () => import('@/components/trading/trade-modal'),
  { loading: () => null }
);
```

### React Query Optimizations

```typescript
// Prefetch on hover
function StockCard({ symbol }: { symbol: string }) {
  const queryClient = useQueryClient();
  
  const handleMouseEnter = () => {
    queryClient.prefetchQuery({
      queryKey: ['quote', symbol],
      queryFn: () => fetchQuote(symbol),
    });
  };
  
  return (
    <Card onMouseEnter={handleMouseEnter}>
      {/* content */}
    </Card>
  );
}
```

## Error Handling

### Global Error Boundary

```typescript
// app/error.tsx
'use client';

import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-xl font-semibold mb-4">Something went wrong</h2>
      <p className="text-muted-foreground mb-4">{error.message}</p>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  );
}
```

## Next Steps

Proceed to Step 7: Testing to validate the implementation.


