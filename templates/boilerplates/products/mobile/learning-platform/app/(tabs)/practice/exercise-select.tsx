import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import {
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Languages,
  Layers,
  Lock,
  Mic,
  PenLine,
  Timer,
  LucideIcon,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { GradientBackground } from "@/components/GradientBackground";
import { EXERCISE_TYPES } from "@/lib/practice/mockExercises";
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

export default function ExerciseSelectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBack = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const handleSelectExercise = useCallback(
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
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Choose Exercise</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          Select an exercise type to practice
        </Text>

        {EXERCISE_TYPES.map((exercise, index) => (
          <ExerciseRow
            key={exercise.id}
            name={exercise.name}
            description={exercise.description}
            icon={exercise.icon}
            questionCount={exercise.questionCount}
            onPress={() => handleSelectExercise(exercise.id)}
            delay={index * 50}
            locked={false}
          />
        ))}
      </ScrollView>
    </GradientBackground>
  );
}

function ExerciseRow({
  name,
  description,
  icon,
  questionCount,
  onPress,
  delay,
  locked,
}: {
  name: string;
  description: string;
  icon: string;
  questionCount: number;
  onPress: () => void;
  delay: number;
  locked: boolean;
}) {
  const scale = useSharedValue(1);
  const Icon = ICON_MAP[icon] || CheckSquare;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    if (locked) return;
    scale.value = withTiming(0.98, { duration: durations.fast });
  }, [locked, scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: durations.fast });
  }, [scale]);

  return (
    <MotiView
      from={{ opacity: 0, translateX: -10 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: "timing", duration: 260, delay }}
    >
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={locked ? undefined : onPress}
        disabled={locked}
        style={[styles.row, locked && styles.rowLocked, animatedStyle]}
      >
        <View style={[styles.iconContainer, locked && styles.iconLocked]}>
          {locked ? (
            <Lock size={22} color={colors.text.muted} />
          ) : (
            <Icon size={22} color={colors.secondary[400]} />
          )}
        </View>

        <View style={styles.textContainer}>
          <Text style={[styles.name, locked && styles.nameLocked]}>{name}</Text>
          <Text style={styles.description}>{description}</Text>
          <Text style={styles.count}>{questionCount} questions</Text>
        </View>

        <ChevronRight
          size={20}
          color={locked ? colors.text.muted : colors.text.secondary}
        />
      </AnimatedPressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "Satoshi-Bold",
    fontSize: 18,
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  subtitle: {
    fontFamily: "PlusJakartaSans",
    fontSize: 15,
    color: colors.text.secondary,
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(17, 24, 39, 0.6)",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  rowLocked: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  iconLocked: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 2,
  },
  nameLocked: {
    color: colors.text.muted,
  },
  description: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  count: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.secondary[400],
  },
});

