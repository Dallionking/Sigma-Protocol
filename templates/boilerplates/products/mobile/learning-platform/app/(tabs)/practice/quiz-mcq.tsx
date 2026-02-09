import { MotiView } from "moti";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { PrimaryButton } from "@/components/PrimaryButton";
import { AnswerFeedback, OptionButton, PracticeHeader } from "@/components/practice";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { MCQ_QUESTIONS } from "@/lib/practice/mockExercises";
import { usePracticeStore } from "@/stores/practiceStore";
import { colors } from "@/theme/tokens";

const OPTION_LETTERS = ["A", "B", "C", "D"];

type OptionState = "default" | "selected" | "correct" | "wrong" | "disabled";

export default function QuizMCQScreen() {
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

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const questions = MCQ_QUESTIONS;
  const currentQuestion = questions[currentQuestionIndex];
  const isCorrect = selectedIndex === currentQuestion?.correctIndex;

  // Initialize session on mount
  useEffect(() => {
    startSession("mcq", questions.length);
  }, [startSession, questions.length]);

  const handleSelectOption = useCallback(
    (index: number) => {
      if (hasAnswered) return;

      setSelectedIndex(index);
      setHasAnswered(true);
      setShowFeedback(true);

      // Record the answer
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
      // Move to next question
      setTimeout(() => {
        nextQuestion();
        setSelectedIndex(null);
        setHasAnswered(false);
      }, 200);
    } else {
      // Session complete - go to results
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

  if (!currentQuestion) {
    return null;
  }

  return (
    <GradientBackground>
      <PracticeHeader
        currentQuestion={currentQuestionIndex}
        totalQuestions={totalQuestions || questions.length}
        title="Multiple Choice"
        showClose
        onClose={() => router.back()}
      />

      <View style={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
        {/* Question */}
        <MotiView
          key={currentQuestion.id}
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition()}
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
                delay: 100 + index * 30,
              })}
            >
              <OptionButton
                label={option}
                optionLetter={OPTION_LETTERS[index]}
                state={getOptionState(index)}
                onPress={() => handleSelectOption(index)}
                disabled={hasAnswered}
              />
            </MotiView>
          ))}
        </View>

        {/* Continue Button (appears after answering) */}
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
        explanation={currentQuestion.explanation}
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
  questionSection: {
    marginTop: 20,
    marginBottom: 32,
  },
  questionText: {
    fontFamily: "Satoshi-Bold",
    fontSize: 24,
    color: colors.text.primary,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  optionsSection: {
    flex: 1,
  },
  continueSection: {
    marginTop: "auto",
    paddingTop: 20,
  },
});

