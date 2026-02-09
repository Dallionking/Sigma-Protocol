import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { MotiView } from "moti";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronLeft,
  Clock,
  CloudMoon,
  CreditCard,
  History,
  Key,
  Layers,
  Lock,
  LogIn,
  Mail,
  MessageCircle,
  Mic,
  RefreshCw,
  ServerCrash,
  Shield,
  ShieldX,
  Sparkles,
  Target,
  TriangleAlert,
  Trophy,
  User,
  Video,
  Wifi,
  WifiOff,
  Wrench,
  XCircle,
  Zap,
} from "lucide-react-native";

import { GradientBackground } from "@/components/GradientBackground";
import { GlassPanel } from "@/components/GlassPanel";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import { colors } from "@/theme/tokens";

type NetworkMode = "auto" | "forceOnline" | "forceOffline";

export default function DevHubScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [hydrated, setHydrated] = useState(false);
  const [actualNetwork, setActualNetwork] = useState<null | boolean>(null);

  const [networkMode, setNetworkMode] = useState<NetworkMode>("auto");
  const [maintenance, setMaintenance] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);
  const [hasLaunched, setHasLaunched] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  const load = useCallback(async () => {
    const net = await NetInfo.fetch();
    const connected = !!(net.isConnected && net.isInternetReachable !== false);
    setActualNetwork(connected);

    const pairs = await AsyncStorage.multiGet([
      STORAGE_KEYS.hasLaunched,
      STORAGE_KEYS.onboardingComplete,
      STORAGE_KEYS.hasSession,
      STORAGE_KEYS.maintenance,
      STORAGE_KEYS.forceUpdate,
      STORAGE_KEYS.networkOverride,
      STORAGE_KEYS.demoMode,
    ]);

    const map = Object.fromEntries(pairs);

    const networkOverride = map[STORAGE_KEYS.networkOverride];
    const resolvedMode: NetworkMode =
      networkOverride === "true"
        ? "forceOnline"
        : networkOverride === "false"
          ? "forceOffline"
          : "auto";

    setNetworkMode(resolvedMode);
    setMaintenance(map[STORAGE_KEYS.maintenance] === "true");
    setForceUpdate(map[STORAGE_KEYS.forceUpdate] === "true");
    setHasLaunched(map[STORAGE_KEYS.hasLaunched] === "true");
    setOnboardingComplete(map[STORAGE_KEYS.onboardingComplete] === "true");
    setHasSession(map[STORAGE_KEYS.hasSession] === "true");
    setDemoMode(map[STORAGE_KEYS.demoMode] === "true");
    setHydrated(true);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const setBool = useCallback(async (key: string, value: boolean) => {
    await AsyncStorage.setItem(key, value ? "true" : "false");
  }, []);

  const setNetwork = useCallback(async (mode: NetworkMode) => {
    setNetworkMode(mode);

    if (mode === "auto") {
      await AsyncStorage.removeItem(STORAGE_KEYS.networkOverride);
      return;
    }

    await AsyncStorage.setItem(
      STORAGE_KEYS.networkOverride,
      mode === "forceOnline" ? "true" : "false"
    );
  }, []);

  const computedNext = useMemo(() => {
    const computedHasNetwork =
      networkMode === "auto"
        ? actualNetwork ?? true
        : networkMode === "forceOnline";

    const isFirstLaunch = !hasLaunched;

    if (!computedHasNetwork) return "/error-offline";
    if (maintenance) return "/maintenance";
    if (forceUpdate) return "/update-required";
    if (isFirstLaunch || !onboardingComplete) return "/welcome";
    if (hasSession) return "/(tabs)/home";
    return "/signin-credentials";
  }, [actualNetwork, forceUpdate, hasLaunched, hasSession, maintenance, networkMode, onboardingComplete]);

  const resetAndRestart = useCallback(async () => {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.hasLaunched,
      STORAGE_KEYS.onboardingComplete,
      STORAGE_KEYS.hasSession,
      STORAGE_KEYS.maintenance,
      STORAGE_KEYS.forceUpdate,
      STORAGE_KEYS.networkOverride,
    ]);
    router.replace("/splash");
  }, [router]);

  const resetDemoFlags = useCallback(async () => {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.maintenance,
      STORAGE_KEYS.forceUpdate,
      STORAGE_KEYS.networkOverride,
    ]);
    await load();
  }, [load]);

  return (
    <GradientBackground>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Developer Hub</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 300 }}
        >
          <GlassPanel style={styles.section}>
            <SectionHeader
              icon={<Zap size={18} color={colors.accent[400]} />}
              title="Quick Actions"
            />

            <View style={styles.quickActionsGrid}>
              <QuickAction
                icon={<RefreshCw size={20} color={colors.primary[400]} />}
                label="Fresh Start"
                sublabel="Reset & restart"
                onPress={resetAndRestart}
                color={colors.primary[400]}
              />
              <QuickAction
                icon={<CloudMoon size={20} color={colors.secondary[400]} />}
                label="Go to Splash"
                sublabel="Run gate logic"
                onPress={() => router.replace("/splash")}
                color={colors.secondary[400]}
              />
            </View>
          </GlassPanel>
        </MotiView>

        {/* Gate Status */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 300, delay: 100 }}
        >
          <GlassPanel style={styles.section}>
            <SectionHeader
              icon={<Shield size={18} color={colors.secondary[400]} />}
              title="Gate Status"
            />

            <View style={styles.statusGrid}>
              <StatusItem
                label="Network"
                value={hydrated ? (actualNetwork ? "Online" : "Offline") : "..."}
                active={actualNetwork ?? false}
              />
              <StatusItem
                label="Launched"
                value={hasLaunched ? "Yes" : "No"}
                active={hasLaunched}
              />
              <StatusItem
                label="Onboarded"
                value={onboardingComplete ? "Yes" : "No"}
                active={onboardingComplete}
              />
              <StatusItem
                label="Session"
                value={hasSession ? "Active" : "None"}
                active={hasSession}
              />
            </View>

            <View style={styles.nextRouteBox}>
              <Text style={styles.nextRouteLabel}>Next route:</Text>
              <Text style={styles.nextRouteValue}>{computedNext}</Text>
            </View>
          </GlassPanel>
        </MotiView>

        {/* Screen Navigation */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 300, delay: 200 }}
        >
          <GlassPanel style={styles.section}>
            <SectionHeader
              icon={<Layers size={18} color={colors.primary[400]} />}
              title="Screen Navigation"
            />

            <Text style={styles.categoryLabel}>Launch</Text>
            <View style={styles.navGrid}>
              <NavButton icon={<CloudMoon size={16} color={colors.text.primary} />} label="Splash" onPress={() => router.push("/splash")} />
              <NavButton icon={<Wrench size={16} color={colors.text.primary} />} label="Maintenance" onPress={() => router.push("/maintenance")} />
              <NavButton icon={<TriangleAlert size={16} color={colors.text.primary} />} label="Update" onPress={() => router.push("/update-required")} />
            </View>

            <Text style={styles.categoryLabel}>Onboarding</Text>
            <View style={styles.navGrid}>
              <NavButton icon={<Sparkles size={16} color={colors.text.primary} />} label="Welcome" onPress={() => router.push("/welcome")} />
              <NavButton icon={<Target size={16} color={colors.text.primary} />} label="Goal" onPress={() => router.push("/goal-select")} />
              <NavButton icon={<Layers size={16} color={colors.text.primary} />} label="Level" onPress={() => router.push("/level-select")} />
              <NavButton icon={<MessageCircle size={16} color={colors.text.primary} />} label="Why" onPress={() => router.push("/why-learn")} />
              <NavButton icon={<Mic size={16} color={colors.text.primary} />} label="Fast Win" onPress={() => router.push("/fast-win")} />
              <NavButton icon={<CheckCircle size={16} color={colors.text.primary} />} label="Success" onPress={() => router.push("/fast-win-success")} />
              <NavButton icon={<Bell size={16} color={colors.text.primary} />} label="Notifs" onPress={() => router.push("/notifications")} />
              <NavButton icon={<CheckCircle size={16} color={colors.text.primary} />} label="Complete" onPress={() => router.push("/complete")} />
            </View>

            <Text style={styles.categoryLabel}>Auth - Signup</Text>
            <View style={styles.navGrid}>
              <NavButton icon={<Mail size={16} color={colors.text.primary} />} label="Email" onPress={() => router.push("/signup-email")} />
              <NavButton icon={<Key size={16} color={colors.text.primary} />} label="Verify" onPress={() => router.push("/signup-verify")} />
              <NavButton icon={<Lock size={16} color={colors.text.primary} />} label="Password" onPress={() => router.push("/signup-password")} />
              <NavButton icon={<User size={16} color={colors.text.primary} />} label="Name" onPress={() => router.push("/signup-name")} />
              <NavButton icon={<Sparkles size={16} color={colors.text.primary} />} label="Success" onPress={() => router.push("/signup-success")} />
            </View>

            <Text style={styles.categoryLabel}>Auth - Signin</Text>
            <View style={styles.navGrid}>
              <NavButton icon={<LogIn size={16} color={colors.text.primary} />} label="Credentials" onPress={() => router.push("/signin-credentials")} />
              <NavButton icon={<Shield size={16} color={colors.text.primary} />} label="2FA" onPress={() => router.push("/signin-2fa")} />
              <NavButton icon={<CheckCircle size={16} color={colors.text.primary} />} label="Success" onPress={() => router.push("/signin-success")} />
            </View>

            <Text style={styles.categoryLabel}>Auth - Forgot</Text>
            <View style={styles.navGrid}>
              <NavButton icon={<Mail size={16} color={colors.text.primary} />} label="Email" onPress={() => router.push("/forgot-email")} />
              <NavButton icon={<Bell size={16} color={colors.text.primary} />} label="Check" onPress={() => router.push("/forgot-check-email")} />
              <NavButton icon={<Lock size={16} color={colors.text.primary} />} label="Reset" onPress={() => router.push("/forgot-reset")} />
              <NavButton icon={<Wifi size={16} color={colors.text.primary} />} label="OAuth" onPress={() => router.push("/oauth-callback")} />
            </View>

            <Text style={styles.categoryLabel}>Practice</Text>
            <View style={styles.navGrid}>
              <NavButton icon={<Activity size={16} color={colors.text.primary} />} label="Home" onPress={() => router.push("/(tabs)/practice")} />
              <NavButton icon={<MessageCircle size={16} color={colors.text.primary} />} label="AI Tutor" onPress={() => router.push("/practice/ai")} />
            </View>

            <Text style={styles.categoryLabel}>Schedule</Text>
            <View style={styles.navGrid}>
              <NavButton icon={<Calendar size={16} color={colors.text.primary} />} label="Home" onPress={() => router.push("/(tabs)/schedule")} />
              <NavButton icon={<Calendar size={16} color={colors.text.primary} />} label="Calendar" onPress={() => router.push("/schedule/calendar")} />
              <NavButton icon={<Zap size={16} color={colors.text.primary} />} label="Success" onPress={() => router.push("/schedule/success")} />
              <NavButton icon={<Activity size={16} color={colors.text.primary} />} label="Upcoming" onPress={() => router.push("/schedule/upcoming")} />
              <NavButton icon={<History size={16} color={colors.text.primary} />} label="History" onPress={() => router.push("/schedule/past-sessions")} />
              <NavButton icon={<Video size={16} color={colors.text.primary} />} label="Video Room" onPress={() => router.push("/schedule/video-room")} />
              <NavButton icon={<CheckCircle size={16} color={colors.text.primary} />} label="Ended" onPress={() => router.push("/schedule/video-ended")} />
            </View>

            <Text style={styles.categoryLabel}>Feed</Text>
            <View style={styles.navGrid}>
              <NavButton icon={<Activity size={16} color={colors.text.primary} />} label="Home" onPress={() => router.push("/home/feed")} />
              <NavButton icon={<MessageCircle size={16} color={colors.text.primary} />} label="Comments" onPress={() => router.push("/home/feed/comments?postId=post_001")} />
              <NavButton icon={<BookOpen size={16} color={colors.text.primary} />} label="Homework" onPress={() => router.push("/home/feed/homework")} />
              <NavButton icon={<Zap size={16} color={colors.text.primary} />} label="Create" onPress={() => router.push("/home/feed/create-post")} />
            </View>

            <Text style={styles.categoryLabel}>Profile</Text>
            <View style={styles.navGrid}>
              <NavButton icon={<User size={16} color={colors.text.primary} />} label="Home" onPress={() => router.push("/profile")} />
              <NavButton icon={<Activity size={16} color={colors.text.primary} />} label="Stats" onPress={() => router.push("/profile/stats")} />
              <NavButton icon={<Shield size={16} color={colors.text.primary} />} label="Achievements" onPress={() => router.push("/profile/achievements")} />
              <NavButton icon={<User size={16} color={colors.text.primary} />} label="Edit" onPress={() => router.push("/profile/edit")} />
              <NavButton icon={<Target size={16} color={colors.text.primary} />} label="Settings" onPress={() => router.push("/profile/settings")} />
              <NavButton icon={<Bell size={16} color={colors.text.primary} />} label="Notifications" onPress={() => router.push("/profile/settings-notifications")} />
              <NavButton icon={<Shield size={16} color={colors.text.primary} />} label="Privacy" onPress={() => router.push("/profile/settings-privacy")} />
              <NavButton icon={<Layers size={16} color={colors.text.primary} />} label="Appearance" onPress={() => router.push("/profile/settings-appearance")} />
            </View>

            <Text style={styles.categoryLabel}>Subscription</Text>
            <View style={styles.navGrid}>
              <NavButton icon={<Zap size={16} color={colors.text.primary} />} label="Paywall" onPress={() => router.push("/subscription/paywall")} />
              <NavButton icon={<Layers size={16} color={colors.text.primary} />} label="Compare" onPress={() => router.push("/subscription/plan-compare")} />
              <NavButton icon={<CreditCard size={16} color={colors.text.primary} />} label="Checkout" onPress={() => router.push("/subscription/checkout")} />
              <NavButton icon={<CheckCircle size={16} color={colors.text.primary} />} label="Success" onPress={() => router.push("/subscription/success")} />
              <NavButton icon={<Target size={16} color={colors.text.primary} />} label="Manage" onPress={() => router.push("/subscription/manage")} />
              <NavButton icon={<XCircle size={16} color={colors.text.primary} />} label="Cancel" onPress={() => router.push("/subscription/cancel")} />
            </View>

            <Text style={styles.categoryLabel}>Home</Text>
            <View style={styles.navGrid}>
              <NavButton icon={<Activity size={16} color={colors.text.primary} />} label="Dashboard" onPress={() => router.push("/(tabs)/home")} />
            </View>

            <Text style={styles.categoryLabel}>Error States</Text>
            <View style={styles.navGrid}>
              <NavButton icon={<WifiOff size={16} color={colors.text.primary} />} label="Offline" onPress={() => router.push("/(states)/error-offline")} />
              <NavButton icon={<AlertCircle size={16} color={colors.text.primary} />} label="Generic" onPress={() => router.push("/(states)/error-generic")} />
              <NavButton icon={<ServerCrash size={16} color={colors.text.primary} />} label="Server" onPress={() => router.push("/(states)/error-server")} />
              <NavButton icon={<ShieldX size={16} color={colors.text.primary} />} label="Access" onPress={() => router.push("/(states)/error-access-denied")} />
              <NavButton icon={<Clock size={16} color={colors.text.primary} />} label="Expired" onPress={() => router.push("/(states)/error-session-expired")} />
            </View>

            <Text style={styles.categoryLabel}>Empty States</Text>
            <View style={styles.navGrid}>
              <NavButton icon={<BookOpen size={16} color={colors.text.primary} />} label="Lessons" onPress={() => router.push("/(states)/empty-lessons")} />
              <NavButton icon={<Calendar size={16} color={colors.text.primary} />} label="Bookings" onPress={() => router.push("/(states)/empty-bookings")} />
              <NavButton icon={<Trophy size={16} color={colors.text.primary} />} label="Achievements" onPress={() => router.push("/(states)/empty-achievements")} />
            </View>
          </GlassPanel>
        </MotiView>

        {/* Overrides */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 300, delay: 300 }}
        >
          <GlassPanel style={styles.section}>
            <SectionHeader
              icon={<Wrench size={18} color={colors.accent[400]} />}
              title="State Overrides"
            />

            {/* Demo Mode - Highlighted Toggle */}
            <View style={styles.demoModeContainer}>
              <View style={styles.demoModeInfo}>
                <View style={styles.demoModeBadge}>
                  <RefreshCw size={14} color={colors.primary[400]} />
                  <Text style={styles.demoModeBadgeText}>DEMO MODE</Text>
                </View>
                <Text style={styles.demoModeDescription}>
                  Resets all state on every app refresh
                </Text>
              </View>
              <Switch
                value={demoMode}
                onValueChange={async (v) => {
                  setDemoMode(v);
                  await AsyncStorage.setItem(STORAGE_KEYS.demoMode, v ? "true" : "false");
                }}
                trackColor={{
                  false: "rgba(148, 163, 184, 0.3)",
                  true: colors.primary[500],
                }}
                thumbColor={colors.text.primary}
                ios_backgroundColor="rgba(148, 163, 184, 0.3)"
              />
            </View>
            {demoMode && (
              <View style={styles.demoModeActiveNotice}>
                <Text style={styles.demoModeActiveText}>
                  Active: App will start fresh on next refresh
                </Text>
              </View>
            )}

            <Text style={styles.categoryLabel}>Network Mode</Text>
            <View style={styles.modeChipsRow}>
              <ModeChip label="Auto" active={networkMode === "auto"} onPress={() => setNetwork("auto")} />
              <ModeChip label="Force Online" active={networkMode === "forceOnline"} onPress={() => setNetwork("forceOnline")} />
              <ModeChip label="Force Offline" active={networkMode === "forceOffline"} onPress={() => setNetwork("forceOffline")} />
            </View>

            <View style={styles.togglesContainer}>
              <ToggleRow
                title="Maintenance Mode"
                value={maintenance}
                onValueChange={async (v) => {
                  setMaintenance(v);
                  await setBool(STORAGE_KEYS.maintenance, v);
                }}
              />
              <ToggleRow
                title="Force Update"
                value={forceUpdate}
                onValueChange={async (v) => {
                  setForceUpdate(v);
                  await setBool(STORAGE_KEYS.forceUpdate, v);
                }}
              />
              <ToggleRow
                title="Onboarding Complete"
                value={onboardingComplete}
                onValueChange={async (v) => {
                  setOnboardingComplete(v);
                  await setBool(STORAGE_KEYS.onboardingComplete, v);
                }}
              />
              <ToggleRow
                title="Has Session"
                value={hasSession}
                onValueChange={async (v) => {
                  setHasSession(v);
                  await setBool(STORAGE_KEYS.hasSession, v);
                }}
              />
              <ToggleRow
                title="Has Launched"
                value={hasLaunched}
                onValueChange={async (v) => {
                  setHasLaunched(v);
                  if (!v) await AsyncStorage.removeItem(STORAGE_KEYS.hasLaunched);
                  else await setBool(STORAGE_KEYS.hasLaunched, true);
                }}
              />
            </View>
          </GlassPanel>
        </MotiView>

        {/* Reset Section */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 300, delay: 400 }}
        >
          <GlassPanel style={styles.section}>
            <SectionHeader
              icon={<RefreshCw size={18} color={colors.error} />}
              title="Reset Options"
            />

            <Pressable style={styles.resetButton} onPress={resetDemoFlags}>
              <View>
                <Text style={styles.resetButtonTitle}>Clear Demo Flags</Text>
                <Text style={styles.resetButtonSubtitle}>
                  Maintenance, update, network overrides
                </Text>
              </View>
              <ArrowRight size={18} color={colors.text.muted} />
            </Pressable>

            <Pressable style={[styles.resetButton, styles.resetButtonDanger]} onPress={resetAndRestart}>
              <View>
                <Text style={styles.resetButtonTitle}>Full Reset & Restart</Text>
                <Text style={styles.resetButtonSubtitle}>
                  Clear everything, go to splash
                </Text>
              </View>
              <ArrowRight size={18} color={colors.primary[400]} />
            </Pressable>
          </GlassPanel>
        </MotiView>
      </ScrollView>
    </GradientBackground>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIconWrapper}>{icon}</View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function QuickAction({
  icon,
  label,
  sublabel,
  onPress,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  onPress: () => void;
  color: string;
}) {
  return (
    <Pressable style={styles.quickAction} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: `${color}15` }]}>
        {icon}
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
      <Text style={styles.quickActionSublabel}>{sublabel}</Text>
    </Pressable>
  );
}

function StatusItem({ label, value, active }: { label: string; value: string; active: boolean }) {
  return (
    <View style={styles.statusItem}>
      <View style={[styles.statusDot, active && styles.statusDotActive]} />
      <Text style={styles.statusLabel}>{label}</Text>
      <Text style={styles.statusValue}>{value}</Text>
    </View>
  );
}

function NavButton({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.navButton} onPress={onPress}>
      {icon}
      <Text style={styles.navButtonLabel}>{label}</Text>
    </Pressable>
  );
}

function ModeChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      style={[styles.modeChip, active && styles.modeChipActive]}
      onPress={onPress}
    >
      <Text style={[styles.modeChipLabel, active && styles.modeChipLabelActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function ToggleRow({
  title,
  value,
  onValueChange,
}: {
  title: string;
  value: boolean;
  onValueChange: (next: boolean) => void | Promise<void>;
}) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleTitle}>{title}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: "rgba(148, 163, 184, 0.3)",
          true: colors.secondary[500],
        }}
        thumbColor={colors.text.primary}
        ios_backgroundColor="rgba(148, 163, 184, 0.3)"
      />
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
  scrollContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sectionTitle: {
    fontFamily: "Satoshi-Bold",
    fontSize: 17,
    color: colors.text.primary,
    letterSpacing: -0.2,
  },
  quickActionsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  quickAction: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  quickActionLabel: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 2,
  },
  quickActionSublabel: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
  },
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  statusItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.text.muted,
  },
  statusDotActive: {
    backgroundColor: colors.success,
  },
  statusLabel: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
    flex: 1,
  },
  statusValue: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 12,
    color: colors.text.primary,
  },
  nextRouteBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(6, 182, 212, 0.08)",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.2)",
  },
  nextRouteLabel: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.secondary,
  },
  nextRouteValue: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 13,
    color: colors.secondary[400],
  },
  categoryLabel: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 11,
    color: colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 16,
  },
  navGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  navButtonLabel: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.primary,
  },
  modeChipsRow: {
    flexDirection: "row",
    gap: 8,
  },
  modeChip: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  modeChipActive: {
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    borderColor: colors.secondary[500],
  },
  modeChipLabel: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
  },
  modeChipLabelActive: {
    color: colors.secondary[400],
    fontFamily: "PlusJakartaSans-SemiBold",
  },
  togglesContainer: {
    marginTop: 20,
    gap: 4,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.06)",
  },
  toggleTitle: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.primary,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  resetButtonDanger: {
    borderColor: "rgba(99, 102, 241, 0.3)",
    backgroundColor: "rgba(99, 102, 241, 0.06)",
  },
  resetButtonTitle: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 2,
  },
  resetButtonSubtitle: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
  },
  demoModeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(99, 102, 241, 0.08)",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.25)",
  },
  demoModeInfo: {
    flex: 1,
    marginRight: 12,
  },
  demoModeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  demoModeBadgeText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 12,
    color: colors.primary[400],
    letterSpacing: 0.5,
  },
  demoModeDescription: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.secondary,
  },
  demoModeActiveNotice: {
    marginTop: 8,
    backgroundColor: "rgba(99, 102, 241, 0.12)",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  demoModeActiveText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.primary[400],
    textAlign: "center",
  },
});
