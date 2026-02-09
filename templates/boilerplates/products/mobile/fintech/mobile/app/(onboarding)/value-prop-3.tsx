import React from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton, Card } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';
import { verticalScale, moderateScale } from '@/lib/utils/responsive';

export default function ValueProp3Screen() {
  const router = useRouter();

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(onboarding)/notifications');
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(onboarding)/notifications');
  };

  return (
    <Screen safeArea padded={false} style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
      {/* Progress indicator */}
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
        </View>
        <Pressable onPress={handleSkip}>
          <NeonText variant="body" color="muted">Skip</NeonText>
        </Pressable>
      </View>

      <View style={styles.content}>
        {/* Icon */}
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
          style={styles.iconContainer}
        >
          <View style={styles.iconCircle}>
            <NeonText variant="display" style={styles.iconEmoji}>🎮</NeonText>
          </View>
        </MotiView>

        {/* Title */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200 }}
        >
          <NeonText variant="h2" color="white" align="center" style={styles.title}>
            Your Trades. Your Control.
          </NeonText>
        </MotiView>

        {/* Description */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 300 }}
        >
          <NeonText variant="body" color="muted" align="center" style={styles.description}>
            Choose your risk level. Pause anytime. Full transparency on every trade.
          </NeonText>
        </MotiView>

        {/* Control options - BAGS style */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 400 }}
          style={styles.controlsContainer}
        >
          <Card variant="default" padding="md" style={styles.controlCard}>
            <View style={styles.controlRow}>
              <View style={styles.controlIcon}>
                <NeonText variant="body" color="primary">🛡️</NeonText>
              </View>
              <View style={styles.controlText}>
                <NeonText variant="body" color="white">Adjustable Risk</NeonText>
                <NeonText variant="caption" color="muted">Safe, Balanced, or Aggressive</NeonText>
              </View>
            </View>
          </Card>
          
          <Card variant="default" padding="md" style={styles.controlCard}>
            <View style={styles.controlRow}>
              <View style={styles.controlIcon}>
                <NeonText variant="body" color="primary">⏸️</NeonText>
              </View>
              <View style={styles.controlText}>
                <NeonText variant="body" color="white">Pause Anytime</NeonText>
                <NeonText variant="caption" color="muted">Take back control instantly</NeonText>
              </View>
            </View>
          </Card>
          
          <Card variant="default" padding="md" style={styles.controlCard}>
            <View style={styles.controlRow}>
              <View style={styles.controlIcon}>
                <NeonText variant="body" color="primary">📱</NeonText>
              </View>
              <View style={styles.controlText}>
                <NeonText variant="body" color="white">Real-time Alerts</NeonText>
                <NeonText variant="caption" color="muted">Never miss a trade</NeonText>
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
          <NeonButton onPress={handleNext}>
            Get Started
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  progressContainer: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutral[300],
  },
  progressDotActive: {
    backgroundColor: colors.primary.DEFAULT,
    width: 24,
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
  iconCircle: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(50),
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  iconEmoji: {
    fontSize: moderateScale(48),
  },
  title: {
    marginBottom: spacing[3],
  },
  description: {
    maxWidth: 300,
    lineHeight: 24,
    marginBottom: spacing[6],
  },
  controlsContainer: {
    width: '100%',
    maxWidth: 320,
    gap: spacing[3],
  },
  controlCard: {},
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  controlIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[900],
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlText: {
    flex: 1,
    gap: 2,
  },
  actions: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[6],
  },
});

