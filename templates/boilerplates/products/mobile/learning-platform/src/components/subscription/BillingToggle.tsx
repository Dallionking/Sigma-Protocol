import * as Haptics from "expo-haptics";
import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { BillingCycle } from "@/stores/subscriptionStore";
import { colors, durations } from "@/theme/tokens";

interface Props {
  value: BillingCycle;
  onValueChange: (value: BillingCycle) => void;
  savingsPercent?: number;
}

export function BillingToggle({ value, onValueChange, savingsPercent = 17 }: Props) {
  const isAnnual = value === "annual";
  const indicatorPosition = useSharedValue(isAnnual ? 1 : 0);

  const handleToggle = useCallback(
    (newValue: BillingCycle) => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      indicatorPosition.value = withTiming(newValue === "annual" ? 1 : 0, {
        duration: durations.fast,
      });
      onValueChange(newValue);
    },
    [onValueChange, indicatorPosition]
  );

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorPosition.value * 120 }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <Animated.View style={[styles.indicator, indicatorStyle]} />
        <Pressable
          onPress={() => handleToggle("monthly")}
          style={styles.option}
        >
          <Text style={[styles.optionLabel, !isAnnual && styles.optionLabelActive]}>
            Monthly
          </Text>
        </Pressable>
        <Pressable
          onPress={() => handleToggle("annual")}
          style={styles.option}
        >
          <Text style={[styles.optionLabel, isAnnual && styles.optionLabelActive]}>
            Annual
          </Text>
          {savingsPercent > 0 && (
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsText}>Save {savingsPercent}%</Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  track: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 12,
    padding: 4,
    position: "relative",
  },
  indicator: {
    position: "absolute",
    top: 4,
    left: 4,
    width: 120,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
  },
  option: {
    width: 120,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLabel: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.muted,
  },
  optionLabelActive: {
    fontFamily: "PlusJakartaSans-SemiBold",
    color: colors.text.primary,
  },
  savingsBadge: {
    position: "absolute",
    top: -10,
    right: 2,
    backgroundColor: colors.accent[400],
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  savingsText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 9,
    color: colors.surface.base,
  },
});

