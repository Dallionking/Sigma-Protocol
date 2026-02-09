import { useSubscriptionStore } from '@/lib/stores/subscription-store';
import { FEATURE_GATES, SUBSCRIPTION_PLANS } from '@/lib/constants/subscription';
import { PlanTier } from '@/lib/types/subscription';

/**
 * Check if user has access to a specific feature
 */
export function useFeatureAccess(featureKey: string) {
  const currentPlan = useSubscriptionStore((state) => state.currentPlan);
  
  const allowedPlans = FEATURE_GATES[featureKey];
  
  if (!allowedPlans || !currentPlan) {
    return {
      hasAccess: false,
      requiredPlan: allowedPlans?.[0] as PlanTier | undefined,
      currentPlan,
    };
  }
  
  return {
    hasAccess: allowedPlans.includes(currentPlan),
    requiredPlan: !allowedPlans.includes(currentPlan) ? allowedPlans[0] as PlanTier : undefined,
    currentPlan,
  };
}

/**
 * Get current subscription details
 */
export function useCurrentSubscription() {
  const currentPlan = useSubscriptionStore((state) => state.currentPlan);
  const status = useSubscriptionStore((state) => state.subscriptionStatus);
  const interval = useSubscriptionStore((state) => state.billingInterval);
  const renewalDate = useSubscriptionStore((state) => state.renewalDate);
  const isFoundingMember = useSubscriptionStore((state) => state.isFoundingMember);
  
  const planData = currentPlan ? SUBSCRIPTION_PLANS[currentPlan] : null;
  
  return {
    currentPlan,
    planData,
    status,
    interval,
    renewalDate,
    isFoundingMember,
    isActive: status === 'active',
  };
}

/**
 * Check if user is on a specific plan or better
 */
export function useHasPlanOrBetter(minPlan: PlanTier) {
  const currentPlan = useSubscriptionStore((state) => state.currentPlan);
  
  if (!currentPlan) return false;
  
  const tierOrder: PlanTier[] = ['basic', 'pro', 'elite'];
  const currentIndex = tierOrder.indexOf(currentPlan);
  const minIndex = tierOrder.indexOf(minPlan);
  
  return currentIndex >= minIndex;
}

/**
 * Purchase hooks
 */
export function usePurchaseState() {
  const isPurchasing = useSubscriptionStore((state) => state.isPurchasing);
  const purchaseError = useSubscriptionStore((state) => state.purchaseError);
  
  return {
    isPurchasing,
    purchaseError,
  };
}

/**
 * Get upgrade recommendation for a feature
 */
export function getUpgradeRecommendation(featureKey: string): PlanTier | null {
  const allowedPlans = FEATURE_GATES[featureKey];
  if (!allowedPlans || allowedPlans.length === 0) return null;
  
  // Recommend the lowest tier that has the feature
  return allowedPlans[0] as PlanTier;
}

