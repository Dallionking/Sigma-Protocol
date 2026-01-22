# Step 0: Enhanced PRD

> Output from the PRD enhancement phase of the Sigma Protocol

## Original PRD Analysis

The original `prd.txt` provided a solid foundation with:
- ✅ Clear user personas
- ✅ Core feature definitions
- ✅ Basic technical requirements
- ✅ API endpoint overview

## Enhancements Made

### 1. Acceptance Criteria Added

Each feature now has specific, testable acceptance criteria.

#### Portfolio Dashboard

**Original**: "Display total portfolio value prominently"

**Enhanced**:
- AC1: Portfolio value displayed in header with 2 decimal precision
- AC2: Value updates within 5 seconds of any trade execution
- AC3: Day change shows both dollar amount and percentage
- AC4: Chart renders within 500ms of time range selection
- AC5: Holdings list supports pull-to-refresh on mobile

#### Trading Interface

**Original**: "Support market orders"

**Enhanced**:
- AC1: Market order executes at displayed price ±0.5%
- AC2: Order preview shows total cost including any fees
- AC3: Insufficient funds displays clear error with available balance
- AC4: Order confirmation requires explicit user action
- AC5: Success/failure feedback appears within 2 seconds

### 2. Error States Defined

| Feature | Error State | User Message |
|---------|-------------|--------------|
| Portfolio Load | API timeout | "Unable to load portfolio. Pull to retry." |
| Place Order | Insufficient funds | "Not enough buying power. Available: $X" |
| Place Order | Market closed | "Markets are closed. Hours: 9:30 AM - 4:00 PM ET" |
| Stock Search | No results | "No stocks found matching 'X'" |
| Quote Load | Symbol invalid | "Unable to find stock with symbol 'X'" |

### 3. Edge Cases Documented

#### Order Placement
- User enters 0 quantity → Disable submit, show validation
- User enters negative number → Prevent input, numbers only
- Network fails mid-order → Show retry option, no duplicate orders
- Price changes during order → Warn user, require re-confirmation
- User has pending order for same stock → Allow, show warning

#### Portfolio Calculations
- User has fractional shares → Display to 6 decimal places
- Stock has no price data → Show last known price with "Delayed" badge
- All positions sold → Show empty state with "Start investing" CTA

### 4. Performance Targets Specified

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| First Contentful Paint | < 1.5s | Lighthouse CI |
| Time to Interactive | < 3.0s | Lighthouse CI |
| API Response (p95) | < 500ms | Server logs |
| Chart Render | < 500ms | Performance.measure() |
| Order Execution Feedback | < 2s | E2E test timing |

### 5. Security Requirements Clarified

#### Authentication
- Sessions expire after 24 hours of inactivity
- Refresh tokens valid for 7 days
- Failed login attempts: lock after 5 failures for 15 min

#### Trading Security
- All trading endpoints require valid session
- Order modifications require re-authentication
- Sensitive actions logged with IP and timestamp

#### Data Protection
- PII encrypted at rest
- Database connections use SSL
- No sensitive data in browser localStorage

### 6. Accessibility Specifications

| Requirement | Implementation |
|-------------|----------------|
| Color Contrast | All text meets WCAG AA (4.5:1 ratio) |
| Keyboard Navigation | Full app navigable without mouse |
| Screen Readers | All interactive elements have ARIA labels |
| Motion | Respects `prefers-reduced-motion` |
| Touch Targets | Minimum 44x44px on mobile |

### 7. Out of Scope Clarifications

Added explicit "not in V1" items to prevent scope creep:

**Definitely Not V1:**
- Real broker integration
- Options/derivatives trading
- Margin accounts
- Social features (following, sharing)
- Mobile native apps

**Maybe V2:**
- Extended hours trading
- Price alerts
- Advanced charting (indicators)
- News integration

## Updated Feature Priority

| Priority | Feature | Rationale |
|----------|---------|-----------|
| P0 | Authentication | Blocks everything |
| P0 | Portfolio View | Core value prop |
| P0 | Trading (Market Orders) | Core value prop |
| P1 | Stock Detail | Enables research |
| P1 | Search | Enables discovery |
| P1 | Watchlist | User engagement |
| P2 | Limit Orders | Power user feature |
| P2 | Order History | Compliance, trust |
| P3 | Account Settings | Nice to have |

## Data Requirements Refined

### Mock Data Needs

For demo purposes, need realistic mock data:

**Stocks**: 50+ popular stocks across sectors
- Tech: AAPL, GOOGL, MSFT, AMZN, META, NVDA
- Finance: JPM, BAC, GS, V, MA
- Healthcare: JNJ, PFE, UNH, ABBV
- Consumer: WMT, COST, MCD, NKE
- Energy: XOM, CVX

**Price Updates**: Simulate realistic movement
- Update every 5-10 seconds
- Random walk with mean reversion
- Volume varies by time of day

**User Portfolio**: Demo account starts with
- $10,000 cash
- 5-10 existing positions
- Mix of gains and losses

## API Contract Refinements

### Order Placement Request

```typescript
interface PlaceOrderRequest {
  symbol: string;           // Stock ticker
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  quantity: number;         // Can be fractional
  limitPrice?: number;      // Required if type='limit'
  timeInForce?: 'day' | 'gtc'; // Default: 'day'
}
```

### Order Response

```typescript
interface OrderResponse {
  id: string;
  status: 'pending' | 'filled' | 'partial' | 'cancelled' | 'rejected';
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  quantity: number;
  filledQuantity: number;
  avgFillPrice: number | null;
  limitPrice: number | null;
  createdAt: string;
  filledAt: string | null;
  rejectionReason?: string;
}
```

## Next Steps

With the enhanced PRD complete, proceed to:
1. **Step 1**: Create wireframes based on refined requirements
2. Use acceptance criteria to guide implementation
3. Reference error states during UI development
4. Validate against performance targets throughout


