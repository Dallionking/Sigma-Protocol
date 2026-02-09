import React, { useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { useReduceMotion } from "@/hooks/useReduceMotion";
import { colors } from "@/theme/tokens";

type Props = {
  isActive: boolean;
  barCount?: number;
  color?: string;
  height?: number;
};

export function VoiceWaveform({
  isActive,
  barCount = 24,
  color = colors.secondary[400],
  height = 60,
}: Props) {
  const reduceMotion = useReduceMotion();
  const bars = useMemo(() => Array.from({ length: barCount }, (_, i) => i), [barCount]);

  return (
    <View style={[styles.container, { height }]}>
      {bars.map((_, index) => (
        <WaveformBar
          key={index}
          index={index}
          isActive={isActive}
          color={color}
          maxHeight={height}
          reduceMotion={reduceMotion}
        />
      ))}
    </View>
  );
}

function WaveformBar({
  index,
  isActive,
  color,
  maxHeight,
  reduceMotion,
}: {
  index: number;
  isActive: boolean;
  color: string;
  maxHeight: number;
  reduceMotion: boolean;
}) {
  const barHeight = useSharedValue(10);

  useEffect(() => {
    if (!isActive || reduceMotion) {
      barHeight.value = withTiming(10, { duration: 200 });
      return;
    }

    // Each bar has different timing for organic feel
    const minH = 8 + Math.random() * 8;
    const maxH = maxHeight * (0.4 + Math.random() * 0.5);
    const duration = 120 + Math.random() * 80;
    const delay = index * 20;

    setTimeout(() => {
      barHeight.value = withRepeat(
        withSequence(
          withTiming(maxH, { duration, easing: Easing.inOut(Easing.quad) }),
          withTiming(minH, { duration, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      );
    }, delay);
  }, [isActive, index, maxHeight, reduceMotion, barHeight]);

  const barStyle = useAnimatedStyle(() => ({
    height: barHeight.value,
    backgroundColor: color,
  }));

  return <Animated.View style={[styles.bar, barStyle]} />;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  bar: {
    width: 4,
    borderRadius: 2,
  },
});

