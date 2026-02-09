import React, { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

import { GradientBackground } from "@/components/GradientBackground";
import { DevHubButton } from "@/components/DevHubButton";
import { GlassPanel } from "@/components/GlassPanel";
import { DefinitionModal } from "@/components/learn/DefinitionModal";
import { LearnHeader } from "@/components/learn/LearnHeader";
import { getStoryById, MOCK_STORIES } from "@/lib/learn/mockContent";
import type { Story } from "@/lib/schemas/learn";
import { colors } from "@/theme/tokens";

export default function LearnStoryReaderScreen() {
  const params = useLocalSearchParams<{ storyId?: string }>();

  const storyId = useMemo(() => {
    const raw = params.storyId;
    if (typeof raw === "string") return raw;
    return MOCK_STORIES[0]?.id ?? null;
  }, [params.storyId]);

  const story = useMemo(() => {
    return storyId ? getStoryById(storyId) : null;
  }, [storyId]);

  const [selected, setSelected] = useState<{ term: string; translation: string } | null>(null);

  const splitByGlossary = useCallback((text: string, s: Story) => {
    const glossary = s.glossary ?? [];
    if (!glossary.length) return [{ text, item: null as { term: string; translation: string } | null }];

    const lower = text.toLowerCase();
    const normalized = glossary
      .slice()
      .filter((g) => !!g.term)
      .sort((a, b) => b.term.length - a.term.length);

    const out: { text: string; item: { term: string; translation: string } | null }[] = [];
    let cursor = 0;

    while (cursor < text.length) {
      let best: { index: number; item: { term: string; translation: string } } | null = null;

      for (const g of normalized) {
        const idx = lower.indexOf(g.term.toLowerCase(), cursor);
        if (idx === -1) continue;
        if (!best || idx < best.index || (idx === best.index && g.term.length > best.item.term.length)) {
          best = { index: idx, item: { term: g.term, translation: g.translation } };
        }
      }

      if (!best) {
        out.push({ text: text.slice(cursor), item: null });
        break;
      }

      if (best.index > cursor) {
        out.push({ text: text.slice(cursor, best.index), item: null });
      }

      out.push({ text: text.slice(best.index, best.index + best.item.term.length), item: best.item });
      cursor = best.index + best.item.term.length;
    }

    return out;
  }, []);

  return (
    <GradientBackground>
      <DevHubButton />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 180 }}
        showsVerticalScrollIndicator={false}
      >
        <LearnHeader title={story?.title ?? "Story"} subtitle={story ? `Level: ${story.level}` : undefined} />

        <View style={styles.content}>
          <GlassPanel style={styles.card} glow glowColor={colors.secondary[500]}>
            {story ? (
              <>
                <Text style={styles.tip}>Tap highlighted words for a quick translation.</Text>

                <Text style={styles.storyText}>
                  {splitByGlossary(story.text, story).map((seg, idx) => (
                    <Text
                      key={`${idx}-${seg.text}`}
                      style={seg.item ? styles.highlight : undefined}
                      onPress={seg.item ? () => setSelected(seg.item) : undefined}
                    >
                      {seg.text}
                    </Text>
                  ))}
                </Text>
              </>
            ) : (
              <Text style={styles.empty}>Story not found.</Text>
            )}
          </GlassPanel>
        </View>
      </ScrollView>

      <DefinitionModal
        visible={!!selected}
        term={selected?.term ?? ""}
        translation={selected?.translation ?? ""}
        onClose={() => setSelected(null)}
      />
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
  tip: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
    marginBottom: 12,
  },
  storyText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 24,
  },
  highlight: {
    backgroundColor: "rgba(250, 204, 21, 0.14)",
    color: colors.text.primary,
  },
  empty: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.muted,
  },
});



