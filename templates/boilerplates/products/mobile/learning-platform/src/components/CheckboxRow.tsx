import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Check } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { colors, durations } from "../theme/tokens";

type Props = {
  label: string;
  checked: boolean;
  onToggle: () => void;
  delay?: number;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CheckboxRow({ label, checked, onToggle, delay = 0 }: Props) {
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = 1 - pressed.value * 0.02;
    return { transform: [{ scale }] };
  });

  const handlePressIn = useCallback(() => {
    pressed.value = withTiming(1, { duration: durations.fast });
  }, [pressed]);

  const handlePressOut = useCallback(() => {
    pressed.value = withTiming(0, { duration: durations.fast });
  }, [pressed]);

  const handlePress = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  }, [onToggle]);

  return (
    <MotiView
      from={{ opacity: 0, translateX: -8 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: "timing", duration: 260, delay }}
    >
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={[
          styles.container,
          checked && styles.containerChecked,
          animatedStyle,
        ]}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
      >
        <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
          {checked && (
            <MotiView
              from={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "timing", duration: 200 }}
            >
              <Check size={14} color={colors.bg[900]} strokeWidth={3} />
            </MotiView>
          )}
        </View>

        <Text style={[styles.label, checked && styles.labelChecked]}>
          {label}
        </Text>
      </AnimatedPressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "rgba(17, 24, 39, 0.5)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  containerChecked: {
    backgroundColor: "rgba(99, 102, 241, 0.08)",
    borderColor: colors.primary[500],
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  checkboxChecked: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  label: {
    fontFamily: "PlusJakartaSans",
    fontSize: 15,
    color: colors.text.primary,
    flex: 1,
  },
  labelChecked: {
    color: colors.primary[400],
  },
});



