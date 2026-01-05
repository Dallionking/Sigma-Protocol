"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

/**
 * PostHog Analytics Provider
 * 
 * Initializes PostHog analytics and identifies users.
 * Only loads in production when NEXT_PUBLIC_POSTHOG_KEY is set.
 * 
 * @stable since 1.0.0
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";
  const isEnabled = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true";

  useEffect(() => {
    if (posthogKey && isEnabled && typeof window !== "undefined") {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        person_profiles: "identified_only",
        capture_pageview: false, // We capture manually
        capture_pageleave: true,
        loaded: (posthog) => {
          if (process.env.NODE_ENV === "development") {
            posthog.debug();
          }
        },
      });
    }
  }, [posthogKey, posthogHost, isEnabled]);

  // If analytics not enabled, just render children
  if (!posthogKey || !isEnabled) {
    return <>{children}</>;
  }

  return (
    <PHProvider client={posthog}>
      <PostHogUserIdentifier />
      {children}
    </PHProvider>
  );
}

/**
 * Identifies the user in PostHog when they log in
 */
function PostHogUserIdentifier() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      posthog.identify(user.id, {
        email: user.email,
        created_at: user.created_at,
      });
    } else {
      posthog.reset();
    }
  }, [user]);

  return null;
}

