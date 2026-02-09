import * as Linking from "expo-linking";
import { MotiView } from "moti";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Wrench } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { DevHubButton } from "@/components/DevHubButton";
import { GlassPanel } from "@/components/GlassPanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors } from "@/theme/tokens";

const STATUS_URL = "https://status.example.com";

export default function MaintenanceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
          {/* Amber glow for maintenance */}
          <View style={styles.glowOuter} />

          <GlassPanel style={styles.card} intensity={40}>
            {/* Wrench icon with glow */}
            <MotiView
              from={{ opacity: 0, scale: 0.8, rotate: "-15deg" }}
              animate={{ opacity: 1, scale: 1, rotate: "0deg" }}
              transition={{ type: "timing", duration: 260, delay: 250 }}
              style={styles.iconContainer}
            >
              <View style={styles.iconGlow} />
              <View style={styles.iconCircle}>
                <Wrench size={28} color={colors.accent[400]} />
              </View>
            </MotiView>

            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 400, delay: 350 }}
            >
              <Text style={styles.title}>Be right back</Text>
              <Text style={styles.subtitle}>
                AI Tutor is tuning the speakers.
              </Text>
            </MotiView>

            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: "timing", duration: 400, delay: 500 }}
              style={styles.reassurance}
            >
              <View style={styles.reassuranceDot} />
              <Text style={styles.reassuranceText}>Your progress is saved</Text>
            </MotiView>

            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 260, delay: 600 }}
              style={styles.buttonWrapper}
            >
              <PrimaryButton label="Retry" onPress={() => router.replace("/splash")} />
            </MotiView>

            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: "timing", duration: 300, delay: 750 }}
            >
              <Pressable
                onPress={() => Linking.openURL(STATUS_URL)}
                style={styles.linkButton}
                accessibilityRole="button"
              >
                <Text style={styles.linkText}>View status</Text>
              </Pressable>
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
    maxWidth: 400,
  },
  glowOuter: {
    position: "absolute",
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 30,
    backgroundColor: "rgba(234, 179, 8, 0.05)",
    shadowColor: colors.accent[500],
    shadowOpacity: 0.18,
    shadowRadius: 35,
    shadowOffset: { width: 0, height: 8 },
  },
  card: {
    padding: 32,
    borderRadius: 24,
    alignItems: "center",
  },
  iconContainer: {
    position: "relative",
    marginBottom: 24,
  },
  iconGlow: {
    position: "absolute",
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 999,
    backgroundColor: colors.accent[500],
    opacity: 0.12,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(234, 179, 8, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(234, 179, 8, 0.2)",
  },
  title: {
    fontFamily: "Satoshi-Bold",
    fontSize: 28,
    color: colors.text.primary,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 24,
  },
  reassurance: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.15)",
  },
  reassuranceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: 10,
  },
  reassuranceText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 13,
    color: colors.success,
    letterSpacing: 0.2,
  },
  buttonWrapper: {
    width: "100%",
    marginTop: 28,
  },
  linkButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  linkText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.secondary,
    textDecorationLine: "underline",
  },
});
