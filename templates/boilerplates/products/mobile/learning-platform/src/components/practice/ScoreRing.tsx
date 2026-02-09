import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

import { useReduceMotion } from "@/hooks/useReduceMotion";
import { colors } from "@/theme/tokens";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  score: number; // 0-100
  size?: number;
  strokeWidth?: number;
  label?: string;
  delay?: number;
};

export function ScoreRing({
  score,
  size = 160,
  strokeWidth = 12,
  label,
  delay = 300,
}: Props) {
  const reduceMotion = useReduceMotion();
  const progress = useSharedValue(0);
  const displayScore = useSharedValue(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const clampedScore = Math.max(0, Math.min(100, score));
    const targetProgress = clampedScore / 100;

    if (reduceMotion) {
      progress.value = targetProgress;
      displayScore.value = clampedScore;
    } else {
      progress.value = withDelay(
        delay,
        withTiming(targetProgress, {
          duration: 1200,
          easing: Easing.out(Easing.cubic),
        })
      );
      displayScore.value = withDelay(
        delay,
        withTiming(clampedScore, {
          duration: 1200,
          easing: Easing.out(Easing.cubic),
        })
      );
    }
  }, [score, delay, reduceMotion, progress, displayScore]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  // Determine color based on score
  const getScoreColor = () => {
    if (score >= 80) return colors.success;
    if (score >= 60) return colors.secondary[400];
    if (score >= 40) return colors.warning;
    return colors.error;
  };

  const scoreColor = getScoreColor();

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={scoreColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      {/* Center content */}
      <View style={[styles.centerContent, { width: size, height: size }]}>
        <Text style={[styles.score, { color: scoreColor }]}>{Math.round(score)}</Text>
        {label && <Text style={styles.label}>{label}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  svg: {
    transform: [{ rotate: "0deg" }],
  },
  centerContent: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  score: {
    fontFamily: "Satoshi-Bold",
    fontSize: 48,
    letterSpacing: -2,
  },
  label: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.muted,
    marginTop: 4,
  },
});

