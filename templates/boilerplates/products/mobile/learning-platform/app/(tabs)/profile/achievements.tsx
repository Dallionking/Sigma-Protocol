import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, Trophy, Lock, Zap } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { GlassPanel } from "@/components/GlassPanel";
import { AchievementCard } from "@/components/profile";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { useProfileStore, Achievement } from "@/stores/profileStore";
import {
  MOCK_ACHIEVEMENTS,
  getUnlockedAchievements,
  getInProgressAchievements,
  getLockedAchievements,
} from "@/lib/profile/mockData";
import { colors } from "@/theme/tokens";

type FilterType = "all" | "unlocked" | "in_progress";

const FILTERS: { id: FilterType; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unlocked", label: "Unlocked" },
  { id: "in_progress", label: "In Progress" },
];

export default function AchievementsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const { achievements } = useProfileStore();
  const displayAchievements = achievements.length > 0 ? achievements : MOCK_ACHIEVEMENTS;

  const [filter, setFilter] = useState<FilterType>("all");

  const unlockedCount = displayAchievements.filter((a) => a.unlockedAt).length;
  const totalCount = displayAchievements.length;

  const filteredAchievements = displayAchievements.filter((a) => {
    if (filter === "unlocked") return !!a.unlockedAt;
    if (filter === "in_progress") return !a.unlockedAt && (a.progress ?? 0) > 0;
    return true;
  });

  const handleBack = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const handleFilterChange = useCallback((newFilter: FilterType) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilter(newFilter);
  }, []);

  const handleAchievementPress = useCallback((achievement: Achievement) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Could show detail modal
  }, []);

  return (
    <GradientBackground>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Achievements</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Summary */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition()}
          style={styles.summarySection}
        >
          <GlassPanel style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <Trophy size={32} color={colors.accent[400]} />
            </View>
            <View style={styles.summaryContent}>
              <Text style={styles.summaryTitle}>
                {unlockedCount} of {totalCount}
              </Text>
              <Text style={styles.summarySubtitle}>Achievements Unlocked</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(unlockedCount / totalCount) * 100}%` },
                  ]}
                />
              </View>
            </View>
          </GlassPanel>
        </MotiView>

        {/* Filter Chips */}
        <MotiView
          from={motionFrom.fade}
          animate={{ opacity: 1 }}
          transition={getTransition({ delay: 50 })}
          style={styles.filterSection}
        >
          {FILTERS.map((f) => {
            const isActive = filter === f.id;
            return (
              <Pressable
                key={f.id}
                onPress={() => handleFilterChange(f.id)}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
              >
                <Text style={[styles.filterLabel, isActive && styles.filterLabelActive]}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </MotiView>

        {/* Achievements Grid */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 100 })}
        >
          {filteredAchievements.length === 0 ? (
            <GlassPanel style={styles.emptyCard}>
              <Lock size={32} color={colors.text.muted} />
              <Text style={styles.emptyTitle}>
                {filter === "unlocked" ? "No achievements unlocked yet" : "Keep practicing!"}
              </Text>
              <Text style={styles.emptyText}>
                Complete lessons and maintain your streak to earn achievements.
              </Text>
            </GlassPanel>
          ) : (
            <View style={styles.achievementsGrid}>
              {filteredAchievements.map((achievement, index) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  onPress={handleAchievementPress}
                  delay={120 + index * 30}
                />
              ))}
            </View>
          )}
        </MotiView>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "Satoshi-Bold",
    fontSize: 18,
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  summarySection: {
    marginBottom: 20,
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 20,
    gap: 16,
  },
  summaryIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(250, 204, 21, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryContent: {
    flex: 1,
  },
  summaryTitle: {
    fontFamily: "Satoshi-Bold",
    fontSize: 24,
    color: colors.text.primary,
  },
  summarySubtitle: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.muted,
    marginBottom: 10,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.accent[400],
    borderRadius: 3,
  },
  filterSection: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  filterChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  filterChipActive: {
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    borderColor: colors.secondary[500],
  },
  filterLabel: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.muted,
  },
  filterLabelActive: {
    fontFamily: "PlusJakartaSans-SemiBold",
    color: colors.secondary[400],
  },
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  emptyCard: {
    padding: 40,
    borderRadius: 24,
    alignItems: "center",
    gap: 12,
  },
  emptyTitle: {
    fontFamily: "Satoshi-Bold",
    fontSize: 18,
    color: colors.text.primary,
    textAlign: "center",
  },
  emptyText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.muted,
    textAlign: "center",
    lineHeight: 20,
  },
});

