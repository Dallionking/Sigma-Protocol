import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback, useEffect, useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, Bell, Flame, Target, Trophy, Calendar } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  interpolate,
} from "react-native-reanimated";

import { GradientBackground } from "@/components/GradientBackground";
import { DevHubButton } from "@/components/DevHubButton";
import { GlassPanel } from "@/components/GlassPanel";
import { SecondaryButton } from "@/components/SecondaryButton";
import { StreakCalendar } from "@/components/StreakCalendar";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { colors, durations } from "@/theme/tokens";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Mock data
const MOCK_STREAK = {
  current: 7,
  longest: 14,
  thisWeek: 5,
  total: 42,
};

// Generate mock completed days
function generateMockCompletedDays(): Date[] {
  const days: Date[] = [];
  const today = new Date();

  // Add the past 7 days as completed (current streak)
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    days.push(date);
  }

  // Add some scattered days before that
  for (let i = 10; i < 15; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    days.push(date);
  }

  return days;
}

// Animated Fire Icon Component
function AnimatedFireIcon({ size = 56 }: { size?: number }) {
  const { reduceMotion } = useMotionTransition();
  const flicker = useSharedValue(1);
  const glow = useSharedValue(0.15);

  useEffect(() => {
    if (reduceMotion) return;

    // Subtle flicker animation
    flicker.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 300, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.98, { duration: 400, easing: Easing.inOut(Easing.quad) }),
        withTiming(1.02, { duration: 350, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 300, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );

    // Glow pulse
    glow.value = withRepeat(
      withSequence(
        withTiming(0.25, { duration: 800 }),
        withTiming(0.15, { duration: 800 })
      ),
      -1,
      false
    );
  }, [flicker, glow, reduceMotion]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flicker.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
  }));

  return (
    <View style={styles.fireContainer}>
      {/* Outer glow */}
      <Animated.View style={[styles.fireGlowOuter, glowStyle]} />
      {/* Inner glow */}
      <Animated.View style={[styles.fireGlowInner, glowStyle]} />
      {/* Icon */}
      <Animated.View style={iconStyle}>
        <Flame
          size={size}
          color={colors.primary[400]}
          fill={colors.primary[500]}
          strokeWidth={1.2}
        />
      </Animated.View>
    </View>
  );
}

export default function StreakDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);
  const backScale = useSharedValue(1);

  const completedDays = useMemo(() => generateMockCompletedDays(), []);

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

  const handleSetReminder = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    console.log("Set reminder");
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
        <Text style={styles.headerTitle}>Your Streak</Text>
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
        {/* Current streak hero */}
        <MotiView
          from={motionFrom.scaleIn}
          animate={{ opacity: 1, scale: 1 }}
          transition={getTransition({ type: "timing", duration: 260, delay: 100 })}
          style={styles.heroSection}
        >
          <AnimatedFireIcon size={56} />
          
          <View style={styles.streakNumberContainer}>
            <Text style={styles.streakNumber}>{MOCK_STREAK.current}</Text>
            <Text style={styles.streakDays}>days</Text>
          </View>
          
          <Text style={styles.streakLabel}>Current Streak</Text>
          
          <View style={styles.motivationalBadge}>
            <Text style={styles.motivationalText}>You're on fire! Keep it going!</Text>
          </View>
        </MotiView>

        {/* Stats row */}
        <MotiView
          from={motionFrom.fadeUpLarge}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ type: "timing", duration: 400, delay: 200 })}
          style={styles.statsRow}
        >
          <StatCard
            icon={<Trophy size={20} color={colors.accent[400]} />}
            value={MOCK_STREAK.longest}
            label="Longest"
            accentColor={colors.accent[400]}
            delay={reduceMotion ? 0 : 250}
          />
          <StatCard
            icon={<Calendar size={20} color={colors.secondary[400]} />}
            value={MOCK_STREAK.thisWeek}
            label="This week"
            accentColor={colors.secondary[400]}
            delay={reduceMotion ? 0 : 300}
          />
          <StatCard
            icon={<Target size={20} color={colors.primary[400]} />}
            value={MOCK_STREAK.total}
            label="Total days"
            accentColor={colors.primary[400]}
            delay={reduceMotion ? 0 : 350}
          />
        </MotiView>

        {/* Calendar */}
        <MotiView
          from={motionFrom.fadeUpLarge}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ type: "timing", duration: 400, delay: 350 })}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Activity</Text>
            <Text style={styles.sectionSubtitle}>Last 4 weeks</Text>
          </View>
          <StreakCalendar completedDays={completedDays} weeksToShow={4} />
        </MotiView>

        {/* Weekly goal */}
        <MotiView
          from={motionFrom.fadeUpLarge}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ type: "timing", duration: 400, delay: 450 })}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Weekly Goal</Text>
            <Text style={styles.sectionSubtitle}>5 of 7 days</Text>
          </View>
          <GlassPanel style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <View style={styles.goalIconContainer}>
                <Target size={18} color={colors.secondary[400]} />
              </View>
              <View style={styles.goalInfo}>
                <Text style={styles.goalText}>Almost there!</Text>
                <Text style={styles.goalHint}>
                  Complete 2 more days to earn your weekly bonus
                </Text>
              </View>
              <Text style={styles.goalPercent}>71%</Text>
            </View>
            <View style={styles.goalProgress}>
              <LinearGradient
                colors={[colors.secondary[400], colors.primary[400]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.goalFill, { width: "71%" }]}
              />
            </View>
          </GlassPanel>
        </MotiView>

        {/* Reminder CTA */}
        <MotiView
          from={motionFrom.fade}
          animate={{ opacity: 1 }}
          transition={getTransition({ type: "timing", duration: 400, delay: 500 })}
          style={styles.reminderSection}
        >
          <View style={styles.reminderIcon}>
            <Bell size={24} color={colors.text.muted} />
          </View>
          <Text style={styles.reminderTitle}>Never miss a day</Text>
          <Text style={styles.reminderSubtitle}>
            Set a daily reminder to keep your streak alive
          </Text>
          <SecondaryButton
            label="Set reminder"
            onPress={handleSetReminder}
            variant="outline"
          />
        </MotiView>
      </ScrollView>
    </GradientBackground>
  );
}

function StatCard({
  icon,
  value,
  label,
  accentColor,
  delay,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  accentColor: string;
  delay: number;
}) {
  const { reduceMotion } = useMotionTransition();

  return (
    <MotiView
      from={reduceMotion ? undefined : { opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "timing", duration: 260, delay }}
      style={styles.statCard}
    >
      <View style={[styles.statIconWrapper, { backgroundColor: `${accentColor}15` }]}>
        {icon}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </MotiView>
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
    paddingVertical: 40,
    marginBottom: 24,
  },
  fireContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  fireGlowOuter: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.primary[500],
  },
  fireGlowInner: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary[400],
  },
  streakNumberContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  streakNumber: {
    fontFamily: "Satoshi-Bold",
    fontSize: 80,
    color: colors.text.primary,
    letterSpacing: -3,
  },
  streakDays: {
    fontFamily: "PlusJakartaSans",
    fontSize: 24,
    color: colors.text.secondary,
  },
  streakLabel: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 16,
    color: colors.text.muted,
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  motivationalBadge: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(99, 102, 241, 0.12)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.2)",
  },
  motivationalText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
    color: colors.primary[400],
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.6)",
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  statIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  statValue: {
    fontFamily: "Satoshi-Bold",
    fontSize: 26,
    color: colors.text.primary,
  },
  statLabel: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 18,
    color: colors.text.primary,
  },
  sectionSubtitle: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.muted,
  },
  goalCard: {
    padding: 20,
    borderRadius: 20,
  },
  goalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 12,
  },
  goalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  goalInfo: {
    flex: 1,
  },
  goalText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 2,
  },
  goalHint: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.muted,
    lineHeight: 18,
  },
  goalPercent: {
    fontFamily: "Satoshi-Bold",
    fontSize: 22,
    color: colors.secondary[400],
  },
  goalProgress: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    overflow: "hidden",
  },
  goalFill: {
    height: "100%",
    borderRadius: 5,
  },
  reminderSection: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 8,
  },
  reminderIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  reminderTitle: {
    fontFamily: "Satoshi-Bold",
    fontSize: 20,
    color: colors.text.primary,
  },
  reminderSubtitle: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
    textAlign: "center",
  },
});



