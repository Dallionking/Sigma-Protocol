import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CheckCircle2, Lock, Play } from "lucide-react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { GlassPanel } from "@/components/GlassPanel";
import { colors, durations } from "@/theme/tokens";

import { ProgressBar } from "./ProgressBar";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  title: string;
  subtitle?: string;
  durationMinutes?: number;
  xp?: number;
  progressPercent?: number;
  locked?: boolean;
  completed?: boolean;
  onPress: () => void;
  delay?: number;
};

export function LessonCard({
  title,
  subtitle,
  durationMinutes,
  xp,
  progressPercent = 0,
  locked = false,
  completed = false,
  onPress,
  delay = 0,
}: Props) {
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = reduceMotion ? 0.98 : withTiming(0.98, { duration: durations.fast });
  }, [reduceMotion, scale]);

  const handlePressOut = useCallback(() => {
    scale.value = reduceMotion ? 1 : withTiming(1, { duration: durations.fast });
  }, [reduceMotion, scale]);

  const handlePress = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);

  return (
    <MotiView
      from={motionFrom.fadeUp}
      animate={{ opacity: 1, translateY: 0 }}
      transition={getTransition({ delay })}
      style={styles.wrapper}
    >
      <AnimatedPressable
        style={animatedStyle}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={title}
      >
        <GlassPanel style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
              {subtitle ? (
                <Text style={styles.subtitle} numberOfLines={2}>
                  {subtitle}
                </Text>
              ) : null}
            </View>

            <View style={styles.headerRight}>
              {locked ? (
                <Lock size={18} color={colors.text.muted} />
              ) : completed ? (
                <CheckCircle2 size={18} color={colors.success} />
              ) : (
                <Play size={18} color={colors.secondary[400]} fill={colors.secondary[400]} />
              )}
            </View>
          </View>

          <View style={styles.metaRow}>
            {typeof durationMinutes === "number" ? (
              <Text style={styles.metaText}>{durationMinutes} min</Text>
            ) : null}
            {typeof xp === "number" ? <Text style={styles.metaText}>+{xp} XP</Text> : null}
          </View>

          <ProgressBar value={progressPercent} showLabel={false} style={styles.progress} />
        </GlassPanel>
      </AnimatedPressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
  },
  card: {
    padding: 16,
    borderRadius: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    width: 26,
    alignItems: "flex-end",
    paddingTop: 2,
  },
  title: {
    fontFamily: "Satoshi-Bold",
    fontSize: 16,
    color: colors.text.primary,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 4,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  metaText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 12,
    color: colors.text.muted,
  },
  progress: {
    marginTop: 12,
  },
});



