import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { GradientBackground } from "@/components/GradientBackground";
import { DevHubButton } from "@/components/DevHubButton";
import { LearnHeader } from "@/components/learn/LearnHeader";
import { AudioPlayerCard } from "@/components/learn/AudioPlayerCard";
import { getLessonById, MOCK_LESSONS } from "@/lib/learn/mockContent";
import { colors } from "@/theme/tokens";

export default function LearnLessonAudioScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ lessonId?: string }>();

  const lessonId = useMemo(() => {
    const raw = params.lessonId;
    if (typeof raw === "string") return raw;
    return MOCK_LESSONS[0]?.id ?? null;
  }, [params.lessonId]);

  const lesson = useMemo(() => {
    return lessonId ? getLessonById(lessonId) : null;
  }, [lessonId]);

  const transcript = useMemo(() => {
    if (!lesson) return "";
    return lesson.content.sections
      .map((s) => {
        if (s.type === "text") return s.content;
        if (s.type === "example") return `${s.term}\n${s.definition}`;
        return null;
      })
      .filter(Boolean)
      .join("\n\n");
  }, [lesson]);

  const durationSeconds = useMemo(() => {
    // Prototype: a “short premium” feeling, not real audio length.
    return Math.min(90, Math.max(35, (lesson?.duration_minutes ?? 8) * 6));
  }, [lesson?.duration_minutes]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [positionSeconds, setPositionSeconds] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setPositionSeconds((t) => {
        const next = t + 0.5;
        if (next >= durationSeconds) {
          setIsPlaying(false);
          return durationSeconds;
        }
        return next;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [durationSeconds, isPlaying]);

  const handleTogglePlay = useCallback(() => {
    if (!durationSeconds) return;

    setIsPlaying((p) => {
      const next = !p;
      if (next && positionSeconds >= durationSeconds) setPositionSeconds(0);
      return next;
    });
  }, [durationSeconds, positionSeconds]);

  return (
    <GradientBackground>
      <DevHubButton />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 180 }}
        showsVerticalScrollIndicator={false}
      >
        <LearnHeader title="Lesson Audio" subtitle={lesson?.title ?? undefined} />

        <View style={styles.content}>
          <AudioPlayerCard
            title={lesson?.title ?? "Audio"}
            subtitle="Premium playback (mocked)"
            isPlaying={isPlaying}
            positionSeconds={positionSeconds}
            durationSeconds={durationSeconds}
            onTogglePlay={handleTogglePlay}
          />

          <View style={{ marginTop: 18 }}>
            <Text style={styles.sectionTitle}>Transcript</Text>
            <Text style={styles.transcript}>{transcript || "No transcript available."}</Text>
          </View>

          <View style={{ marginTop: 18 }}>
            <Text style={styles.hint}>
              Tip: you can keep listening while you read. Tap Back to return to the lesson.\n
              (Real `expo-av` playback can replace this mocked timer later.)
            </Text>
          </View>
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
  sectionTitle: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 10,
  },
  transcript: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 21,
  },
  hint: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.muted,
    lineHeight: 18,
  },
});



