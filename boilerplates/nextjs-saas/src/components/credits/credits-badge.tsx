"use client";

import { Coins } from "lucide-react";
import { useCredits } from "@/hooks/use-credits";
import { cn } from "@/lib/utils";

/**
 * Credits Badge Props
 * 
 * @public
 * @stable since 1.0.0
 */
export interface CreditsBadgeProps {
  /** Show skeleton when loading */
  showSkeleton?: boolean;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Compact mode (icon only) */
  compact?: boolean;
}

/**
 * Credits Badge Component
 * 
 * Displays the user's current credit balance.
 * Use in navigation, headers, or wherever credit visibility is needed.
 * 
 * @example
 * ```tsx
 * // In navbar
 * <CreditsBadge />
 * 
 * // Compact version
 * <CreditsBadge compact />
 * ```
 * 
 * @public
 * @stable since 1.0.0
 */
export function CreditsBadge({ 
  showSkeleton = true, 
  className,
  compact = false,
}: CreditsBadgeProps) {
  const { remaining, isLoading } = useCredits();

  if (isLoading && showSkeleton) {
    return (
      <div 
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted animate-pulse",
          compact && "px-2",
          className
        )}
      >
        <Coins className="h-4 w-4 text-muted-foreground" />
        {!compact && <span className="w-8 h-4 bg-muted-foreground/20 rounded" />}
      </div>
    );
  }

  const formattedCredits = new Intl.NumberFormat().format(remaining);
  const isLow = remaining < 100;

  return (
    <div 
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
        "bg-muted text-muted-foreground",
        "transition-colors",
        isLow && "bg-destructive/10 text-destructive",
        compact && "px-2",
        className
      )}
      title={`${formattedCredits} credits remaining`}
    >
      <Coins className={cn("h-4 w-4", isLow && "text-destructive")} />
      {!compact && (
        <span className="text-sm font-medium tabular-nums">
          {formattedCredits}
        </span>
      )}
    </div>
  );
}

