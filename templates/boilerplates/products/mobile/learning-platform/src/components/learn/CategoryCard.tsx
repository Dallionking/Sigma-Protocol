import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LucideIcon } from "lucide-react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { GlassPanel } from "@/components/GlassPanel";
import { colors, durations } from "@/theme/tokens";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  onPress: () => void;
  accentColor?: string;
  delay?: number;
};

export function CategoryCard({
  icon: Icon,
  title,
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
    scale.value = reduceMotion ? 0.97 : withTiming(0.97, { duration: durations.fast });
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
      from={motionFrom.fadeUp}
      animate={{ opacity: 1, translateY: 0 }}
      transition={getTransition({ delay })}
      style={styles.wrapper}
    >
      <AnimatedPressable
        style={animatedStyle}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={title}
      >
        <GlassPanel style={styles.card}>
          {/* Icon with accent glow */}
          <View style={[styles.iconWrapper, { backgroundColor: `${accentColor}20` }]}>
            <Icon size={24} color={accentColor} strokeWidth={1.8} />
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? (
              <Text style={styles.subtitle} numberOfLines={2}>
                {subtitle}
              </Text>
            ) : null}
          </View>

          {/* Accent bar */}
          <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
        </GlassPanel>
      </AnimatedPressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "48%",
    marginBottom: 12,
  },
  card: {
    padding: 16,
    paddingBottom: 20,
    borderRadius: 18,
    minHeight: 130,
    overflow: "hidden",
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: "Satoshi-Bold",
    fontSize: 16,
    color: colors.text.primary,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.muted,
    lineHeight: 18,
  },
  accentBar: {
    position: "absolute",
    bottom: 0,
    left: 16,
    right: 16,
    height: 3,
    borderRadius: 2,
    opacity: 0.6,
  },
});

