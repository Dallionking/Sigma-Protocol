import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, Eye, BarChart3, Download, Check } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { GlassPanel } from "@/components/GlassPanel";
import { SettingsToggle, SettingsDivider, SettingsRow } from "@/components/profile";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { useProfileStore, profileApi } from "@/stores/profileStore";
import { colors } from "@/theme/tokens";

export default function PrivacySettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const { privacy, updatePrivacy } = useProfileStore();
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleBack = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const handleExportData = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsExporting(true);

    try {
      const result = await profileApi.exportData();
      if (result.success) {
        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 3000);
      }
    } finally {
      setIsExporting(false);
    }
  }, []);

  return (
    <GradientBackground>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Privacy</Text>
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
        {/* Visibility */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition()}
          style={styles.section}
        >
          <Text style={styles.sectionLabel}>Visibility</Text>
          <GlassPanel style={styles.card}>
            <SettingsToggle
              icon={Eye}
              label="Show Profile"
              subtitle="Allow others to see your profile"
              value={privacy.showProfile}
              onValueChange={(v) => updatePrivacy({ showProfile: v })}
            />
            <SettingsDivider />
            <SettingsToggle
              icon={BarChart3}
              label="Share Progress"
              subtitle="Display on community leaderboard"
              value={privacy.showProgress}
              onValueChange={(v) => updatePrivacy({ showProgress: v })}
            />
          </GlassPanel>
        </MotiView>

        {/* Data */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 50 })}
          style={styles.section}
        >
          <Text style={styles.sectionLabel}>Your Data</Text>
          <GlassPanel style={styles.card}>
            <Pressable onPress={handleExportData} style={styles.exportRow}>
              <View style={styles.exportIcon}>
                {exportSuccess ? (
                  <Check size={20} color={colors.success} />
                ) : (
                  <Download size={20} color={colors.secondary[400]} />
                )}
              </View>
              <View style={styles.exportContent}>
                <Text style={styles.exportLabel}>
                  {isExporting
                    ? "Preparing export..."
                    : exportSuccess
                      ? "Export ready!"
                      : "Export Your Data"}
                </Text>
                <Text style={styles.exportSubtitle}>
                  Download all your learning data
                </Text>
              </View>
            </Pressable>
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
            Your data is encrypted and securely stored. We never sell your personal
            information to third parties.
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
  exportRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  exportIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  exportContent: {
    flex: 1,
    gap: 2,
  },
  exportLabel: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 15,
    color: colors.text.primary,
  },
  exportSubtitle: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
  },
  infoSection: {
    paddingHorizontal: 4,
  },
  infoText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.muted,
    textAlign: "center",
    lineHeight: 20,
  },
});

