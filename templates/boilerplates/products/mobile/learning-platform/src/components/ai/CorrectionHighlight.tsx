import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ArrowRight } from "lucide-react-native";

import type { Correction } from "@/stores/aiStore";
import { useReduceMotion } from "@/hooks/useReduceMotion";
import { colors } from "@/theme/tokens";

type Props = {
  correction: Correction;
};

export function CorrectionHighlight({ correction }: Props) {
  const reduceMotion = useReduceMotion();

  useEffect(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  return (
    <MotiView
      from={reduceMotion ? undefined : { opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "timing", duration: 260 }}
      style={styles.container}
    >
      {/* Original → Corrected */}
      <View style={styles.correctionRow}>
        <View style={styles.originalContainer}>
          <Text style={styles.original}>{correction.original}</Text>
        </View>
        <ArrowRight size={14} color={colors.text.muted} />
        <View style={styles.correctedContainer}>
          <Text style={styles.corrected}>{correction.corrected}</Text>
        </View>
      </View>

      {/* Explanation */}
      <Text style={styles.explanation}>{correction.explanation}</Text>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(250, 204, 21, 0.1)",
    borderRadius: 10,
    padding: 10,
    marginTop: 6,
    borderWidth: 1,
    borderColor: "rgba(250, 204, 21, 0.2)",
  },
  correctionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  originalContainer: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  original: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.error,
    textDecorationLine: "line-through",
  },
  correctedContainer: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  corrected: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 13,
    color: colors.success,
  },
  explanation: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 18,
  },
});

