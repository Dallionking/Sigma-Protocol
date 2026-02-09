import AsyncStorage from "@react-native-async-storage/async-storage";
import { MotiView } from "moti";
import React, { useCallback, useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import {
  Award,
  BarChart3,
  ChevronRight,
  Flame,
  LogOut,
  Settings,
  User,
  BookOpen,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { GradientBackground } from "@/components/GradientBackground";
import { DevHubButton } from "@/components/DevHubButton";
import { GlassPanel } from "@/components/GlassPanel";
import { ProfileHeader } from "@/components/profile";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import { useProfileStore } from "@/stores/profileStore";
import {
  MOCK_USER_PROFILE,
  MOCK_USER_STATS,
  MOCK_ACHIEVEMENTS,
} from "@/lib/profile/mockData";
import { colors } from "@/theme/tokens";

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const { profile, stats, setProfile, setStats, setAchievements } = useProfileStore();

  // Initialize with mock data
  useEffect(() => {
    if (!profile) {
      setProfile(MOCK_USER_PROFILE);
      setStats(MOCK_USER_STATS);
      setAchievements(MOCK_ACHIEVEMENTS);
    }
  }, [profile, setProfile, setStats, setAchievements]);

  const displayProfile = profile ?? MOCK_USER_PROFILE;
  const displayStats = stats ?? MOCK_USER_STATS;
  const unlockedCount = MOCK_ACHIEVEMENTS.filter((a) => a.unlockedAt).length;

  const handleLogout = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await AsyncStorage.setItem(STORAGE_KEYS.hasSession, "false");
    router.replace("/signin-credentials");
  }, [router]);

  const handleEditProfile = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/profile/edit");
  }, [router]);

  const handleStats = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/profile/stats");
  }, [router]);

  const handleAchievements = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/profile/achievements");
  }, [router]);

  const handleSettings = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/profile/settings");
  }, [router]);

  return (
    <GradientBackground>
      <DevHubButton />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 20,
            paddingBottom: insets.bottom + 120,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition()}
          style={styles.header}
        >
          <Text style={styles.title}>Profile</Text>
        </MotiView>

        {/* Profile Header */}
        <ProfileHeader
          name={displayProfile.name}
          level={displayProfile.level}
          xp={displayProfile.xp}
          avatarUrl={displayProfile.avatarUrl}
          onAvatarPress={handleEditProfile}
          showEditOverlay
          delay={50}
        />

        {/* Quick Stats Row */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 100 })}
        >
          <GlassPanel style={styles.quickStatsCard}>
            <View style={styles.quickStatItem}>
              <Flame size={20} color={colors.accent[400]} />
              <Text style={styles.quickStatValue}>{displayProfile.streak}</Text>
              <Text style={styles.quickStatLabel}>Streak</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStatItem}>
              <BookOpen size={20} color={colors.secondary[400]} />
              <Text style={styles.quickStatValue}>{displayStats.wordsLearned}</Text>
              <Text style={styles.quickStatLabel}>Words</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStatItem}>
              <Award size={20} color={colors.primary[400]} />
              <Text style={styles.quickStatValue}>{unlockedCount}</Text>
              <Text style={styles.quickStatLabel}>Badges</Text>
            </View>
          </GlassPanel>
        </MotiView>

        {/* Menu Items */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 150 })}
          style={styles.menuSection}
        >
          <GlassPanel style={styles.menuCard}>
            <MenuItem
              icon={<User size={20} color={colors.text.secondary} />}
              label="Edit Profile"
              onPress={handleEditProfile}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon={<BarChart3 size={20} color={colors.text.secondary} />}
              label="View Stats"
              onPress={handleStats}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon={<Award size={20} color={colors.text.secondary} />}
              label="Achievements"
              subtitle={`${unlockedCount} of ${MOCK_ACHIEVEMENTS.length} unlocked`}
              onPress={handleAchievements}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon={<Settings size={20} color={colors.text.secondary} />}
              label="Settings"
              onPress={handleSettings}
            />
          </GlassPanel>
        </MotiView>

        {/* Logout */}
        <MotiView
          from={motionFrom.fade}
          animate={{ opacity: 1 }}
          transition={getTransition({ delay: 200 })}
          style={styles.logoutSection}
        >
          <Pressable onPress={handleLogout} style={styles.logoutButton}>
            <LogOut size={18} color={colors.error} />
            <Text style={styles.logoutText}>Sign out</Text>
          </Pressable>
        </MotiView>
      </ScrollView>
    </GradientBackground>
  );
}

function MenuItem({
  icon,
  label,
  subtitle,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.menuItem}>
      {icon}
      <View style={styles.menuContent}>
        <Text style={styles.menuLabel}>{label}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      <ChevronRight size={20} color={colors.text.muted} />
    </Pressable>
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
    marginBottom: 8,
  },
  title: {
    fontFamily: "Satoshi-Bold",
    fontSize: 32,
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  quickStatsCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
  },
  quickStatItem: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  quickStatValue: {
    fontFamily: "Satoshi-Bold",
    fontSize: 24,
    color: colors.text.primary,
  },
  quickStatLabel: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
  },
  quickStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  menuSection: {
    marginBottom: 24,
  },
  menuCard: {
    borderRadius: 20,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  menuContent: {
    flex: 1,
    gap: 2,
  },
  menuLabel: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 15,
    color: colors.text.primary,
  },
  menuSubtitle: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
  },
  menuDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    marginHorizontal: 16,
  },
  logoutSection: {
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
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 15,
    color: colors.error,
  },
});

