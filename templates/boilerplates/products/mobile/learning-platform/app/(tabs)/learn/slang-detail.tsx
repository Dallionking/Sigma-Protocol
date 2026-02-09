import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Volume2 } from "lucide-react-native";

import { GradientBackground } from "@/components/GradientBackground";
import { DevHubButton } from "@/components/DevHubButton";
import { GlassPanel } from "@/components/GlassPanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { LearnHeader } from "@/components/learn/LearnHeader";
import { MOCK_SLANG_PHRASES, MOCK_SLANG_REGIONS } from "@/lib/learn/mockContent";
import { colors } from "@/theme/tokens";

export default function LearnSlangDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phraseId?: string }>();

  const phraseId = useMemo(() => {
    const raw = params.phraseId;
    if (typeof raw === "string") return raw;
    return MOCK_SLANG_PHRASES[0]?.id ?? null;
  }, [params.phraseId]);

  const phrase = useMemo(() => {
    return phraseId ? MOCK_SLANG_PHRASES.find((p) => p.id === phraseId) ?? null : null;
  }, [phraseId]);

  const region = useMemo(() => {
    if (!phrase) return null;
    return MOCK_SLANG_REGIONS.find((r) => r.id === phrase.region_id) ?? null;
  }, [phrase]);

  return (
    <GradientBackground>
      <DevHubButton />

      <View style={styles.container}>
        <LearnHeader title={phrase?.phrase ?? "Slang"} subtitle={region?.name ?? undefined} />

        <View style={styles.content}>
          {phrase ? (
            <GlassPanel style={styles.card} glow glowColor={colors.secondary[500]}>
              <Text style={styles.phrase}>{phrase.phrase}</Text>
              <Text style={styles.meaning}>{phrase.meaning}</Text>

              {phrase.literal_translation ? (
                <Text style={styles.literal}>Literal: {phrase.literal_translation}</Text>
              ) : null}

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>When to use</Text>
                <Text style={styles.body}>
                  {phrase.cultural_note ??
                    "Use it casually with friends. Pay attention to tone and setting."}
                </Text>
              </View>

              {phrase.example_usage ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Example</Text>
                  <Text style={styles.example}>{phrase.example_usage}</Text>
                </View>
              ) : null}

              <View style={styles.actions}>
                <PrimaryButton label="Play audio (mock)" onPress={() => {}} />
                <View style={styles.inlineRow}>
                  <Volume2 size={18} color={colors.text.muted} />
                  <Text style={styles.bodyMuted}>Audio will be wired to `expo-av` later.</Text>
                </View>
              </View>
            </GlassPanel>
          ) : (
            <Text style={styles.empty}>Phrase not found.</Text>
          )}
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
  phrase: {
    fontFamily: "Satoshi-Bold",
    fontSize: 28,
    color: colors.text.primary,
    letterSpacing: -0.4,
  },
  meaning: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 8,
  },
  literal: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.muted,
    marginTop: 10,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 13,
    color: colors.text.primary,
    marginBottom: 10,
  },
  body: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  example: {
    fontFamily: "Satoshi-Bold",
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 22,
  },
  actions: {
    marginTop: 18,
    gap: 12,
  },
  inlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bodyMuted: {
    flex: 1,
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
    lineHeight: 16,
  },
  empty: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.muted,
  },
});



