import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Check, ChevronDown, ChevronLeft, ChevronUp, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import { GradientBackground } from "@/components/GradientBackground";
import { GlassPanel } from "@/components/GlassPanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { usePracticeStore } from "@/stores/practiceStore";
import { colors, durations } from "@/theme/tokens";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function ResultDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const { answers, reset, currentExerciseType } = usePracticeStore();

  const wrongAnswers = answers.filter((a) => !a.isCorrect);
  const correctAnswers = answers.filter((a) => a.isCorrect);

  const handleBack = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const handlePracticeAgain = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    reset();

    const route =
      currentExerciseType === "mcq"
        ? "/practice/quiz-mcq"
        : currentExerciseType === "fill-blank"
          ? "/practice/fill-blank"
          : currentExerciseType === "sentence-build"
            ? "/practice/sentence-build"
            : currentExerciseType === "timed-drill"
              ? "/practice/timed-drill"
              : currentExerciseType
                ? `/practice/${currentExerciseType}`
                : "/practice";

    router.replace(route);
  }, [currentExerciseType, reset, router]);

  return (
    <GradientBackground>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Review</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition()}
          style={styles.summarySection}
        >
          <GlassPanel style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <View style={[styles.summaryIcon, styles.summaryIconCorrect]}>
                  <Check size={18} color={colors.success} />
                </View>
                <Text style={styles.summaryValue}>{correctAnswers.length}</Text>
                <Text style={styles.summaryLabel}>Correct</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <View style={[styles.summaryIcon, styles.summaryIconWrong]}>
                  <X size={18} color={colors.error} />
                </View>
                <Text style={styles.summaryValue}>{wrongAnswers.length}</Text>
                <Text style={styles.summaryLabel}>Needs Review</Text>
              </View>
            </View>
          </GlassPanel>
        </MotiView>

        {/* Wrong Answers Section */}
        {wrongAnswers.length > 0 && (
          <MotiView
            from={motionFrom.fade}
            animate={{ opacity: 1 }}
            transition={getTransition({ delay: 100 })}
          >
            <Text style={styles.sectionTitle}>Needs Review ({wrongAnswers.length})</Text>

            {wrongAnswers.map((answer, index) => (
              <AnswerCard
                key={answer.questionId}
                answer={answer}
                index={index}
                isCorrect={false}
                delay={250 + index * 50}
              />
            ))}
          </MotiView>
        )}

        {/* Correct Answers Section */}
        {correctAnswers.length > 0 && (
          <MotiView
            from={motionFrom.fade}
            animate={{ opacity: 1 }}
            transition={getTransition({
              delay: 150 + wrongAnswers.length * 30,
            })}
          >
            <Text style={styles.sectionTitle}>Got Right ({correctAnswers.length})</Text>

            {correctAnswers.map((answer, index) => (
              <AnswerCard
                key={answer.questionId}
                answer={answer}
                index={index}
                isCorrect={true}
                delay={350 + wrongAnswers.length * 50 + index * 50}
              />
            ))}
          </MotiView>
        )}

        {/* Practice Again Button */}
        {wrongAnswers.length > 0 && (
          <MotiView
            from={motionFrom.fadeUp}
            animate={{ opacity: 1, translateY: 0 }}
            transition={getTransition({
              delay: 200 + answers.length * 30,
            })}
            style={styles.actionSection}
          >
            <PrimaryButton label="Practice These Again" onPress={handlePracticeAgain} />
          </MotiView>
        )}
      </ScrollView>
    </GradientBackground>
  );
}

function AnswerCard({
  answer,
  index,
  isCorrect,
  delay,
}: {
  answer: { questionId: string; userAnswer: string; correctAnswer: string; isCorrect: boolean };
  index: number;
  isCorrect: boolean;
  delay: number;
}) {
  const [expanded, setExpanded] = useState(!isCorrect);
  const scale = useSharedValue(1);

  const handleToggle = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpanded((prev) => !prev);
  }, []);

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(0.98, { duration: durations.fast });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: durations.fast });
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <MotiView
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: "timing", duration: 300, delay }}
    >
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handleToggle}
        style={[styles.card, animatedStyle]}
      >
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.cardIcon,
              isCorrect ? styles.cardIconCorrect : styles.cardIconWrong,
            ]}
          >
            {isCorrect ? (
              <Check size={16} color={colors.success} />
            ) : (
              <X size={16} color={colors.error} />
            )}
          </View>
          <Text style={styles.cardNumber}>Question {index + 1}</Text>
          {expanded ? (
            <ChevronUp size={18} color={colors.text.muted} />
          ) : (
            <ChevronDown size={18} color={colors.text.muted} />
          )}
        </View>

        {expanded && (
          <MotiView
            from={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ type: "timing", duration: 200 }}
            style={styles.cardContent}
          >
            <View style={styles.answerRow}>
              <Text style={styles.answerLabel}>Your answer:</Text>
              <Text
                style={[
                  styles.answerText,
                  isCorrect ? styles.answerCorrect : styles.answerWrong,
                ]}
              >
                {answer.userAnswer || "(empty)"}
              </Text>
            </View>

            {!isCorrect && (
              <View style={styles.answerRow}>
                <Text style={styles.answerLabel}>Correct answer:</Text>
                <Text style={[styles.answerText, styles.answerCorrect]}>
                  {answer.correctAnswer}
                </Text>
              </View>
            )}
          </MotiView>
        )}
      </AnimatedPressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "Satoshi-Bold",
    fontSize: 18,
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  summarySection: {
    marginBottom: 24,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 18,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  summaryIconCorrect: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
  },
  summaryIconWrong: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
  },
  summaryValue: {
    fontFamily: "Satoshi-Bold",
    fontSize: 28,
    color: colors.text.primary,
  },
  summaryLabel: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.muted,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 60,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 15,
    color: colors.text.secondary,
    marginBottom: 12,
    marginTop: 8,
  },
  card: {
    backgroundColor: "rgba(17, 24, 39, 0.6)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 16,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardIconCorrect: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
  },
  cardIconWrong: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
  },
  cardNumber: {
    flex: 1,
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 15,
    color: colors.text.primary,
  },
  cardContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
  },
  answerRow: {
    marginBottom: 12,
  },
  answerLabel: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
    marginBottom: 4,
  },
  answerText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 15,
  },
  answerCorrect: {
    color: colors.success,
  },
  answerWrong: {
    color: colors.error,
  },
  actionSection: {
    marginTop: 24,
  },
});

