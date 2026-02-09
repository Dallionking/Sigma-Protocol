import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { TutorAvatarAnimated, VoiceWaveform } from "@/components/ai";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { useAIStore } from "@/stores/aiStore";
import { colors } from "@/theme/tokens";

// Simulated transcription phrases
const MOCK_TRANSCRIPTIONS = [
  "Hello AI Tutor...",
  "Hello AI Tutor, how are you?",
  "Hello AI Tutor, how are you today?",
];

export default function VoiceListeningScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const { setVoiceState, addMessage, addVoiceDuration } = useAIStore();

  const [transcription, setTranscription] = useState("");
  const [transcriptionIndex, setTranscriptionIndex] = useState(0);
  const recordingStartTime = useRef(Date.now());

  // Simulate live transcription
  useEffect(() => {
    const interval = setInterval(() => {
      setTranscriptionIndex((prev) => {
        const next = Math.min(prev + 1, MOCK_TRANSCRIPTIONS.length - 1);
        setTranscription(MOCK_TRANSCRIPTIONS[next]);
        return next;
      });
    }, 800);

    return () => clearInterval(interval);
  }, []);

  // Auto-complete after 3 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      handleRelease();
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  const handleRelease = useCallback(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Calculate voice duration
    const duration = Math.round((Date.now() - recordingStartTime.current) / 1000);
    addVoiceDuration(duration);

    // Stop recording
    setVoiceState({ isRecording: false, isListening: false });

    // Add user's message
    const finalTranscription =
      MOCK_TRANSCRIPTIONS[MOCK_TRANSCRIPTIONS.length - 1];
    addMessage({ sender: "user", content: finalTranscription });

    // Navigate to response screen
    router.replace("/practice/ai/voice-response");
  }, [setVoiceState, addMessage, addVoiceDuration, router]);

  const handleCancel = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setVoiceState({ isRecording: false, isListening: false });
    router.back();
  }, [setVoiceState, router]);

  return (
    <GradientBackground>
      <View style={[styles.container, { paddingTop: insets.top + 40 }]}>
        {/* AI Tutor Avatar */}
        <MotiView
          from={motionFrom.scaleIn}
          animate={{ opacity: 1, scale: 1 }}
          transition={getTransition()}
          style={styles.avatarSection}
        >
          <TutorAvatarAnimated state="listening" size={160} />
        </MotiView>

        {/* Live Transcription */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 150 })}
          style={styles.transcriptionSection}
        >
          <Text style={styles.transcriptionLabel}>I hear you saying...</Text>
          <View style={styles.transcriptionBox}>
            <Text style={styles.transcriptionText}>
              {transcription || "Listening..."}
            </Text>
          </View>
        </MotiView>

        {/* Waveform */}
        <MotiView
          from={motionFrom.fade}
          animate={{ opacity: 1 }}
          transition={getTransition({ type: "timing", duration: 300, delay: 300 })}
          style={styles.waveformSection}
        >
          <VoiceWaveform isActive={true} height={70} color={colors.error} />
        </MotiView>

        {/* Instructions */}
        <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 40 }]}>
          <View style={styles.recordingIndicator}>
            <MotiView
              from={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{
                type: "timing",
                duration: 500,
                loop: true,
                repeatReverse: true,
              }}
              style={styles.recordingDot}
            />
            <Text style={styles.recordingText}>Recording...</Text>
          </View>

          <Pressable onPress={handleRelease} style={styles.doneButton}>
            <Text style={styles.doneButtonText}>Tap when done</Text>
          </Pressable>

          <Pressable onPress={handleCancel} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  transcriptionSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  transcriptionLabel: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.muted,
    marginBottom: 12,
    textAlign: "center",
  },
  transcriptionBox: {
    backgroundColor: "rgba(17, 24, 39, 0.7)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    minHeight: 80,
    justifyContent: "center",
  },
  transcriptionText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 18,
    color: colors.text.primary,
    textAlign: "center",
    lineHeight: 26,
  },
  waveformSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  bottomSection: {
    marginTop: "auto",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  recordingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 8,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.error,
  },
  recordingText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
    color: colors.error,
  },
  doneButton: {
    backgroundColor: colors.secondary[500],
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
    marginBottom: 16,
  },
  doneButtonText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 16,
    color: "#FFFFFF",
  },
  cancelButton: {
    paddingVertical: 12,
  },
  cancelButtonText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.muted,
  },
});

