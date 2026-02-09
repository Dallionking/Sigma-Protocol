import * as Haptics from "expo-haptics";
import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { colors, durations } from "../theme/tokens";

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  variant?: "ghost" | "outline";
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function SecondaryButton({
  label,
  onPress,
  disabled = false,
  style,
  variant = "ghost",
}: Props) {
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = 1 - pressed.value * 0.03;
    return { transform: [{ scale }] };
  });

  const handlePressIn = useCallback(() => {
    if (disabled) return;
    pressed.value = withTiming(1, { duration: durations.fast });
  }, [disabled, pressed]);

  const handlePressOut = useCallback(() => {
    pressed.value = withTiming(0, { duration: durations.fast });
  }, [pressed]);

  const handlePress = useCallback(() => {
    if (disabled) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [disabled, onPress]);

  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[
        styles.button,
        variant === "outline" && styles.buttonOutline,
        disabled && styles.buttonDisabled,
        style,
        animatedStyle,
      ]}
    >
      <Text
        style={[
          styles.label,
          disabled && styles.labelDisabled,
        ]}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  buttonOutline: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  label: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 15,
    color: colors.text.secondary,
    letterSpacing: 0.2,
  },
  labelDisabled: {
    color: colors.text.muted,
  },
});



