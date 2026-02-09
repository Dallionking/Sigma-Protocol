import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthState {
  // Signup flow state
  signupEmail: string | null;
  signupName: string | null;
  
  // UI state
  isLoading: boolean;
  
  // Actions
  setSignupEmail: (email: string) => void;
  setSignupName: (name: string) => void;
  setLoading: (loading: boolean) => void;
  clearSignupData: () => void;
  reset: () => void;
}

const initialState = {
  signupEmail: null as string | null,
  signupName: null as string | null,
  isLoading: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,

      setSignupEmail: (email) => set({ signupEmail: email }),

      setSignupName: (name) => set({ signupName: name }),

      setLoading: (loading) => set({ isLoading: loading }),

      clearSignupData: () =>
        set({
          signupEmail: null,
          signupName: null,
        }),

      reset: () => set(initialState),
    }),
    {
      name: "@app/auth",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        signupEmail: state.signupEmail,
        signupName: state.signupName,
      }),
    }
  )
);

/**
 * Stubbed API calls for prototype
 * In production, replace with real API endpoints
 */
export const authApi = {
  /**
   * Send verification code to email
   */
  sendVerificationCode: async (email: string): Promise<{ success: boolean }> => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("[Auth API Stub] Sending verification code to:", email);
    return { success: true };
  },

  /**
   * Verify OTP code
   */
  verifyCode: async (email: string, code: string): Promise<{ success: boolean }> => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    console.log("[Auth API Stub] Verifying code:", code, "for:", email);
    // Simulate success for any 6-digit code
    return { success: code.length === 6 };
  },

  /**
   * Create account with password
   */
  createAccount: async (
    email: string,
    password: string,
    name: string
  ): Promise<{ success: boolean; userId: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("[Auth API Stub] Creating account for:", email, name);
    return { success: true, userId: "demo-user-" + Date.now() };
  },

  /**
   * Sign in with credentials
   */
  signIn: async (
    email: string,
    password: string
  ): Promise<{ success: boolean; requires2FA: boolean }> => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    console.log("[Auth API Stub] Signing in:", email);
    // Simulate 2FA required for specific emails
    const requires2FA = email.includes("2fa");
    return { success: true, requires2FA };
  },

  /**
   * Send password reset email
   */
  sendResetEmail: async (email: string): Promise<{ success: boolean }> => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("[Auth API Stub] Sending reset email to:", email);
    return { success: true };
  },

  /**
   * Reset password with token
   */
  resetPassword: async (
    token: string,
    newPassword: string
  ): Promise<{ success: boolean }> => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    console.log("[Auth API Stub] Resetting password with token:", token);
    return { success: true };
  },
};



