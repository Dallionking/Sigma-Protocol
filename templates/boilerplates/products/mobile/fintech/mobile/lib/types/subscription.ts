/**
 * Subscription-related TypeScript types
 */

export type PlanTier = 'basic' | 'pro' | 'elite';
export type BillingInterval = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'trial' | null;

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

export interface UserSubscription {
  plan: PlanTier;
  status: SubscriptionStatus;
  interval: BillingInterval;
  renewalDate: string | null;
  isFoundingMember: boolean;
  priceLockedAt?: number;
}

export interface PurchaseRequest {
  plan: PlanTier;
  interval: BillingInterval;
}

export interface PurchaseResult {
  success: boolean;
  plan?: PlanTier;
  interval?: BillingInterval;
  error?: string;
}

export interface FeatureAccess {
  hasAccess: boolean;
  requiredPlan?: PlanTier;
  currentPlan: PlanTier | null;
}

export interface PaywallContext {
  feature?: string;
  source?: string;
  requiredPlan?: PlanTier;
}

