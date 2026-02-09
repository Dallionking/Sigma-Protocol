import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { PrimaryButton } from "@/components/PrimaryButton";
import { FeatureTable, BillingToggle, GuaranteeBadge } from "@/components/subscription";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { getTierById } from "@/lib/subscription/mockData";
import { useSubscriptionStore } from "@/stores/subscriptionStore";
import { colors } from "@/theme/tokens";

export default function PlanCompareScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const {
    selectedTier,
    selectedBillingCycle,
    setSelectedBillingCycle,
  } = useSubscriptionStore();

  const currentTierInfo = getTierById(selectedTier);

  const handleBack = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const handleContinue = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/subscription/checkout");
  }, [router]);

  return (
    <GradientBackground>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Compare Plans</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Billing Toggle */}
        <MotiView
          from={motionFrom.fade}
          animate={{ opacity: 1 }}
          transition={getTransition()}
          style={styles.toggleSection}
        >
          <BillingToggle
            value={selectedBillingCycle}
            onValueChange={setSelectedBillingCycle}
            savingsPercent={17}
          />
        </MotiView>

        {/* Feature Table */}
        <FeatureTable
          selectedTier={selectedTier}
          billingCycle={selectedBillingCycle}
          delay={100}
        />

        {/* Guarantee */}
        <View style={styles.guaranteeSection}>
          <GuaranteeBadge compact delay={200} />
        </View>
      </ScrollView>

      {/* Fixed Bottom CTA */}
      <MotiView
        from={motionFrom.fadeUp}
        animate={{ opacity: 1, translateY: 0 }}
        transition={getTransition({ delay: 250 })}
        style={[styles.bottomCTA, { paddingBottom: insets.bottom + 20 }]}
      >
        <View style={styles.ctaInfo}>
          <Text style={styles.ctaTierName}>{currentTierInfo?.name}</Text>
          <Text style={styles.ctaPrice}>
            ${selectedBillingCycle === "monthly"
              ? currentTierInfo?.pricing.monthly
              : currentTierInfo?.pricing.annual}
            <Text style={styles.ctaPeriod}>
              /{selectedBillingCycle === "monthly" ? "mo" : "yr"}
            </Text>
          </Text>
        </View>
        <PrimaryButton
          label="Continue"
          onPress={handleContinue}
          style={styles.ctaButton}
        />
      </MotiView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "Satoshi-Bold",
    fontSize: 18,
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  toggleSection: {
    marginBottom: 24,
  },
  guaranteeSection: {
    marginTop: 24,
  },
  bottomCTA: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface.base,
    paddingTop: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
  },
  ctaInfo: {
    flex: 1,
  },
  ctaTierName: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  ctaPrice: {
    fontFamily: "Satoshi-Bold",
    fontSize: 22,
    color: colors.text.primary,
  },
  ctaPeriod: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.muted,
  },
  ctaButton: {
    flex: 1,
    maxWidth: 140,
  },
});

