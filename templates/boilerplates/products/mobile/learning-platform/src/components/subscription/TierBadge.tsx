import { MotiView } from "moti";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Star, Crown, Sparkles } from "lucide-react-native";

import { useMotionTransition } from "@/hooks/useMotionTransition";
import { colors } from "@/theme/tokens";

interface Props {
  type: "recommended" | "best-value" | "premium";
}

export function TierBadge({ type }: Props) {
  const { reduceMotion } = useMotionTransition();

  const config = {
    recommended: {
      label: "Recommended",
      icon: Star,
      bgColor: "rgba(6, 182, 212, 0.15)",
      borderColor: colors.secondary[400],
      textColor: colors.secondary[400],
      glowColor: "rgba(6, 182, 212, 0.3)",
    },
    "best-value": {
      label: "Best Value",
      icon: Sparkles,
      bgColor: "rgba(250, 204, 21, 0.15)",
      borderColor: colors.accent[400],
      textColor: colors.accent[400],
      glowColor: "rgba(250, 204, 21, 0.3)",
    },
    premium: {
      label: "Premium",
      icon: Crown,
      bgColor: "rgba(168, 85, 247, 0.15)",
      borderColor: "#A855F7",
      textColor: "#A855F7",
      glowColor: "rgba(168, 85, 247, 0.3)",
    },
  }[type];

  const Icon = config.icon;

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "timing", duration: 300 }}
      style={[
        styles.container,
        {
          backgroundColor: config.bgColor,
          borderColor: config.borderColor,
          shadowColor: reduceMotion ? "transparent" : config.glowColor,
        },
      ]}
    >
      <Icon size={12} color={config.textColor} />
      <Text style={[styles.label, { color: config.textColor }]}>{config.label}</Text>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});

