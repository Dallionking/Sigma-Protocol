import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Book, LogOut, MessageCircle, Sparkles, Zap } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { GradientBackground } from "@/components/GradientBackground";
import { ContinueLessonCard } from "@/components/ContinueLessonCard";
import { DevHubButton } from "@/components/DevHubButton";
import { GlassPanel } from "@/components/GlassPanel";
import { NeonMonogram } from "@/components/NeonMonogram";
import { QuickActionCard } from "@/components/QuickActionCard";
import { DashboardSkeleton } from "@/components/SkeletonLoader";
import { StreakBadge } from "@/components/StreakBadge";
import { XPProgressRingCompact } from "@/components/XPProgressRing";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import { useLearnStore } from "@/stores/learnStore";
import { colors, durations } from "@/theme/tokens";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Mock data - in production this would come from API/state
const MOCK_USER = {
  name: "Maria",
  streak: 7,
  currentXP: 1240,
  maxXP: 2000,
  level: 7,
};

const MOCK_LESSON = {
  title: "Present tense: Ordering food",
  chapter: "Chapter 3: At the Restaurant",
  progress: 60,
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomeDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const currentLessonId = useLearnStore((s) => s.currentLessonId);
  const learnProgressByLessonId = useLearnStore((s) => s.progressByLessonId);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const greeting = useMemo(() => getGreeting(), []);

  // Simulate initial data load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Simulate network request
    await new Promise((resolve) => setTimeout(resolve, 1500));

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsRefreshing(false);
  }, []);

  const handleLogout = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await AsyncStorage.setItem(STORAGE_KEYS.hasSession, "false");
    router.replace("/signin-credentials");
  }, [router]);

  const handleContinueLesson = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!currentLessonId) {
      router.push("/learn");
      return;
    }

    const progress = learnProgressByLessonId[currentLessonId];
    const isCompleted = progress?.status === "completed";

    router.push(
      isCompleted
        ? `/learn/lesson-detail?lessonId=${encodeURIComponent(currentLessonId)}`
        : `/learn/lesson-content?lessonId=${encodeURIComponent(currentLessonId)}`
    );
  }, [currentLessonId, learnProgressByLessonId, router]);

  const handleVerbOfDay = useCallback(() => {
    router.push("/home/verb-of-day");
  }, [router]);

  const handleTalkToAI Tutor = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/practice/ai");
  }, [router]);

  const handleFeedPress = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/home/feed");
  }, [router]);

  const handleStreakPress = useCallback(() => {
    router.push("/home/streak-detail");
  }, [router]);

  // Show skeleton while loading
  if (isLoading) {
    return (
      <GradientBackground>
        <DevHubButton />
        <View style={{ paddingTop: insets.top + 16 }}>
          <DashboardSkeleton />
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
            paddingTop: insets.top + 16,
            paddingBottom: 180,
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary[400]}
            progressBackgroundColor="transparent"
          />
        }
      >
        {/* Header */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition()}
          style={styles.header}
        >
          <View style={styles.headerLeft}>
            <NeonMonogram size={48} />
            <View style={styles.headerText}>
              <Text style={styles.greeting}>
                {greeting}, {MOCK_USER.name}
              </Text>
              <Text style={styles.subtitle}>Let's keep your streak going!</Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <StreakBadge
              streak={MOCK_USER.streak}
              onPress={handleStreakPress}
              size="medium"
            />
          </View>
        </MotiView>

        {/* XP Progress */}
        <MotiView
          from={motionFrom.fadeUpLarge}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 50 })}
          style={styles.xpSection}
        >
          <GlassPanel style={styles.xpCard}>
            <XPProgressRingCompact
              currentXP={MOCK_USER.currentXP}
              maxXP={MOCK_USER.maxXP}
              level={MOCK_USER.level}
            />
          </GlassPanel>
        </MotiView>

        {/* Continue Lesson Card */}
        <View style={styles.section}>
          <ContinueLessonCard
            lessonTitle={MOCK_LESSON.title}
            chapterName={MOCK_LESSON.chapter}
            progress={MOCK_LESSON.progress}
            onPress={handleContinueLesson}
            delay={reduceMotion ? 0 : 160}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsRow}>
          <QuickActionCard
            icon={Book}
            label="Verb of the Day"
            subtitle="SER - to be"
            onPress={handleVerbOfDay}
            accentColor={colors.accent[400]}
            delay={reduceMotion ? 0 : 240}
          />
          <QuickActionCard
            icon={MessageCircle}
            label="Talk to AI Tutor"
            subtitle="Practice speaking"
            onPress={handleTalkToAI Tutor}
            accentColor={colors.secondary[400]}
            delay={reduceMotion ? 0 : 280}
          />
        </View>

        {/* AI Tutor's Feed Preview */}
        <MotiView
          from={motionFrom.fade}
          animate={{ opacity: 1 }}
          transition={getTransition({ delay: 150 })}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>AI Tutor's Feed</Text>
            <Pressable onPress={handleFeedPress}>
              <Text style={styles.seeAllText}>See all</Text>
            </Pressable>
          </View>
          <Pressable onPress={handleFeedPress}>
            <GlassPanel style={styles.feedCard}>
              <View style={styles.feedHeader}>
                <View style={styles.feedAvatar}>
                  <Sparkles size={18} color={colors.accent[400]} />
                </View>
                <View style={styles.feedMeta}>
                  <Text style={styles.feedAuthor}>AI Tutor</Text>
                  <Text style={styles.feedTime}>Just now</Text>
                </View>
              </View>
              <Text style={styles.feedContent}>
                Did you know that "synthesis" means combining ideas into a whole?
                Tap on Concept of the Day to learn more!
              </Text>
            </GlassPanel>
          </Pressable>
        </MotiView>

        {/* Daily/Weekly Challenges Preview */}
        <MotiView
          from={motionFrom.fade}
          animate={{ opacity: 1 }}
          transition={getTransition({ delay: 250 })}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Challenges</Text>
          <View style={styles.challengesRow}>
            <ChallengeCard
              label="Daily"
              reward="+50 XP"
              onPress={() => router.push("/home/daily-challenge")}
              reduceMotion={reduceMotion}
            />
            <ChallengeCard
              label="Weekly"
              reward="+200 XP"
              onPress={() => router.push("/home/weekly-challenge")}
              reduceMotion={reduceMotion}
            />
          </View>
        </MotiView>

        {/* Logout button */}
        <MotiView
          from={motionFrom.fade}
          animate={{ opacity: 1 }}
          transition={getTransition({ delay: 350 })}
          style={styles.logoutSection}
        >
          <Pressable onPress={handleLogout} style={styles.logoutButton}>
            <LogOut size={18} color={colors.text.muted} />
            <Text style={styles.logoutText}>Sign out</Text>
          </Pressable>
        </MotiView>
      </ScrollView>
    </GradientBackground>
  );
}

// Enhanced Challenge Card with haptic and scale feedback
function ChallengeCard({
  label,
  reward,
  onPress,
  reduceMotion,
}: {
  label: string;
  reward: string;
  onPress: () => void;
  reduceMotion: boolean;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = reduceMotion ? 0.96 : withTiming(0.96, { duration: durations.fast });
  }, [reduceMotion, scale]);

  const handlePressOut = useCallback(() => {
    scale.value = reduceMotion ? 1 : withTiming(1, { duration: durations.fast });
  }, [reduceMotion, scale]);

  const handlePress = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);

  return (
    <AnimatedPressable
      style={[styles.challengeCard, animatedStyle]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Zap size={20} color={colors.accent[400]} style={styles.challengeIcon} />
      <Text style={styles.challengeLabel}>{label}</Text>
      <Text style={styles.challengeReward}>{reward}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerText: {
    marginLeft: 14,
    flex: 1,
  },
  greeting: {
    fontFamily: "Satoshi-Bold",
    fontSize: 22,
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
  },
  headerRight: {
    marginLeft: 12,
  },
  xpSection: {
    marginBottom: 20,
  },
  xpCard: {
    padding: 20,
    borderRadius: 20,
  },
  section: {
    marginBottom: 20,
  },
  quickActionsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 16,
    color: colors.text.primary,
  },
  seeAllText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.secondary[400],
  },
  feedCard: {
    padding: 16,
    borderRadius: 18,
  },
  feedHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  feedAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(250, 204, 21, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  feedMeta: {
    marginLeft: 10,
  },
  feedAuthor: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
    color: colors.text.primary,
  },
  feedTime: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
  },
  feedContent: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 21,
  },
  challengesRow: {
    flexDirection: "row",
    gap: 12,
  },
  challengeCard: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.6)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  challengeIcon: {
    marginBottom: 8,
  },
  challengeLabel: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 4,
  },
  challengeReward: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.secondary[400],
  },
  logoutSection: {
    marginTop: 20,
    alignItems: "center",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  logoutText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.muted,
  },
});



