import * as Haptics from "expo-haptics";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Check, X } from "lucide-react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { useReduceMotion } from "@/hooks/useReduceMotion";
import { colors, durations } from "@/theme/tokens";

type Props = {
  isCorrect: boolean;
  correctAnswer?: string;
  explanation?: string;
  visible: boolean;
  onAnimationComplete?: () => void;
};

export function AnswerFeedback({
  isCorrect,
  correctAnswer,
  explanation,
  visible,
  onAnimationComplete,
}: Props) {
  const reduceMotion = useReduceMotion();
  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const shakeX = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Haptic feedback
      if (isCorrect) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      if (reduceMotion) {
        translateY.value = 0;
        opacity.value = 1;
        scale.value = 1;
        return;
      }

      // Animate in
      translateY.value = withTiming(0, { duration: durations.fast });
      opacity.value = withTiming(1, { duration: durations.fast });
      scale.value = withTiming(1, { duration: durations.fast });

      // Glow effect
      glowOpacity.value = withSequence(
        withTiming(0.6, { duration: 150 }),
        withTiming(0.2, { duration: 300 })
      );

      // Shake for wrong answer
      if (!isCorrect) {
        shakeX.value = withSequence(
          withTiming(-8, { duration: 50, easing: Easing.linear }),
          withTiming(8, { duration: 50, easing: Easing.linear }),
          withTiming(-6, { duration: 50, easing: Easing.linear }),
          withTiming(6, { duration: 50, easing: Easing.linear }),
          withTiming(0, { duration: 50, easing: Easing.linear })
        );
      }
    } else {
      translateY.value = reduceMotion ? 100 : withTiming(100, { duration: durations.fast });
      opacity.value = reduceMotion ? 0 : withTiming(0, { duration: durations.fast });
    }
  }, [visible, isCorrect, reduceMotion, translateY, opacity, scale, shakeX, glowOpacity]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: shakeX.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        isCorrect ? styles.containerCorrect : styles.containerWrong,
        containerStyle,
      ]}
    >
      {/* Glow overlay */}
      <Animated.View
        style={[
          styles.glow,
          isCorrect ? styles.glowCorrect : styles.glowWrong,
          glowStyle,
        ]}
        pointerEvents="none"
      />

      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            isCorrect ? styles.iconCorrect : styles.iconWrong,
          ]}
        >
          {isCorrect ? (
            <Check size={20} color={colors.success} strokeWidth={3} />
          ) : (
            <X size={20} color={colors.error} strokeWidth={3} />
          )}
        </View>
        <Text
          style={[
            styles.title,
            isCorrect ? styles.titleCorrect : styles.titleWrong,
          ]}
        >
          {isCorrect ? "Correct!" : "Not quite"}
        </Text>
      </View>

      {!isCorrect && correctAnswer && (
        <View style={styles.correctAnswerSection}>
          <Text style={styles.correctLabel}>Correct answer:</Text>
          <Text style={styles.correctAnswer}>{correctAnswer}</Text>
        </View>
      )}

      {explanation && (
        <Text style={styles.explanation}>{explanation}</Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  containerCorrect: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderTopWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  containerWrong: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderTopWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  glow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  glowCorrect: {
    backgroundColor: colors.success,
  },
  glowWrong: {
    backgroundColor: colors.error,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconCorrect: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
  },
  iconWrong: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
  },
  title: {
    fontFamily: "Satoshi-Bold",
    fontSize: 20,
    letterSpacing: -0.3,
  },
  titleCorrect: {
    color: colors.success,
  },
  titleWrong: {
    color: colors.error,
  },
  correctAnswerSection: {
    marginBottom: 8,
  },
  correctLabel: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.muted,
    marginBottom: 4,
  },
  correctAnswer: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 16,
    color: colors.text.primary,
  },
  explanation: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});

