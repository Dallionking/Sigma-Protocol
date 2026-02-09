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
import { ArrowRight, Lightbulb } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { GlassPanel } from "@/components/GlassPanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { AnswerFeedback, PracticeHeader } from "@/components/practice";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { TRANSLATION_QUESTIONS } from "@/lib/practice/mockExercises";
import { usePracticeStore } from "@/stores/practiceStore";
import { colors } from "@/theme/tokens";

// Normalize for comparison
function normalizeAnswer(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[¿¡]/g, "")
    .replace(/[.,!?]/g, "");
}

function checkTranslation(userAnswer: string, acceptableAnswers: string[]): boolean {
  const normalized = normalizeAnswer(userAnswer);
  return acceptableAnswers.some(
    (acceptable) => normalizeAnswer(acceptable) === normalized
  );
}

export default function TranslationScreen() {
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
  } = usePracticeStore();

  const [userInput, setUserInput] = useState("");
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [revealedHints, setRevealedHints] = useState<number[]>([]);

  const questions = TRANSLATION_QUESTIONS;
  const currentQuestion = questions[currentQuestionIndex];

  // Initialize session
  useEffect(() => {
    startSession("translation", questions.length);
  }, [startSession, questions.length]);

  // Reset on question change
  useEffect(() => {
    setUserInput("");
    setHasAnswered(false);
    setShowFeedback(false);
    setIsCorrect(false);
    setRevealedHints([]);
  }, [currentQuestionIndex]);

  const handleSubmit = useCallback(() => {
    if (hasAnswered || !userInput.trim()) return;

    Keyboard.dismiss();
    const correct = checkTranslation(userInput, currentQuestion.acceptableTranslations);
    setIsCorrect(correct);
    setHasAnswered(true);
    setShowFeedback(true);

    recordAnswer({
      questionId: currentQuestion.id,
      userAnswer: userInput,
      correctAnswer: currentQuestion.correctTranslation,
      isCorrect: correct,
    });
  }, [hasAnswered, userInput, currentQuestion, recordAnswer]);

  const handleRevealHint = useCallback(
    (index: number) => {
      if (revealedHints.includes(index)) return;
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      useHint();
      setRevealedHints((prev) => [...prev, index]);
    },
    [revealedHints, useHint]
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

  if (!currentQuestion) {
    return null;
  }

  const isFromSource = currentQuestion.sourceLanguage === "source";

  return (
    <GradientBackground>
      <PracticeHeader
        currentQuestion={currentQuestionIndex}
        totalQuestions={totalQuestions || questions.length}
        title="Translation"
        showClose
        onClose={() => router.back()}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}
      >
        <View style={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
          {/* Source phrase */}
          <MotiView
            key={currentQuestion.id}
            from={motionFrom.fadeUp}
            animate={{ opacity: 1, translateY: 0 }}
            transition={getTransition()}
          >
            <GlassPanel style={styles.sourceCard}>
              <View style={styles.languageBadge}>
                <Text style={styles.languageText}>
                  {isFromSource ? "Complex" : "Simplified"}
                </Text>
              </View>
              <Text style={styles.sourcePhrase}>{currentQuestion.source}</Text>
              <View style={styles.arrowContainer}>
                <ArrowRight size={20} color={colors.text.muted} />
              </View>
              <View style={styles.languageBadge}>
                <Text style={styles.languageText}>
                  {isFromSource ? "Simplified" : "Complex"}
                </Text>
              </View>
            </GlassPanel>
          </MotiView>

          {/* Hints */}
          {currentQuestion.hints.length > 0 && !hasAnswered && (
            <MotiView
              from={motionFrom.fade}
              animate={{ opacity: 1 }}
              transition={getTransition({ delay: 100 })}
              style={styles.hintsSection}
            >
              <Text style={styles.hintsLabel}>
                <Lightbulb size={14} color={colors.text.muted} /> Hints (-3 XP each):
              </Text>
              <View style={styles.hintsRow}>
                {currentQuestion.hints.map((hint, index) => (
                  <Pressable
                    key={index}
                    onPress={() => handleRevealHint(index)}
                    style={[
                      styles.hintChip,
                      revealedHints.includes(index) && styles.hintChipRevealed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.hintText,
                        revealedHints.includes(index) && styles.hintTextRevealed,
                      ]}
                    >
                      {revealedHints.includes(index) ? hint : `Hint ${index + 1}`}
                    </Text>
                  </Pressable>
                ))}
              </View>
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
              placeholder={`Type your ${isFromSource ? "Simplified" : "Complex"} translation...`}
              placeholderTextColor={colors.text.muted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              editable={!hasAnswered}
              autoCapitalize="sentences"
            />
          </MotiView>

          {/* Correct answer display */}
          {hasAnswered && !isCorrect && (
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              style={styles.correctSection}
            >
              <Text style={styles.correctLabel}>Correct translation:</Text>
              <Text style={styles.correctText}>
                {currentQuestion.correctTranslation}
              </Text>
            </MotiView>
          )}

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
        correctAnswer={!isCorrect ? currentQuestion.correctTranslation : undefined}
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
  sourceCard: {
    padding: 24,
    marginTop: 20,
    borderRadius: 20,
    alignItems: "center",
  },
  languageBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  languageText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sourcePhrase: {
    fontFamily: "Satoshi-Bold",
    fontSize: 22,
    color: colors.text.primary,
    textAlign: "center",
    lineHeight: 30,
    marginVertical: 16,
  },
  arrowContainer: {
    marginVertical: 8,
  },
  hintsSection: {
    marginTop: 20,
  },
  hintsLabel: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.muted,
    marginBottom: 10,
  },
  hintsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  hintChip: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  hintChipRevealed: {
    backgroundColor: "rgba(250, 204, 21, 0.12)",
    borderColor: "rgba(250, 204, 21, 0.3)",
  },
  hintText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.muted,
  },
  hintTextRevealed: {
    color: colors.accent[400],
  },
  inputSection: {
    marginTop: 24,
  },
  input: {
    backgroundColor: "rgba(17, 24, 39, 0.6)",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: colors.text.primary,
    minHeight: 100,
  },
  inputCorrect: {
    borderColor: colors.success,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  inputWrong: {
    borderColor: colors.error,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  correctSection: {
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
  correctText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 16,
    color: colors.success,
  },
  actionSection: {
    marginTop: "auto",
    paddingTop: 20,
  },
});

