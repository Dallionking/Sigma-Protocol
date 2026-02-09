import { MotiView } from "moti";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LucideIcon } from "lucide-react-native";

import { GlassPanel } from "@/components/GlassPanel";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { colors } from "@/theme/tokens";

interface Props {
  icon: LucideIcon;
  value: string | number;
  label: string;
  accentColor?: string;
  delay?: number;
}

export function StatCard({
  icon: Icon,
  value,
  label,
  accentColor = colors.secondary[400],
  delay = 0,
}: Props) {
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  return (
    <MotiView
      from={motionFrom.fadeUp}
      animate={{ opacity: 1, translateY: 0 }}
      transition={getTransition({ delay })}
      style={styles.container}
    >
      <GlassPanel style={styles.card}>
        <View style={[styles.iconContainer, { backgroundColor: `${accentColor}15` }]}>
          <Icon size={22} color={accentColor} />
        </View>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </GlassPanel>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  value: {
    fontFamily: "Satoshi-Bold",
    fontSize: 22,
    color: colors.text.primary,
    marginBottom: 4,
  },
  label: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
    textAlign: "center",
  },
});

