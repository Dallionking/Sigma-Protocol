/**
 * Notification Store (Zustand)
 * 
 * Centralized state management for notification preferences and settings.
 */

import { create } from 'zustand';
import * as Haptics from 'expo-haptics';
import {
  NotificationState,
  NotificationPreferences,
  QuietHours,
  PermissionStatus,
} from '@/lib/types/notifications';
import {
  savePreferences,
  loadPreferences,
  saveQuietHours,
  loadQuietHours,
  getPermissionStatus,
  registerForPushNotifications,
  getStoredPushToken,
  mockSyncPreferences,
  mockSyncQuietHours,
  DEFAULT_PREFERENCES,
  DEFAULT_QUIET_HOURS,
  MOCK_MODE,
} from '@/lib/utils/push-notifications';

export const useNotificationStore = create<NotificationState>((set, get) => ({
  // Initial state
  permissionStatus: 'undetermined',
  pushToken: null,
  preferences: DEFAULT_PREFERENCES,
  quietHours: DEFAULT_QUIET_HOURS,
  isLoading: false,
  error: null,

  // Set permission status
  setPermissionStatus: (status) => {
    set({ permissionStatus: status });
  },

  // Set push token
  setPushToken: (token) => {
    set({ pushToken: token });
  },

  // Update a single preference
  updatePreference: async (key, value) => {
    const { preferences } = get();
    
    try {
      set({ isLoading: true, error: null });

      // Optimistic update
      const newPreferences = { ...preferences, [key]: value };
      set({ preferences: newPreferences });

      // Save locally
      await savePreferences(newPreferences);

      // Sync to server
      if (MOCK_MODE) {
        await mockSyncPreferences(newPreferences);
      } else {
        // Real API call
        const response = await fetch('/api/user/notification-preferences', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ preferences: newPreferences }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to sync preferences');
        }
      }

      set({ isLoading: false });

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error: any) {
      // Revert optimistic update
      set({ 
        preferences,
        error: error.message || 'Failed to update preference',
        isLoading: false,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      throw error;
    }
  },

  // Update quiet hours
  updateQuietHours: async (updates) => {
    const { quietHours } = get();
    
    try {
      set({ isLoading: true, error: null });

      // Merge updates
      const newQuietHours = { ...quietHours, ...updates };
      set({ quietHours: newQuietHours });

      // Save locally
      await saveQuietHours(newQuietHours);

      // Sync to server
      if (MOCK_MODE) {
        await mockSyncQuietHours(newQuietHours);
      } else {
        // Real API call
        const response = await fetch('/api/user/quiet-hours', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quietHours: newQuietHours }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to sync quiet hours');
        }
      }

      set({ isLoading: false });

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error: any) {
      // Revert optimistic update
      set({ 
        quietHours,
        error: error.message || 'Failed to update quiet hours',
        isLoading: false,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      throw error;
    }
  },

  // Sync all preferences to server
  syncPreferences: async () => {
    const { preferences, quietHours } = get();
    
    try {
      set({ isLoading: true, error: null });

      if (MOCK_MODE) {
        await mockSyncPreferences(preferences);
        await mockSyncQuietHours(quietHours);
      } else {
        // Real API calls
        await Promise.all([
          fetch('/api/user/notification-preferences', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ preferences }),
          }),
          fetch('/api/user/quiet-hours', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quietHours }),
          }),
        ]);
      }

      set({ isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to sync preferences',
        isLoading: false,
      });
      throw error;
    }
  },

  // Load preferences from local storage
  loadPreferences: async () => {
    try {
      set({ isLoading: true, error: null });

      // Load from local storage
      const [preferences, quietHours, permissionStatus, pushToken] = await Promise.all([
        loadPreferences(),
        loadQuietHours(),
        getPermissionStatus(),
        getStoredPushToken(),
      ]);

      set({
        preferences,
        quietHours,
        permissionStatus,
        pushToken,
        isLoading: false,
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to load preferences',
        isLoading: false,
      });
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

// Initialize store on creation
(async () => {
  try {
    const [preferences, quietHours, permissionStatus, pushToken] = await Promise.all([
      loadPreferences(),
      loadQuietHours(),
      getPermissionStatus(),
      getStoredPushToken(),
    ]);

    useNotificationStore.setState({
      preferences,
      quietHours,
      permissionStatus,
      pushToken,
    });
  } catch (error) {
    console.error('Error initializing notification store:', error);
  }
})();


