import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Calendar, History, Plus, Sparkles } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { DevHubButton } from "@/components/DevHubButton";
import { GlassPanel } from "@/components/GlassPanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SessionCard } from "@/components/schedule/SessionCard";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { useScheduleStore, Session } from "@/stores/scheduleStore";
import { colors } from "@/theme/tokens";

export default function ScheduleHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const { sessions } = useScheduleStore();

  const upcomingSessions = sessions.filter((s) => s.status === "upcoming");
  const pastSessions = sessions.filter((s) => s.status === "completed" || s.status === "cancelled");
  const nextSession = upcomingSessions[0];

  const handleBook = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/schedule/calendar");
  }, [router]);

  const handleSeeAllUpcoming = useCallback(() => {
    router.push("/schedule/upcoming");
  }, [router]);

  const handleSeeHistory = useCallback(() => {
    router.push("/schedule/past-sessions");
  }, [router]);

  const handleSessionPress = useCallback((session: Session) => {
    router.push(`/schedule/session-detail?id=${session.id}`);
  }, [router]);

  return (
    <GradientBackground>
      <DevHubButton />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 16,
            paddingBottom: 180,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition()}
          style={styles.header}
        >
          <View>
            <Text style={styles.title}>Schedule</Text>
            <Text style={styles.subtitle}>Book and manage your sessions</Text>
          </View>
          <View style={styles.headerIcon}>
            <Calendar size={28} color={colors.primary[400]} />
          </View>
        </MotiView>

        {/* Primary CTA */}
        <MotiView
          from={motionFrom.scaleIn}
          animate={{ opacity: 1, scale: 1 }}
          transition={getTransition({ delay: 100 })}
          style={styles.bookSection}
        >
          <GlassPanel style={styles.bookCard}>
            <View style={styles.bookContent}>
              <View style={styles.bookIcon}>
                <Plus size={28} color={colors.secondary[400]} />
              </View>
              <View style={styles.bookText}>
                <Text style={styles.bookTitle}>Book a Session</Text>
                <Text style={styles.bookSubtitle}>
                  Practice 1:1 with AI Tutor or a native speaker
                </Text>
              </View>
            </View>
            <PrimaryButton
              label="Choose a Time"
              onPress={handleBook}
              style={styles.bookButton}
            />
          </GlassPanel>
        </MotiView>

        {/* Next Session */}
        {nextSession && (
          <MotiView
            from={motionFrom.fadeUp}
            animate={{ opacity: 1, translateY: 0 }}
            transition={getTransition({ delay: 200 })}
            style={styles.section}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Next Session</Text>
              <Text style={styles.seeAll} onPress={handleSeeAllUpcoming}>
                See all
              </Text>
            </View>
            <SessionCard session={nextSession} onPress={handleSessionPress} />
          </MotiView>
        )}

        {/* Quick Links */}
        <MotiView
          from={motionFrom.fade}
          animate={{ opacity: 1 }}
          transition={getTransition({ delay: 300 })}
          style={styles.quickLinks}
        >
          <GlassPanel style={styles.quickLinkCard}>
            <View style={styles.quickLinkIcon}>
              <History size={20} color={colors.accent[400]} />
            </View>
            <View style={styles.quickLinkText}>
              <Text style={styles.quickLinkTitle}>Session History</Text>
              <Text style={styles.quickLinkSubtitle}>{pastSessions.length} past sessions</Text>
            </View>
            <PrimaryButton
              label="View"
              onPress={handleSeeHistory}
              variant="secondary"
              style={styles.quickLinkButton}
            />
          </GlassPanel>
        </MotiView>

        {/* Empty State Tips */}
        {!nextSession && (
          <MotiView
            from={motionFrom.fade}
            animate={{ opacity: 1 }}
            transition={getTransition({ delay: 400 })}
            style={styles.tipSection}
          >
            <GlassPanel style={styles.tipCard}>
              <Sparkles size={20} color={colors.accent[400]} style={styles.tipIcon} />
              <Text style={styles.tipTitle}>Why book a live session?</Text>
              <Text style={styles.tipText}>
                Live practice is the fastest way to build fluency. AI Tutor will help you overcome the "fear" of speaking!
              </Text>
            </GlassPanel>
          </MotiView>
        )}
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  title: {
    fontFamily: "Satoshi-Bold",
    fontSize: 32,
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 4,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(99, 102, 241, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  bookSection: {
    marginBottom: 28,
  },
  bookCard: {
    padding: 20,
    borderRadius: 20,
  },
  bookContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  bookIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  bookText: {
    flex: 1,
  },
  bookTitle: {
    fontFamily: "Satoshi-Bold",
    fontSize: 20,
    color: colors.text.primary,
    marginBottom: 4,
  },
  bookSubtitle: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.secondary,
  },
  bookButton: {
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 16,
    color: colors.text.primary,
  },
  seeAll: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.secondary[400],
  },
  quickLinks: {
    marginBottom: 24,
  },
  quickLinkCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 18,
  },
  quickLinkIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(250, 204, 21, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  quickLinkText: {
    flex: 1,
  },
  quickLinkTitle: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 15,
    color: colors.text.primary,
  },
  quickLinkSubtitle: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 2,
  },
  quickLinkButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 0,
  },
  tipSection: {
    marginTop: 8,
  },
  tipCard: {
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
  },
  tipIcon: {
    marginBottom: 16,
  },
  tipTitle: {
    fontFamily: "Satoshi-Bold",
    fontSize: 18,
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  tipText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
  },
});

