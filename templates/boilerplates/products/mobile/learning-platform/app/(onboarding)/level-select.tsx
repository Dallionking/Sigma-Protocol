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
import { LEVELS, useOnboardingStore } from "@/stores/onboardingStore";
import { colors } from "@/theme/tokens";

export default function LevelSelectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { level, setLevel, setStep } = useOnboardingStore();

  const handleContinue = () => {
    setStep(2);
    router.push("/why-learn");
  };

  return (
    <GradientBackground>
      <DevHubButton />
      <OnboardingHeader step={1} totalSteps={5} />

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
          <Text style={styles.headline}>What's your level?</Text>
          <Text style={styles.subheadline}>
            No worries — we'll meet you where you are
          </Text>
        </MotiView>

        {/* Level list */}
        <View style={styles.listContainer}>
          {LEVELS.map((l, index) => (
            <SelectableCard
              key={l.id}
              icon={l.icon}
              label={l.label}
              subtitle={l.subtitle}
              selected={level === l.id}
              onSelect={() => setLevel(l.id)}
              delay={200 + index * 60}
              variant="list"
            />
          ))}
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Continue button */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: level ? 1 : 0.5, translateY: 0 }}
          transition={{ type: "timing", duration: 300 }}
        >
          <PrimaryButton
            label="Continue"
            onPress={handleContinue}
            disabled={!level}
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



