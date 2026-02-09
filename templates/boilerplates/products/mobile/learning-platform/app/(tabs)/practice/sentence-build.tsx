import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { RotateCcw } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { GlassPanel } from "@/components/GlassPanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { AnswerFeedback, PracticeHeader, WordTile } from "@/components/practice";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { SENTENCE_BUILD_QUESTIONS } from "@/lib/practice/mockExercises";
import { usePracticeStore } from "@/stores/practiceStore";
import { colors } from "@/theme/tokens";

export default function SentenceBuildScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const {
    currentQuestionIndex,
    totalQuestions,
    startSession,
    recordAnswer,
    nextQuestion,
  } = usePracticeStore();

  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const questions = SENTENCE_BUILD_QUESTIONS;
  const currentQuestion = questions[currentQuestionIndex];

  // Initialize session and reset state on mount/question change
  useEffect(() => {
    startSession("sentence-build", questions.length);
  }, [startSession, questions.length]);

  useEffect(() => {
    if (currentQuestion) {
      setAvailableWords([...currentQuestion.shuffledTiles]);
      setSelectedWords([]);
      setHasAnswered(false);
      setShowFeedback(false);
      setIsCorrect(false);
    }
  }, [currentQuestion]);

  const handleSelectWord = useCallback(
    (word: string, index: number) => {
      if (hasAnswered) return;
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      setSelectedWords((prev) => [...prev, word]);
      setAvailableWords((prev) => prev.filter((_, i) => i !== index));
    },
    [hasAnswered]
  );

  const handleRemoveWord = useCallback(
    (word: string, index: number) => {
      if (hasAnswered) return;
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      setSelectedWords((prev) => prev.filter((_, i) => i !== index));
      setAvailableWords((prev) => [...prev, word]);
    },
    [hasAnswered]
  );

  const handleReset = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedWords([]);
    setAvailableWords([...currentQuestion.shuffledTiles]);
  }, [currentQuestion]);

  const handleCheck = useCallback(() => {
    const correct =
      JSON.stringify(selectedWords) === JSON.stringify(currentQuestion.correctOrder);
    setIsCorrect(correct);
    setHasAnswered(true);
    setShowFeedback(true);

    recordAnswer({
      questionId: currentQuestion.id,
      userAnswer: selectedWords.join(" "),
      correctAnswer: currentQuestion.correctOrder.join(" "),
      isCorrect: correct,
    });
  }, [selectedWords, currentQuestion, recordAnswer]);

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

  if (!currentQuestion) {
    return null;
  }

  const allWordsPlaced = availableWords.length === 0;

  return (
    <GradientBackground>
      <PracticeHeader
        currentQuestion={currentQuestionIndex}
        totalQuestions={totalQuestions || questions.length}
        title="Sentence Builder"
        showClose
        onClose={() => router.back()}
      />

      <View style={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
        {/* Instruction prompt */}
        <MotiView
          key={`prompt-${currentQuestion.id}`}
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition()}
        >
          <Text style={styles.promptLabel}>Arrange the words:</Text>
          <Text style={styles.promptText}>{currentQuestion.instruction}</Text>
        </MotiView>

        {/* Answer zone */}
        <MotiView
          from={motionFrom.fade}
          animate={{ opacity: 1 }}
          transition={getTransition({ delay: 100 })}
        >
          <GlassPanel
            style={[
              styles.answerZone,
              hasAnswered && (isCorrect ? styles.answerZoneCorrect : styles.answerZoneWrong),
            ]}
          >
            {selectedWords.length === 0 ? (
              <Text style={styles.placeholderText}>Tap words to build your sentence</Text>
            ) : (
              <View style={styles.wordRow}>
                {selectedWords.map((word, index) => (
                  <WordTile
                    key={`selected-${index}`}
                    word={word}
                    isSelected={false}
                    isPlaced={true}
                    onPress={() => handleRemoveWord(word, index)}
                    disabled={hasAnswered}
                    index={index}
                  />
                ))}
              </View>
            )}
          </GlassPanel>

          {/* Reset button */}
          {selectedWords.length > 0 && !hasAnswered && (
            <Pressable onPress={handleReset} style={styles.resetButton}>
              <RotateCcw size={16} color={colors.text.muted} />
              <Text style={styles.resetButtonText}>Reset</Text>
            </Pressable>
          )}
        </MotiView>

        {/* Show correct answer if wrong */}
        {hasAnswered && !isCorrect && (
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            style={styles.correctAnswerSection}
          >
            <Text style={styles.correctLabel}>Correct answer:</Text>
            <Text style={styles.correctAnswer}>
              {currentQuestion.correctOrder.join(" ")}
            </Text>
          </MotiView>
        )}

        {/* Available words */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 200 })}
          style={styles.wordsSection}
        >
          <Text style={styles.sectionLabel}>Available words:</Text>
          <View style={styles.wordRow}>
            {availableWords.map((word, index) => (
              <WordTile
                key={`available-${word}-${index}`}
                word={word}
                isSelected={false}
                isPlaced={false}
                onPress={() => handleSelectWord(word, index)}
                disabled={hasAnswered}
                index={index}
              />
            ))}
          </View>
        </MotiView>

        {/* Action Button */}
        <View style={styles.actionSection}>
          {!hasAnswered ? (
            <PrimaryButton
              label="Check"
              onPress={handleCheck}
              disabled={!allWordsPlaced}
            />
          ) : (
            <MotiView
              from={motionFrom.fadeUp}
              animate={{ opacity: 1, translateY: 0 }}
              transition={getTransition()}
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
      </View>

      {/* Feedback Overlay */}
      <AnswerFeedback
        isCorrect={isCorrect}
        correctAnswer={!isCorrect ? currentQuestion.correctOrder.join(" ") : undefined}
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
  promptLabel: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.muted,
    marginTop: 20,
    marginBottom: 8,
  },
  promptText: {
    fontFamily: "Satoshi-Bold",
    fontSize: 24,
    color: colors.text.primary,
    lineHeight: 32,
    marginBottom: 24,
  },
  answerZone: {
    minHeight: 100,
    padding: 16,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  answerZoneCorrect: {
    borderColor: colors.success,
    borderStyle: "solid",
    backgroundColor: "rgba(16, 185, 129, 0.08)",
  },
  answerZoneWrong: {
    borderColor: colors.error,
    borderStyle: "solid",
    backgroundColor: "rgba(239, 68, 68, 0.08)",
  },
  placeholderText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 15,
    color: colors.text.muted,
  },
  wordRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 6,
  },
  resetButtonText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.muted,
  },
  correctAnswerSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderRadius: 12,
  },
  correctLabel: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
    marginBottom: 4,
  },
  correctAnswer: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 16,
    color: colors.success,
  },
  wordsSection: {
    marginTop: 32,
  },
  sectionLabel: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 12,
  },
  actionSection: {
    marginTop: "auto",
    paddingTop: 20,
  },
});

