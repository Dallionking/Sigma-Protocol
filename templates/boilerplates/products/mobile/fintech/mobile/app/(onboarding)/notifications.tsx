import React from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton, Card } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';
import { verticalScale, moderateScale } from '@/lib/utils/responsive';

export default function NotificationsScreen() {
  const router = useRouter();

  const handleEnable = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      console.log('Notification permission status:', status);
    } catch (error) {
      console.log('Notification permission error:', error);
    }
    
    // Always proceed for demo
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push('/(onboarding)/biometric');
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(onboarding)/biometric');
  };

  return (
    <Screen safeArea padded={false} style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <View style={styles.content}>
          {/* Icon */}
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', delay: 100 }}
            style={styles.iconContainer}
          >
            <View style={styles.iconCircle}>
              <NeonText variant="display" style={styles.iconEmoji}>🔔</NeonText>
            </View>
          </MotiView>

          {/* Title */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', delay: 200 }}
          >
            <NeonText variant="h2" color="white" align="center">
              Stay Informed
            </NeonText>
          </MotiView>

          {/* Description */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', delay: 300 }}
          >
            <NeonText variant="body" color="muted" align="center" style={styles.description}>
              Get notified when trades execute and when your AI bot spots opportunities.
            </NeonText>
          </MotiView>

          {/* Benefits Card */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', delay: 400 }}
          >
            <Card variant="default" padding="md" style={styles.benefitsCard}>
              <View style={styles.benefitRow}>
                <View style={styles.benefitIcon}>
                  <NeonText variant="body" color="primary">📈</NeonText>
                </View>
                <View style={styles.benefitText}>
                  <NeonText variant="body" color="white">Trade Alerts</NeonText>
                  <NeonText variant="caption" color="muted">Know when trades execute</NeonText>
                </View>
              </View>
              <View style={styles.benefitDivider} />
              <View style={styles.benefitRow}>
                <View style={styles.benefitIcon}>
                  <NeonText variant="body" color="primary">💰</NeonText>
                </View>
                <View style={styles.benefitText}>
                  <NeonText variant="body" color="white">Profit Updates</NeonText>
                  <NeonText variant="caption" color="muted">Daily P&L summaries</NeonText>
                </View>
              </View>
              <View style={styles.benefitDivider} />
              <View style={styles.benefitRow}>
                <View style={styles.benefitIcon}>
                  <NeonText variant="body" color="primary">⚠️</NeonText>
                </View>
                <View style={styles.benefitText}>
                  <NeonText variant="body" color="white">Risk Alerts</NeonText>
                  <NeonText variant="caption" color="muted">Important account updates</NeonText>
                </View>
              </View>
            </Card>
          </MotiView>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', delay: 500 }}
          >
            <NeonButton onPress={handleEnable}>
              Enable Notifications
            </NeonButton>
          </MotiView>
          
          <Pressable onPress={handleSkip} style={styles.skipLink}>
            <NeonText variant="body" color="muted">Skip for now</NeonText>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
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
    flexGrow: 1,
    paddingHorizontal: spacing[4],
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[6],
  },
  iconContainer: {
    marginBottom: spacing[4],
  },
  iconCircle: {
    width: moderateScale(90),
    height: moderateScale(90),
    borderRadius: moderateScale(45),
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  iconEmoji: {
    fontSize: moderateScale(42),
  },
  description: {
    marginTop: spacing[2],
    marginBottom: spacing[6],
    maxWidth: 300,
    lineHeight: 24,
  },
  benefitsCard: {
    width: '100%',
    maxWidth: 320,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[2],
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[900],
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    flex: 1,
    gap: 2,
  },
  benefitDivider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginVertical: spacing[2],
  },
  actions: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[6],
  },
  skipLink: {
    alignItems: 'center',
    paddingVertical: spacing[3],
    marginTop: spacing[2],
  },
});

