import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Play, BookOpen } from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { GlassPanel } from "./GlassPanel";
import { colors, durations, gradients } from "../theme/tokens";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  lessonTitle: string;
  chapterName: string;
  progress: number; // 0-100
  onPress: () => void;
  delay?: number;
};

export function ContinueLessonCard({
  lessonTitle,
  chapterName,
  progress,
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
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  }, [onPress]);

  return (
    <MotiView
      from={motionFrom.fadeUp}
      animate={{ opacity: 1, translateY: 0 }}
      transition={getTransition({ delay })}
    >
      <AnimatedPressable
        style={animatedStyle}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={`Continue ${lessonTitle}`}
      >
        {/* Glow effect */}
        <View style={styles.glowOuter} />

        <GlassPanel style={styles.card} intensity={35}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconWrapper}>
              <BookOpen size={20} color={colors.secondary[400]} strokeWidth={1.8} />
            </View>
            <Text style={styles.headerLabel}>Continue Lesson</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.lessonTitle} numberOfLines={1}>
              {lessonTitle}
            </Text>
            <Text style={styles.chapterName} numberOfLines={1}>
              {chapterName}
            </Text>
          </View>

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <LinearGradient
                colors={[colors.secondary[400], colors.primary[400]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${progress}%` }]}
              />
            </View>
            <Text style={styles.progressText}>{progress}%</Text>
          </View>

          {/* Resume button */}
          <View style={styles.resumeButton}>
            <LinearGradient
              colors={gradients.primaryButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.resumeGradient}
            >
              <Play size={16} color={colors.text.primary} fill={colors.text.primary} />
              <Text style={styles.resumeText}>Resume</Text>
            </LinearGradient>
          </View>
        </GlassPanel>
      </AnimatedPressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  glowOuter: {
    position: "absolute",
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 28,
    backgroundColor: "rgba(6, 182, 212, 0.04)",
    shadowColor: colors.secondary[500],
    shadowOpacity: 0.15,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 6 },
  },
  card: {
    padding: 20,
    borderRadius: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerLabel: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 13,
    color: colors.secondary[400],
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  content: {
    marginBottom: 16,
  },
  lessonTitle: {
    fontFamily: "Satoshi-Bold",
    fontSize: 20,
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  chapterName: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 13,
    color: colors.text.muted,
    minWidth: 36,
    textAlign: "right",
  },
  resumeButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  resumeGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
  },
  resumeText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 15,
    color: colors.text.primary,
  },
});



