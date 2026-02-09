import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';

export default function PurchaseFailureScreen() {
  const router = useRouter();

  useEffect(() => {
    // Error haptic
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }, []);

  const handleRetry = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.back(); // Go back to paywall
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/(tabs)/account/subscription');
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.content}>
        {/* Error Icon */}
        <MotiView
          from={{ scale: 0, rotate: '180deg' }}
          animate={{ scale: 1, rotate: '0deg' }}
          transition={{ type: 'spring', damping: 12 }}
        >
          <View style={styles.iconContainer}>
            <NeonText variant="display" style={styles.errorIcon}>
              ⚠️
            </NeonText>
          </View>
        </MotiView>

        {/* Error Message */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200, duration: 400 }}
          style={styles.textContainer}
        >
          <NeonText variant="h2" color="white" style={styles.title}>
            Purchase Failed
          </NeonText>
          <NeonText variant="body" color="muted" style={styles.subtitle}>
            We couldn't process your payment. Please try again.
          </NeonText>
        </MotiView>

        {/* Possible Reasons */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 400, duration: 400 }}
          style={styles.reasonsContainer}
        >
          <NeonText variant="label" color="muted" style={styles.reasonsTitle}>
            Common issues:
          </NeonText>
          <View style={styles.reasonsList}>
            <NeonText variant="caption" color="muted">• Insufficient payment method balance</NeonText>
            <NeonText variant="caption" color="muted">• Network connection lost</NeonText>
            <NeonText variant="caption" color="muted">• Payment method needs verification</NeonText>
          </View>
        </MotiView>

        {/* Actions */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 600 }}
          style={styles.actionsContainer}
        >
          <NeonButton onPress={handleRetry}>
            Try Again
          </NeonButton>
          <NeonButton onPress={handleBack}>
            Back to Plans
          </NeonButton>
        </MotiView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[0],
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
  },
  iconContainer: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(255, 220, 0, 0.1)',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 220, 0, 0.3)',
  },
  errorIcon: {
    fontSize: 56,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: spacing[6],
    marginBottom: spacing[6],
  },
  title: {
    marginBottom: spacing[2],
  },
  subtitle: {
    textAlign: 'center',
  },
  reasonsContainer: {
    width: '100%',
    marginBottom: spacing[8],
  },
  reasonsTitle: {
    marginBottom: spacing[2],
  },
  reasonsList: {
    gap: spacing[1],
  },
  actionsContainer: {
    width: '100%',
    gap: spacing[3],
  },
});

