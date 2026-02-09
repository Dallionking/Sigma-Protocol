import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { CheckCircle, Sparkles, Star, Zap } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { GlassPanel } from "@/components/GlassPanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { getTierById } from "@/lib/subscription/mockData";
import { useSubscriptionStore } from "@/stores/subscriptionStore";
import { colors } from "@/theme/tokens";

export default function SuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const { subscription } = useSubscriptionStore();
  const tierInfo = getTierById(subscription?.tier ?? "pro");

  // Haptic celebration on mount
  useEffect(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const handleStartLearning = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.dismissAll();
    router.replace("/(tabs)/home");
  }, [router]);

  const featureHighlights = tierInfo?.featureHighlights.slice(0, 4) ?? [];

  return (
    <GradientBackground>
      <View
        style={[
          styles.container,
          { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 40 },
        ]}
      >
        {/* Confetti/Sparkle decoration */}
        {!reduceMotion && (
          <>
            <MotiView
              from={{ opacity: 0, translateY: -20, rotate: "-15deg" }}
              animate={{ opacity: 1, translateY: 0, rotate: "0deg" }}
              transition={{ type: "timing", duration: 600, delay: 200 }}
              style={[styles.sparkle, styles.sparkle1]}
            >
              <Sparkles size={24} color={colors.accent[400]} />
            </MotiView>
            <MotiView
              from={{ opacity: 0, translateY: 20, rotate: "15deg" }}
              animate={{ opacity: 1, translateY: 0, rotate: "0deg" }}
              transition={{ type: "timing", duration: 600, delay: 300 }}
              style={[styles.sparkle, styles.sparkle2]}
            >
              <Star size={20} color={colors.secondary[400]} />
            </MotiView>
            <MotiView
              from={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "timing", duration: 500, delay: 400 }}
              style={[styles.sparkle, styles.sparkle3]}
            >
              <Zap size={18} color={colors.primary[400]} />
            </MotiView>
          </>
        )}

        {/* Success Icon */}
        <MotiView
          from={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 400 }}
          style={styles.iconContainer}
        >
          <View style={styles.iconCircle}>
            <CheckCircle size={56} color={colors.success} />
          </View>
        </MotiView>

        {/* Welcome Message */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 200 })}
          style={styles.messageSection}
        >
          <Text style={styles.title}>Welcome to {tierInfo?.name}!</Text>
          <Text style={styles.subtitle}>
            You've unlocked the full Learning Confidence System
          </Text>
        </MotiView>

        {/* Feature Highlights */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 300 })}
        >
          <GlassPanel style={styles.featuresCard}>
            <Text style={styles.featuresTitle}>Your new superpowers</Text>
            {featureHighlights.map((feature, index) => (
              <MotiView
                key={index}
                from={{ opacity: 0, translateX: -10 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: "timing", duration: 300, delay: 400 + index * 80 }}
                style={styles.featureRow}
              >
                <CheckCircle size={18} color={colors.secondary[400]} />
                <Text style={styles.featureText}>{feature}</Text>
              </MotiView>
            ))}
          </GlassPanel>
        </MotiView>

        {/* CTA */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 500 })}
          style={styles.ctaSection}
        >
          <PrimaryButton
            label="Start Learning"
            onPress={handleStartLearning}
          />
        </MotiView>

        {/* Encouragement */}
        <MotiView
          from={motionFrom.fade}
          animate={{ opacity: 1 }}
          transition={getTransition({ delay: 600 })}
          style={styles.encouragementSection}
        >
          <Text style={styles.encouragementText}>
            Remember: you have our 90-day confidence guarantee.
            {"\n"}We believe in you!
          </Text>
        </MotiView>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  sparkle: {
    position: "absolute",
  },
  sparkle1: {
    top: 120,
    left: 40,
  },
  sparkle2: {
    top: 100,
    right: 50,
  },
  sparkle3: {
    top: 180,
    right: 80,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  messageSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontFamily: "Satoshi-Bold",
    fontSize: 28,
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
  },
  featuresCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 32,
  },
  featuresTitle: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
    color: colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 16,
    textAlign: "center",
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
  },
  featureText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 15,
    color: colors.text.primary,
    flex: 1,
  },
  ctaSection: {
    marginBottom: 24,
  },
  encouragementSection: {
    alignItems: "center",
  },
  encouragementText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.muted,
    textAlign: "center",
    lineHeight: 20,
  },
});

