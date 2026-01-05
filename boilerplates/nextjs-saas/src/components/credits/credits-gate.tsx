"use client";

import { useCredits } from "@/hooks/use-credits";
import { Button } from "@/components/ui/button";
import { Coins, Lock } from "lucide-react";
import Link from "next/link";

/**
 * Credits Gate Props
 * 
 * @public
 * @stable since 1.0.0
 */
export interface CreditsGateProps {
  /** Required credits to access the feature */
  required: number;
  
  /** Content to show when user has enough credits */
  children: React.ReactNode;
  
  /** Custom fallback when insufficient credits */
  fallback?: React.ReactNode;
  
  /** Show loading state */
  showLoading?: boolean;
}

/**
 * Credits Gate Component
 * 
 * Conditionally renders content based on user's credit balance.
 * Shows upgrade prompt when credits are insufficient.
 * 
 * @example
 * ```tsx
 * <CreditsGate required={10}>
 *   <AIGeneratorForm />
 * </CreditsGate>
 * 
 * // With custom fallback
 * <CreditsGate 
 *   required={100} 
 *   fallback={<CustomUpgradePrompt />}
 * >
 *   <PremiumFeature />
 * </CreditsGate>
 * ```
 * 
 * @public
 * @stable since 1.0.0
 */
export function CreditsGate({ 
  required, 
  children, 
  fallback,
  showLoading = true,
}: CreditsGateProps) {
  const { remaining, isLoading, hasEnough } = useCredits();

  if (isLoading && showLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse flex items-center gap-2 text-muted-foreground">
          <Coins className="h-5 w-5" />
          <span>Checking credits...</span>
        </div>
      </div>
    );
  }

  if (!hasEnough(required)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 border rounded-lg bg-muted/50">
        <div className="p-3 rounded-full bg-destructive/10">
          <Lock className="h-6 w-6 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Insufficient Credits</h3>
          <p className="text-muted-foreground max-w-sm">
            This feature requires {required} credits. 
            You currently have {remaining} credits.
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/pricing">
              View Plans
            </Link>
          </Button>
          <Button asChild>
            <Link href="/credits">
              <Coins className="h-4 w-4 mr-2" />
              Get Credits
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

