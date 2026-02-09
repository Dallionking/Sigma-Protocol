import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Calendar, ChevronLeft, Clock, ShieldCheck, User } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { format } from "date-fns";

import { GradientBackground } from "@/components/GradientBackground";
import { GlassPanel } from "@/components/GlassPanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TutorAvatar } from "@/components/TutorAvatar";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { useScheduleStore } from "@/stores/scheduleStore";
import { MOCK_TUTOR } from "@/lib/schedule/mockData";
import { colors } from "@/theme/tokens";

export default function BookingConfirmScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const { selectedDate, selectedSlot, bookSlot, isLoading } = useScheduleStore();

  const handleBack = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const handleConfirm = useCallback(async () => {
    if (!selectedSlot) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await bookSlot(selectedSlot, MOCK_TUTOR);
    router.replace("/schedule/success");
  }, [selectedSlot, bookSlot, router]);

  if (!selectedSlot || !selectedDate) {
    return null;
  }

  const startTime = new Date(selectedSlot.startTime);

  return (
    <GradientBackground>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Confirm Session</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.content}>
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition()}
          style={styles.intro}
        >
          <Text style={styles.title}>Ready to book your session?</Text>
          <Text style={styles.subtitle}>Review the details below before confirming.</Text>
        </MotiView>

        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 100 })}
          style={styles.detailsCard}
        >
          <GlassPanel style={styles.panel}>
            {/* Tutor */}
            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <User size={20} color={colors.secondary[400]} />
              </View>
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Tutor</Text>
                <View style={styles.tutorInfo}>
                  <TutorAvatar size={32} />
                  <Text style={styles.detailValue}>{MOCK_TUTOR.name}</Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Date */}
            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <Calendar size={20} color={colors.secondary[400]} />
              </View>
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>{format(new Date(selectedDate), "EEEE, MMM d")}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Time */}
            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <Clock size={20} color={colors.secondary[400]} />
              </View>
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailValue}>{format(startTime, "h:mm a")} (30 min)</Text>
              </View>
            </View>
          </GlassPanel>
        </MotiView>

        <MotiView
          from={motionFrom.fade}
          animate={{ opacity: 1 }}
          transition={getTransition({ delay: 200 })}
          style={styles.trustSection}
        >
          <ShieldCheck size={16} color={colors.success} />
          <Text style={styles.trustText}>
            Cancel up to 24 hours before the session for a full refund.
          </Text>
        </MotiView>

        <View style={styles.spacer} />

        <MotiView
          from={motionFrom.fade}
          animate={{ opacity: 1 }}
          transition={getTransition({ delay: 300 })}
          style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}
        >
          <PrimaryButton
            label={isLoading ? "Booking..." : "Confirm & Book"}
            onPress={handleConfirm}
            loading={isLoading}
          />
        </MotiView>
      </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  intro: {
    marginTop: 20,
    marginBottom: 32,
  },
  title: {
    fontFamily: "Satoshi-Bold",
    fontSize: 24,
    color: colors.text.primary,
    lineHeight: 32,
  },
  subtitle: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 8,
  },
  detailsCard: {
    marginBottom: 20,
  },
  panel: {
    padding: 20,
    borderRadius: 24,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  detailText: {
    flex: 1,
    gap: 4,
  },
  detailLabel: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 16,
    color: colors.text.primary,
  },
  tutorInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    marginHorizontal: 4,
  },
  trustSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 8,
  },
  trustText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.muted,
    flex: 1,
  },
  spacer: {
    flex: 1,
  },
  footer: {
    paddingTop: 20,
  },
});

