import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

import { GradientBackground } from "@/components/GradientBackground";
import { DevHubButton } from "@/components/DevHubButton";
import { LearnHeader } from "@/components/learn/LearnHeader";
import { FlashcardDeck, type Flashcard } from "@/components/learn/FlashcardDeck";
import { MOCK_VOCAB } from "@/lib/learn/mockContent";
import { useLearnStore } from "@/stores/learnStore";
import { colors } from "@/theme/tokens";

export default function LearnVocabFlashcardScreen() {
  const params = useLocalSearchParams<{ lessonId?: string; mode?: string; focus?: string }>();
  const savedVocabIds = useLearnStore((s) => s.savedVocabIds);

  const lessonId = useMemo(() => {
    const raw = params.lessonId;
    if (typeof raw === "string") return raw;
    return null;
  }, [params.lessonId]);

  const mode = useMemo(() => {
    const raw = params.mode;
    if (typeof raw === "string") return raw;
    return null;
  }, [params.mode]);

  const focus = useMemo(() => {
    const raw = params.focus;
    if (typeof raw === "string") return raw;
    return null;
  }, [params.focus]);

  const cards: Flashcard[] = useMemo(() => {
    let vocab = lessonId ? MOCK_VOCAB.filter((v) => v.lesson_id === lessonId) : MOCK_VOCAB;

    if (mode === "saved") {
      vocab = vocab.filter((v) => !!savedVocabIds[v.id]);
    }

    const base = vocab.map((v) => ({
      id: v.id,
      front: v.term,
      back: v.definition,
      note: v.example_term ? `${v.example_term}${v.example_definition ? `\n${v.example_definition}` : ""}` : v.notes ?? undefined,
    }));

    if (focus) {
      const idx = base.findIndex((c) => c.id === focus);
      if (idx > 0) {
        const [item] = base.splice(idx, 1);
        base.unshift(item);
      }
    }

    return base;
  }, [focus, lessonId, mode, savedVocabIds]);

  return (
    <GradientBackground>
      <DevHubButton />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 180 }}
        showsVerticalScrollIndicator={false}
      >
        <LearnHeader
          title="Flashcards"
          subtitle={mode === "saved" ? "Saved words" : lessonId ? "This lesson" : "All vocab"}
        />

        <View style={styles.content}>
          {cards.length ? (
            <FlashcardDeck cards={cards} />
          ) : (
            <Text style={styles.empty}>No flashcards available yet.</Text>
          )}
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  empty: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.muted,
  },
});



