"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./use-auth";

/**
 * Subscription Plan Types
 */
export type PlanType = "free" | "starter" | "pro" | "enterprise";

/**
 * Subscription Status Types
 */
export type SubscriptionStatus = 
  | "active" 
  | "canceled" 
  | "past_due" 
  | "trialing" 
  | "incomplete";

/**
 * Subscription Data
 */
export interface Subscription {
  id: string;
  plan: PlanType;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

/**
 * Subscription Hook Return Type
 * 
 * @public
 * @stable since 1.0.0
 */
export interface UseSubscriptionReturn {
  /** Current subscription (null if free) */
  subscription: Subscription | null;
  
  /** Current plan type */
  plan: PlanType;
  
  /** Whether user has an active paid subscription */
  isPaid: boolean;
  
  /** Whether subscription is in trial */
  isTrialing: boolean;
  
  /** Loading state */
  isLoading: boolean;
  
  /** Error state */
  error: Error | null;
  
  /** Refresh subscription data */
  refresh: () => Promise<void>;
  
  /** Open Stripe billing portal */
  openBillingPortal: () => Promise<void>;
  
  /** Start checkout for a plan */
  checkout: (priceId: string) => Promise<void>;
}

/**
 * Subscription Hook
 * 
 * Manages user subscription state and Stripe interactions.
 * 
 * @example
 * ```tsx
 * function PricingPage() {
 *   const { plan, isPaid, checkout, isLoading } = useSubscription();
 *   
 *   if (isLoading) return <Spinner />;
 *   
 *   return (
 *     <div>
 *       <p>Current plan: {plan}</p>
 *       {!isPaid && (
 *         <button onClick={() => checkout("price_pro_monthly")}>
 *           Upgrade to Pro
 *         </button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 * 
 * @public
 * @stable since 1.0.0
 */
export function useSubscription(): UseSubscriptionReturn {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const supabase = createClient();

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      if (fetchError) {
        // No subscription found = free tier
        if (fetchError.code === "PGRST116") {
          setSubscription(null);
        } else {
          throw fetchError;
        }
      } else {
        setSubscription({
          id: data.id,
          plan: data.plan as PlanType,
          status: data.status as SubscriptionStatus,
          currentPeriodStart: new Date(data.current_period_start),
          currentPeriodEnd: new Date(data.current_period_end),
          cancelAtPeriodEnd: data.cancel_at_period_end,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch subscription"));
      console.error("Error fetching subscription:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const plan: PlanType = subscription?.plan ?? "free";
  const isPaid = subscription !== null && subscription.status === "active";
  const isTrialing = subscription?.status === "trialing";

  const openBillingPortal = useCallback(async () => {
    try {
      const response = await fetch("/api/stripe/billing-portal", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to create billing portal session");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      console.error("Error opening billing portal:", err);
      throw err;
    }
  }, []);

  const checkout = useCallback(async (priceId: string) => {
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      console.error("Error starting checkout:", err);
      throw err;
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchSubscription();
  }, [fetchSubscription]);

  return {
    subscription,
    plan,
    isPaid,
    isTrialing,
    isLoading,
    error,
    refresh,
    openBillingPortal,
    checkout,
  };
}

