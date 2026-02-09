import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Flame } from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from "react-native-reanimated";

import { useReduceMotion } from "../hooks/useReduceMotion";
import { colors, durations } from "../theme/tokens";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  streak: number;
  onPress?: () => void;
  size?: "small" | "medium" | "large";
};

export function StreakBadge({ streak, onPress, size = "medium" }: Props) {
  const reduceMotion = useReduceMotion();
  const scale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.4);

  const isActive = streak > 0;

  // Pulse animation for active streak
  React.useEffect(() => {
    if (!isActive || reduceMotion) return;

    pulseOpacity.value = withRepeat(
      withTiming(0.8, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [isActive, reduceMotion, pulseOpacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const handlePressIn = useCallback(() => {
    scale.value = reduceMotion ? 0.95 : withTiming(0.95, { duration: durations.fast });
  }, [reduceMotion, scale]);

  const handlePressOut = useCallback(() => {
    scale.value = reduceMotion ? 1 : withTiming(1, { duration: durations.fast });
  }, [reduceMotion, scale]);

  const handlePress = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  }, [onPress]);

  const sizeStyles = SIZE_STYLES[size];

  return (
    <AnimatedPressable
      style={[styles.container, sizeStyles.container, animatedStyle]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={`${streak} day streak`}
    >
      {/* Glow background for active streak */}
      {isActive && (
        <Animated.View style={[styles.glow, sizeStyles.glow, pulseStyle]} />
      )}

      <View style={styles.content}>
        <Flame
          size={sizeStyles.iconSize}
          color={isActive ? colors.primary[400] : colors.text.muted}
          fill={isActive ? colors.primary[500] : "transparent"}
          strokeWidth={isActive ? 2 : 1.5}
        />
        <Text
          style={[
            styles.count,
            sizeStyles.count,
            !isActive && styles.countInactive,
          ]}
        >
          {streak}
        </Text>
      </View>
    </AnimatedPressable>
  );
}

const SIZE_STYLES = {
  small: {
    container: { paddingHorizontal: 10, paddingVertical: 6 },
    glow: { top: -4, left: -4, right: -4, bottom: -4 },
    iconSize: 16,
    count: { fontSize: 14 },
  },
  medium: {
    container: { paddingHorizontal: 14, paddingVertical: 8 },
    glow: { top: -6, left: -6, right: -6, bottom: -6 },
    iconSize: 20,
    count: { fontSize: 16 },
  },
  large: {
    container: { paddingHorizontal: 18, paddingVertical: 10 },
    glow: { top: -8, left: -8, right: -8, bottom: -8 },
    iconSize: 24,
    count: { fontSize: 20 },
  },
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    backgroundColor: "rgba(17, 24, 39, 0.7)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  glow: {
    position: "absolute",
    borderRadius: 20,
    backgroundColor: colors.primary[500],
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  count: {
    fontFamily: "Satoshi-Bold",
    color: colors.text.primary,
  },
  countInactive: {
    color: colors.text.muted,
  },
});



