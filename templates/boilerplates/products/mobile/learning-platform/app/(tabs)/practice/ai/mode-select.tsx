import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { ModeCard } from "@/components/ai";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { AI_MODES } from "@/lib/ai/mockResponses";
import { useAIStore } from "@/stores/aiStore";
import { colors } from "@/theme/tokens";

export default function ModeSelectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const { startSession } = useAIStore();

  const handleBack = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const handleSelectMode = useCallback(
    (modeId: string) => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Start session with selected mode
      startSession(modeId as any);

      // Navigate to appropriate screen
      if (modeId === "voice") {
        router.push("/practice/ai/voice-talk");
      } else {
        router.push(`/practice/ai/chat-${modeId}`);
      }
    },
    [startSession, router]
  );

  return (
    <GradientBackground>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Choose Mode</Text>
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
        {/* Intro text */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition()}
          style={styles.introSection}
        >
          <Text style={styles.introTitle}>How would you like to practice?</Text>
          <Text style={styles.introSubtitle}>
            Pick a mode that fits your mood — I'll adapt to you!
          </Text>
        </MotiView>

        {/* Mode cards */}
        {AI_MODES.map((mode, index) => (
          <ModeCard
            key={mode.id}
            name={mode.name}
            description={mode.description}
            icon={mode.icon}
            onPress={() => handleSelectMode(mode.id)}
            delay={reduceMotion ? 0 : 100 + index * 60}
          />
        ))}
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
  },
  introSection: {
    marginBottom: 24,
  },
  introTitle: {
    fontFamily: "Satoshi-Bold",
    fontSize: 24,
    color: colors.text.primary,
    marginBottom: 8,
    lineHeight: 32,
  },
  introSubtitle: {
    fontFamily: "PlusJakartaSans",
    fontSize: 15,
    color: colors.text.secondary,
    lineHeight: 22,
  },
});

