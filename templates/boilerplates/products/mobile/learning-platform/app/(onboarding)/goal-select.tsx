import { MotiView } from "moti";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { DevHubButton } from "@/components/DevHubButton";
import { OnboardingHeader } from "@/components/OnboardingHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SelectableCard } from "@/components/SelectableCard";
import { GOALS, useOnboardingStore } from "@/stores/onboardingStore";
import { colors } from "@/theme/tokens";

export default function GoalSelectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { goal, setGoal, setStep } = useOnboardingStore();

  const handleContinue = () => {
    setStep(1);
    router.push("/level-select");
  };

  return (
    <GradientBackground>
      <DevHubButton />
      <OnboardingHeader step={0} totalSteps={5} />

      <View
        style={[
          styles.container,
          { paddingBottom: insets.bottom + 24 },
        ]}
      >
        {/* Headline */}
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400, delay: 100 }}
          style={styles.headlineSection}
        >
          <Text style={styles.headline}>What's your goal?</Text>
          <Text style={styles.subheadline}>
            This helps us personalize your journey
          </Text>
        </MotiView>

        {/* Goal grid */}
        <View style={styles.gridContainer}>
          <View style={styles.gridRow}>
            {GOALS.slice(0, 2).map((g, index) => (
              <SelectableCard
                key={g.id}
                icon={g.icon}
                label={g.label}
                selected={goal === g.id}
                onSelect={() => setGoal(g.id)}
                delay={200 + index * 80}
                variant="grid"
              />
            ))}
          </View>
          <View style={styles.gridRow}>
            {GOALS.slice(2, 4).map((g, index) => (
              <SelectableCard
                key={g.id}
                icon={g.icon}
                label={g.label}
                selected={goal === g.id}
                onSelect={() => setGoal(g.id)}
                delay={360 + index * 80}
                variant="grid"
              />
            ))}
          </View>
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Continue button */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: goal ? 1 : 0.5, translateY: 0 }}
          transition={{ type: "timing", duration: 300 }}
        >
          <PrimaryButton
            label="Continue"
            onPress={handleContinue}
            disabled={!goal}
          />
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
  headlineSection: {
    marginBottom: 28,
  },
  headline: {
    fontFamily: "Satoshi-Bold",
    fontSize: 28,
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  subheadline: {
    fontFamily: "PlusJakartaSans",
    fontSize: 15,
    color: colors.text.secondary,
    marginTop: 6,
  },
  gridContainer: {
    gap: 12,
  },
  gridRow: {
    flexDirection: "row",
    gap: 12,
  },
  spacer: {
    flex: 1,
  },
});



