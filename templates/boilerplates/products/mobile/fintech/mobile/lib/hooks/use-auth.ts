/**
 * Auth Hooks (React Query)
 * 
 * Server state management for authentication operations.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/auth-store';
import { 
  Session, 
  PasswordChangeRequest,
  PasswordChangeResponse,
  SessionEndResponse,
  AccountDeletionResponse,
  BiometricStatus,
} from '@/lib/types/auth';
import {
  MOCK_MODE,
  MOCK_SESSIONS,
  mockUpdatePassword,
  mockEndSession,
  mockEndAllSessions,
  mockDeleteAccount,
  mockDelay,
} from '@/lib/utils/mock-auth-data';
import { checkBiometricHardware } from '@/lib/utils/biometric';

// Query keys
export const AUTH_QUERY_KEYS = {
  sessions: ['sessions'],
  biometricStatus: ['biometric-status'],
  user: ['user'],
} as const;

/**
 * Fetch active sessions
 */
export function useSessions() {
  const setSessions = useAuthStore(state => state.setSessions);
  
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.sessions,
    queryFn: async (): Promise<Session[]> => {
      if (MOCK_MODE) {
        await mockDelay(600);
        return MOCK_SESSIONS;
      }
      
      // Real API call
      const response = await fetch('/api/auth/sessions');
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setSessions(data);
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });
}

/**
 * Update password mutation
 */
export function useUpdatePassword() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: PasswordChangeRequest): Promise<PasswordChangeResponse> => {
      if (MOCK_MODE) {
        return mockUpdatePassword(data.currentPassword, data.newPassword);
      }
      
      // Real API call
      const response = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update password');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate user query
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.user });
    },
  });
}

/**
 * End a specific session
 */
export function useEndSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (sessionId: string): Promise<SessionEndResponse> => {
      if (MOCK_MODE) {
        return mockEndSession(sessionId);
      }
      
      // Real API call
      const response = await fetch(`/api/auth/sessions/${sessionId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to end session');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Refetch sessions list
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.sessions });
    },
  });
}

/**
 * End all sessions except current
 */
export function useEndAllSessions() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (): Promise<SessionEndResponse> => {
      if (MOCK_MODE) {
        return mockEndAllSessions();
      }
      
      // Real API call
      const response = await fetch('/api/auth/sessions', {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to end sessions');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Refetch sessions list
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.sessions });
    },
  });
}

/**
 * Delete account mutation
 */
export function useDeleteAccount() {
  return useMutation({
    mutationFn: async (): Promise<AccountDeletionResponse> => {
      if (MOCK_MODE) {
        return mockDeleteAccount();
      }
      
      // Real API call
      const response = await fetch('/api/auth/account', {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete account');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Auth store cleanup is handled in the store's deleteAccount method
    },
  });
}

/**
 * Get biometric status
 */
export function useBiometricStatus() {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.biometricStatus,
    queryFn: async (): Promise<BiometricStatus> => {
      return checkBiometricHardware();
    },
    staleTime: Infinity, // Biometric hardware doesn't change during app session
  });
}

/**
 * Get current auth state from store
 */
export function useAuth() {
  const user = useAuthStore(state => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const biometricEnabled = useAuthStore(state => state.biometricEnabled);
  const isLoading = useAuthStore(state => state.isLoading);
  const error = useAuthStore(state => state.error);
  
  return {
    user,
    isAuthenticated,
    biometricEnabled,
    isLoading,
    error,
  };
}

/**
 * Auth actions from store
 */
export function useAuthActions() {
  const setBiometric = useAuthStore(state => state.setBiometric);
  const updatePassword = useAuthStore(state => state.updatePassword);
  const endSession = useAuthStore(state => state.endSession);
  const endAllSessions = useAuthStore(state => state.endAllSessions);
  const logout = useAuthStore(state => state.logout);
  const deleteAccount = useAuthStore(state => state.deleteAccount);
  const resetError = useAuthStore(state => state.resetError);
  
  return {
    setBiometric,
    updatePassword,
    endSession,
    endAllSessions,
    logout,
    deleteAccount,
    resetError,
  };
}

