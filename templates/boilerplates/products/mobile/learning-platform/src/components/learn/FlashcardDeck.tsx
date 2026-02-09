import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react-native";

import { GlassPanel } from "@/components/GlassPanel";
import { SecondaryButton } from "@/components/SecondaryButton";
import { colors } from "@/theme/tokens";

export type Flashcard = {
  id: string;
  front: string;
  back: string;
  note?: string;
};

type Props = {
  cards: Flashcard[];
  title?: string;
};

export function FlashcardDeck({ cards, title = "Flashcards" }: Props) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = cards[index] ?? null;

  const progressLabel = useMemo(() => {
    if (!cards.length) return "0/0";
    return `${index + 1}/${cards.length}`;
  }, [cards.length, index]);

  return (
    <View>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.progress}>{progressLabel}</Text>
      </View>

      <Pressable
        onPress={() => setFlipped((v) => !v)}
        accessibilityRole="button"
        accessibilityLabel="Flip card"
      >
        <GlassPanel style={styles.card} glow glowColor={colors.primary[500]}>
          {card ? (
            <>
              <Text style={styles.sideLabel}>{flipped ? "Back" : "Front"}</Text>
              <Text style={styles.mainText}>{flipped ? card.back : card.front}</Text>
              {flipped && card.note ? <Text style={styles.note}>{card.note}</Text> : null}
            </>
          ) : (
            <Text style={styles.mainText}>No cards available.</Text>
          )}

          <View style={styles.hintRow}>
            <RotateCcw size={16} color={colors.text.muted} />
            <Text style={styles.hint}>Tap to flip</Text>
          </View>
        </GlassPanel>
      </Pressable>

      <View style={styles.controlsRow}>
        <SecondaryButton
          label="Prev"
          variant="outline"
          disabled={index <= 0}
          onPress={() => {
            setIndex((i) => Math.max(0, i - 1));
            setFlipped(false);
          }}
          style={styles.controlButton}
        />

        <View style={styles.chevrons}>
          <ChevronLeft size={18} color={colors.text.muted} />
          <ChevronRight size={18} color={colors.text.muted} />
        </View>

        <SecondaryButton
          label="Next"
          variant="outline"
          disabled={index >= cards.length - 1}
          onPress={() => {
            setIndex((i) => Math.min(cards.length - 1, i + 1));
            setFlipped(false);
          }}
          style={styles.controlButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 16,
    color: colors.text.primary,
  },
  progress: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
  },
  card: {
    padding: 18,
    borderRadius: 22,
    minHeight: 200,
    justifyContent: "space-between",
  },
  sideLabel: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 12,
    color: colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  mainText: {
    fontFamily: "Satoshi-Bold",
    fontSize: 22,
    color: colors.text.primary,
    letterSpacing: -0.4,
    marginTop: 12,
    lineHeight: 28,
  },
  note: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 19,
    marginTop: 12,
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 18,
  },
  hint: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    gap: 10,
  },
  controlButton: {
    flex: 1,
  },
  chevrons: {
    width: 44,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.6,
  },
});



