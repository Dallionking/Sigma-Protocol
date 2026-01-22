import { useEffect, useState, useCallback } from "react";
import Purchases, {
  CustomerInfo,
  PurchasesOfferings,
  PurchasesPackage,
} from "react-native-purchases";

/**
 * Purchases Hook Return Type
 * 
 * @public
 * @stable since 1.0.0
 */
export interface UsePurchasesReturn {
  /** Current customer info */
  customerInfo: CustomerInfo | null;
  
  /** Available offerings */
  offerings: PurchasesOfferings | null;
  
  /** Whether user has active subscription */
  isSubscribed: boolean;
  
  /** Current subscription tier */
  tier: "free" | "starter" | "pro" | "premium";
  
  /** Loading state */
  isLoading: boolean;
  
  /** Error state */
  error: Error | null;
  
  /** Purchase a package */
  purchase: (pkg: PurchasesPackage) => Promise<{ success: boolean; error?: Error }>;
  
  /** Restore purchases */
  restore: () => Promise<{ success: boolean; error?: Error }>;
  
  /** Refresh customer info */
  refresh: () => Promise<void>;
}

/**
 * RevenueCat Purchases Hook
 * 
 * Manages in-app purchases and subscriptions via RevenueCat.
 * 
 * @example
 * ```tsx
 * function PaywallScreen() {
 *   const { offerings, purchase, isSubscribed, isLoading } = usePurchases();
 *   
 *   if (isLoading) return <ActivityIndicator />;
 *   if (isSubscribed) return <PremiumContent />;
 *   
 *   return (
 *     <View>
 *       {offerings?.current?.availablePackages.map((pkg) => (
 *         <Button
 *           key={pkg.identifier}
 *           onPress={() => purchase(pkg)}
 *           title={`Subscribe ${pkg.product.priceString}`}
 *         />
 *       ))}
 *     </View>
 *   );
 * }
 * ```
 * 
 * @public
 * @stable since 1.0.0
 */
export function usePurchases(): UsePurchasesReturn {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [info, offers] = await Promise.all([
        Purchases.getCustomerInfo(),
        Purchases.getOfferings(),
      ]);

      setCustomerInfo(info);
      setOfferings(offers);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch purchases"));
      console.error("Error fetching purchases:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Listen for customer info updates
    const listener = Purchases.addCustomerInfoUpdateListener((info) => {
      setCustomerInfo(info);
    });

    return () => {
      listener.remove();
    };
  }, [fetchData]);

  // Determine subscription status
  const isSubscribed = customerInfo?.entitlements.active["premium"] !== undefined;
  
  // Determine tier based on active entitlements
  const tier = (() => {
    if (!customerInfo) return "free";
    if (customerInfo.entitlements.active["premium"]) return "premium";
    if (customerInfo.entitlements.active["pro"]) return "pro";
    if (customerInfo.entitlements.active["starter"]) return "starter";
    return "free";
  })();

  const purchase = useCallback(async (pkg: PurchasesPackage) => {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      setCustomerInfo(customerInfo);
      return { success: true };
    } catch (err) {
      // User cancelled is not an error
      if ((err as any).userCancelled) {
        return { success: false };
      }
      const error = err instanceof Error ? err : new Error("Purchase failed");
      return { success: false, error };
    }
  }, []);

  const restore = useCallback(async () => {
    try {
      const customerInfo = await Purchases.restorePurchases();
      setCustomerInfo(customerInfo);
      return { success: true };
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Restore failed");
      return { success: false, error };
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return {
    customerInfo,
    offerings,
    isSubscribed,
    tier,
    isLoading,
    error,
    purchase,
    restore,
    refresh,
  };
}

