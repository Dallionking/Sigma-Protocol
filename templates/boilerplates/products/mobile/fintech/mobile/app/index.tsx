import React, { useEffect } from 'react';
import { View, StyleSheet, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors } from '@/lib/theme';
import { AugmentedLogoScene } from '@/components/3d/AugmentedLogo';
import { verticalScale, moderateScale } from '@/lib/utils/responsive';

const AnimatedImage = Animated.createAnimatedComponent(Image);

// Feature flag for access gating
// Set to false to skip gate and go directly to onboarding
const GATING_ENABLED = true;

// Simulated app state checks
const checkAppState = async (): Promise<'ok' | 'update' | 'maintenance'> => {
  await new Promise(resolve => setTimeout(resolve, 2500));
  return 'ok';
};

export default function SplashScreen() {
  const router = useRouter();
  
  // Text logo fade-in animation
  const textLogoOpacity = useSharedValue(0);
  const textLogoScale = useSharedValue(0.9);

  // Text logo fade in + scale up style
  const textLogoStyle = useAnimatedStyle(() => ({
    opacity: textLogoOpacity.value,
    transform: [{ scale: textLogoScale.value }],
  }));

  const navigateNext = (state: 'ok' | 'update' | 'maintenance') => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    switch (state) {
      case 'update':
        router.replace('/force-update');
        break;
      case 'maintenance':
        router.replace('/maintenance');
        break;
      default:
        // Route to gate if gating is enabled, otherwise to onboarding
        if (GATING_ENABLED) {
          router.replace('/(gate)/early-access');
        } else {
          router.replace('/(onboarding)/welcome');
        }
        break;
    }
  };

  useEffect(() => {
    // Text logo fade in with scale (delayed for dramatic effect)
    textLogoOpacity.value = withDelay(
      1200,
      withTiming(1, { duration: 1500, easing: Easing.out(Easing.ease) })
    );

    // Text logo scale up animation
    textLogoScale.value = withDelay(
      1200,
      withTiming(1, { duration: 1500, easing: Easing.out(Easing.back(1.5)) })
    );

    // Check app state and navigate
    const checkAndNavigate = async () => {
      const state = await checkAppState();
      runOnJS(navigateNext)(state);
    };

    checkAndNavigate();
  }, []);

  return (
    <View style={styles.container}>
      {/* 3D Scene / Static Logo */}
      <View style={styles.sceneContainer}>
        <AugmentedLogoScene />
      </View>

      {/* Text Logo with fade-in */}
      <Animated.View style={[styles.textLogoContainer, textLogoStyle]}>
        <AnimatedImage
          source={require('../assets/text-logo.png')}
          style={styles.textLogo}
          resizeMode="contain"
          accessibilityLabel="Trading Platform Trading Systems"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[0],
    alignItems: 'center',
    justifyContent: 'center',
  },
  sceneContainer: {
    width: '100%',
    height: verticalScale(380),
  },
  textLogoContainer: {
    marginTop: verticalScale(30),
    alignItems: 'center',
    justifyContent: 'center',
  },
  textLogo: {
    width: moderateScale(400),
    height: moderateScale(110),
  },
});

