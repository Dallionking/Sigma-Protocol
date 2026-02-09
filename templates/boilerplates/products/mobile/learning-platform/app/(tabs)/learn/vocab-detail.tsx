import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Bookmark, BookmarkCheck, Flag, Volume2 } from "lucide-react-native";

import { GradientBackground } from "@/components/GradientBackground";
import { DevHubButton } from "@/components/DevHubButton";
import { GlassPanel } from "@/components/GlassPanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import { LearnHeader } from "@/components/learn/LearnHeader";
import { MOCK_VOCAB } from "@/lib/learn/mockContent";
import { useLearnStore } from "@/stores/learnStore";
import { colors } from "@/theme/tokens";

export default function LearnVocabDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ vocabId?: string }>();

  const savedVocabIds = useLearnStore((s) => s.savedVocabIds);
  const flaggedVocabIds = useLearnStore((s) => s.flaggedVocabIds);
  const toggleSavedVocab = useLearnStore((s) => s.toggleSavedVocab);
  const toggleFlaggedVocab = useLearnStore((s) => s.toggleFlaggedVocab);

  const vocabId = useMemo(() => {
    const raw = params.vocabId;
    if (typeof raw === "string") return raw;
    return MOCK_VOCAB[0]?.id ?? null;
  }, [params.vocabId]);

  const vocab = useMemo(() => {
    return vocabId ? MOCK_VOCAB.find((v) => v.id === vocabId) ?? null : null;
  }, [vocabId]);

  const saved = vocab ? !!savedVocabIds[vocab.id] : false;
  const flagged = vocab ? !!flaggedVocabIds[vocab.id] : false;

  return (
    <GradientBackground>
      <DevHubButton />

      <View style={styles.container}>
        <LearnHeader title={vocab?.term ?? "Word"} subtitle={vocab?.definition ?? undefined} />

        <View style={styles.content}>
          {vocab ? (
            <>
              <GlassPanel style={styles.card} glow glowColor={colors.secondary[500]}>
                <View style={styles.topRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.term}>{vocab.term}</Text>
                    <Text style={styles.definition}>{vocab.definition}</Text>
                    {vocab.pronunciation_ipa ? (
                      <Text style={styles.ipa}>{vocab.pronunciation_ipa}</Text>
                    ) : null}
                  </View>

                  <View style={styles.iconColumn}>
                    <Volume2 size={20} color={colors.text.muted} />
                    {flagged ? <Flag size={20} color={colors.warning} /> : null}
                    {saved ? (
                      <BookmarkCheck size={20} color={colors.secondary[400]} />
                    ) : (
                      <Bookmark size={20} color={colors.text.muted} />
                    )}
                  </View>
                </View>

                <View style={styles.detailsRow}>
                  {vocab.part_of_speech ? (
                    <Detail label="Part of speech" value={vocab.part_of_speech} />
                  ) : null}
                  {vocab.difficulty ? <Detail label="Level" value={vocab.difficulty} /> : null}
                </View>

                {vocab.example_term ? (
                  <View style={{ marginTop: 16 }}>
                    <Text style={styles.sectionTitle}>Example</Text>
                    <Text style={styles.exampleTerm}>{vocab.example_term}</Text>
                    {vocab.example_definition ? (
                      <Text style={styles.exampleDefinition}>{vocab.example_definition}</Text>
                    ) : null}
                  </View>
                ) : null}

                {vocab.notes ? (
                  <View style={{ marginTop: 16 }}>
                    <Text style={styles.sectionTitle}>Notes</Text>
                    <Text style={styles.notes}>{vocab.notes}</Text>
                  </View>
                ) : null}

                <View style={styles.actions}>
                  <PrimaryButton
                    label="Flashcards"
                    onPress={() =>
                      router.push(`/learn/vocab-flashcard?focus=${encodeURIComponent(vocab.id)}`)
                    }
                  />

                  <View style={styles.actionRow}>
                    <SecondaryButton
                      label={saved ? "Unsave" : "Save"}
                      variant="outline"
                      onPress={() => toggleSavedVocab(vocab.id)}
                      style={{ flex: 1 }}
                    />
                    <SecondaryButton
                      label={flagged ? "Unflag" : "Flag"}
                      variant="outline"
                      onPress={() => toggleFlaggedVocab(vocab.id)}
                      style={{ flex: 1 }}
                    />
                  </View>
                </View>
              </GlassPanel>
            </>
          ) : (
            <Text style={styles.empty}>Word not found.</Text>
          )}
        </View>
      </View>
    </GradientBackground>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
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
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  iconColumn: {
    width: 28,
    alignItems: "flex-end",
    gap: 10,
    paddingTop: 6,
  },
  term: {
    fontFamily: "Satoshi-Bold",
    fontSize: 30,
    color: colors.text.primary,
    letterSpacing: -0.6,
  },
  definition: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 6,
  },
  ipa: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.muted,
    marginTop: 6,
  },
  detailsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 16,
  },
  detail: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  detailLabel: {
    fontFamily: "PlusJakartaSans",
    fontSize: 11,
    color: colors.text.muted,
  },
  detailValue: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 13,
    color: colors.text.primary,
    marginTop: 4,
    textTransform: "capitalize",
  },
  sectionTitle: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 13,
    color: colors.text.primary,
    marginBottom: 10,
  },
  exampleTerm: {
    fontFamily: "Satoshi-Bold",
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 22,
  },
  exampleDefinition: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 6,
    lineHeight: 20,
  },
  notes: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  actions: {
    marginTop: 18,
    gap: 12,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  empty: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.muted,
  },
});



