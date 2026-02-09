import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Screen, NeonText, NeonButton } from '@/components/primitives';
import { ProgressDots } from './ProgressDots';
import { colors, spacing } from '@/lib/theme';

interface OnboardingSlideProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  nextLabel?: string;
  onNext: () => void;
  onSkip?: () => void;
  showSkip?: boolean;
}

export function OnboardingSlide({
  title,
  subtitle,
  children,
  currentStep,
  totalSteps,
  nextLabel = 'Next',
  onNext,
  onSkip,
  showSkip = true,
}: OnboardingSlideProps) {
  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onNext();
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSkip?.();
  };

  return (
    <Screen safeArea padded style={styles.container}>
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <ProgressDots total={totalSteps} current={currentStep} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <NeonText variant="h1" color="primary" glow style={styles.title}>
          {title}
        </NeonText>

        {subtitle && (
          <NeonText variant="body" color="muted" style={styles.subtitle}>
            {subtitle}
          </NeonText>
        )}

        {/* Illustration/custom content area */}
        {children && (
          <View style={styles.illustrationContainer}>
            {children}
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <View style={styles.buttonContainer}>
          <NeonButton onPress={handleNext}>
            {nextLabel}
          </NeonButton>
        </View>

        {showSkip && onSkip && (
          <Pressable onPress={handleSkip} style={styles.skipButton}>
            <NeonText variant="body" color="muted">
              Skip
            </NeonText>
          </Pressable>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[0],
  },
  progressContainer: {
    paddingVertical: spacing[4],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  illustrationContainer: {
    marginTop: spacing[8],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
  actions: {
    paddingBottom: spacing[6],
    alignItems: 'center',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 320,
  },
  skipButton: {
    marginTop: spacing[4],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
  },
});

