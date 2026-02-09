/**
 * Subscription Plans & Pricing
 * Phase 1: Mock data for prototype
 * Phase 2: Connected to Apple IAP
 * Phase 3: Managed by RevenueCat
 */

export type PlanTier = 'basic' | 'pro' | 'elite';
export type BillingInterval = 'monthly' | 'yearly';

export interface SubscriptionPlan {
  id: PlanTier;
  name: string;
  displayName: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  popular?: boolean;
  badge?: string;
  color?: string;
  icon?: string;
}

export const SUBSCRIPTION_PLANS: Record<PlanTier, SubscriptionPlan> = {
  basic: {
    id: 'basic',
    name: 'Basic',
    displayName: 'Basic',
    price: {
      monthly: 7,
      yearly: 70, // ~$5.83/mo
    },
    features: [
      'Standard AI cycles',
      'Daily balance updates',
      '7-day income history',
      'Basic risk controls',
      'Email support',
    ],
    color: '#777777',
    icon: '📊',
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    displayName: 'Pro',
    price: {
      monthly: 15,
      yearly: 150, // ~$12.50/mo (save $30)
    },
    features: [
      '4x faster AI cycles',
      'Hourly balance updates',
      '30-day income history',
      'Advanced risk controls',
      'Priority support',
      'Early access to features',
    ],
    popular: true,
    badge: 'Most Popular',
    color: '#6366F1',
    icon: '🚀',
  },
  elite: {
    id: 'elite',
    name: 'Elite',
    displayName: 'Elite',
    price: {
      monthly: 29,
      yearly: 290, // ~$24.17/mo (save $58)
    },
    features: [
      '10x faster AI cycles',
      'Real-time balance updates',
      'Unlimited income history',
      'Custom risk profiles',
      'Dedicated support',
      '48-hour guarantee',
      'Founding member badge',
    ],
    badge: 'Premium',
    color: '#FF006E',
    icon: '👑',
  },
};

/**
 * Get yearly savings
 */
export function getYearlySavings(plan: PlanTier): number {
  const planData = SUBSCRIPTION_PLANS[plan];
  const monthlyTotal = planData.price.monthly * 12;
  const yearlyPrice = planData.price.yearly;
  return monthlyTotal - yearlyPrice;
}

/**
 * Format price for display
 */
export function formatPrice(amount: number): string {
  return `$${amount}`;
}

/**
 * Get price per month for yearly plans
 */
export function getPricePerMonth(plan: PlanTier, interval: BillingInterval): string {
  const planData = SUBSCRIPTION_PLANS[plan];
  if (interval === 'monthly') {
    return formatPrice(planData.price.monthly);
  }
  const perMonth = Math.floor((planData.price.yearly / 12) * 100) / 100;
  return formatPrice(perMonth);
}

/**
 * Feature access mapping
 */
export const FEATURE_GATES: Record<string, PlanTier[]> = {
  // Income features
  'income_history_30_days': ['pro', 'elite'],
  'income_history_unlimited': ['elite'],
  'income_export': ['pro', 'elite'],

  // AI features
  'ai_cycles_4x': ['pro', 'elite'],
  'ai_cycles_10x': ['elite'],
  'ai_early_access': ['pro', 'elite'],

  // Risk features
  'risk_advanced': ['pro', 'elite'],
  'risk_custom': ['elite'],

  // Update frequency
  'updates_hourly': ['pro', 'elite'],
  'updates_realtime': ['elite'],

  // Support
  'support_priority': ['pro', 'elite'],
  'support_dedicated': ['elite'],
};

/**
 * Apple IAP Product IDs (for Phase 2)
 * Update these with your RevenueCat / App Store Connect product IDs
 */
export const IAP_PRODUCT_IDS = {
  basic_monthly: 'com.example.tradingplatform.basic.monthly',
  basic_yearly: 'com.example.tradingplatform.basic.yearly',
  pro_monthly: 'com.example.tradingplatform.pro.monthly',
  pro_yearly: 'com.example.tradingplatform.pro.yearly',
  elite_monthly: 'com.example.tradingplatform.elite.monthly',
  elite_yearly: 'com.example.tradingplatform.elite.yearly',
} as const;

/**
 * Paywall value props by feature
 */
export const PAYWALL_MESSAGES: Record<string, { title: string; benefits: string[] }> = {
  income_history_30_days: {
    title: 'Unlock 30-Day History',
    benefits: [
      '30-day income tracking',
      'Export earnings reports',
      'Detailed trade analytics',
    ],
  },
  ai_cycles_4x: {
    title: 'Unlock 4x Faster Cycles',
    benefits: [
      '4x faster AI trading',
      'More opportunities',
      'Better execution',
    ],
  },
  default: {
    title: 'Upgrade to Pro',
    benefits: [
      '4x faster AI cycles',
      'Hourly balance updates',
      '30-day income history',
    ],
  },
};
