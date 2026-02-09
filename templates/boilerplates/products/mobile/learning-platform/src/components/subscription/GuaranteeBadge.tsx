import { MotiView } from "moti";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Shield } from "lucide-react-native";

import { GlassPanel } from "@/components/GlassPanel";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { GUARANTEE } from "@/lib/subscription/mockData";
import { colors } from "@/theme/tokens";

interface Props {
  compact?: boolean;
  delay?: number;
}

export function GuaranteeBadge({ compact = false, delay = 0 }: Props) {
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  if (compact) {
    return (
      <MotiView
        from={motionFrom.fade}
        animate={{ opacity: 1 }}
        transition={getTransition({ delay })}
        style={styles.compactContainer}
      >
        <Shield size={16} color={colors.accent[400]} />
        <Text style={styles.compactText}>{GUARANTEE.name}</Text>
      </MotiView>
    );
  }

  return (
    <MotiView
      from={motionFrom.fadeUp}
      animate={{ opacity: 1, translateY: 0 }}
      transition={getTransition({ delay })}
    >
      <GlassPanel style={styles.container}>
        <View style={styles.iconContainer}>
          <Shield size={28} color={colors.accent[400]} />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>{GUARANTEE.name}</Text>
          <Text style={styles.headline}>{GUARANTEE.headline}</Text>
        </View>
      </GlassPanel>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: "rgba(250, 204, 21, 0.2)",
    backgroundColor: "rgba(250, 204, 21, 0.05)",
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(250, 204, 21, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
    color: colors.accent[400],
    marginBottom: 4,
  },
  headline: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  compactContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 8,
  },
  compactText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 12,
    color: colors.accent[400],
  },
});

