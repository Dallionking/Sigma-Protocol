/**
 * Auth Store (Zustand)
 * 
 * Centralized state management for authentication, sessions, and security.
 */

import { create } from 'zustand';
import * as Haptics from 'expo-haptics';
import { 
  AuthState, 
  User, 
  Session, 
  PasswordChangeRequest 
} from '@/lib/types/auth';
import {
  saveBiometricPreference,
  getBiometricPreference,
  clearBiometricPreferences,
} from '@/lib/utils/biometric';
import {
  MOCK_MODE,
  MOCK_USER,
  MOCK_SESSIONS,
  mockUpdatePassword,
  mockEndSession,
  mockEndAllSessions,
  mockLogout,
  mockDeleteAccount,
} from '@/lib/utils/mock-auth-data';

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: MOCK_MODE ? MOCK_USER : null,
  isAuthenticated: MOCK_MODE ? true : false,
  biometricEnabled: false,
  sessions: MOCK_MODE ? MOCK_SESSIONS : [],
  isLoading: false,
  error: null,

  // Set user
  setUser: (user) => {
    set({ 
      user, 
      isAuthenticated: !!user 
    });
  },

  // Set biometric preference
  setBiometric: async (enabled) => {
    try {
      set({ isLoading: true, error: null });
      
      await saveBiometricPreference(enabled);
      
      set({ 
        biometricEnabled: enabled,
        isLoading: false,
      });
      
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      );
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to update biometric preference',
        isLoading: false,
      });
      
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Error
      );
      
      throw error;
    }
  },

  // Set sessions
  setSessions: (sessions) => {
    set({ sessions });
  },

  // Update password
  updatePassword: async (currentPassword, newPassword) => {
    try {
      set({ isLoading: true, error: null });
      
      let result;
      
      if (MOCK_MODE) {
        result = await mockUpdatePassword(currentPassword, newPassword);
      } else {
        // Real API call
        const response = await fetch('/api/auth/password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentPassword, newPassword }),
        });
        result = await response.json();
      }
      
      if (!result.success) {
        throw new Error(result.error || 'Password update failed');
      }
      
      set({ isLoading: false });
      
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      );
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to update password',
        isLoading: false,
      });
      
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Error
      );
      
      throw error;
    }
  },

  // End a specific session
  endSession: async (sessionId) => {
    try {
      set({ isLoading: true, error: null });
      
      let result;
      
      if (MOCK_MODE) {
        result = await mockEndSession(sessionId);
      } else {
        // Real API call
        const response = await fetch(`/api/auth/sessions/${sessionId}`, {
          method: 'DELETE',
        });
        result = await response.json();
      }
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to end session');
      }
      
      // Remove session from local state
      const { sessions } = get();
      set({ 
        sessions: sessions.filter(s => s.id !== sessionId),
        isLoading: false,
      });
      
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      );
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to end session',
        isLoading: false,
      });
      
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Error
      );
      
      throw error;
    }
  },

  // End all sessions except current
  endAllSessions: async () => {
    try {
      set({ isLoading: true, error: null });
      
      let result;
      
      if (MOCK_MODE) {
        result = await mockEndAllSessions();
      } else {
        // Real API call
        const response = await fetch('/api/auth/sessions', {
          method: 'DELETE',
        });
        result = await response.json();
      }
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to end sessions');
      }
      
      // Keep only current session
      const { sessions } = get();
      set({ 
        sessions: sessions.filter(s => s.isCurrent),
        isLoading: false,
      });
      
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      );
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to end sessions',
        isLoading: false,
      });
      
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Error
      );
      
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      set({ isLoading: true, error: null });
      
      let result;
      
      if (MOCK_MODE) {
        result = await mockLogout();
      } else {
        // Real API call
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
        });
        result = await response.json();
      }
      
      // Clear local state regardless of API response
      await clearBiometricPreferences();
      
      set({
        user: null,
        isAuthenticated: false,
        biometricEnabled: false,
        sessions: [],
        isLoading: false,
        error: null,
      });
      
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      );
    } catch (error: any) {
      // Still clear state on error
      set({
        user: null,
        isAuthenticated: false,
        biometricEnabled: false,
        sessions: [],
        isLoading: false,
        error: error.message || 'Logout failed',
      });
    }
  },

  // Delete account
  deleteAccount: async () => {
    try {
      set({ isLoading: true, error: null });
      
      let result;
      
      if (MOCK_MODE) {
        result = await mockDeleteAccount();
      } else {
        // Real API call
        const response = await fetch('/api/auth/account', {
          method: 'DELETE',
        });
        result = await response.json();
      }
      
      if (!result.success) {
        throw new Error(result.error || 'Account deletion failed');
      }
      
      // Clear all local data
      await clearBiometricPreferences();
      
      set({
        user: null,
        isAuthenticated: false,
        biometricEnabled: false,
        sessions: [],
        isLoading: false,
        error: null,
      });
      
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      );
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to delete account',
        isLoading: false,
      });
      
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Error
      );
      
      throw error;
    }
  },

  // Set loading state
  setLoading: (isLoading) => {
    set({ isLoading });
  },

  // Set error
  setError: (error) => {
    set({ error });
  },

  // Reset error
  resetError: () => {
    set({ error: null });
  },
}));

// Initialize biometric preference on store creation
(async () => {
  const enabled = await getBiometricPreference();
  useAuthStore.setState({ biometricEnabled: enabled });
})();

