import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, Check, Volume2 } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { GlassPanel } from "@/components/GlassPanel";
import { SettingsToggle, SettingsDivider } from "@/components/profile";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { useProfileStore } from "@/stores/profileStore";
import { LANGUAGES, VOICE_SPEEDS } from "@/lib/profile/mockData";
import { colors } from "@/theme/tokens";

export default function LanguageSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const { language, updateLanguage } = useProfileStore();

  const handleBack = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const handleLanguageSelect = useCallback(
    (code: string) => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      updateLanguage({ appLanguage: code });
    },
    [updateLanguage]
  );

  const handleSpeedSelect = useCallback(
    (speed: "slow" | "normal" | "fast") => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      updateLanguage({ voiceSpeed: speed });
    },
    [updateLanguage]
  );

  return (
    <GradientBackground>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Language & Audio</Text>
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
        {/* App Language */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition()}
          style={styles.section}
        >
          <Text style={styles.sectionLabel}>App Language</Text>
          <GlassPanel style={styles.card}>
            {LANGUAGES.map((lang, index) => (
              <React.Fragment key={lang.code}>
                {index > 0 && <SettingsDivider />}
                <Pressable
                  onPress={() => handleLanguageSelect(lang.code)}
                  style={styles.optionRow}
                >
                  <Text style={styles.optionLabel}>{lang.name}</Text>
                  {language.appLanguage === lang.code && (
                    <Check size={20} color={colors.secondary[400]} />
                  )}
                </Pressable>
              </React.Fragment>
            ))}
          </GlassPanel>
        </MotiView>

        {/* Voice Speed */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 50 })}
          style={styles.section}
        >
          <Text style={styles.sectionLabel}>Voice Speed</Text>
          <GlassPanel style={styles.card}>
            {VOICE_SPEEDS.map((speed, index) => (
              <React.Fragment key={speed.value}>
                {index > 0 && <SettingsDivider />}
                <Pressable
                  onPress={() => handleSpeedSelect(speed.value)}
                  style={styles.optionRow}
                >
                  <View style={styles.optionContent}>
                    <Text style={styles.optionLabel}>{speed.label}</Text>
                    <Text style={styles.optionSubtitle}>{speed.description}</Text>
                  </View>
                  {language.voiceSpeed === speed.value && (
                    <Check size={20} color={colors.secondary[400]} />
                  )}
                </Pressable>
              </React.Fragment>
            ))}
          </GlassPanel>
        </MotiView>

        {/* Audio Settings */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 100 })}
          style={styles.section}
        >
          <Text style={styles.sectionLabel}>Audio</Text>
          <GlassPanel style={styles.card}>
            <SettingsToggle
              icon={Volume2}
              label="Autoplay Audio"
              subtitle="Automatically play audio in lessons"
              value={language.autoplayAudio}
              onValueChange={(v) => updateLanguage({ autoplayAudio: v })}
            />
          </GlassPanel>
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
  },
  optionContent: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    flex: 1,
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 15,
    color: colors.text.primary,
  },
  optionSubtitle: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
  },
});

