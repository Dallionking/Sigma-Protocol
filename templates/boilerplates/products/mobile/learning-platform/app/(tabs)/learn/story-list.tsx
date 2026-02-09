import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { BookOpenText } from "lucide-react-native";

import { GradientBackground } from "@/components/GradientBackground";
import { DevHubButton } from "@/components/DevHubButton";
import { GlassPanel } from "@/components/GlassPanel";
import { LearnHeader } from "@/components/learn/LearnHeader";
import { MOCK_STORIES } from "@/lib/learn/mockContent";
import { colors } from "@/theme/tokens";

export default function LearnStoryListScreen() {
  const router = useRouter();
  const stories = useMemo(() => MOCK_STORIES.slice(), []);

  return (
    <GradientBackground>
      <DevHubButton />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 180 }}
        showsVerticalScrollIndicator={false}
      >
        <LearnHeader title="Stories" subtitle="Read in context" />

        <View style={styles.content}>
          <Text style={styles.hint}>Tap a story. Tap highlighted words for a quick translation.</Text>

          <View style={{ gap: 12, marginTop: 12 }}>
            {stories.map((s) => (
              <Pressable
                key={s.id}
                onPress={() => router.push(`/learn/story-reader?storyId=${encodeURIComponent(s.id)}`)}
                accessibilityRole="button"
                accessibilityLabel={s.title}
              >
                <GlassPanel style={styles.row}>
                  <View style={styles.rowIcon}>
                    <BookOpenText size={18} color={colors.accent[400]} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{s.title}</Text>
                    <Text style={styles.level}>Level: {s.level}</Text>
                  </View>
                </GlassPanel>
              </Pressable>
            ))}
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
  hint: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  row: {
    padding: 16,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(250, 204, 21, 0.12)",
  },
  title: {
    fontFamily: "Satoshi-Bold",
    fontSize: 16,
    color: colors.text.primary,
    letterSpacing: -0.2,
  },
  level: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 6,
  },
});



