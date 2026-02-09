import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { GlassPanel } from "@/components/GlassPanel";
import { TutorAvatarAnimated, VoiceWaveform } from "@/components/ai";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import {
  getConversationResponse,
  getEncouragement,
  simulateTypingDelay,
} from "@/lib/ai/mockResponses";
import { useAIStore } from "@/stores/aiStore";
import { colors } from "@/theme/tokens";

export default function VoiceResponseScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const { messages, setVoiceState, addMessage } = useAIStore();

  const [tutorState, setTutorState] = useState<"thinking" | "speaking">("thinking");
  const [response, setResponse] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Get user's last message
  const lastUserMessage = messages.filter((m) => m.sender === "user").pop();

  // Generate and "speak" AI Tutor's response
  useEffect(() => {
    const generateResponse = async () => {
      // Thinking phase
      setTutorState("thinking");
      await simulateTypingDelay();

      // Generate response
      const userText = lastUserMessage?.content ?? "";
      const tutorResponse = `${getEncouragement()} ${getConversationResponse(userText)}`;
      setResponse(tutorResponse);

      // Speaking phase
      setTutorState("speaking");
      setIsSpeaking(true);
      setVoiceState({ isSpeaking: true });

      // Add message to store
      addMessage({ sender: "tutor", content: tutorResponse });

      // Simulate TTS duration (approx 100ms per word)
      const wordCount = tutorResponse.split(" ").length;
      const speakDuration = Math.max(2000, wordCount * 100);

      setTimeout(() => {
        setIsSpeaking(false);
        setVoiceState({ isSpeaking: false });
      }, speakDuration);
    };

    generateResponse();
  }, [lastUserMessage?.content, setVoiceState, addMessage]);

  const handleContinue = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace("/practice/ai/voice-talk");
  }, [router]);

  const handleEndSession = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace("/practice/ai/session-summary");
  }, [router]);

  const handleInterrupt = useCallback(() => {
    if (isSpeaking) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIsSpeaking(false);
      setVoiceState({ isSpeaking: false });
    }
  }, [isSpeaking, setVoiceState]);

  return (
    <GradientBackground>
      <View style={[styles.container, { paddingTop: insets.top + 40 }]}>
        {/* AI Tutor Avatar */}
        <Pressable onPress={handleInterrupt} style={styles.avatarSection}>
          <MotiView
            from={motionFrom.scaleIn}
            animate={{ opacity: 1, scale: 1 }}
            transition={getTransition()}
          >
            <TutorAvatarAnimated state={tutorState} size={160} />
          </MotiView>
        </Pressable>

        {/* Response Display */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 150 })}
          style={styles.responseSection}
        >
          <Text style={styles.responseLabel}>AI Tutor says:</Text>
          <GlassPanel style={styles.responseBox}>
            {tutorState === "thinking" ? (
              <Text style={styles.thinkingText}>Thinking...</Text>
            ) : (
              <Text style={styles.responseText}>{response}</Text>
            )}
          </GlassPanel>
        </MotiView>

        {/* Waveform (simulated TTS) */}
        {isSpeaking && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={styles.waveformSection}
          >
            <VoiceWaveform
              isActive={true}
              height={50}
              color={colors.secondary[400]}
            />
            <Text style={styles.tapToSkip}>Tap avatar to skip</Text>
          </MotiView>
        )}

        {/* Actions */}
        {!isSpeaking && tutorState === "speaking" && (
          <MotiView
            from={motionFrom.fadeUp}
            animate={{ opacity: 1, translateY: 0 }}
            transition={getTransition()}
            style={[styles.actionsSection, { paddingBottom: insets.bottom + 40 }]}
          >
            <Pressable onPress={handleContinue} style={styles.continueButton}>
              <Text style={styles.continueButtonText}>Continue Talking</Text>
            </Pressable>

            <Pressable onPress={handleEndSession} style={styles.endButton}>
              <Text style={styles.endButtonText}>End Session</Text>
            </Pressable>
          </MotiView>
        )}
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
  responseSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  responseLabel: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.muted,
    marginBottom: 12,
    textAlign: "center",
  },
  responseBox: {
    padding: 24,
    borderRadius: 20,
    minHeight: 120,
    justifyContent: "center",
  },
  thinkingText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: colors.text.muted,
    textAlign: "center",
    fontStyle: "italic",
  },
  responseText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 18,
    color: colors.text.primary,
    textAlign: "center",
    lineHeight: 28,
  },
  waveformSection: {
    paddingHorizontal: 24,
    alignItems: "center",
  },
  tapToSkip: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 12,
  },
  actionsSection: {
    marginTop: "auto",
    paddingHorizontal: 24,
    alignItems: "center",
  },
  continueButton: {
    backgroundColor: colors.secondary[500],
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
    marginBottom: 16,
    width: "100%",
    alignItems: "center",
  },
  continueButtonText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 16,
    color: "#FFFFFF",
  },
  endButton: {
    paddingVertical: 12,
  },
  endButtonText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.muted,
  },
});

