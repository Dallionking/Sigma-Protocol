import * as Haptics from "expo-haptics";
import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Heart } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { colors, durations } from "@/theme/tokens";

interface Props {
  count: number;
  isLiked: boolean;
  onToggle: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function LikeButton({ count, isLiked, onToggle }: Props) {
  const scale = useSharedValue(1);

  const handlePress = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSequence(
      withTiming(1.2, { duration: durations.fast }),
      withTiming(1, { duration: durations.fast })
    );
    onToggle();
  }, [onToggle, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[styles.container, animatedStyle]}
      accessibilityRole="button"
      accessibilityLabel={isLiked ? "Unlike" : "Like"}
    >
      <Heart
        size={20}
        color={isLiked ? colors.error : colors.text.muted}
        fill={isLiked ? colors.error : "transparent"}
      />
      <Text style={[styles.count, isLiked && styles.countLiked]}>
        {count}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  count: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
    color: colors.text.muted,
  },
  countLiked: {
    color: colors.error,
  },
});

