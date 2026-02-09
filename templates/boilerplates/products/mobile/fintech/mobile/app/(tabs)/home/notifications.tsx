import React, { useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';

interface Notification {
  id: string;
  type: 'trade' | 'promo' | 'info' | 'alert';
  title: string;
  message: string;
  time: Date;
  isRead: boolean;
}

const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'trade',
    title: '+$12.31 earned',
    message: 'EUR/USD trade closed with profit',
    time: new Date(Date.now() - 5 * 60 * 1000),
    isRead: false,
  },
  {
    id: '2',
    type: 'promo',
    title: 'Upgrade to Pro',
    message: 'Get 4x trading cycles and priority support',
    time: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isRead: false,
  },
  {
    id: '3',
    type: 'info',
    title: 'Weekly Summary Ready',
    message: 'View your trading performance for this week',
    time: new Date(Date.now() - 24 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: '4',
    type: 'trade',
    title: '+$7.14 earned overnight',
    message: 'GBP/JPY position closed automatically',
    time: new Date(Date.now() - 8 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: '5',
    type: 'alert',
    title: 'Market Update',
    message: 'AI detected high volatility - adjusting risk parameters',
    time: new Date(Date.now() - 12 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: '6',
    type: 'info',
    title: 'New Feature Available',
    message: 'Custom risk settings are now available in Settings',
    time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    isRead: true,
  },
];

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function getNotificationIcon(type: Notification['type']): string {
  switch (type) {
    case 'trade': return '💰';
    case 'promo': return '⭐';
    case 'info': return '📊';
    case 'alert': return '⚠️';
  }
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleNotificationPress = (notification: Notification) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Mark as read
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
    );
    
    // Navigate based on type
    if (notification.type === 'trade') {
      // Could navigate to activity detail
      console.log('Navigate to trade');
    } else if (notification.type === 'promo') {
      // Could navigate to subscription
      console.log('Navigate to subscription');
    }
  };

  const handleClearAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Screen safeArea style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <NeonText variant="body" color="primary">
            ← Back
          </NeonText>
        </Pressable>
        <NeonText variant="h3" style={styles.headerTitle}>
          Notifications
        </NeonText>
        {unreadCount > 0 ? (
          <Pressable onPress={handleClearAll} style={styles.clearButton}>
            <NeonText variant="label" color="primary">
              Mark all read
            </NeonText>
          </Pressable>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <NeonText variant="h4" color="muted">
              No notifications
            </NeonText>
            <NeonText variant="body" color="muted">
              You're all caught up!
            </NeonText>
          </View>
        ) : (
          <View style={styles.notificationsList}>
            {notifications.map((notification, index) => (
              <MotiView
                key={notification.id}
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'timing', delay: index * 50 }}
              >
                <Pressable 
                  style={[
                    styles.notificationRow,
                    !notification.isRead && styles.notificationUnread
                  ]}
                  onPress={() => handleNotificationPress(notification)}
                >
                  <View style={styles.notificationIcon}>
                    <NeonText variant="h4">
                      {getNotificationIcon(notification.type)}
                    </NeonText>
                  </View>
                  <View style={styles.notificationContent}>
                    <View style={styles.notificationHeader}>
                      <NeonText 
                        variant="body" 
                        color={!notification.isRead ? 'white' : 'muted'}
                        style={styles.notificationTitle}
                      >
                        {notification.title}
                      </NeonText>
                      <NeonText variant="label" color="muted">
                        {getTimeAgo(notification.time)}
                      </NeonText>
                    </View>
                    <NeonText 
                      variant="label" 
                      color="muted"
                      style={styles.notificationMessage}
                    >
                      {notification.message}
                    </NeonText>
                  </View>
                  {!notification.isRead && (
                    <View style={styles.unreadDot} />
                  )}
                </Pressable>
              </MotiView>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[0],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  backButton: {
    paddingVertical: spacing[2],
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  clearButton: {
    paddingVertical: spacing[2],
  },
  headerSpacer: {
    width: 80,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[6],
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing[20],
    gap: spacing[2],
  },
  notificationsList: {
    gap: spacing[2],
    paddingTop: spacing[2],
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    padding: spacing[3],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    gap: spacing[3],
  },
  notificationUnread: {
    backgroundColor: colors.neutral[100],
    borderColor: colors.primary[700],
    ...Platform.select({
      ios: {
        shadowColor: colors.primary.DEFAULT,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      web: {
        boxShadow: `0 0 10px ${colors.glow}`,
      },
      android: {},
    }),
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
    gap: spacing[1],
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationTitle: {
    fontWeight: '600',
    flex: 1,
  },
  notificationMessage: {
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary.DEFAULT,
    marginTop: spacing[1],
  },
});

