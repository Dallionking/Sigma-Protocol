import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { colors, spacing } from '@/lib/theme';

interface ProgressDotsProps {
  total: number;
  current: number;
}

function Dot({ isActive }: { isActive: boolean }) {
  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(
      isActive ? colors.primary.DEFAULT : colors.neutral[300],
      { duration: 200 }
    ),
    transform: [
      { 
        scale: withTiming(isActive ? 1.2 : 1, { duration: 200 }) 
      }
    ],
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

export function ProgressDots({ total, current }: ProgressDotsProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }, (_, index) => (
        <Dot key={index} isActive={index === current} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutral[300],
  },
});

