import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Pause, Play, RotateCcw } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { GradientBackground } from "@/components/GradientBackground";
import { GlassPanel } from "@/components/GlassPanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { AnswerFeedback, OptionButton, PracticeHeader } from "@/components/practice";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { useReduceMotion } from "@/hooks/useReduceMotion";
import { LISTENING_QUESTIONS } from "@/lib/practice/mockExercises";
import { usePracticeStore } from "@/stores/practiceStore";
import { colors, durations } from "@/theme/tokens";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const OPTION_LETTERS = ["A", "B", "C", "D"];

type OptionState = "default" | "selected" | "correct" | "wrong" | "disabled";

export default function ListeningScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();
  const { getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const {
    currentQuestionIndex,
    totalQuestions,
    startSession,
    recordAnswer,
    nextQuestion,
  } = usePracticeStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<0.75 | 1 | 1.25>(1);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const questions = LISTENING_QUESTIONS;
  const currentQuestion = questions[currentQuestionIndex];
  const isCorrect = selectedIndex === currentQuestion?.correctIndex;

  // Animation for play button
  const playScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);

  // Initialize session
  useEffect(() => {
    startSession("listening", questions.length);
  }, [startSession, questions.length]);

  // Reset state when question changes
  useEffect(() => {
    setIsPlaying(false);
    setHasPlayed(false);
    setSelectedIndex(null);
    setHasAnswered(false);
    setShowFeedback(false);
  }, [currentQuestionIndex]);

  // Pulse animation while playing
  useEffect(() => {
    if (isPlaying && !reduceMotion) {
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 500 }),
          withTiming(0.2, { duration: 500 })
        ),
        -1,
        true
      );
    } else {
      pulseOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isPlaying, reduceMotion, pulseOpacity]);

  const handlePlayPause = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (isPlaying) {
      setIsPlaying(false);
      playScale.value = reduceMotion ? 1 : withTiming(1, { duration: durations.fast });
    } else {
      setIsPlaying(true);
      setHasPlayed(true);
      playScale.value = reduceMotion ? 0.95 : withTiming(0.95, { duration: durations.fast });

      // Simulate audio playback
      setTimeout(() => {
        setIsPlaying(false);
        playScale.value = reduceMotion ? 1 : withTiming(1, { duration: durations.fast });
      }, 3000);
    }
  }, [isPlaying, playScale, reduceMotion]);

  const handleSpeedChange = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPlaybackSpeed((prev) => (prev === 0.75 ? 1 : prev === 1 ? 1.25 : 0.75));
  }, []);

  const handleSelectOption = useCallback(
    (index: number) => {
      if (hasAnswered) return;

      setSelectedIndex(index);
      setHasAnswered(true);
      setShowFeedback(true);

      recordAnswer({
        questionId: currentQuestion.id,
        userAnswer: currentQuestion.options[index],
        correctAnswer: currentQuestion.options[currentQuestion.correctIndex],
        isCorrect: index === currentQuestion.correctIndex,
      });
    },
    [hasAnswered, currentQuestion, recordAnswer]
  );

  const handleContinue = useCallback(() => {
    setShowFeedback(false);

    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        nextQuestion();
      }, 200);
    } else {
      router.replace("/practice/result");
    }
  }, [currentQuestionIndex, questions.length, nextQuestion, router]);

  const getOptionState = (index: number): OptionState => {
    if (!hasAnswered) {
      return selectedIndex === index ? "selected" : "default";
    }

    if (index === currentQuestion.correctIndex) {
      return "correct";
    }

    if (index === selectedIndex && !isCorrect) {
      return "wrong";
    }

    return "disabled";
  };

  const playButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playScale.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
    transform: [{ scale: 1 + pulseOpacity.value * 0.2 }],
  }));

  if (!currentQuestion) {
    return null;
  }

  return (
    <GradientBackground>
      <PracticeHeader
        currentQuestion={currentQuestionIndex}
        totalQuestions={totalQuestions || questions.length}
        title="Listening"
        showClose
        onClose={() => router.back()}
      />

      <View style={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
        {/* Audio Player */}
        <MotiView
          key={currentQuestion.id}
          from={motionFrom.scaleIn}
          animate={{ opacity: 1, scale: 1 }}
          transition={getTransition()}
        >
          <GlassPanel style={styles.playerCard}>
            <Text style={styles.listenLabel}>Listen to the audio:</Text>

            {/* Play Button */}
            <View style={styles.playButtonContainer}>
              {isPlaying && (
                <Animated.View style={[styles.playPulse, pulseStyle]} />
              )}
              <AnimatedPressable
                onPress={handlePlayPause}
                style={[styles.playButton, playButtonStyle]}
              >
                {isPlaying ? (
                  <Pause size={32} color={colors.text.primary} fill={colors.text.primary} />
                ) : (
                  <Play size={32} color={colors.text.primary} fill={colors.text.primary} />
                )}
              </AnimatedPressable>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
              <Pressable onPress={handlePlayPause} style={styles.controlButton}>
                <RotateCcw size={18} color={colors.text.secondary} />
                <Text style={styles.controlText}>Replay</Text>
              </Pressable>

              <Pressable onPress={handleSpeedChange} style={styles.speedButton}>
                <Text style={styles.speedText}>{playbackSpeed}x</Text>
              </Pressable>
            </View>
          </GlassPanel>
        </MotiView>

        {/* Question */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 100 })}
          style={styles.questionSection}
        >
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
        </MotiView>

        {/* Options */}
        <View style={styles.optionsSection}>
          {currentQuestion.options.map((option, index) => (
            <MotiView
              key={`${currentQuestion.id}-${index}`}
              from={motionFrom.fadeUp}
              animate={{ opacity: 1, translateY: 0 }}
              transition={getTransition({
                delay: 150 + index * 30,
              })}
            >
              <OptionButton
                label={option}
                optionLetter={OPTION_LETTERS[index]}
                state={getOptionState(index)}
                onPress={() => handleSelectOption(index)}
                disabled={hasAnswered || !hasPlayed}
              />
            </MotiView>
          ))}
        </View>

        {/* Hint to listen first */}
        {!hasPlayed && (
          <Text style={styles.hintText}>Tap play to listen first</Text>
        )}

        {/* Continue Button */}
        {hasAnswered && (
          <MotiView
            from={motionFrom.fadeUp}
            animate={{ opacity: 1, translateY: 0 }}
            transition={getTransition()}
            style={styles.continueSection}
          >
            <PrimaryButton
              label={
                currentQuestionIndex < questions.length - 1
                  ? "Continue"
                  : "See Results"
              }
              onPress={handleContinue}
            />
          </MotiView>
        )}
      </View>

      {/* Feedback Overlay */}
      <AnswerFeedback
        isCorrect={isCorrect}
        correctAnswer={
          !isCorrect
            ? currentQuestion.options[currentQuestion.correctIndex]
            : undefined
        }
        visible={showFeedback}
      />
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  playerCard: {
    padding: 24,
    marginTop: 20,
    borderRadius: 20,
    alignItems: "center",
  },
  listenLabel: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.muted,
    marginBottom: 20,
  },
  playButtonContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  playPulse: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.secondary[400],
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.secondary[500],
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.secondary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  controlButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  controlText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.secondary,
  },
  speedButton: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  speedText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
    color: colors.text.primary,
  },
  questionSection: {
    marginTop: 28,
    marginBottom: 20,
  },
  questionText: {
    fontFamily: "Satoshi-Bold",
    fontSize: 20,
    color: colors.text.primary,
    lineHeight: 28,
  },
  optionsSection: {
    flex: 1,
  },
  hintText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.muted,
    textAlign: "center",
    marginTop: 8,
  },
  continueSection: {
    marginTop: "auto",
    paddingTop: 20,
  },
});

