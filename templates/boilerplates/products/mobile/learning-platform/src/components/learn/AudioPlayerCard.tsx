import * as Haptics from "expo-haptics";
import React, { useCallback, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Pause, Play } from "lucide-react-native";

import { GlassPanel } from "@/components/GlassPanel";
import { colors } from "@/theme/tokens";

import { ProgressBar } from "./ProgressBar";

type Props = {
  title: string;
  subtitle?: string;
  isPlaying: boolean;
  positionSeconds: number;
  durationSeconds: number;
  onTogglePlay: () => void;
};

function formatTime(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export function AudioPlayerCard({
  title,
  subtitle,
  isPlaying,
  positionSeconds,
  durationSeconds,
  onTogglePlay,
}: Props) {
  const percent = durationSeconds > 0 ? (positionSeconds / durationSeconds) * 100 : 0;

  const timeLabel = useMemo(() => {
    return `${formatTime(positionSeconds)} / ${formatTime(durationSeconds)}`;
  }, [durationSeconds, positionSeconds]);

  const handleToggle = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTogglePlay();
  }, [onTogglePlay]);

  return (
    <GlassPanel style={styles.card} glow glowColor={colors.secondary[500]}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <Pressable
          onPress={handleToggle}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? "Pause" : "Play"}
          style={styles.playButton}
        >
          {isPlaying ? (
            <Pause size={20} color={colors.text.primary} />
          ) : (
            <Play size={20} color={colors.text.primary} fill={colors.text.primary} />
          )}
        </Pressable>
      </View>

      <ProgressBar value={percent} showLabel={false} style={{ marginTop: 14 }} />

      <View style={styles.footerRow}>
        <Text style={styles.time}>{timeLabel}</Text>
        <Text style={styles.hint}>{isPlaying ? "Playing" : "Ready"}</Text>
      </View>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 22,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 15,
    color: colors.text.primary,
  },
  subtitle: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 4,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  time: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
  },
  hint: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 12,
    color: colors.text.secondary,
  },
});



