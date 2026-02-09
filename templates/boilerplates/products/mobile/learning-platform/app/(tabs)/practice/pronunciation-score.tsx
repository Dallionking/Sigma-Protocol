import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback, useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Check, AlertTriangle } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { GlassPanel } from "@/components/GlassPanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import { ScoreRing } from "@/components/practice";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { usePracticeStore } from "@/stores/practiceStore";
import { colors } from "@/theme/tokens";

export default function PronunciationScoreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const { lastPronunciationScore, wordFeedback, nextQuestion, currentQuestionIndex, totalQuestions } =
    usePracticeStore();

  const score = lastPronunciationScore ?? 75;

  // Haptic feedback on mount
  useEffect(() => {
    if (score >= 80) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (score >= 60) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }, [score]);

  const handleTryAgain = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const handleContinue = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (currentQuestionIndex < (totalQuestions || 5) - 1) {
      nextQuestion();
      router.replace("/practice/speaking");
    } else {
      router.replace("/practice/result");
    }
  }, [currentQuestionIndex, totalQuestions, nextQuestion, router]);

  const getScoreMessage = () => {
    if (score >= 90) return "Excellent!";
    if (score >= 80) return "Great job!";
    if (score >= 70) return "Good effort!";
    if (score >= 60) return "Keep practicing!";
    return "Try again!";
  };

  const getScoreColor = () => {
    if (score >= 80) return colors.success;
    if (score >= 60) return colors.secondary[400];
    if (score >= 40) return colors.warning;
    return colors.error;
  };

  return (
    <GradientBackground>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 40,
            paddingBottom: insets.bottom + 40,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Score Ring */}
        <MotiView
          from={motionFrom.scaleIn}
          animate={{ opacity: 1, scale: 1 }}
          transition={getTransition({ delay: 50 })}
          style={styles.scoreSection}
        >
          <ScoreRing score={score} size={180} label="Pronunciation" />
          <Text style={[styles.scoreMessage, { color: getScoreColor() }]}>
            {getScoreMessage()}
          </Text>
        </MotiView>

        {/* Word-by-word feedback */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 150 })}
          style={styles.feedbackSection}
        >
          <Text style={styles.sectionTitle}>Word Feedback</Text>

          {wordFeedback.map((item, index) => (
            <MotiView
              key={item.word}
              from={{ opacity: 0, translateX: -10 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{
                type: "timing",
                duration: 260,
                delay: 200 + index * 50,
              }}
            >
              <GlassPanel style={styles.wordCard}>
                <View style={styles.wordHeader}>
                  <View
                    style={[
                      styles.wordIcon,
                      item.score >= 70 ? styles.wordIconGood : styles.wordIconNeedsWork,
                    ]}
                  >
                    {item.score >= 70 ? (
                      <Check size={16} color={colors.success} />
                    ) : (
                      <AlertTriangle size={16} color={colors.warning} />
                    )}
                  </View>
                  <Text style={styles.wordText}>"{item.word}"</Text>
                  <Text
                    style={[
                      styles.wordScore,
                      { color: item.score >= 70 ? colors.success : colors.warning },
                    ]}
                  >
                    {item.score}%
                  </Text>
                </View>
                {item.tip && (
                  <Text style={styles.tipText}>{item.tip}</Text>
                )}
              </GlassPanel>
            </MotiView>
          ))}
        </MotiView>

        {/* Tips Section */}
        <MotiView
          from={motionFrom.fade}
          animate={{ opacity: 1 }}
          transition={getTransition({ delay: 350 })}
          style={styles.tipsSection}
        >
          <GlassPanel style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>AI Tutor's Tips</Text>
            <Text style={styles.tipsText}>
              {score >= 80
                ? "You're doing great! Keep practicing to maintain your excellent pronunciation."
                : "Remember to speak slowly and clearly. Focus on the syllables that need work."}
            </Text>
          </GlassPanel>
        </MotiView>

        {/* Action Buttons */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 450 })}
          style={styles.actionSection}
        >
          <View style={styles.buttonRow}>
            <View style={styles.buttonHalf}>
              <SecondaryButton label="Try Again" onPress={handleTryAgain} />
            </View>
            <View style={styles.buttonHalf}>
              <PrimaryButton label="Continue" onPress={handleContinue} />
            </View>
          </View>
        </MotiView>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  scoreSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  scoreMessage: {
    fontFamily: "Satoshi-Bold",
    fontSize: 28,
    marginTop: 20,
    letterSpacing: -0.5,
  },
  feedbackSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 14,
  },
  wordCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
  },
  wordHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  wordIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  wordIconGood: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
  },
  wordIconNeedsWork: {
    backgroundColor: "rgba(245, 158, 11, 0.15)",
  },
  wordText: {
    flex: 1,
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 16,
    color: colors.text.primary,
  },
  wordScore: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
  },
  tipText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 8,
    marginLeft: 40,
  },
  tipsSection: {
    marginBottom: 32,
  },
  tipsCard: {
    padding: 20,
    borderRadius: 18,
  },
  tipsTitle: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
    color: colors.accent[400],
    marginBottom: 8,
  },
  tipsText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 15,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  actionSection: {
    marginTop: "auto",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  buttonHalf: {
    flex: 1,
  },
});

