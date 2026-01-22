# Fintech App Boilerplate

> Complete mobile finance application shell for trading apps, banking platforms, and budgeting tools

## Overview

The Fintech boilerplate provides everything you need to build secure, high-performance financial mobile applications. From real-time market data to secure transactions, this shell handles the complex fintech patterns so you can focus on your unique financial product.

**Extends**: [expo-mobile](../../../expo-mobile)

## Screenshots

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   📈 Portfolio  │  │   💰 Trade      │  │   📊 Charts     │
│                 │  │                 │  │                 │
│  $24,567.89     │  │   AAPL          │  │   AAPL 1D      │
│  +$1,234 (5.3%) │  │   $178.50       │  │   ┌──────────┐  │
│                 │  │   +2.34%        │  │   │    /\    │  │
│  ┌───────────┐  │  │                 │  │   │   /  \   │  │
│  │ AAPL +2%  │  │  │  Amount:       │  │   │  /    \  │  │
│  │ TSLA -1%  │  │  │  [ 10 shares ] │  │   │ /      \ │  │
│  │ MSFT +3%  │  │  │                 │  │   └──────────┘  │
│  └───────────┘  │  │  [ BUY $1785 ] │  │   Vol: 45.2M    │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## Quick Start

```bash
# Initialize new fintech app
sigma scaffold my-trading-app --boilerplate=mobile-fintech

# Install dependencies
cd my-trading-app
npm install

# Start development
npx expo start
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Expo SDK 52+ / React Native |
| Navigation | Expo Router v3 |
| State | Zustand + React Query |
| Backend | Supabase + Edge Functions |
| Charts | Victory Native / react-native-wagmi-charts |
| WebSocket | Supabase Realtime / Custom WS |
| Security | expo-secure-store + Biometrics |
| Payments | Stripe / Plaid ready |

## Project Structure

```
mobile-fintech/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx           # Portfolio dashboard
│   │   ├── markets/            # Market discovery
│   │   ├── trade/              # Trading interface
│   │   ├── activity/           # Transaction history
│   │   └── account/            # Account management
│   ├── (modals)/
│   │   ├── buy.tsx             # Buy order flow
│   │   ├── sell.tsx            # Sell order flow
│   │   └── transfer.tsx        # Fund transfers
│   ├── asset/
│   │   └── [symbol].tsx        # Asset detail page
│   └── (auth)/
│       └── verify.tsx          # Additional verification
├── components/
│   ├── portfolio/
│   │   ├── PortfolioCard.tsx
│   │   ├── HoldingsList.tsx
│   │   └── PerformanceChart.tsx
│   ├── trading/
│   │   ├── OrderForm.tsx
│   │   ├── PriceDisplay.tsx
│   │   └── OrderBook.tsx
│   ├── charts/
│   │   ├── CandlestickChart.tsx
│   │   ├── LineChart.tsx
│   │   └── TimeframeSelector.tsx
│   └── ui/
├── hooks/
│   ├── use-portfolio.ts        # Portfolio state
│   ├── use-market-data.ts      # Real-time prices
│   ├── use-orders.ts           # Order management
│   └── use-biometrics.ts       # Biometric auth
├── lib/
│   ├── market-data/            # Price feeds
│   ├── trading/                # Order execution
│   └── security/               # Security utilities
└── modules/
    ├── portfolio/              # Portfolio logic
    ├── trading/                # Trading engine
    ├── markets/                # Market discovery
    └── compliance/             # KYC/AML hooks
```

## Key Features

### 📈 Portfolio Dashboard
- Real-time portfolio valuation
- Gain/loss visualization
- Holdings breakdown
- Performance charts (1D, 1W, 1M, 1Y, All)
- Asset allocation pie chart

### 💰 Trading Interface
- Market/limit orders
- Real-time price updates
- Order book visualization
- Trade confirmation flow
- Order history

### 📊 Market Data
- Real-time quotes
- Candlestick charts
- Technical indicators
- Watchlists
- Price alerts

### 🔒 Security
- Biometric authentication
- PIN/passcode
- 2FA enforcement
- Secure storage
- Session management

## Database Schema

```sql
-- Core tables included
users
accounts
portfolios
holdings
orders
transactions
watchlists
alerts
verification_status
```

## Real-Time Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Mobile App                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  Portfolio  │  │   Trading   │  │   Markets   │     │
│  │  Component  │  │  Component  │  │  Component  │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
│         │                │                │             │
│         └────────────────┼────────────────┘             │
│                          │                              │
│                 ┌────────┴────────┐                     │
│                 │  Market Data    │                     │
│                 │    Service      │                     │
│                 └────────┬────────┘                     │
└─────────────────────────│──────────────────────────────┘
                          │
              ┌───────────┴───────────┐
              │                       │
     ┌────────┴────────┐    ┌────────┴────────┐
     │  Price Feed WS  │    │    Supabase     │
     │  (Market Data)  │    │   (Portfolio)   │
     └─────────────────┘    └─────────────────┘
```

## Configuration

```typescript
// config/fintech.ts
export const fintechConfig = {
  trading: {
    minOrderAmount: 1.00,
    maxOrderAmount: 100000,
    supportedOrderTypes: ['market', 'limit'],
    tradingHours: { start: '09:30', end: '16:00', timezone: 'America/New_York' }
  },
  security: {
    requireBiometrics: true,
    sessionTimeout: 15, // minutes
    requirePinForTrade: true
  },
  marketData: {
    refreshInterval: 1000, // ms for real-time
    chartIntervals: ['1m', '5m', '15m', '1h', '1d', '1w']
  },
  compliance: {
    requireKYC: true,
    kycProvider: 'plaid', // or 'jumio', 'onfido'
  }
}
```

## Premium Features (RevenueCat)

The boilerplate includes subscription gates for:
- Real-time streaming quotes
- Advanced charting tools
- Extended trading hours
- Unlimited watchlists
- Priority order execution

## Security Implementation

### Biometric Authentication
```typescript
import { useBiometrics } from '@/hooks/use-biometrics'

const { authenticate, isAvailable } = useBiometrics()

// Required before trading
await authenticate('Confirm trade')
```

### Secure Storage
```typescript
import { secureStore } from '@/lib/security'

// Tokens, keys, sensitive data
await secureStore.set('auth_token', token)
```

## Compliance Hooks

Built-in hooks for regulatory compliance:

```typescript
// lib/compliance/hooks.ts
export const complianceHooks = {
  beforeTrade: async (order) => {
    // Pattern day trader check
    // Margin requirements
    // Account restrictions
  },
  afterTrade: async (execution) => {
    // Audit logging
    // Reporting
  }
}
```

## Market Data Integration

The boilerplate supports multiple market data providers:

```typescript
// lib/market-data/providers.ts
export const providers = {
  alpaca: AlpacaProvider,     // Stocks
  polygon: PolygonProvider,   // Stocks (premium)
  coinbase: CoinbaseProvider, // Crypto
  mock: MockProvider          // Development
}
```

## See Also

- [FEATURES.md](./FEATURES.md) - Complete feature breakdown
- [expo-mobile](../../../expo-mobile) - Base boilerplate
- [SigmaTrade Demo](../../../../demos/showcase/sigma-trade) - Marketing showcase


