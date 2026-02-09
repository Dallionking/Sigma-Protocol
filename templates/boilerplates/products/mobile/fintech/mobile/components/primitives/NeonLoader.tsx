import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { colors } from '@/lib/theme';

interface NeonLoaderProps {
  size?: 'small' | 'medium' | 'large';
}

const SIZES = {
  small: 40,
  medium: 80,
  large: 120,
};

export function NeonLoader({ size = 'medium' }: NeonLoaderProps) {
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(0.6);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );
    
    pulse.value = withRepeat(
      withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  const dimension = SIZES[size];
  const borderWidth = size === 'small' ? 2 : size === 'medium' ? 3 : 4;

  return (
    <View style={[styles.container, { width: dimension, height: dimension }]}>
      {/* Outer glow pulse */}
      <Animated.View
        style={[
          styles.glowRing,
          pulseStyle,
          {
            width: dimension + 20,
            height: dimension + 20,
            borderRadius: (dimension + 20) / 2,
          },
        ]}
      />

      {/* Spinning ring */}
      <Animated.View
        style={[
          styles.ring,
          ringStyle,
          {
            width: dimension,
            height: dimension,
            borderRadius: dimension / 2,
            borderWidth,
          },
        ]}
      />

      {/* Center dot */}
      <View
        style={[
          styles.centerDot,
          {
            width: dimension * 0.15,
            height: dimension * 0.15,
            borderRadius: (dimension * 0.15) / 2,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.glow,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary.DEFAULT,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
      },
      web: {
        boxShadow: `0 0 30px ${colors.glow}`,
      },
      android: {},
    }),
  },
  ring: {
    borderColor: 'transparent',
    borderTopColor: colors.primary.DEFAULT,
    borderRightColor: colors.primary[300],
  },
  centerDot: {
    position: 'absolute',
    backgroundColor: colors.primary.DEFAULT,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary.DEFAULT,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
      },
      web: {
        boxShadow: `0 0 15px ${colors.primary.DEFAULT}`,
      },
      android: {},
    }),
  },
});

