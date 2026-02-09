import React, { useEffect, useState } from 'react';
import { NeonText, type NeonTextProps } from '@/components/primitives';

interface AnimatedDotsProps {
  /** The base text to display before the dots */
  text: string;
  /** Animation interval in milliseconds */
  interval?: number;
  /** Maximum number of dots */
  maxDots?: number;
  /** Text variant from NeonText */
  variant?: NeonTextProps['variant'];
  /** Text color from NeonText */
  color?: NeonTextProps['color'];
}

/**
 * Animated loading text with cycling dots.
 * Creates a "Processing..." effect that cycles through ., .., ...
 */
export function AnimatedDots({
  text,
  interval = 400,
  maxDots = 3,
  variant = 'caption',
  color = 'muted',
}: AnimatedDotsProps) {
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDotCount((prev) => (prev >= maxDots ? 0 : prev + 1));
    }, interval);

    return () => clearInterval(timer);
  }, [interval, maxDots]);

  const dots = '.'.repeat(dotCount);
  // Pad with spaces to prevent layout shift
  const padding = ' '.repeat(maxDots - dotCount);

  return (
    <NeonText variant={variant} color={color}>
      {text}{dots}{padding}
    </NeonText>
  );
}

export default AnimatedDots;

