import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Lock, Sparkles } from "lucide-react-native";

import { GradientBackground } from "@/components/GradientBackground";
import { DevHubButton } from "@/components/DevHubButton";
import { GlassPanel } from "@/components/GlassPanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import { LearnHeader } from "@/components/learn/LearnHeader";
import { getLessonById, MOCK_LESSONS } from "@/lib/learn/mockContent";
import { useLearnStore } from "@/stores/learnStore";
import { colors } from "@/theme/tokens";

export default function LearnLessonLockedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ lessonId?: string }>();
  const activeTier = useLearnStore((s) => s.activeTier);

  const lessonId = useMemo(() => {
    const raw = params.lessonId;
    if (typeof raw === "string") return raw;
    return MOCK_LESSONS[0]?.id ?? null;
  }, [params.lessonId]);

  const lesson = useMemo(() => {
    return lessonId ? getLessonById(lessonId) : null;
  }, [lessonId]);

  return (
    <GradientBackground>
      <DevHubButton />

      <View style={styles.container}>
        <LearnHeader title="Locked" subtitle={lesson?.title ?? undefined} />

        <View style={styles.content}>
          <GlassPanel style={styles.card} glow glowColor={colors.primary[500]}>
            <View style={styles.iconRow}>
              <View style={styles.lockIcon}>
                <Lock size={22} color={colors.text.primary} />
              </View>
              <Text style={styles.headline}>This lesson is locked</Text>
            </View>

            <Text style={styles.body}>
              {lesson?.tier_required && lesson.tier_required !== "free"
                ? `This lesson requires ${lesson.tier_required.toUpperCase()} access.`
                : "Finish the previous lesson to unlock this one."}
            </Text>

            <View style={styles.pillRow}>
              <View style={styles.pill}>
                <Sparkles size={16} color={colors.accent[400]} />
                <Text style={styles.pillText}>Your tier: {activeTier.toUpperCase()}</Text>
              </View>
              {lesson?.tier_required ? (
                <View style={styles.pill}>
                  <Text style={styles.pillTextMuted}>
                    Required: {lesson.tier_required.toUpperCase()}
                  </Text>
                </View>
              ) : null}
            </View>

            <View style={styles.buttonStack}>
              <PrimaryButton label="Upgrade" onPress={() => router.replace("/profile")} />
              <SecondaryButton
                label="Back to lessons"
                variant="outline"
                onPress={() => router.back()}
              />
            </View>
          </GlassPanel>
        </View>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 180,
  },
  card: {
    padding: 18,
    borderRadius: 22,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  lockIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(99, 102, 241, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.10)",
  },
  headline: {
    fontFamily: "Satoshi-Bold",
    fontSize: 20,
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  body: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  pillText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 12,
    color: colors.text.primary,
  },
  pillTextMuted: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 12,
    color: colors.text.muted,
  },
  buttonStack: {
    marginTop: 16,
    gap: 10,
  },
});



