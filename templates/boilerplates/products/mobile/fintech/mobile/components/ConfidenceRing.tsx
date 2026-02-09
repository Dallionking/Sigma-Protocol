import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Circle, Svg } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { NeonText } from '@/components/primitives';
import { colors } from '@/lib/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ConfidenceRingProps {
  /** Percentage value (0-100) */
  percentage: number;
  /** Size of the ring in pixels */
  size?: number;
  /** Stroke width of the ring */
  strokeWidth?: number;
  /** Color of the filled portion */
  color?: string;
  /** Animation duration in ms */
  duration?: number;
  /** Whether to show the percentage in the center */
  showLabel?: boolean;
  /** Label to show below percentage */
  label?: string;
}

/**
 * Animated circular progress ring that shows confidence/success percentage.
 * Replaces the generic pulsating circle with data-driven visualization.
 */
export function ConfidenceRing({
  percentage,
  size = 80,
  strokeWidth = 6,
  color = colors.primary.DEFAULT,
  duration = 1200,
  showLabel = true,
  label,
}: ConfidenceRingProps) {
  const progress = useSharedValue(0);
  const displayValue = useSharedValue(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    // Animate the ring fill
    progress.value = withDelay(
      200,
      withTiming(percentage / 100, {
        duration,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      })
    );
    
    // Animate the display number
    displayValue.value = withDelay(
      200,
      withTiming(percentage, {
        duration,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      })
    );
  }, [percentage, duration]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference * (1 - progress.value);
    return {
      strokeDashoffset,
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.neutral[200]}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Animated progress circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      
      {/* Glow effect for web */}
      {Platform.OS === 'web' && (
        <View 
          style={[
            styles.glowOverlay, 
            { 
              width: size, 
              height: size,
              // @ts-ignore - web only
              filter: `drop-shadow(0 0 8px ${color}40)`,
            }
          ]} 
        />
      )}
      
      {/* Center content */}
      {showLabel && (
        <View style={styles.centerContent}>
          <NeonText variant="h3" color="primary" glow>
            {Math.round(percentage)}%
          </NeonText>
          {label && (
            <NeonText variant="caption" color="muted" style={styles.label}>
              {label}
            </NeonText>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  glowOverlay: {
    position: 'absolute',
    pointerEvents: 'none',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 8,
  },
});

export default ConfidenceRing;

