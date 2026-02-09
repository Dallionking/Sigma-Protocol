import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, MessageCircle, Mic, Play, Zap } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { GradientBackground } from "@/components/GradientBackground";
import { GlassPanel } from "@/components/GlassPanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TutorAvatarAnimated } from "@/components/ai";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { useAIStore } from "@/stores/aiStore";
import { colors, durations } from "@/theme/tokens";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function AIHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const { lastSessionMode, lastSessionMessages, resumeSession } = useAIStore();

  const hasResumeableSession = lastSessionMode && lastSessionMessages.length > 0;

  const handleBack = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const handleStartNew = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/practice/ai/mode-select");
  }, [router]);

  const handleResume = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    resumeSession();
    const route =
      lastSessionMode === "voice"
        ? "/practice/ai/voice-talk"
        : `/practice/ai/chat-${lastSessionMode}`;
    router.push(route);
  }, [resumeSession, lastSessionMode, router]);

  const handleQuickMode = useCallback(
    (mode: "chat" | "voice" | "drill") => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (mode === "chat") {
        router.push("/practice/ai/chat-conversation");
      } else if (mode === "voice") {
        router.push("/practice/ai/voice-talk");
      } else {
        router.push("/practice/ai/chat-drill");
      }
    },
    [router]
  );

  return (
    <GradientBackground>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Talk to AI Tutor</Text>
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
        {/* AI Tutor Avatar */}
        <MotiView
          from={motionFrom.scaleIn}
          animate={{ opacity: 1, scale: 1 }}
          transition={getTransition()}
          style={styles.avatarSection}
        >
          <TutorAvatarAnimated state="idle" size={140} />
        </MotiView>

        {/* Welcome message */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 100 })}
          style={styles.welcomeSection}
        >
          <Text style={styles.welcomeTitle}>Hey there!</Text>
          <Text style={styles.welcomeSubtitle}>
            Ready to practice? I'm here to help — no judgment, just learning!
          </Text>
        </MotiView>

        {/* Resume session card */}
        {hasResumeableSession && (
          <MotiView
            from={motionFrom.fadeUp}
            animate={{ opacity: 1, translateY: 0 }}
            transition={getTransition({ delay: 200 })}
          >
            <GlassPanel style={styles.resumeCard}>
              <View style={styles.resumeContent}>
                <View style={styles.resumeIcon}>
                  <Play size={20} color={colors.primary[400]} />
                </View>
                <View style={styles.resumeText}>
                  <Text style={styles.resumeTitle}>Continue Session</Text>
                  <Text style={styles.resumeSubtitle}>
                    {lastSessionMessages.length} messages in {lastSessionMode} mode
                  </Text>
                </View>
              </View>
              <PrimaryButton label="Resume" onPress={handleResume} />
            </GlassPanel>
          </MotiView>
        )}

        {/* Start new session */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({
            delay: hasResumeableSession ? 300 : 200,
          })}
          style={styles.startSection}
        >
          <PrimaryButton
            label="Start New Session"
            onPress={handleStartNew}
            style={styles.startButton}
          />
        </MotiView>

        {/* Quick access modes */}
        <MotiView
          from={motionFrom.fade}
          animate={{ opacity: 1 }}
          transition={getTransition({
            delay: hasResumeableSession ? 400 : 300,
          })}
        >
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.quickModes}>
            <QuickModeCard
              icon={MessageCircle}
              label="Chat"
              onPress={() => handleQuickMode("chat")}
            />
            <QuickModeCard
              icon={Mic}
              label="Voice"
              onPress={() => handleQuickMode("voice")}
            />
            <QuickModeCard
              icon={Zap}
              label="Drill"
              onPress={() => handleQuickMode("drill")}
            />
          </View>
        </MotiView>
      </ScrollView>
    </GradientBackground>
  );
}

function QuickModeCard({
  icon: Icon,
  label,
  onPress,
}: {
  icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(0.95, { duration: durations.fast });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: durations.fast });
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={[styles.quickModeCard, animatedStyle]}
    >
      <View style={styles.quickModeIcon}>
        <Icon size={24} color={colors.secondary[400]} />
      </View>
      <Text style={styles.quickModeLabel}>{label}</Text>
    </AnimatedPressable>
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
  },
  avatarSection: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 24,
  },
  welcomeSection: {
    alignItems: "center",
    marginBottom: 28,
  },
  welcomeTitle: {
    fontFamily: "Satoshi-Bold",
    fontSize: 32,
    color: colors.text.primary,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
  },
  resumeCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
  },
  resumeContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  resumeIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(99, 102, 241, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  resumeText: {
    flex: 1,
  },
  resumeTitle: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 2,
  },
  resumeSubtitle: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.secondary,
  },
  startSection: {
    marginBottom: 32,
  },
  startButton: {
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 14,
  },
  quickModes: {
    flexDirection: "row",
    gap: 12,
  },
  quickModeCard: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.6)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  quickModeIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  quickModeLabel: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 13,
    color: colors.text.primary,
  },
});

