import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { GradientBackground } from "@/components/GradientBackground";
import { DevHubButton } from "@/components/DevHubButton";
import { LearnHeader } from "@/components/learn/LearnHeader";
import { LessonCard } from "@/components/learn/LessonCard";
import { getCategoryById, getLessonsByCategoryId, MOCK_CATEGORIES } from "@/lib/learn/mockContent";
import { useLearnStore, hasTierAccess } from "@/stores/learnStore";
import { colors } from "@/theme/tokens";

export default function LearnLessonListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ categoryId?: string }>();

  const activeTier = useLearnStore((s) => s.activeTier);
  const progressByLessonId = useLearnStore((s) => s.progressByLessonId);

  const categoryId = useMemo(() => {
    const raw = params.categoryId;
    if (typeof raw === "string") return raw;
    return MOCK_CATEGORIES[0]?.id ?? null;
  }, [params.categoryId]);

  const category = useMemo(() => {
    return categoryId ? getCategoryById(categoryId) : null;
  }, [categoryId]);

  const lessons = useMemo(() => {
    if (!categoryId) return [];
    return getLessonsByCategoryId(categoryId);
  }, [categoryId]);

  return (
    <GradientBackground>
      <DevHubButton />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 180 }}
        showsVerticalScrollIndicator={false}
      >
        <LearnHeader title="Lesson List" subtitle={category?.name ?? "Choose a category"} />

        <View style={styles.content}>
          <Text style={styles.hint}>
            Tap a lesson to start. Locked lessons show what you need to unlock.
          </Text>

          {lessons.length === 0 ? (
            <Text style={styles.empty}>New lessons coming soon.</Text>
          ) : (
            lessons.map((lesson, idx) => {
              const progress = progressByLessonId[lesson.id];
              const completed = progress?.status === "completed";
              const progressPercent = progress?.completion_percent ?? 0;

              const tierLocked = !hasTierAccess(activeTier, lesson.tier_required);
              const prevLessonId = idx > 0 ? lessons[idx - 1]?.id : null;
              const prevCompleted = prevLessonId
                ? progressByLessonId[prevLessonId]?.status === "completed"
                : true;
              const progressionLocked = idx > 0 && !prevCompleted;

              const locked = tierLocked || progressionLocked;

              return (
                <LessonCard
                  key={lesson.id}
                  title={lesson.title}
                  subtitle={lesson.description ?? undefined}
                  durationMinutes={lesson.duration_minutes}
                  xp={lesson.xp_reward}
                  progressPercent={progressPercent}
                  locked={locked}
                  completed={completed}
                  delay={idx * 40}
                  onPress={() => {
                    if (locked) {
                      router.push(`/learn/lesson-locked?lessonId=${encodeURIComponent(lesson.id)}`);
                    } else {
                      router.push(`/learn/lesson-detail?lessonId=${encodeURIComponent(lesson.id)}`);
                    }
                  }}
                />
              );
            })
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
  hint: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  empty: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.muted,
  },
});



