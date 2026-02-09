import * as Haptics from "expo-haptics";
import React, { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CheckCircle2, XCircle } from "lucide-react-native";

import { GradientBackground } from "@/components/GradientBackground";
import { DevHubButton } from "@/components/DevHubButton";
import { GlassPanel } from "@/components/GlassPanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import { LearnHeader } from "@/components/learn/LearnHeader";
import { getLessonById, getLessonsByCategoryId, MOCK_LESSONS, MOCK_VOCAB } from "@/lib/learn/mockContent";
import { useLearnStore } from "@/stores/learnStore";
import { colors } from "@/theme/tokens";

export default function LearnAssessmentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ lessonId?: string; categoryId?: string }>();

  const recordAttempt = useLearnStore((s) => s.recordAssessmentAttempt);

  const lessonId = useMemo(() => {
    const raw = params.lessonId;
    if (typeof raw === "string") return raw;
    return MOCK_LESSONS[0]?.id ?? null;
  }, [params.lessonId]);

  const lesson = useMemo(() => {
    return lessonId ? getLessonById(lessonId) : null;
  }, [lessonId]);

  const categoryId = useMemo(() => {
    const raw = params.categoryId;
    if (typeof raw === "string") return raw;
    return lesson?.category_id ?? null;
  }, [lesson?.category_id, params.categoryId]);

  type Question = { id: string; prompt: string; options: string[]; correct: string };

  const questions: Question[] = useMemo(() => {
    if (!categoryId) return [];
    const lessonIds = new Set(getLessonsByCategoryId(categoryId).map((l) => l.id));
    const vocab = MOCK_VOCAB.filter((v) => (v.lesson_id ? lessonIds.has(v.lesson_id) : false));

    // Build up to 5 questions.
    const pool = vocab.slice(0, 5);
    if (!pool.length) return [];

    return pool.map((v) => {
      const other = vocab
        .filter((o) => o.id !== v.id)
        .map((o) => o.definition)
        .slice(0, 3);

      const options = [v.definition, ...other];
      // naive shuffle
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }

      return {
        id: `q-${v.id}`,
        prompt: `What does "${v.term}" mean?`,
        options,
        correct: v.definition,
      };
    });
  }, [categoryId]);

  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const current = questions[qIndex] ?? null;
  const isLast = qIndex >= questions.length - 1;

  const scorePercent = useMemo(() => {
    if (!questions.length) return 0;
    return Math.round((correctCount / questions.length) * 100);
  }, [correctCount, questions.length]);

  const passed = scorePercent >= 80 && questions.length > 0;

  const handleSelect = useCallback(
    (option: string) => {
      if (submitted) return;
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelected(option);
    },
    [submitted]
  );

  const handleSubmit = useCallback(() => {
    if (!current || !selected) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const isCorrect = selected === current.correct;
    setSubmitted(true);
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [current, selected]);

  const handleNext = useCallback(() => {
    if (!submitted) return;

    if (isLast) {
      // Finish attempt
      if (categoryId) recordAttempt(categoryId, scorePercent, passed);

      if (passed) {
        router.replace(`/learn/lesson-complete?lessonId=${encodeURIComponent(lessonId ?? "")}`);
      } else {
        // allow retry
        setQIndex(0);
        setSelected(null);
        setSubmitted(false);
        setCorrectCount(0);
      }
      return;
    }

    setQIndex((i) => i + 1);
    setSelected(null);
    setSubmitted(false);
  }, [categoryId, isLast, lessonId, passed, recordAttempt, router, scorePercent, submitted]);

  return (
    <GradientBackground>
      <DevHubButton />

      <View style={styles.container}>
        <LearnHeader title="Assessment" subtitle={lesson?.title ?? "Unlock the next module"} />

        <View style={styles.content}>
          <GlassPanel style={styles.card} glow glowColor={colors.secondary[500]}>
            <Text style={styles.rules}>Pass threshold: 80%</Text>

            {current ? (
              <>
                <Text style={styles.progress}>
                  Question {qIndex + 1}/{questions.length}
                </Text>
                <Text style={styles.prompt}>{current.prompt}</Text>

                <View style={styles.options}>
                  {current.options.map((opt) => {
                    const isSelected = selected === opt;
                    const isCorrect = submitted && opt === current.correct;
                    const isWrong = submitted && isSelected && opt !== current.correct;

                    return (
                      <Pressable
                        key={opt}
                        onPress={() => handleSelect(opt)}
                        accessibilityRole="button"
                        accessibilityLabel={opt}
                        style={[
                          styles.option,
                          isSelected && styles.optionSelected,
                          isCorrect && styles.optionCorrect,
                          isWrong && styles.optionWrong,
                        ]}
                      >
                        <Text style={styles.optionText}>{opt}</Text>
                        {submitted && isCorrect ? (
                          <CheckCircle2 size={18} color={colors.success} />
                        ) : submitted && isWrong ? (
                          <XCircle size={18} color={colors.error} />
                        ) : null}
                      </Pressable>
                    );
                  })}
                </View>

                <View style={styles.buttonStack}>
                  {!submitted ? (
                    <PrimaryButton
                      label={selected ? "Submit" : "Select an answer"}
                      disabled={!selected}
                      onPress={handleSubmit}
                    />
                  ) : (
                    <PrimaryButton label={isLast ? (passed ? "Finish" : "Retry") : "Next"} onPress={handleNext} />
                  )}

                  <SecondaryButton label="Back" variant="outline" onPress={() => router.back()} />
                </View>
              </>
            ) : (
              <Text style={styles.empty}>No assessment questions yet for this module.</Text>
            )}
          </GlassPanel>
        </View>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 180,
  },
  card: {
    padding: 18,
    borderRadius: 22,
  },
  rules: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 12,
    color: colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  progress: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 12,
  },
  prompt: {
    fontFamily: "Satoshi-Bold",
    fontSize: 18,
    color: colors.text.primary,
    letterSpacing: -0.2,
    marginTop: 10,
    lineHeight: 24,
  },
  options: {
    gap: 10,
    marginTop: 16,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  optionSelected: {
    borderColor: "rgba(34, 211, 238, 0.45)",
    backgroundColor: "rgba(34, 211, 238, 0.10)",
  },
  optionCorrect: {
    borderColor: "rgba(16, 185, 129, 0.55)",
    backgroundColor: "rgba(16, 185, 129, 0.10)",
  },
  optionWrong: {
    borderColor: "rgba(239, 68, 68, 0.55)",
    backgroundColor: "rgba(239, 68, 68, 0.10)",
  },
  optionText: {
    flex: 1,
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  buttonStack: {
    marginTop: 16,
    gap: 10,
  },
  empty: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.muted,
    marginTop: 12,
  },
});



