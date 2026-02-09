import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Award, Flame, Target, Zap } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AnimatedCounter } from "@/components/AnimatedCounter";
import { GradientBackground } from "@/components/GradientBackground";
import { GlassPanel } from "@/components/GlassPanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import { ConfettiOverlay, ScoreRing } from "@/components/practice";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { usePracticeStore } from "@/stores/practiceStore";
import { colors } from "@/theme/tokens";

export default function ResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const {
    correctCount,
    answers,
    xpEarned,
    bestStreak,
    currentExerciseType,
    endSession,
    reset,
  } = usePracticeStore();

  const [showConfetti, setShowConfetti] = useState(false);

  const totalQuestions = answers.length;
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const wrongCount = totalQuestions - correctCount;

  // Celebration effects
  useEffect(() => {
    if (accuracy >= 70) {
      setShowConfetti(true);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    endSession();
  }, [accuracy, endSession]);

  const getMessage = () => {
    if (accuracy >= 90) return "Outstanding!";
    if (accuracy >= 80) return "Great job!";
    if (accuracy >= 70) return "Nice work!";
    if (accuracy >= 50) return "Keep going!";
    return "Practice makes perfect!";
  };

  const getSubMessage = () => {
    if (accuracy >= 90) return "You're mastering this!";
    if (accuracy >= 80) return "You're making excellent progress!";
    if (accuracy >= 70) return "You're on the right track!";
    if (accuracy >= 50) return "Review the mistakes and try again.";
    return "Don't give up - you'll get there!";
  };

  const handleContinue = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    reset();
    router.replace("/practice");
  }, [reset, router]);

  const handleReviewMistakes = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/practice/result-detail");
  }, [router]);

  const handleTryAgain = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    reset();
    
    // Navigate back to the same exercise type
    const route = currentExerciseType === "mcq" ? "/practice/quiz-mcq" :
      currentExerciseType === "fill-blank" ? "/practice/fill-blank" :
      currentExerciseType === "sentence-build" ? "/practice/sentence-build" :
      currentExerciseType === "timed-drill" ? "/practice/timed-drill" :
      currentExerciseType ? `/practice/${currentExerciseType}` :
      "/practice";
    
    router.replace(route);
  }, [currentExerciseType, reset, router]);

  return (
    <GradientBackground>
      <ConfettiOverlay visible={showConfetti} />

      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + 40,
            paddingBottom: insets.bottom + 20,
          },
        ]}
      >
        {/* Main Message */}
        <MotiView
          from={motionFrom.scaleIn}
          animate={{ opacity: 1, scale: 1 }}
          transition={getTransition({ delay: 50 })}
          style={styles.messageSection}
        >
          <View style={styles.celebrationIcon}>
            <Award size={48} color={colors.accent[400]} />
          </View>
          <Text style={styles.mainMessage}>{getMessage()}</Text>
          <Text style={styles.subMessage}>{getSubMessage()}</Text>
        </MotiView>

        {/* Score Ring */}
        <MotiView
          from={motionFrom.fade}
          animate={{ opacity: 1 }}
          transition={getTransition({ delay: 150 })}
          style={styles.scoreSection}
        >
          <ScoreRing score={accuracy} size={140} label="Accuracy" delay={500} />
        </MotiView>

        {/* Stats Grid */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 250 })}
          style={styles.statsSection}
        >
          <View style={styles.statsGrid}>
            <GlassPanel style={styles.statCard}>
              <Zap size={22} color={colors.secondary[400]} />
              <AnimatedCounter
                value={xpEarned}
                style={styles.statValue}
                duration={1000}
              />
              <Text style={styles.statLabel}>XP Earned</Text>
            </GlassPanel>

            <GlassPanel style={styles.statCard}>
              <Target size={22} color={colors.success} />
              <Text style={styles.statValue}>
                {correctCount}/{totalQuestions}
              </Text>
              <Text style={styles.statLabel}>Correct</Text>
            </GlassPanel>

            <GlassPanel style={styles.statCard}>
              <Flame size={22} color={colors.primary[400]} />
              <Text style={styles.statValue}>{bestStreak}</Text>
              <Text style={styles.statLabel}>Best Streak</Text>
            </GlassPanel>
          </View>
        </MotiView>

        {/* Action Buttons */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 350 })}
          style={styles.actionSection}
        >
          <PrimaryButton label="Continue" onPress={handleContinue} />

          <View style={styles.secondaryButtons}>
            {wrongCount > 0 && (
              <SecondaryButton
                label="Review Mistakes"
                onPress={handleReviewMistakes}
                style={styles.secondaryButton}
              />
            )}
            <SecondaryButton
              label="Try Again"
              onPress={handleTryAgain}
              style={styles.secondaryButton}
            />
          </View>
        </MotiView>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messageSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  celebrationIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(250, 204, 21, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  mainMessage: {
    fontFamily: "Satoshi-Bold",
    fontSize: 36,
    color: colors.text.primary,
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subMessage: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
  },
  scoreSection: {
    alignItems: "center",
    marginBottom: 28,
  },
  statsSection: {
    marginBottom: 32,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
  },
  statValue: {
    fontFamily: "Satoshi-Bold",
    fontSize: 24,
    color: colors.text.primary,
    marginTop: 8,
  },
  statLabel: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 4,
  },
  actionSection: {
    marginTop: "auto",
  },
  secondaryButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  secondaryButton: {
    flex: 1,
  },
});

