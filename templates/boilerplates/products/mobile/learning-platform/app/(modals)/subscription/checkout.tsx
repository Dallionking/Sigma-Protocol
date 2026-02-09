import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, Platform } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, Apple, CreditCard, Lock } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { GlassPanel } from "@/components/GlassPanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import {
  PriceDisplay,
  GuaranteeBadge,
  ValueStackItem,
  ValueStackSummary,
} from "@/components/subscription";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import {
  getTierById,
  getBonusesForTier,
  getTotalBonusValue,
  getPrice,
} from "@/lib/subscription/mockData";
import { useSubscriptionStore } from "@/stores/subscriptionStore";
import { colors } from "@/theme/tokens";

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const { selectedTier, selectedBillingCycle, subscribe, isLoading } =
    useSubscriptionStore();

  const [paymentMethod, setPaymentMethod] = useState<"apple" | "google" | "card">(
    Platform.OS === "ios" ? "apple" : "google"
  );

  const tierInfo = getTierById(selectedTier);
  const price = tierInfo ? getPrice(tierInfo, selectedBillingCycle) : 0;
  const bonuses = getBonusesForTier(selectedTier);
  const totalBonusValue = getTotalBonusValue(selectedTier);

  // Add core app value
  const coreAppValue = selectedTier === "vip" ? 2400 : selectedTier === "pro" ? 1200 : 500;
  const totalValue = totalBonusValue + coreAppValue;

  const handleBack = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const handleSubscribe = useCallback(async () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const success = await subscribe(selectedTier, selectedBillingCycle);
    if (success) {
      router.replace("/subscription/success");
    }
  }, [subscribe, selectedTier, selectedBillingCycle, router]);

  return (
    <GradientBackground>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Order Summary */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition()}
        >
          <GlassPanel style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTier}>{tierInfo?.name}</Text>
              <Text style={styles.summaryBilling}>
                {selectedBillingCycle === "monthly" ? "Monthly" : "Annual"} Plan
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryPrice}>
              <PriceDisplay
                price={price}
                cycle={selectedBillingCycle}
                size="large"
              />
            </View>
            {selectedBillingCycle === "annual" && tierInfo && (
              <Text style={styles.savingsNote}>
                That's just ${tierInfo.pricing.annualMonthly.toFixed(2)}/month - save{" "}
                {tierInfo.pricing.savingsPercent}%
              </Text>
            )}
          </GlassPanel>
        </MotiView>

        {/* Value Stack */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 100 })}
          style={styles.valueSection}
        >
          <Text style={styles.sectionTitle}>What's Included</Text>
          {bonuses.slice(0, 5).map((bonus, index) => (
            <ValueStackItem key={bonus.id} bonus={bonus} delay={150 + index * 30} />
          ))}
          <ValueStackSummary
            totalValue={totalValue}
            yourPrice={price}
            delay={300}
          />
        </MotiView>

        {/* Payment Method */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 350 })}
          style={styles.paymentSection}
        >
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <GlassPanel style={styles.paymentCard}>
            {Platform.OS === "ios" && (
              <PaymentOption
                id="apple"
                label="Apple Pay"
                icon={<Apple size={20} color={colors.text.primary} />}
                isSelected={paymentMethod === "apple"}
                onSelect={() => setPaymentMethod("apple")}
              />
            )}
            {Platform.OS === "android" && (
              <PaymentOption
                id="google"
                label="Google Pay"
                icon={<CreditCard size={20} color={colors.text.primary} />}
                isSelected={paymentMethod === "google"}
                onSelect={() => setPaymentMethod("google")}
              />
            )}
            <View style={styles.paymentDivider} />
            <PaymentOption
              id="card"
              label="Credit / Debit Card"
              icon={<CreditCard size={20} color={colors.text.primary} />}
              isSelected={paymentMethod === "card"}
              onSelect={() => setPaymentMethod("card")}
            />
          </GlassPanel>
        </MotiView>

        {/* Guarantee Reminder */}
        <View style={styles.guaranteeSection}>
          <GuaranteeBadge compact delay={400} />
        </View>

        {/* Subscribe Button */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 450 })}
          style={styles.subscribeSection}
        >
          <PrimaryButton
            label={isLoading ? "Processing..." : `Subscribe - $${price}/${selectedBillingCycle === "monthly" ? "mo" : "yr"}`}
            onPress={handleSubscribe}
            loading={isLoading}
          />
          <View style={styles.secureNote}>
            <Lock size={14} color={colors.text.muted} />
            <Text style={styles.secureText}>Secure payment</Text>
          </View>
        </MotiView>

        {/* Legal */}
        <MotiView
          from={motionFrom.fade}
          animate={{ opacity: 1 }}
          transition={getTransition({ delay: 500 })}
          style={styles.legalSection}
        >
          <Text style={styles.legalText}>
            By subscribing, you agree to our Terms of Service and Privacy Policy.
            Subscription auto-renews unless cancelled at least 24 hours before the end
            of the current period. You can manage your subscription in Settings.
          </Text>
        </MotiView>
      </ScrollView>
    </GradientBackground>
  );
}

function PaymentOption({
  id,
  label,
  icon,
  isSelected,
  onSelect,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <Pressable
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSelect();
      }}
      style={[styles.paymentOption, isSelected && styles.paymentOptionSelected]}
    >
      {icon}
      <Text style={styles.paymentLabel}>{label}</Text>
      <View
        style={[styles.paymentRadio, isSelected && styles.paymentRadioSelected]}
      >
        {isSelected && <View style={styles.paymentRadioInner} />}
      </View>
    </Pressable>
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
  summaryCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
  },
  summaryHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  summaryTier: {
    fontFamily: "Satoshi-Bold",
    fontSize: 24,
    color: colors.text.primary,
    marginBottom: 4,
  },
  summaryBilling: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.muted,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginBottom: 16,
  },
  summaryPrice: {
    alignItems: "center",
  },
  savingsNote: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.accent[400],
    textAlign: "center",
    marginTop: 12,
  },
  valueSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
    color: colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  paymentSection: {
    marginBottom: 24,
  },
  paymentCard: {
    borderRadius: 16,
    overflow: "hidden",
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  paymentOptionSelected: {
    backgroundColor: "rgba(6, 182, 212, 0.06)",
  },
  paymentLabel: {
    flex: 1,
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 15,
    color: colors.text.primary,
  },
  paymentRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.text.muted,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentRadioSelected: {
    borderColor: colors.secondary[400],
  },
  paymentRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.secondary[400],
  },
  paymentDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    marginHorizontal: 16,
  },
  guaranteeSection: {
    marginBottom: 24,
  },
  subscribeSection: {
    gap: 12,
    marginBottom: 20,
  },
  secureNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  secureText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
  },
  legalSection: {
    paddingHorizontal: 8,
  },
  legalText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 11,
    color: colors.text.muted,
    textAlign: "center",
    lineHeight: 16,
  },
});

