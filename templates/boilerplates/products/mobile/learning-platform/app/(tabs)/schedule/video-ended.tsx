import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Star, Zap, Award, BookOpen } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { GlassPanel } from "@/components/GlassPanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { colors } from "@/theme/tokens";

export default function VideoEndedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const [rating, setRating] = useState(0);

  const handleDone = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace("/schedule");
  }, [router]);

  const handleRating = useCallback((val: number) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRating(val);
  }, []);

  return (
    <GradientBackground>
      <View style={[styles.container, { paddingTop: insets.top + 60 }]}>
        <MotiView
          from={motionFrom.scaleIn}
          animate={{ opacity: 1, scale: 1 }}
          transition={getTransition()}
          style={styles.header}
        >
          <Text style={styles.title}>Great Session!</Text>
          <Text style={styles.subtitle}>
            You just completed 30 minutes of live practice with AI Tutor.
          </Text>
        </MotiView>

        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 200 })}
          style={styles.statsSection}
        >
          <View style={styles.statsGrid}>
            <GlassPanel style={styles.statCard}>
              <Zap size={24} color={colors.secondary[400]} />
              <Text style={styles.statValue}>+50</Text>
              <Text style={styles.statLabel}>XP Earned</Text>
            </GlassPanel>
            <GlassPanel style={styles.statCard}>
              <Award size={24} color={colors.accent[400]} />
              <Text style={styles.statValue}>100%</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </GlassPanel>
          </View>
        </MotiView>

        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 400 })}
          style={styles.ratingSection}
        >
          <Text style={styles.ratingTitle}>How was your session?</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable key={star} onPress={() => handleRating(star)}>
                <Star
                  size={40}
                  color={star <= rating ? colors.accent[400] : colors.text.muted}
                  fill={star <= rating ? colors.accent[400] : "transparent"}
                />
              </Pressable>
            ))}
          </View>
        </MotiView>

        <MotiView
          from={motionFrom.fade}
          animate={{ opacity: 1 }}
          transition={getTransition({ delay: 600 })}
          style={styles.recommendation}
        >
          <GlassPanel style={styles.recommendationCard}>
            <View style={styles.recommendationHeader}>
              <BookOpen size={18} color={colors.secondary[400]} />
              <Text style={styles.recommendationTitle}>Next Recommendation</Text>
            </View>
            <Text style={styles.recommendationText}>
              Review the "Restaurant" vocabulary to prepare for your next session.
            </Text>
          </GlassPanel>
        </MotiView>

        <View style={styles.spacer} />

        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 800 })}
          style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}
        >
          <PrimaryButton label="Back to Schedule" onPress={handleDone} />
        </MotiView>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontFamily: "Satoshi-Bold",
    fontSize: 32,
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
  },
  statsSection: {
    marginBottom: 40,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 16,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    borderRadius: 20,
  },
  statValue: {
    fontFamily: "Satoshi-Bold",
    fontSize: 24,
    color: colors.text.primary,
    marginTop: 12,
  },
  statLabel: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 4,
  },
  ratingSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  ratingTitle: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 20,
  },
  starsRow: {
    flexDirection: "row",
    gap: 12,
  },
  recommendation: {
    marginBottom: 20,
  },
  recommendationCard: {
    padding: 20,
    borderRadius: 20,
  },
  recommendationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  recommendationTitle: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
    color: colors.secondary[400],
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  recommendationText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 15,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  spacer: {
    flex: 1,
  },
  footer: {
    paddingTop: 20,
  },
});

