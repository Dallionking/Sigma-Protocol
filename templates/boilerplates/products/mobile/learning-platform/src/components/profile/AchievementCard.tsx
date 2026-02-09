import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  Footprints,
  Flame,
  Trophy,
  BookOpen,
  Library,
  MessageCircle,
  Crown,
  Sparkles,
  GraduationCap,
  Star,
  CheckCircle,
  Moon,
  Lock,
  LucideIcon,
} from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { GlassPanel } from "@/components/GlassPanel";
import { Achievement } from "@/stores/profileStore";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { colors, durations } from "@/theme/tokens";

interface Props {
  achievement: Achievement;
  onPress?: (achievement: Achievement) => void;
  delay?: number;
}

const ICON_MAP: Record<string, LucideIcon> = {
  Footprints,
  Flame,
  Trophy,
  BookOpen,
  Library,
  MessageCircle,
  Crown,
  Sparkles,
  GraduationCap,
  Star,
  CheckCircle,
  Moon,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AchievementCard({ achievement, onPress, delay = 0 }: Props) {
  const scale = useSharedValue(1);
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const isUnlocked = !!achievement.unlockedAt;
  const progress = achievement.progress ?? 0;
  const progressPercent = (progress / achievement.maxProgress) * 100;

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(0.98, { duration: durations.fast });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: durations.fast });
  }, [scale]);

  const handlePress = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(achievement);
  }, [onPress, achievement]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const Icon = ICON_MAP[achievement.iconName] || Star;

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
        style={animatedStyle}
      >
        <GlassPanel style={[styles.card, !isUnlocked && styles.cardLocked]}>
          <View
            style={[
              styles.iconContainer,
              isUnlocked ? styles.iconUnlocked : styles.iconLocked,
            ]}
          >
            {isUnlocked ? (
              <Icon size={28} color={colors.accent[400]} />
            ) : (
              <Lock size={24} color={colors.text.muted} />
            )}
          </View>

          <Text
            style={[styles.title, !isUnlocked && styles.titleLocked]}
            numberOfLines={1}
          >
            {achievement.title}
          </Text>

          {!isUnlocked && progressPercent > 0 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <View
                  style={[styles.progressFill, { width: `${progressPercent}%` }]}
                />
              </View>
              <Text style={styles.progressText}>
                {progress}/{achievement.maxProgress}
              </Text>
            </View>
          )}

          {isUnlocked && (
            <View style={styles.unlockedBadge}>
              <CheckCircle size={12} color={colors.success} />
            </View>
          )}
        </GlassPanel>
      </AnimatedPressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "48%",
    marginBottom: 12,
  },
  card: {
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
    minHeight: 120,
  },
  cardLocked: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  iconUnlocked: {
    backgroundColor: "rgba(250, 204, 21, 0.12)",
  },
  iconLocked: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  title: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 13,
    color: colors.text.primary,
    textAlign: "center",
  },
  titleLocked: {
    color: colors.text.muted,
  },
  progressContainer: {
    width: "100%",
    marginTop: 10,
    alignItems: "center",
    gap: 4,
  },
  progressTrack: {
    width: "100%",
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.secondary[400],
    borderRadius: 2,
  },
  progressText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 10,
    color: colors.text.muted,
  },
  unlockedBadge: {
    position: "absolute",
    top: 10,
    right: 10,
  },
});

