import * as Haptics from "expo-haptics";
import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useReduceMotion } from "@/hooks/useReduceMotion";
import { colors, durations } from "@/theme/tokens";

type Props = {
  word: string;
  isSelected: boolean;
  isPlaced: boolean;
  onPress: () => void;
  disabled?: boolean;
  index?: number;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function WordTile({
  word,
  isSelected,
  isPlaced,
  onPress,
  disabled = false,
  index = 0,
}: Props) {
  const reduceMotion = useReduceMotion();
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  const handlePressIn = useCallback(() => {
    if (disabled) return;
    scale.value = reduceMotion ? 0.95 : withTiming(0.95, { duration: durations.fast });
    translateY.value = reduceMotion ? -2 : withTiming(-2, { duration: durations.fast });
  }, [disabled, scale, translateY, reduceMotion]);

  const handlePressOut = useCallback(() => {
    scale.value = reduceMotion ? 1 : withTiming(1, { duration: durations.fast });
    translateY.value = reduceMotion ? 0 : withTiming(0, { duration: durations.fast });
  }, [scale, translateY, reduceMotion]);

  const handlePress = useCallback(() => {
    if (disabled) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [disabled, onPress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
      style={[
        styles.container,
        isSelected && styles.containerSelected,
        isPlaced && styles.containerPlaced,
        disabled && styles.containerDisabled,
        animatedStyle,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Word: ${word}`}
      accessibilityState={{ selected: isSelected, disabled }}
    >
      <Text
        style={[
          styles.word,
          isSelected && styles.wordSelected,
          isPlaced && styles.wordPlaced,
          disabled && styles.wordDisabled,
        ]}
      >
        {word}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: "rgba(17, 24, 39, 0.7)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.12)",
    margin: 4,
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  containerSelected: {
    backgroundColor: "rgba(6, 182, 212, 0.2)",
    borderColor: colors.secondary[400],
  },
  containerPlaced: {
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    borderColor: colors.primary[400],
  },
  containerDisabled: {
    opacity: 0.4,
    backgroundColor: "rgba(17, 24, 39, 0.3)",
  },
  word: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 16,
    color: colors.text.primary,
    textAlign: "center",
  },
  wordSelected: {
    color: colors.secondary[400],
  },
  wordPlaced: {
    color: colors.primary[400],
  },
  wordDisabled: {
    color: colors.text.muted,
  },
});

