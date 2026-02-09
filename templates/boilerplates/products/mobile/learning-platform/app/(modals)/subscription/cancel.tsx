import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { X, Heart, Check, AlertTriangle } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { GlassPanel } from "@/components/GlassPanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { DangerButton } from "@/components/profile";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { CANCELLATION_REASONS, RETENTION_OFFER } from "@/lib/subscription/mockData";
import { useSubscriptionStore } from "@/stores/subscriptionStore";
import { colors } from "@/theme/tokens";

type CancelStep = "reason" | "offer" | "confirm" | "done";

export default function CancelScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const { cancel, isLoading } = useSubscriptionStore();

  const [step, setStep] = useState<CancelStep>("reason");
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const handleReasonSelect = useCallback((reasonId: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedReason(reasonId);
  }, []);

  const handleContinue = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (step === "reason" && selectedReason) {
      setStep("offer");
    } else if (step === "offer") {
      setStep("confirm");
    }
  }, [step, selectedReason]);

  const handleKeepSubscription = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // In real app, would apply the discount
    router.back();
  }, [router]);

  const handleConfirmCancel = useCallback(async () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    const success = await cancel(selectedReason ?? undefined);
    if (success) {
      setStep("done");
    }
  }, [cancel, selectedReason]);

  const handleDone = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.dismissAll();
  }, [router]);

  return (
    <View style={styles.container}>
      <Pressable style={styles.backdrop} onPress={handleClose} />

      <MotiView
        from={{ opacity: 0, translateY: 100 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={getTransition()}
        style={[styles.modal, { paddingBottom: insets.bottom + 20 }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>
            {step === "done" ? "Subscription Cancelled" : "Cancel Subscription"}
          </Text>
          <Pressable onPress={handleClose} style={styles.closeButton}>
            <X size={20} color={colors.text.muted} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Step: Reason */}
          {step === "reason" && (
            <MotiView
              from={motionFrom.fadeUp}
              animate={{ opacity: 1, translateY: 0 }}
              transition={getTransition()}
            >
              <View style={styles.sadSection}>
                <Heart size={32} color={colors.error} />
                <Text style={styles.sadTitle}>We're sad to see you go</Text>
                <Text style={styles.sadText}>
                  Before you leave, please tell us why so we can improve.
                </Text>
              </View>

              <View style={styles.reasonsContainer}>
                {CANCELLATION_REASONS.map((reason) => (
                  <Pressable
                    key={reason.id}
                    onPress={() => handleReasonSelect(reason.id)}
                    style={[
                      styles.reasonOption,
                      selectedReason === reason.id && styles.reasonOptionSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.reasonLabel,
                        selectedReason === reason.id && styles.reasonLabelSelected,
                      ]}
                    >
                      {reason.label}
                    </Text>
                    {selectedReason === reason.id && (
                      <Check size={18} color={colors.secondary[400]} />
                    )}
                  </Pressable>
                ))}
              </View>

              <PrimaryButton
                label="Continue"
                onPress={handleContinue}
                disabled={!selectedReason}
                style={styles.continueButton}
              />
            </MotiView>
          )}

          {/* Step: Offer */}
          {step === "offer" && (
            <MotiView
              from={motionFrom.fadeUp}
              animate={{ opacity: 1, translateY: 0 }}
              transition={getTransition()}
            >
              <GlassPanel style={styles.offerCard}>
                <View style={styles.offerBadge}>
                  <Text style={styles.offerBadgeText}>
                    {RETENTION_OFFER.discount}% OFF
                  </Text>
                </View>
                <Text style={styles.offerTitle}>{RETENTION_OFFER.headline}</Text>
                <Text style={styles.offerDescription}>
                  {RETENTION_OFFER.description}
                </Text>
              </GlassPanel>

              <PrimaryButton
                label={RETENTION_OFFER.cta}
                onPress={handleKeepSubscription}
                style={styles.keepButton}
              />

              <Pressable onPress={handleContinue} style={styles.cancelAnywayLink}>
                <Text style={styles.cancelAnywayText}>
                  No thanks, continue cancelling
                </Text>
              </Pressable>
            </MotiView>
          )}

          {/* Step: Confirm */}
          {step === "confirm" && (
            <MotiView
              from={motionFrom.fadeUp}
              animate={{ opacity: 1, translateY: 0 }}
              transition={getTransition()}
            >
              <GlassPanel style={styles.warningCard}>
                <AlertTriangle size={32} color={colors.accent[400]} />
                <Text style={styles.warningTitle}>Are you sure?</Text>
                <Text style={styles.warningText}>
                  Your subscription will remain active until the end of your current
                  billing period. After that, you'll lose access to:
                </Text>
                <View style={styles.warningList}>
                  <Text style={styles.warningItem}>• Unlimited AI practice</Text>
                  <Text style={styles.warningItem}>• Weekly group calls</Text>
                  <Text style={styles.warningItem}>• VIP community access</Text>
                  <Text style={styles.warningItem}>• All premium features</Text>
                </View>
              </GlassPanel>

              <View style={styles.confirmActions}>
                <PrimaryButton
                  label="Keep My Subscription"
                  onPress={handleKeepSubscription}
                />
                <DangerButton
                  label={isLoading ? "Cancelling..." : "Cancel Subscription"}
                  onPress={handleConfirmCancel}
                  loading={isLoading}
                />
              </View>
            </MotiView>
          )}

          {/* Step: Done */}
          {step === "done" && (
            <MotiView
              from={motionFrom.fadeUp}
              animate={{ opacity: 1, translateY: 0 }}
              transition={getTransition()}
              style={styles.doneSection}
            >
              <View style={styles.doneIconContainer}>
                <Check size={40} color={colors.text.primary} />
              </View>
              <Text style={styles.doneTitle}>Subscription Cancelled</Text>
              <Text style={styles.doneText}>
                Your access will continue until the end of your current billing
                period. We hope to see you again!
              </Text>
              <PrimaryButton
                label="Done"
                onPress={handleDone}
                style={styles.doneButton}
              />
            </MotiView>
          )}
        </ScrollView>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
  },
  modal: {
    backgroundColor: colors.surface.base,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  headerSpacer: {
    width: 32,
  },
  headerTitle: {
    flex: 1,
    fontFamily: "Satoshi-Bold",
    fontSize: 18,
    color: colors.text.primary,
    textAlign: "center",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flexGrow: 0,
  },
  sadSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  sadTitle: {
    fontFamily: "Satoshi-Bold",
    fontSize: 20,
    color: colors.text.primary,
    marginTop: 12,
    marginBottom: 8,
  },
  sadText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.muted,
    textAlign: "center",
  },
  reasonsContainer: {
    gap: 10,
    marginBottom: 24,
  },
  reasonOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  reasonOptionSelected: {
    backgroundColor: "rgba(6, 182, 212, 0.08)",
    borderColor: colors.secondary[500],
  },
  reasonLabel: {
    fontFamily: "PlusJakartaSans",
    fontSize: 15,
    color: colors.text.secondary,
  },
  reasonLabelSelected: {
    fontFamily: "PlusJakartaSans-SemiBold",
    color: colors.text.primary,
  },
  continueButton: {
    marginBottom: 20,
  },
  offerCard: {
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(250, 204, 21, 0.3)",
    backgroundColor: "rgba(250, 204, 21, 0.05)",
  },
  offerBadge: {
    backgroundColor: colors.accent[400],
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 16,
  },
  offerBadgeText: {
    fontFamily: "Satoshi-Bold",
    fontSize: 16,
    color: colors.surface.base,
  },
  offerTitle: {
    fontFamily: "Satoshi-Bold",
    fontSize: 22,
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  offerDescription: {
    fontFamily: "PlusJakartaSans",
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: "center",
  },
  keepButton: {
    marginBottom: 16,
  },
  cancelAnywayLink: {
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 20,
  },
  cancelAnywayText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.muted,
    textDecorationLine: "underline",
  },
  warningCard: {
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 24,
  },
  warningTitle: {
    fontFamily: "Satoshi-Bold",
    fontSize: 20,
    color: colors.text.primary,
    marginTop: 12,
    marginBottom: 8,
  },
  warningText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: 16,
  },
  warningList: {
    alignSelf: "stretch",
    paddingLeft: 20,
  },
  warningItem: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.muted,
    marginBottom: 6,
  },
  confirmActions: {
    gap: 12,
    marginBottom: 20,
  },
  doneSection: {
    alignItems: "center",
    paddingVertical: 20,
  },
  doneIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  doneTitle: {
    fontFamily: "Satoshi-Bold",
    fontSize: 22,
    color: colors.text.primary,
    marginBottom: 12,
  },
  doneText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  doneButton: {
    alignSelf: "stretch",
  },
});

