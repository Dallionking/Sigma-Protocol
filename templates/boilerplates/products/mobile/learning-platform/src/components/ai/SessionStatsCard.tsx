import { MotiView } from "moti";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Clock, Lightbulb, MessageSquare } from "lucide-react-native";

import { AnimatedCounter } from "@/components/AnimatedCounter";
import { GlassPanel } from "@/components/GlassPanel";
import type { SessionStats } from "@/stores/aiStore";
import { colors } from "@/theme/tokens";

type Props = {
  stats: SessionStats;
  xpEarned: number;
};

export function SessionStatsCard({ stats, xpEarned }: Props) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 260 }}
    >
      <GlassPanel style={styles.container}>
        <Text style={styles.title}>Session Stats</Text>

        <View style={styles.statsRow}>
          {/* Messages */}
          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <MessageSquare size={20} color={colors.secondary[400]} />
            </View>
            <Text style={styles.statValue}>{stats.messageCount}</Text>
            <Text style={styles.statLabel}>Messages</Text>
          </View>

          <View style={styles.divider} />

          {/* Voice Time */}
          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Clock size={20} color={colors.primary[400]} />
            </View>
            <Text style={styles.statValue}>
              {formatDuration(stats.voiceDurationSeconds)}
            </Text>
            <Text style={styles.statLabel}>Voice Time</Text>
          </View>

          <View style={styles.divider} />

          {/* Corrections */}
          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Lightbulb size={20} color={colors.accent[400]} />
            </View>
            <Text style={styles.statValue}>{stats.correctionsLearned}</Text>
            <Text style={styles.statLabel}>Corrections</Text>
          </View>
        </View>

        {/* XP Earned */}
        <View style={styles.xpSection}>
          <Text style={styles.xpLabel}>XP Earned</Text>
          <AnimatedCounter
            value={xpEarned}
            style={styles.xpValue}
            duration={1200}
          />
        </View>
      </GlassPanel>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 20,
  },
  title: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontFamily: "Satoshi-Bold",
    fontSize: 20,
    color: colors.text.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: "PlusJakartaSans",
    fontSize: 11,
    color: colors.text.muted,
  },
  divider: {
    width: 1,
    height: 50,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  xpSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(6, 182, 212, 0.1)",
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  xpLabel: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.secondary,
  },
  xpValue: {
    fontFamily: "Satoshi-Bold",
    fontSize: 24,
    color: colors.secondary[400],
  },
});

