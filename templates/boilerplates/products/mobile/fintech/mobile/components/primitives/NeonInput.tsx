import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  Platform, 
  TextInputProps,
  ViewStyle,
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
} from 'react-native-reanimated';
import { colors, borderRadius, animationPresets } from '@/lib/theme';
import { NeonText } from './NeonText';

interface NeonInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export function NeonInput({ 
  label,
  error,
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...props 
}: NeonInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const glowOpacity = useSharedValue(0);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowOpacity.value,
  }));

  const handleFocus = (e: any) => {
    setIsFocused(true);
    glowOpacity.value = withTiming(0.4, { duration: animationPresets.micro.duration });
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    glowOpacity.value = withTiming(0, { duration: animationPresets.micro.duration });
    onBlur?.(e);
  };

  const hasError = Boolean(error);
  const borderColor = hasError 
    ? colors.error 
    : isFocused 
      ? colors.primary.DEFAULT 
      : colors.neutral[200];

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && (
        <NeonText variant="label" color="muted" style={styles.label}>
          {label}
        </NeonText>
      )}
      
      <Animated.View 
        style={[
          styles.inputContainer,
          { borderColor },
          hasError && styles.errorContainer,
          isFocused && !hasError && styles.focusedContainer,
          animatedContainerStyle,
        ]}
      >
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.neutral[500]}
          selectionColor={colors.primary.DEFAULT}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
      </Animated.View>

      {error && (
        <NeonText variant="label" style={styles.errorText}>
          {error}
        </NeonText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  label: {
    marginBottom: 8,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.neutral[50],
    ...Platform.select({
      ios: {
        shadowColor: colors.primary.DEFAULT,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 12,
        shadowOpacity: 0,
      },
      android: {},
      web: {},
    }),
  },
  focusedContainer: Platform.select({
    web: {
      boxShadow: `0 0 12px ${colors.glow}`,
    },
    default: {},
  }) as ViewStyle,
  errorContainer: {
    ...Platform.select({
      ios: {
        shadowColor: colors.error,
        shadowOpacity: 0.3,
      },
      web: {
        boxShadow: `0 0 12px rgba(255, 65, 54, 0.3)`,
      },
      android: {},
    }),
  } as ViewStyle,
  input: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 17,
    fontWeight: '400',
    color: colors.neutral[900],
  },
  errorText: {
    marginTop: 8,
    color: colors.error,
  },
});

