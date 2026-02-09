import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { Eye, EyeOff, AlertCircle } from "lucide-react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { useReduceMotion } from "../hooks/useReduceMotion";
import { colors, durations } from "../theme/tokens";

type Props = Omit<TextInputProps, "style"> & {
  label: string;
  error?: string;
  isPassword?: boolean;
};

const AnimatedView = Animated.createAnimatedComponent(View);

export function TextField({
  label,
  error,
  isPassword = false,
  onFocus,
  onBlur,
  ...inputProps
}: Props) {
  const reduceMotion = useReduceMotion();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const prevError = useRef<string | undefined>(undefined);

  const focusAnim = useSharedValue(0);
  const errorAnim = useSharedValue(error ? 1 : 0);
  const shakeX = useSharedValue(0);

  // Update error animation when error prop changes
  useEffect(() => {
    errorAnim.value = withTiming(error ? 1 : 0, { duration: durations.fast });
  }, [error, errorAnim]);

  // Shake animation when error appears (not on initial render)
  useEffect(() => {
    const hadError = !!prevError.current;
    const hasError = !!error;

    // Only shake when error newly appears
    if (!hadError && hasError && !reduceMotion) {
      // Gentle shake animation (8-12px as per PRD)
      shakeX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-4, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
      // Haptic feedback for error
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    prevError.current = error;
  }, [error, reduceMotion, shakeX]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    focusAnim.value = withTiming(1, { duration: durations.fast });
  }, [focusAnim]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    focusAnim.value = withTiming(0, { duration: durations.fast });
  }, [focusAnim]);

  const togglePassword = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowPassword((prev) => !prev);
  }, []);

  const containerStyle = useAnimatedStyle(() => {
    const transform = [{ translateX: shakeX.value }];

    if (reduceMotion) {
      return {
        borderColor: error
          ? colors.error
          : isFocused
            ? colors.primary[500]
            : "rgba(255, 255, 255, 0.12)",
        transform,
      };
    }

    const borderColor = interpolateColor(
      focusAnim.value,
      [0, 1],
      [
        error ? colors.error : "rgba(255, 255, 255, 0.12)",
        error ? colors.error : colors.primary[500],
      ]
    );

    return { borderColor, transform };
  }, [error, isFocused, reduceMotion]);

  // Enhanced glow with more premium feel
  const glowStyle = useAnimatedStyle(() => {
    if (reduceMotion) {
      return { opacity: isFocused && !error ? 0.25 : 0 };
    }

    return {
      opacity: focusAnim.value * (error ? 0 : 0.25),
    };
  }, [error, reduceMotion]);

  // Error glow for visual emphasis
  const errorGlowStyle = useAnimatedStyle(() => {
    if (reduceMotion) {
      return { opacity: error ? 0.15 : 0 };
    }

    return {
      opacity: errorAnim.value * 0.15,
    };
  }, [reduceMotion]);

  return (
    <View style={styles.wrapper}>
      {/* Label */}
      <Text style={styles.label}>{label}</Text>

      {/* Input container */}
      <View style={styles.inputWrapper}>
        {/* Focus glow layer - enhanced */}
        <AnimatedView
          style={[styles.glow, glowStyle]}
          pointerEvents="none"
        />

        {/* Error glow layer */}
        <AnimatedView
          style={[styles.errorGlow, errorGlowStyle]}
          pointerEvents="none"
        />

        <AnimatedView style={[styles.container, containerStyle]}>
          <TextInput
            style={styles.input}
            placeholderTextColor={colors.text.muted}
            selectionColor={colors.primary[400]}
            cursorColor={colors.primary[400]}
            secureTextEntry={isPassword && !showPassword}
            autoCapitalize={isPassword ? "none" : inputProps.autoCapitalize}
            autoCorrect={false}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...inputProps}
          />

          {/* Password toggle */}
          {isPassword && (
            <Pressable
              onPress={togglePassword}
              style={styles.toggleButton}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityLabel={showPassword ? "Hide password" : "Show password"}
              accessibilityRole="button"
            >
              {showPassword ? (
                <EyeOff size={20} color={colors.text.muted} />
              ) : (
                <Eye size={20} color={colors.text.muted} />
              )}
            </Pressable>
          )}
        </AnimatedView>
      </View>

      {/* Error message - enhanced styling */}
      {error && (
        <MotiView
          from={{ opacity: 0, translateY: -4 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 200 }}
          style={styles.errorContainer}
        >
          <AlertCircle size={14} color={colors.error} style={styles.errorIcon} />
          <Text style={styles.errorText}>{error}</Text>
        </MotiView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    position: "relative",
  },
  glow: {
    position: "absolute",
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 22,
    backgroundColor: colors.primary[500],
    // Enhanced shadow for premium glow
    shadowColor: colors.primary[500],
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  errorGlow: {
    position: "absolute",
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 20,
    backgroundColor: colors.error,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(17, 24, 39, 0.6)",
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  input: {
    flex: 1,
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: colors.text.primary,
    paddingVertical: 16,
  },
  toggleButton: {
    padding: 4,
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },
  errorIcon: {
    marginRight: 6,
  },
  errorText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.error,
    flex: 1,
  },
});



