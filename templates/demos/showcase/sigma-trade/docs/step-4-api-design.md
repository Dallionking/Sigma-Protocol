# Step 4: API Design

> RESTful API specifications and contracts

## API Overview

All API routes are implemented as Next.js Route Handlers under `/app/api/`.

### Base URL

```
Development: http://localhost:3000/api
Production:  https://your-domain.com/api
```

### Authentication

All endpoints (except public market data) require authentication via Supabase session cookies.

```typescript
// Headers
Cookie: sb-access-token=<token>; sb-refresh-token=<token>
```

### Response Format

```typescript
// Success Response
{
  "data": <T>,
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}

// Error Response
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {} // Optional additional info
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Not authorized |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid input |
| `INSUFFICIENT_FUNDS` | 400 | Not enough buying power |
| `INSUFFICIENT_SHARES` | 400 | Not enough shares to sell |
| `MARKET_CLOSED` | 400 | Trading not available |
| `RATE_LIMITED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |

---

## Portfolio Endpoints

### GET /api/portfolio

Get the authenticated user's portfolio summary.

**Response:**

```typescript
interface PortfolioResponse {
  data: {
    id: string;
    cashBalance: number;
    holdingsValue: number;
    totalValue: number;
    dayChange: number;
    dayChangePercent: number;
    updatedAt: string;
  };
}
```

**Example:**

```json
{
  "data": {
    "id": "uuid-123",
    "cashBalance": 2500.00,
    "holdingsValue": 22067.89,
    "totalValue": 24567.89,
    "dayChange": 1234.56,
    "dayChangePercent": 5.29,
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### GET /api/portfolio/holdings

Get all holdings in the user's portfolio.

**Response:**

```typescript
interface HoldingsResponse {
  data: Holding[];
}

interface Holding {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  averageCost: number;
  currentPrice: number;
  marketValue: number;
  totalGain: number;
  totalGainPercent: number;
  dayChange: number;
  dayChangePercent: number;
}
```

---

### GET /api/portfolio/performance

Get historical portfolio performance data.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `range` | string | `1M` | Time range: `1D`, `1W`, `1M`, `3M`, `1Y`, `ALL` |

**Response:**

```typescript
interface PerformanceResponse {
  data: {
    range: string;
    startValue: number;
    endValue: number;
    change: number;
    changePercent: number;
    dataPoints: DataPoint[];
  };
}

interface DataPoint {
  timestamp: string;
  value: number;
}
```

---

## Trading Endpoints

### POST /api/orders

Place a new order.

**Request:**

```typescript
interface PlaceOrderRequest {
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  quantity: number;
  limitPrice?: number; // Required for limit orders
}
```

**Validation Rules:**

- `symbol`: 1-5 uppercase characters
- `quantity`: > 0, up to 6 decimal places
- `limitPrice`: Required if type is `limit`, must be > 0
- For `buy`: Total cost must not exceed cash balance
- For `sell`: Quantity must not exceed held shares

**Response:**

```typescript
interface OrderResponse {
  data: {
    id: string;
    symbol: string;
    side: 'buy' | 'sell';
    type: 'market' | 'limit';
    quantity: number;
    limitPrice: number | null;
    status: 'pending' | 'filled' | 'rejected';
    filledQuantity: number;
    averageFillPrice: number | null;
    rejectionReason: string | null;
    createdAt: string;
    filledAt: string | null;
  };
}
```

**Example Request:**

```json
{
  "symbol": "AAPL",
  "side": "buy",
  "type": "market",
  "quantity": 10
}
```

**Example Response (filled):**

```json
{
  "data": {
    "id": "order-uuid-123",
    "symbol": "AAPL",
    "side": "buy",
    "type": "market",
    "quantity": 10,
    "limitPrice": null,
    "status": "filled",
    "filledQuantity": 10,
    "averageFillPrice": 178.45,
    "rejectionReason": null,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "filledAt": "2024-01-15T10:30:01.000Z"
  }
}
```

---

### GET /api/orders

List user's orders.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `status` | string | all | Filter by status |
| `symbol` | string | - | Filter by symbol |
| `limit` | number | 20 | Max results (1-100) |
| `offset` | number | 0 | Pagination offset |

**Response:**

```typescript
interface OrdersListResponse {
  data: Order[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}
```

---

### GET /api/orders/:id

Get a specific order.

**Response:**

```typescript
interface OrderDetailResponse {
  data: Order;
}
```

---

### DELETE /api/orders/:id

Cancel a pending order.

**Validation:**

- Order must be `pending` status
- Order must belong to authenticated user

**Response:**

```json
{
  "data": {
    "id": "order-uuid-123",
    "status": "cancelled"
  }
}
```

---

## Market Data Endpoints

### GET /api/quotes/:symbol

Get real-time quote for a stock.

**Response:**

```typescript
interface QuoteResponse {
  data: {
    symbol: string;
    name: string;
    price: number;
    open: number;
    high: number;
    low: number;
    previousClose: number;
    change: number;
    changePercent: number;
    volume: number;
    marketCap: number;
    peRatio: number;
    week52High: number;
    week52Low: number;
    updatedAt: string;
  };
}
```

---

### GET /api/quotes/batch

Get quotes for multiple symbols.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `symbols` | string | Comma-separated symbols |

**Example:** `/api/quotes/batch?symbols=AAPL,TSLA,MSFT`

**Response:**

```typescript
interface BatchQuoteResponse {
  data: Record<string, Quote>;
}
```

---

### GET /api/stocks/search

Search for stocks by symbol or name.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `q` | string | required | Search query |
| `limit` | number | 10 | Max results |

**Response:**

```typescript
interface SearchResponse {
  data: {
    symbol: string;
    name: string;
    sector: string;
  }[];
}
```

---

### GET /api/stocks/movers

Get market movers (gainers, losers, most active).

**Query Parameters:**

| Param | Type | Default | Options |
|-------|------|---------|---------|
| `type` | string | `gainers` | `gainers`, `losers`, `active` |
| `limit` | number | 10 | Max results |

**Response:**

```typescript
interface MoversResponse {
  data: {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
  }[];
}
```

---

### GET /api/charts/:symbol

Get historical price data for charts.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `range` | string | `1D` | `1D`, `1W`, `1M`, `3M`, `1Y`, `ALL` |
| `interval` | string | auto | `1m`, `5m`, `15m`, `1h`, `1d` |

**Response:**

```typescript
interface ChartResponse {
  data: {
    symbol: string;
    range: string;
    interval: string;
    candles: Candle[];
  };
}

interface Candle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
```

---

## Watchlist Endpoints

### GET /api/watchlist

Get user's watchlist(s).

**Response:**

```typescript
interface WatchlistResponse {
  data: {
    id: string;
    name: string;
    items: {
      symbol: string;
      name: string;
      price: number;
      change: number;
      changePercent: number;
      addedAt: string;
    }[];
  }[];
}
```

---

### POST /api/watchlist

Add a stock to watchlist.

**Request:**

```typescript
interface AddToWatchlistRequest {
  symbol: string;
  watchlistId?: string; // If not provided, uses default
}
```

**Response:**

```json
{
  "data": {
    "watchlistId": "uuid-123",
    "symbol": "AAPL",
    "addedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### DELETE /api/watchlist/:symbol

Remove a stock from watchlist.

**Response:**

```json
{
  "data": {
    "removed": true
  }
}
```

---

## Account Endpoints

### GET /api/account

Get account information.

**Response:**

```typescript
interface AccountResponse {
  data: {
    id: string;
    email: string;
    name: string;
    cashBalance: number;
    buyingPower: number;
    pendingDeposits: number;
    pendingWithdrawals: number;
    createdAt: string;
  };
}
```

---

### POST /api/account/deposit

Simulate a deposit (demo only).

**Request:**

```json
{
  "amount": 1000.00
}
```

**Response:**

```json
{
  "data": {
    "transactionId": "uuid-123",
    "amount": 1000.00,
    "status": "completed",
    "newBalance": 3500.00
  }
}
```

---

### POST /api/account/withdraw

Simulate a withdrawal (demo only).

**Request:**

```json
{
  "amount": 500.00
}
```

**Response:**

```json
{
  "data": {
    "transactionId": "uuid-456",
    "amount": 500.00,
    "status": "completed",
    "newBalance": 3000.00
  }
}
```

---

## Rate Limiting

| Endpoint Pattern | Limit |
|-----------------|-------|
| `/api/orders` (POST) | 100/min |
| `/api/quotes/*` | 300/min |
| `/api/*` (other) | 600/min |

## Zod Schemas

```typescript
// lib/utils/validation.ts
import { z } from 'zod';

export const placeOrderSchema = z.object({
  symbol: z.string().min(1).max(5).toUpperCase(),
  side: z.enum(['buy', 'sell']),
  type: z.enum(['market', 'limit']),
  quantity: z.number().positive().multipleOf(0.000001),
  limitPrice: z.number().positive().optional(),
}).refine(
  (data) => data.type !== 'limit' || data.limitPrice !== undefined,
  { message: 'Limit price required for limit orders', path: ['limitPrice'] }
);

export const searchQuerySchema = z.object({
  q: z.string().min(1).max(50),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
```

## Next Steps

Proceed to Step 5: Component Breakdown to define the UI components that will consume these APIs.


