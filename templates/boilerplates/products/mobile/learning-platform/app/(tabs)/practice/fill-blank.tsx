import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback, useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Lightbulb } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { GlassPanel } from "@/components/GlassPanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { AnswerFeedback, PracticeHeader } from "@/components/practice";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { FILL_BLANK_QUESTIONS } from "@/lib/practice/mockExercises";
import { usePracticeStore } from "@/stores/practiceStore";
import { colors } from "@/theme/tokens";

// Normalize string for comparison (remove accents, lowercase)
function normalizeAnswer(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function checkAnswer(userAnswer: string, acceptableAnswers: string[]): boolean {
  const normalized = normalizeAnswer(userAnswer);
  return acceptableAnswers.some(
    (acceptable) => normalizeAnswer(acceptable) === normalized
  );
}

export default function FillBlankScreen() {
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
    useHint,
    hintsUsed,
  } = usePracticeStore();

  const [userInput, setUserInput] = useState("");
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const questions = FILL_BLANK_QUESTIONS;
  const currentQuestion = questions[currentQuestionIndex];

  // Initialize session on mount
  useEffect(() => {
    startSession("fill-blank", questions.length);
  }, [startSession, questions.length]);

  const handleSubmit = useCallback(() => {
    if (hasAnswered || !userInput.trim()) return;

    Keyboard.dismiss();
    const correct = checkAnswer(userInput, currentQuestion.acceptableAnswers);
    setIsCorrect(correct);
    setHasAnswered(true);
    setShowFeedback(true);

    recordAnswer({
      questionId: currentQuestion.id,
      userAnswer: userInput,
      correctAnswer: currentQuestion.answer,
      isCorrect: correct,
    });
  }, [hasAnswered, userInput, currentQuestion, recordAnswer]);

  const handleShowHint = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    useHint();
    setShowHint(true);
  }, [useHint]);

  const handleContinue = useCallback(() => {
    setShowFeedback(false);

    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        nextQuestion();
        setUserInput("");
        setHasAnswered(false);
        setShowHint(false);
        setIsCorrect(false);
      }, 200);
    } else {
      router.replace("/practice/result");
    }
  }, [currentQuestionIndex, questions.length, nextQuestion, router]);

  // Render sentence with blank highlighted
  const renderSentence = () => {
    const parts = currentQuestion.sentence.split("__BLANK__");
    return (
      <Text style={styles.sentenceText}>
        {parts[0]}
        <Text style={styles.blankHighlight}>
          {hasAnswered ? (isCorrect ? userInput : currentQuestion.answer) : "____"}
        </Text>
        {parts[1]}
      </Text>
    );
  };

  if (!currentQuestion) {
    return null;
  }

  return (
    <GradientBackground>
      <PracticeHeader
        currentQuestion={currentQuestionIndex}
        totalQuestions={totalQuestions || questions.length}
        title="Fill in the Blank"
        showClose
        onClose={() => router.back()}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}
      >
        <View style={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
          {/* Sentence */}
          <MotiView
            key={currentQuestion.id}
            from={motionFrom.fadeUp}
            animate={{ opacity: 1, translateY: 0 }}
            transition={getTransition()}
          >
            <GlassPanel style={styles.sentenceCard}>
              {renderSentence()}
            </GlassPanel>
          </MotiView>

          {/* Hint */}
          {currentQuestion.hint && !hasAnswered && (
            <MotiView
              from={motionFrom.fade}
              animate={{ opacity: 1 }}
              transition={getTransition({ delay: 100 })}
              style={styles.hintSection}
            >
              {showHint ? (
                <View style={styles.hintRevealed}>
                  <Lightbulb size={16} color={colors.accent[400]} />
                  <Text style={styles.hintText}>{currentQuestion.hint}</Text>
                </View>
              ) : (
                <Pressable onPress={handleShowHint} style={styles.hintButton}>
                  <Lightbulb size={16} color={colors.text.muted} />
                  <Text style={styles.hintButtonText}>Show hint (-3 XP)</Text>
                </Pressable>
              )}
            </MotiView>
          )}

          {/* Input */}
          <MotiView
            from={motionFrom.fadeUp}
            animate={{ opacity: 1, translateY: 0 }}
            transition={getTransition({ delay: 150 })}
            style={styles.inputSection}
          >
            <TextInput
              style={[
                styles.input,
                hasAnswered && (isCorrect ? styles.inputCorrect : styles.inputWrong),
              ]}
              value={userInput}
              onChangeText={setUserInput}
              placeholder="Type your answer..."
              placeholderTextColor={colors.text.muted}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!hasAnswered}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
          </MotiView>

          {/* Action Button */}
          <View style={styles.actionSection}>
            {!hasAnswered ? (
              <PrimaryButton
                label="Check"
                onPress={handleSubmit}
                disabled={!userInput.trim()}
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
      </KeyboardAvoidingView>

      {/* Feedback Overlay */}
      <AnswerFeedback
        isCorrect={isCorrect}
        correctAnswer={!isCorrect ? currentQuestion.answer : undefined}
        visible={showFeedback}
      />
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sentenceCard: {
    padding: 24,
    marginTop: 20,
    borderRadius: 20,
  },
  sentenceText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 22,
    color: colors.text.primary,
    lineHeight: 32,
    textAlign: "center",
  },
  blankHighlight: {
    fontFamily: "PlusJakartaSans-SemiBold",
    color: colors.secondary[400],
    backgroundColor: "rgba(6, 182, 212, 0.15)",
    paddingHorizontal: 4,
  },
  hintSection: {
    marginTop: 20,
    alignItems: "center",
  },
  hintButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
  },
  hintButtonText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.muted,
  },
  hintRevealed: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(250, 204, 21, 0.1)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  hintText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.accent[400],
  },
  inputSection: {
    marginTop: 32,
  },
  input: {
    backgroundColor: "rgba(17, 24, 39, 0.6)",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontFamily: "PlusJakartaSans",
    fontSize: 18,
    color: colors.text.primary,
    textAlign: "center",
  },
  inputCorrect: {
    borderColor: colors.success,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  inputWrong: {
    borderColor: colors.error,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  actionSection: {
    marginTop: "auto",
    paddingTop: 20,
  },
});

