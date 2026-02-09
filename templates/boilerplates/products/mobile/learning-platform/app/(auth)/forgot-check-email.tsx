import { MotiView } from "moti";
import React, { useCallback } from "react";
import { Linking, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Mail } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { DevHubButton } from "@/components/DevHubButton";
import { GlassPanel } from "@/components/GlassPanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import { SecondaryLink } from "@/components/SecondaryLink";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { useAuthStore } from "@/stores/authStore";
import { colors } from "@/theme/tokens";

export default function ForgotCheckEmailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signupEmail } = useAuthStore();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const handleOpenMail = useCallback(async () => {
    try {
      await Linking.openURL("message://");
    } catch {
      // Fallback for Android or if mail app not available
      try {
        await Linking.openURL("mailto:");
      } catch (error) {
        console.log("Could not open mail app");
      }
    }
  }, []);

  const handleResend = useCallback(() => {
    router.back();
  }, [router]);

  const handleBackToSignin = useCallback(() => {
    router.push("/signin-credentials");
  }, [router]);

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
              {/* Icon */}
              <MotiView
                from={reduceMotion ? { scale: 1 } : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={getTransition({ type: "timing", duration: 260, delay: 150 })}
                style={styles.iconWrapper}
              >
                <View style={styles.iconGlow} />
                <Mail size={48} color={colors.secondary[400]} strokeWidth={1.5} />
              </MotiView>

              {/* Text */}
              <MotiView
                from={motionFrom.fadeUp}
                animate={{ opacity: 1, translateY: 0 }}
                transition={getTransition({ type: "timing", duration: 300, delay: 250 })}
              >
                <Text style={styles.headline}>Check your email</Text>
                <Text style={styles.subheadline}>
                  We sent a password reset link to{"\n"}
                  <Text style={styles.emailHighlight}>{signupEmail}</Text>
                </Text>
              </MotiView>

              {/* Actions */}
              <MotiView
                from={motionFrom.fadeUpLarge}
                animate={{ opacity: 1, translateY: 0 }}
                transition={getTransition({ type: "timing", duration: 300, delay: 400 })}
                style={styles.actionsSection}
              >
                <PrimaryButton label="Open mail app" onPress={handleOpenMail} />

                <SecondaryButton
                  label="Resend email"
                  onPress={handleResend}
                  variant="outline"
                />
              </MotiView>
            </GlassPanel>
          </MotiView>
        </View>

        {/* Footer */}
        <MotiView
          from={motionFrom.fade}
          animate={{ opacity: 1 }}
          transition={getTransition({ type: "timing", duration: 400, delay: 600 })}
          style={styles.footer}
        >
          <SecondaryLink label="Back to sign in" onPress={handleBackToSignin} />
        </MotiView>
      </View>
    </GradientBackground>
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
    maxWidth: 360,
  },
  card: {
    padding: 32,
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
    opacity: 0.12,
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
    textAlign: "center",
    marginTop: 12,
    lineHeight: 22,
  },
  emailHighlight: {
    color: colors.secondary[400],
    fontFamily: "PlusJakartaSans-SemiBold",
  },
  actionsSection: {
    width: "100%",
    marginTop: 28,
    gap: 12,
  },
  footer: {
    alignItems: "center",
    paddingTop: 16,
  },
});



