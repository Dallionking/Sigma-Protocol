import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { BlurView } from "expo-blur";

import { BorderBeamOverlay } from "./BorderBeamOverlay";
import { colors } from "../theme/tokens";

type Props = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  tint?: "light" | "dark" | "default";
  glow?: boolean;
  glowColor?: string;
  animated?: boolean;
  borderRadius?: number;
};

/**
 * GlassPanel - Glassmorphism depth card component
 * 
 * Features:
 * - Semi-transparent background (92% opacity)
 * - Backdrop blur (4-12px via intensity)
 * - Subtle white/10 border
 * - Multi-layered shadow system (2px, 8px, 16px)
 * - Inset white highlight at top edge
 * - Optional animated border beam
 */
export function GlassPanel({
  children,
  style,
  intensity = 35,
  tint = "dark",
  glow = false,
  glowColor = colors.primary[500],
  animated = false,
  borderRadius = 24,
}: Props) {
  const content = (
    <>
      {/* Animated border beam (optional) */}
      {animated && (
        <BorderBeamOverlay
          borderRadius={borderRadius}
          borderWidth={1}
          duration={3000}
          color="rgba(255, 255, 255, 0.5)"
        />
      )}

      {/* Subtle gradient overlay for depth */}
      <LinearGradient
        colors={[
          "rgba(255, 255, 255, 0.06)",
          "rgba(255, 255, 255, 0.02)",
          "rgba(255, 255, 255, 0.00)",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.gradientOverlay, { borderRadius }]}
        pointerEvents="none"
      />

      {/* Inner border highlight - enhanced */}
      <View
        style={[
          styles.innerHighlight,
          { borderTopLeftRadius: borderRadius, borderTopRightRadius: borderRadius },
        ]}
        pointerEvents="none"
      />

      {children}
    </>
  );

  // Multi-layered shadow system for depth
  // React Native only supports one shadow per View, so we stack them
  const shadowLayers = (innerContent: React.ReactNode) => {
    if (Platform.OS === "android") {
      // Android doesn't support shadows well, use elevation instead
      return (
        <View style={[styles.androidElevation, { borderRadius }]}>
          {innerContent}
        </View>
      );
    }

    return (
      // Layer 3: Largest, softest shadow (16px)
      <View
        style={[
          styles.shadowLayer3,
          { borderRadius },
          glow && {
            shadowColor: glowColor,
            shadowOpacity: 0.3,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 8 },
          },
        ]}
      >
        {/* Layer 2: Medium shadow (8px) */}
        <View style={[styles.shadowLayer2, { borderRadius }]}>
          {/* Layer 1: Smallest, sharpest shadow (2px) */}
          <View style={[styles.shadowLayer1, { borderRadius }]}>
            {innerContent}
          </View>
        </View>
      </View>
    );
  };

  const blurContent =
    Platform.OS === "android" ? (
      <View
        style={[
          styles.container,
          styles.androidFallback,
          { borderRadius },
          style,
        ]}
      >
        {content}
      </View>
    ) : (
      <BlurView
        intensity={intensity}
        tint={tint}
        style={[styles.container, { borderRadius }, style]}
      >
        {content}
      </BlurView>
    );

  return shadowLayers(blurContent);
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.10)",
    // Increased opacity: 92% (was 65%)
    backgroundColor: "rgba(17, 24, 39, 0.92)",
  },
  androidFallback: {
    backgroundColor: colors.surfaceStrong,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  innerHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    // Enhanced highlight
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  // Shadow layer 1: Smallest, sharpest (2px distance)
  shadowLayer1: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  // Shadow layer 2: Medium (8px distance)
  shadowLayer2: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  // Shadow layer 3: Largest, softest (16px distance)
  shadowLayer3: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
  },
  androidElevation: {
    elevation: 8,
  },
});
