import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Play, Volume2, VolumeX } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  interpolate,
} from "react-native-reanimated";

import { GradientBackground } from "@/components/GradientBackground";
import { DevHubButton } from "@/components/DevHubButton";
import { GlassPanel } from "@/components/GlassPanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { colors, springs } from "@/theme/tokens";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Mock concept data
const VERB_DATA = {
  infinitive: "SYNTHESIS",
  translation: "combining ideas into a whole",
  pronunciation: "/ˈsɪnθəsɪs/",
  type: "Key Concept",
  conjugations: [
    { pronoun: "Noun", form: "synthesis" },
    { pronoun: "Verb", form: "synthesize" },
    { pronoun: "Adjective", form: "synthetic" },
    { pronoun: "Adverb", form: "synthetically" },
    { pronoun: "Related", form: "analyze" },
    { pronoun: "Opposite", form: "decompose" },
  ],
  examples: [
    { term: "Synthesis requires understanding multiple perspectives.", definition: "Combining ideas from different sources." },
    { term: "Can you synthesize the key takeaways?", definition: "Combine the main points into one summary." },
    { term: "Critical thinking involves analysis and synthesis.", definition: "Both breaking down and building up ideas." },
  ],
};

export default function VerbOfDayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const [isPlaying, setIsPlaying] = useState(false);
  const pulseScale = useSharedValue(1);
  const audioWave = useSharedValue(0);
  const backScale = useSharedValue(1);

  // Pulse animation for audio button
  React.useEffect(() => {
    if (reduceMotion) return;

    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1200, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
  }, [reduceMotion, pulseScale]);

  // Audio wave animation when playing
  React.useEffect(() => {
    if (isPlaying && !reduceMotion) {
      audioWave.value = withRepeat(
        withTiming(1, { duration: 500 }),
        -1,
        true
      );
    } else {
      audioWave.value = withTiming(0, { duration: 200 });
    }
  }, [isPlaying, reduceMotion, audioWave]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const waveStyle = useAnimatedStyle(() => ({
    opacity: interpolate(audioWave.value, [0, 1], [0.3, 0.8]),
    transform: [{ scale: interpolate(audioWave.value, [0, 1], [1, 1.3]) }],
  }));

  const backButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backScale.value }],
  }));

  const handleBack = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const handleBackPressIn = useCallback(() => {
    backScale.value = reduceMotion ? 0.95 : withTiming(0.95, { duration: durations.fast });
  }, [backScale, reduceMotion]);

  const handleBackPressOut = useCallback(() => {
    backScale.value = reduceMotion ? 1 : withTiming(1, { duration: durations.fast });
  }, [backScale, reduceMotion]);

  const handlePlayAudio = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsPlaying(true);
    // Simulate audio playback
    setTimeout(() => {
      setIsPlaying(false);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 2000);
  }, []);

  const handlePractice = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log("Practice verb");
  }, []);

  return (
    <GradientBackground>
      <DevHubButton />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <AnimatedPressable
          onPress={handleBack}
          onPressIn={handleBackPressIn}
          onPressOut={handleBackPressOut}
          style={[styles.backButton, backButtonStyle]}
        >
          <ArrowLeft size={24} color={colors.text.primary} />
        </AnimatedPressable>
        <Text style={styles.headerTitle}>Concept of the Day</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 180 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Main verb display */}
        <MotiView
          from={motionFrom.scaleIn}
          animate={{ opacity: 1, scale: 1 }}
          transition={getTransition({ type: "timing", duration: 260, delay: 100 })}
          style={styles.verbSection}
        >
          {/* Verb type badge */}
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{VERB_DATA.type}</Text>
          </View>

          <Text style={styles.infinitive}>{VERB_DATA.infinitive}</Text>
          <Text style={styles.translation}>{VERB_DATA.translation}</Text>
          <Text style={styles.pronunciation}>{VERB_DATA.pronunciation}</Text>

          {/* Audio button with wave effect */}
          <View style={styles.audioContainer}>
            {/* Wave rings */}
            {isPlaying && (
              <>
                <Animated.View style={[styles.audioWave, waveStyle]} />
                <Animated.View style={[styles.audioWave, styles.audioWave2, waveStyle]} />
              </>
            )}
            
            <Animated.View style={[styles.audioButtonWrapper, !reduceMotion && !isPlaying && pulseStyle]}>
              <Pressable
                onPress={handlePlayAudio}
                style={[styles.audioButton, isPlaying && styles.audioButtonPlaying]}
                disabled={isPlaying}
              >
                {isPlaying ? (
                  <Volume2 size={28} color={colors.text.primary} />
                ) : (
                  <Play size={28} color={colors.text.primary} fill={colors.text.primary} />
                )}
              </Pressable>
            </Animated.View>
          </View>

          <Text style={styles.audioHint}>
            {isPlaying ? "Playing..." : "Tap to hear pronunciation"}
          </Text>
        </MotiView>

        {/* Conjugation table */}
        <MotiView
          from={motionFrom.fadeUpLarge}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ type: "timing", duration: 400, delay: 200 })}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Word Forms</Text>
            <Text style={styles.sectionSubtitle}>Variations</Text>
          </View>
          <GlassPanel style={styles.conjugationCard}>
            {VERB_DATA.conjugations.map((conj, index) => (
              <MotiView
                key={conj.pronoun}
                from={reduceMotion ? undefined : { opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{
                  type: "timing",
                  duration: 300,
                  delay: reduceMotion ? 0 : 250 + index * 50,
                }}
                style={[
                  styles.conjugationRow,
                  index < VERB_DATA.conjugations.length - 1 && styles.conjugationRowBorder,
                ]}
              >
                <Text style={styles.pronoun}>{conj.pronoun}</Text>
                <Text style={styles.verbForm}>{conj.form}</Text>
              </MotiView>
            ))}
          </GlassPanel>
        </MotiView>

        {/* Examples */}
        <MotiView
          from={motionFrom.fadeUpLarge}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ type: "timing", duration: 400, delay: 400 })}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Examples</Text>
            <Text style={styles.sectionSubtitle}>In Context</Text>
          </View>
          {VERB_DATA.examples.map((example, index) => (
            <MotiView
              key={index}
              from={reduceMotion ? undefined : { opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{
                type: "timing",
                duration: 300,
                delay: reduceMotion ? 0 : 450 + index * 80,
              }}
            >
              <GlassPanel style={styles.exampleCard}>
                <View style={styles.exampleNumber}>
                  <Text style={styles.exampleNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.exampleContent}>
                  <Text style={styles.exampleTerm}>{example.term}</Text>
                  <Text style={styles.exampleDefinition}>{example.definition}</Text>
                </View>
              </GlassPanel>
            </MotiView>
          ))}
        </MotiView>

        {/* Practice CTA */}
        <MotiView
          from={motionFrom.fadeUpLarge}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ type: "timing", duration: 400, delay: 600 })}
          style={styles.ctaSection}
        >
          <PrimaryButton label="Practice this concept" onPress={handlePractice} />
        </MotiView>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  headerTitle: {
    flex: 1,
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 17,
    color: colors.text.primary,
    textAlign: "center",
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  verbSection: {
    alignItems: "center",
    paddingVertical: 32,
    marginBottom: 24,
  },
  typeBadge: {
    backgroundColor: "rgba(6, 182, 212, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  typeBadgeText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 12,
    color: colors.secondary[400],
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infinitive: {
    fontFamily: "Satoshi-Bold",
    fontSize: 64,
    color: colors.text.primary,
    letterSpacing: -2,
  },
  translation: {
    fontFamily: "PlusJakartaSans",
    fontSize: 22,
    color: colors.text.secondary,
    marginTop: 4,
    fontStyle: "italic",
  },
  pronunciation: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: colors.text.muted,
    marginTop: 8,
  },
  audioContainer: {
    position: "relative",
    marginTop: 28,
    alignItems: "center",
    justifyContent: "center",
    width: 100,
    height: 100,
  },
  audioWave: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: colors.secondary[400],
  },
  audioWave2: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  audioButtonWrapper: {},
  audioButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary[500],
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary[500],
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
  },
  audioButtonPlaying: {
    backgroundColor: colors.secondary[500],
    shadowColor: colors.secondary[500],
  },
  audioHint: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.muted,
    marginTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 18,
    color: colors.text.primary,
  },
  sectionSubtitle: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.muted,
    fontStyle: "italic",
  },
  conjugationCard: {
    padding: 4,
    borderRadius: 20,
  },
  conjugationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  conjugationRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.06)",
  },
  pronoun: {
    fontFamily: "PlusJakartaSans",
    fontSize: 15,
    color: colors.text.secondary,
  },
  verbForm: {
    fontFamily: "Satoshi-Bold",
    fontSize: 20,
    color: colors.text.primary,
  },
  exampleCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    gap: 14,
  },
  exampleNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  exampleNumberText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 13,
    color: colors.text.muted,
  },
  exampleContent: {
    flex: 1,
  },
  exampleTerm: {
    fontFamily: "Satoshi-Bold",
    fontSize: 17,
    color: colors.text.primary,
    marginBottom: 4,
  },
  exampleDefinition: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.secondary,
  },
  ctaSection: {
    marginTop: 8,
    marginBottom: 20,
  },
});



