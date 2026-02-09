import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

import { useReduceMotion } from "../hooks/useReduceMotion";
import { colors } from "../theme/tokens";

type Props = {
  currentXP: number;
  maxXP: number;
  level: number;
  size?: number;
};

export function XPProgressRing({
  currentXP,
  maxXP,
  level,
  size = 120,
}: Props) {
  const reduceMotion = useReduceMotion();
  const [animatedProgress, setAnimatedProgress] = useState(0);

  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const targetProgress = maxXP > 0 ? currentXP / maxXP : 0;

  useEffect(() => {
    if (reduceMotion) {
      setAnimatedProgress(targetProgress);
      return;
    }

    // Simple animation using requestAnimationFrame
    const duration = 1200;
    const startTime = Date.now();
    const startValue = animatedProgress;
    const endValue = targetProgress;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * eased;
      setAnimatedProgress(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [targetProgress, reduceMotion]);

  const strokeDashoffset = circumference * (1 - animatedProgress);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Glow effect */}
      <View style={[styles.glow, { width: size + 20, height: size + 20 }]} />

      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.secondary[400]} />
            <Stop offset="100%" stopColor={colors.primary[400]} />
          </LinearGradient>
        </Defs>

        {/* Background track */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Progress arc */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>

      {/* Center content */}
      <View style={styles.centerContent}>
        <Text style={styles.levelLabel}>Level</Text>
        <Text style={styles.levelValue}>{level}</Text>
      </View>
    </View>
  );
}

export function XPProgressRingCompact({
  currentXP,
  maxXP,
  level,
}: Props) {
  return (
    <View style={styles.compactContainer}>
      <XPProgressRing currentXP={currentXP} maxXP={maxXP} level={level} size={80} />
      <View style={styles.compactInfo}>
        <Text style={styles.xpValue}>{currentXP.toLocaleString()} XP</Text>
        <Text style={styles.xpLabel}>
          {(maxXP - currentXP).toLocaleString()} to Level {level + 1}
        </Text>
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
  glow: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: colors.secondary[500],
    opacity: 0.08,
  },
  svg: {
    position: "absolute",
  },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  levelLabel: {
    fontFamily: "PlusJakartaSans",
    fontSize: 11,
    color: colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  levelValue: {
    fontFamily: "Satoshi-Bold",
    fontSize: 28,
    color: colors.text.primary,
    marginTop: -2,
  },
  compactContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  compactInfo: {
    flex: 1,
  },
  xpValue: {
    fontFamily: "Satoshi-Bold",
    fontSize: 22,
    color: colors.text.primary,
  },
  xpLabel: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
});



