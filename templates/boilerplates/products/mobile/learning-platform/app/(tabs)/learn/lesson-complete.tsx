import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback, useEffect, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { PartyPopper, Sparkles, Zap } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { DevHubButton } from "@/components/DevHubButton";
import { GlassPanel } from "@/components/GlassPanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import { LearnHeader } from "@/components/learn/LearnHeader";
import { getLessonById, getLessonsByCategoryId, MOCK_LESSONS } from "@/lib/learn/mockContent";
import { useLearnStore } from "@/stores/learnStore";
import { colors } from "@/theme/tokens";

export default function LearnLessonCompleteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ lessonId?: string }>();

  const completeLesson = useLearnStore((s) => s.completeLesson);
  const xpEarned = useLearnStore((s) => s.xpEarned);

  const lessonId = useMemo(() => {
    const raw = params.lessonId;
    if (typeof raw === "string") return raw;
    return MOCK_LESSONS[0]?.id ?? null;
  }, [params.lessonId]);

  const lesson = useMemo(() => {
    return lessonId ? getLessonById(lessonId) : null;
  }, [lessonId]);

  const nextLessonId = useMemo(() => {
    if (!lesson?.category_id) return null;
    const list = getLessonsByCategoryId(lesson.category_id);
    const idx = list.findIndex((l) => l.id === lesson.id);
    if (idx === -1) return null;
    return list[idx + 1]?.id ?? null;
  }, [lesson]);

  useEffect(() => {
    if (!lesson) return;
    // Idempotent enough for prototype; if already completed, store keeps status.
    completeLesson(lesson.id, lesson.xp_reward);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [completeLesson, lesson]);

  const handlePracticeNow = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace("/practice");
  }, [router]);

  const handleNextLesson = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!nextLessonId) {
      router.replace("/learn");
      return;
    }
    router.replace(`/learn/lesson-detail?lessonId=${encodeURIComponent(nextLessonId)}`);
  }, [nextLessonId, router]);

  return (
    <GradientBackground>
      <DevHubButton />

      <View style={[styles.container, { paddingBottom: 180 }]}>
        <LearnHeader title="Lesson complete" subtitle={lesson?.title ?? undefined} showBack={false} />

        <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
          <MotiView
            from={{ opacity: 0, scale: 0.96, translateY: 10 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 260 }}
          >
            <GlassPanel style={styles.celebrateCard} glow glowColor={colors.accent[500]}>
              <View style={styles.iconRow}>
                <View style={styles.partyIcon}>
                  <PartyPopper size={22} color={colors.text.primary} />
                </View>
                <Text style={styles.headline}>You did it.</Text>
              </View>

              <Text style={styles.subhead}>
                Keep the rhythm. Consistency is the cheat code.
              </Text>

              <View style={styles.statsRow}>
                <View style={styles.statPill}>
                  <Sparkles size={16} color={colors.accent[400]} />
                  <Text style={styles.statText}>+{lesson?.xp_reward ?? 0} XP</Text>
                </View>
                <View style={styles.statPill}>
                  <Zap size={16} color={colors.secondary[400]} />
                  <Text style={styles.statText}>Streak +1</Text>
                </View>
                <View style={styles.statPill}>
                  <Text style={styles.statTextMuted}>Total: {xpEarned} XP</Text>
                </View>
              </View>

              <View style={styles.ctaStack}>
                <PrimaryButton label="Practice now" onPress={handlePracticeNow} />
                <PrimaryButton
                  label={nextLessonId ? "Next lesson" : "Back to Learn"}
                  onPress={handleNextLesson}
                />
                <SecondaryButton
                  label="Review lesson"
                  variant="outline"
                  onPress={() => {
                    if (!lesson) return;
                    router.replace(`/learn/lesson-detail?lessonId=${encodeURIComponent(lesson.id)}`);
                  }}
                />
              </View>
            </GlassPanel>
          </MotiView>
        </View>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
  },
  celebrateCard: {
    padding: 20,
    borderRadius: 24,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  partyIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(250, 204, 21, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.10)",
  },
  headline: {
    fontFamily: "Satoshi-Bold",
    fontSize: 24,
    color: colors.text.primary,
    letterSpacing: -0.4,
  },
  subhead: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statPill: {
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
  statText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 12,
    color: colors.text.primary,
  },
  statTextMuted: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 12,
    color: colors.text.muted,
  },
  ctaStack: {
    marginTop: 18,
    gap: 12,
  },
});



