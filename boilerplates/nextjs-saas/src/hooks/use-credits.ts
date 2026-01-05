"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./use-auth";

/**
 * Credits Hook Return Type
 * 
 * @public
 * @stable since 1.0.0
 */
export interface UseCreditsReturn {
  /** Current credit balance */
  remaining: number;
  
  /** Total credits ever purchased/received */
  total: number;
  
  /** Loading state during credit fetch */
  isLoading: boolean;
  
  /** Error state */
  error: Error | null;
  
  /** Refresh credits from server */
  refresh: () => Promise<void>;
  
  /** Consume credits (returns success boolean) */
  consume: (amount: number, description?: string) => Promise<boolean>;
  
  /** Check if user has enough credits */
  hasEnough: (amount: number) => boolean;
}

/**
 * Credits Hook
 * 
 * Manages user credit balance for usage-based features (AI, etc.).
 * Automatically syncs with database and handles optimistic updates.
 * 
 * @example
 * ```tsx
 * function AIFeature() {
 *   const { remaining, consume, hasEnough, isLoading } = useCredits();
 *   
 *   const handleGenerate = async () => {
 *     if (!hasEnough(10)) {
 *       toast.error("Not enough credits!");
 *       return;
 *     }
 *     
 *     const success = await consume(10, "AI generation");
 *     if (success) {
 *       // Proceed with AI action
 *     }
 *   };
 *   
 *   return (
 *     <div>
 *       <p>Credits: {remaining}</p>
 *       <button onClick={handleGenerate} disabled={!hasEnough(10)}>
 *         Generate (10 credits)
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 * 
 * @public
 * @stable since 1.0.0
 */
export function useCredits(): UseCreditsReturn {
  const { user } = useAuth();
  const [remaining, setRemaining] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const supabase = createClient();

  const fetchCredits = useCallback(async () => {
    if (!user) {
      setRemaining(0);
      setTotal(0);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("user_credits")
        .select("remaining, total")
        .eq("user_id", user.id)
        .single();

      if (fetchError) {
        // If no record exists, create one with default credits
        if (fetchError.code === "PGRST116") {
          const defaultCredits = parseInt(
            process.env.NEXT_PUBLIC_DEFAULT_CREDITS || "100"
          );
          
          const { data: newData, error: insertError } = await supabase
            .from("user_credits")
            .insert({
              user_id: user.id,
              remaining: defaultCredits,
              total: defaultCredits,
            })
            .select("remaining, total")
            .single();

          if (insertError) throw insertError;
          
          setRemaining(newData.remaining);
          setTotal(newData.total);
        } else {
          throw fetchError;
        }
      } else {
        setRemaining(data.remaining);
        setTotal(data.total);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch credits"));
      console.error("Error fetching credits:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  const consume = useCallback(async (amount: number, description?: string): Promise<boolean> => {
    if (!user || remaining < amount) {
      return false;
    }

    // Optimistic update
    const previousRemaining = remaining;
    setRemaining((prev) => prev - amount);

    try {
      // Call API to consume credits (server-side validation)
      const response = await fetch("/api/credits/consume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, description }),
      });

      if (!response.ok) {
        throw new Error("Failed to consume credits");
      }

      const { remaining: newRemaining } = await response.json();
      setRemaining(newRemaining);
      return true;
    } catch (err) {
      // Rollback on error
      setRemaining(previousRemaining);
      console.error("Error consuming credits:", err);
      return false;
    }
  }, [user, remaining]);

  const hasEnough = useCallback((amount: number): boolean => {
    return remaining >= amount;
  }, [remaining]);

  const refresh = useCallback(async () => {
    await fetchCredits();
  }, [fetchCredits]);

  return {
    remaining,
    total,
    isLoading,
    error,
    refresh,
    consume,
    hasEnough,
  };
}

