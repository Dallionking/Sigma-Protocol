import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { SessionCard } from "@/components/schedule/SessionCard";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { useScheduleStore, Session } from "@/stores/scheduleStore";
import { colors } from "@/theme/tokens";

export default function UpcomingSessionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const { sessions } = useScheduleStore();
  const upcomingSessions = sessions.filter((s) => s.status === "upcoming");

  const handleBack = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const handleSessionPress = useCallback((session: Session) => {
    router.push(`/schedule/session-detail?id=${session.id}`);
  }, [router]);

  return (
    <GradientBackground>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Upcoming Sessions</Text>
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
        {upcomingSessions.length === 0 ? (
          <MotiView
            from={motionFrom.fade}
            animate={{ opacity: 1 }}
            transition={getTransition()}
            style={styles.emptyState}
          >
            <Text style={styles.emptyText}>No upcoming sessions.</Text>
          </MotiView>
        ) : (
          upcomingSessions.map((session, index) => (
            <MotiView
              key={session.id}
              from={motionFrom.fadeUp}
              animate={{ opacity: 1, translateY: 0 }}
              transition={getTransition({ delay: index * 50 })}
            >
              <SessionCard session={session} onPress={handleSessionPress} />
            </MotiView>
          ))
        )}
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
    paddingTop: 8,
  },
  emptyState: {
    paddingTop: 100,
    alignItems: "center",
  },
  emptyText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: colors.text.muted,
  },
});

