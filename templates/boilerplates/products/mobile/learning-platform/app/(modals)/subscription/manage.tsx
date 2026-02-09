import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Calendar,
  RefreshCw,
  ArrowUpCircle,
  XCircle,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { format } from "date-fns";

import { GradientBackground } from "@/components/GradientBackground";
import { GlassPanel } from "@/components/GlassPanel";
import { TierBadge } from "@/components/subscription";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { getTierById, getPrice } from "@/lib/subscription/mockData";
import { useSubscriptionStore, getCurrentTier } from "@/stores/subscriptionStore";
import { colors } from "@/theme/tokens";

export default function ManageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const { subscription } = useSubscriptionStore();
  const currentTier = getCurrentTier(subscription);
  const tierInfo = getTierById(currentTier);

  const handleBack = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const handleUpgrade = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/subscription/paywall");
  }, [router]);

  const handleCancel = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/subscription/cancel");
  }, [router]);

  const handleUpdatePayment = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Would open payment update flow
  }, []);

  const handleChangeBilling = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Would open billing cycle change flow
  }, []);

  // If no subscription, show upgrade prompt
  if (!subscription || currentTier === "free") {
    return (
      <GradientBackground>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <ChevronLeft size={24} color={colors.text.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>Subscription</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.emptyContainer}>
          <GlassPanel style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No Active Subscription</Text>
            <Text style={styles.emptyText}>
              Upgrade to unlock unlimited AI practice, weekly group calls, and more.
            </Text>
            <Pressable onPress={handleUpgrade} style={styles.upgradeButton}>
              <ArrowUpCircle size={20} color={colors.secondary[400]} />
              <Text style={styles.upgradeButtonText}>View Plans</Text>
            </Pressable>
          </GlassPanel>
        </View>
      </GradientBackground>
    );
  }

  const price = tierInfo ? getPrice(tierInfo, subscription.billingCycle) : 0;
  const renewDate = subscription.expiresAt
    ? format(new Date(subscription.expiresAt), "MMM d, yyyy")
    : "N/A";

  return (
    <GradientBackground>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Subscription</Text>
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
        {/* Current Plan Card */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition()}
        >
          <GlassPanel style={styles.planCard}>
            <View style={styles.planHeader}>
              <View style={styles.planInfo}>
                <Text style={styles.planLabel}>Current Plan</Text>
                <Text style={styles.planName}>{tierInfo?.name}</Text>
              </View>
              {tierInfo?.isRecommended && <TierBadge type="recommended" />}
            </View>
            <View style={styles.planDivider} />
            <View style={styles.planDetails}>
              <View style={styles.planDetailRow}>
                <Text style={styles.planDetailLabel}>Price</Text>
                <Text style={styles.planDetailValue}>
                  ${price}/{subscription.billingCycle === "monthly" ? "mo" : "yr"}
                </Text>
              </View>
              <View style={styles.planDetailRow}>
                <Text style={styles.planDetailLabel}>Billing Cycle</Text>
                <Text style={styles.planDetailValue}>
                  {subscription.billingCycle === "monthly" ? "Monthly" : "Annual"}
                </Text>
              </View>
              <View style={styles.planDetailRow}>
                <Text style={styles.planDetailLabel}>Status</Text>
                <View style={styles.statusBadge}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>
                    {subscription.autoRenew ? "Active" : "Cancelling"}
                  </Text>
                </View>
              </View>
            </View>
          </GlassPanel>
        </MotiView>

        {/* Billing Info */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 100 })}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Billing</Text>
          <GlassPanel style={styles.billingCard}>
            <View style={styles.billingRow}>
              <Calendar size={18} color={colors.text.secondary} />
              <View style={styles.billingInfo}>
                <Text style={styles.billingLabel}>
                  {subscription.autoRenew ? "Next billing date" : "Access ends"}
                </Text>
                <Text style={styles.billingValue}>{renewDate}</Text>
              </View>
            </View>
            <View style={styles.billingDivider} />
            <View style={styles.billingRow}>
              <CreditCard size={18} color={colors.text.secondary} />
              <View style={styles.billingInfo}>
                <Text style={styles.billingLabel}>Payment method</Text>
                <Text style={styles.billingValue}>
                  {subscription.paymentMethod?.type === "apple"
                    ? "Apple Pay"
                    : subscription.paymentMethod?.type === "google"
                      ? "Google Pay"
                      : "Card"}
                </Text>
              </View>
            </View>
          </GlassPanel>
        </MotiView>

        {/* Actions */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 150 })}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Actions</Text>
          <GlassPanel style={styles.actionsCard}>
            {currentTier !== "vip" && (
              <>
                <ActionRow
                  icon={<ArrowUpCircle size={18} color={colors.secondary[400]} />}
                  label="Upgrade Plan"
                  onPress={handleUpgrade}
                />
                <View style={styles.actionDivider} />
              </>
            )}
            <ActionRow
              icon={<RefreshCw size={18} color={colors.text.secondary} />}
              label="Change Billing Cycle"
              onPress={handleChangeBilling}
            />
            <View style={styles.actionDivider} />
            <ActionRow
              icon={<CreditCard size={18} color={colors.text.secondary} />}
              label="Update Payment Method"
              onPress={handleUpdatePayment}
            />
            {subscription.autoRenew && (
              <>
                <View style={styles.actionDivider} />
                <ActionRow
                  icon={<XCircle size={18} color={colors.error} />}
                  label="Cancel Subscription"
                  onPress={handleCancel}
                  danger
                />
              </>
            )}
          </GlassPanel>
        </MotiView>
      </ScrollView>
    </GradientBackground>
  );
}

function ActionRow({
  icon,
  label,
  onPress,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={styles.actionRow}>
      {icon}
      <Text style={[styles.actionLabel, danger && styles.actionLabelDanger]}>
        {label}
      </Text>
      <ChevronRight size={18} color={colors.text.muted} />
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyCard: {
    padding: 32,
    borderRadius: 24,
    alignItems: "center",
  },
  emptyTitle: {
    fontFamily: "Satoshi-Bold",
    fontSize: 20,
    color: colors.text.primary,
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.muted,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  upgradeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  upgradeButtonText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 15,
    color: colors.secondary[400],
  },
  planCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  planInfo: {},
  planLabel: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
    marginBottom: 4,
  },
  planName: {
    fontFamily: "Satoshi-Bold",
    fontSize: 28,
    color: colors.text.primary,
  },
  planDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginBottom: 16,
  },
  planDetails: {
    gap: 12,
  },
  planDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  planDetailLabel: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.muted,
  },
  planDetailValue: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
    color: colors.text.primary,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  statusText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
    color: colors.success,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 12,
    color: colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  billingCard: {
    borderRadius: 16,
    overflow: "hidden",
  },
  billingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  billingInfo: {
    flex: 1,
  },
  billingLabel: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
    marginBottom: 2,
  },
  billingValue: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 15,
    color: colors.text.primary,
  },
  billingDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    marginHorizontal: 16,
  },
  actionsCard: {
    borderRadius: 16,
    overflow: "hidden",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  actionLabel: {
    flex: 1,
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 15,
    color: colors.text.primary,
  },
  actionLabelDanger: {
    color: colors.error,
  },
  actionDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    marginHorizontal: 16,
  },
});

