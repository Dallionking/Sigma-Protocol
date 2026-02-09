// Demo brokers for TradeLocker simulation
// These are popular Forex brokers that support TradeLocker

export interface Broker {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

export const DEMO_BROKERS: Broker[] = [
  { id: 'icmarkets', name: 'IC Markets', icon: '📊', description: 'Low spreads' },
  { id: 'pepperstone', name: 'Pepperstone', icon: '🌶️', description: 'Fast execution' },
  { id: 'oanda', name: 'OANDA', icon: '📈', description: 'Trusted worldwide' },
  { id: 'ftmo', name: 'FTMO', icon: '🏆', description: 'Prop firm' },
  { id: 'fundednext', name: 'FundedNext', icon: '🚀', description: 'Prop firm' },
];

export const ASSET_TYPES = [
  { id: 'forex', name: 'Forex', icon: '💱', examples: 'EUR/USD, GBP/JPY' },
  { id: 'indices', name: 'Indices', icon: '📊', examples: 'US30, NAS100' },
  { id: 'commodities', name: 'Commodities', icon: '🥇', examples: 'Gold, Oil' },
  { id: 'crypto', name: 'Crypto', icon: '₿', examples: 'BTC/USD, ETH/USD' },
];

// TradeLocker API endpoints (for reference)
export const TRADELOCKER_API = {
  demo: 'https://demo.tradelocker.com/backend-api',
  live: 'https://live.tradelocker.com/backend-api',
  auth: '/auth/jwt/token',
  accounts: '/auth/jwt/all-accounts',
  refresh: '/auth/jwt/refresh',
};

