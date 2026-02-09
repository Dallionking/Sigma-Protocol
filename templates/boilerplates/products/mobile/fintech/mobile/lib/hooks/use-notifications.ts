/**
 * Notification Hooks (React Query)
 * 
 * Hooks for notification permission, preferences, and push token management.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import {
  PermissionStatus,
  NotificationPreferences,
  QuietHours,
} from '@/lib/types/notifications';
import {
  getPermissionStatus,
  requestPermission,
  registerForPushNotifications,
  savePreferences,
  loadPreferences,
  saveQuietHours,
  loadQuietHours,
  mockSyncPreferences,
  mockSyncQuietHours,
  mockRegisterPushToken,
  MOCK_MODE,
} from '@/lib/utils/push-notifications';
import { useNotificationStore } from '@/lib/stores/notification-store';

// Query keys
export const NOTIFICATION_QUERY_KEYS = {
  permission: ['notification-permission'],
  preferences: ['notification-preferences'],
  quietHours: ['notification-quiet-hours'],
  pushToken: ['push-token'],
} as const;

/**
 * Hook to check notification permission status
 */
export function useNotificationPermission() {
  const store = useNotificationStore();

  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.permission,
    queryFn: async () => {
      const status = await getPermissionStatus();
      store.setPermissionStatus(status);
      return status;
    },
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Hook to request notification permission
 */
export function useRequestPermission() {
  const queryClient = useQueryClient();
  const store = useNotificationStore();

  return useMutation({
    mutationFn: async () => {
      const status = await requestPermission();
      return status;
    },
    onSuccess: async (status) => {
      store.setPermissionStatus(status);
      queryClient.setQueryData(NOTIFICATION_QUERY_KEYS.permission, status);

      // If granted, register for push notifications
      if (status === 'granted') {
        const token = await registerForPushNotifications();
        if (token) {
          store.setPushToken(token);
          
          // Sync token to server
          if (MOCK_MODE) {
            await mockRegisterPushToken(token);
          } else {
            await fetch('/api/user/push-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token, platform: 'ios' }),
            });
          }
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });
}

/**
 * Hook to load notification preferences
 */
export function useNotificationPreferences() {
  const store = useNotificationStore();

  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.preferences,
    queryFn: async () => {
      const preferences = await loadPreferences();
      return preferences;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    initialData: store.preferences,
  });
}

/**
 * Hook to update a single notification preference
 */
export function useUpdatePreference() {
  const queryClient = useQueryClient();
  const store = useNotificationStore();

  return useMutation({
    mutationFn: async ({ 
      key, 
      value 
    }: { 
      key: keyof NotificationPreferences; 
      value: boolean 
    }) => {
      const currentPreferences = store.preferences;
      const newPreferences = { ...currentPreferences, [key]: value };

      // Save locally
      await savePreferences(newPreferences);

      // Sync to server
      if (MOCK_MODE) {
        await mockSyncPreferences(newPreferences);
      } else {
        const response = await fetch('/api/user/notification-preferences', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ preferences: newPreferences }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update preference');
        }
      }

      return newPreferences;
    },
    onMutate: async ({ key, value }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: NOTIFICATION_QUERY_KEYS.preferences });

      // Snapshot previous value
      const previousPreferences = queryClient.getQueryData<NotificationPreferences>(
        NOTIFICATION_QUERY_KEYS.preferences
      );

      // Optimistically update
      const newPreferences = { ...store.preferences, [key]: value };
      queryClient.setQueryData(NOTIFICATION_QUERY_KEYS.preferences, newPreferences);

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      return { previousPreferences };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousPreferences) {
        queryClient.setQueryData(
          NOTIFICATION_QUERY_KEYS.preferences, 
          context.previousPreferences
        );
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.preferences });
    },
  });
}

/**
 * Hook to load quiet hours
 */
export function useQuietHours() {
  const store = useNotificationStore();

  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.quietHours,
    queryFn: async () => {
      const quietHours = await loadQuietHours();
      return quietHours;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    initialData: store.quietHours,
  });
}

/**
 * Hook to update quiet hours
 */
export function useUpdateQuietHours() {
  const queryClient = useQueryClient();
  const store = useNotificationStore();

  return useMutation({
    mutationFn: async (updates: Partial<QuietHours>) => {
      const currentQuietHours = store.quietHours;
      const newQuietHours = { ...currentQuietHours, ...updates };

      // Save locally
      await saveQuietHours(newQuietHours);

      // Sync to server
      if (MOCK_MODE) {
        await mockSyncQuietHours(newQuietHours);
      } else {
        const response = await fetch('/api/user/quiet-hours', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quietHours: newQuietHours }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update quiet hours');
        }
      }

      return newQuietHours;
    },
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATION_QUERY_KEYS.quietHours });

      const previousQuietHours = queryClient.getQueryData<QuietHours>(
        NOTIFICATION_QUERY_KEYS.quietHours
      );

      const newQuietHours = { ...store.quietHours, ...updates };
      queryClient.setQueryData(NOTIFICATION_QUERY_KEYS.quietHours, newQuietHours);

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      return { previousQuietHours };
    },
    onError: (error, variables, context) => {
      if (context?.previousQuietHours) {
        queryClient.setQueryData(
          NOTIFICATION_QUERY_KEYS.quietHours, 
          context.previousQuietHours
        );
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
    onSuccess: (newQuietHours) => {
      store.updateQuietHours(newQuietHours);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.quietHours });
    },
  });
}

/**
 * Hook to register push token
 */
export function useRegisterPushToken() {
  const store = useNotificationStore();

  return useMutation({
    mutationFn: async () => {
      const token = await registerForPushNotifications();
      
      if (!token) {
        throw new Error('Failed to get push token');
      }

      // Sync to server
      if (MOCK_MODE) {
        await mockRegisterPushToken(token);
      } else {
        const response = await fetch('/api/user/push-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, platform: 'ios' }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to register push token');
        }
      }

      return token;
    },
    onSuccess: (token) => {
      store.setPushToken(token);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });
}

/**
 * Hook to sync all preferences to server
 */
export function useSyncPreferences() {
  const store = useNotificationStore();

  return useMutation({
    mutationFn: async () => {
      await store.syncPreferences();
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });
}


