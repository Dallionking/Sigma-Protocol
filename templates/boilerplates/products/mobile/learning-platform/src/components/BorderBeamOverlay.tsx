import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { useReduceMotion } from "../hooks/useReduceMotion";

type Props = {
  borderRadius?: number;
  borderWidth?: number;
  duration?: number;
  color?: string;
  disabled?: boolean;
};

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

/**
 * BorderBeamOverlay - A sweeping gradient animation along the border
 * 
 * Creates a scanning/breathing light effect by animating a gradient
 * horizontally across the component's border area.
 * 
 * Animation: 3-second infinite loop with ease-in-out timing
 * Gradient: transparent → accent@50% → transparent
 */
export function BorderBeamOverlay({
  borderRadius = 20,
  borderWidth = 1.5,
  duration = 3000,
  color = "rgba(255, 255, 255, 0.5)",
  disabled = false,
}: Props) {
  const reduceMotion = useReduceMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion || disabled) {
      progress.value = 0;
      return;
    }

    progress.value = withRepeat(
      withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
      -1,
      false
    );
  }, [progress, duration, reduceMotion, disabled]);

  // Animate the gradient position (simulates background-position animation)
  const animatedProps = useAnimatedProps(() => {
    // Sweep from left (-0.5) to right (1.5) for full coverage
    const offset = interpolate(progress.value, [0, 1], [-0.5, 1.5]);

    return {
      start: { x: offset, y: 0.5 },
      end: { x: offset + 0.5, y: 0.5 },
    };
  }, []);

  // Static border for reduced motion
  if (reduceMotion || disabled) {
    return (
      <View
        style={[
          styles.staticBorder,
          {
            borderRadius,
            borderWidth,
            borderColor: "rgba(255, 255, 255, 0.12)",
          },
        ]}
        pointerEvents="none"
      />
    );
  }

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Static subtle border underneath */}
      <View
        style={[
          styles.staticBorder,
          {
            borderRadius,
            borderWidth,
            borderColor: "rgba(255, 255, 255, 0.08)",
          },
        ]}
      />

      {/* Animated sweeping gradient - clipped to border area */}
      <View style={[styles.beamClip, { borderRadius }]}>
        <AnimatedLinearGradient
          colors={["transparent", color, "transparent"]}
          animatedProps={animatedProps}
          style={styles.beamGradient}
        />

        {/* Inner mask to only show beam at border edges */}
        <View
          style={[
            styles.innerMask,
            {
              top: borderWidth,
              left: borderWidth,
              right: borderWidth,
              bottom: borderWidth,
              borderRadius: borderRadius - borderWidth,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  staticBorder: {
    ...StyleSheet.absoluteFillObject,
  },
  beamClip: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  beamGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  innerMask: {
    position: "absolute",
    backgroundColor: "#0F172A", // Solid background to mask center
  },
});

