import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Timer } from "lucide-react-native";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useReduceMotion } from "@/hooks/useReduceMotion";
import { colors } from "@/theme/tokens";

type Props = {
  remainingSeconds: number;
  totalSeconds: number;
  onTimeUp?: () => void;
};

export function TimerBar({ remainingSeconds, totalSeconds, onTimeUp }: Props) {
  const reduceMotion = useReduceMotion();
  const progress = useSharedValue(1);
  const urgency = useSharedValue(0);

  useEffect(() => {
    const targetProgress = remainingSeconds / totalSeconds;

    if (reduceMotion) {
      progress.value = targetProgress;
    } else {
      progress.value = withTiming(targetProgress, {
        duration: 1000,
        easing: Easing.linear,
      });
    }

    // Set urgency level for color changes
    if (remainingSeconds <= 5) {
      urgency.value = reduceMotion ? 2 : withTiming(2, { duration: 200 });
    } else if (remainingSeconds <= 10) {
      urgency.value = reduceMotion ? 1 : withTiming(1, { duration: 200 });
    } else {
      urgency.value = reduceMotion ? 0 : withTiming(0, { duration: 200 });
    }

    // Trigger callback when time is up
    if (remainingSeconds <= 0 && onTimeUp) {
      onTimeUp();
    }
  }, [remainingSeconds, totalSeconds, reduceMotion, progress, urgency, onTimeUp]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
    backgroundColor: interpolateColor(
      urgency.value,
      [0, 1, 2],
      [colors.secondary[400], colors.warning, colors.error]
    ),
  }));

  const containerStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      urgency.value,
      [0, 1, 2],
      [
        "rgba(6, 182, 212, 0.3)",
        "rgba(245, 158, 11, 0.3)",
        "rgba(239, 68, 68, 0.4)",
      ]
    ),
  }));

  const textStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      urgency.value,
      [0, 1, 2],
      [colors.text.primary, colors.warning, colors.error]
    ),
  }));

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.container, containerStyle]}>
        <View style={styles.barBackground}>
          <Animated.View style={[styles.barFill, barStyle]} />
        </View>
      </Animated.View>

      <View style={styles.timeDisplay}>
        <Timer size={16} color={colors.text.secondary} />
        <Animated.Text style={[styles.timeText, textStyle]}>
          {formatTime(remainingSeconds)}
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
  },
  container: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 3,
    backgroundColor: "rgba(17, 24, 39, 0.6)",
  },
  barBackground: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 5,
  },
  timeDisplay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    gap: 6,
  },
  timeText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 16,
  },
});

