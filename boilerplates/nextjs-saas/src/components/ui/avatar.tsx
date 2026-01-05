"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Avatar Component
 * 
 * Simple avatar component with fallback support.
 * 
 * @module ui
 */

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Avatar({
  src,
  alt = "",
  fallback,
  size = "md",
  className,
}: AvatarProps) {
  const [hasError, setHasError] = React.useState(false);

  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  const getFallbackText = () => {
    if (fallback) return fallback;
    if (alt) return alt.slice(0, 2).toUpperCase();
    return "??";
  };

  if (!src || hasError) {
    return (
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-medium",
          "bg-gradient-to-br from-emerald-400 to-cyan-400 text-white",
          sizeClasses[size],
          className
        )}
      >
        {getFallbackText()}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className={cn(
        "rounded-full object-cover",
        sizeClasses[size],
        className
      )}
    />
  );
}











