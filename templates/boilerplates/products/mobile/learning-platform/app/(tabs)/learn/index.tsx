import { MotiView } from "moti";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { BookOpen, FileText, MessageCircle, Plane, Sparkles } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { DevHubButton } from "@/components/DevHubButton";
import { GlassPanel } from "@/components/GlassPanel";
import { QuickActionCard } from "@/components/QuickActionCard";
import { Skeleton } from "@/components/SkeletonLoader";
import { colors } from "@/theme/tokens";
import { useMotionFrom, useMotionTransition } from "@/hooks/useMotionTransition";
import { CategoryCard } from "@/components/learn/CategoryCard";
import { MOCK_CATEGORIES } from "@/lib/learn/mockContent";

export default function LearnScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 550);
    return () => clearTimeout(timer);
  }, []);

  const categories = useMemo(() => {
    return MOCK_CATEGORIES
      .filter((c) => c.is_active)
      .slice()
      .sort((a, b) => a.order_index - b.order_index);
  }, []);

  if (isLoading) {
    return (
      <GradientBackground>
        <DevHubButton />
        <View style={[styles.container, { paddingTop: insets.top + 20, paddingBottom: 180 }]}>
          <Text style={styles.title}>Learn</Text>
          <Text style={styles.subtitle}>Structured lessons. Personalized pace.</Text>

          <View style={{ marginTop: 18 }}>
            <Skeleton width={120} height={16} />
            <View style={styles.grid}>
              <GlassPanel style={styles.skeletonCard}>
                <Skeleton width={90} height={14} />
                <Skeleton width={"70%"} height={12} style={{ marginTop: 10 }} />
              </GlassPanel>
              <GlassPanel style={styles.skeletonCard}>
                <Skeleton width={90} height={14} />
                <Skeleton width={"70%"} height={12} style={{ marginTop: 10 }} />
              </GlassPanel>
              <GlassPanel style={styles.skeletonCard}>
                <Skeleton width={90} height={14} />
                <Skeleton width={"70%"} height={12} style={{ marginTop: 10 }} />
              </GlassPanel>
              <GlassPanel style={styles.skeletonCard}>
                <Skeleton width={90} height={14} />
                <Skeleton width={"70%"} height={12} style={{ marginTop: 10 }} />
              </GlassPanel>
            </View>
          </View>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <DevHubButton />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 20,
            paddingBottom: 180,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ type: "timing", duration: 360, delay: 0 })}
        >
          <Text style={styles.title}>Learn</Text>
          <Text style={styles.subtitle}>Structured lessons. Personalized pace.</Text>
        </MotiView>

        {/* Categories */}
        <View style={{ marginTop: 18 }}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.grid}>
            {categories.map((c, idx) => (
              <CategoryCard
                key={c.id}
                icon={c.slug.includes("travel") ? Plane : c.slug.includes("conversation") ? MessageCircle : BookOpen}
                title={c.name}
                subtitle={c.description ?? undefined}
                accentColor={c.color ?? colors.secondary[400]}
                delay={reduceMotion ? 0 : 80 + idx * 60}
                onPress={() => router.push({ pathname: "/learn/lesson-list", params: { categoryId: c.id } })}
              />
            ))}
          </View>
        </View>

        {/* Quick Picks */}
        <View style={{ marginTop: 18 }}>
          <Text style={styles.sectionTitle}>Quick Picks</Text>
          <View style={styles.quickRow}>
            <QuickActionCard
              icon={Sparkles}
              label="Vocabulary"
              subtitle="Audio + save"
              accentColor={colors.accent[400]}
              delay={reduceMotion ? 0 : 120}
              onPress={() => router.push("/learn/vocab-list")}
            />
            <QuickActionCard
              icon={MessageCircle}
              label="Slang"
              subtitle="Regions"
              accentColor={colors.secondary[400]}
              delay={reduceMotion ? 0 : 160}
              onPress={() => router.push("/learn/slang-regions")}
            />
          </View>

          <View style={[styles.quickRow, { marginTop: 12 }]}>
            <QuickActionCard
              icon={BookOpen}
              label="Stories"
              subtitle="Tap-to-translate"
              accentColor={colors.primary[400]}
              delay={reduceMotion ? 0 : 200}
              onPress={() => router.push("/learn/story-list")}
            />
            <QuickActionCard
              icon={FileText}
              label="Worksheets"
              subtitle="PDF (P2)"
              accentColor={colors.text.secondary}
              delay={reduceMotion ? 0 : 240}
              onPress={() => router.push("/learn/worksheet")}
            />
          </View>
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: "Satoshi-Bold",
    fontSize: 32,
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 4,
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickRow: {
    flexDirection: "row",
    gap: 12,
  },
  skeletonCard: {
    flex: 1,
    minWidth: "48%",
    padding: 16,
    borderRadius: 20,
    minHeight: 120,
  },
});



