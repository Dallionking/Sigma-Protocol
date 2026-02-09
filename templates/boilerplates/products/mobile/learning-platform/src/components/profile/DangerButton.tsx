import * as Haptics from "expo-haptics";
import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, ActivityIndicator } from "react-native";
import { LucideIcon } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { colors, durations } from "@/theme/tokens";

interface Props {
  icon?: LucideIcon;
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function DangerButton({
  icon: Icon,
  label,
  onPress,
  loading = false,
  disabled = false,
}: Props) {
  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    if (disabled || loading) return;
    scale.value = withTiming(0.98, { duration: durations.fast });
  }, [scale, disabled, loading]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: durations.fast });
  }, [scale]);

  const handlePress = useCallback(() => {
    if (disabled || loading) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onPress();
  }, [onPress, disabled, loading]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[styles.container, animatedStyle, disabled && styles.disabled]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.error} />
      ) : (
        <>
          {Icon && <Icon size={18} color={colors.error} />}
          <Text style={styles.label}>{label}</Text>
        </>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  label: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 15,
    color: colors.error,
  },
  disabled: {
    opacity: 0.5,
  },
});

