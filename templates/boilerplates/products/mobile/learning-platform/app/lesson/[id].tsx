import React, { useEffect, useMemo } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { GradientBackground } from "@/components/GradientBackground";
import { resolveGateTarget } from "@/lib/gate";
import { colors } from "@/theme/tokens";

export default function LessonDeepLinkRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();

  const lessonId = useMemo(() => {
    const raw = params.id;
    if (typeof raw === "string") return raw;
    return null;
  }, [params.id]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const gate = await resolveGateTarget();
      if (cancelled) return;

      if (gate.target === "/(tabs)/home" && lessonId) {
        router.replace(`/learn/lesson-detail?lessonId=${encodeURIComponent(lessonId)}`);
        return;
      }

      router.replace(gate.target);
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [lessonId, router]);

  return (
    <GradientBackground>
      <View style={styles.container}>
        <ActivityIndicator color={colors.secondary[400]} />
        <Text style={styles.text}>Opening lesson…</Text>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  text: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.muted,
    marginTop: 12,
  },
});



