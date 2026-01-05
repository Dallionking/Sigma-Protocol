import { useConvexAuth as useBaseConvexAuth } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

/**
 * Auth Hook Return Type for Convex
 * 
 * @public
 * @stable since 1.0.0
 */
export interface UseAuthReturn {
  /** Whether auth is loading */
  isLoading: boolean;
  
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  
  /** Current user data from database */
  user: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
  } | null | undefined;
}

/**
 * Auth Hook for Convex-powered apps
 * 
 * Wraps Convex's auth state and fetches user data.
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isAuthenticated, user, isLoading } = useAuth();
 *   
 *   if (isLoading) return <Spinner />;
 *   if (!isAuthenticated) return <LoginButton />;
 *   
 *   return <div>Welcome, {user?.name}!</div>;
 * }
 * ```
 * 
 * @public
 * @stable since 1.0.0
 */
export function useAuth(): UseAuthReturn {
  const { isLoading: authLoading, isAuthenticated } = useBaseConvexAuth();
  
  // Fetch current user from Convex
  const user = useQuery(
    api.users.currentUser,
    isAuthenticated ? {} : "skip"
  );
  
  const isLoading = authLoading || (isAuthenticated && user === undefined);

  return {
    isLoading,
    isAuthenticated,
    user: user ?? null,
  };
}

