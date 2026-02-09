import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { BookOpen, MessageCircle, Plane } from "lucide-react-native";

import { GradientBackground } from "@/components/GradientBackground";
import { DevHubButton } from "@/components/DevHubButton";
import { colors } from "@/theme/tokens";
import { LearnHeader } from "@/components/learn/LearnHeader";
import { CategoryCard } from "@/components/learn/CategoryCard";
import { MOCK_CATEGORIES } from "@/lib/learn/mockContent";

export default function LearnCategoryListScreen() {
  const router = useRouter();

  const categories = useMemo(() => {
    return MOCK_CATEGORIES
      .filter((c) => c.is_active)
      .slice()
      .sort((a, b) => a.order_index - b.order_index);
  }, []);

  return (
    <GradientBackground>
      <DevHubButton />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 180 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <LearnHeader title="Category List" subtitle="Browse lesson tracks" />

        <View style={{ paddingHorizontal: 20 }}>
          <Text style={styles.hint}>Pick a track and keep it moving.</Text>

          <View style={styles.list}>
            {categories.map((c, idx) => (
              <CategoryCard
                key={c.id}
                icon={c.slug.includes("travel") ? Plane : c.slug.includes("conversation") ? MessageCircle : BookOpen}
                title={c.name}
                subtitle={c.description ?? undefined}
                accentColor={c.color ?? colors.secondary[400]}
                delay={idx * 40}
                onPress={() => router.push(`/learn/lesson-list?categoryId=${encodeURIComponent(c.id)}`)}
              />
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
  scrollContent: {
    paddingTop: 0,
  },
  hint: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  list: {
    gap: 12,
  },
});



