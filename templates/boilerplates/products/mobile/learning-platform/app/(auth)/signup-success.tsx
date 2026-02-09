import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { CheckCircle, Sparkles } from "lucide-react-native";
import { Easing } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { DevHubButton } from "@/components/DevHubButton";
import { GlassPanel } from "@/components/GlassPanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { colors } from "@/theme/tokens";

export default function SignupSuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showButton, setShowButton] = useState(false);
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  useEffect(() => {
    // Celebration haptic
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Delay button appearance (instant if reduced motion)
    const timer = setTimeout(() => setShowButton(true), reduceMotion ? 0 : 600);
    return () => clearTimeout(timer);
  }, [reduceMotion]);

  const handleStart = () => {
    router.replace("/(tabs)/home");
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
        {/* Success content */}
        <View style={styles.contentSection}>
          {/* Icon with glow */}
          <MotiView
            from={motionFrom.scaleIn}
            animate={{ opacity: 1, scale: 1 }}
            transition={getTransition({ type: "timing", duration: 260 })}
            style={styles.iconWrapper}
          >
            <View style={styles.iconGlow} />
            <CheckCircle size={64} color={colors.success} strokeWidth={1.5} />
          </MotiView>

          {/* Text */}
          <MotiView
            from={motionFrom.fadeUpLarge}
            animate={{ opacity: 1, translateY: 0 }}
            transition={getTransition({ type: "timing", duration: 400, delay: 200 })}
            style={styles.textSection}
          >
            <Text style={styles.headline}>Welcome!</Text>
            <Text style={styles.subheadline}>
              Your account is ready.{"\n"}Let's start learning.
            </Text>
          </MotiView>

          {/* Summary card */}
          <MotiView
            from={reduceMotion ? { opacity: 1, translateY: 0 } : { opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={getTransition({ type: "timing", duration: 260, delay: 400 })}
            style={styles.cardWrapper}
          >
            <GlassPanel style={styles.card}>
              <View style={styles.cardRow}>
                <Sparkles size={18} color={colors.accent[400]} />
                <Text style={styles.cardText}>
                  You're all set to practice speaking with AI Tutor
                </Text>
              </View>
            </GlassPanel>
          </MotiView>
        </View>

        {/* CTA */}
        {showButton && (
          <MotiView
            from={motionFrom.fadeUpLarge}
            animate={{ opacity: 1, translateY: 0 }}
            transition={getTransition({ type: "timing", duration: 260 })}
            style={styles.buttonSection}
          >
            <PrimaryButton label="Start learning" onPress={handleStart} />
          </MotiView>
        )}
      </View>
    </GradientBackground>
  );
}

function ConfettiParticles() {
  const confettiColors = [
    colors.primary[400],
    colors.secondary[400],
    colors.accent[400],
    colors.success,
    colors.primary[300],
  ];

  return (
    <View style={styles.confettiContainer} pointerEvents="none">
      {Array.from({ length: 25 }).map((_, i) => {
        const startX = 5 + Math.random() * 90;
        const endX = startX + (Math.random() - 0.5) * 50;
        const size = 6 + Math.random() * 8;
        const delay = Math.random() * 400;
        const duration = 1800 + Math.random() * 1200;
        const color = confettiColors[i % confettiColors.length];

        return (
          <MotiView
            key={i}
            from={{
              opacity: 1,
              translateY: -30,
              translateX: 0,
              rotate: "0deg",
            }}
            animate={{
              opacity: 0,
              translateY: 700,
              translateX: endX - startX,
              rotate: `${Math.random() * 720}deg`,
            }}
            transition={{
              type: "timing",
              duration,
              delay,
              easing: Easing.out(Easing.quad),
            }}
            style={{
              position: "absolute",
              left: `${startX}%`,
              top: 0,
              width: size,
              height: size * 0.6,
              backgroundColor: color,
              borderRadius: size / 4,
            }}
          />
        );
      })}
    </View>
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
  contentSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapper: {
    position: "relative",
    marginBottom: 24,
  },
  iconGlow: {
    position: "absolute",
    top: -15,
    left: -15,
    right: -15,
    bottom: -15,
    borderRadius: 999,
    backgroundColor: colors.success,
    opacity: 0.15,
  },
  textSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  headline: {
    fontFamily: "Satoshi-Bold",
    fontSize: 36,
    color: colors.text.primary,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subheadline: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 24,
  },
  cardWrapper: {
    width: "100%",
    maxWidth: 340,
  },
  card: {
    padding: 20,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.primary,
    flex: 1,
    lineHeight: 20,
  },
  buttonSection: {
    paddingTop: 16,
  },
});



