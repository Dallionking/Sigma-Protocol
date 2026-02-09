import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Bookmark, BookmarkCheck, Flag, Volume2 } from "lucide-react-native";

import { GradientBackground } from "@/components/GradientBackground";
import { DevHubButton } from "@/components/DevHubButton";
import { GlassPanel } from "@/components/GlassPanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import { LearnHeader } from "@/components/learn/LearnHeader";
import { TextField } from "@/components/TextField";
import { MOCK_VOCAB } from "@/lib/learn/mockContent";
import { useLearnStore } from "@/stores/learnStore";
import { colors } from "@/theme/tokens";

export default function LearnVocabListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ lessonId?: string }>();

  const savedVocabIds = useLearnStore((s) => s.savedVocabIds);
  const flaggedVocabIds = useLearnStore((s) => s.flaggedVocabIds);

  const lessonId = useMemo(() => {
    const raw = params.lessonId;
    if (typeof raw === "string") return raw;
    return null;
  }, [params.lessonId]);

  const [query, setQuery] = useState("");

  const vocab = useMemo(() => {
    const base = lessonId ? MOCK_VOCAB.filter((v) => v.lesson_id === lessonId) : MOCK_VOCAB;
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (v) => v.term.toLowerCase().includes(q) || v.definition.toLowerCase().includes(q)
    );
  }, [lessonId, query]);

  return (
    <GradientBackground>
      <DevHubButton />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 180 }}
        showsVerticalScrollIndicator={false}
      >
        <LearnHeader
          title="Vocabulary"
          subtitle={lessonId ? "From this lesson" : "Browse + search"}
        />

        <View style={styles.content}>
          <GlassPanel style={styles.searchCard}>
            <TextField
              label="Search"
              placeholder="quisiera, mesa, bathroom..."
              value={query}
              onChangeText={setQuery}
            />

            <PrimaryButton
              label="Flashcard mode"
              onPress={() => {
                if (lessonId) {
                  router.push({ pathname: "/learn/vocab-flashcard", params: { lessonId } });
                } else {
                  router.push("/learn/vocab-flashcard");
                }
              }}
            />

            <View style={{ marginTop: 10 }}>
              <SecondaryButton
                label="Saved words"
                variant="outline"
                onPress={() => router.push({ pathname: "/learn/vocab-flashcard", params: { mode: "saved" } })}
              />
            </View>
          </GlassPanel>

          <View style={{ marginTop: 18 }}>
            <Text style={styles.sectionTitle}>{vocab.length} words</Text>

            <View style={{ gap: 12, marginTop: 12 }}>
              {vocab.map((v) => {
                const saved = !!savedVocabIds[v.id];
                const flagged = !!flaggedVocabIds[v.id];

                return (
                  <Pressable
                    key={v.id}
                    onPress={() =>
                      router.push(`/learn/vocab-detail?vocabId=${encodeURIComponent(v.id)}`)
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`${v.term} - ${v.definition}`}
                  >
                    <GlassPanel style={styles.row}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.term} numberOfLines={1}>
                          {v.term}
                        </Text>
                        <Text style={styles.definition} numberOfLines={1}>
                          {v.definition}
                        </Text>
                      </View>

                      <View style={styles.icons}>
                        <Volume2 size={18} color={colors.text.muted} />
                        {flagged ? <Flag size={18} color={colors.warning} /> : null}
                        {saved ? (
                          <BookmarkCheck size={18} color={colors.secondary[400]} />
                        ) : (
                          <Bookmark size={18} color={colors.text.muted} />
                        )}
                      </View>
                    </GlassPanel>
                  </Pressable>
                );
              })}
            </View>
          </View>
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
  searchCard: {
    padding: 16,
    borderRadius: 22,
  },
  sectionTitle: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
    color: colors.text.primary,
  },
  row: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  term: {
    fontFamily: "Satoshi-Bold",
    fontSize: 16,
    color: colors.text.primary,
    letterSpacing: -0.2,
  },
  definition: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 4,
  },
  icons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});



