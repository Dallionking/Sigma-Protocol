// Trading constants and demo data

export interface Trade {
  id: string;
  pair: string;
  type: 'long' | 'short';
  status: 'open' | 'closed' | 'stopped';
  pnl: number;
  entryPrice: number;
  exitPrice?: number;
  time: Date;
  lots: number;
}

export interface PortfolioStats {
  totalBalance: number;
  equity: number;
  openPnl: number;
  todayPnl: number;
  weekPnl: number;
  monthPnl: number;
}

export interface AIStatus {
  isActive: boolean;
  confidence: 'low' | 'medium' | 'high';
  environment: 'stable' | 'volatile' | 'uncertain';
  lastTrade: Date | null;
  openPositions: number;
}

// Demo data
export const DEMO_TRADES: Trade[] = [
  {
    id: '1',
    pair: 'EUR/USD',
    type: 'long',
    status: 'closed',
    pnl: 12.31,
    entryPrice: 1.0842,
    exitPrice: 1.0856,
    time: new Date(Date.now() - 2 * 60 * 1000), // 2 min ago
    lots: 0.1,
  },
  {
    id: '2',
    pair: 'GBP/JPY',
    type: 'long',
    status: 'closed',
    pnl: 7.14,
    entryPrice: 188.42,
    exitPrice: 188.65,
    time: new Date(Date.now() - 15 * 60 * 1000), // 15 min ago
    lots: 0.05,
  },
  {
    id: '3',
    pair: 'USD/CAD',
    type: 'short',
    status: 'stopped',
    pnl: -3.22,
    entryPrice: 1.3521,
    exitPrice: 1.3538,
    time: new Date(Date.now() - 45 * 60 * 1000), // 45 min ago
    lots: 0.08,
  },
  {
    id: '4',
    pair: 'XAU/USD',
    type: 'long',
    status: 'open',
    pnl: 24.50,
    entryPrice: 2024.50,
    time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    lots: 0.02,
  },
  {
    id: '5',
    pair: 'USD/JPY',
    type: 'short',
    status: 'closed',
    pnl: 18.75,
    entryPrice: 149.82,
    exitPrice: 149.45,
    time: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    lots: 0.15,
  },
];

export const DEMO_PORTFOLIO_STATS: PortfolioStats = {
  totalBalance: 12847.31,
  equity: 12500.00,
  openPnl: 347.31,
  todayPnl: 42.48,
  weekPnl: 187.25,
  monthPnl: 524.80,
};

export const DEMO_AI_STATUS: AIStatus = {
  isActive: true,
  confidence: 'high',
  environment: 'stable',
  lastTrade: new Date(Date.now() - 2 * 60 * 1000),
  openPositions: 1,
};

export function formatPnl(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}$${Math.abs(value).toFixed(2)}`;
}

export function formatPrice(value: number, pair: string): string {
  // Yen pairs have 2 decimals, others have 4-5
  const isYenPair = pair.includes('JPY');
  const isGold = pair.includes('XAU');
  
  if (isGold) return value.toFixed(2);
  if (isYenPair) return value.toFixed(2);
  return value.toFixed(4);
}

export function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

export function getStatusLabel(status: Trade['status']): string {
  switch (status) {
    case 'open': return 'Position Open';
    case 'closed': return 'Closed at TP';
    case 'stopped': return 'Stop Loss Hit';
  }
}

// Simulated API calls
export async function fetchPortfolioStats(): Promise<PortfolioStats> {
  await new Promise(resolve => setTimeout(resolve, 800));
  return DEMO_PORTFOLIO_STATS;
}

export async function fetchTrades(): Promise<Trade[]> {
  await new Promise(resolve => setTimeout(resolve, 600));
  return DEMO_TRADES;
}

export async function fetchAIStatus(): Promise<AIStatus> {
  await new Promise(resolve => setTimeout(resolve, 400));
  return DEMO_AI_STATUS;
}
