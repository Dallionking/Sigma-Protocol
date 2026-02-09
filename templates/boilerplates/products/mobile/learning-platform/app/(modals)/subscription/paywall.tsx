import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { X, RotateCcw } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import {
  TierCard,
  BillingToggle,
  GuaranteeBadge,
} from "@/components/subscription";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { getPaidTiers, TierInfo } from "@/lib/subscription/mockData";
import { useSubscriptionStore, BillingCycle } from "@/stores/subscriptionStore";
import { colors } from "@/theme/tokens";

export default function PaywallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const {
    selectedTier,
    selectedBillingCycle,
    setSelectedTier,
    setSelectedBillingCycle,
    restore,
    isRestoring,
  } = useSubscriptionStore();

  const paidTiers = getPaidTiers();
  const [selectedTierInfo, setSelectedTierInfo] = useState<TierInfo | null>(
    paidTiers.find((t) => t.id === selectedTier) ?? paidTiers[1] // Default to Pro
  );

  const handleClose = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const handleTierSelect = useCallback(
    (tier: TierInfo) => {
      setSelectedTierInfo(tier);
      setSelectedTier(tier.id);
    },
    [setSelectedTier]
  );

  const handleBillingCycleChange = useCallback(
    (cycle: BillingCycle) => {
      setSelectedBillingCycle(cycle);
    },
    [setSelectedBillingCycle]
  );

  const handleContinue = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/subscription/checkout");
  }, [router]);

  const handleCompare = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/subscription/plan-compare");
  }, [router]);

  const handleRestore = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const restored = await restore();
    if (restored) {
      router.replace("/subscription/success");
    }
  }, [restore, router]);

  const essentialTier = paidTiers.find((t) => t.id === "essential")!;
  const proTier = paidTiers.find((t) => t.id === "pro")!;
  const vipTier = paidTiers.find((t) => t.id === "vip")!;

  return (
    <GradientBackground>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={handleClose} style={styles.closeButton}>
          <X size={22} color={colors.text.primary} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition()}
          style={styles.heroSection}
        >
          <Text style={styles.heroTitle}>Unlock your learning potential</Text>
          <Text style={styles.heroSubtitle}>
            Join thousands learning with AI Tutor
          </Text>
        </MotiView>

        {/* Guarantee Badge */}
        <View style={styles.guaranteeSection}>
          <GuaranteeBadge delay={50} />
        </View>

        {/* Billing Toggle */}
        <MotiView
          from={motionFrom.fade}
          animate={{ opacity: 1 }}
          transition={getTransition({ delay: 100 })}
          style={styles.toggleSection}
        >
          <BillingToggle
            value={selectedBillingCycle}
            onValueChange={handleBillingCycleChange}
            savingsPercent={17}
          />
        </MotiView>

        {/* Tier Cards - 2+1 Layout */}
        <View style={styles.tiersSection}>
          <View style={styles.tierRow}>
            <TierCard
              tier={essentialTier}
              billingCycle={selectedBillingCycle}
              isSelected={selectedTierInfo?.id === "essential"}
              onSelect={handleTierSelect}
              delay={150}
              compact
            />
            <TierCard
              tier={proTier}
              billingCycle={selectedBillingCycle}
              isSelected={selectedTierInfo?.id === "pro"}
              onSelect={handleTierSelect}
              delay={200}
              compact
            />
          </View>
          <TierCard
            tier={vipTier}
            billingCycle={selectedBillingCycle}
            isSelected={selectedTierInfo?.id === "vip"}
            onSelect={handleTierSelect}
            delay={250}
          />
        </View>

        {/* CTAs */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 300 })}
          style={styles.ctaSection}
        >
          <PrimaryButton
            label={`Get ${selectedTierInfo?.name ?? "Pro"}`}
            onPress={handleContinue}
          />
          <View style={styles.secondaryActions}>
            <Pressable onPress={handleCompare} style={styles.secondaryLink}>
              <Text style={styles.secondaryLinkText}>Compare plans</Text>
            </Pressable>
            <View style={styles.linkDivider} />
            <Pressable
              onPress={handleRestore}
              style={styles.secondaryLink}
              disabled={isRestoring}
            >
              <RotateCcw
                size={14}
                color={isRestoring ? colors.text.muted : colors.text.secondary}
              />
              <Text
                style={[
                  styles.secondaryLinkText,
                  isRestoring && styles.secondaryLinkDisabled,
                ]}
              >
                {isRestoring ? "Restoring..." : "Restore purchase"}
              </Text>
            </Pressable>
          </View>
        </MotiView>

        {/* Legal */}
        <MotiView
          from={motionFrom.fade}
          animate={{ opacity: 1 }}
          transition={getTransition({ delay: 350 })}
          style={styles.legalSection}
        >
          <Text style={styles.legalText}>
            Cancel anytime. Subscription auto-renews unless cancelled 24 hours before the
            end of the current period.
          </Text>
        </MotiView>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  heroTitle: {
    fontFamily: "Satoshi-Bold",
    fontSize: 28,
    color: colors.text.primary,
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontFamily: "PlusJakartaSans",
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: "center",
  },
  guaranteeSection: {
    marginBottom: 24,
  },
  toggleSection: {
    marginBottom: 24,
  },
  tiersSection: {
    gap: 16,
    marginBottom: 28,
  },
  tierRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  ctaSection: {
    gap: 16,
    marginBottom: 24,
  },
  secondaryActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  secondaryLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
  },
  secondaryLinkText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.secondary,
  },
  secondaryLinkDisabled: {
    color: colors.text.muted,
  },
  linkDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.text.muted,
  },
  legalSection: {
    paddingHorizontal: 20,
  },
  legalText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 11,
    color: colors.text.muted,
    textAlign: "center",
    lineHeight: 16,
  },
});

