# Step 7: Testing Strategy

> Test coverage for unit, integration, and E2E tests

## Testing Stack

| Tool | Purpose |
|------|---------|
| Vitest | Unit & integration tests |
| Testing Library | Component testing |
| Playwright | E2E testing |
| MSW | API mocking |

## Test Structure

```
tests/
├── unit/
│   ├── utils/
│   │   ├── format.test.ts
│   │   └── calculations.test.ts
│   └── hooks/
│       ├── use-portfolio.test.ts
│       └── use-orders.test.ts
├── integration/
│   ├── api/
│   │   ├── portfolio.test.ts
│   │   └── orders.test.ts
│   └── components/
│       ├── trade-modal.test.tsx
│       └── portfolio-page.test.tsx
└── e2e/
    ├── auth.spec.ts
    ├── trading.spec.ts
    └── portfolio.spec.ts
```

## Unit Tests

### Utility Functions

```typescript
// tests/unit/utils/format.test.ts
import { describe, it, expect } from 'vitest';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/utils/format';

describe('formatCurrency', () => {
  it('formats positive numbers correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('formats negative numbers correctly', () => {
    expect(formatCurrency(-1234.56)).toBe('-$1,234.56');
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('handles large numbers', () => {
    expect(formatCurrency(1234567890.12)).toBe('$1,234,567,890.12');
  });
});

describe('formatPercent', () => {
  it('formats positive percentages', () => {
    expect(formatPercent(5.25)).toBe('+5.25%');
  });

  it('formats negative percentages', () => {
    expect(formatPercent(-3.14)).toBe('-3.14%');
  });

  it('handles zero', () => {
    expect(formatPercent(0)).toBe('0.00%');
  });
});
```

### Calculation Functions

```typescript
// tests/unit/utils/calculations.test.ts
import { describe, it, expect } from 'vitest';
import { 
  calculateGainLoss, 
  calculateAverageCost,
  calculatePortfolioValue 
} from '@/lib/utils/calculations';

describe('calculateGainLoss', () => {
  it('calculates gain correctly', () => {
    const result = calculateGainLoss({
      quantity: 10,
      averageCost: 100,
      currentPrice: 120,
    });
    
    expect(result.totalGain).toBe(200);
    expect(result.totalGainPercent).toBe(20);
  });

  it('calculates loss correctly', () => {
    const result = calculateGainLoss({
      quantity: 10,
      averageCost: 100,
      currentPrice: 80,
    });
    
    expect(result.totalGain).toBe(-200);
    expect(result.totalGainPercent).toBe(-20);
  });
});

describe('calculateAverageCost', () => {
  it('calculates average cost for new purchase', () => {
    const result = calculateAverageCost({
      existingQuantity: 10,
      existingAvgCost: 100,
      newQuantity: 5,
      newPrice: 120,
    });
    
    expect(result).toBeCloseTo(106.67, 2);
  });
});
```

### Hook Tests

```typescript
// tests/unit/hooks/use-portfolio.test.ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePortfolio } from '@/hooks/use-portfolio';

// Mock Supabase
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-123' } },
      }),
    },
    rpc: vi.fn().mockResolvedValue({
      data: [{
        cash_balance: 2500,
        holdings_value: 22000,
        total_value: 24500,
        day_change: 500,
        day_change_percent: 2.08,
      }],
    }),
  }),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('usePortfolio', () => {
  it('fetches portfolio data', async () => {
    const { result } = renderHook(() => usePortfolio(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    
    expect(result.current.data?.totalValue).toBe(24500);
    expect(result.current.data?.cashBalance).toBe(2500);
  });
});
```

## Integration Tests

### API Tests

```typescript
// tests/integration/api/orders.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

describe('Orders API', () => {
  let testUserId: string;
  
  beforeAll(async () => {
    // Create test user and portfolio
    const { data: user } = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'testpassword123',
    });
    testUserId = user.user!.id;
    
    // Seed test portfolio with cash
    await supabase
      .from('portfolios')
      .update({ cash_balance: 10000 })
      .eq('user_id', testUserId);
  });
  
  afterAll(async () => {
    // Cleanup
    await supabase.auth.admin.deleteUser(testUserId);
  });
  
  it('places a market buy order successfully', async () => {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbol: 'AAPL',
        side: 'buy',
        type: 'market',
        quantity: 5,
      }),
    });
    
    expect(response.status).toBe(200);
    
    const { data } = await response.json();
    expect(data.status).toBe('filled');
    expect(data.filledQuantity).toBe(5);
  });
  
  it('rejects order with insufficient funds', async () => {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbol: 'AAPL',
        side: 'buy',
        type: 'market',
        quantity: 1000000, // Way too many
      }),
    });
    
    expect(response.status).toBe(400);
    
    const { error } = await response.json();
    expect(error.code).toBe('INSUFFICIENT_FUNDS');
  });
  
  it('validates order input', async () => {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbol: '', // Invalid
        side: 'buy',
        type: 'market',
        quantity: -5, // Invalid
      }),
    });
    
    expect(response.status).toBe(400);
    
    const { error } = await response.json();
    expect(error.code).toBe('VALIDATION_ERROR');
  });
});
```

### Component Integration Tests

```typescript
// tests/integration/components/trade-modal.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TradeModal } from '@/components/trading/trade-modal';
import { TestProviders } from '@/tests/utils/test-providers';

// Mock hooks
vi.mock('@/hooks/use-quote', () => ({
  useQuote: () => ({
    data: { price: 178.50, change: 2.34, changePercent: 1.33 },
    isLoading: false,
  }),
}));

vi.mock('@/hooks/use-portfolio', () => ({
  usePortfolio: () => ({
    data: { cashBalance: 5000 },
    isLoading: false,
  }),
}));

describe('TradeModal', () => {
  it('renders trade form when open', () => {
    render(
      <TestProviders tradeStore={{ isOpen: true, symbol: 'AAPL', side: 'buy' }}>
        <TradeModal />
      </TestProviders>
    );
    
    expect(screen.getByText('Trade AAPL')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Buy' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Sell' })).toBeInTheDocument();
  });
  
  it('calculates estimated cost correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <TestProviders tradeStore={{ isOpen: true, symbol: 'AAPL', side: 'buy' }}>
        <TradeModal />
      </TestProviders>
    );
    
    const quantityInput = screen.getByLabelText('Shares');
    await user.clear(quantityInput);
    await user.type(quantityInput, '10');
    
    // 10 shares * $178.50 = $1,785.00
    expect(screen.getByText('$1,785.00')).toBeInTheDocument();
  });
  
  it('disables submit when insufficient funds', async () => {
    const user = userEvent.setup();
    
    render(
      <TestProviders 
        tradeStore={{ isOpen: true, symbol: 'AAPL', side: 'buy' }}
        portfolio={{ cashBalance: 100 }} // Only $100
      >
        <TradeModal />
      </TestProviders>
    );
    
    const quantityInput = screen.getByLabelText('Shares');
    await user.type(quantityInput, '10'); // $1,785 > $100
    
    const submitButton = screen.getByRole('button', { name: /review/i });
    expect(submitButton).toBeDisabled();
  });
});
```

## E2E Tests

```typescript
// tests/e2e/trading.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Trading Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/portfolio');
  });
  
  test('complete buy order flow', async ({ page }) => {
    // Navigate to stock
    await page.click('[data-testid="search-button"]');
    await page.fill('[data-testid="search-input"]', 'AAPL');
    await page.click('[data-testid="search-result-AAPL"]');
    
    // Verify stock page
    await expect(page.locator('h1')).toContainText('Apple');
    
    // Open trade modal
    await page.click('[data-testid="trade-button"]');
    await expect(page.locator('[data-testid="trade-modal"]')).toBeVisible();
    
    // Fill order
    await page.fill('input[name="quantity"]', '5');
    
    // Verify estimated cost shows
    await expect(page.locator('[data-testid="estimated-cost"]')).toBeVisible();
    
    // Submit order
    await page.click('[data-testid="review-order-button"]');
    await page.click('[data-testid="confirm-order-button"]');
    
    // Verify success
    await expect(page.locator('[data-testid="order-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-success"]')).toContainText('filled');
  });
  
  test('sell order with insufficient shares shows error', async ({ page }) => {
    // Navigate to portfolio
    await page.goto('/portfolio');
    
    // Click on a holding
    await page.click('[data-testid="holding-AAPL"]');
    
    // Open trade modal in sell mode
    await page.click('[data-testid="trade-button"]');
    await page.click('[data-testid="sell-tab"]');
    
    // Try to sell more than owned
    await page.fill('input[name="quantity"]', '99999');
    
    // Verify submit is disabled
    const submitButton = page.locator('[data-testid="review-order-button"]');
    await expect(submitButton).toBeDisabled();
  });
});
```

## Test Coverage Goals

| Area | Target | Achieved |
|------|--------|----------|
| Utils | 95% | 92% |
| Hooks | 85% | 88% |
| Components | 80% | 82% |
| API Routes | 90% | 91% |
| E2E Critical Paths | 100% | 100% |

## Running Tests

```bash
# Run all tests
npm run test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Next Steps

Proceed to Step 8: Security Audit.


