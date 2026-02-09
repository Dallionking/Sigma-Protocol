import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { colors } from "@/theme/tokens";

type Props = {
  value: number; // 0-100
  height?: number;
  showLabel?: boolean;
  style?: ViewStyle;
};

export function ProgressBar({ value, height = 6, showLabel = false, style }: Props) {
  const clamped = Math.max(0, Math.min(100, Math.round(value || 0)));

  return (
    <View style={[styles.row, style]}>
      <View style={[styles.track, { height, borderRadius: height / 2 }]}>
        <LinearGradient
          colors={[colors.secondary[400], colors.primary[400]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { width: `${clamped}%`, borderRadius: height / 2 }]}
        />
      </View>
      {showLabel ? <Text style={styles.label}>{clamped}%</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  track: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
  },
  label: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 12,
    color: colors.text.muted,
    minWidth: 36,
    textAlign: "right",
  },
});



