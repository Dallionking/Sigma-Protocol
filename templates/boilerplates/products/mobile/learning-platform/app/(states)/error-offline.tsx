import { MotiView } from "moti";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { WifiOff } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { DevHubButton } from "@/components/DevHubButton";
import { GlassPanel } from "@/components/GlassPanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import { colors } from "@/theme/tokens";

export default function ErrorOfflineScreen() {
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
          {/* Muted glow for offline state */}
          <View style={styles.glowOuter} />

          <GlassPanel style={styles.card} intensity={40}>
            {/* WiFi off icon with subtle glow */}
            <MotiView
              from={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "timing", duration: 260, delay: 250 }}
              style={styles.iconContainer}
            >
              <View style={styles.iconGlow} />
              <View style={styles.iconCircle}>
                <WifiOff size={28} color={colors.text.secondary} />
              </View>
            </MotiView>

            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 400, delay: 350 }}
            >
              <Text style={styles.title}>You're offline</Text>
              <Text style={styles.subtitle}>
                No network right now.{"\n"}Your progress is safe.
              </Text>
            </MotiView>

            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: "timing", duration: 400, delay: 500 }}
              style={styles.hint}
            >
              <Text style={styles.hintText}>
                Try again when you're back online
              </Text>
            </MotiView>

            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 260, delay: 600 }}
              style={styles.buttonWrapper}
            >
              <PrimaryButton label="Try again" onPress={() => router.replace("/splash")} />
              <SecondaryButton
                label="Go back"
                onPress={() => router.back()}
                style={styles.secondaryButton}
              />
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
    maxWidth: 380,
  },
  glowOuter: {
    position: "absolute",
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 30,
    backgroundColor: "rgba(148, 163, 184, 0.04)",
    shadowColor: colors.text.muted,
    shadowOpacity: 0.12,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 6 },
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
    backgroundColor: colors.text.muted,
    opacity: 0.08,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(100, 116, 139, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(100, 116, 139, 0.15)",
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
    marginTop: 10,
    lineHeight: 24,
  },
  hint: {
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  hintText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.muted,
    letterSpacing: 0.2,
  },
  buttonWrapper: {
    width: "100%",
    marginTop: 28,
    gap: 12,
  },
  secondaryButton: {
    marginTop: 4,
  },
});

