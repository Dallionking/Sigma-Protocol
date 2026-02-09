import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  Zap,
  BookOpen,
  Clock,
  Headphones,
  Mic,
  BookMarked,
  PenTool,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { GlassPanel } from "@/components/GlassPanel";
import { StatCard } from "@/components/profile";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { useProfileStore } from "@/stores/profileStore";
import { MOCK_USER_STATS } from "@/lib/profile/mockData";
import { colors } from "@/theme/tokens";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function StatsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const { stats } = useProfileStore();
  const displayStats = stats ?? MOCK_USER_STATS;

  const maxActivity = Math.max(...displayStats.weeklyActivity);

  const handleBack = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  return (
    <GradientBackground>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Stats</Text>
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
        {/* Summary Cards */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition()}
          style={styles.summaryRow}
        >
          <StatCard
            icon={Zap}
            value={displayStats.totalXP.toLocaleString()}
            label="Total XP"
            accentColor={colors.accent[400]}
            delay={0}
          />
          <StatCard
            icon={BookOpen}
            value={displayStats.lessonsCompleted}
            label="Lessons"
            accentColor={colors.secondary[400]}
            delay={30}
          />
          <StatCard
            icon={Clock}
            value={`${displayStats.hoursPracticed}h`}
            label="Practiced"
            accentColor={colors.primary[400]}
            delay={60}
          />
        </MotiView>

        {/* Weekly Activity */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 100 })}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Weekly Activity</Text>
          <GlassPanel style={styles.chartCard}>
            <View style={styles.barChart}>
              {displayStats.weeklyActivity.map((minutes, index) => {
                const heightPercent = maxActivity > 0 ? (minutes / maxActivity) * 100 : 0;
                const isToday = index === new Date().getDay();
                return (
                  <View key={index} style={styles.barContainer}>
                    <View style={styles.barWrapper}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: `${heightPercent}%`,
                            backgroundColor: isToday
                              ? colors.secondary[400]
                              : "rgba(6, 182, 212, 0.4)",
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.barLabel, isToday && styles.barLabelActive]}>
                      {DAYS[index]}
                    </Text>
                    <Text style={styles.barValue}>{minutes}m</Text>
                  </View>
                );
              })}
            </View>
          </GlassPanel>
        </MotiView>

        {/* Category Breakdown */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 150 })}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Practice Breakdown</Text>
          <GlassPanel style={styles.breakdownCard}>
            <CategoryRow
              icon={Headphones}
              label="Listening"
              minutes={displayStats.listeningMinutes}
              color={colors.secondary[400]}
            />
            <View style={styles.divider} />
            <CategoryRow
              icon={Mic}
              label="Speaking"
              minutes={displayStats.speakingMinutes}
              color={colors.primary[400]}
            />
            <View style={styles.divider} />
            <CategoryRow
              icon={BookMarked}
              label="Reading"
              minutes={displayStats.readingMinutes}
              color={colors.accent[400]}
            />
            <View style={styles.divider} />
            <CategoryRow
              icon={PenTool}
              label="Writing"
              minutes={displayStats.writingMinutes}
              color="#A78BFA"
            />
          </GlassPanel>
        </MotiView>

        {/* Words Learned */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 200 })}
          style={styles.section}
        >
          <GlassPanel style={styles.wordsCard}>
            <Text style={styles.wordsValue}>{displayStats.wordsLearned}</Text>
            <Text style={styles.wordsLabel}>Words Learned</Text>
            <View style={styles.wordsProgress}>
              <View
                style={[
                  styles.wordsProgressFill,
                  { width: `${(displayStats.wordsLearned / 500) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.wordsGoal}>Goal: 500 words</Text>
          </GlassPanel>
        </MotiView>
      </ScrollView>
    </GradientBackground>
  );
}

function CategoryRow({
  icon: Icon,
  label,
  minutes,
  color,
}: {
  icon: typeof Headphones;
  label: string;
  minutes: number;
  color: string;
}) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const timeString = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return (
    <View style={styles.categoryRow}>
      <View style={[styles.categoryIcon, { backgroundColor: `${color}15` }]}>
        <Icon size={18} color={color} />
      </View>
      <Text style={styles.categoryLabel}>{label}</Text>
      <Text style={styles.categoryTime}>{timeString}</Text>
    </View>
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
  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 12,
  },
  chartCard: {
    padding: 20,
    borderRadius: 20,
  },
  barChart: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 140,
  },
  barContainer: {
    flex: 1,
    alignItems: "center",
  },
  barWrapper: {
    flex: 1,
    width: 28,
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  bar: {
    width: "100%",
    borderRadius: 6,
    minHeight: 4,
  },
  barLabel: {
    fontFamily: "PlusJakartaSans",
    fontSize: 11,
    color: colors.text.muted,
    marginBottom: 2,
  },
  barLabelActive: {
    color: colors.secondary[400],
    fontFamily: "PlusJakartaSans-SemiBold",
  },
  barValue: {
    fontFamily: "PlusJakartaSans",
    fontSize: 10,
    color: colors.text.muted,
  },
  breakdownCard: {
    padding: 16,
    borderRadius: 20,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryLabel: {
    flex: 1,
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 15,
    color: colors.text.primary,
  },
  categoryTime: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
    color: colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  wordsCard: {
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
  },
  wordsValue: {
    fontFamily: "Satoshi-Bold",
    fontSize: 48,
    color: colors.text.primary,
    marginBottom: 4,
  },
  wordsLabel: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 16,
  },
  wordsProgress: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    overflow: "hidden",
    marginBottom: 8,
  },
  wordsProgressFill: {
    height: "100%",
    backgroundColor: colors.secondary[400],
    borderRadius: 4,
  },
  wordsGoal: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.muted,
  },
});

