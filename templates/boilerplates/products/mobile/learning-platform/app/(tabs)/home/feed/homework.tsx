import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, CheckCircle, Clock, ListTodo } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { GlassPanel } from "@/components/GlassPanel";
import { HomeworkCard } from "@/components/feed";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { useFeedStore, Homework } from "@/stores/feedStore";
import { colors } from "@/theme/tokens";

type FilterType = "all" | "pending" | "completed";

const FILTERS: { id: FilterType; label: string; icon: typeof ListTodo }[] = [
  { id: "all", label: "All", icon: ListTodo },
  { id: "pending", label: "Pending", icon: Clock },
  { id: "completed", label: "Completed", icon: CheckCircle },
];

export default function HomeworkListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const { homework } = useFeedStore();
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredHomework = homework.filter((hw) => {
    if (filter === "pending") return !hw.isCompleted;
    if (filter === "completed") return hw.isCompleted;
    return true;
  });

  const pendingCount = homework.filter((h) => !h.isCompleted).length;
  const completedCount = homework.filter((h) => h.isCompleted).length;

  const handleBack = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const handleHomeworkPress = useCallback(
    (hw: Homework) => {
      router.push(`/home/feed/homework-submit?id=${hw.id}`);
    },
    [router]
  );

  const handleFilterChange = useCallback((newFilter: FilterType) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilter(newFilter);
  }, []);

  return (
    <GradientBackground>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Homework</Text>
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
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{homework.length}</Text>
              <Text style={styles.summaryLabel}>Total</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.accent[400] }]}>
                {pendingCount}
              </Text>
              <Text style={styles.summaryLabel}>Pending</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.success }]}>
                {completedCount}
              </Text>
              <Text style={styles.summaryLabel}>Done</Text>
            </View>
          </GlassPanel>
        </MotiView>

        {/* Filter Chips */}
        <MotiView
          from={motionFrom.fade}
          animate={{ opacity: 1 }}
          transition={getTransition({ delay: 100 })}
          style={styles.filterSection}
        >
          {FILTERS.map((f) => {
            const Icon = f.icon;
            const isActive = filter === f.id;
            return (
              <Pressable
                key={f.id}
                onPress={() => handleFilterChange(f.id)}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
              >
                <Icon
                  size={14}
                  color={isActive ? colors.secondary[400] : colors.text.muted}
                />
                <Text style={[styles.filterLabel, isActive && styles.filterLabelActive]}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </MotiView>

        {/* Homework List */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 200 })}
        >
          {filteredHomework.length === 0 ? (
            <GlassPanel style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>
                {filter === "pending" ? "All caught up!" : "No homework found"}
              </Text>
              <Text style={styles.emptyText}>
                {filter === "pending"
                  ? "You've completed all your assignments."
                  : "Check back later for new assignments."}
              </Text>
            </GlassPanel>
          ) : (
            filteredHomework.map((hw, index) => (
              <HomeworkCard
                key={hw.id}
                homework={hw}
                onPress={handleHomeworkPress}
                delay={250 + index * 50}
              />
            ))
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
    justifyContent: "space-around",
    padding: 20,
    borderRadius: 20,
  },
  summaryItem: {
    alignItems: "center",
    gap: 4,
  },
  summaryValue: {
    fontFamily: "Satoshi-Bold",
    fontSize: 28,
    color: colors.text.primary,
  },
  summaryLabel: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.muted,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  filterSection: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
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
  emptyCard: {
    padding: 32,
    borderRadius: 24,
    alignItems: "center",
  },
  emptyTitle: {
    fontFamily: "Satoshi-Bold",
    fontSize: 18,
    color: colors.text.primary,
    marginBottom: 8,
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

