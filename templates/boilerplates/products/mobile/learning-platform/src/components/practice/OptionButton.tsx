import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Check, X } from "lucide-react-native";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { useReduceMotion } from "@/hooks/useReduceMotion";
import { colors, durations } from "@/theme/tokens";

type OptionState = "default" | "selected" | "correct" | "wrong" | "disabled";

type Props = {
  label: string;
  optionLetter?: string;
  state: OptionState;
  onPress: () => void;
  disabled?: boolean;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function OptionButton({
  label,
  optionLetter,
  state,
  onPress,
  disabled = false,
}: Props) {
  const reduceMotion = useReduceMotion();
  const scale = useSharedValue(1);
  const shakeX = useSharedValue(0);
  const stateValue = useSharedValue(0);

  // Map state to numeric value for color interpolation
  useEffect(() => {
    const targetValue =
      state === "default"
        ? 0
        : state === "selected"
          ? 1
          : state === "correct"
            ? 2
            : state === "wrong"
              ? 3
              : 0;

    stateValue.value = reduceMotion
      ? targetValue
      : withTiming(targetValue, { duration: 200 });

    // Shake animation for wrong answer
    if (state === "wrong" && !reduceMotion) {
      shakeX.value = withSequence(
        withTiming(-6, { duration: 40, easing: Easing.linear }),
        withTiming(6, { duration: 40, easing: Easing.linear }),
        withTiming(-4, { duration: 40, easing: Easing.linear }),
        withTiming(4, { duration: 40, easing: Easing.linear }),
        withTiming(0, { duration: 40, easing: Easing.linear })
      );
    }
  }, [state, reduceMotion, stateValue, shakeX]);

  const handlePressIn = useCallback(() => {
    if (disabled) return;
    scale.value = reduceMotion ? 0.98 : withTiming(0.98, { duration: durations.fast });
  }, [disabled, scale, reduceMotion]);

  const handlePressOut = useCallback(() => {
    scale.value = reduceMotion ? 1 : withTiming(1, { duration: durations.fast });
  }, [scale, reduceMotion]);

  const handlePress = useCallback(() => {
    if (disabled) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [disabled, onPress]);

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      stateValue.value,
      [0, 1, 2, 3],
      [
        "rgba(17, 24, 39, 0.6)", // default
        "rgba(6, 182, 212, 0.15)", // selected
        "rgba(16, 185, 129, 0.15)", // correct
        "rgba(239, 68, 68, 0.15)", // wrong
      ]
    );

    const borderColor = interpolateColor(
      stateValue.value,
      [0, 1, 2, 3],
      [
        "rgba(255, 255, 255, 0.08)", // default
        colors.secondary[400], // selected
        colors.success, // correct
        colors.error, // wrong
      ]
    );

    return {
      backgroundColor,
      borderColor,
      transform: [{ scale: scale.value }, { translateX: shakeX.value }],
    };
  });

  const letterStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      stateValue.value,
      [0, 1, 2, 3],
      [
        "rgba(255, 255, 255, 0.08)", // default
        "rgba(6, 182, 212, 0.3)", // selected
        "rgba(16, 185, 129, 0.3)", // correct
        "rgba(239, 68, 68, 0.3)", // wrong
      ]
    );

    return { backgroundColor };
  });

  const showIcon = state === "correct" || state === "wrong";

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
      style={[styles.container, animatedStyle]}
      accessibilityRole="button"
      accessibilityState={{ selected: state === "selected", disabled }}
    >
      {optionLetter && (
        <Animated.View style={[styles.letterContainer, letterStyle]}>
          {showIcon ? (
            state === "correct" ? (
              <Check size={16} color={colors.success} strokeWidth={3} />
            ) : (
              <X size={16} color={colors.error} strokeWidth={3} />
            )
          ) : (
            <Text style={styles.letter}>{optionLetter}</Text>
          )}
        </Animated.View>
      )}
      <Text
        style={[
          styles.label,
          state === "correct" && styles.labelCorrect,
          state === "wrong" && styles.labelWrong,
        ]}
        numberOfLines={2}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  letterContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  letter: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
    color: colors.text.primary,
  },
  label: {
    flex: 1,
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 22,
  },
  labelCorrect: {
    color: colors.success,
  },
  labelWrong: {
    color: colors.error,
  },
});

