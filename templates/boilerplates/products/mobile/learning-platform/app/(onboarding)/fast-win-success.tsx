import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { DevHubButton } from "@/components/DevHubButton";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { colors } from "@/theme/tokens";

export default function FastWinSuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { xpEarned, setStep } = useOnboardingStore();

  const [displayXP, setDisplayXP] = useState(0);
  const scale = useSharedValue(0.5);
  const glow = useSharedValue(0);

  // Celebration animation on mount
  useEffect(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Scale bounce
    scale.value = withSequence(
      withTiming(1.1, { duration: 260 }),
      withTiming(1, { duration: 260 })
    );

    // Glow pulse
    glow.value = withSequence(
      withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) }),
      withTiming(0.5, { duration: 600 })
    );

    // XP counter animation
    const targetXP = xpEarned || 10;
    const duration = 800;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
      setDisplayXP(Math.round(targetXP * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const timer = setTimeout(animate, 400);
    return () => clearTimeout(timer);
  }, [scale, glow, xpEarned]);

  const celebrationStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: 1 + glow.value * 0.2 }],
  }));

  const handleContinue = () => {
    setStep(4);
    router.push("/notifications");
  };

  return (
    <GradientBackground>
      <DevHubButton />

      {/* Confetti particles */}
      <ConfettiParticles />

      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + 60,
            paddingBottom: insets.bottom + 32,
          },
        ]}
      >
        {/* Celebration section */}
        <View style={styles.celebrationSection}>
          {/* Glow background */}
          <Animated.View style={[styles.glowBg, glowStyle]} />

          <Animated.View style={celebrationStyle}>
            <MotiView
              from={{ rotate: "-5deg" }}
              animate={{ rotate: "5deg" }}
              transition={{
                type: "timing",
                duration: 1500,
                loop: true,
                repeatReverse: true,
              }}
            >
              <Text style={styles.perfectoText}>¡Perfecto!</Text>
            </MotiView>
          </Animated.View>

          {/* XP earned */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 260, delay: 400 }}
            style={styles.xpSection}
          >
            <Text style={styles.xpValue}>+{displayXP}</Text>
            <Text style={styles.xpLabel}>XP</Text>
          </MotiView>
        </View>

        {/* AI Tutor quote */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500, delay: 600 }}
          style={styles.quoteSection}
        >
          <Text style={styles.quoteText}>
            "You just completed your first lesson."
          </Text>
          <Text style={styles.quoteName}>— AI Tutor</Text>
        </MotiView>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Continue button */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 260, delay: 800 }}
        >
          <PrimaryButton
            label="Continue"
            onPress={handleContinue}
          />
        </MotiView>
      </View>
    </GradientBackground>
  );
}

function ConfettiParticles() {
  return (
    <View style={styles.confettiContainer} pointerEvents="none">
      {Array.from({ length: 20 }).map((_, i) => (
        <ConfettiPiece key={i} index={i} />
      ))}
    </View>
  );
}

function ConfettiPiece({ index }: { index: number }) {
  const confettiColors = [
    colors.primary[400],
    colors.secondary[400],
    colors.accent[400],
    colors.primary[300],
    colors.secondary[300],
  ];

  const startX = 10 + Math.random() * 80;
  const endX = startX + (Math.random() - 0.5) * 40;
  const size = 6 + Math.random() * 6;
  const delay = Math.random() * 300;
  const duration = 1500 + Math.random() * 1000;
  const color = confettiColors[index % confettiColors.length];

  return (
    <MotiView
      from={{
        opacity: 1,
        translateY: -20,
        translateX: 0,
        rotate: "0deg",
      }}
      animate={{
        opacity: 0,
        translateY: 600,
        translateX: endX - startX,
        rotate: `${Math.random() * 720}deg`,
      }}
      transition={{
        type: "timing",
        duration,
        delay,
        easing: Easing.out(Easing.quad),
      }}
      style={[
        styles.confettiPiece,
        {
          left: `${startX}%`,
          width: size,
          height: size * 0.6,
          backgroundColor: color,
          borderRadius: size / 4,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  confettiPiece: {
    position: "absolute",
    top: 0,
  },
  celebrationSection: {
    alignItems: "center",
    marginTop: 40,
  },
  glowBg: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.primary[500],
  },
  perfectoText: {
    fontFamily: "Satoshi-Bold",
    fontSize: 48,
    color: colors.primary[400],
    textAlign: "center",
    textShadowColor: colors.primary[500],
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  },
  xpSection: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 24,
  },
  xpValue: {
    fontFamily: "Satoshi-Bold",
    fontSize: 56,
    color: colors.accent[400],
    textShadowColor: colors.accent[500],
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  xpLabel: {
    fontFamily: "Satoshi-Bold",
    fontSize: 24,
    color: colors.accent[400],
    marginLeft: 6,
  },
  quoteSection: {
    alignItems: "center",
    marginTop: 48,
    paddingHorizontal: 20,
  },
  quoteText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 20,
    color: colors.text.primary,
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 28,
  },
  quoteName: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 12,
  },
  spacer: {
    flex: 1,
  },
});



