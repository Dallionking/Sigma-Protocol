"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

/**
 * Auth Hook Return Type
 * 
 * @public
 * @stable since 1.0.0
 */
export interface UseAuthReturn {
  /** Current authenticated user (null if not logged in) */
  user: User | null;
  
  /** Current session (null if not logged in) */
  session: Session | null;
  
  /** Loading state during initial auth check */
  isLoading: boolean;
  
  /** Sign in with email and password */
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  
  /** Sign up with email and password */
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  
  /** Sign out the current user */
  signOut: () => Promise<{ error: Error | null }>;
  
  /** Send password reset email */
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  
  /** Sign in with OAuth provider */
  signInWithOAuth: (provider: "google" | "github") => Promise<{ error: Error | null }>;
}

/**
 * Auth Hook
 * 
 * Provides authentication state and methods for client components.
 * Automatically syncs with Supabase auth state changes.
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, signOut, isLoading } = useAuth();
 *   
 *   if (isLoading) return <Spinner />;
 *   if (!user) return <LoginButton />;
 *   
 *   return (
 *     <div>
 *       Welcome, {user.email}!
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
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  }, [supabase.auth]);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error };
  }, [supabase.auth]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  }, [supabase.auth]);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { error };
  }, [supabase.auth]);

  const signInWithOAuth = useCallback(async (provider: "google" | "github") => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error };
  }, [supabase.auth]);

  return {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    signInWithOAuth,
  };
}

