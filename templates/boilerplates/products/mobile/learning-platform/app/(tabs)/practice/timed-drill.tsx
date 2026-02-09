import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Flame, Zap } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { GradientBackground } from "@/components/GradientBackground";
import { GlassPanel } from "@/components/GlassPanel";
import { OptionButton, PracticeHeader, TimerBar } from "@/components/practice";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { useReduceMotion } from "@/hooks/useReduceMotion";
import { TIMED_DRILL_QUESTIONS } from "@/lib/practice/mockExercises";
import { usePracticeStore } from "@/stores/practiceStore";
import { colors, springs } from "@/theme/tokens";

const DRILL_TIME = 60; // seconds
const OPTION_LETTERS = ["A", "B", "C", "D"];

type OptionState = "default" | "selected" | "correct" | "wrong" | "disabled";

export default function TimedDrillScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();
  const { getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const {
    startSession,
    recordAnswer,
    correctCount,
    streakCount,
    setTimedDrillRemaining,
  } = usePracticeStore();

  const [questionIndex, setQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(DRILL_TIME);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const questions = TIMED_DRILL_QUESTIONS;
  const currentQuestion = questions[questionIndex % questions.length];

  // Animation values
  const streakScale = useSharedValue(1);
  const questionKey = useSharedValue(0);

  // Initialize session
  useEffect(() => {
    startSession("timed-drill", questions.length);

    // Start timer
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsGameOver(true);
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [startSession, questions.length]);

  // Update store with remaining time
  useEffect(() => {
    setTimedDrillRemaining(timeRemaining);
  }, [timeRemaining, setTimedDrillRemaining]);

  // Navigate to results when game is over
  useEffect(() => {
    if (isGameOver) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setTimeout(() => {
        router.replace("/practice/result");
      }, 1000);
    }
  }, [isGameOver, router]);

  const handleSelectOption = useCallback(
    (index: number) => {
      if (showResult || isGameOver) return;

      const isCorrect = index === currentQuestion.correctIndex;

      setSelectedIndex(index);
      setShowResult(true);

      // Haptic feedback
      if (isCorrect) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Streak animation
        if (!reduceMotion) {
          streakScale.value = withSequence(
            withTiming(1.1, { duration: durations.fast }),
            withTiming(1, { duration: durations.fast })
          );
        }
      } else {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      // Record answer
      recordAnswer({
        questionId: currentQuestion.id,
        userAnswer: currentQuestion.options[index],
        correctAnswer: currentQuestion.options[currentQuestion.correctIndex],
        isCorrect,
      });

      // Auto-advance after brief delay
      setTimeout(() => {
        if (!reduceMotion) {
          questionKey.value = withTiming(questionKey.value + 1, { duration: 150 });
        }
        setQuestionIndex((prev) => prev + 1);
        setSelectedIndex(null);
        setShowResult(false);
      }, 600);
    },
    [showResult, isGameOver, currentQuestion, recordAnswer, reduceMotion, streakScale, questionKey]
  );

  const getOptionState = (index: number): OptionState => {
    if (!showResult) {
      return "default";
    }

    if (index === currentQuestion.correctIndex) {
      return "correct";
    }

    if (index === selectedIndex && index !== currentQuestion.correctIndex) {
      return "wrong";
    }

    return "disabled";
  };

  const streakStyle = useAnimatedStyle(() => ({
    transform: [{ scale: streakScale.value }],
  }));

  if (isGameOver) {
    return (
      <GradientBackground>
        <View style={[styles.gameOverContainer, { paddingTop: insets.top + 60 }]}>
          <MotiView
            from={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={getTransition()}
          >
            <Text style={styles.gameOverText}>Time's Up!</Text>
            <Text style={styles.finalScoreText}>
              You answered {correctCount} correctly
            </Text>
          </MotiView>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <PracticeHeader
        currentQuestion={questionIndex}
        totalQuestions={questions.length}
        title="Timed Drill"
        showClose
        onClose={() => router.back()}
      />

      <View style={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
        {/* Timer Bar */}
        <TimerBar
          remainingSeconds={timeRemaining}
          totalSeconds={DRILL_TIME}
        />

        {/* Stats Row */}
        <MotiView
          from={motionFrom.fade}
          animate={{ opacity: 1 }}
          transition={getTransition()}
          style={styles.statsRow}
        >
          <GlassPanel style={styles.statCard}>
            <Zap size={18} color={colors.secondary[400]} />
            <Text style={styles.statValue}>{correctCount}</Text>
            <Text style={styles.statLabel}>Correct</Text>
          </GlassPanel>

          <Animated.View style={streakStyle}>
            <GlassPanel
              style={[
                styles.statCard,
                streakCount >= 3 && styles.streakActive,
              ]}
            >
              <Flame
                size={18}
                color={streakCount >= 3 ? colors.primary[400] : colors.text.muted}
              />
              <Text
                style={[
                  styles.statValue,
                  streakCount >= 3 && styles.streakValue,
                ]}
              >
                {streakCount}
              </Text>
              <Text style={styles.statLabel}>Streak</Text>
            </GlassPanel>
          </Animated.View>
        </MotiView>

        {/* Question */}
        <MotiView
          key={questionIndex}
          from={{ opacity: 0, translateX: 30 }}
          animate={{ opacity: 1, translateX: 0 }}
          exit={{ opacity: 0, translateX: -30 }}
          transition={getTransition()}
          style={styles.questionSection}
        >
          <GlassPanel style={styles.questionCard}>
            <Text style={styles.categoryBadge}>
              {currentQuestion.category.toUpperCase()}
            </Text>
            <Text style={styles.questionText}>{currentQuestion.prompt}</Text>
          </GlassPanel>
        </MotiView>

        {/* Options */}
        <View style={styles.optionsSection}>
          {currentQuestion.options.map((option, index) => (
            <OptionButton
              key={`${questionIndex}-${index}`}
              label={option}
              optionLetter={OPTION_LETTERS[index]}
              state={getOptionState(index)}
              onPress={() => handleSelectOption(index)}
              disabled={showResult}
            />
          ))}
        </View>

        {/* Streak Bonus Indicator */}
        {streakCount >= 3 && (
          <MotiView
            from={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={getTransition()}
            style={styles.bonusIndicator}
          >
            <Flame size={14} color={colors.primary[400]} />
            <Text style={styles.bonusText}>+5 XP Streak Bonus!</Text>
          </MotiView>
        )}
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 14,
    gap: 8,
  },
  streakActive: {
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.3)",
  },
  statValue: {
    fontFamily: "Satoshi-Bold",
    fontSize: 20,
    color: colors.text.primary,
  },
  streakValue: {
    color: colors.primary[400],
  },
  statLabel: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
  },
  questionSection: {
    marginBottom: 24,
  },
  questionCard: {
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
  },
  categoryBadge: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 11,
    color: colors.secondary[400],
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  questionText: {
    fontFamily: "Satoshi-Bold",
    fontSize: 22,
    color: colors.text.primary,
    textAlign: "center",
    lineHeight: 30,
  },
  optionsSection: {
    flex: 1,
  },
  bonusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
  },
  bonusText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
    color: colors.primary[400],
  },
  gameOverContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  gameOverText: {
    fontFamily: "Satoshi-Bold",
    fontSize: 40,
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: 16,
  },
  finalScoreText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 18,
    color: colors.text.secondary,
    textAlign: "center",
  },
});

