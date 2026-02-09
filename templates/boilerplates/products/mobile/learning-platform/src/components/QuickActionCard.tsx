import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LucideIcon } from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { colors, durations } from "@/theme/tokens";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  icon: LucideIcon;
  label: string;
  subtitle?: string;
  onPress: () => void;
  accentColor?: string;
  delay?: number;
};

export function QuickActionCard({
  icon: Icon,
  label,
  subtitle,
  onPress,
  accentColor = colors.secondary[400],
  delay = 0,
}: Props) {
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = reduceMotion ? 0.96 : withTiming(0.96, { duration: durations.fast });
  }, [reduceMotion, scale]);

  const handlePressOut = useCallback(() => {
    scale.value = reduceMotion ? 1 : withTiming(1, { duration: durations.fast });
  }, [reduceMotion, scale]);

  const handlePress = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);

  return (
    <MotiView
      from={motionFrom.scaleIn}
      animate={{ opacity: 1, scale: 1 }}
      transition={getTransition({ delay })}
      style={styles.wrapper}
    >
      <AnimatedPressable
        style={[styles.card, animatedStyle]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <View style={[styles.iconWrapper, { backgroundColor: `${accentColor}15` }]}>
          <Icon size={22} color={accentColor} strokeWidth={1.8} />
        </View>

        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>

        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </AnimatedPressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  card: {
    backgroundColor: "rgba(17, 24, 39, 0.6)",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  label: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
    color: colors.text.primary,
  },
  subtitle: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 4,
  },
});



