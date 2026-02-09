import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';

export default function WithdrawFailureScreen() {
  const router = useRouter();
  const { amount } = useLocalSearchParams<{ amount: string }>();

  React.useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }, []);

  const handleRetry = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace({
      pathname: '/(tabs)/withdraw/confirm',
      params: { amount },
    });
  };

  const handleContactSupport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/(tabs)/account/support');
  };

  const handleBackToHome = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/(tabs)/home');
  };

  return (
    <Screen safeArea style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Error Icon */}
        <MotiView
          from={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 12 }}
          style={styles.iconSection}
        >
          <View style={styles.iconContainer}>
            <MotiView
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ type: 'timing', duration: 1500, loop: true }}
            >
              <NeonText style={styles.icon}>✕</NeonText>
            </MotiView>
          </View>
        </MotiView>

        {/* Title */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200, duration: 400 }}
          style={styles.titleSection}
        >
          <NeonText variant="h2" color="white" style={styles.title}>
            Withdrawal Failed
          </NeonText>
          <NeonText variant="body" color="muted" style={styles.subtitle}>
            We couldn't process your request
          </NeonText>
        </MotiView>

        {/* Error Details */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 300, duration: 400 }}
          style={styles.errorSection}
        >
          <View style={styles.errorCard}>
            <View style={styles.errorHeader}>
              <NeonText style={styles.errorEmoji}>⚠️</NeonText>
              <NeonText variant="body" color="warning">Transaction Declined</NeonText>
            </View>
            <NeonText variant="caption" color="muted" style={styles.errorMessage}>
              Your bank declined this transaction. This could be due to security 
              restrictions or insufficient verification.
            </NeonText>
          </View>
        </MotiView>

        {/* What to Try */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 400, duration: 400 }}
          style={styles.suggestionsSection}
        >
          <NeonText variant="caption" color="muted" style={styles.sectionLabel}>
            WHAT TO TRY
          </NeonText>

          <View style={styles.suggestionsList}>
            {[
              { icon: '🔄', text: 'Wait a few minutes and try again' },
              { icon: '💳', text: 'Verify your bank account is linked correctly' },
              { icon: '📞', text: 'Contact your bank for authorization' },
              { icon: '💬', text: 'Reach out to our support team' },
            ].map((item, index) => (
              <MotiView
                key={index}
                from={{ opacity: 0, translateX: -10 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'timing', delay: 450 + index * 50, duration: 300 }}
              >
                <View style={styles.suggestionRow}>
                  <NeonText style={styles.suggestionIcon}>{item.icon}</NeonText>
                  <NeonText variant="body" color="muted">{item.text}</NeonText>
                </View>
              </MotiView>
            ))}
          </View>
        </MotiView>

        {/* Buttons */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 600, duration: 400 }}
          style={styles.buttonsSection}
        >
          <NeonButton onPress={handleRetry}>
            Try Again
          </NeonButton>
          <NeonButton variant="outline" onPress={handleContactSupport} style={styles.secondaryButton}>
            Contact Support
          </NeonButton>
          <NeonButton variant="outline" onPress={handleBackToHome} style={styles.secondaryButton}>
            Back to Home
          </NeonButton>
        </MotiView>
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
    paddingHorizontal: spacing[4],
    paddingBottom: layout.tabBarHeight + spacing[4],
    paddingTop: spacing[8],
  },
  iconSection: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.error[500] || '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 48,
    color: colors.neutral[0],
    fontWeight: '700',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  subtitle: {
    textAlign: 'center',
  },
  errorSection: {
    marginBottom: spacing[6],
  },
  errorCard: {
    backgroundColor: colors.neutral[100],
    borderRadius: 16,
    padding: spacing[4],
    borderLeftWidth: 3,
    borderLeftColor: colors.warning[500] || '#FFA500',
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  errorEmoji: {
    fontSize: 20,
  },
  errorMessage: {
    lineHeight: 20,
  },
  suggestionsSection: {
    marginBottom: spacing[6],
  },
  sectionLabel: {
    letterSpacing: 1.5,
    fontSize: 11,
    marginBottom: spacing[3],
  },
  suggestionsList: {
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    padding: spacing[4],
    gap: spacing[3],
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  suggestionIcon: {
    fontSize: 18,
  },
  buttonsSection: {
    gap: spacing[3],
  },
  secondaryButton: {
    marginTop: spacing[1],
  },
});

