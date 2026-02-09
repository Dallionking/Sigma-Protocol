import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { DevHubButton } from "@/components/DevHubButton";
import { GlassPanel } from "@/components/GlassPanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import { DefinitionModal } from "@/components/learn/DefinitionModal";
import { LearnHeader } from "@/components/learn/LearnHeader";
import { getLessonById, MOCK_LESSONS } from "@/lib/learn/mockContent";
import type { LessonHighlight, LessonSection } from "@/lib/schemas/learn";
import { useLearnStore } from "@/stores/learnStore";
import { colors } from "@/theme/tokens";

export default function LearnLessonContentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ lessonId?: string }>();

  const startLesson = useLearnStore((s) => s.startLesson);
  const setLessonPosition = useLearnStore((s) => s.setLessonPosition);
  const setLessonCompletionPercent = useLearnStore((s) => s.setLessonCompletionPercent);

  // Read initial progress once to avoid infinite loop
  const progressByLessonIdRef = useRef(useLearnStore.getState().progressByLessonId);

  const lessonId = useMemo(() => {
    const raw = params.lessonId;
    if (typeof raw === "string") return raw;
    return MOCK_LESSONS[0]?.id ?? null;
  }, [params.lessonId]);

  const lesson = useMemo(() => {
    return lessonId ? getLessonById(lessonId) : null;
  }, [lessonId]);

  const sections = lesson?.content.sections ?? [];
  const highlights = lesson?.content.highlights ?? [];

  const [stepIndex, setStepIndex] = useState(0);
  const [selectedHighlight, setSelectedHighlight] = useState<LessonHighlight | null>(null);
  const hasInitialized = useRef(false);

  // Initialize / resume position (runs once per lesson)
  useEffect(() => {
    if (!lesson || hasInitialized.current) return;
    hasInitialized.current = true;

    startLesson(lesson.id);

    const saved = progressByLessonIdRef.current[lesson.id]?.last_position?.section_index;
    const initial =
      typeof saved === "number" && Number.isFinite(saved)
        ? Math.max(0, Math.min(sections.length - 1, saved))
        : 0;
    setStepIndex(initial);
  }, [lesson, sections.length, startLesson]);

  // Persist progress
  useEffect(() => {
    if (!lesson) return;
    setLessonPosition(lesson.id, { section_index: stepIndex });

    if (sections.length <= 1) {
      setLessonCompletionPercent(lesson.id, 99);
      return;
    }

    const pct = Math.round((stepIndex / (sections.length - 1)) * 99);
    setLessonCompletionPercent(lesson.id, pct);
  }, [lesson, sections.length, setLessonCompletionPercent, setLessonPosition, stepIndex]);

  const currentSection: LessonSection | null = sections[stepIndex] ?? null;

  const splitByHighlights = useCallback((text: string, hs: LessonHighlight[]) => {
    if (!hs.length) return [{ text, highlight: null as LessonHighlight | null }];

    const remainingText = text;
    const lower = remainingText.toLowerCase();
    const normalized = hs
      .slice()
      .filter((h) => !!h.term)
      .sort((a, b) => b.term.length - a.term.length);

    const out: { text: string; highlight: LessonHighlight | null }[] = [];
    let cursor = 0;

    while (cursor < remainingText.length) {
      let best: { index: number; highlight: LessonHighlight } | null = null;

      for (const h of normalized) {
        const idx = lower.indexOf(h.term.toLowerCase(), cursor);
        if (idx === -1) continue;
        if (!best || idx < best.index || (idx === best.index && h.term.length > best.highlight.term.length)) {
          best = { index: idx, highlight: h };
        }
      }

      if (!best) {
        out.push({ text: remainingText.slice(cursor), highlight: null });
        break;
      }

      if (best.index > cursor) {
        out.push({ text: remainingText.slice(cursor, best.index), highlight: null });
      }

      out.push({
        text: remainingText.slice(best.index, best.index + best.highlight.term.length),
        highlight: best.highlight,
      });

      cursor = best.index + best.highlight.term.length;
    }

    return out;
  }, []);

  const renderSection = useCallback(
    (section: LessonSection) => {
      switch (section.type) {
        case "text": {
          const segments = splitByHighlights(section.content, highlights);
          return (
            <Text style={styles.paragraph}>
              {segments.map((seg, idx) => (
                <Text
                  key={`${idx}-${seg.text}`}
                  style={seg.highlight ? styles.highlight : undefined}
                  onPress={seg.highlight ? () => setSelectedHighlight(seg.highlight) : undefined}
                >
                  {seg.text}
                </Text>
              ))}
            </Text>
          );
        }
        case "example":
          return (
            <View style={{ gap: 10 }}>
              <Text style={styles.exampleTerm}>{section.term}</Text>
              <Text style={styles.exampleDefinition}>{section.definition}</Text>
            </View>
          );
        case "audio":
          return (
            <View style={{ gap: 12 }}>
              <Text style={styles.paragraph}>Audio section</Text>
              <PrimaryButton
                label="Open audio player"
                onPress={() => {
                  if (!lesson) return;
                  router.push(`/learn/lesson-audio?lessonId=${encodeURIComponent(lesson.id)}`);
                }}
              />
            </View>
          );
        default:
          return <Text style={styles.paragraph}>Unsupported content.</Text>;
      }
    },
    [highlights, lesson, router, splitByHighlights]
  );

  const handlePrev = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  const handleNext = useCallback(() => {
    if (!lesson) return;
    if (stepIndex < sections.length - 1) {
      setStepIndex((i) => Math.min(sections.length - 1, i + 1));
      return;
    }

    // Finish reading → assessment gate
    const categoryId = lesson.category_id ?? "";
    router.push(
      `/learn/assessment?lessonId=${encodeURIComponent(lesson.id)}&categoryId=${encodeURIComponent(categoryId)}`
    );
  }, [lesson, router, sections.length, stepIndex]);

  return (
    <GradientBackground>
      <DevHubButton />

      <View style={styles.root}>
        <LearnHeader
          title={lesson?.title ?? "Lesson Content"}
          subtitle={sections.length ? `${stepIndex + 1}/${sections.length}` : undefined}
        />

        <View style={styles.content}>
          <GlassPanel style={styles.worksheetCard} glow glowColor={colors.secondary[500]}>
            <Text style={styles.worksheetLabel}>Worksheet</Text>

            {currentSection ? (
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 8 }}
                showsVerticalScrollIndicator={false}
              >
                {renderSection(currentSection)}
              </ScrollView>
            ) : (
              <Text style={styles.empty}>No content yet.</Text>
            )}
          </GlassPanel>
        </View>

        <View style={[styles.navRow, { bottom: insets.bottom + 92 }]}>
          <SecondaryButton
            label="Prev"
            variant="outline"
            disabled={stepIndex <= 0}
            onPress={handlePrev}
            style={{ flex: 1 }}
          />
          <View style={{ width: 12 }} />
          <PrimaryButton
            label={stepIndex < sections.length - 1 ? "Next" : "Finish"}
            onPress={handleNext}
            style={{ flex: 1 }}
          />
        </View>
      </View>

      <DefinitionModal
        visible={!!selectedHighlight}
        term={selectedHighlight?.term ?? ""}
        translation={selectedHighlight?.translation ?? ""}
        note={selectedHighlight?.note}
        onClose={() => setSelectedHighlight(null)}
      />
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  worksheetCard: {
    flex: 1,
    padding: 18,
    borderRadius: 22,
  },
  worksheetLabel: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 12,
    color: colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 14,
  },
  paragraph: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 24,
  },
  highlight: {
    backgroundColor: "rgba(250, 204, 21, 0.14)",
    color: colors.text.primary,
  },
  exampleTerm: {
    fontFamily: "Satoshi-Bold",
    fontSize: 18,
    color: colors.text.primary,
    lineHeight: 24,
  },
  exampleDefinition: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  empty: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.muted,
  },
  navRow: {
    position: "absolute",
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
  },
});



