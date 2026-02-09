import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { User } from "lucide-react-native";

import { useReduceMotion } from "../hooks/useReduceMotion";
import { colors } from "../theme/tokens";

type Props = {
  size?: number;
};

/**
 * TutorAvatar with breathing animation.
 * 
 * TODO: Replace placeholder with actual Lottie animation when asset is ready.
 * For now, uses a styled placeholder with breathing effect.
 */
export function TutorAvatar({ size = 120 }: Props) {
  const reduceMotion = useReduceMotion();
  const breath = useSharedValue(0);
  const glow = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;

    // Breathing animation
    breath.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );

    // Glow animation
    glow.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [breath, glow, reduceMotion]);

  const containerStyle = useAnimatedStyle(() => {
    if (reduceMotion) return {};

    const scale = 1 + breath.value * 0.03;
    return { transform: [{ scale }] };
  }, [reduceMotion]);

  const glowStyle = useAnimatedStyle(() => {
    if (reduceMotion) return { opacity: 0.3 };

    const opacity = 0.2 + glow.value * 0.15;
    const scale = 1 + glow.value * 0.1;
    return { opacity, transform: [{ scale }] };
  }, [reduceMotion]);

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      {/* Outer glow ring */}
      <Animated.View
        style={[
          styles.glowRing,
          { width: size + 40, height: size + 40 },
          glowStyle,
        ]}
      />

      {/* Inner glow */}
      <Animated.View
        style={[
          styles.innerGlow,
          { width: size + 20, height: size + 20 },
          glowStyle,
        ]}
      />

      {/* Avatar container with breathing */}
      <Animated.View
        style={[
          styles.avatar,
          { width: size, height: size, borderRadius: size / 2 },
          containerStyle,
        ]}
      >
        {/* Gradient overlay effect */}
        <View style={styles.gradientOverlay} />

        {/* Placeholder icon - replace with Lottie */}
        <View style={styles.iconWrapper}>
          <User size={size * 0.4} color={colors.text.primary} strokeWidth={1.5} />
        </View>

        {/* Initials overlay */}
        <View style={styles.initialsWrapper}>
          {/* T for AI Tutor */}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  glowRing: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: colors.primary[500],
  },
  innerGlow: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: colors.secondary[400],
  },
  avatar: {
    backgroundColor: "rgba(17, 24, 39, 0.8)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(99, 102, 241, 0.08)",
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  initialsWrapper: {
    position: "absolute",
    bottom: "15%",
    alignItems: "center",
  },
});



