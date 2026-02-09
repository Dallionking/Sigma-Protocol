import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import React, { useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Clock, Headphones, Mic, Zap, Sparkles } from "lucide-react-native";
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
const DAILY_CHALLENGE = {
  title: "Listening Challenge",
  description: "Listen to 3 short conversations and answer questions about what you heard.",
  xpReward: 50,
  estimatedTime: "5 min",
  type: "listening",
  tasks: [
    { id: 1, title: "Conversation: At the Market", completed: false },
    { id: 2, title: "Conversation: Asking Directions", completed: false },
    { id: 3, title: "Conversation: Making Plans", completed: false },
  ],
};

const CHALLENGE_ICONS = {
  listening: Headphones,
  speaking: Mic,
};

export default function DailyChallengeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);
  const backScale = useSharedValue(1);

  const ChallengeIcon = CHALLENGE_ICONS[DAILY_CHALLENGE.type as keyof typeof CHALLENGE_ICONS] || Headphones;

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

  const handleStartChallenge = useCallback(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    console.log("Start daily challenge");
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
        <Text style={styles.headerTitle}>Daily Challenge</Text>
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
          <View style={styles.iconGlow} />
          <View style={styles.challengeIconWrapper}>
            <ChallengeIcon size={40} color={colors.secondary[400]} strokeWidth={1.5} />
          </View>
          <Text style={styles.challengeTitle}>{DAILY_CHALLENGE.title}</Text>
          <Text style={styles.challengeDescription}>
            {DAILY_CHALLENGE.description}
          </Text>
        </MotiView>

        {/* Stats row */}
        <MotiView
          from={motionFrom.fadeUpLarge}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ type: "timing", duration: 400, delay: 200 })}
          style={styles.statsRow}
        >
          <View style={styles.statItem}>
            <Zap size={20} color={colors.accent[400]} />
            <Text style={styles.statValue}>+{DAILY_CHALLENGE.xpReward} XP</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Clock size={20} color={colors.text.muted} />
            <Text style={styles.statValue}>{DAILY_CHALLENGE.estimatedTime}</Text>
          </View>
        </MotiView>

        {/* Tasks preview */}
        <MotiView
          from={motionFrom.fadeUpLarge}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ type: "timing", duration: 400, delay: 300 })}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>What you'll do</Text>
          <GlassPanel style={styles.tasksCard}>
            {DAILY_CHALLENGE.tasks.map((task, index) => (
              <MotiView
                key={task.id}
                from={reduceMotion ? undefined : { opacity: 0, translateX: -10 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{
                  type: "timing",
                  duration: 250,
                  delay: reduceMotion ? 0 : 350 + index * 60,
                }}
                style={[
                  styles.taskRow,
                  index < DAILY_CHALLENGE.tasks.length - 1 && styles.taskRowBorder,
                ]}
              >
                <View style={styles.taskNumber}>
                  <Text style={styles.taskNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.taskTitle}>{task.title}</Text>
              </MotiView>
            ))}
          </GlassPanel>
        </MotiView>

        {/* CTA */}
        <MotiView
          from={motionFrom.fadeUpLarge}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ type: "timing", duration: 260, delay: 450 })}
          style={styles.ctaSection}
        >
          <PrimaryButton label="Start Challenge" onPress={handleStartChallenge} />
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
    paddingVertical: 40,
    marginBottom: 24,
    position: "relative",
  },
  iconGlow: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.secondary[500],
    opacity: 0.1,
    top: 30,
  },
  challengeIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
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
    paddingHorizontal: 20,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(17, 24, 39, 0.6)",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginHorizontal: 20,
  },
  statValue: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 15,
    color: colors.text.primary,
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
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
  },
  taskRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.06)",
  },
  taskNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  taskNumberText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 13,
    color: colors.text.secondary,
  },
  taskTitle: {
    fontFamily: "PlusJakartaSans",
    fontSize: 15,
    color: colors.text.primary,
    flex: 1,
  },
  ctaSection: {
    marginTop: 8,
  },
});



