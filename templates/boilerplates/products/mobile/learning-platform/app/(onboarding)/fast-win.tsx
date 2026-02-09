import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Mic, Play } from "lucide-react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { DevHubButton } from "@/components/DevHubButton";
import { OnboardingHeader } from "@/components/OnboardingHeader";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { colors } from "@/theme/tokens";

type RecordingState = "idle" | "playing" | "recording" | "processing";

export default function FastWinScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setStep, addXP } = useOnboardingStore();

  const [state, setState] = useState<RecordingState>("idle");
  const shimmer = useSharedValue(0);
  const micPulse = useSharedValue(0);

  // Word shimmer animation
  useEffect(() => {
    shimmer.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
  }, [shimmer]);

  // Mic pulse when recording
  useEffect(() => {
    if (state === "recording") {
      micPulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 600 }),
          withTiming(0, { duration: 600 })
        ),
        -1,
        false
      );
    } else {
      micPulse.value = withTiming(0, { duration: 200 });
    }
  }, [state, micPulse]);

  const shimmerStyle = useAnimatedStyle(() => {
    const opacity = 0.7 + shimmer.value * 0.3;
    return { opacity };
  });

  const micPulseStyle = useAnimatedStyle(() => {
    const scale = 1 + micPulse.value * 0.15;
    const opacity = 0.3 + micPulse.value * 0.4;
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const handlePlay = useCallback(() => {
    if (state !== "idle") return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setState("playing");

    // Stubbed - simulate playback
    setTimeout(() => setState("idle"), 1500);
  }, [state]);

  const handleRecord = useCallback(() => {
    if (state === "recording") return;

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setState("recording");

    // Stubbed - simulate recording then success
    setTimeout(() => {
      setState("processing");
      setTimeout(() => {
        setStep(4);
        addXP(10);
        router.push("/fast-win-success");
      }, 800);
    }, 2000);
  }, [state, router, setStep, addXP]);

  return (
    <GradientBackground>
      <DevHubButton />
      <OnboardingHeader step={3} totalSteps={5} />

      <View
        style={[
          styles.container,
          { paddingBottom: insets.bottom + 40 },
        ]}
      >
        {/* Headline */}
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400, delay: 100 }}
          style={styles.headlineSection}
        >
          <Text style={styles.headline}>Let's try something real.</Text>
          <Text style={styles.subheadline}>Try your first exercise</Text>
        </MotiView>

        {/* Big word display */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 260, delay: 300 }}
          style={styles.wordSection}
        >
          <Animated.Text style={[styles.bigWord, shimmerStyle]}>
            LEARN
          </Animated.Text>
          <Text style={styles.pronunciation}>/lɜːrn/</Text>
        </MotiView>

        {/* Action buttons */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400, delay: 500 }}
          style={styles.actionsSection}
        >
          {/* Play button */}
          <Pressable
            onPress={handlePlay}
            style={[styles.actionButton, state === "playing" && styles.actionButtonActive]}
            disabled={state !== "idle"}
          >
            <View style={styles.actionIconWrapper}>
              <Play size={24} color={colors.secondary[300]} />
            </View>
            <Text style={styles.actionLabel}>Hear AI Tutor</Text>
          </Pressable>

          {/* Record button */}
          <Pressable
            onPress={handleRecord}
            style={[styles.recordButton, state === "recording" && styles.recordButtonActive]}
            disabled={state === "processing"}
          >
            {/* Pulse ring */}
            <Animated.View style={[styles.pulseRing, micPulseStyle]} />

            <View style={styles.recordIconWrapper}>
              <Mic size={28} color={colors.text.primary} />
            </View>
          </Pressable>
          <Text style={styles.recordLabel}>
            {state === "recording" ? "Listening..." : state === "processing" ? "Checking..." : "Tap to speak"}
          </Text>
        </MotiView>

        {/* Waveform placeholder */}
        {(state === "recording" || state === "processing") && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={styles.waveformSection}
          >
            <WaveformBars />
          </MotiView>
        )}

        {/* Tip */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing", duration: 400, delay: 700 }}
          style={styles.tipSection}
        >
          <Text style={styles.tipText}>
            Tip: Keep it light. You've got this! 
          </Text>
        </MotiView>
      </View>
    </GradientBackground>
  );
}

function WaveformBars() {
  return (
    <View style={styles.waveformContainer}>
      {Array.from({ length: 20 }).map((_, i) => (
        <WaveformBar key={i} index={i} />
      ))}
    </View>
  );
}

function WaveformBar({ index }: { index: number }) {
  const height = useSharedValue(0.3);

  useEffect(() => {
    height.value = withRepeat(
      withSequence(
        withTiming(0.3 + Math.random() * 0.7, { duration: 150 + Math.random() * 200 }),
        withTiming(0.2 + Math.random() * 0.3, { duration: 150 + Math.random() * 200 })
      ),
      -1,
      true
    );
  }, [height]);

  const style = useAnimatedStyle(() => ({
    height: 40 * height.value,
  }));

  return (
    <Animated.View
      style={[
        styles.waveformBar,
        { backgroundColor: index % 2 === 0 ? colors.primary[400] : colors.secondary[400] },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  headlineSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  headline: {
    fontFamily: "Satoshi-Bold",
    fontSize: 26,
    color: colors.text.primary,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  subheadline: {
    fontFamily: "PlusJakartaSans",
    fontSize: 15,
    color: colors.text.secondary,
    marginTop: 6,
    textAlign: "center",
  },
  wordSection: {
    alignItems: "center",
    marginVertical: 40,
  },
  bigWord: {
    fontFamily: "Satoshi-Bold",
    fontSize: 72,
    color: colors.primary[400],
    letterSpacing: 8,
    textShadowColor: colors.primary[500],
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  pronunciation: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: colors.text.muted,
    marginTop: 8,
  },
  actionsSection: {
    alignItems: "center",
    gap: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "rgba(6, 182, 212, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.2)",
  },
  actionButtonActive: {
    backgroundColor: "rgba(6, 182, 212, 0.2)",
  },
  actionIconWrapper: {
    marginRight: 10,
  },
  actionLabel: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 15,
    color: colors.secondary[300],
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[500],
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary[500],
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  recordButtonActive: {
    backgroundColor: colors.primary[600],
  },
  pulseRing: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary[500],
  },
  recordIconWrapper: {
    zIndex: 1,
  },
  recordLabel: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.secondary,
  },
  waveformSection: {
    marginTop: 30,
    alignItems: "center",
  },
  waveformContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    gap: 3,
  },
  waveformBar: {
    width: 4,
    borderRadius: 2,
  },
  tipSection: {
    marginTop: "auto",
    alignItems: "center",
  },
  tipText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.muted,
    textAlign: "center",
  },
});



