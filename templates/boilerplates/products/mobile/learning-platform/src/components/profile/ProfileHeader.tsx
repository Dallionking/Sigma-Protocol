import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, View, Image } from "react-native";
import { Camera } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { NeonMonogram } from "@/components/NeonMonogram";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { colors, durations } from "@/theme/tokens";

interface Props {
  name: string;
  level: number;
  xp: number;
  avatarUrl?: string;
  onAvatarPress?: () => void;
  showEditOverlay?: boolean;
  delay?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ProfileHeader({
  name,
  level,
  xp,
  avatarUrl,
  onAvatarPress,
  showEditOverlay = false,
  delay = 0,
}: Props) {
  const scale = useSharedValue(1);
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const handlePressIn = useCallback(() => {
    if (!onAvatarPress) return;
    scale.value = withTiming(0.95, { duration: durations.fast });
  }, [scale, onAvatarPress]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: durations.fast });
  }, [scale]);

  const handlePress = useCallback(() => {
    if (!onAvatarPress) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAvatarPress();
  }, [onAvatarPress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <MotiView
      from={motionFrom.fadeUp}
      animate={{ opacity: 1, translateY: 0 }}
      transition={getTransition({ delay })}
      style={styles.container}
    >
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={!onAvatarPress}
        style={[styles.avatarContainer, animatedStyle]}
      >
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <NeonMonogram size={88} />
        )}
        {showEditOverlay && (
          <View style={styles.editOverlay}>
            <Camera size={20} color="#FFFFFF" />
          </View>
        )}
      </AnimatedPressable>

      <Text style={styles.name}>{name}</Text>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>Level {level}</Text>
        </View>
        <View style={styles.statDot} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{xp.toLocaleString()} XP</Text>
        </View>
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 24,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  editOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondary[500],
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.surface.base,
  },
  name: {
    fontFamily: "Satoshi-Bold",
    fontSize: 26,
    color: colors.text.primary,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statItem: {},
  statValue: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 15,
    color: colors.text.secondary,
  },
  statDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.text.muted,
  },
});

