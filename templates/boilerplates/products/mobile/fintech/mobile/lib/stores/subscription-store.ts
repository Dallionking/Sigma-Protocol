import { create } from 'zustand';
import { PlanTier, BillingInterval, SubscriptionStatus } from '@/lib/types/subscription';

interface SubscriptionState {
  // Current subscription
  currentPlan: PlanTier | null;
  subscriptionStatus: SubscriptionStatus;
  billingInterval: BillingInterval;
  renewalDate: string | null;
  isFoundingMember: boolean;
  priceLockedAt: number | null;
  
  // Purchase state
  isPurchasing: boolean;
  purchaseError: string | null;
  
  // Actions
  setCurrentPlan: (plan: PlanTier, interval: BillingInterval) => void;
  setSubscriptionStatus: (status: SubscriptionStatus) => void;
  setFoundingMember: (isFounding: boolean) => void;
  setPurchasing: (isPurchasing: boolean) => void;
  setPurchaseError: (error: string | null) => void;
  
  // Business logic
  upgrade: (plan: PlanTier, interval: BillingInterval) => Promise<void>;
  restorePurchases: () => Promise<void>;
  cancelSubscription: () => void;
  resetPurchaseState: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  // Initial state - Mock user on Pro monthly
  currentPlan: 'pro',
  subscriptionStatus: 'active',
  billingInterval: 'monthly',
  renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
  isFoundingMember: false,
  priceLockedAt: null,
  
  isPurchasing: false,
  purchaseError: null,

  // Simple setters
  setCurrentPlan: (plan, interval) => set({ 
    currentPlan: plan,
    billingInterval: interval,
  }),
  
  setSubscriptionStatus: (status) => set({ subscriptionStatus: status }),
  
  setFoundingMember: (isFounding) => set({ isFoundingMember: isFounding }),
  
  setPurchasing: (isPurchasing) => set({ isPurchasing }),
  
  setPurchaseError: (error) => set({ purchaseError: error }),

  // Business logic
  upgrade: async (plan, interval) => {
    set({ isPurchasing: true, purchaseError: null });
    
    try {
      // Simulate purchase delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock success
      const renewalDate = new Date();
      if (interval === 'monthly') {
        renewalDate.setMonth(renewalDate.getMonth() + 1);
      } else {
        renewalDate.setFullYear(renewalDate.getFullYear() + 1);
      }
      
      set({
        currentPlan: plan,
        billingInterval: interval,
        subscriptionStatus: 'active',
        renewalDate: renewalDate.toISOString(),
        isPurchasing: false,
      });
    } catch (error: any) {
      set({
        isPurchasing: false,
        purchaseError: error.message || 'Purchase failed',
      });
      throw error;
    }
  },

  restorePurchases: async () => {
    set({ isPurchasing: true, purchaseError: null });
    
    try {
      // Simulate restore delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock: restore to Pro monthly
      const renewalDate = new Date();
      renewalDate.setMonth(renewalDate.getMonth() + 1);
      
      set({
        currentPlan: 'pro',
        billingInterval: 'monthly',
        subscriptionStatus: 'active',
        renewalDate: renewalDate.toISOString(),
        isPurchasing: false,
      });
    } catch (error: any) {
      set({
        isPurchasing: false,
        purchaseError: error.message || 'Restore failed',
      });
      throw error;
    }
  },

  cancelSubscription: () => {
    // In real app, this opens iOS Settings
    // For mock, we just mark as cancelled
    set({ subscriptionStatus: 'cancelled' });
  },

  resetPurchaseState: () => {
    set({ isPurchasing: false, purchaseError: null });
  },
}));

