import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { CheckCircle } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { DevHubButton } from "@/components/DevHubButton";
import { GlassPanel } from "@/components/GlassPanel";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { colors } from "@/theme/tokens";

export default function SigninSuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  useEffect(() => {
    // Success haptic
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Auto-redirect after short delay (faster if reduced motion)
    const timer = setTimeout(() => {
      router.replace("/(tabs)/home");
    }, reduceMotion ? 500 : 1500);

    return () => clearTimeout(timer);
  }, [router, reduceMotion]);

  return (
    <GradientBackground>
      <DevHubButton />

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
          {/* Card */}
          <MotiView
            from={motionFrom.scaleIn}
            animate={{ opacity: 1, scale: 1 }}
            transition={getTransition({ type: "timing", duration: 260 })}
            style={styles.cardWrapper}
          >
            <GlassPanel style={styles.card} glow glowColor={colors.success}>
              {/* Icon */}
              <MotiView
                from={reduceMotion ? { scale: 1 } : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={getTransition({ type: "timing", duration: 260, delay: 200 })}
                style={styles.iconWrapper}
              >
                <View style={styles.iconGlow} />
                <CheckCircle size={48} color={colors.success} strokeWidth={1.5} />
              </MotiView>

              {/* Text */}
              <MotiView
                from={motionFrom.fadeUp}
                animate={{ opacity: 1, translateY: 0 }}
                transition={getTransition({ type: "timing", duration: 300, delay: 300 })}
              >
                <Text style={styles.headline}>You're in</Text>
                <Text style={styles.subheadline}>
                  Loading your dashboard...
                </Text>
              </MotiView>

              {/* Loading indicator */}
              <MotiView
                from={motionFrom.fade}
                animate={{ opacity: 1 }}
                transition={getTransition({ type: "timing", duration: 300, delay: 500 })}
                style={styles.loadingSection}
              >
                <LoadingDots />
              </MotiView>
            </GlassPanel>
          </MotiView>
        </View>
      </View>
    </GradientBackground>
  );
}

function LoadingDots() {
  return (
    <View style={styles.dotsContainer}>
      {[0, 1, 2].map((index) => (
        <MotiView
          key={index}
          from={{ opacity: 0.3 }}
          animate={{ opacity: 1 }}
          transition={{
            type: "timing",
            duration: 600,
            delay: index * 200,
            loop: true,
            repeatReverse: true,
          }}
          style={[styles.dot, { backgroundColor: colors.secondary[400] }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  contentSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cardWrapper: {
    width: "100%",
    maxWidth: 320,
  },
  card: {
    padding: 40,
    alignItems: "center",
  },
  iconWrapper: {
    position: "relative",
    marginBottom: 20,
  },
  iconGlow: {
    position: "absolute",
    top: -12,
    left: -12,
    right: -12,
    bottom: -12,
    borderRadius: 999,
    backgroundColor: colors.success,
    opacity: 0.12,
  },
  headline: {
    fontFamily: "Satoshi-Bold",
    fontSize: 28,
    color: colors.text.primary,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  subheadline: {
    fontFamily: "PlusJakartaSans",
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: 8,
  },
  loadingSection: {
    marginTop: 24,
  },
  dotsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});



