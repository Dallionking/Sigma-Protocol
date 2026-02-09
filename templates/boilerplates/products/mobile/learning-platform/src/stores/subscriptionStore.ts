import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type SubscriptionTier = "free" | "essential" | "pro" | "vip";
export type BillingCycle = "monthly" | "annual";

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  billingCycle: BillingCycle;
  startedAt: string;
  expiresAt: string;
  autoRenew: boolean;
  paymentMethod?: {
    type: "apple" | "google" | "card";
    last4?: string;
  };
}

interface SubscriptionState {
  // Current subscription
  subscription: SubscriptionInfo | null;

  // Selection state (for checkout flow)
  selectedTier: SubscriptionTier;
  selectedBillingCycle: BillingCycle;

  // UI state
  isLoading: boolean;
  isRestoring: boolean;

  // Actions
  setSelectedTier: (tier: SubscriptionTier) => void;
  setSelectedBillingCycle: (cycle: BillingCycle) => void;
  subscribe: (tier: SubscriptionTier, cycle: BillingCycle) => Promise<boolean>;
  cancel: (reason?: string) => Promise<boolean>;
  restore: () => Promise<boolean>;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialState = {
  subscription: null as SubscriptionInfo | null,
  selectedTier: "pro" as SubscriptionTier, // Default to recommended
  selectedBillingCycle: "annual" as BillingCycle, // Default to annual for savings
  isLoading: false,
  isRestoring: false,
};

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setSelectedTier: (tier) => set({ selectedTier: tier }),

      setSelectedBillingCycle: (cycle) => set({ selectedBillingCycle: cycle }),

      subscribe: async (tier, cycle) => {
        set({ isLoading: true });

        // Simulate API call
        await new Promise((r) => setTimeout(r, 2000));

        const now = new Date();
        const expiresAt = new Date(now);
        if (cycle === "monthly") {
          expiresAt.setMonth(expiresAt.getMonth() + 1);
        } else {
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        }

        set({
          subscription: {
            tier,
            billingCycle: cycle,
            startedAt: now.toISOString(),
            expiresAt: expiresAt.toISOString(),
            autoRenew: true,
            paymentMethod: {
              type: "apple",
            },
          },
          isLoading: false,
        });

        return true;
      },

      cancel: async (reason) => {
        set({ isLoading: true });

        // Simulate API call
        await new Promise((r) => setTimeout(r, 1500));

        set((state) => ({
          subscription: state.subscription
            ? { ...state.subscription, autoRenew: false }
            : null,
          isLoading: false,
        }));

        return true;
      },

      restore: async () => {
        set({ isRestoring: true });

        // Simulate restore purchase check
        await new Promise((r) => setTimeout(r, 2000));

        // For demo, pretend no previous purchase found
        set({ isRestoring: false });

        return false;
      },

      setLoading: (loading) => set({ isLoading: loading }),

      reset: () => set(initialState),
    }),
    {
      name: "@app/subscription",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        subscription: state.subscription,
        selectedTier: state.selectedTier,
        selectedBillingCycle: state.selectedBillingCycle,
      }),
    }
  )
);

/**
 * Helper to check if user has access to a feature based on their tier
 */
export function hasFeatureAccess(
  currentTier: SubscriptionTier,
  requiredTier: SubscriptionTier
): boolean {
  const tierOrder: SubscriptionTier[] = ["free", "essential", "pro", "vip"];
  return tierOrder.indexOf(currentTier) >= tierOrder.indexOf(requiredTier);
}

/**
 * Get the current tier (defaults to free if no subscription)
 */
export function getCurrentTier(subscription: SubscriptionInfo | null): SubscriptionTier {
  if (!subscription) return "free";
  
  // Check if subscription is still valid
  const now = new Date();
  const expiresAt = new Date(subscription.expiresAt);
  if (now > expiresAt) return "free";
  
  return subscription.tier;
}

