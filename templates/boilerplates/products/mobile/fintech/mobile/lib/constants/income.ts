// Income types and demo data

export interface IncomeEvent {
  id: string;
  amount: number;
  type: 'ai_cycle' | 'auto_yield' | 'referral_bonus' | 'promo_reward';
  title: string;
  description: string;
  timestamp: Date;
  pair?: string;
  duration?: string;
}

export interface IncomeSummary {
  totalEarned: number;
  todayEarned: number;
  weekEarned: number;
  monthEarned: number;
  quarterEarned: number;
  eventCount: number;
}

export interface ChartDataPoint {
  date: string;
  amount: number;
}

import type { IconName } from '@/components/primitives';

export const INCOME_EVENT_TYPES: Record<string, { label: string; icon: IconName; color: string }> = {
  ai_cycle: {
    label: 'AI Cycle Completed',
    icon: 'ai',
    color: '#22C55E',
  },
  auto_yield: {
    label: 'Auto-Yield Event',
    icon: 'trendUp',
    color: '#00BFFF',
  },
  referral_bonus: {
    label: 'Referral Bonus',
    icon: 'gift',
    color: '#FF006E',
  },
  promo_reward: {
    label: 'Promo Reward',
    icon: 'sparkles',
    color: '#FFDC00',
  },
} as const;

// Demo data
export const DEMO_INCOME_EVENTS: IncomeEvent[] = [
  {
    id: '1',
    amount: 12.31,
    type: 'ai_cycle',
    title: 'AI Cycle Completed',
    description: 'EUR/USD long position closed with profit. AI detected optimal exit point.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    pair: 'EUR/USD',
    duration: '4h 23m',
  },
  {
    id: '2',
    amount: 7.14,
    type: 'auto_yield',
    title: 'Auto-Yield Event',
    description: 'Overnight yield from GBP/JPY position.',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    pair: 'GBP/JPY',
  },
  {
    id: '3',
    amount: 23.45,
    type: 'ai_cycle',
    title: 'AI Cycle Completed',
    description: 'USD/CAD short position closed. Market reversal detected.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    pair: 'USD/CAD',
    duration: '6h 12m',
  },
  {
    id: '4',
    amount: 50.00,
    type: 'referral_bonus',
    title: 'Referral Bonus',
    description: 'Your friend John joined and made their first trade!',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    id: '5',
    amount: 15.89,
    type: 'ai_cycle',
    title: 'AI Cycle Completed',
    description: 'AUD/USD position closed with profit.',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    pair: 'AUD/USD',
    duration: '3h 45m',
  },
  {
    id: '6',
    amount: 8.22,
    type: 'auto_yield',
    title: 'Auto-Yield Event',
    description: 'Weekend yield accumulation from open positions.',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
  },
  {
    id: '7',
    amount: 31.76,
    type: 'ai_cycle',
    title: 'AI Cycle Completed',
    description: 'EUR/GBP scalp trade executed perfectly.',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    pair: 'EUR/GBP',
    duration: '45m',
  },
  {
    id: '8',
    amount: 25.00,
    type: 'promo_reward',
    title: 'Welcome Bonus',
    description: 'First week trading bonus reward.',
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
  },
];

export const DEMO_INCOME_SUMMARY: IncomeSummary = {
  totalEarned: 312.42,
  todayEarned: 19.45,
  weekEarned: 173.77,
  monthEarned: 312.42,
  quarterEarned: 847.23,
  eventCount: 42,
};

export const DEMO_CHART_DATA_7D: ChartDataPoint[] = [
  { date: 'Mon', amount: 25.00 },
  { date: 'Tue', amount: 31.76 },
  { date: 'Wed', amount: 8.22 },
  { date: 'Thu', amount: 15.89 },
  { date: 'Fri', amount: 73.45 },
  { date: 'Sat', amount: 7.14 },
  { date: 'Sun', amount: 12.31 },
];

export const DEMO_CHART_DATA_30D: ChartDataPoint[] = [
  { date: 'W1', amount: 78.42 },
  { date: 'W2', amount: 95.31 },
  { date: 'W3', amount: 64.92 },
  { date: 'W4', amount: 73.77 },
];

// Utility functions
export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function formatIncomeAmount(amount: number): string {
  return `+${formatCurrency(amount)}`;
}

export function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

export function formatEventDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatEventTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Simulated API calls
export async function fetchIncomeSummary(): Promise<IncomeSummary> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return DEMO_INCOME_SUMMARY;
}

export async function fetchIncomeEvents(range: '7d' | '30d' | '90d' = '7d'): Promise<IncomeEvent[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const cutoffDays = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const cutoffDate = new Date(Date.now() - cutoffDays * 24 * 60 * 60 * 1000);
  
  return DEMO_INCOME_EVENTS.filter(event => event.timestamp >= cutoffDate);
}

export async function fetchChartData(range: '7d' | '30d' | '90d' = '7d'): Promise<ChartDataPoint[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return range === '7d' ? DEMO_CHART_DATA_7D : DEMO_CHART_DATA_30D;
}

