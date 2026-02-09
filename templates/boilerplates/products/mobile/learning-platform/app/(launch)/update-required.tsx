import * as Application from "expo-application";
import * as Linking from "expo-linking";
import { MotiView, AnimatePresence } from "moti";
import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronDown, ShieldCheck } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { DevHubButton } from "@/components/DevHubButton";
import { GlassPanel } from "@/components/GlassPanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors } from "@/theme/tokens";

const APP_STORE_URL = "https://apps.apple.com";

export default function UpdateRequiredScreen() {
  const [expanded, setExpanded] = useState(false);
  const insets = useSafeAreaInsets();

  const current = useMemo(() => {
    const v = Application.nativeApplicationVersion ?? "0.0.0";
    const build = Application.nativeBuildVersion;
    return build ? `${v} (${build})` : v;
  }, []);

  const required = "1.0.1";

  return (
    <GradientBackground dim>
      <DevHubButton />
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 24,
          },
        ]}
      >
        <MotiView
          from={{ opacity: 0, translateY: 30, scale: 0.95 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          transition={{ type: "timing", duration: 260, delay: 100 }}
          style={styles.cardWrapper}
        >
          {/* Glow effect */}
          <View style={styles.glowOuter} />

          <GlassPanel style={styles.card} intensity={40}>
            {/* Icon with glow */}
            <MotiView
              from={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "timing", duration: 260, delay: 250 }}
              style={styles.iconContainer}
            >
              <View style={styles.iconGlow} />
              <View style={styles.iconCircle}>
                <ShieldCheck size={28} color={colors.secondary[300]} />
              </View>
            </MotiView>

            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 400, delay: 350 }}
            >
              <Text style={styles.title}>Update required</Text>
              <Text style={styles.subtitle}>
                We improved lessons, audio, and stability.
              </Text>
            </MotiView>

            <MotiView
              from={{ opacity: 0, translateY: 16 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 400, delay: 450 }}
              style={styles.versionCard}
            >
              <View style={styles.versionRow}>
                <Text style={styles.versionLabel}>Current</Text>
                <Text style={styles.versionValue}>{current}</Text>
              </View>
              <View style={styles.versionDivider} />
              <View style={styles.versionRow}>
                <Text style={styles.versionLabel}>Required</Text>
                <Text style={[styles.versionValue, styles.versionRequired]}>{required}</Text>
              </View>
            </MotiView>

            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 260, delay: 550 }}
              style={styles.buttonWrapper}
            >
              <PrimaryButton label="Update now" onPress={() => Linking.openURL(APP_STORE_URL)} />
            </MotiView>

            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: "timing", duration: 300, delay: 700 }}
            >
              <Pressable
                onPress={() => setExpanded((v) => !v)}
                style={styles.expandButton}
                accessibilityRole="button"
              >
                <Text style={styles.expandText}>What's new</Text>
                <ChevronDown
                  size={16}
                  color={colors.text.secondary}
                  style={{ marginLeft: 6, transform: [{ rotate: expanded ? "180deg" : "0deg" }] }}
                />
              </Pressable>

              <AnimatePresence>
                {expanded && (
                  <MotiView
                    from={{ opacity: 0, translateY: -8 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    exit={{ opacity: 0, translateY: -8 }}
                    transition={{ type: "timing", duration: 240 }}
                    style={styles.changelogCard}
                  >
                    <Text style={styles.changelogText}>
                      • Faster cold starts{"\n"}
                      • Cleaner audio playback{"\n"}
                      • New practice flows{"\n"}
                      • Bug fixes & polish
                    </Text>
                  </MotiView>
                )}
              </AnimatePresence>
            </MotiView>
          </GlassPanel>
        </MotiView>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  cardWrapper: {
    position: "relative",
    width: "100%",
    maxWidth: 420,
  },
  glowOuter: {
    position: "absolute",
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 30,
    backgroundColor: "rgba(6, 182, 212, 0.06)",
    shadowColor: colors.secondary[400],
    shadowOpacity: 0.2,
    shadowRadius: 35,
    shadowOffset: { width: 0, height: 8 },
  },
  card: {
    padding: 28,
    borderRadius: 24,
    alignItems: "center",
  },
  iconContainer: {
    position: "relative",
    marginBottom: 20,
  },
  iconGlow: {
    position: "absolute",
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 999,
    backgroundColor: colors.secondary[400],
    opacity: 0.15,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.25)",
  },
  title: {
    fontFamily: "Satoshi-Bold",
    fontSize: 26,
    color: colors.text.primary,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: "PlusJakartaSans",
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
  versionCard: {
    width: "100%",
    marginTop: 20,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 14,
  },
  versionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  versionDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    marginVertical: 10,
  },
  versionLabel: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.muted,
  },
  versionValue: {
    fontFamily: "SpaceMono",
    fontSize: 14,
    color: colors.text.primary,
  },
  versionRequired: {
    color: colors.primary[400],
  },
  buttonWrapper: {
    width: "100%",
    marginTop: 24,
  },
  expandButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  expandText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.secondary,
    textDecorationLine: "underline",
  },
  changelogCard: {
    width: "100%",
    marginTop: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 14,
  },
  changelogText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 22,
  },
});
