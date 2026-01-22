# Step 12: Documentation

> User and developer documentation

## Documentation Structure

```
docs/
├── README.md              # Project overview
├── CONTRIBUTING.md        # Contribution guide
├── CHANGELOG.md           # Version history
├── api/                   # API documentation
│   └── README.md          # API reference
└── guides/                # User guides
    ├── getting-started.md
    └── features.md
```

## README.md

The main README (already created at project root) includes:
- Project overview
- Quick start guide
- Tech stack
- Features
- Configuration

## API Documentation

### Auto-generated with JSDoc

```typescript
/**
 * Place a new order
 * @route POST /api/orders
 * @group Trading - Order operations
 * @param {PlaceOrderRequest.model} request.body.required - Order details
 * @returns {OrderResponse.model} 200 - Order placed successfully
 * @returns {ErrorResponse.model} 400 - Validation error
 * @returns {ErrorResponse.model} 401 - Unauthorized
 * @security bearerAuth
 * @example request - Buy 10 shares of AAPL
 * {
 *   "symbol": "AAPL",
 *   "side": "buy",
 *   "type": "market",
 *   "quantity": 10
 * }
 * @example response - 200 - Order filled
 * {
 *   "data": {
 *     "id": "uuid-123",
 *     "symbol": "AAPL",
 *     "status": "filled",
 *     "filledQuantity": 10,
 *     "averageFillPrice": 178.45
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  // Implementation
}
```

## Component Documentation

### Storybook (Optional)

```typescript
// components/ui/button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

export const Loading: Story = {
  args: {
    children: 'Loading...',
    loading: true,
  },
};
```

## Inline Code Comments

### Good Comment Examples

```typescript
/**
 * Execute a trade and update portfolio holdings.
 * 
 * For buy orders:
 * 1. Verify sufficient buying power
 * 2. Deduct cash from portfolio
 * 3. Create or update holding with new average cost
 * 
 * For sell orders:
 * 1. Verify sufficient shares owned
 * 2. Add proceeds to portfolio cash
 * 3. Reduce or remove holding
 * 
 * @throws InsufficientFundsError if buying power is insufficient
 * @throws InsufficientSharesError if shares owned is less than sell quantity
 */
async function executeTrade(orderId: string, fillPrice: number): Promise<void> {
  // Implementation...
}

// Calculate new average cost when adding to position
// Formula: ((existing_qty * existing_avg) + (new_qty * new_price)) / total_qty
const newAvgCost = (
  (existingQuantity * existingAvgCost) + (newQuantity * fillPrice)
) / totalQuantity;
```

## Type Documentation

```typescript
// types/order.ts

/**
 * Represents a trade order in the system
 */
export interface Order {
  /** Unique identifier for the order */
  id: string;
  
  /** Stock symbol (e.g., "AAPL") */
  symbol: string;
  
  /** Order direction: buy to purchase, sell to dispose */
  side: 'buy' | 'sell';
  
  /** 
   * Order execution type:
   * - market: Execute immediately at current price
   * - limit: Execute only when price reaches limitPrice
   */
  type: 'market' | 'limit';
  
  /** Number of shares to trade */
  quantity: number;
  
  /** Price threshold for limit orders (null for market orders) */
  limitPrice: number | null;
  
  /**
   * Current order status:
   * - pending: Waiting for execution
   * - filled: Fully executed
   * - partial: Partially executed (limit orders)
   * - cancelled: Cancelled by user
   * - rejected: Rejected by system (insufficient funds, etc.)
   */
  status: OrderStatus;
  
  /** Number of shares actually filled */
  filledQuantity: number;
  
  /** Weighted average price of filled shares */
  averageFillPrice: number | null;
  
  /** Reason for rejection if status is 'rejected' */
  rejectionReason: string | null;
  
  /** When the order was created */
  createdAt: string;
  
  /** When the order was filled (null if not filled) */
  filledAt: string | null;
}
```

## Environment Setup Guide

```markdown
# Environment Setup

## Prerequisites

- Node.js 18+
- npm 9+
- Supabase account

## Step 1: Clone Repository

\`\`\`bash
git clone https://github.com/your-org/sigma-trade.git
cd sigma-trade
\`\`\`

## Step 2: Install Dependencies

\`\`\`bash
npm install
\`\`\`

## Step 3: Configure Environment

\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit `.env.local` with your Supabase credentials:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
\`\`\`

## Step 4: Set Up Database

\`\`\`bash
# Link to your Supabase project
npx supabase link --project-ref your-ref

# Apply migrations
npx supabase db push

# Seed test data (optional)
npx supabase db seed
\`\`\`

## Step 5: Start Development Server

\`\`\`bash
npm run dev
\`\`\`

Open http://localhost:3000
```

## Troubleshooting Guide

```markdown
# Troubleshooting

## Common Issues

### "Unable to fetch portfolio"

**Cause**: Authentication token expired or invalid.

**Solution**: 
1. Clear browser cookies
2. Log out and log back in
3. Check Supabase dashboard for auth issues

### "Order rejected: Insufficient funds"

**Cause**: Cash balance is less than order total.

**Solution**:
1. Check available buying power
2. Reduce order quantity
3. Deposit more funds

### Real-time quotes not updating

**Cause**: WebSocket connection lost.

**Solution**:
1. Refresh the page
2. Check network connectivity
3. Verify Supabase Realtime is enabled

### Charts not loading

**Cause**: Chart data API timeout.

**Solution**:
1. Refresh the page
2. Try a different time range
3. Check browser console for errors
```

## CHANGELOG.md

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-15

### Added
- Portfolio dashboard with real-time valuation
- Trading interface with market and limit orders
- Stock detail pages with interactive charts
- Watchlist management
- Order history and activity feed
- User authentication with Supabase

### Security
- Row-level security on all database tables
- Rate limiting on trading endpoints
- Input validation with Zod schemas
```

## Next Steps

Proceed to Step 13: Launch Checklist.


