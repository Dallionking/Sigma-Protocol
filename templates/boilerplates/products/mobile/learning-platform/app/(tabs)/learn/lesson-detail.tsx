import React, { useEffect, useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BookOpen, Clock, Sparkles } from "lucide-react-native";

import { GradientBackground } from "@/components/GradientBackground";
import { DevHubButton } from "@/components/DevHubButton";
import { GlassPanel } from "@/components/GlassPanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import { LearnHeader } from "@/components/learn/LearnHeader";
import { ProgressBar } from "@/components/learn/ProgressBar";
import { getCategoryById, getLessonById, getLessonsByCategoryId, MOCK_LESSONS } from "@/lib/learn/mockContent";
import { hasTierAccess, useLearnStore } from "@/stores/learnStore";
import { colors } from "@/theme/tokens";

export default function LearnLessonDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ lessonId?: string }>();

  const activeTier = useLearnStore((s) => s.activeTier);
  const progressByLessonId = useLearnStore((s) => s.progressByLessonId);
  const startLesson = useLearnStore((s) => s.startLesson);

  const lessonId = useMemo(() => {
    const raw = params.lessonId;
    if (typeof raw === "string") return raw;
    return MOCK_LESSONS[0]?.id ?? null;
  }, [params.lessonId]);

  const lesson = useMemo(() => {
    return lessonId ? getLessonById(lessonId) : null;
  }, [lessonId]);

  const category = useMemo(() => {
    return lesson?.category_id ? getCategoryById(lesson.category_id) : null;
  }, [lesson?.category_id]);

  const categoryLessons = useMemo(() => {
    if (!lesson?.category_id) return [];
    return getLessonsByCategoryId(lesson.category_id);
  }, [lesson?.category_id]);

  const locked = useMemo(() => {
    if (!lesson) return false;

    const tierLocked = !hasTierAccess(activeTier, lesson.tier_required);
    if (tierLocked) return true;

    if (!lesson.category_id) return false;
    const idx = categoryLessons.findIndex((l) => l.id === lesson.id);
    if (idx <= 0) return false;

    const prev = categoryLessons[idx - 1];
    const prevCompleted = prev ? progressByLessonId[prev.id]?.status === "completed" : true;
    return !prevCompleted;
  }, [activeTier, categoryLessons, lesson, progressByLessonId]);

  useEffect(() => {
    if (!lesson || !locked) return;
    router.replace(`/learn/lesson-locked?lessonId=${encodeURIComponent(lesson.id)}`);
  }, [lesson, locked, router]);

  const progress = lesson ? progressByLessonId[lesson.id] : undefined;
  const progressPercent = progress?.completion_percent ?? 0;

  return (
    <GradientBackground>
      <DevHubButton />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 180 }}
        showsVerticalScrollIndicator={false}
      >
        <LearnHeader
          title="Lesson"
          subtitle={category?.name ?? undefined}
        />

        <View style={styles.content}>
          {lesson ? (
            <>
              <Text style={styles.lessonTitle}>{lesson.title}</Text>
              {lesson.description ? <Text style={styles.lessonDesc}>{lesson.description}</Text> : null}

              <GlassPanel style={styles.card} glow glowColor={colors.primary[500]}>
                <View style={styles.metaRow}>
                  <View style={styles.metaChip}>
                    <Clock size={16} color={colors.text.muted} />
                    <Text style={styles.metaText}>{lesson.duration_minutes} min</Text>
                  </View>
                  <View style={styles.metaChip}>
                    <Sparkles size={16} color={colors.text.muted} />
                    <Text style={styles.metaText}>+{lesson.xp_reward} XP</Text>
                  </View>
                  <View style={styles.metaChip}>
                    <BookOpen size={16} color={colors.text.muted} />
                    <Text style={styles.metaText}>{lesson.difficulty}</Text>
                  </View>
                </View>

                <View style={{ marginTop: 14 }}>
                  <Text style={styles.progressLabel}>Progress</Text>
                  <ProgressBar value={progressPercent} showLabel style={{ marginTop: 8 }} />
                </View>

                <View style={styles.ctaStack}>
                  <PrimaryButton
                    label={progressPercent > 0 ? "Continue lesson" : "Start lesson"}
                    onPress={() => {
                      startLesson(lesson.id);
                      router.push(`/learn/lesson-content?lessonId=${encodeURIComponent(lesson.id)}`);
                    }}
                  />

                  <View style={styles.secondaryRow}>
                    <SecondaryButton
                      label="Vocabulary"
                      variant="outline"
                      onPress={() => router.push(`/learn/vocab-list?lessonId=${encodeURIComponent(lesson.id)}`)}
                      style={{ flex: 1 }}
                    />
                    <SecondaryButton
                      label="Audio"
                      variant="outline"
                      onPress={() => router.push(`/learn/lesson-audio?lessonId=${encodeURIComponent(lesson.id)}`)}
                      style={{ flex: 1 }}
                    />
                  </View>
                </View>
              </GlassPanel>
            </>
          ) : (
            <Text style={styles.empty}>Lesson not found.</Text>
          )}
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  lessonTitle: {
    fontFamily: "Satoshi-Bold",
    fontSize: 26,
    color: colors.text.primary,
    letterSpacing: -0.4,
    marginBottom: 10,
  },
  lessonDesc: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  card: {
    padding: 18,
    borderRadius: 22,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metaChip: {
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
  metaText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 12,
    color: colors.text.secondary,
  },
  progressLabel: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 13,
    color: colors.text.primary,
  },
  ctaStack: {
    marginTop: 18,
    gap: 12,
  },
  secondaryRow: {
    flexDirection: "row",
    gap: 12,
  },
  empty: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.muted,
  },
});



