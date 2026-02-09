import React, { useEffect } from 'react';
import { View, StyleSheet, Platform, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedImage = Animated.createAnimatedComponent(Image);

/**
 * Augmented Logo - 3D animated logo with glow effects
 * Centered with spinning/fading glow animation
 */

export function AugmentedLogoScene() {
  // Glow rotation
  const glowRotation = useSharedValue(0);
  // Glow pulse opacity
  const glowPulse = useSharedValue(0.3);
  // Secondary glow for layered effect
  const glowPulse2 = useSharedValue(0.2);
  // Subtle logo scale breathing
  const logoScale = useSharedValue(1);

  useEffect(() => {
    // Spinning glow effect - slow continuous rotation
    glowRotation.value = withRepeat(
      withTiming(360, { duration: 8000, easing: Easing.linear }),
      -1,
      false
    );

    // Primary glow pulse (fade in/out)
    glowPulse.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.25, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Secondary glow pulse (offset timing for depth)
    glowPulse2.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.15, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Very subtle scale breathing
    logoScale.value = withRepeat(
      withSequence(
        withTiming(1.01, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.99, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  // Spinning glow style
  const spinningGlowStyle = useAnimatedStyle(() => ({
    opacity: glowPulse.value,
    transform: [
      { rotate: `${glowRotation.value}deg` },
    ],
  }));

  // Secondary glow (counter-rotation for dynamic effect)
  const spinningGlow2Style = useAnimatedStyle(() => ({
    opacity: glowPulse2.value,
    transform: [
      { rotate: `${-glowRotation.value * 0.5}deg` },
    ],
  }));

  // Static fade glow
  const fadeGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowPulse.value, [0.25, 0.6], [0.4, 0.8]),
  }));

  // Logo subtle breathing
  const logoStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
    ],
  }));

  return (
    <View style={styles.container}>
      {/* Background glow layers */}
      
      {/* Outer spinning glow ring */}
      <AnimatedView style={[styles.glowRing, spinningGlowStyle]} />
      
      {/* Secondary counter-rotating glow */}
      <AnimatedView style={[styles.glowRing2, spinningGlow2Style]} />
      
      {/* Central fade glow */}
      <AnimatedView style={[styles.centerGlow, fadeGlowStyle]} />
      
      {/* Main Logo */}
      <AnimatedImage
        source={require('../../assets/icon.png')}
        style={[styles.logo, logoStyle]}
        resizeMode="contain"
        accessibilityLabel="App Logo"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 320,
    height: 320,
    zIndex: 10,
  },
  // Outer spinning glow ring
  glowRing: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    borderWidth: 3,
    borderColor: '#6366F1',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 0 60px 20px rgba(99, 102, 241, 0.4)',
    } : {
      shadowColor: '#6366F1',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 30,
    }),
  },
  // Secondary glow ring (counter-rotation)
  glowRing2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 2,
    borderColor: '#4F46E5',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 0 40px 15px rgba(0, 204, 51, 0.3)',
    } : {
      shadowColor: '#4F46E5',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
    }),
  },
  // Central fade glow (no rotation, just pulse)
  centerGlow: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#6366F1',
    ...(Platform.OS === 'web' ? {
      filter: 'blur(80px)',
    } : {}),
  },
});

