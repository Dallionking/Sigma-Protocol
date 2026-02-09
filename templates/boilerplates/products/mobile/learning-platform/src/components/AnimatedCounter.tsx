import React, { useEffect, useCallback } from "react";
import { StyleSheet, Text, TextStyle } from "react-native";
import Animated, {
  useSharedValue,
  withTiming,
  useDerivedValue,
  runOnJS,
} from "react-native-reanimated";

import { useReduceMotion } from "../hooks/useReduceMotion";
import { colors, durations } from "../theme/tokens";

type Props = {
  value: number;
  style?: TextStyle;
  prefix?: string;
  suffix?: string;
};

export function AnimatedCounter({
  value,
  style,
  prefix = "",
  suffix = "",
}: Props) {
  const reduceMotion = useReduceMotion();
  const animatedValue = useSharedValue(0);
  const [displayValue, setDisplayValue] = React.useState("0");

  const updateDisplay = useCallback((val: number) => {
    setDisplayValue(val.toLocaleString());
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      animatedValue.value = value;
      updateDisplay(value);
    } else {
      animatedValue.value = withTiming(value, {
        duration: 1000,
      });
    }
  }, [value, reduceMotion, animatedValue, updateDisplay]);

  // Update display value on UI thread changes
  useDerivedValue(() => {
    const rounded = Math.round(animatedValue.value);
    runOnJS(updateDisplay)(rounded);
  }, [animatedValue, updateDisplay]);

  return (
    <Text style={[styles.text, style]}>
      {prefix}
      {displayValue}
      {suffix}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: "Satoshi-Bold",
    fontSize: 28,
    color: colors.text.primary,
  },
});



