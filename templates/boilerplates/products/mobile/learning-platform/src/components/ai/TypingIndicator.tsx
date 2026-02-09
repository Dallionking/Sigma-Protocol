import { MotiView } from "moti";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useReduceMotion } from "@/hooks/useReduceMotion";
import { colors } from "@/theme/tokens";

type Props = {
  message?: string;
};

export function TypingIndicator({ message = "AI Tutor is thinking..." }: Props) {
  const reduceMotion = useReduceMotion();

  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, translateY: -10 }}
      transition={{ type: "timing", duration: 260 }}
      style={styles.container}
    >
      <View style={styles.bubble}>
        <Text style={styles.label}>AI Tutor</Text>
        <View style={styles.dotsContainer}>
          {[0, 1, 2].map((index) => (
            <MotiView
              key={index}
              from={{ opacity: 0.3 }}
              animate={{ opacity: 1 }}
              transition={
                reduceMotion
                  ? { type: "timing", duration: 0 }
                  : {
                      type: "timing",
                      duration: 600,
                      loop: true,
                      repeatReverse: true,
                      delay: index * 150,
                    }
              }
              style={styles.dot}
            />
          ))}
        </View>
        <Text style={styles.message}>{message}</Text>
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 12,
    alignItems: "flex-start",
  },
  bubble: {
    backgroundColor: "rgba(17, 24, 39, 0.7)",
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  label: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 11,
    color: colors.primary[400],
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dotsContainer: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary[400],
  },
  message: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
    fontStyle: "italic",
  },
});

