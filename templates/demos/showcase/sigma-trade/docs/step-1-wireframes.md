# Step 1: Wireframes & UI/UX Design

> Low-fidelity wireframes and user flow documentation

## Screen Inventory

Based on the enhanced PRD, the following screens are required:

1. **Authentication**
   - Login
   - Register
   - Forgot Password

2. **Main App**
   - Portfolio Dashboard
   - Stock Detail
   - Search/Discovery
   - Watchlist
   - Order History
   - Account Settings

3. **Modals/Overlays**
   - Trade Modal (Buy/Sell)
   - Order Confirmation
   - Order Success/Failure

## Navigation Structure

```
┌─────────────────────────────────────────────────────────┐
│                      Header                              │
│  [Logo]                    [Search] [Profile]           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│                    Main Content                          │
│                                                          │
├─────────────────────────────────────────────────────────┤
│   [Portfolio]    [Markets]    [Activity]                │
│      Tab            Tab          Tab                    │
└─────────────────────────────────────────────────────────┘
```

## Wireframes

### 1. Portfolio Dashboard

```
┌─────────────────────────────────────────────────────────┐
│  ← SigmaTrade                          🔍   👤          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│            $24,567.89                                   │
│           +$1,234.56 (+5.29%) today                     │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │     📈 Performance Chart                         │   │
│  │                                                   │   │
│  │     /\    /\                                     │   │
│  │    /  \  /  \    /\                             │   │
│  │   /    \/    \  /  \                            │   │
│  │  /            \/    \                           │   │
│  │                                                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  [1D] [1W] [1M] [3M] [1Y] [ALL]                         │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  Your Holdings                                           │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ AAPL    Apple Inc.           $4,500    +$450    │   │
│  │         10 shares @ $400     +10.00%            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ TSLA    Tesla Inc.           $3,200    -$320    │   │
│  │         5 shares @ $700      -9.09%             │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ MSFT    Microsoft Corp.      $2,800    +$140    │   │
│  │         8 shares @ $330      +5.26%             │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  Buying Power: $2,500.00           [ + Deposit ]        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   [📊 Portfolio]    [🔍 Markets]    [📋 Activity]       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 2. Stock Detail Page

```
┌─────────────────────────────────────────────────────────┐
│  ←  AAPL                               ☆ Add to List    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Apple Inc.                                              │
│                                                          │
│            $178.50                                       │
│           +$4.25 (+2.44%)                               │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │     📈 Price Chart (Candlestick)                 │   │
│  │                                                   │   │
│  │      ║                                           │   │
│  │    ╔═╩═╗    ║                                   │   │
│  │    ║   ║  ╔═╩═╗                                 │   │
│  │  ╔═╩═╗ ║  ║   ║   ╔═╗                          │   │
│  │  ║   ║ ║  ╚═╦═╝ ╔═╩═╩═╗                        │   │
│  │  ╚═╦═╝ ╚════╝   ║     ║                        │   │
│  │    ║            ╚═════╝                         │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  [1D] [1W] [1M] [3M] [1Y] [ALL]     [Line] [Candle]    │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  Key Statistics                                          │
│                                                          │
│  Open          $175.20    │   Volume       45.2M        │
│  High          $179.80    │   Avg Volume   52.1M        │
│  Low           $174.50    │   Market Cap   2.82T        │
│  52W High      $198.23    │   P/E Ratio    29.5         │
│  52W Low       $124.17    │   Dividend     0.96%        │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  About                                                   │
│                                                          │
│  Apple Inc. designs, manufactures, and markets          │
│  smartphones, personal computers, tablets...             │
│  [Read more]                                             │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│           [ 🛒 Trade AAPL ]                              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 3. Trade Modal

```
┌─────────────────────────────────────────────────────────┐
│                                                     ✕    │
│                     Trade AAPL                           │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   ┌──────────────┐  ┌──────────────┐                    │
│   │     BUY      │  │     SELL     │                    │
│   │   (active)   │  │              │                    │
│   └──────────────┘  └──────────────┘                    │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  Order Type                                              │
│                                                          │
│   ┌──────────────┐  ┌──────────────┐                    │
│   │    Market    │  │    Limit     │                    │
│   │   (active)   │  │              │                    │
│   └──────────────┘  └──────────────┘                    │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  Amount                                                  │
│                                                          │
│   ┌──────────────┐  ┌──────────────┐                    │
│   │    Shares    │  │   Dollars    │                    │
│   │   (active)   │  │              │                    │
│   └──────────────┘  └──────────────┘                    │
│                                                          │
│   ┌─────────────────────────────────────────────────┐   │
│   │                     10                           │   │
│   │                   shares                         │   │
│   └─────────────────────────────────────────────────┘   │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  Order Preview                                           │
│                                                          │
│   Market Price         $178.50                          │
│   Shares               10                                │
│   ─────────────────────────────                         │
│   Estimated Cost       $1,785.00                        │
│                                                          │
│   Available:           $2,500.00                        │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│           [ Review Order ]                               │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 4. Order Confirmation

```
┌─────────────────────────────────────────────────────────┐
│                                                     ✕    │
│                   Review Order                           │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   You're buying                                          │
│                                                          │
│              AAPL                                        │
│           Apple Inc.                                     │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   Order Type           Market                            │
│   Shares               10                                │
│   Market Price         $178.50                          │
│                                                          │
│   ─────────────────────────────                         │
│                                                          │
│   Estimated Cost       $1,785.00                        │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   ⚠️ Market orders execute at the best available        │
│   price. The final price may differ slightly.           │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│           [ Confirm Purchase ]                           │
│                                                          │
│              [ Go Back ]                                 │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 5. Search / Markets

```
┌─────────────────────────────────────────────────────────┐
│  ← Markets                                               │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   🔍 Search stocks...                                    │
│   ┌─────────────────────────────────────────────────┐   │
│   │                                                  │   │
│   └─────────────────────────────────────────────────┘   │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  Top Movers                                              │
│                                                          │
│  📈 Gainers        📉 Losers        🔥 Most Active      │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ NVDA    +8.5%              $890.50              │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ AMD     +6.2%              $165.30              │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ TSLA    +4.8%              $248.90              │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  Browse by Sector                                        │
│                                                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │  Tech   │ │ Finance │ │ Health  │ │ Energy  │       │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   [📊 Portfolio]    [🔍 Markets]    [📋 Activity]       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 6. Order History

```
┌─────────────────────────────────────────────────────────┐
│  ← Activity                                              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   [All]  [Pending]  [Completed]  [Cancelled]            │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  Today                                                   │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ✓ Buy AAPL              Filled                   │   │
│  │   10 shares @ $178.45   $1,784.50                │   │
│  │   9:45 AM                                        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ⏳ Buy MSFT              Pending                 │   │
│  │   5 shares @ $400 limit $2,000.00                │   │
│  │   9:30 AM                          [Cancel]      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  Yesterday                                               │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ✓ Sell TSLA             Filled                   │   │
│  │   2 shares @ $245.80    $491.60                  │   │
│  │   3:20 PM                                        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   [📊 Portfolio]    [🔍 Markets]    [📋 Activity]       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## User Flows

### Critical Flow 1: First Trade (Buy)

```
[Login] → [Portfolio Dashboard] → [Search Stock] → [Stock Detail] 
    → [Tap Trade] → [Trade Modal] → [Enter Amount] → [Review Order]
    → [Confirm Purchase] → [Success Screen] → [Portfolio (Updated)]
```

### Critical Flow 2: Sell Holding

```
[Portfolio Dashboard] → [Tap Holding] → [Stock Detail]
    → [Tap Trade] → [Trade Modal] → [Select Sell] → [Enter Amount]
    → [Review Order] → [Confirm Sale] → [Success Screen]
    → [Portfolio (Updated)]
```

### Critical Flow 3: Create Watchlist

```
[Stock Detail] → [Tap Add to List] → [Select/Create Watchlist]
    → [Confirm] → [Watchlist Tab]
```

## Design Tokens

### Colors

```scss
// Primary
$color-primary: #00C805;        // Robinhood green
$color-primary-dark: #00A804;

// Semantic
$color-positive: #00C805;       // Gains
$color-negative: #FF5000;       // Losses
$color-neutral: #9B9B9B;        // Unchanged

// Background
$color-bg-primary: #000000;     // Dark mode default
$color-bg-secondary: #1A1A1A;
$color-bg-card: #242424;

// Text
$color-text-primary: #FFFFFF;
$color-text-secondary: #9B9B9B;
$color-text-muted: #6B6B6B;
```

### Typography

```scss
// Font Family
$font-family: 'Inter', -apple-system, system-ui, sans-serif;

// Font Sizes
$font-size-xs: 12px;
$font-size-sm: 14px;
$font-size-base: 16px;
$font-size-lg: 18px;
$font-size-xl: 24px;
$font-size-2xl: 32px;
$font-size-3xl: 48px;

// Font Weights
$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-semibold: 600;
$font-weight-bold: 700;
```

### Spacing

```scss
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;
$spacing-2xl: 48px;
```

## Component Inventory

Based on wireframes, these UI components are needed:

### Primitives
- Button (primary, secondary, ghost)
- Input (text, number)
- Card
- Modal
- Tabs
- Badge

### Composed
- PortfolioHeader
- PerformanceChart
- HoldingRow
- StockQuote
- OrderPreview
- SearchInput
- SectorCard
- OrderRow

## Responsive Considerations

| Breakpoint | Width | Adjustments |
|------------|-------|-------------|
| Mobile | < 640px | Single column, bottom nav |
| Tablet | 640-1024px | Side nav, 2-column grid |
| Desktop | > 1024px | Full dashboard, 3-column |

## Next Steps

Proceed to Step 2: Architecture Design using these wireframes as the UI contract.


