import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton, Card } from '@/components/primitives';
import { AppLogo } from '@/components';
import { colors, spacing } from '@/lib/theme';
import { verticalScale, moderateScale } from '@/lib/utils/responsive';

const RISK_LABELS: Record<string, string> = {
  safe: 'Safe',
  balanced: 'Balanced',
  aggressive: 'Aggressive',
  custom: 'Custom',
};

export default function ActivateProtocolScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ risk?: string; riskPercent?: string }>();
  const [isActivating, setIsActivating] = useState(false);
  const [activationProgress, setActivationProgress] = useState(0);

  const riskLevel = params.risk || 'balanced';
  const riskPercent = params.riskPercent ? parseInt(params.riskPercent) : null;

  const handleActivate = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsActivating(true);

    const progressInterval = setInterval(() => {
      setActivationProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 4;
      });
    }, 100);

    await new Promise(resolve => setTimeout(resolve, 2500));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/(risk)/success');
  };

  if (isActivating) {
    return (
      <Screen safeArea style={styles.container}>
        <View style={styles.activatingContent}>
          {/* Animated ring */}
          <MotiView
            from={{ rotate: '0deg' }}
            animate={{ rotate: '360deg' }}
            transition={{ type: 'timing', duration: 2000, loop: true }}
            style={styles.ringContainer}
          >
            <View style={styles.activatingRing} />
          </MotiView>

          <NeonText variant="h3" color="primary" align="center" style={styles.activatingTitle}>
            ACTIVATING
          </NeonText>
          
          <NeonText variant="body" color="muted" align="center">
            Initializing AI Trading Bot
          </NeonText>

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBg}>
              <MotiView
                animate={{ width: `${activationProgress}%` }}
                transition={{ type: 'timing', duration: 100 }}
                style={styles.progressFill}
              />
            </View>
            <NeonText variant="caption" color="primary">
              {activationProgress}%
            </NeonText>
          </View>

          {/* Status messages */}
          <View style={styles.statusMessages}>
            {activationProgress >= 20 && (
              <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <NeonText variant="caption" color="muted">✓ Connecting to broker</NeonText>
              </MotiView>
            )}
            {activationProgress >= 50 && (
              <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <NeonText variant="caption" color="muted">✓ Configuring risk</NeonText>
              </MotiView>
            )}
            {activationProgress >= 80 && (
              <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <NeonText variant="caption" color="muted">✓ Starting AI engine</NeonText>
              </MotiView>
            )}
          </View>
        </View>
      </Screen>
    );
  }

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
          <View style={styles.logoCircle}>
            <AppLogo size={56} />
          </View>
        </MotiView>

        {/* Title */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200 }}
        >
          <NeonText variant="h2" color="white" align="center">
            Activate the Protocol
          </NeonText>
        </MotiView>

        {/* Risk badge */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 300 }}
          style={styles.riskBadge}
        >
          <NeonText variant="caption" color="muted">Risk Level: </NeonText>
          <NeonText variant="caption" color="primary">
            {RISK_LABELS[riskLevel] || 'Balanced'}
            {riskPercent && ` (${riskPercent}%)`}
          </NeonText>
        </MotiView>

        {/* Guarantee card */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 400 }}
        >
          <Card variant="default" padding="md" style={styles.guaranteeCard}>
            <View style={styles.guaranteeIcon}>
              <NeonText variant="h4">🛡️</NeonText>
            </View>
            <View style={styles.guaranteeText}>
              <NeonText variant="h4" color="white">48-Hour Guarantee</NeonText>
              <NeonText variant="caption" color="muted">
                See results in 48h or your first month is free
              </NeonText>
            </View>
          </Card>
        </MotiView>
      </View>

      {/* Activate button */}
      <View style={styles.actions}>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 500 }}
        >
          <NeonButton onPress={handleActivate} size="lg">
            🚀 ACTIVATE
          </NeonButton>
        </MotiView>
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
    paddingHorizontal: spacing[4],
  },
  iconContainer: {
    marginBottom: spacing[6],
  },
  logoCircle: {
    width: moderateScale(120),
    height: moderateScale(120),
    borderRadius: moderateScale(60),
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary[800],
  },
  logoEmoji: {
    fontSize: moderateScale(56),
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[3],
    marginBottom: spacing[6],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.neutral[100],
    borderRadius: 20,
  },
  guaranteeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    maxWidth: 320,
  },
  guaranteeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[900],
    alignItems: 'center',
    justifyContent: 'center',
  },
  guaranteeText: {
    flex: 1,
    gap: 2,
  },
  actions: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[6],
  },
  // Activating state
  activatingContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
  },
  ringContainer: {
    marginBottom: spacing[6],
  },
  activatingRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'transparent',
    borderTopColor: colors.primary.DEFAULT,
    borderRightColor: colors.primary.DEFAULT,
  },
  activatingTitle: {
    marginBottom: spacing[2],
  },
  progressContainer: {
    width: '100%',
    maxWidth: 280,
    alignItems: 'center',
    marginTop: spacing[6],
    marginBottom: spacing[4],
  },
  progressBg: {
    width: '100%',
    height: 6,
    backgroundColor: colors.neutral[200],
    borderRadius: 3,
    marginBottom: spacing[2],
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: 3,
  },
  statusMessages: {
    alignItems: 'center',
    gap: spacing[2],
  },
});

