import * as Haptics from "expo-haptics";
import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, TextStyle, ViewStyle } from "react-native";

import { colors } from "../theme/tokens";

type Props = {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
};

export function SecondaryLink({
  label,
  onPress,
  style,
  textStyle,
  disabled = false,
}: Props) {
  const handlePress = useCallback(() => {
    if (disabled) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [disabled, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      accessibilityRole="link"
    >
      <Text
        style={[
          styles.text,
          disabled && styles.textDisabled,
          textStyle,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.secondary[400],
    textDecorationLine: "underline",
    textDecorationColor: colors.secondary[400],
  },
  textDisabled: {
    color: colors.text.muted,
    textDecorationColor: colors.text.muted,
  },
});



