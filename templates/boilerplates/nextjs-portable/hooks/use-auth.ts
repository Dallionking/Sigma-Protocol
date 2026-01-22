"use client";

import { useEffect, useState, useCallback } from "react";

/**
 * User type from Better Auth
 */
interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
}

/**
 * Auth Hook Return Type
 * 
 * @public
 * @stable since 1.0.0
 */
export interface UseAuthReturn {
  /** Current authenticated user */
  user: User | null;
  
  /** Loading state */
  isLoading: boolean;
  
  /** Sign in with email/password */
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  
  /** Sign up with email/password */
  signUp: (email: string, password: string, name?: string) => Promise<{ error?: string }>;
  
  /** Sign out */
  signOut: () => Promise<void>;
  
  /** Sign in with OAuth provider */
  signInWithOAuth: (provider: "github" | "google") => void;
}

/**
 * Auth Hook for Better Auth
 * 
 * @example
 * ```tsx
 * function Profile() {
 *   const { user, signOut, isLoading } = useAuth();
 *   
 *   if (isLoading) return <Spinner />;
 *   if (!user) return <Redirect to="/login" />;
 *   
 *   return (
 *     <div>
 *       <p>Welcome, {user.name}!</p>
 *       <button onClick={signOut}>Sign Out</button>
 *     </div>
 *   );
 * }
 * ```
 * 
 * @public
 * @stable since 1.0.0
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current session on mount
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user ?? null);
        }
      } catch (error) {
        console.error("Failed to fetch session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        return { error: data.error || "Sign in failed" };
      }

      const data = await res.json();
      setUser(data.user);
      return {};
    } catch (error) {
      return { error: "Network error" };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    try {
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      if (!res.ok) {
        const data = await res.json();
        return { error: data.error || "Sign up failed" };
      }

      const data = await res.json();
      setUser(data.user);
      return {};
    } catch (error) {
      return { error: "Network error" };
    }
  }, []);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/sign-out", { method: "POST" });
    setUser(null);
  }, []);

  const signInWithOAuth = useCallback((provider: "github" | "google") => {
    window.location.href = `/api/auth/${provider}`;
  }, []);

  return {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    signInWithOAuth,
  };
}

