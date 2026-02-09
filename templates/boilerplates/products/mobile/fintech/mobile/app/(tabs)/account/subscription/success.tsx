import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';
import { useCurrentSubscription } from '@/lib/hooks/use-subscription';

export default function PurchaseSuccessScreen() {
  const router = useRouter();
  const { planData } = useCurrentSubscription();

  useEffect(() => {
    // Success haptic
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Auto-dismiss after 3 seconds
    const timer = setTimeout(() => {
      handleReturn();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleReturn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Navigate back to account or the screen that triggered the paywall
    router.replace('/(tabs)/account/subscription');
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.content}>
        {/* Success Animation */}
        <MotiView
          from={{ scale: 0, rotate: '-180deg' }}
          animate={{ scale: 1, rotate: '0deg' }}
          transition={{ type: 'spring', damping: 12 }}
        >
          <View style={styles.iconContainer}>
            <MotiView
              from={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 200, damping: 10 }}
            >
              <NeonText variant="display" style={styles.successIcon}>
                ✓
              </NeonText>
            </MotiView>
            <MotiView
              from={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ type: 'timing', duration: 1000, loop: true }}
              style={styles.pulse}
            />
          </View>
        </MotiView>

        {/* Success Message */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 300, duration: 400 }}
          style={styles.textContainer}
        >
          <NeonText variant="h2" color="primary" style={styles.title}>
            Welcome to {planData?.name}!
          </NeonText>
          <NeonText variant="body" color="muted" style={styles.subtitle}>
            All features are now unlocked
          </NeonText>
        </MotiView>

        {/* Activated Features */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 500, duration: 400 }}
          style={styles.featuresContainer}
        >
          {planData?.features.slice(0, 3).map((feature, index) => (
            <MotiView
              key={index}
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: 'spring', delay: 600 + index * 100 }}
              style={styles.featureRow}
            >
              <NeonText variant="body" color="primary">✓</NeonText>
              <NeonText variant="body" color="white">{feature}</NeonText>
            </MotiView>
          ))}
        </MotiView>

        {/* CTA */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 900 }}
          style={styles.ctaContainer}
        >
          <NeonButton onPress={handleReturn}>
            Continue
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
    width: 120,
    height: 120,
    backgroundColor: colors.primary[900],
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  successIcon: {
    fontSize: 64,
    color: colors.primary[500],
  },
  pulse: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  textContainer: {
    alignItems: 'center',
    marginTop: spacing[8],
    marginBottom: spacing[6],
  },
  title: {
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  featuresContainer: {
    width: '100%',
    gap: spacing[3],
    marginBottom: spacing[8],
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
  },
  ctaContainer: {
    width: '100%',
  },
});

