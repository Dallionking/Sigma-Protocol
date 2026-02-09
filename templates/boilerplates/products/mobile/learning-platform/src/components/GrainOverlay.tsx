import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Rect, Defs, Filter, FeTurbulence, FeColorMatrix } from "react-native-svg";

type Props = {
  opacity?: number;
  blendMode?: "overlay" | "multiply" | "screen" | "soft-light";
};

/**
 * GrainOverlay - Adds subtle film grain texture for visual depth
 * 
 * Uses a pseudo-random pattern to create atmospheric texture
 * without impacting performance significantly.
 * 
 * Note: SVG filters for noise aren't fully supported in RN,
 * so we use a dot pattern approach instead.
 */
export function GrainOverlay({ opacity = 0.03, blendMode = "overlay" }: Props) {
  // Generate a deterministic dot pattern for grain effect
  const dots = useMemo(() => {
    const pattern: { x: number; y: number; size: number; opacity: number }[] = [];
    const seed = 42; // Deterministic seed
    
    // Create sparse dot pattern
    for (let i = 0; i < 200; i++) {
      const pseudoRandom = (seed * (i + 1) * 9301 + 49297) % 233280;
      const x = (pseudoRandom % 100);
      const y = Math.floor(pseudoRandom / 100) % 100;
      const size = 0.5 + (pseudoRandom % 10) / 20;
      const dotOpacity = 0.1 + (pseudoRandom % 50) / 100;
      
      pattern.push({ x, y, size, opacity: dotOpacity });
    }
    
    return pattern;
  }, []);

  return (
    <View style={[styles.container, { opacity }]} pointerEvents="none">
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        {dots.map((dot, index) => (
          <Rect
            key={index}
            x={`${dot.x}%`}
            y={`${dot.y}%`}
            width={dot.size}
            height={dot.size}
            fill={`rgba(255, 255, 255, ${dot.opacity})`}
          />
        ))}
      </Svg>
    </View>
  );
}

/**
 * Simpler grain using View-based noise pattern
 * More performant for React Native
 */
export function SimpleGrainOverlay({ opacity = 0.02 }: { opacity?: number }) {
  return (
    <View style={[styles.simpleGrain, { opacity }]} pointerEvents="none">
      {/* Multiple offset layers create grain effect */}
      <View style={[styles.grainLayer, styles.grainLayer1]} />
      <View style={[styles.grainLayer, styles.grainLayer2]} />
      <View style={[styles.grainLayer, styles.grainLayer3]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  simpleGrain: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  grainLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  grainLayer1: {
    // Creates subtle texture through shadow
    shadowColor: "#fff",
    shadowOpacity: 0.05,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 0 },
  },
  grainLayer2: {
    // Offset layer
    transform: [{ translateX: 1 }, { translateY: 1 }],
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 0.5,
    shadowOffset: { width: 0, height: 0 },
  },
  grainLayer3: {
    // Another offset
    transform: [{ translateX: -1 }, { translateY: -1 }],
    shadowColor: "#fff",
    shadowOpacity: 0.02,
    shadowRadius: 0.5,
    shadowOffset: { width: 0, height: 0 },
  },
});



