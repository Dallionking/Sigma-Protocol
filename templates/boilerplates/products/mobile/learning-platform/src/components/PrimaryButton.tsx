import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect } from "react";
import { Pressable, StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { BorderBeamOverlay } from "./BorderBeamOverlay";
import { useReduceMotion } from "../hooks/useReduceMotion";
import { colors, durations } from "../theme/tokens";

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  variant?: "primary" | "secondary";
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.createAnimatedComponent(View);

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  style,
  variant = "primary",
}: Props) {
  const reduceMotion = useReduceMotion();
  const pressed = useSharedValue(0);
  const shimmer = useSharedValue(0);

  // Shimmer animation for loading state
  useEffect(() => {
    if (!loading || reduceMotion) {
      shimmer.value = 0;
      return;
    }

    shimmer.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.linear }),
      -1,
      false
    );
  }, [loading, shimmer, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = reduceMotion ? 1 : 1 - pressed.value * 0.03;

    return {
      transform: [{ scale }],
    };
  }, [reduceMotion]);

  const shimmerStyle = useAnimatedStyle(() => {
    if (!loading || reduceMotion) return { opacity: 0 };

    const translateX = interpolate(shimmer.value, [0, 1], [-200, 200]);

    return {
      opacity: 0.3,
      transform: [{ translateX }],
    };
  }, [loading, reduceMotion]);

  const handlePressIn = useCallback(() => {
    if (disabled || loading) return;
    pressed.value = reduceMotion ? 1 : withTiming(1, { duration: durations.fast });
  }, [disabled, loading, pressed, reduceMotion]);

  const handlePressOut = useCallback(() => {
    pressed.value = reduceMotion ? 0 : withTiming(0, { duration: durations.fast });
  }, [pressed, reduceMotion]);

  const handlePress = useCallback(() => {
    if (disabled || loading) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [disabled, loading, onPress]);

  const isDisabled = disabled || loading;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[styles.pressable, animatedStyle, style]}
    >
      {/* Border Beam Animation - sweeping gradient */}
      <BorderBeamOverlay
        borderRadius={BORDER_RADIUS}
        borderWidth={BORDER_WIDTH}
        duration={3000}
        color="rgba(255, 255, 255, 0.5)"
        disabled={isDisabled}
      />

      {/* Glassmorphic background */}
      <LinearGradient
        colors={
          isDisabled
            ? ["rgba(99, 102, 241, 0.35)", "rgba(79, 70, 229, 0.30)"]
            : ["rgba(99, 102, 241, 0.95)", "rgba(79, 70, 229, 0.90)"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Inner highlight for glass effect */}
        <View style={styles.innerHighlight} pointerEvents="none" />

        {/* Shimmer overlay for loading */}
        {loading && (
          <AnimatedView style={[styles.shimmerOverlay, shimmerStyle]} pointerEvents="none">
            <LinearGradient
              colors={[
                "transparent",
                "rgba(255, 255, 255, 0.4)",
                "transparent",
              ]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.shimmerGradient}
            />
          </AnimatedView>
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <LoadingDots reduceMotion={reduceMotion} />
          </View>
        ) : (
          <Text style={styles.label}>{label}</Text>
        )}
      </LinearGradient>
    </AnimatedPressable>
  );
}

function LoadingDots({ reduceMotion }: { reduceMotion: boolean }) {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;

    dot1.value = withRepeat(
      withTiming(1, { duration: 400, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );

    const timer1 = setTimeout(() => {
      dot2.value = withRepeat(
        withTiming(1, { duration: 400, easing: Easing.inOut(Easing.quad) }),
        -1,
        true
      );
    }, 150);

    const timer2 = setTimeout(() => {
      dot3.value = withRepeat(
        withTiming(1, { duration: 400, easing: Easing.inOut(Easing.quad) }),
        -1,
        true
      );
    }, 300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [dot1, dot2, dot3, reduceMotion]);

  const dot1Style = useAnimatedStyle(() => ({
    opacity: reduceMotion ? 0.7 : interpolate(dot1.value, [0, 1], [0.4, 1]),
    transform: [{ scale: reduceMotion ? 1 : interpolate(dot1.value, [0, 1], [0.8, 1]) }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: reduceMotion ? 0.7 : interpolate(dot2.value, [0, 1], [0.4, 1]),
    transform: [{ scale: reduceMotion ? 1 : interpolate(dot2.value, [0, 1], [0.8, 1]) }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    opacity: reduceMotion ? 0.7 : interpolate(dot3.value, [0, 1], [0.4, 1]),
    transform: [{ scale: reduceMotion ? 1 : interpolate(dot3.value, [0, 1], [0.8, 1]) }],
  }));

  return (
    <View style={styles.dotsContainer}>
      <AnimatedView style={[styles.dot, dot1Style]} />
      <AnimatedView style={[styles.dot, dot2Style]} />
      <AnimatedView style={[styles.dot, dot3Style]} />
    </View>
  );
}

const BORDER_RADIUS = 20;
const BORDER_WIDTH = 1.5;

const styles = StyleSheet.create({
  pressable: {
    borderRadius: BORDER_RADIUS,
    overflow: "hidden",
    position: "relative",
  } as ViewStyle,
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BORDER_RADIUS,
    overflow: "hidden",
    // Inner border for glassmorphism
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  } as ViewStyle,
  innerHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  } as ViewStyle,
  shimmerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  } as ViewStyle,
  shimmerGradient: {
    width: 100,
    height: "100%",
  } as ViewStyle,
  label: {
    color: colors.text.primary,
    fontSize: 16,
    letterSpacing: 0.3,
    fontFamily: "PlusJakartaSans-SemiBold",
    fontWeight: "600",
  } as TextStyle,
  loadingContainer: {
    height: 22,
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,
  dotsContainer: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  } as ViewStyle,
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.text.primary,
  } as ViewStyle,
});
