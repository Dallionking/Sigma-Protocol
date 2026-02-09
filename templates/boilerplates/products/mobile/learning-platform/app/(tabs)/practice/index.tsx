import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import {
  CheckSquare,
  Headphones,
  Languages,
  Layers,
  Mic,
  PenLine,
  Sparkles,
  Timer,
  Trophy,
  Zap,
  LucideIcon,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { GradientBackground } from "@/components/GradientBackground";
import { GlassPanel } from "@/components/GlassPanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { EXERCISE_TYPES } from "@/lib/practice/mockExercises";
import { usePracticeStore } from "@/stores/practiceStore";
import { colors, durations } from "@/theme/tokens";

const ICON_MAP: Record<string, LucideIcon> = {
  CheckSquare,
  PenLine,
  Mic,
  Layers,
  Headphones,
  Languages,
  Timer,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function PracticeHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const bestStreak = usePracticeStore((s) => s.bestStreak);

  const handleQuickPractice = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Pick a random exercise type
    const randomType =
      EXERCISE_TYPES[Math.floor(Math.random() * EXERCISE_TYPES.length)];
    router.push(`/practice/${randomType.id === "mcq" ? "quiz-mcq" : randomType.id}`);
  }, [router]);

  const handleExerciseType = useCallback(
    (typeId: string) => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const route =
        typeId === "mcq"
          ? "/practice/quiz-mcq"
          : typeId === "fill-blank"
            ? "/practice/fill-blank"
            : typeId === "sentence-build"
              ? "/practice/sentence-build"
              : typeId === "timed-drill"
                ? "/practice/timed-drill"
                : `/practice/${typeId}`;
      router.push(route);
    },
    [router]
  );

  return (
    <GradientBackground>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 20,
            paddingBottom: 180,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition()}
          style={styles.header}
        >
          <View>
            <Text style={styles.title}>Practice</Text>
            <Text style={styles.subtitle}>Build confidence through repetition</Text>
          </View>
          {bestStreak > 0 && (
            <View style={styles.streakBadge}>
              <Trophy size={16} color={colors.accent[400]} />
              <Text style={styles.streakText}>{bestStreak}</Text>
            </View>
          )}
        </MotiView>

        {/* Quick Practice CTA */}
        <MotiView
          from={motionFrom.scaleIn}
          animate={{ opacity: 1, scale: 1 }}
          transition={getTransition({ delay: 100 })}
          style={styles.quickPracticeSection}
        >
          <GlassPanel style={styles.quickPracticeCard}>
            <View style={styles.quickPracticeContent}>
              <View style={styles.quickPracticeIcon}>
                <Zap size={28} color={colors.primary[400]} />
              </View>
              <View style={styles.quickPracticeText}>
                <Text style={styles.quickPracticeTitle}>Quick Practice</Text>
                <Text style={styles.quickPracticeSubtitle}>
                  Jump into a random exercise
                </Text>
              </View>
            </View>
            <PrimaryButton
              label="Start"
              onPress={handleQuickPractice}
              style={styles.quickPracticeButton}
            />
          </GlassPanel>
        </MotiView>

        {/* Exercise Types */}
        <MotiView
          from={motionFrom.fade}
          animate={{ opacity: 1 }}
          transition={getTransition({ delay: 200 })}
        >
          <Text style={styles.sectionTitle}>Exercise Types</Text>
        </MotiView>

        <View style={styles.exercisesGrid}>
          {EXERCISE_TYPES.map((exercise, index) => (
            <ExerciseTypeCard
              key={exercise.id}
              name={exercise.name}
              description={exercise.description}
              icon={exercise.icon}
              questionCount={exercise.questionCount}
              onPress={() => handleExerciseType(exercise.id)}
              delay={reduceMotion ? 0 : 250 + index * 30}
            />
          ))}
        </View>

        {/* Today's Progress */}
        <MotiView
          from={motionFrom.fade}
          animate={{ opacity: 1 }}
          transition={getTransition({ delay: 400 })}
          style={styles.progressSection}
        >
          <Text style={styles.sectionTitle}>Today's Progress</Text>
          <GlassPanel style={styles.progressCard}>
            <View style={styles.progressRow}>
              <View style={styles.progressItem}>
                <Sparkles size={20} color={colors.secondary[400]} />
                <Text style={styles.progressValue}>0</Text>
                <Text style={styles.progressLabel}>Exercises</Text>
              </View>
              <View style={styles.progressDivider} />
              <View style={styles.progressItem}>
                <Zap size={20} color={colors.primary[400]} />
                <Text style={styles.progressValue}>0</Text>
                <Text style={styles.progressLabel}>XP Earned</Text>
              </View>
              <View style={styles.progressDivider} />
              <View style={styles.progressItem}>
                <Trophy size={20} color={colors.accent[400]} />
                <Text style={styles.progressValue}>0%</Text>
                <Text style={styles.progressLabel}>Accuracy</Text>
              </View>
            </View>
          </GlassPanel>
        </MotiView>
      </ScrollView>
    </GradientBackground>
  );
}

function ExerciseTypeCard({
  name,
  description,
  icon,
  questionCount,
  onPress,
  delay,
}: {
  name: string;
  description: string;
  icon: string;
  questionCount: number;
  onPress: () => void;
  delay: number;
}) {
  const scale = useSharedValue(1);
  const Icon = ICON_MAP[icon] || CheckSquare;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(0.97, { duration: durations.fast });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: durations.fast });
  }, [scale]);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 300, delay }}
      style={styles.exerciseCardWrapper}
    >
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[styles.exerciseCard, animatedStyle]}
      >
        <View style={styles.exerciseIconContainer}>
          <Icon size={24} color={colors.secondary[400]} />
        </View>
        <Text style={styles.exerciseName}>{name}</Text>
        <Text style={styles.exerciseDescription} numberOfLines={2}>
          {description}
        </Text>
        <Text style={styles.exerciseCount}>{questionCount} questions</Text>
      </AnimatedPressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  title: {
    fontFamily: "Satoshi-Bold",
    fontSize: 32,
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 4,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(250, 204, 21, 0.12)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  streakText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
    color: colors.accent[400],
  },
  quickPracticeSection: {
    marginBottom: 28,
  },
  quickPracticeCard: {
    padding: 20,
    borderRadius: 20,
  },
  quickPracticeContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  quickPracticeIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(99, 102, 241, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  quickPracticeText: {
    flex: 1,
  },
  quickPracticeTitle: {
    fontFamily: "Satoshi-Bold",
    fontSize: 20,
    color: colors.text.primary,
    marginBottom: 4,
  },
  quickPracticeSubtitle: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.secondary,
  },
  quickPracticeButton: {
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 14,
  },
  exercisesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
    marginBottom: 24,
  },
  exerciseCardWrapper: {
    width: "50%",
    padding: 6,
  },
  exerciseCard: {
    backgroundColor: "rgba(17, 24, 39, 0.6)",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    minHeight: 140,
  },
  exerciseIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  exerciseName: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 4,
  },
  exerciseDescription: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
    lineHeight: 16,
    marginBottom: 8,
  },
  exerciseCount: {
    fontFamily: "PlusJakartaSans",
    fontSize: 11,
    color: colors.secondary[400],
  },
  progressSection: {
    marginTop: 4,
  },
  progressCard: {
    padding: 20,
    borderRadius: 18,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressItem: {
    flex: 1,
    alignItems: "center",
  },
  progressValue: {
    fontFamily: "Satoshi-Bold",
    fontSize: 24,
    color: colors.text.primary,
    marginTop: 8,
  },
  progressLabel: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 2,
  },
  progressDivider: {
    width: 1,
    height: 50,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
});

