/**
 * BorderBeam Component
 * 
 * An animated border effect that creates a single traveling light beam around a container.
 * Simplified design with a smooth glowing light that travels around all 4 edges.
 */

import React, { useState } from 'react';
import { View, StyleSheet, Platform, LayoutChangeEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { colors } from '@/lib/theme';
import { useBorderBeamSync } from '@/lib/hooks/use-border-beam-sync';

interface BorderBeamProps {
  /** Border radius of the container */
  borderRadius?: number;
  /** Width of the border/beam */
  borderWidth?: number;
  /** Whether the beam is active */
  active?: boolean;
  /** Length of the beam segment */
  beamLength?: number;
}

/**
 * BorderBeamSimple - A single traveling light beam around the card border
 * Uses a simple glowing gradient that travels around all 4 edges
 */
export function BorderBeamSimple({
  borderRadius = 16,
  borderWidth = 1,
  active = true,
  beamLength = 80,
}: BorderBeamProps) {
  const progress = useBorderBeamSync();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width !== dimensions.width || height !== dimensions.height) {
      setDimensions({ width, height });
    }
  };

  const { width, height } = dimensions;
  const hasSize = width > 0 && height > 0;

  // Top edge beam: travels left to right (progress 0 → 0.25)
  const topBeamStyle = useAnimatedStyle(() => {
    if (!active || !hasSize) return { opacity: 0 };
    
    const p = progress.value;
    const opacity = interpolate(p, [0, 0.02, 0.23, 0.25], [1, 1, 1, 0], Extrapolation.CLAMP);
    const position = interpolate(p, [0, 0.25], [-beamLength / 2, width - beamLength / 2], Extrapolation.CLAMP);
    
    return { opacity, transform: [{ translateX: position }] };
  }, [active, hasSize, width, beamLength]);

  // Right edge beam: travels top to bottom (progress 0.25 → 0.5)
  const rightBeamStyle = useAnimatedStyle(() => {
    if (!active || !hasSize) return { opacity: 0 };
    
    const p = progress.value;
    const opacity = interpolate(p, [0.23, 0.25, 0.48, 0.5], [0, 1, 1, 0], Extrapolation.CLAMP);
    const position = interpolate(p, [0.25, 0.5], [-beamLength / 2, height - beamLength / 2], Extrapolation.CLAMP);
    
    return { opacity, transform: [{ translateY: position }] };
  }, [active, hasSize, height, beamLength]);

  // Bottom edge beam: travels right to left (progress 0.5 → 0.75)
  const bottomBeamStyle = useAnimatedStyle(() => {
    if (!active || !hasSize) return { opacity: 0 };
    
    const p = progress.value;
    const opacity = interpolate(p, [0.48, 0.5, 0.73, 0.75], [0, 1, 1, 0], Extrapolation.CLAMP);
    const position = interpolate(p, [0.5, 0.75], [width - beamLength / 2, -beamLength / 2], Extrapolation.CLAMP);
    
    return { opacity, transform: [{ translateX: position }] };
  }, [active, hasSize, width, beamLength]);

  // Left edge beam: travels bottom to top (progress 0.75 → 1)
  const leftBeamStyle = useAnimatedStyle(() => {
    if (!active || !hasSize) return { opacity: 0 };
    
    const p = progress.value;
    const opacity = interpolate(p, [0.73, 0.75, 0.98, 1], [0, 1, 1, 0], Extrapolation.CLAMP);
    const position = interpolate(p, [0.75, 1], [height - beamLength / 2, -beamLength / 2], Extrapolation.CLAMP);
    
    return { opacity, transform: [{ translateY: position }] };
  }, [active, hasSize, height, beamLength]);

  if (!active) return null;

  const beamThickness = borderWidth + 1;

  return (
    <View 
      style={[StyleSheet.absoluteFill, { borderRadius }]} 
      pointerEvents="none"
      onLayout={handleLayout}
    >
      {/* Base subtle border */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius,
            borderWidth,
            borderColor: 'rgba(255, 255, 255, 0.1)',
          },
        ]}
      />

      {hasSize && (
        <>
          {/* Top edge beam */}
          <Animated.View style={[styles.beamContainer, { top: 0, left: 0, width: beamLength, height: beamThickness }, topBeamStyle]}>
            <LinearGradient
              colors={['transparent', colors.primary.DEFAULT, 'transparent']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>

          {/* Right edge beam */}
          <Animated.View style={[styles.beamContainer, { top: 0, right: 0, width: beamThickness, height: beamLength }, rightBeamStyle]}>
            <LinearGradient
              colors={['transparent', colors.primary.DEFAULT, 'transparent']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>

          {/* Bottom edge beam */}
          <Animated.View style={[styles.beamContainer, { bottom: 0, left: 0, width: beamLength, height: beamThickness }, bottomBeamStyle]}>
            <LinearGradient
              colors={['transparent', colors.primary.DEFAULT, 'transparent']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>

          {/* Left edge beam */}
          <Animated.View style={[styles.beamContainer, { top: 0, left: 0, width: beamThickness, height: beamLength }, leftBeamStyle]}>
            <LinearGradient
              colors={['transparent', colors.primary.DEFAULT, 'transparent']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </>
      )}

      {/* iOS glow effect */}
      {Platform.OS === 'ios' && (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius,
              shadowColor: colors.primary.DEFAULT,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.2,
              shadowRadius: 6,
            },
          ]}
          pointerEvents="none"
        />
      )}
    </View>
  );
}

// Keep old BorderBeam for backwards compatibility
export function BorderBeam(props: BorderBeamProps & { width?: number; height?: number }) {
  return <BorderBeamSimple {...props} />;
}

const styles = StyleSheet.create({
  beamContainer: {
    position: 'absolute',
    overflow: 'hidden',
  },
});

