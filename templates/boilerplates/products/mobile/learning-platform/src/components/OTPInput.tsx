import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { useReduceMotion } from "../hooks/useReduceMotion";
import { colors, durations } from "../theme/tokens";

type Props = {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoFocus?: boolean;
};

const AnimatedView = Animated.createAnimatedComponent(View);

export function OTPInput({
  length = 6,
  value,
  onChange,
  error,
  autoFocus = true,
}: Props) {
  const reduceMotion = useReduceMotion();
  const inputRef = useRef<TextInput>(null);
  const [focusedIndex, setFocusedIndex] = useState(autoFocus ? 0 : -1);

  const shakeAnim = useSharedValue(0);

  // Trigger shake on error
  useEffect(() => {
    if (error && !reduceMotion) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      shakeAnim.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-6, { duration: 50 }),
        withTiming(6, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }
  }, [error, reduceMotion, shakeAnim]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeAnim.value }],
  }));

  const handlePress = useCallback(() => {
    inputRef.current?.focus();
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleChange = useCallback(
    (text: string) => {
      // Only allow digits
      const cleaned = text.replace(/[^0-9]/g, "").slice(0, length);
      onChange(cleaned);

      // Haptic on each digit
      if (cleaned.length > value.length) {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      // Update focused index
      setFocusedIndex(Math.min(cleaned.length, length - 1));
    },
    [length, onChange, value.length]
  );

  const handleFocus = useCallback(() => {
    setFocusedIndex(Math.min(value.length, length - 1));
  }, [length, value.length]);

  const handleBlur = useCallback(() => {
    setFocusedIndex(-1);
  }, []);

  const digits = value.split("").concat(Array(length - value.length).fill(""));

  return (
    <View style={styles.wrapper}>
      {/* Hidden input for keyboard */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        keyboardType="number-pad"
        maxLength={length}
        autoFocus={autoFocus}
        style={styles.hiddenInput}
        caretHidden
        contextMenuHidden
      />

      {/* Visual boxes */}
      <Pressable onPress={handlePress}>
        <AnimatedView style={[styles.container, containerStyle]}>
          {digits.map((digit, index) => {
            const isFocused = index === focusedIndex;
            const isFilled = digit !== "";
            const isError = !!error;

            return (
                <MotiView
                  key={index}
                  from={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    type: "timing",
                    duration: 260,
                    delay: index * 30,
                  }}
                >
                <View
                  style={[
                    styles.box,
                    isFocused && styles.boxFocused,
                    isFilled && styles.boxFilled,
                    isError && styles.boxError,
                  ]}
                >
                  {/* Glow for focused box */}
                  {isFocused && !isError && (
                    <View style={styles.boxGlow} pointerEvents="none" />
                  )}

                  <Text
                    style={[
                      styles.digit,
                      isFilled && styles.digitFilled,
                    ]}
                  >
                    {digit}
                  </Text>

                  {/* Cursor indicator */}
                  {isFocused && !isFilled && (
                    <MotiView
                      from={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        type: "timing",
                        duration: 500,
                        loop: true,
                        repeatReverse: true,
                      }}
                      style={styles.cursor}
                    />
                  )}
                </View>
              </MotiView>
            );
          })}
        </AnimatedView>
      </Pressable>

      {/* Error message */}
      {error && (
        <MotiView
          from={{ opacity: 0, translateY: -4 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 200 }}
          style={styles.errorContainer}
        >
          <Text style={styles.errorText}>{error}</Text>
        </MotiView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
  },
  hiddenInput: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },
  container: {
    flexDirection: "row",
    gap: 8,
  },
  box: {
    width: 48,
    height: 60,
    borderRadius: 12,
    backgroundColor: "rgba(17, 24, 39, 0.6)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  boxFocused: {
    borderColor: colors.primary[500],
  },
  boxFilled: {
    borderColor: colors.secondary[400],
    backgroundColor: "rgba(6, 182, 212, 0.08)",
  },
  boxError: {
    borderColor: colors.error,
  },
  boxGlow: {
    position: "absolute",
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 18,
    backgroundColor: colors.primary[500],
    opacity: 0.12,
  },
  digit: {
    fontFamily: "Satoshi-Bold",
    fontSize: 28,
    color: colors.text.muted,
  },
  digitFilled: {
    color: colors.text.primary,
  },
  cursor: {
    position: "absolute",
    width: 2,
    height: 28,
    backgroundColor: colors.primary[400],
    borderRadius: 1,
  },
  errorContainer: {
    marginTop: 16,
    paddingHorizontal: 4,
  },
  errorText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.error,
    textAlign: "center",
  },
});



