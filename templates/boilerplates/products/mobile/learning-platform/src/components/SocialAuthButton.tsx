import * as Haptics from "expo-haptics";
import React, { useCallback } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useReduceMotion } from "../hooks/useReduceMotion";
import { colors, durations } from "../theme/tokens";

type Provider = "apple" | "google";

type Props = {
  provider: Provider;
  onPress?: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.createAnimatedComponent(View);

// Custom icons since we're avoiding emoji and external icon packs for social
function AppleIcon() {
  return (
    <View style={iconStyles.apple}>
      <View style={iconStyles.appleBody} />
      <View style={iconStyles.appleStem} />
      <View style={iconStyles.appleLeaf} />
    </View>
  );
}

function GoogleIcon() {
  return (
    <View style={iconStyles.google}>
      <View style={iconStyles.googleRed} />
      <View style={iconStyles.googleYellow} />
      <View style={iconStyles.googleGreen} />
      <View style={iconStyles.googleBlue} />
      <View style={iconStyles.googleCenter} />
    </View>
  );
}

export function SocialAuthButton({ provider, onPress }: Props) {
  const reduceMotion = useReduceMotion();
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(pressed.value, [0, 1], [1, 0.97]);
    return { transform: [{ scale }] };
  });

  // Glow effect on press
  const glowStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(pressed.value, [0, 1], [0, 0.2]),
    };
  });

  // Border glow on press
  const borderStyle = useAnimatedStyle(() => {
    const borderOpacity = interpolate(pressed.value, [0, 1], [0.12, 0.25]);
    return {
      borderColor: `rgba(255, 255, 255, ${borderOpacity})`,
    };
  });

  const handlePressIn = useCallback(() => {
    pressed.value = reduceMotion
      ? 1
      : withTiming(1, { duration: durations.fast });
  }, [pressed, reduceMotion]);

  const handlePressOut = useCallback(() => {
    pressed.value = reduceMotion
      ? 0
      : withTiming(0, { duration: durations.fast });
  }, [pressed, reduceMotion]);

  const handlePress = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (onPress) {
      onPress();
    } else {
      // Stubbed - show toast
      Alert.alert(
        "Coming Soon",
        `${provider === "apple" ? "Apple" : "Google"} sign-in will be available soon.`,
        [{ text: "OK" }]
      );
    }
  }, [onPress, provider]);

  const label = provider === "apple" ? "Apple" : "Google";

  return (
    <View style={styles.wrapper}>
      {/* Glow layer behind button */}
      <AnimatedView
        style={[styles.glow, glowStyle]}
        pointerEvents="none"
      />

      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={[styles.button, animatedStyle, borderStyle]}
        accessibilityRole="button"
        accessibilityLabel={`Continue with ${label}`}
      >
        <View style={styles.iconContainer}>
          {provider === "apple" ? <AppleIcon /> : <GoogleIcon />}
        </View>
        <Text style={styles.label}>{label}</Text>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    position: "relative",
  },
  glow: {
    position: "absolute",
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 17,
    backgroundColor: colors.text.primary,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(17, 24, 39, 0.6)",
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 10,
  },
  iconContainer: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 15,
    color: colors.text.primary,
    letterSpacing: 0.2,
  },
});

// Abstract icon styles for Apple and Google
const iconStyles = StyleSheet.create({
  apple: {
    width: 20,
    height: 20,
    position: "relative",
  },
  appleBody: {
    position: "absolute",
    bottom: 0,
    left: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.text.primary,
    transform: [{ scaleY: 1.1 }],
  },
  appleStem: {
    position: "absolute",
    top: 0,
    left: 10,
    width: 2,
    height: 5,
    backgroundColor: colors.text.primary,
    borderRadius: 1,
  },
  appleLeaf: {
    position: "absolute",
    top: 2,
    left: 11,
    width: 5,
    height: 4,
    backgroundColor: colors.text.primary,
    borderTopRightRadius: 4,
    transform: [{ rotate: "30deg" }],
  },
  google: {
    width: 20,
    height: 20,
    position: "relative",
  },
  googleRed: {
    position: "absolute",
    top: 0,
    left: 5,
    width: 10,
    height: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: "#EA4335",
  },
  googleYellow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 10,
    height: 10,
    borderBottomLeftRadius: 10,
    backgroundColor: "#FBBC04",
  },
  googleGreen: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderBottomRightRadius: 10,
    backgroundColor: "#34A853",
  },
  googleBlue: {
    position: "absolute",
    top: 5,
    right: 0,
    width: 10,
    height: 10,
    borderTopRightRadius: 10,
    backgroundColor: "#4285F4",
  },
  googleCenter: {
    position: "absolute",
    top: 5,
    left: 5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
});



