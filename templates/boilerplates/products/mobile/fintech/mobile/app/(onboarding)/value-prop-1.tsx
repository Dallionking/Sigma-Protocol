import React from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton, Card } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';
import { verticalScale, moderateScale } from '@/lib/utils/responsive';

export default function ValueProp1Screen() {
  const router = useRouter();

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(onboarding)/value-prop-2');
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
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
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
            <NeonText variant="display" style={styles.iconEmoji}>🤖</NeonText>
          </View>
        </MotiView>

        {/* Title */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200 }}
        >
          <NeonText variant="h2" color="white" align="center" style={styles.title}>
            AI-Powered Trading
          </NeonText>
        </MotiView>

        {/* Description */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 300 }}
        >
          <NeonText variant="body" color="muted" align="center" style={styles.description}>
            Our advanced AI analyzes markets 24/7, finding opportunities while you sleep.
          </NeonText>
        </MotiView>

        {/* Feature cards - BAGS style */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 400 }}
          style={styles.featuresContainer}
        >
          <Card variant="default" padding="sm" style={styles.featureCard}>
            <NeonText variant="caption" color="primary">📊</NeonText>
            <NeonText variant="caption" color="muted">Real-time analysis</NeonText>
          </Card>
          <Card variant="default" padding="sm" style={styles.featureCard}>
            <NeonText variant="caption" color="primary">⚡</NeonText>
            <NeonText variant="caption" color="muted">Fast execution</NeonText>
          </Card>
          <Card variant="default" padding="sm" style={styles.featureCard}>
            <NeonText variant="caption" color="primary">🎯</NeonText>
            <NeonText variant="caption" color="muted">Precise entries</NeonText>
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
            Continue
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
  featuresContainer: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  featureCard: {
    alignItems: 'center',
    gap: spacing[2],
    minWidth: 90,
  },
  actions: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[6],
  },
});

