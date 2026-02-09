import React, { useEffect, useState } from 'react';
import { TextStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedReaction,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { NeonText } from '@/components/primitives';

type NeonTextVariant = 'display' | 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'label' | 'mono' | 'balance';
type NeonTextColor = 'primary' | 'white' | 'muted' | 'danger' | 'success';

interface AnimatedNumberProps {
  /** The target value to animate to */
  value: number;
  /** Animation duration in milliseconds */
  duration?: number;
  /** Prefix string (e.g., "$", "+$") */
  prefix?: string;
  /** Suffix string (e.g., "%") */
  suffix?: string;
  /** Number of decimal places */
  decimals?: number;
  /** Whether to format with thousand separators */
  formatThousands?: boolean;
  /** Text variant from NeonText */
  variant?: NeonTextVariant;
  /** Text color from NeonText */
  color?: NeonTextColor;
  /** Whether to apply glow effect */
  glow?: boolean;
  /** Additional text style */
  style?: StyleProp<TextStyle>;
}

/**
 * Animated number component that counts up/down when the value changes.
 * Uses Reanimated for smooth 60fps animations.
 */
export function AnimatedNumber({
  value,
  duration = 800,
  prefix = '',
  suffix = '',
  decimals = 2,
  formatThousands = true,
  variant = 'body',
  color = 'white',
  glow = false,
  style,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const animatedValue = useSharedValue(value);

  useEffect(() => {
    animatedValue.value = withTiming(value, {
      duration,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [value, duration]);

  // Update display value on JS thread
  const updateDisplay = (val: number) => {
    setDisplayValue(val);
  };

  useAnimatedReaction(
    () => animatedValue.value,
    (currentValue) => {
      runOnJS(updateDisplay)(currentValue);
    },
    [animatedValue]
  );

  // Format the number for display
  const formatNumber = (num: number): string => {
    const fixed = num.toFixed(decimals);
    
    if (formatThousands) {
      const parts = fixed.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return parts.join('.');
    }
    
    return fixed;
  };

  return (
    <NeonText variant={variant} color={color} glow={glow} style={style}>
      {prefix}{formatNumber(displayValue)}{suffix}
    </NeonText>
  );
}

interface AnimatedPercentageProps {
  value: number;
  duration?: number;
  variant?: NeonTextVariant;
  color?: NeonTextColor;
  glow?: boolean;
  style?: StyleProp<TextStyle>;
}

/**
 * Animated percentage component - convenience wrapper for percentages
 */
export function AnimatedPercentage({
  value,
  duration = 800,
  variant = 'body',
  color = 'primary',
  glow = false,
  style,
}: AnimatedPercentageProps) {
  return (
    <AnimatedNumber
      value={value}
      duration={duration}
      suffix="%"
      decimals={0}
      formatThousands={false}
      variant={variant}
      color={color}
      glow={glow}
      style={style}
    />
  );
}

interface AnimatedCurrencyProps {
  value: number;
  duration?: number;
  prefix?: string;
  variant?: NeonTextVariant;
  color?: NeonTextColor;
  glow?: boolean;
  showSign?: boolean;
  style?: StyleProp<TextStyle>;
  decimals?: number;
}

/**
 * Animated currency component - convenience wrapper for money values
 */
export function AnimatedCurrency({
  value,
  duration = 800,
  prefix = '$',
  variant = 'body',
  color = 'white',
  glow = false,
  showSign = false,
  style,
  decimals = 2,
}: AnimatedCurrencyProps) {
  const effectivePrefix = showSign && value >= 0 ? `+${prefix}` : prefix;
  
  return (
    <AnimatedNumber
      value={Math.abs(value)}
      duration={duration}
      prefix={effectivePrefix}
      decimals={decimals}
      formatThousands={true}
      variant={variant}
      color={color}
      glow={glow}
      style={style}
    />
  );
}

export default AnimatedNumber;

