import React, { useEffect, useMemo } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { useReduceMotion } from "@/hooks/useReduceMotion";
import { colors } from "@/theme/tokens";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const CONFETTI_COLORS = [
  colors.primary[400],
  colors.secondary[400],
  colors.accent[400],
  colors.success,
  "#FF6B9D",
  "#C084FC",
];

const CONFETTI_COUNT = 50;

type ConfettiPiece = {
  id: number;
  x: number;
  delay: number;
  rotation: number;
  size: number;
  color: string;
  type: "square" | "circle" | "line";
};

type Props = {
  visible: boolean;
  duration?: number;
};

function generateConfetti(): ConfettiPiece[] {
  return Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * SCREEN_WIDTH,
    delay: Math.random() * 400,
    rotation: Math.random() * 360,
    size: 6 + Math.random() * 8,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    type: ["square", "circle", "line"][Math.floor(Math.random() * 3)] as
      | "square"
      | "circle"
      | "line",
  }));
}

function ConfettiPieceComponent({ piece }: { piece: ConfettiPiece }) {
  const reduceMotion = useReduceMotion();
  const translateY = useSharedValue(-50);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) {
      translateY.value = SCREEN_HEIGHT + 50;
      opacity.value = 0;
      return;
    }

    translateY.value = withDelay(
      piece.delay,
      withTiming(SCREEN_HEIGHT + 50, {
        duration: 2500 + Math.random() * 1000,
        easing: Easing.out(Easing.quad),
      })
    );

    rotate.value = withDelay(
      piece.delay,
      withTiming(piece.rotation + 720, {
        duration: 2500,
        easing: Easing.linear,
      })
    );

    opacity.value = withDelay(
      piece.delay + 1800,
      withTiming(0, { duration: 700 })
    );
  }, [piece, reduceMotion, translateY, rotate, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  const shapeStyle = useMemo(() => {
    const base = {
      width: piece.size,
      height: piece.type === "line" ? piece.size * 2.5 : piece.size,
      backgroundColor: piece.color,
    };

    if (piece.type === "circle") {
      return { ...base, borderRadius: piece.size / 2 };
    }
    if (piece.type === "line") {
      return { ...base, borderRadius: 2 };
    }
    return { ...base, borderRadius: 2 };
  }, [piece]);

  return (
    <Animated.View
      style={[
        styles.piece,
        { left: piece.x },
        animatedStyle,
      ]}
    >
      <View style={shapeStyle} />
    </Animated.View>
  );
}

export function ConfettiOverlay({ visible, duration = 3000 }: Props) {
  const reduceMotion = useReduceMotion();
  const confetti = useMemo(() => generateConfetti(), []);

  if (!visible || reduceMotion) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {confetti.map((piece) => (
        <ConfettiPieceComponent key={piece.id} piece={piece} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  piece: {
    position: "absolute",
    top: -20,
  },
});

