import AsyncStorage from "@react-native-async-storage/async-storage";
import { MotiView } from "moti";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { CheckCircle, Sparkles } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { DevHubButton } from "@/components/DevHubButton";
import { GlassPanel } from "@/components/GlassPanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import { GOALS, LEVELS, useOnboardingStore } from "@/stores/onboardingStore";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { colors } from "@/theme/tokens";

export default function OnboardingCompleteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);
  const { goal, level, xpEarned } = useOnboardingStore();

  const selectedGoal = GOALS.find((g) => g.id === goal);
  const selectedLevel = LEVELS.find((l) => l.id === level);

  const handleCreateAccount = async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.onboardingComplete, "true");
    router.replace("/signup-email");
  };

  const handleContinueAsGuest = async () => {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.onboardingComplete, "true"],
      [STORAGE_KEYS.hasSession, "true"],
    ]);
    router.replace("/(tabs)/home");
  };

  return (
    <GradientBackground>
      <DevHubButton />

      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + 40,
            paddingBottom: insets.bottom + 32,
          },
        ]}
      >
        {/* Header */}
        <MotiView
          from={motionFrom.scaleIn}
          animate={{ opacity: 1, scale: 1 }}
          transition={getTransition({ delay: 100 })}
          style={styles.headerSection}
        >
          <View style={styles.checkContainer}>
            <View style={styles.checkGlow} />
            <CheckCircle size={48} color={colors.success} />
          </View>
          <Text style={styles.headline}>You're ready!</Text>
          <Text style={styles.subheadline}>
            Your personalized journey awaits
          </Text>
        </MotiView>

        {/* Summary card */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 200 })}
          style={styles.summaryWrapper}
        >
          <View style={styles.summaryGlow} />
          <GlassPanel style={styles.summaryCard}>
            <SummaryRow
              label="Goal"
              value={selectedGoal?.label || "Not set"}
              delay={400}
            />
            <View style={styles.divider} />
            <SummaryRow
              label="Level"
              value={selectedLevel?.label || "Not set"}
              delay={450}
            />
            <View style={styles.divider} />
            <SummaryRow
              label="XP Earned"
              value={`${xpEarned} XP`}
              highlight
              delay={500}
            />
          </GlassPanel>
        </MotiView>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Account benefits hint */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing", duration: 400, delay: 550 }}
          style={styles.benefitsHint}
        >
          <Sparkles size={16} color={colors.accent[400]} />
          <Text style={styles.benefitsText}>
            Create an account to sync progress and save your streak
          </Text>
        </MotiView>

        {/* CTAs */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 450 })}
          style={styles.ctaSection}
        >
          <PrimaryButton
            label="Create free account"
            onPress={handleCreateAccount}
          />
          <SecondaryButton
            label="Continue as guest"
            onPress={handleContinueAsGuest}
            variant="outline"
            style={styles.secondaryButton}
          />
        </MotiView>
      </View>
    </GradientBackground>
  );
}

function SummaryRow({
  label,
  value,
  highlight = false,
  delay,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  delay: number;
}) {
  return (
    <MotiView
      from={{ opacity: 0, translateX: -10 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: "timing", duration: 300, delay }}
      style={styles.summaryRow}
    >
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text
        style={[
          styles.summaryValue,
          highlight && styles.summaryValueHighlight,
        ]}
      >
        {value}
      </Text>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  checkContainer: {
    position: "relative",
    marginBottom: 20,
  },
  checkGlow: {
    position: "absolute",
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 999,
    backgroundColor: colors.success,
    opacity: 0.15,
  },
  headline: {
    fontFamily: "Satoshi-Bold",
    fontSize: 32,
    color: colors.text.primary,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subheadline: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: 8,
  },
  summaryWrapper: {
    position: "relative",
  },
  summaryGlow: {
    position: "absolute",
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 28,
    backgroundColor: colors.secondary[500],
    opacity: 0.06,
  },
  summaryCard: {
    padding: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  summaryLabel: {
    fontFamily: "PlusJakartaSans",
    fontSize: 15,
    color: colors.text.secondary,
  },
  summaryValue: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 15,
    color: colors.text.primary,
  },
  summaryValueHighlight: {
    color: colors.accent[400],
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  spacer: {
    flex: 1,
  },
  benefitsHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    gap: 8,
  },
  benefitsText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.muted,
    textAlign: "center",
  },
  ctaSection: {
    gap: 10,
  },
  secondaryButton: {
    marginTop: 2,
  },
});



