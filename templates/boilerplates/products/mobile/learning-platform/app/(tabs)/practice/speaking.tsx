import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Mic, MicOff, Volume2 } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { GradientBackground } from "@/components/GradientBackground";
import { GlassPanel } from "@/components/GlassPanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { PracticeHeader } from "@/components/practice";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { useReduceMotion } from "@/hooks/useReduceMotion";
import { SPEAKING_PROMPTS } from "@/lib/practice/mockExercises";
import { usePracticeStore } from "@/stores/practiceStore";
import { colors, durations } from "@/theme/tokens";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function SpeakingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();
  const { getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const {
    currentQuestionIndex,
    totalQuestions,
    startSession,
    nextQuestion,
    setPronunciationScore,
  } = usePracticeStore();

  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);

  const questions = SPEAKING_PROMPTS;
  const currentQuestion = questions[currentQuestionIndex];

  // Animation values
  const micScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);
  const waveformProgress = useSharedValue(0);

  // Initialize session on mount
  useEffect(() => {
    startSession("speaking", questions.length);
  }, [startSession, questions.length]);

  // Pulse animation while recording
  useEffect(() => {
    if (isRecording && !reduceMotion) {
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 600, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.2, { duration: 600, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      );

      waveformProgress.value = withRepeat(
        withTiming(1, { duration: 1500, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      pulseOpacity.value = withTiming(0, { duration: 200 });
      waveformProgress.value = 0;
    }
  }, [isRecording, reduceMotion, pulseOpacity, waveformProgress]);

  const handleStartRecording = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRecording(true);
    micScale.value = reduceMotion ? 1.1 : withTiming(1.1, { duration: durations.fast });
  }, [micScale, reduceMotion]);

  const handleStopRecording = useCallback(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsRecording(false);
    setHasRecorded(true);
    micScale.value = reduceMotion ? 1 : withTiming(1, { duration: durations.fast });

    // Simulate pronunciation scoring
    const mockScore = 70 + Math.floor(Math.random() * 25); // 70-95
    const mockFeedback = [
      { word: "mesa", score: mockScore > 80 ? 90 : 65, tip: mockScore > 80 ? undefined : "Soften the 's'" },
      { word: "para", score: mockScore > 75 ? 85 : 60, tip: mockScore > 75 ? undefined : "Roll the 'r' slightly" },
      { word: "dos", score: 88 },
    ];

    setPronunciationScore(mockScore, mockFeedback);
  }, [micScale, reduceMotion, setPronunciationScore]);

  const handlePlayAudio = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // In production, this would play the native speaker audio via expo-av
    // For now, provide haptic feedback to indicate the action was received
  }, []);

  const handleContinue = useCallback(() => {
    router.push("/practice/pronunciation-score");
  }, [router]);

  const handleSkip = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentQuestionIndex < questions.length - 1) {
      nextQuestion();
      setHasRecorded(false);
    } else {
      router.replace("/practice/result");
    }
  }, [currentQuestionIndex, questions.length, nextQuestion, router]);

  const micButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: micScale.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
    transform: [{ scale: 1 + pulseOpacity.value * 0.3 }],
  }));

  if (!currentQuestion) {
    return null;
  }

  return (
    <GradientBackground>
      <PracticeHeader
        currentQuestion={currentQuestionIndex}
        totalQuestions={totalQuestions || questions.length}
        title="Speaking"
        showClose
        onClose={() => router.back()}
      />

      <View style={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
        {/* Phrase to speak */}
        <MotiView
          key={currentQuestion.id}
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition()}
        >
          <GlassPanel style={styles.phraseCard}>
            <Text style={styles.speakLabel}>Say this phrase:</Text>
            <Text style={styles.phraseText}>{currentQuestion.phrase}</Text>
            <Text style={styles.translationText}>{currentQuestion.translation}</Text>

            {/* Play audio button */}
            <Pressable onPress={handlePlayAudio} style={styles.playButton}>
              <Volume2 size={20} color={colors.secondary[400]} />
              <Text style={styles.playButtonText}>Listen</Text>
            </Pressable>
          </GlassPanel>
        </MotiView>

        {/* Microphone Button */}
        <MotiView
          from={motionFrom.scaleIn}
          animate={{ opacity: 1, scale: 1 }}
          transition={getTransition({ delay: 100 })}
          style={styles.micSection}
        >
          <View style={styles.micContainer}>
            {/* Pulse effect */}
            {isRecording && (
              <Animated.View style={[styles.micPulse, pulseStyle]} />
            )}

            <AnimatedPressable
              onPressIn={handleStartRecording}
              onPressOut={handleStopRecording}
              style={[
                styles.micButton,
                isRecording && styles.micButtonRecording,
                hasRecorded && styles.micButtonDone,
                micButtonStyle,
              ]}
            >
              {isRecording ? (
                <MicOff size={40} color={colors.error} />
              ) : (
                <Mic size={40} color={hasRecorded ? colors.success : colors.text.primary} />
              )}
            </AnimatedPressable>
          </View>

          <Text style={styles.micHint}>
            {isRecording
              ? "Release when done..."
              : hasRecorded
                ? "Recording complete!"
                : "Hold to speak"}
          </Text>
        </MotiView>

        {/* Waveform placeholder */}
        {isRecording && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={styles.waveformSection}
          >
            <WaveformVisualizer />
          </MotiView>
        )}

        {/* AI Tutor's tip */}
        <MotiView
          from={motionFrom.fade}
          animate={{ opacity: 1 }}
          transition={getTransition({ delay: 200 })}
          style={styles.tipSection}
        >
          <Text style={styles.tipText}>
            Tip: Speak slowly and clearly — I've got you!
          </Text>
        </MotiView>

        {/* Actions */}
        <View style={styles.actionSection}>
          {hasRecorded ? (
            <PrimaryButton label="See Score" onPress={handleContinue} />
          ) : (
            <Pressable onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipButtonText}>Skip this one</Text>
            </Pressable>
          )}
        </View>
      </View>
    </GradientBackground>
  );
}

function WaveformVisualizer() {
  const reduceMotion = useReduceMotion();
  const bars = Array.from({ length: 20 }, (_, i) => i);

  return (
    <View style={styles.waveform}>
      {bars.map((_, index) => (
        <WaveformBar key={index} index={index} reduceMotion={reduceMotion} />
      ))}
    </View>
  );
}

function WaveformBar({ index, reduceMotion }: { index: number; reduceMotion: boolean }) {
  const height = useSharedValue(10);

  useEffect(() => {
    if (reduceMotion) {
      height.value = 15 + Math.random() * 20;
      return;
    }

    const randomHeight = () => 10 + Math.random() * 30;
    const duration = 150 + Math.random() * 100;

    height.value = withRepeat(
      withSequence(
        withTiming(randomHeight(), { duration }),
        withTiming(randomHeight(), { duration })
      ),
      -1,
      true
    );
  }, [height, reduceMotion]);

  const barStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  return <Animated.View style={[styles.waveformBar, barStyle]} />;
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  phraseCard: {
    padding: 24,
    marginTop: 20,
    borderRadius: 20,
    alignItems: "center",
  },
  speakLabel: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.muted,
    marginBottom: 12,
  },
  phraseText: {
    fontFamily: "Satoshi-Bold",
    fontSize: 24,
    color: colors.text.primary,
    textAlign: "center",
    lineHeight: 32,
    marginBottom: 8,
  },
  translationText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: 16,
  },
  playButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
  },
  playButtonText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
    color: colors.secondary[400],
  },
  micSection: {
    alignItems: "center",
    marginTop: 40,
  },
  micContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  micPulse: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.error,
  },
  micButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(17, 24, 39, 0.8)",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  micButtonRecording: {
    borderColor: colors.error,
    backgroundColor: "rgba(239, 68, 68, 0.15)",
  },
  micButtonDone: {
    borderColor: colors.success,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
  },
  micHint: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 16,
  },
  waveformSection: {
    marginTop: 24,
    alignItems: "center",
  },
  waveform: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    gap: 3,
  },
  waveformBar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: colors.secondary[400],
  },
  tipSection: {
    marginTop: 32,
    alignItems: "center",
  },
  tipText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.muted,
    fontStyle: "italic",
  },
  actionSection: {
    marginTop: "auto",
    paddingTop: 20,
  },
  skipButton: {
    paddingVertical: 16,
    alignItems: "center",
  },
  skipButtonText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 15,
    color: colors.text.muted,
  },
});

