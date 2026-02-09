// AI Trading Bot types and demo data

export interface AIStatus {
  isActive: boolean;
  status: 'active' | 'paused' | 'analyzing' | 'trading';
  confidence: 'high' | 'medium' | 'low';
  mode: 'safe' | 'balanced' | 'aggressive';
  environment: 'stable' | 'volatile' | 'uncertain';
  lastCycle: Date;
  nextCycle: Date;
  activeSince: Date;
  totalCycles: number;
  successRate: number;
}

export interface AISignal {
  name: string;
  value: 'strong' | 'moderate' | 'weak';
  description: string;
}

export interface AICycle {
  id: string;
  timestamp: Date;
  result: 'profit' | 'loss' | 'neutral';
  amount: number;
  pair: string;
  duration: string;
  action: 'buy' | 'sell';
}

export interface GuaranteeStatus {
  eligible: boolean;
  hoursRemaining: number;
  balanceRequirementMet: boolean;
  aiActiveRequirementMet: boolean;
  alreadyClaimed: boolean;
}

export const AI_STATUS_LABELS = {
  active: { label: 'ACTIVE', color: '#22C55E' },
  paused: { label: 'PAUSED', color: '#666666' },
  analyzing: { label: 'ANALYZING', color: '#00BFFF' },
  trading: { label: 'TRADING', color: '#FFDC00' },
} as const;

export const CONFIDENCE_LABELS = {
  high: { label: 'HIGH', color: '#22C55E' },
  medium: { label: 'MEDIUM', color: '#FFDC00' },
  low: { label: 'LOW', color: '#FF4136' },
} as const;

export const ENVIRONMENT_LABELS = {
  stable: { label: 'STABLE', icon: '🟢' },
  volatile: { label: 'VOLATILE', icon: '🟡' },
  uncertain: { label: 'UNCERTAIN', icon: '🔴' },
} as const;

// Demo data
export const DEMO_AI_STATUS: AIStatus = {
  isActive: true,
  status: 'active',
  confidence: 'high',
  mode: 'balanced',
  environment: 'stable',
  lastCycle: new Date(Date.now() - 2 * 60 * 1000), // 2 min ago
  nextCycle: new Date(Date.now() + 15 * 60 * 1000), // 15 min from now
  activeSince: new Date(Date.now() - 48 * 60 * 60 * 1000), // 48 hours ago
  totalCycles: 127,
  successRate: 0.73,
};

export const DEMO_AI_SIGNALS: AISignal[] = [
  {
    name: 'Momentum',
    value: 'strong',
    description: 'How fast markets are moving in a direction',
  },
  {
    name: 'Volatility',
    value: 'moderate',
    description: 'How much price fluctuation is occurring',
  },
  {
    name: 'Liquidity',
    value: 'strong',
    description: 'How easily trades can be executed',
  },
  {
    name: 'Trend',
    value: 'strong',
    description: 'Overall market direction',
  },
];

export const DEMO_AI_CYCLES: AICycle[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    result: 'profit',
    amount: 12.31,
    pair: 'EUR/USD',
    duration: '4h 23m',
    action: 'buy',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    result: 'profit',
    amount: 7.14,
    pair: 'GBP/JPY',
    duration: '2h 45m',
    action: 'sell',
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    result: 'profit',
    amount: 23.45,
    pair: 'USD/CAD',
    duration: '6h 12m',
    action: 'buy',
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000),
    result: 'loss',
    amount: -5.22,
    pair: 'AUD/USD',
    duration: '3h 15m',
    action: 'sell',
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
    result: 'profit',
    amount: 15.89,
    pair: 'EUR/GBP',
    duration: '5h 30m',
    action: 'buy',
  },
];

export const DEMO_GUARANTEE_STATUS: GuaranteeStatus = {
  eligible: true,
  hoursRemaining: 0,
  balanceRequirementMet: true,
  aiActiveRequirementMet: true,
  alreadyClaimed: false,
};

// Utility functions
export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

export function formatTimeUntil(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Now';
  if (diffMins < 60) return `~${diffMins} min`;
  return `~${Math.floor(diffMins / 60)}h`;
}

export function formatCycleAmount(amount: number): string {
  const prefix = amount >= 0 ? '+' : '';
  return `${prefix}$${Math.abs(amount).toFixed(2)}`;
}

// Simulated API calls
export async function fetchAIStatus(): Promise<AIStatus> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return DEMO_AI_STATUS;
}

export async function fetchAISignals(): Promise<AISignal[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return DEMO_AI_SIGNALS;
}

export async function fetchAICycles(): Promise<AICycle[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return DEMO_AI_CYCLES;
}

export async function fetchGuaranteeStatus(): Promise<GuaranteeStatus> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return DEMO_GUARANTEE_STATUS;
}

