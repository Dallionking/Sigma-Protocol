// Portfolio configuration constants

// Minimum balance required to activate AI Trading Bot
export const MINIMUM_BALANCE = 500;

// Demo balance for testing (can be toggled)
export const DEMO_BALANCE = 10250;
export const DEMO_BALANCE_INSUFFICIENT = 250;

// Broker funding URLs (would be dynamically fetched in production)
export const BROKER_FUNDING_URLS: Record<string, string> = {
  icmarkets: 'https://secure.icmarkets.com/Deposits',
  pepperstone: 'https://secure.pepperstone.com/client/funding',
  oanda: 'https://www.oanda.com/account/funding',
  ftmo: 'https://trader.ftmo.com/billing',
  fundednext: 'https://fundednext.com/dashboard/billing',
  default: 'https://tradelocker.com', // Fallback to TradeLocker
};

// Get broker funding URL
export function getBrokerFundingUrl(brokerId: string): string {
  return BROKER_FUNDING_URLS[brokerId] || BROKER_FUNDING_URLS.default;
}

// Format currency for display
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Demo account data for simulating TradeLocker response
export interface PortfolioAccount {
  accountId: string;
  accountNumber: string;
  brokerName: string;
  brokerId: string;
  balance: number;
  equity: number;
  openPnL: number;
  serverType: 'demo' | 'live';
}

export const DEMO_ACCOUNT: PortfolioAccount = {
  accountId: '123456',
  accountNumber: '#123456',
  brokerName: 'IC Markets',
  brokerId: 'icmarkets',
  balance: DEMO_BALANCE,
  equity: DEMO_BALANCE,
  openPnL: 0,
  serverType: 'demo',
};

// Simulate fetching balance from TradeLocker
export async function fetchPortfolioBalance(): Promise<PortfolioAccount> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return demo account data
  return DEMO_ACCOUNT;
}

