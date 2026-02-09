import React from 'react';
import { Pressable, Text, StyleSheet, Platform, ViewStyle, TextStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import { colors, springConfigs } from '@/lib/theme';
import { moderateScale, verticalScale, fontSize } from '@/lib/utils/responsive';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface NeonButtonProps {
  children: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function NeonButton({ 
  children, 
  onPress, 
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = true,
  style,
}: NeonButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, springConfigs.button);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfigs.button);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const sizeStyles = {
    sm: styles.sizeSm,
    md: styles.sizeMd,
    lg: styles.sizeLg,
  };

  const textSizeStyles = {
    sm: styles.textSm,
    md: styles.textMd,
    lg: styles.textLg,
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        animatedStyle,
        styles.container,
        sizeStyles[size],
        styles[variant],
        disabled && styles.disabled,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      <Text style={[
        styles.text,
        textSizeStyles[size],
        variant === 'ghost' && styles.ghostText,
        variant === 'outline' && styles.outlineText,
        variant === 'secondary' && styles.secondaryText,
        variant === 'danger' && styles.dangerText,
        disabled && styles.disabledText,
      ]}>
        {children}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  // Sizes - BAGS-style pill buttons (responsive)
  sizeSm: {
    paddingVertical: verticalScale(10),
    paddingHorizontal: moderateScale(16),
    borderRadius: moderateScale(10),
  },
  sizeMd: {
    paddingVertical: verticalScale(14),
    paddingHorizontal: moderateScale(24),
    borderRadius: moderateScale(12),
  },
  sizeLg: {
    paddingVertical: verticalScale(18),
    paddingHorizontal: moderateScale(32),
    borderRadius: moderateScale(14),
  },
  // Variants - Cleaner, BAGS-inspired
  primary: {
    backgroundColor: colors.primary.DEFAULT,
  } as ViewStyle,
  secondary: {
    backgroundColor: colors.neutral[100],
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary[500],
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: colors.accent.DEFAULT,
  },
  disabled: {
    backgroundColor: colors.neutral[200],
    opacity: 0.6,
  } as ViewStyle,
  // Text styles (responsive)
  text: {
    fontWeight: '600',
    color: colors.neutral[0],
    letterSpacing: 0.3,
  } as TextStyle,
  textSm: {
    fontSize: fontSize(13),
  },
  textMd: {
    fontSize: fontSize(15),
  },
  textLg: {
    fontSize: fontSize(17),
  },
  ghostText: {
    color: colors.primary.DEFAULT,
  },
  outlineText: {
    color: colors.primary[500],
  },
  secondaryText: {
    color: colors.neutral[900],
  },
  dangerText: {
    color: colors.neutral[900],
  },
  disabledText: {
    color: colors.neutral[500],
  },
});


