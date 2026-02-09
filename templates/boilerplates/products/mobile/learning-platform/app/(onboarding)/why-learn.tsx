import { MotiView } from "moti";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { CheckboxRow } from "@/components/CheckboxRow";
import { DevHubButton } from "@/components/DevHubButton";
import { OnboardingHeader } from "@/components/OnboardingHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { WHY_LEARN_OPTIONS, useOnboardingStore } from "@/stores/onboardingStore";
import { colors } from "@/theme/tokens";

export default function WhyLearnScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { motivation, toggleMotivation, setStep } = useOnboardingStore();

  const handleContinue = () => {
    setStep(3);
    router.push("/fast-win");
  };

  const handleSkip = () => {
    setStep(3);
    router.push("/fast-win");
  };

  return (
    <GradientBackground>
      <DevHubButton />
      <OnboardingHeader
        step={2}
        totalSteps={5}
        showSkip
        onSkip={handleSkip}
      />

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
          <Text style={styles.headline}>Why are you learning?</Text>
          <Text style={styles.subheadline}>
            Select all that apply — or skip this step
          </Text>
        </MotiView>

        {/* Checkbox list */}
        <View style={styles.listContainer}>
          {WHY_LEARN_OPTIONS.map((option, index) => (
            <CheckboxRow
              key={option.id}
              label={option.label}
              checked={motivation.includes(option.id)}
              onToggle={() => toggleMotivation(option.id)}
              delay={200 + index * 50}
            />
          ))}
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Continue button */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400, delay: 400 }}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  headlineSection: {
    marginBottom: 24,
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
  listContainer: {
    gap: 10,
  },
  spacer: {
    flex: 1,
  },
});



