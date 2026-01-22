# Step 5: Component Breakdown

> UI component hierarchy, props, and state management

## Component Tree

```
App
├── RootLayout
│   ├── Providers (QueryClient, Zustand)
│   └── Toaster
│
├── AuthLayout
│   ├── AuthHeader
│   └── AuthRoutes
│       ├── LoginPage
│       └── RegisterPage
│
└── AppLayout
    ├── AppHeader
    │   ├── Logo
    │   ├── SearchButton
    │   └── UserMenu
    │
    ├── MainContent
    │   ├── PortfolioPage
    │   │   ├── PortfolioHeader
    │   │   ├── PerformanceChart
    │   │   └── HoldingsList
    │   │       └── HoldingRow
    │   │
    │   ├── MarketsPage
    │   │   ├── SearchInput
    │   │   ├── MoversTabs
    │   │   │   └── MoversList
    │   │   │       └── MoverRow
    │   │   └── SectorGrid
    │   │       └── SectorCard
    │   │
    │   ├── ActivityPage
    │   │   ├── StatusFilter
    │   │   └── OrdersList
    │   │       └── OrderRow
    │   │
    │   └── StockDetailPage
    │       ├── StockHeader
    │       ├── PriceDisplay
    │       ├── StockChart
    │       ├── KeyStats
    │       ├── AboutSection
    │       └── TradeButton
    │
    ├── BottomNav
    │   └── NavItem
    │
    └── Modals
        ├── TradeModal
        │   ├── TradeTabs (Buy/Sell)
        │   ├── OrderTypeSelector
        │   ├── QuantityInput
        │   └── OrderPreview
        │
        ├── ConfirmModal
        │   └── OrderSummary
        │
        └── SearchModal
            ├── SearchInput
            └── SearchResults
```

## Primitive Components (ui/)

### Button

```typescript
// components/ui/button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

// Usage
<Button variant="primary" size="lg" loading={isSubmitting}>
  Place Order
</Button>
```

### Card

```typescript
// components/ui/card.tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

// Usage
<Card hoverable onClick={() => navigate(`/stock/${symbol}`)}>
  <HoldingContent />
</Card>
```

### Input

```typescript
// components/ui/input.tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

// Usage
<Input
  label="Shares"
  type="number"
  prefix="$"
  error={errors.quantity?.message}
/>
```

### Modal

```typescript
// components/ui/modal.tsx
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

// Usage
<Modal open={isOpen} onClose={handleClose} title="Trade AAPL">
  <TradeForm />
</Modal>
```

### Tabs

```typescript
// components/ui/tabs.tsx
interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  tabs: { value: string; label: string }[];
}

// Usage
<Tabs
  value={activeTab}
  onValueChange={setActiveTab}
  tabs={[
    { value: 'buy', label: 'Buy' },
    { value: 'sell', label: 'Sell' },
  ]}
/>
```

### Badge

```typescript
// components/ui/badge.tsx
interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error';
  children: React.ReactNode;
}

// Usage
<Badge variant="success">Filled</Badge>
```

---

## Feature Components

### PortfolioHeader

```typescript
// components/portfolio/portfolio-header.tsx
interface PortfolioHeaderProps {
  totalValue: number;
  dayChange: number;
  dayChangePercent: number;
  isLoading?: boolean;
}

// State: None (presentational)
// Data: From usePortfolio() hook

export function PortfolioHeader({
  totalValue,
  dayChange,
  dayChangePercent,
  isLoading,
}: PortfolioHeaderProps) {
  return (
    <div className="text-center py-8">
      <p className="text-muted text-sm">Portfolio Value</p>
      <h1 className="text-4xl font-bold">
        {formatCurrency(totalValue)}
      </h1>
      <ChangeIndicator
        value={dayChange}
        percent={dayChangePercent}
        label="Today"
      />
    </div>
  );
}
```

### PerformanceChart

```typescript
// components/portfolio/performance-chart.tsx
interface PerformanceChartProps {
  data: DataPoint[];
  range: TimeRange;
  onRangeChange: (range: TimeRange) => void;
  isLoading?: boolean;
}

// State: Internal hover state for crosshair
// Data: From usePortfolioPerformance(range) hook

export function PerformanceChart({
  data,
  range,
  onRangeChange,
  isLoading,
}: PerformanceChartProps) {
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);
  
  return (
    <div>
      <ResponsiveContainer height={200}>
        <AreaChart data={data}>
          {/* Chart configuration */}
        </AreaChart>
      </ResponsiveContainer>
      <TimeRangeSelector value={range} onChange={onRangeChange} />
    </div>
  );
}
```

### HoldingRow

```typescript
// components/portfolio/holding-row.tsx
interface HoldingRowProps {
  holding: Holding;
  onClick?: () => void;
}

export function HoldingRow({ holding, onClick }: HoldingRowProps) {
  return (
    <Card hoverable onClick={onClick}>
      <div className="flex justify-between items-center p-4">
        <div>
          <p className="font-semibold">{holding.symbol}</p>
          <p className="text-sm text-muted">
            {holding.quantity} shares @ {formatCurrency(holding.averageCost)}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold">{formatCurrency(holding.marketValue)}</p>
          <ChangeIndicator
            value={holding.totalGain}
            percent={holding.totalGainPercent}
          />
        </div>
      </div>
    </Card>
  );
}
```

### TradeModal

```typescript
// components/trading/trade-modal.tsx
interface TradeModalProps {
  symbol: string;
  initialSide?: 'buy' | 'sell';
}

// State: Form state (side, type, quantity, limitPrice)
// Actions: Submit order via useCreateOrder mutation

export function TradeModal({ symbol, initialSide = 'buy' }: TradeModalProps) {
  const { isOpen, closeTrade } = useTradeStore();
  const { data: quote } = useQuote(symbol);
  const { data: holding } = useHolding(symbol);
  const { data: portfolio } = usePortfolio();
  
  const [side, setSide] = useState<'buy' | 'sell'>(initialSide);
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [quantity, setQuantity] = useState<number>(0);
  const [limitPrice, setLimitPrice] = useState<number | undefined>();
  
  const estimatedCost = quantity * (limitPrice || quote?.price || 0);
  
  const canSubmit = useMemo(() => {
    if (side === 'buy') {
      return estimatedCost <= (portfolio?.cashBalance || 0);
    } else {
      return quantity <= (holding?.quantity || 0);
    }
  }, [side, quantity, estimatedCost, portfolio, holding]);
  
  return (
    <Modal open={isOpen} onClose={closeTrade} title={`Trade ${symbol}`}>
      {/* Form components */}
    </Modal>
  );
}
```

### StockChart

```typescript
// components/market/stock-chart.tsx
interface StockChartProps {
  symbol: string;
  range: TimeRange;
  chartType: 'line' | 'candle';
  onRangeChange: (range: TimeRange) => void;
}

// Data: From useChartData(symbol, range) hook
// State: Chart interaction state (zoom, pan, crosshair)

export function StockChart({
  symbol,
  range,
  chartType,
  onRangeChange,
}: StockChartProps) {
  const { data, isLoading } = useChartData(symbol, range);
  
  if (chartType === 'candle') {
    return <CandlestickChart data={data} />;
  }
  
  return <LineChart data={data} />;
}
```

### SearchInput

```typescript
// components/market/search-input.tsx
interface SearchInputProps {
  onSelect: (symbol: string) => void;
}

// State: Query string, results, open state
// Data: From useStockSearch(query) hook with debounce

export function SearchInput({ onSelect }: SearchInputProps) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const { data: results, isLoading } = useStockSearch(debouncedQuery);
  
  return (
    <Command>
      <CommandInput
        value={query}
        onChange={setQuery}
        placeholder="Search stocks..."
      />
      <CommandList>
        {results?.map((stock) => (
          <CommandItem
            key={stock.symbol}
            onSelect={() => onSelect(stock.symbol)}
          >
            {stock.symbol} - {stock.name}
          </CommandItem>
        ))}
      </CommandList>
    </Command>
  );
}
```

### OrderRow

```typescript
// components/activity/order-row.tsx
interface OrderRowProps {
  order: Order;
  onCancel?: () => void;
}

export function OrderRow({ order, onCancel }: OrderRowProps) {
  return (
    <Card>
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center gap-3">
          <StatusIcon status={order.status} />
          <div>
            <p className="font-semibold">
              {order.side === 'buy' ? 'Buy' : 'Sell'} {order.symbol}
            </p>
            <p className="text-sm text-muted">
              {order.quantity} shares @ {order.type === 'limit' 
                ? formatCurrency(order.limitPrice) + ' limit'
                : 'market'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold">
            {order.averageFillPrice 
              ? formatCurrency(order.quantity * order.averageFillPrice)
              : 'Pending'}
          </p>
          <p className="text-sm text-muted">{formatTime(order.createdAt)}</p>
          {order.status === 'pending' && onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
```

---

## Hooks

### usePortfolio

```typescript
// hooks/use-portfolio.ts
export function usePortfolio() {
  return useQuery({
    queryKey: ['portfolio'],
    queryFn: fetchPortfolio,
    staleTime: 30_000,
  });
}
```

### useQuote

```typescript
// hooks/use-quote.ts
export function useQuote(symbol: string) {
  return useQuery({
    queryKey: ['quote', symbol],
    queryFn: () => fetchQuote(symbol),
    staleTime: 5_000,
    refetchInterval: 5_000,
  });
}
```

### useCreateOrder

```typescript
// hooks/use-orders.ts
export function useCreateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: placeOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
```

### useTradeStore

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
  closeTrade: () => set({ isOpen: false, symbol: null, side: 'buy' }),
}));
```

---

## Component Composition Patterns

### Compound Components

```typescript
// Usage of compound pattern for Tabs
<Tabs.Root value={tab} onValueChange={setTab}>
  <Tabs.List>
    <Tabs.Trigger value="buy">Buy</Tabs.Trigger>
    <Tabs.Trigger value="sell">Sell</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="buy">
    <BuyForm />
  </Tabs.Content>
  <Tabs.Content value="sell">
    <SellForm />
  </Tabs.Content>
</Tabs.Root>
```

### Render Props

```typescript
// Price display with custom formatting
<PriceDisplay
  price={quote.price}
  change={quote.change}
  render={({ price, changeClass }) => (
    <div className={changeClass}>
      <span className="text-3xl">{price}</span>
    </div>
  )}
/>
```

### Higher-Order Components

```typescript
// Protect routes with auth
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return function AuthenticatedComponent(props: P) {
    const { user, isLoading } = useAuth();
    
    if (isLoading) return <LoadingScreen />;
    if (!user) return <Navigate to="/login" />;
    
    return <Component {...props} />;
  };
};
```

---

## Component Testing Strategy

Each component should have:

1. **Unit Test**: Renders correctly with different props
2. **Interaction Test**: User events work as expected
3. **Loading State Test**: Shows skeleton/spinner
4. **Error State Test**: Displays error UI

Example:

```typescript
// components/portfolio/holding-row.test.tsx
describe('HoldingRow', () => {
  const mockHolding = {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    quantity: 10,
    averageCost: 150,
    marketValue: 1800,
    totalGain: 300,
    totalGainPercent: 20,
  };

  it('renders holding information', () => {
    render(<HoldingRow holding={mockHolding} />);
    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('$1,800.00')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<HoldingRow holding={mockHolding} onClick={onClick} />);
    await userEvent.click(screen.getByRole('article'));
    expect(onClick).toHaveBeenCalled();
  });
});
```

## Next Steps

Proceed to Step 6: Implementation to build these components.


