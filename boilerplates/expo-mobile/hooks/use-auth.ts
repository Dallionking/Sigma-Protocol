import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
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
}

/**
 * Auth Hook for Expo/React Native
 * 
 * Provides authentication state and methods.
 * Automatically syncs with Supabase auth state changes.
 * 
 * @example
 * ```tsx
 * function MyScreen() {
 *   const { user, signOut, isLoading } = useAuth();
 *   
 *   if (isLoading) return <ActivityIndicator />;
 *   if (!user) return <LoginScreen />;
 *   
 *   return (
 *     <View>
 *       <Text>Welcome, {user.email}!</Text>
 *       <Button onPress={signOut} title="Sign Out" />
 *     </View>
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
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  }, []);

  return {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
}

