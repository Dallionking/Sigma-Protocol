import { MotiView } from "moti";
import React from "react";
import { StyleSheet, View } from "react-native";

import { colors } from "../theme/tokens";

type Props = {
  current: number;
  total: number;
};

export function ProgressPills({ current, total }: Props) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => {
        const isComplete = index < current;
        const isCurrent = index === current;

        return (
          <MotiView
            key={index}
            from={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "timing", duration: 260, delay: index * 50 }}
            style={[
              styles.pill,
              isComplete && styles.pillComplete,
              isCurrent && styles.pillCurrent,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pill: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  pillComplete: {
    backgroundColor: colors.primary[500],
    shadowColor: colors.primary[500],
    shadowOpacity: 0.5,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  pillCurrent: {
    backgroundColor: colors.primary[400],
    width: 20,
    shadowColor: colors.primary[400],
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
});



