import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  User,
  Bell,
  Shield,
  Globe,
  Palette,
  HelpCircle,
  MessageCircle,
  Trash2,
  CreditCard,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import {
  SettingsSection,
  SettingsDivider,
  SettingsRow,
  DangerButton,
} from "@/components/profile";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { colors } from "@/theme/tokens";

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

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
        <Text style={styles.headerTitle}>Settings</Text>
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
        {/* Account Section */}
        <SettingsSection title="Account" delay={0}>
          <SettingsRow
            icon={User}
            label="Account"
            subtitle="Email, password, linked accounts"
            onPress={() => navigateTo("/profile/settings-account")}
          />
          <SettingsDivider />
          <SettingsRow
            icon={CreditCard}
            label="Subscription"
            subtitle="Manage your plan"
            onPress={() => router.push("/(modals)/subscription/manage")}
          />
        </SettingsSection>

        {/* Preferences Section */}
        <SettingsSection title="Preferences" delay={50}>
          <SettingsRow
            icon={Bell}
            label="Notifications"
            subtitle="Reminders and alerts"
            onPress={() => navigateTo("/profile/settings-notifications")}
          />
          <SettingsDivider />
          <SettingsRow
            icon={Shield}
            label="Privacy"
            subtitle="Profile visibility, data sharing"
            onPress={() => navigateTo("/profile/settings-privacy")}
          />
          <SettingsDivider />
          <SettingsRow
            icon={Globe}
            label="Language & Audio"
            subtitle="App language, voice speed"
            onPress={() => navigateTo("/profile/settings-language")}
          />
          <SettingsDivider />
          <SettingsRow
            icon={Palette}
            label="Appearance"
            subtitle="Theme, motion, font size"
            onPress={() => navigateTo("/profile/settings-appearance")}
          />
        </SettingsSection>

        {/* Support Section */}
        <SettingsSection title="Support" delay={100}>
          <SettingsRow
            icon={HelpCircle}
            label="Help Center"
            subtitle="FAQs and tutorials"
            onPress={() => navigateTo("/profile/settings-help")}
          />
          <SettingsDivider />
          <SettingsRow
            icon={MessageCircle}
            label="Contact Us"
            subtitle="Get help from our team"
            onPress={() => navigateTo("/profile/settings-contact")}
          />
        </SettingsSection>

        {/* Danger Zone */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 150 })}
          style={styles.dangerSection}
        >
          <Text style={styles.dangerLabel}>Danger Zone</Text>
          <DangerButton
            icon={Trash2}
            label="Delete Account"
            onPress={() => navigateTo("/profile/settings-delete-account")}
          />
        </MotiView>

        {/* App Version */}
        <MotiView
          from={motionFrom.fade}
          animate={{ opacity: 1 }}
          transition={getTransition({ delay: 200 })}
          style={styles.versionSection}
        >
          <Text style={styles.versionText}>Learning Platform v1.0.0</Text>
          <Text style={styles.versionSubtext}>Made with love</Text>
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
  dangerSection: {
    marginBottom: 32,
  },
  dangerLabel: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 12,
    color: colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  versionSection: {
    alignItems: "center",
    paddingVertical: 20,
  },
  versionText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.muted,
    marginBottom: 4,
  },
  versionSubtext: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
    opacity: 0.7,
  },
});

