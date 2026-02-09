import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MessageSquareQuote } from "lucide-react-native";

import { GradientBackground } from "@/components/GradientBackground";
import { DevHubButton } from "@/components/DevHubButton";
import { GlassPanel } from "@/components/GlassPanel";
import { LearnHeader } from "@/components/learn/LearnHeader";
import { getSlangPhrasesByRegionId, MOCK_SLANG_PHRASES, MOCK_SLANG_REGIONS } from "@/lib/learn/mockContent";
import { hasTierAccess, useLearnStore } from "@/stores/learnStore";
import { colors } from "@/theme/tokens";

export default function LearnSlangListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ regionId?: string }>();
  const activeTier = useLearnStore((s) => s.activeTier);

  const regionId = useMemo(() => {
    const raw = params.regionId;
    if (typeof raw === "string") return raw;
    return MOCK_SLANG_REGIONS[0]?.id ?? null;
  }, [params.regionId]);

  const region = useMemo(() => {
    return regionId ? MOCK_SLANG_REGIONS.find((r) => r.id === regionId) ?? null : null;
  }, [regionId]);

  const phrases = useMemo(() => {
    if (!regionId) return [];
    return getSlangPhrasesByRegionId(regionId).filter((p) => p.is_active);
  }, [regionId]);

  const locked = useMemo(() => {
    if (!region) return false;
    return !hasTierAccess(activeTier, region.tier_required);
  }, [activeTier, region]);

  return (
    <GradientBackground>
      <DevHubButton />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 180 }}
        showsVerticalScrollIndicator={false}
      >
        <LearnHeader title="Slang" subtitle={region?.name ?? undefined} />

        <View style={styles.content}>
          {locked ? (
            <GlassPanel style={styles.card}>
              <Text style={styles.body}>
                This region is locked. Upgrade to {region?.tier_required.toUpperCase()} to access slang modules.
              </Text>
              <Text style={styles.bodyMuted}>Tip: You can still study free lessons in Learn.</Text>
            </GlassPanel>
          ) : phrases.length ? (
            <View style={{ gap: 12 }}>
              {phrases.map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => router.push(`/learn/slang-detail?phraseId=${encodeURIComponent(p.id)}`)}
                  accessibilityRole="button"
                  accessibilityLabel={p.phrase}
                >
                  <GlassPanel style={styles.row}>
                    <View style={styles.rowIcon}>
                      <MessageSquareQuote size={18} color={colors.secondary[400]} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.phrase}>{p.phrase}</Text>
                      <Text style={styles.meaning}>{p.meaning}</Text>
                    </View>
                  </GlassPanel>
                </Pressable>
              ))}
            </View>
          ) : (
            <Text style={styles.empty}>No phrases found.</Text>
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
  card: {
    padding: 18,
    borderRadius: 22,
  },
  body: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  bodyMuted: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.muted,
    lineHeight: 18,
    marginTop: 10,
  },
  row: {
    padding: 16,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(34, 211, 238, 0.12)",
  },
  phrase: {
    fontFamily: "Satoshi-Bold",
    fontSize: 16,
    color: colors.text.primary,
    letterSpacing: -0.2,
  },
  meaning: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 4,
  },
  empty: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.muted,
  },
});



