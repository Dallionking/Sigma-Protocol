import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, Bell, Calendar, Trophy, Clock } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { GlassPanel } from "@/components/GlassPanel";
import { SettingsToggle, SettingsDivider } from "@/components/profile";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { useProfileStore } from "@/stores/profileStore";
import { colors } from "@/theme/tokens";

export default function NotificationsSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const { notifications, updateNotifications } = useProfileStore();

  const handleBack = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  return (
    <GradientBackground>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
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
        {/* Reminders */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition()}
          style={styles.section}
        >
          <Text style={styles.sectionLabel}>Reminders</Text>
          <GlassPanel style={styles.card}>
            <SettingsToggle
              icon={Bell}
              label="Daily Reminders"
              subtitle="Get reminded to practice daily"
              value={notifications.dailyReminders}
              onValueChange={(v) => updateNotifications({ dailyReminders: v })}
            />
            <SettingsDivider />
            <View style={styles.timeRow}>
              <Clock size={20} color={colors.text.secondary} />
              <Text style={styles.timeLabel}>Reminder Time</Text>
              <Text style={styles.timeValue}>{notifications.reminderTime}</Text>
            </View>
          </GlassPanel>
        </MotiView>

        {/* Updates */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 50 })}
          style={styles.section}
        >
          <Text style={styles.sectionLabel}>Updates</Text>
          <GlassPanel style={styles.card}>
            <SettingsToggle
              icon={Calendar}
              label="Weekly Digest"
              subtitle="Summary of your weekly progress"
              value={notifications.weeklyDigest}
              onValueChange={(v) => updateNotifications({ weeklyDigest: v })}
            />
            <SettingsDivider />
            <SettingsToggle
              icon={Trophy}
              label="Achievement Alerts"
              subtitle="Notify when you earn badges"
              value={notifications.achievementAlerts}
              onValueChange={(v) => updateNotifications({ achievementAlerts: v })}
            />
            <SettingsDivider />
            <SettingsToggle
              label="Session Reminders"
              subtitle="Reminders for upcoming tutor sessions"
              value={notifications.sessionReminders}
              onValueChange={(v) => updateNotifications({ sessionReminders: v })}
            />
          </GlassPanel>
        </MotiView>

        {/* Info */}
        <MotiView
          from={motionFrom.fade}
          animate={{ opacity: 1 }}
          transition={getTransition({ delay: 100 })}
          style={styles.infoSection}
        >
          <Text style={styles.infoText}>
            You can also manage notifications in your device settings.
          </Text>
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
    paddingTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 12,
    color: colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    borderRadius: 20,
    overflow: "hidden",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
  },
  timeLabel: {
    flex: 1,
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 15,
    color: colors.text.primary,
  },
  timeValue: {
    fontFamily: "PlusJakartaSans",
    fontSize: 15,
    color: colors.secondary[400],
  },
  infoSection: {
    paddingHorizontal: 4,
  },
  infoText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.muted,
    textAlign: "center",
  },
});

