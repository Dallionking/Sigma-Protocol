import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, Image } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, Mail, Key, Link2 } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { GlassPanel } from "@/components/GlassPanel";
import {
  SettingsSection,
  SettingsDivider,
  SettingsRow,
} from "@/components/profile";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { useProfileStore } from "@/stores/profileStore";
import { MOCK_USER_PROFILE } from "@/lib/profile/mockData";
import { colors } from "@/theme/tokens";

export default function AccountSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const { profile } = useProfileStore();
  const displayProfile = profile ?? MOCK_USER_PROFILE;

  const handleBack = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const navigateTo = useCallback(
    (route: string) => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push(route as any);
    },
    [router]
  );

  return (
    <GradientBackground>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Account</Text>
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
        {/* Current Email */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition()}
          style={styles.section}
        >
          <Text style={styles.sectionLabel}>Current Email</Text>
          <GlassPanel style={styles.emailCard}>
            <Mail size={20} color={colors.secondary[400]} />
            <Text style={styles.emailText}>{displayProfile.email}</Text>
          </GlassPanel>
        </MotiView>

        {/* Account Actions */}
        <SettingsSection title="Security" delay={50}>
          <SettingsRow
            icon={Mail}
            label="Change Email"
            subtitle="Update your email address"
            onPress={() => navigateTo("/profile/settings-change-email")}
          />
          <SettingsDivider />
          <SettingsRow
            icon={Key}
            label="Change Password"
            subtitle="Update your password"
            onPress={() => navigateTo("/profile/settings-change-password")}
          />
        </SettingsSection>

        {/* Linked Accounts */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 100 })}
          style={styles.section}
        >
          <Text style={styles.sectionLabel}>Linked Accounts</Text>
          <GlassPanel style={styles.linkedCard}>
            <LinkedAccount
              name="Google"
              connected={false}
              icon="https://www.google.com/favicon.ico"
            />
            <View style={styles.divider} />
            <LinkedAccount
              name="Apple"
              connected={false}
              icon="https://www.apple.com/favicon.ico"
            />
          </GlassPanel>
          <Text style={styles.linkedHint}>
            Link accounts for quick sign-in options
          </Text>
        </MotiView>
      </ScrollView>
    </GradientBackground>
  );
}

function LinkedAccount({
  name,
  connected,
  icon,
}: {
  name: string;
  connected: boolean;
  icon: string;
}) {
  const handlePress = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Would handle linking
  }, []);

  return (
    <Pressable onPress={handlePress} style={styles.linkedRow}>
      <View style={styles.linkedIcon}>
        <Link2 size={18} color={colors.text.muted} />
      </View>
      <Text style={styles.linkedName}>{name}</Text>
      <Text style={[styles.linkedStatus, connected && styles.linkedStatusConnected]}>
        {connected ? "Connected" : "Not connected"}
      </Text>
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
  emailCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 16,
  },
  emailText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 15,
    color: colors.text.primary,
  },
  linkedCard: {
    borderRadius: 20,
    overflow: "hidden",
  },
  linkedRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  linkedIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  linkedName: {
    flex: 1,
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 15,
    color: colors.text.primary,
  },
  linkedStatus: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.muted,
  },
  linkedStatusConnected: {
    color: colors.success,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    marginHorizontal: 16,
  },
  linkedHint: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 10,
    marginLeft: 4,
  },
});

