import { MotiView } from "moti";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Mic, Volume2 } from "lucide-react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { useReduceMotion } from "@/hooks/useReduceMotion";
import { colors } from "@/theme/tokens";

export type TutorState = "idle" | "listening" | "thinking" | "speaking";

type Props = {
  state: TutorState;
  size?: number;
};

export function TutorAvatarAnimated({ state, size = 120 }: Props) {
  const reduceMotion = useReduceMotion();

  // Animation values
  const breatheScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);
  const bounceY = useSharedValue(0);

  // Breathing animation (idle)
  useEffect(() => {
    if (reduceMotion) return;

    if (state === "idle") {
      breatheScale.value = withRepeat(
        withSequence(
          withTiming(1.03, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      );
      pulseOpacity.value = 0;
      bounceY.value = 0;
    } else if (state === "listening") {
      breatheScale.value = 1;
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 400 }),
          withTiming(0.2, { duration: 400 })
        ),
        -1,
        true
      );
      bounceY.value = 0;
    } else if (state === "thinking") {
      breatheScale.value = 1;
      pulseOpacity.value = 0;
      bounceY.value = withRepeat(
        withSequence(
          withTiming(-5, { duration: 400, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 400, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      );
    } else if (state === "speaking") {
      breatheScale.value = 1;
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 300 }),
          withTiming(0.2, { duration: 300 })
        ),
        -1,
        true
      );
      bounceY.value = 0;
    }
  }, [state, reduceMotion, breatheScale, pulseOpacity, bounceY]);

  const avatarStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: breatheScale.value },
      { translateY: bounceY.value },
    ],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
    transform: [{ scale: 1 + pulseOpacity.value * 0.3 }],
  }));

  const getStateLabel = () => {
    switch (state) {
      case "listening":
        return "Listening...";
      case "thinking":
        return "Thinking...";
      case "speaking":
        return "Speaking...";
      default:
        return "Ready to chat";
    }
  };

  const getStateColor = () => {
    switch (state) {
      case "listening":
        return colors.error;
      case "thinking":
        return colors.accent[400];
      case "speaking":
        return colors.secondary[400];
      default:
        return colors.primary[400];
    }
  };

  return (
    <View style={styles.container}>
      {/* Pulse ring */}
      {(state === "listening" || state === "speaking") && (
        <Animated.View
          style={[
            styles.pulseRing,
            {
              width: size + 40,
              height: size + 40,
              borderRadius: (size + 40) / 2,
              backgroundColor: getStateColor(),
            },
            pulseStyle,
          ]}
        />
      )}

      {/* Avatar */}
      <Animated.View
        style={[
          styles.avatar,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          avatarStyle,
        ]}
      >
        {/* AI Tutor initials */}
        <Text style={[styles.initials, { fontSize: size * 0.35 }]}>T</Text>

        {/* State icon overlay */}
        {state === "listening" && (
          <MotiView
            from={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.stateIcon}
          >
            <Mic size={20} color={colors.error} />
          </MotiView>
        )}

        {state === "speaking" && (
          <MotiView
            from={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.stateIcon}
          >
            <Volume2 size={20} color={colors.secondary[400]} />
          </MotiView>
        )}
      </Animated.View>

      {/* State label */}
      <MotiView
        key={state}
        from={{ opacity: 0, translateY: 5 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 200 }}
        style={styles.labelContainer}
      >
        <Text style={[styles.stateLabel, { color: getStateColor() }]}>
          {getStateLabel()}
        </Text>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  pulseRing: {
    position: "absolute",
  },
  avatar: {
    backgroundColor: "rgba(17, 24, 39, 0.8)",
    borderWidth: 3,
    borderColor: colors.primary[400],
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  initials: {
    fontFamily: "Satoshi-Bold",
    color: colors.primary[400],
  },
  stateIcon: {
    position: "absolute",
    bottom: -5,
    right: -5,
    backgroundColor: "rgba(17, 24, 39, 0.9)",
    borderRadius: 16,
    padding: 6,
  },
  labelContainer: {
    marginTop: 16,
  },
  stateLabel: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
  },
});

