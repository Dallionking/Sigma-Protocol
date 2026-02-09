import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { useReduceMotion } from "../hooks/useReduceMotion";
import { colors } from "../theme/tokens";

type Props = {
  size?: number;
};

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedView = Animated.createAnimatedComponent(View);

const DASH = 999;

export function NeonMonogram({ size = 148 }: Props) {
  const reduceMotion = useReduceMotion();

  const draw = useSharedValue(0);
  const flicker = useSharedValue(1);
  const idle = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      draw.value = withTiming(1, { duration: 150 });
      return;
    }

    // Stroke draw (premium pace), then tiny neon flicker, then idle breathe.
    draw.value = withDelay(
      250,
      withTiming(1, { duration: 950, easing: Easing.out(Easing.cubic) })
    );

    flicker.value = withDelay(
      1100,
      withSequence(
        withTiming(0.85, { duration: 40 }),
        withTiming(1, { duration: 80 })
      )
    );

    idle.value = withDelay(
      1200,
      withRepeat(
        withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.quad) }),
        -1,
        true
      )
    );
  }, [draw, flicker, idle, reduceMotion]);

  const animatedStrokeProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: (1 - draw.value) * DASH,
      opacity: flicker.value,
    };
  });

  const containerStyle = useAnimatedStyle(() => {
    if (reduceMotion) return {};

    const scale = 1 + idle.value * 0.012;
    const opacity = 0.98 + idle.value * 0.02;

    return {
      transform: [{ scale }],
      opacity,
    };
  }, [reduceMotion]);

  return (
    <AnimatedView style={[styles.container, containerStyle]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Glow layer */}
        <AnimatedPath
          animatedProps={animatedStrokeProps}
          d="M34 28 C28 18 18 18 18 28 C18 38 34 38 34 50 C34 62 18 62 18 72 C18 82 32 82 34 74"
          fill="none"
          stroke={colors.secondary[400]}
          strokeWidth={10}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={DASH}
          opacity={0.22}
        />
        <AnimatedCircle
          animatedProps={animatedStrokeProps}
          cx={50}
          cy={50}
          r={14}
          fill="none"
          stroke={colors.primary[500]}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={DASH}
          opacity={0.18}
        />
        <AnimatedPath
          animatedProps={animatedStrokeProps}
          d="M66 22 L66 78 M66 22 C86 22 86 40 66 40 M66 40 C90 40 90 78 66 78"
          fill="none"
          stroke={colors.secondary[300]}
          strokeWidth={10}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={DASH}
          opacity={0.20}
        />

        {/* Core stroke layer */}
        <AnimatedPath
          animatedProps={animatedStrokeProps}
          d="M34 28 C28 18 18 18 18 28 C18 38 34 38 34 50 C34 62 18 62 18 72 C18 82 32 82 34 74"
          fill="none"
          stroke={colors.secondary[200]}
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={DASH}
        />
        <AnimatedCircle
          animatedProps={animatedStrokeProps}
          cx={50}
          cy={50}
          r={14}
          fill="none"
          stroke={colors.primary[400]}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={DASH}
        />
        <AnimatedPath
          animatedProps={animatedStrokeProps}
          d="M66 22 L66 78 M66 22 C86 22 86 40 66 40 M66 40 C90 40 90 78 66 78"
          fill="none"
          stroke={colors.secondary[200]}
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={DASH}
        />
      </Svg>
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
