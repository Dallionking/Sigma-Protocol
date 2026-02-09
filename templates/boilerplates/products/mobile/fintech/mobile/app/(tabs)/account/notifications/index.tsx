import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Switch, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton, Card, ListRow } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';
import { useNotificationStore } from '@/lib/stores/notification-store';
import { 
  useNotificationPermission, 
  useQuietHours,
} from '@/lib/hooks/use-notifications';
import { NOTIFICATION_TYPES, NotificationPreferences } from '@/lib/types/notifications';

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const { data: permissionStatus, refetch: refetchPermission } = useNotificationPermission();
  const { data: quietHours } = useQuietHours();
  const preferences = useNotificationStore(state => state.preferences);
  const updatePreference = useNotificationStore(state => state.updatePreference);

  // Refetch permission on focus (when returning from Settings app)
  useEffect(() => {
    const unsubscribe = router.canGoBack;
    refetchPermission();
  }, []);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleToggle = async (key: keyof NotificationPreferences, value: boolean) => {
    try {
      await updatePreference(key, value);
    } catch (error) {
      console.error('Failed to update preference:', error);
    }
  };

  const handleQuietHours = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/account/notifications/quiet-hours');
  };

  const handleOpenSettings = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await Linking.openSettings();
  };

  // Format quiet hours display
  const formatQuietHours = () => {
    if (!quietHours?.enabled) {
      return 'Off';
    }
    
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':');
      const h = parseInt(hours);
      const period = h >= 12 ? 'PM' : 'AM';
      const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
      return `${displayHour}:${minutes} ${period}`;
    };
    
    return `${formatTime(quietHours.startTime)} – ${formatTime(quietHours.endTime)}`;
  };

  // Get trading notifications (income events, trade alerts)
  const tradingTypes = NOTIFICATION_TYPES.filter(t => 
    t.id === 'incomeEvents' || t.id === 'tradeAlerts'
  );
  
  // Get summary notifications (daily summary, milestones)
  const summaryTypes = NOTIFICATION_TYPES.filter(t => 
    t.id === 'dailySummary' || t.id === 'milestones'
  );
  
  // Get market notifications
  const marketTypes = NOTIFICATION_TYPES.filter(t => 
    t.id === 'marketNews'
  );

  // If permission denied, redirect to help screen
  if (permissionStatus === 'denied') {
    return (
      <Screen safeArea style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <MotiView
            from={{ opacity: 0, translateY: -10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 300 }}
            style={styles.header}
          >
            <Pressable onPress={handleBack} style={styles.backButton}>
              <NeonText variant="body" color="muted">‹ Back</NeonText>
            </Pressable>
            <NeonText variant="h2" color="white">Notifications</NeonText>
          </MotiView>

          {/* Permission Denied Card */}
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', delay: 100 }}
            style={styles.permissionDeniedSection}
          >
            <View style={styles.deniedIconContainer}>
              <MotiView
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ 
                  type: 'timing', 
                  duration: 2000, 
                  loop: true 
                }}
              >
                <NeonText variant="display" style={styles.deniedIcon}>🔕</NeonText>
              </MotiView>
            </View>
            
            <NeonText variant="h3" color="white" align="center" style={styles.deniedTitle}>
              Notifications Disabled
            </NeonText>
            
            <NeonText variant="body" color="muted" align="center" style={styles.deniedDescription}>
              Push notifications are currently turned off in your device settings.
            </NeonText>
            
            <Card variant="default" padding="md" style={styles.stepsCard}>
              <NeonText variant="label" color="muted" style={styles.stepsTitle}>
                To enable notifications:
              </NeonText>
              <View style={styles.stepsList}>
                <NeonText variant="body" color="white">1. Tap "Open Settings" below</NeonText>
                <NeonText variant="body" color="white">2. Find "Notifications"</NeonText>
                <NeonText variant="body" color="white">3. Toggle "Allow Notifications"</NeonText>
                <NeonText variant="body" color="white">4. Return to Trading Platform</NeonText>
              </View>
            </Card>

            <NeonButton onPress={handleOpenSettings} style={styles.settingsButton}>
              Open iOS Settings
            </NeonButton>
            
            <NeonText variant="caption" color="muted" align="center" style={styles.helpNote}>
              You can always change this later in your device settings.
            </NeonText>
          </MotiView>
        </ScrollView>
      </Screen>
    );
  }

  return (
    <Screen safeArea style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 300 }}
          style={styles.header}
        >
          <Pressable onPress={handleBack} style={styles.backButton}>
            <NeonText variant="body" color="muted">‹ Back</NeonText>
          </Pressable>
          <NeonText variant="h2" color="white">Notifications</NeonText>
          <NeonText variant="caption" color="muted" style={styles.subtitle}>
            Choose what updates you want to receive
          </NeonText>
        </MotiView>

        {/* Trading Section */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 100, duration: 400 }}
        >
          <View style={styles.sectionHeader}>
            <NeonText variant="label" color="muted" style={styles.sectionTitle}>
              Trading
            </NeonText>
            <View style={styles.sectionUnderline} />
          </View>
          <Card variant="default" padding="none">
            {tradingTypes.map((type, index) => (
              <ToggleRow
                key={type.id}
                icon={type.icon}
                title={type.label}
                subtitle={type.description}
                value={preferences[type.id]}
                onToggle={(value) => handleToggle(type.id, value)}
                divider={index < tradingTypes.length - 1}
              />
            ))}
          </Card>
        </MotiView>

        {/* Summaries Section */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 150, duration: 400 }}
        >
          <View style={styles.sectionHeader}>
            <NeonText variant="label" color="muted" style={styles.sectionTitle}>
              Summaries
            </NeonText>
            <View style={styles.sectionUnderline} />
          </View>
          <Card variant="default" padding="none">
            {summaryTypes.map((type, index) => (
              <ToggleRow
                key={type.id}
                icon={type.icon}
                title={type.label}
                subtitle={type.description}
                value={preferences[type.id]}
                onToggle={(value) => handleToggle(type.id, value)}
                divider={index < summaryTypes.length - 1}
              />
            ))}
          </Card>
        </MotiView>

        {/* Market Section */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200, duration: 400 }}
        >
          <View style={styles.sectionHeader}>
            <NeonText variant="label" color="muted" style={styles.sectionTitle}>
              Market
            </NeonText>
            <View style={styles.sectionUnderline} />
          </View>
          <Card variant="default" padding="none">
            {marketTypes.map((type, index) => (
              <ToggleRow
                key={type.id}
                icon={type.icon}
                title={type.label}
                subtitle={type.description}
                value={preferences[type.id]}
                onToggle={(value) => handleToggle(type.id, value)}
                divider={index < marketTypes.length - 1}
              />
            ))}
          </Card>
        </MotiView>

        {/* Schedule Section */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 250, duration: 400 }}
        >
          <View style={styles.sectionHeader}>
            <NeonText variant="label" color="muted" style={styles.sectionTitle}>
              Schedule
            </NeonText>
            <View style={styles.sectionUnderline} />
          </View>
          <Card variant="default" padding="none">
            <ListRow
              icon="🌙"
              title="Quiet Hours"
              subtitle={formatQuietHours()}
              showArrow
              divider={false}
              onPress={handleQuietHours}
            />
          </Card>
        </MotiView>

        {/* System Settings */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 300, duration: 400 }}
          style={styles.systemSection}
        >
          <Card variant="default" padding="md" style={styles.systemCard}>
            <View style={styles.systemContent}>
              <NeonText variant="body" color="muted" style={styles.systemText}>
                ℹ️ To disable all notifications, use your device settings.
              </NeonText>
              <NeonButton size="sm" variant="outline" onPress={handleOpenSettings}>
                Open iOS Settings
              </NeonButton>
            </View>
          </Card>
        </MotiView>
      </ScrollView>
    </Screen>
  );
}

// Toggle Row Component
function ToggleRow({ 
  icon,
  title, 
  subtitle, 
  value, 
  onToggle, 
  divider = true 
}: { 
  icon: string;
  title: string; 
  subtitle: string; 
  value: boolean; 
  onToggle: (value: boolean) => void;
  divider?: boolean;
}) {
  return (
    <View style={[styles.toggleRow, divider && styles.toggleRowBorder]}>
      <View style={styles.toggleIcon}>
        <NeonText variant="body">{icon}</NeonText>
      </View>
      <View style={styles.toggleInfo}>
        <NeonText variant="body" color="white" style={styles.toggleTitle}>{title}</NeonText>
        <NeonText variant="caption" color="muted">{subtitle}</NeonText>
      </View>
      <MotiView
        animate={{ scale: value ? 1.05 : 1 }}
        transition={{ type: 'spring', damping: 15 }}
      >
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: colors.neutral[300], true: colors.primary[700] }}
          thumbColor={value ? colors.primary.DEFAULT : colors.neutral[500]}
        />
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[0],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing[4],
    paddingBottom: layout.tabBarHeight + spacing[4],
  },
  header: {
    paddingVertical: spacing[2],
    gap: spacing[1],
  },
  backButton: {
    paddingVertical: spacing[2],
    alignSelf: 'flex-start',
  },
  subtitle: {
    marginTop: spacing[1],
  },
  sectionHeader: {
    marginTop: spacing[5],
    marginBottom: spacing[3],
  },
  sectionTitle: {
    marginLeft: spacing[1],
    marginBottom: spacing[2],
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  sectionUnderline: {
    height: 2,
    backgroundColor: colors.primary[500],
    width: 40,
    marginLeft: spacing[1],
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  toggleRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  toggleIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  toggleInfo: {
    flex: 1,
    gap: 2,
    marginRight: spacing[3],
  },
  toggleTitle: {
    fontWeight: '600',
  },
  systemSection: {
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  systemCard: {
    borderLeftWidth: 3,
    borderLeftColor: colors.neutral[400],
  },
  systemContent: {
    alignItems: 'center',
    gap: spacing[3],
  },
  systemText: {
    textAlign: 'center',
    lineHeight: 20,
  },
  // Permission Denied Styles
  permissionDeniedSection: {
    alignItems: 'center',
    paddingTop: spacing[6],
  },
  deniedIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
    borderWidth: 2,
    borderColor: colors.error,
  },
  deniedIcon: {
    fontSize: 48,
  },
  deniedTitle: {
    marginBottom: spacing[2],
  },
  deniedDescription: {
    marginBottom: spacing[4],
    maxWidth: 280,
    lineHeight: 22,
  },
  stepsCard: {
    width: '100%',
    marginBottom: spacing[4],
  },
  stepsTitle: {
    marginBottom: spacing[3],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  stepsList: {
    gap: spacing[2],
  },
  settingsButton: {
    width: '100%',
  },
  helpNote: {
    marginTop: spacing[4],
    maxWidth: 280,
  },
});


