import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Calendar, ChevronLeft, Clock, MessageSquare, Video, XCircle } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { format } from "date-fns";

import { GradientBackground } from "@/components/GradientBackground";
import { GlassPanel } from "@/components/GlassPanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import { TutorAvatar } from "@/components/TutorAvatar";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { useScheduleStore } from "@/stores/scheduleStore";
import { colors } from "@/theme/tokens";

export default function SessionDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const { sessions, cancelSession } = useScheduleStore();
  const session = sessions.find((s) => s.id === params.id);

  const handleBack = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const handleJoinCall = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/schedule/video-room");
  }, [router]);

  const handleCancel = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Cancel Session",
      "Are you sure you want to cancel this session?",
      [
        { text: "No, keep it", style: "cancel" },
        { 
          text: "Yes, cancel", 
          style: "destructive",
          onPress: () => {
            if (session) {
              cancelSession(session.id);
              router.back();
            }
          }
        },
      ]
    );
  }, [session, cancelSession, router]);

  if (!session) {
    return (
      <GradientBackground>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Session not found.</Text>
          <PrimaryButton label="Go Back" onPress={handleBack} />
        </View>
      </GradientBackground>
    );
  }

  const sessionDate = new Date(session.date);
  const isUpcoming = session.status === "upcoming";

  return (
    <GradientBackground>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Session Detail</Text>
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
        {/* Tutor Hero */}
        <MotiView
          from={motionFrom.scaleIn}
          animate={{ opacity: 1, scale: 1 }}
          transition={getTransition()}
          style={styles.hero}
        >
          {session.tutor.avatar === "tutor" ? (
            <TutorAvatar size={100} />
          ) : (
            <View style={styles.avatarPlaceholder} />
          )}
          <Text style={styles.tutorName}>{session.tutor.name}</Text>
          <Text style={styles.tutorBio}>{session.tutor.bio}</Text>
        </MotiView>

        {/* Info Card */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 100 })}
          style={styles.infoSection}
        >
          <GlassPanel style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.iconWrapper}>
                <Calendar size={20} color={colors.secondary[400]} />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoValue}>{format(sessionDate, "EEEE, MMMM do")}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.iconWrapper}>
                <Clock size={20} color={colors.secondary[400]} />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Time</Text>
                <Text style={styles.infoValue}>
                  {format(sessionDate, "h:mm a")} ({session.durationMinutes} minutes)
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.iconWrapper}>
                <MessageSquare size={20} color={colors.secondary[400]} />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Topic</Text>
                <Text style={styles.infoValue}>Conversational practice and feedback</Text>
              </View>
            </View>
          </GlassPanel>
        </MotiView>

        {/* Action Buttons */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 200 })}
          style={styles.actions}
        >
          {isUpcoming && (
            <>
              <PrimaryButton
                label="Join Call"
                onPress={handleJoinCall}
                style={styles.mainAction}
              />
              <View style={styles.secondaryActions}>
                <SecondaryButton
                  label="Cancel Session"
                  onPress={handleCancel}
                  style={styles.cancelAction}
                />
              </View>
            </>
          )}
          
          {session.status === "completed" && (
            <GlassPanel style={styles.completedCard}>
              <Text style={styles.completedTitle}>Session Completed</Text>
              <Text style={styles.completedText}>
                Great job on this session! Check your profile for notes and XP earned.
              </Text>
            </GlassPanel>
          )}

          {session.status === "cancelled" && (
            <GlassPanel style={styles.cancelledCard}>
              <Text style={styles.cancelledTitle}>Session Cancelled</Text>
              <Text style={styles.cancelledText}>
                This session has been cancelled. You can book a new one from the Schedule home.
              </Text>
            </GlassPanel>
          )}
        </MotiView>
      </ScrollView>
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
    paddingTop: 20,
  },
  hero: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  tutorName: {
    fontFamily: "Satoshi-Bold",
    fontSize: 24,
    color: colors.text.primary,
    marginTop: 16,
  },
  tutorBio: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 20,
  },
  infoSection: {
    marginBottom: 32,
  },
  infoCard: {
    padding: 20,
    borderRadius: 24,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 14,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: {
    flex: 1,
    gap: 4,
  },
  infoLabel: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 16,
    color: colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    marginHorizontal: 4,
  },
  actions: {
    gap: 12,
  },
  mainAction: {
    marginBottom: 8,
  },
  secondaryActions: {
    alignItems: "center",
  },
  cancelAction: {
    width: "100%",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  errorText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 20,
  },
  completedCard: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
  },
  completedTitle: {
    fontFamily: "Satoshi-Bold",
    fontSize: 18,
    color: colors.success,
    marginBottom: 8,
  },
  completedText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  cancelledCard: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  cancelledTitle: {
    fontFamily: "Satoshi-Bold",
    fontSize: 18,
    color: colors.error,
    marginBottom: 8,
  },
  cancelledText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});

