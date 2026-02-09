/**
 * Trading Configuration
 *
 * Configurable market data providers, trading hours, and order types.
 * Update these values to match your trading platform's capabilities.
 */

export const tradingConfig = {
  /** Market data provider configuration */
  marketData: {
    provider: 'mock' as 'mock' | 'tradelocker' | 'alpaca' | 'polygon',
    refreshInterval: 1000, // ms for real-time updates
    chartIntervals: ['1m', '5m', '15m', '1h', '4h', '1d', '1w'] as const,
  },

  /** Trading hours (set to null for 24/7 markets like crypto) */
  tradingHours: {
    forex: {
      open: { day: 0, hour: 17, minute: 0 }, // Sunday 5pm ET
      close: { day: 5, hour: 17, minute: 0 }, // Friday 5pm ET
      timezone: 'America/New_York',
    },
    stocks: {
      open: { hour: 9, minute: 30 },
      close: { hour: 16, minute: 0 },
      timezone: 'America/New_York',
      preMarket: { hour: 4, minute: 0 },
      afterHours: { hour: 20, minute: 0 },
    },
    crypto: null, // 24/7
  },

  /** Supported order types */
  orderTypes: ['market', 'limit', 'stop', 'stop_limit'] as const,

  /** Default risk parameters */
  risk: {
    maxPositionSizePct: 5, // Max 5% of portfolio per trade
    defaultStopLossPct: 2, // Default 2% stop loss
    maxDailyLossPct: 10, // Circuit breaker: 10% daily loss
    maxOpenPositions: 10,
  },

  /** Supported asset classes */
  assetClasses: [
    { id: 'forex', name: 'Forex', enabled: true },
    { id: 'indices', name: 'Indices', enabled: true },
    { id: 'commodities', name: 'Commodities', enabled: true },
    { id: 'crypto', name: 'Crypto', enabled: true },
    { id: 'stocks', name: 'Stocks', enabled: false },
  ],

  /** Currency display */
  baseCurrency: 'USD',
  locale: 'en-US',
} as const;

export type TradingConfig = typeof tradingConfig;
export type OrderType = (typeof tradingConfig.orderTypes)[number];
export type ChartInterval = (typeof tradingConfig.marketData.chartIntervals)[number];
