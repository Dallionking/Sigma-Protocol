import { MotiView } from "moti";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { GlassPanel } from "@/components/GlassPanel";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { colors } from "@/theme/tokens";

interface Props {
  title: string;
  children: React.ReactNode;
  delay?: number;
}

export function SettingsSection({ title, children, delay = 0 }: Props) {
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  return (
    <MotiView
      from={motionFrom.fadeUp}
      animate={{ opacity: 1, translateY: 0 }}
      transition={getTransition({ delay })}
      style={styles.container}
    >
      <Text style={styles.title}>{title}</Text>
      <GlassPanel style={styles.card}>{children}</GlassPanel>
    </MotiView>
  );
}

export function SettingsDivider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 12,
    color: colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    borderRadius: 20,
    overflow: "hidden",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    marginHorizontal: 16,
  },
});

