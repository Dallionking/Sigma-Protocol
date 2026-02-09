import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { SimpleGrainOverlay } from "./GrainOverlay";
import { useReduceMotion } from "../hooks/useReduceMotion";
import { colors, gradients } from "../theme/tokens";

type Props = {
  children?: React.ReactNode;
  dim?: boolean;
  showStars?: boolean;
  showParticles?: boolean;
  showGrain?: boolean;
};

const AnimatedView = Animated.createAnimatedComponent(View);
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export function GradientBackground({
  children,
  dim = false,
  showStars = true,
  showParticles = true,
  showGrain = true,
}: Props) {
  const reduceMotion = useReduceMotion();

  const drift = useSharedValue(0);
  const twinkle = useSharedValue(0);
  const particleFloat = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;

    // Background drift
    drift.value = withRepeat(
      withTiming(1, {
        duration: 12000,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      true
    );

    // Star twinkle
    twinkle.value = withRepeat(
      withTiming(1, {
        duration: 8000,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      true
    );

    // Particle float
    particleFloat.value = withRepeat(
      withTiming(1, {
        duration: 16000,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      true
    );
  }, [drift, reduceMotion, twinkle, particleFloat]);

  const driftStyle = useAnimatedStyle(() => {
    if (reduceMotion) return {};

    const x = interpolate(drift.value, [0, 1], [-16, 16]);
    const y = interpolate(drift.value, [0, 1], [12, -12]);

    return {
      transform: [{ translateX: x }, { translateY: y }, { scale: 1.12 }],
    };
  }, [reduceMotion]);

  const twinkleStyle = useAnimatedStyle(() => {
    if (reduceMotion) return {};

    return {
      opacity: 0.5 + twinkle.value * 0.25,
    };
  }, [reduceMotion]);

  // Deterministic star positions
  const stars = useMemo(() => {
    return [
      { left: 12, top: 22, s: 2, o: 0.6 },
      { left: 38, top: 15, s: 2.5, o: 0.7 },
      { left: 72, top: 28, s: 2, o: 0.5 },
      { left: 88, top: 18, s: 1.5, o: 0.45 },
      { left: 22, top: 55, s: 1.5, o: 0.4 },
      { left: 58, top: 62, s: 2, o: 0.55 },
      { left: 85, top: 48, s: 1.5, o: 0.35 },
      { left: 6, top: 10, s: 1, o: 0.25 },
      { left: 48, top: 8, s: 1.5, o: 0.35 },
      { left: 32, top: 42, s: 1, o: 0.2 },
      { left: 76, top: 72, s: 1, o: 0.25 },
      { left: 18, top: 78, s: 1.5, o: 0.3 },
      { left: 64, top: 82, s: 1, o: 0.2 },
      { left: 42, top: 88, s: 1, o: 0.18 },
      { left: 92, top: 65, s: 1, o: 0.22 },
      { left: 8, top: 38, s: 1, o: 0.2 },
    ];
  }, []);

  // Floating ambient orbs
  const particles = useMemo(() => {
    return [
      { x: 15, y: 25, size: 180, color: colors.primary[500], opacity: 0.06 },
      { x: 75, y: 70, size: 220, color: colors.secondary[400], opacity: 0.05 },
      { x: 85, y: 15, size: 140, color: colors.primary[400], opacity: 0.04 },
      { x: 10, y: 75, size: 160, color: colors.secondary[500], opacity: 0.04 },
    ];
  }, []);

  const particleStyle = useAnimatedStyle(() => {
    if (reduceMotion) return {};

    const y = interpolate(particleFloat.value, [0, 1], [0, -30]);
    const scale = interpolate(particleFloat.value, [0, 0.5, 1], [1, 1.05, 1]);

    return {
      transform: [{ translateY: y }, { scale }],
    };
  }, [reduceMotion]);

  return (
    <View style={styles.root}>
      {/* Base gradient with drift */}
      <AnimatedView style={[styles.absoluteFill, driftStyle]} pointerEvents="none">
        <LinearGradient
          colors={gradients.nightSky}
          start={{ x: 0.05, y: 0.1 }}
          end={{ x: 0.95, y: 0.95 }}
          style={styles.absoluteFill}
          pointerEvents="none"
        />

        {/* Primary glow */}
        <LinearGradient
          colors={gradients.primaryGlow}
          start={{ x: 0.1, y: 0.9 }}
          end={{ x: 0.85, y: 0.15 }}
          style={[styles.absoluteFill, { opacity: 0.85 }]}
          pointerEvents="none"
        />

        {/* Secondary glow */}
        <LinearGradient
          colors={gradients.secondaryGlow}
          start={{ x: 0.15, y: 0.7 }}
          end={{ x: 0.9, y: 0.1 }}
          style={[styles.absoluteFill, { opacity: 0.85 }]}
          pointerEvents="none"
        />
      </AnimatedView>

      {/* Floating orb particles */}
      {showParticles && (
        <AnimatedView style={[styles.absoluteFill, particleStyle]} pointerEvents="none">
          {particles.map((p, idx) => (
            <View
              key={`particle-${idx}`}
              style={{
                position: "absolute",
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                borderRadius: p.size / 2,
                backgroundColor: p.color,
                opacity: p.opacity,
                transform: [{ translateX: -p.size / 2 }, { translateY: -p.size / 2 }],
              }}
            />
          ))}
        </AnimatedView>
      )}

      {/* Twinkling stars */}
      {showStars && (
        <AnimatedView style={[styles.starLayer, twinkleStyle]} pointerEvents="none">
          {stars.map((star, idx) => (
            <View
              key={`star-${idx}`}
              style={{
                position: "absolute",
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: star.s,
                height: star.s,
                borderRadius: 999,
                backgroundColor: "#F8FAFC",
                opacity: star.o,
                shadowColor: "#F8FAFC",
                shadowOpacity: 0.8,
                shadowRadius: star.s * 2,
                shadowOffset: { width: 0, height: 0 },
              }}
            />
          ))}
        </AnimatedView>
      )}

      {/* Subtle grain texture for depth */}
      {showGrain && <SimpleGrainOverlay opacity={0.025} />}

      {/* Dim overlay for non-splash screens */}
      {dim && <View style={styles.dim} pointerEvents="none" />}

      {/* Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg[900],
  },
  absoluteFill: {
    ...StyleSheet.absoluteFillObject,
  },
  starLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  content: {
    flex: 1,
  },
});
