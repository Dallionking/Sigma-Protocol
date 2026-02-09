import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback, useEffect, useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Award, ChevronRight, Lightbulb } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { GlassPanel } from "@/components/GlassPanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import { ConfettiOverlay } from "@/components/practice";
import { SessionStatsCard } from "@/components/ai";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { useAIStore } from "@/stores/aiStore";
import { colors } from "@/theme/tokens";

export default function SessionSummaryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const { sessionStats, xpEarned, messages, endSession, reset } = useAIStore();

  // Collect corrections from messages
  const corrections = useMemo(() => {
    return messages
      .flatMap((m) => m.corrections ?? [])
      .slice(0, 5); // Show max 5
  }, [messages]);

  // Show confetti for good sessions
  const showConfetti = xpEarned >= 30;

  // End session on mount
  useEffect(() => {
    endSession();
    if (showConfetti) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [endSession, showConfetti]);

  const handleContinue = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    reset();
    router.replace("/practice/ai");
  }, [reset, router]);

  const handleGoToPractice = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    reset();
    router.replace("/practice");
  }, [reset, router]);

  const getMessage = () => {
    if (xpEarned >= 50) return "Outstanding session!";
    if (xpEarned >= 30) return "Great practice!";
    if (xpEarned >= 15) return "Nice work!";
    return "Good start!";
  };

  // Default stats if none available
  const stats = sessionStats ?? {
    messageCount: messages.length,
    voiceDurationSeconds: 0,
    correctionsLearned: corrections.length,
    startTime: Date.now(),
  };

  return (
    <GradientBackground>
      <ConfettiOverlay visible={showConfetti} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 40,
            paddingBottom: insets.bottom + 40,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <MotiView
          from={motionFrom.scaleIn}
          animate={{ opacity: 1, scale: 1 }}
          transition={getTransition()}
          style={styles.headerSection}
        >
          <View style={styles.celebrationIcon}>
            <Award size={48} color={colors.accent[400]} />
          </View>
          <Text style={styles.title}>{getMessage()}</Text>
          <Text style={styles.subtitle}>
            You practiced with AI Tutor and learned something new!
          </Text>
        </MotiView>

        {/* Stats Card */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 100 })}
          style={styles.statsSection}
        >
          <SessionStatsCard stats={stats} xpEarned={xpEarned} />
        </MotiView>

        {/* Corrections Learned */}
        {corrections.length > 0 && (
          <MotiView
            from={motionFrom.fadeUp}
            animate={{ opacity: 1, translateY: 0 }}
            transition={getTransition({ delay: 200 })}
            style={styles.correctionsSection}
          >
            <Text style={styles.sectionTitle}>
              <Lightbulb size={16} color={colors.accent[400]} /> Key Learnings
            </Text>
            <GlassPanel style={styles.correctionsCard}>
              {corrections.map((correction, index) => (
                <View
                  key={index}
                  style={[
                    styles.correctionItem,
                    index < corrections.length - 1 && styles.correctionItemBorder,
                  ]}
                >
                  <View style={styles.correctionRow}>
                    <Text style={styles.correctionOriginal}>
                      {correction.original}
                    </Text>
                    <ChevronRight size={14} color={colors.text.muted} />
                    <Text style={styles.correctionFixed}>
                      {correction.corrected}
                    </Text>
                  </View>
                  <Text style={styles.correctionExplanation}>
                    {correction.explanation}
                  </Text>
                </View>
              ))}
            </GlassPanel>
          </MotiView>
        )}

        {/* Actions */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 300 })}
          style={styles.actionsSection}
        >
          <PrimaryButton
            label="Talk to AI Tutor Again"
            onPress={handleContinue}
          />
          <SecondaryButton
            label="Go to Practice"
            onPress={handleGoToPractice}
            style={styles.secondaryButton}
          />
        </MotiView>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 28,
  },
  celebrationIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(250, 204, 21, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontFamily: "Satoshi-Bold",
    fontSize: 32,
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
  },
  statsSection: {
    marginBottom: 24,
  },
  correctionsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 12,
  },
  correctionsCard: {
    padding: 16,
    borderRadius: 18,
  },
  correctionItem: {
    paddingVertical: 12,
  },
  correctionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.06)",
  },
  correctionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  correctionOriginal: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.error,
    textDecorationLine: "line-through",
  },
  correctionFixed: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
    color: colors.success,
  },
  correctionExplanation: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  actionsSection: {
    marginTop: "auto",
  },
  secondaryButton: {
    marginTop: 12,
  },
});

