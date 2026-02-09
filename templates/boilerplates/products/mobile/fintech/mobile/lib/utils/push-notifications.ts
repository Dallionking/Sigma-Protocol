/**
 * Push Notification Utilities
 * 
 * Handles push token registration, permission requests, and notification configuration.
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  PermissionStatus, 
  NotificationPreferences, 
  QuietHours,
  PushNotificationPayload,
} from '@/lib/types/notifications';

// Storage keys
const STORAGE_KEYS = {
  PREFERENCES: 'notification_preferences',
  QUIET_HOURS: 'notification_quiet_hours',
  PUSH_TOKEN: 'push_token',
} as const;

// Default values
export const DEFAULT_PREFERENCES: NotificationPreferences = {
  incomeEvents: true,
  tradeAlerts: true,
  dailySummary: false,
  milestones: true,
  marketNews: false,
};

export const DEFAULT_QUIET_HOURS: QuietHours = {
  enabled: false,
  startTime: '22:00',
  endTime: '07:00',
};

// Mock mode for development
export const MOCK_MODE = __DEV__ || process.env.EXPO_PUBLIC_MOCK_MODE === 'true';

/**
 * Configure notification handler for foreground notifications
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Check current permission status
 */
export async function getPermissionStatus(): Promise<PermissionStatus> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    
    switch (status) {
      case 'granted':
        return 'granted';
      case 'denied':
        return 'denied';
      default:
        return 'undetermined';
    }
  } catch (error) {
    console.error('Error checking notification permission:', error);
    return 'undetermined';
  }
}

/**
 * Request notification permission
 */
export async function requestPermission(): Promise<PermissionStatus> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    
    switch (status) {
      case 'granted':
        return 'granted';
      case 'denied':
        return 'denied';
      default:
        return 'undetermined';
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
}

/**
 * Register for push notifications and get token
 */
export async function registerForPushNotifications(): Promise<string | null> {
  // Physical device required
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  // Check permission
  const status = await getPermissionStatus();
  if (status !== 'granted') {
    console.log('Push notification permission not granted');
    return null;
  }

  try {
    // Get Expo push token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    
    if (!projectId && !MOCK_MODE) {
      console.warn('EAS project ID not found');
    }

    const tokenResponse = await Notifications.getExpoPushTokenAsync({
      projectId: projectId || 'mock-project-id',
    });

    const token = tokenResponse.data;
    
    // Save token locally
    await AsyncStorage.setItem(STORAGE_KEYS.PUSH_TOKEN, token);

    // Configure Android channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6366F1',
      });
    }

    return token;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
}

/**
 * Get stored push token
 */
export async function getStoredPushToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.PUSH_TOKEN);
  } catch (error) {
    console.error('Error getting stored push token:', error);
    return null;
  }
}

/**
 * Clear push token
 */
export async function clearPushToken(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.PUSH_TOKEN);
  } catch (error) {
    console.error('Error clearing push token:', error);
  }
}

/**
 * Save notification preferences to local storage
 */
export async function savePreferences(preferences: NotificationPreferences): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.PREFERENCES, 
      JSON.stringify(preferences)
    );
  } catch (error) {
    console.error('Error saving notification preferences:', error);
    throw error;
  }
}

/**
 * Load notification preferences from local storage
 */
export async function loadPreferences(): Promise<NotificationPreferences> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (stored) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
    }
    return DEFAULT_PREFERENCES;
  } catch (error) {
    console.error('Error loading notification preferences:', error);
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Save quiet hours to local storage
 */
export async function saveQuietHours(quietHours: QuietHours): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.QUIET_HOURS, 
      JSON.stringify(quietHours)
    );
  } catch (error) {
    console.error('Error saving quiet hours:', error);
    throw error;
  }
}

/**
 * Load quiet hours from local storage
 */
export async function loadQuietHours(): Promise<QuietHours> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.QUIET_HOURS);
    if (stored) {
      return { ...DEFAULT_QUIET_HOURS, ...JSON.parse(stored) };
    }
    return DEFAULT_QUIET_HOURS;
  } catch (error) {
    console.error('Error loading quiet hours:', error);
    return DEFAULT_QUIET_HOURS;
  }
}

/**
 * Clear all notification data
 */
export async function clearNotificationData(): Promise<void> {
  try {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.PREFERENCES),
      AsyncStorage.removeItem(STORAGE_KEYS.QUIET_HOURS),
      AsyncStorage.removeItem(STORAGE_KEYS.PUSH_TOKEN),
    ]);
  } catch (error) {
    console.error('Error clearing notification data:', error);
  }
}

/**
 * Schedule a local notification (for testing)
 */
export async function scheduleTestNotification(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Test Notification 🔔',
      body: 'This is a test notification from Trading Platform',
      data: { type: 'test' },
    },
    trigger: { seconds: 2 },
  });
}

/**
 * Handle incoming notification
 */
export function parseNotificationPayload(
  notification: Notifications.Notification
): PushNotificationPayload | null {
  try {
    const data = notification.request.content.data as PushNotificationPayload;
    return data;
  } catch (error) {
    console.error('Error parsing notification payload:', error);
    return null;
  }
}

/**
 * Add notification received listener
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Add notification response listener (when user taps notification)
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Get badge count
 */
export async function getBadgeCount(): Promise<number> {
  try {
    return await Notifications.getBadgeCountAsync();
  } catch (error) {
    return 0;
  }
}

/**
 * Set badge count
 */
export async function setBadgeCount(count: number): Promise<void> {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.error('Error setting badge count:', error);
  }
}

/**
 * Clear all notifications
 */
export async function clearAllNotifications(): Promise<void> {
  try {
    await Notifications.dismissAllNotificationsAsync();
    await setBadgeCount(0);
  } catch (error) {
    console.error('Error clearing notifications:', error);
  }
}

// Mock functions for development
export async function mockSyncPreferences(
  preferences: NotificationPreferences
): Promise<{ success: boolean }> {
  await new Promise(resolve => setTimeout(resolve, 300));
  console.log('Mock: Syncing preferences to server', preferences);
  return { success: true };
}

export async function mockSyncQuietHours(
  quietHours: QuietHours
): Promise<{ success: boolean }> {
  await new Promise(resolve => setTimeout(resolve, 300));
  console.log('Mock: Syncing quiet hours to server', quietHours);
  return { success: true };
}

export async function mockRegisterPushToken(
  token: string
): Promise<{ success: boolean }> {
  await new Promise(resolve => setTimeout(resolve, 300));
  console.log('Mock: Registering push token', token);
  return { success: true };
}


