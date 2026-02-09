import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import React, { useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Award, Calendar, CheckCircle, Circle, Zap } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

import { GradientBackground } from "@/components/GradientBackground";
import { DevHubButton } from "@/components/DevHubButton";
import { GlassPanel } from "@/components/GlassPanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { colors, durations } from "@/theme/tokens";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Mock challenge data
const WEEKLY_CHALLENGE = {
  title: "Conversation Master",
  description: "Complete 7 conversation exercises this week to earn a special badge and bonus XP!",
  xpReward: 200,
  badgeReward: "Conversation Master",
  currentDay: 3,
  totalDays: 7,
  tasks: [
    { id: 1, day: 1, title: "Greetings & Introductions", completed: true },
    { id: 2, day: 2, title: "Ordering at a Restaurant", completed: true },
    { id: 3, day: 3, title: "Asking for Directions", completed: false, current: true },
    { id: 4, day: 4, title: "Shopping at the Market", completed: false },
    { id: 5, day: 5, title: "Making Weekend Plans", completed: false },
    { id: 6, day: 6, title: "Talking About Family", completed: false },
    { id: 7, day: 7, title: "Review & Mastery Test", completed: false },
  ],
};

export default function WeeklyChallengeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);
  const backScale = useSharedValue(1);

  const progress = (WEEKLY_CHALLENGE.currentDay - 1) / WEEKLY_CHALLENGE.totalDays * 100;

  const backButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backScale.value }],
  }));

  const handleBack = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const handleBackPressIn = useCallback(() => {
    backScale.value = reduceMotion ? 0.95 : withTiming(0.95, { duration: durations.fast });
  }, [backScale, reduceMotion]);

  const handleBackPressOut = useCallback(() => {
    backScale.value = reduceMotion ? 1 : withTiming(1, { duration: durations.fast });
  }, [backScale, reduceMotion]);

  const handleContinue = useCallback(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    console.log("Continue weekly challenge");
  }, []);

  return (
    <GradientBackground>
      <DevHubButton />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <AnimatedPressable
          onPress={handleBack}
          onPressIn={handleBackPressIn}
          onPressOut={handleBackPressOut}
          style={[styles.backButton, backButtonStyle]}
        >
          <ArrowLeft size={24} color={colors.text.primary} />
        </AnimatedPressable>
        <Text style={styles.headerTitle}>Weekly Challenge</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 180 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero section */}
        <MotiView
          from={motionFrom.scaleIn}
          animate={{ opacity: 1, scale: 1 }}
          transition={getTransition({ type: "timing", duration: 260, delay: 100 })}
          style={styles.heroSection}
        >
          <View style={styles.dayBadge}>
            <Calendar size={16} color={colors.text.primary} />
            <Text style={styles.dayBadgeText}>
              Day {WEEKLY_CHALLENGE.currentDay} of {WEEKLY_CHALLENGE.totalDays}
            </Text>
          </View>
          <Text style={styles.challengeTitle}>{WEEKLY_CHALLENGE.title}</Text>
          <Text style={styles.challengeDescription}>
            {WEEKLY_CHALLENGE.description}
          </Text>

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <MotiView
                from={reduceMotion ? undefined : { width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ type: "timing", duration: 800, delay: reduceMotion ? 0 : 300 }}
                style={styles.progressFillWrapper}
              >
                <LinearGradient
                  colors={[colors.secondary[400], colors.primary[400]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.progressFillGradient}
                />
              </MotiView>
            </View>
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          </View>
        </MotiView>

        {/* Rewards preview */}
        <MotiView
          from={motionFrom.fadeUpLarge}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ type: "timing", duration: 400, delay: 200 })}
          style={styles.rewardsRow}
        >
          <View style={styles.rewardCard}>
            <View style={[styles.rewardIcon, { backgroundColor: "rgba(250, 204, 21, 0.12)" }]}>
              <Zap size={20} color={colors.accent[400]} />
            </View>
            <Text style={styles.rewardValue}>+{WEEKLY_CHALLENGE.xpReward} XP</Text>
            <Text style={styles.rewardLabel}>Bonus XP</Text>
          </View>
          <View style={styles.rewardCard}>
            <View style={[styles.rewardIcon, { backgroundColor: "rgba(6, 182, 212, 0.12)" }]}>
              <Award size={20} color={colors.secondary[400]} />
            </View>
            <Text style={styles.rewardValue}>Badge</Text>
            <Text style={styles.rewardLabel}>{WEEKLY_CHALLENGE.badgeReward}</Text>
          </View>
        </MotiView>

        {/* Tasks list */}
        <MotiView
          from={motionFrom.fadeUpLarge}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ type: "timing", duration: 400, delay: 300 })}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>This Week's Tasks</Text>
          <GlassPanel style={styles.tasksCard}>
            {WEEKLY_CHALLENGE.tasks.map((task, index) => (
              <MotiView
                key={task.id}
                from={reduceMotion ? undefined : { opacity: 0, translateX: -10 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{
                  type: "timing",
                  duration: 250,
                  delay: reduceMotion ? 0 : 350 + index * 40,
                }}
                style={[
                  styles.taskRow,
                  index < WEEKLY_CHALLENGE.tasks.length - 1 && styles.taskRowBorder,
                  task.current && styles.taskRowCurrent,
                ]}
              >
                <View style={styles.taskLeft}>
                  {task.completed ? (
                    <CheckCircle size={22} color={colors.success} fill={colors.success} />
                  ) : (
                    <Circle
                      size={22}
                      color={task.current ? colors.secondary[400] : colors.text.muted}
                      strokeWidth={task.current ? 2 : 1.5}
                    />
                  )}
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskDay}>Day {task.day}</Text>
                    <Text
                      style={[
                        styles.taskTitle,
                        task.completed && styles.taskTitleCompleted,
                      ]}
                    >
                      {task.title}
                    </Text>
                  </View>
                </View>
                {task.current && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>Today</Text>
                  </View>
                )}
              </MotiView>
            ))}
          </GlassPanel>
        </MotiView>

        {/* CTA */}
        <MotiView
          from={motionFrom.fadeUpLarge}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ type: "timing", duration: 260, delay: 500 })}
          style={styles.ctaSection}
        >
          <PrimaryButton label="Continue Challenge" onPress={handleContinue} />
        </MotiView>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  headerTitle: {
    flex: 1,
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 17,
    color: colors.text.primary,
    textAlign: "center",
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  heroSection: {
    alignItems: "center",
    paddingVertical: 32,
    marginBottom: 20,
  },
  dayBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  dayBadgeText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 13,
    color: colors.text.primary,
  },
  challengeTitle: {
    fontFamily: "Satoshi-Bold",
    fontSize: 28,
    color: colors.text.primary,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  challengeDescription: {
    fontFamily: "PlusJakartaSans",
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginTop: 24,
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    overflow: "hidden",
  },
  progressFillWrapper: {
    height: "100%",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFillGradient: {
    flex: 1,
    borderRadius: 4,
  },
  progressText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
    color: colors.secondary[400],
    minWidth: 40,
    textAlign: "right",
  },
  rewardsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  rewardCard: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.6)",
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  rewardIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  rewardValue: {
    fontFamily: "Satoshi-Bold",
    fontSize: 18,
    color: colors.text.primary,
  },
  rewardLabel: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 12,
  },
  tasksCard: {
    padding: 4,
    borderRadius: 20,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  taskRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.06)",
  },
  taskRowCurrent: {
    backgroundColor: "rgba(6, 182, 212, 0.06)",
    borderRadius: 12,
  },
  taskLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  taskInfo: {
    flex: 1,
  },
  taskDay: {
    fontFamily: "PlusJakartaSans",
    fontSize: 11,
    color: colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  taskTitle: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
    color: colors.text.primary,
    marginTop: 2,
  },
  taskTitleCompleted: {
    color: colors.text.muted,
  },
  currentBadge: {
    backgroundColor: colors.secondary[500],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  currentBadgeText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 11,
    color: colors.text.primary,
  },
  ctaSection: {
    marginTop: 8,
  },
});



