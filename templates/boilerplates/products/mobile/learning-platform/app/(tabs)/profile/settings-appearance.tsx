import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, Check, Moon, Smartphone, Zap, Type } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { GlassPanel } from "@/components/GlassPanel";
import { SettingsToggle, SettingsDivider } from "@/components/profile";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { useProfileStore } from "@/stores/profileStore";
import { colors } from "@/theme/tokens";

const THEMES = [
  { id: "dark" as const, label: "Dark", icon: Moon, description: "Always use dark theme" },
  { id: "system" as const, label: "System", icon: Smartphone, description: "Follow device settings" },
];

const FONT_SIZES = [
  { id: "normal" as const, label: "Normal" },
  { id: "large" as const, label: "Large" },
];

export default function AppearanceSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const { appearance, updateAppearance } = useProfileStore();

  const handleBack = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const handleThemeSelect = useCallback(
    (theme: "dark" | "system") => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      updateAppearance({ theme });
    },
    [updateAppearance]
  );

  const handleFontSizeSelect = useCallback(
    (fontSize: "normal" | "large") => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      updateAppearance({ fontSize });
    },
    [updateAppearance]
  );

  return (
    <GradientBackground>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Appearance</Text>
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
        {/* Theme */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition()}
          style={styles.section}
        >
          <Text style={styles.sectionLabel}>Theme</Text>
          <GlassPanel style={styles.card}>
            {THEMES.map((theme, index) => {
              const Icon = theme.icon;
              const isSelected = appearance.theme === theme.id;
              return (
                <React.Fragment key={theme.id}>
                  {index > 0 && <SettingsDivider />}
                  <Pressable
                    onPress={() => handleThemeSelect(theme.id)}
                    style={styles.optionRow}
                  >
                    <View
                      style={[
                        styles.iconContainer,
                        isSelected && styles.iconContainerActive,
                      ]}
                    >
                      <Icon
                        size={18}
                        color={isSelected ? colors.secondary[400] : colors.text.muted}
                      />
                    </View>
                    <View style={styles.optionContent}>
                      <Text style={styles.optionLabel}>{theme.label}</Text>
                      <Text style={styles.optionSubtitle}>{theme.description}</Text>
                    </View>
                    {isSelected && <Check size={20} color={colors.secondary[400]} />}
                  </Pressable>
                </React.Fragment>
              );
            })}
          </GlassPanel>
        </MotiView>

        {/* Motion */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 50 })}
          style={styles.section}
        >
          <Text style={styles.sectionLabel}>Motion</Text>
          <GlassPanel style={styles.card}>
            <SettingsToggle
              icon={Zap}
              label="Reduce Motion"
              subtitle="Minimize animations throughout the app"
              value={appearance.reducedMotion}
              onValueChange={(v) => updateAppearance({ reducedMotion: v })}
            />
          </GlassPanel>
        </MotiView>

        {/* Font Size */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 100 })}
          style={styles.section}
        >
          <Text style={styles.sectionLabel}>Font Size</Text>
          <View style={styles.fontSizeRow}>
            {FONT_SIZES.map((size) => {
              const isSelected = appearance.fontSize === size.id;
              return (
                <Pressable
                  key={size.id}
                  onPress={() => handleFontSizeSelect(size.id)}
                  style={[styles.fontSizeChip, isSelected && styles.fontSizeChipActive]}
                >
                  <Type
                    size={size.id === "large" ? 22 : 18}
                    color={isSelected ? colors.secondary[400] : colors.text.muted}
                  />
                  <Text
                    style={[
                      styles.fontSizeLabel,
                      isSelected && styles.fontSizeLabelActive,
                    ]}
                  >
                    {size.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
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
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainerActive: {
    backgroundColor: "rgba(6, 182, 212, 0.12)",
  },
  optionContent: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 15,
    color: colors.text.primary,
  },
  optionSubtitle: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
  },
  fontSizeRow: {
    flexDirection: "row",
    gap: 12,
  },
  fontSizeChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    paddingVertical: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  fontSizeChipActive: {
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    borderColor: colors.secondary[500],
  },
  fontSizeLabel: {
    fontFamily: "PlusJakartaSans",
    fontSize: 15,
    color: colors.text.muted,
  },
  fontSizeLabelActive: {
    fontFamily: "PlusJakartaSans-SemiBold",
    color: colors.secondary[400],
  },
});

