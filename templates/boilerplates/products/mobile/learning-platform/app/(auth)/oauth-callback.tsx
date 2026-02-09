import { MotiView } from "moti";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Shield } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { DevHubButton } from "@/components/DevHubButton";
import { GlassPanel } from "@/components/GlassPanel";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { colors } from "@/theme/tokens";

export default function OAuthCallbackScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  useEffect(() => {
    // Simulate OAuth callback processing (faster if reduced motion)
    const timer = setTimeout(() => {
      // In a real app, this would check if user is new or returning
      // For demo, go to dashboard
      router.replace("/(tabs)/home");
    }, reduceMotion ? 500 : 2000);

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
        {/* Content */}
        <View style={styles.contentSection}>
          {/* Card */}
          <MotiView
            from={motionFrom.scaleIn}
            animate={{ opacity: 1, scale: 1 }}
            transition={getTransition({ type: "timing", duration: 260 })}
            style={styles.cardWrapper}
          >
            <GlassPanel style={styles.card}>
              {/* Icon with animation */}
              <MotiView
                from={{ rotate: reduceMotion ? "0deg" : "0deg" }}
                animate={{ rotate: reduceMotion ? "0deg" : "360deg" }}
                transition={reduceMotion ? { type: "timing", duration: 0 } : {
                  type: "timing",
                  duration: 2000,
                  loop: true,
                }}
                style={styles.iconWrapper}
              >
                <View style={styles.iconGlow} />
                <Shield size={48} color={colors.secondary[400]} strokeWidth={1.5} />
              </MotiView>

              {/* Text */}
              <MotiView
                from={motionFrom.fadeUp}
                animate={{ opacity: 1, translateY: 0 }}
                transition={getTransition({ type: "timing", duration: 300, delay: 200 })}
              >
                <Text style={styles.headline}>Signing you in...</Text>
                <Text style={styles.subheadline}>
                  Securing your session
                </Text>
              </MotiView>

              {/* Loading indicator */}
              <MotiView
                from={motionFrom.fade}
                animate={{ opacity: 1 }}
                transition={getTransition({ type: "timing", duration: 300, delay: 400 })}
                style={styles.loadingSection}
              >
                <LoadingBar />
              </MotiView>
            </GlassPanel>
          </MotiView>
        </View>
      </View>
    </GradientBackground>
  );
}

function LoadingBar() {
  return (
    <View style={styles.loadingBarContainer}>
      <MotiView
        from={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{
          type: "timing",
          duration: 1800,
        }}
        style={styles.loadingBarFill}
      />
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
    marginBottom: 24,
  },
  iconGlow: {
    position: "absolute",
    top: -15,
    left: -15,
    right: -15,
    bottom: -15,
    borderRadius: 999,
    backgroundColor: colors.secondary[500],
    opacity: 0.1,
  },
  headline: {
    fontFamily: "Satoshi-Bold",
    fontSize: 24,
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
    width: "100%",
    marginTop: 28,
  },
  loadingBarContainer: {
    width: "100%",
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
  },
  loadingBarFill: {
    height: "100%",
    backgroundColor: colors.secondary[400],
    borderRadius: 2,
  },
});



