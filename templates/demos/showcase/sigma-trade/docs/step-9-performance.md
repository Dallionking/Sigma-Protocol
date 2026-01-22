# Step 9: Performance Optimization

> Performance analysis and optimization strategies

## Performance Targets

| Metric | Target | Initial | Optimized |
|--------|--------|---------|-----------|
| First Contentful Paint | < 1.5s | 1.8s | 1.2s |
| Largest Contentful Paint | < 2.5s | 3.1s | 2.1s |
| Time to Interactive | < 3.0s | 3.4s | 2.4s |
| Cumulative Layout Shift | < 0.1 | 0.15 | 0.05 |
| First Input Delay | < 100ms | 120ms | 45ms |
| Lighthouse Score | > 90 | 78 | 94 |

## Bundle Analysis

### Before Optimization

```
Route (app)                              Size     First Load JS
┌ ○ /                                    5.2 kB   185 kB
├ ○ /portfolio                           12.4 kB  192 kB
├ ○ /markets                             8.3 kB   188 kB
├ ○ /stock/[symbol]                      15.1 kB  195 kB
└ ○ /activity                            6.8 kB   187 kB

Total First Load JS: 185 kB (shared)
```

### After Optimization

```
Route (app)                              Size     First Load JS
┌ ○ /                                    3.8 kB   128 kB
├ ○ /portfolio                           8.2 kB   136 kB
├ ○ /markets                             5.9 kB   134 kB
├ ○ /stock/[symbol]                      9.8 kB   138 kB
└ ○ /activity                            4.5 kB   133 kB

Total First Load JS: 128 kB (shared) - 31% reduction
```

## Optimization Strategies Applied

### 1. Code Splitting

```typescript
// Heavy components loaded dynamically
import dynamic from 'next/dynamic';

// Chart component (heavy dependency)
const StockChart = dynamic(
  () => import('@/components/market/stock-chart'),
  {
    loading: () => <ChartSkeleton />,
    ssr: false, // Charts don't need SSR
  }
);

// Trade modal (not needed on initial load)
const TradeModal = dynamic(
  () => import('@/components/trading/trade-modal'),
  { loading: () => null }
);

// Search modal (user-triggered)
const SearchModal = dynamic(
  () => import('@/components/search/search-modal'),
  { loading: () => null }
);
```

### 2. Image Optimization

```typescript
// Using Next.js Image for all images
import Image from 'next/image';

function StockLogo({ symbol, name }: { symbol: string; name: string }) {
  return (
    <Image
      src={`/logos/${symbol.toLowerCase()}.png`}
      alt={`${name} logo`}
      width={40}
      height={40}
      loading="lazy" // Lazy load off-screen images
      placeholder="blur"
      blurDataURL={placeholderImage}
    />
  );
}
```

### 3. Data Caching with React Query

```typescript
// Optimized query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data considered fresh for 30 seconds
      staleTime: 30 * 1000,
      
      // Keep in cache for 5 minutes
      gcTime: 5 * 60 * 1000,
      
      // Refetch when window regains focus
      refetchOnWindowFocus: true,
      
      // Only retry once on failure
      retry: 1,
      
      // Don't refetch on mount if data exists
      refetchOnMount: false,
    },
  },
});

// Portfolio query with optimized settings
export function usePortfolio() {
  return useQuery({
    queryKey: ['portfolio'],
    queryFn: fetchPortfolio,
    staleTime: 30_000,
    // Prefetch on hover for instant navigation
    placeholderData: (previousData) => previousData,
  });
}
```

### 4. Prefetching

```typescript
// Prefetch data on hover
function HoldingRow({ holding }: { holding: Holding }) {
  const queryClient = useQueryClient();
  
  const handleMouseEnter = () => {
    // Prefetch quote data for this stock
    queryClient.prefetchQuery({
      queryKey: ['quote', holding.symbol],
      queryFn: () => fetchQuote(holding.symbol),
      staleTime: 5000,
    });
    
    // Prefetch chart data
    queryClient.prefetchQuery({
      queryKey: ['chart', holding.symbol, '1D'],
      queryFn: () => fetchChart(holding.symbol, '1D'),
      staleTime: 60000,
    });
  };
  
  return (
    <Card onMouseEnter={handleMouseEnter}>
      {/* content */}
    </Card>
  );
}
```

### 5. Virtualization for Long Lists

```typescript
// Using react-window for order history
import { FixedSizeList as List } from 'react-window';

function OrdersList({ orders }: { orders: Order[] }) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <OrderRow order={orders[index]} />
    </div>
  );
  
  return (
    <List
      height={600}
      itemCount={orders.length}
      itemSize={72}
      width="100%"
    >
      {Row}
    </List>
  );
}
```

### 6. Optimistic Updates

```typescript
// Instant UI feedback for trades
export function useCreateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: placeOrder,
    
    // Optimistically update the UI
    onMutate: async (newOrder) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['portfolio'] });
      
      // Snapshot previous value
      const previousPortfolio = queryClient.getQueryData(['portfolio']);
      
      // Optimistically update
      queryClient.setQueryData(['portfolio'], (old: Portfolio) => ({
        ...old,
        cashBalance: newOrder.side === 'buy' 
          ? old.cashBalance - (newOrder.quantity * newOrder.estimatedPrice)
          : old.cashBalance + (newOrder.quantity * newOrder.estimatedPrice),
      }));
      
      return { previousPortfolio };
    },
    
    // Rollback on error
    onError: (err, newOrder, context) => {
      queryClient.setQueryData(['portfolio'], context?.previousPortfolio);
    },
    
    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
```

### 7. Real-time Data Efficiency

```typescript
// Efficient realtime subscription management
function useQuotes(symbols: string[]) {
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  
  useEffect(() => {
    if (symbols.length === 0) return;
    
    const supabase = createClient();
    
    // Subscribe only to symbols we care about
    const channel = supabase
      .channel('quotes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'quotes',
          filter: `symbol=in.(${symbols.join(',')})`,
        },
        (payload) => {
          // Only update the specific symbol that changed
          setQuotes((prev) => ({
            ...prev,
            [payload.new.symbol]: payload.new,
          }));
        }
      )
      .subscribe();
    
    return () => {
      channel.unsubscribe();
    };
  }, [symbols.join(',')]); // Stable dependency
  
  return quotes;
}
```

### 8. CSS Optimization

```css
/* Use CSS containment for complex components */
.chart-container {
  contain: layout style paint;
}

.holdings-list {
  contain: layout;
}

/* Reduce repaints with will-change */
.price-change {
  will-change: contents;
}

/* Use content-visibility for off-screen content */
.order-history-item {
  content-visibility: auto;
  contain-intrinsic-size: 72px;
}
```

## Lighthouse Report

```
Performance: 94
├── First Contentful Paint: 1.2s
├── Largest Contentful Paint: 2.1s
├── Total Blocking Time: 120ms
├── Cumulative Layout Shift: 0.05
└── Speed Index: 1.8s

Accessibility: 98
Best Practices: 100
SEO: 100
```

## Monitoring

```typescript
// Performance monitoring with web-vitals
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

export function reportWebVitals() {
  onCLS((metric) => sendToAnalytics('CLS', metric.value));
  onFID((metric) => sendToAnalytics('FID', metric.value));
  onFCP((metric) => sendToAnalytics('FCP', metric.value));
  onLCP((metric) => sendToAnalytics('LCP', metric.value));
  onTTFB((metric) => sendToAnalytics('TTFB', metric.value));
}
```

## Next Steps

Proceed to Step 10: Deployment Setup.


