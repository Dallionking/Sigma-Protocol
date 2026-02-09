import { MotiView } from "moti";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { DevHubButton } from "@/components/DevHubButton";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import { TutorAvatar } from "@/components/TutorAvatar";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { colors } from "@/theme/tokens";

export default function OnboardWelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

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
        {/* AI Tutor Avatar with breathing animation */}
        <MotiView
          from={motionFrom.scaleIn}
          animate={{ opacity: 1, scale: 1 }}
          transition={getTransition({ delay: 100 })}
          style={styles.avatarSection}
        >
          <TutorAvatar size={140} />
        </MotiView>

        {/* Welcome text */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 200 })}
          style={styles.textSection}
        >
          <Text style={styles.greeting}>Hey there! I'm AI Tutor.</Text>
          <Text style={styles.tagline}>
            Let's get you learning{"\n"}in 90 days.
          </Text>
        </MotiView>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* CTAs */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 300 })}
          style={styles.ctaSection}
        >
          <PrimaryButton
            label="Start Learning"
            onPress={() => router.push("/goal-select")}
          />

          <MotiView
            from={motionFrom.fade}
            animate={{ opacity: 1 }}
            transition={getTransition({ delay: 450 })}
          >
            <SecondaryButton
              label="I already have an account"
              onPress={() => router.push("/signin-credentials")}
              style={styles.secondaryButton}
            />
          </MotiView>
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
  avatarSection: {
    alignItems: "center",
    marginTop: 20,
  },
  textSection: {
    alignItems: "center",
    marginTop: 32,
  },
  greeting: {
    fontFamily: "Satoshi-Bold",
    fontSize: 32,
    color: colors.text.primary,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  tagline: {
    fontFamily: "PlusJakartaSans",
    fontSize: 18,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 26,
  },
  spacer: {
    flex: 1,
  },
  ctaSection: {
    gap: 8,
  },
  secondaryButton: {
    marginTop: 4,
  },
});
