/**
 * Notification Types
 * 
 * Core interfaces for notification preferences, quiet hours, and push notifications.
 */

export type NotificationType = 
  | 'income_events'
  | 'trade_alerts'
  | 'daily_summary'
  | 'milestones'
  | 'market_news';

export type PermissionStatus = 'undetermined' | 'granted' | 'denied';

export interface NotificationPreferences {
  incomeEvents: boolean;
  tradeAlerts: boolean;
  dailySummary: boolean;
  milestones: boolean;
  marketNews: boolean;
}

export interface QuietHours {
  enabled: boolean;
  startTime: string; // "22:00" format
  endTime: string;   // "07:00" format
}

export interface NotificationState {
  // Permission
  permissionStatus: PermissionStatus;
  pushToken: string | null;
  
  // Preferences
  preferences: NotificationPreferences;
  quietHours: QuietHours;
  
  // Loading
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setPermissionStatus: (status: PermissionStatus) => void;
  setPushToken: (token: string | null) => void;
  updatePreference: (key: keyof NotificationPreferences, value: boolean) => Promise<void>;
  updateQuietHours: (quietHours: Partial<QuietHours>) => Promise<void>;
  syncPreferences: () => Promise<void>;
  loadPreferences: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetError: () => void;
}

// Push notification payloads
export interface IncomeEventPayload {
  type: 'income_events';
  amount: number;
  ticker: string;
  tradeType: string;
  tradeId: string;
}

export interface TradeAlertPayload {
  type: 'trade_alerts';
  action: 'buy' | 'sell' | 'open' | 'close';
  ticker: string;
  quantity: number;
  strike?: number;
  premium?: number;
  tradeId: string;
}

export interface DailySummaryPayload {
  type: 'daily_summary';
  pnl: number;
  tradesCount: number;
  date: string;
}

export interface MilestonePayload {
  type: 'milestones';
  milestoneId: string;
  title: string;
  reward: string;
}

export interface MarketNewsPayload {
  type: 'market_news';
  headline: string;
  source: string;
  url?: string;
  ticker?: string;
}

export type PushNotificationPayload = 
  | IncomeEventPayload
  | TradeAlertPayload
  | DailySummaryPayload
  | MilestonePayload
  | MarketNewsPayload;

export interface PushNotification {
  type: NotificationType;
  title: string;
  body: string;
  data: PushNotificationPayload;
}

// API request/response types
export interface PreferencesUpdateRequest {
  preferences: Partial<NotificationPreferences>;
}

export interface PreferencesUpdateResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface QuietHoursUpdateRequest {
  quietHours: QuietHours;
}

export interface QuietHoursUpdateResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface PushTokenRequest {
  token: string;
  platform: 'ios' | 'android';
}

export interface PushTokenResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// Notification settings display info
export interface NotificationTypeInfo {
  id: keyof NotificationPreferences;
  label: string;
  description: string;
  icon: string;
  defaultEnabled: boolean;
}

export const NOTIFICATION_TYPES: NotificationTypeInfo[] = [
  {
    id: 'incomeEvents',
    label: 'Income Events',
    description: 'When trades complete and income is earned',
    icon: '📈',
    defaultEnabled: true,
  },
  {
    id: 'tradeAlerts',
    label: 'Trade Alerts',
    description: 'When AI opens or closes positions',
    icon: '🔄',
    defaultEnabled: true,
  },
  {
    id: 'dailySummary',
    label: 'Daily Summary',
    description: 'End of day performance recap',
    icon: '📊',
    defaultEnabled: false,
  },
  {
    id: 'milestones',
    label: 'Milestones',
    description: 'Achievement and earnings milestones',
    icon: '🏆',
    defaultEnabled: true,
  },
  {
    id: 'marketNews',
    label: 'Market News',
    description: 'Major market events and news',
    icon: '📰',
    defaultEnabled: false,
  },
];


