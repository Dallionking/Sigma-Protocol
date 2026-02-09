import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback, useEffect, useRef } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, Mic, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { GradientBackground } from "@/components/GradientBackground";
import { ChatBubble, TutorAvatarAnimated, VoiceWaveform } from "@/components/ai";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { getGreeting } from "@/lib/ai/mockResponses";
import { useAIStore } from "@/stores/aiStore";
import { colors, durations } from "@/theme/tokens";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function VoiceTalkScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const {
    messages,
    isRecording,
    currentMode,
    startSession,
    addMessage,
    setVoiceState,
  } = useAIStore();

  const micScale = useSharedValue(1);
  const isHolding = useRef(false);

  // Initialize session if not already started
  useEffect(() => {
    if (!currentMode) {
      startSession("voice");
    }
  }, [currentMode, startSession]);

  // Send greeting on mount
  useEffect(() => {
    if (messages.length === 0) {
      const greeting = getGreeting("voice");
      addMessage({ sender: "tutor", content: greeting });
    }
  }, [messages.length, addMessage]);

  // Scroll to bottom when messages change
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages.length]);

  const handleBack = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const handleEndSession = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/practice/ai/session-summary");
  }, [router]);

  const handleMicPressIn = useCallback(() => {
    isHolding.current = true;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    micScale.value = withTiming(1.15, { duration: durations.fast });
    setVoiceState({ isRecording: true });

    // Navigate to listening screen
    router.push("/practice/ai/voice-listening");
  }, [micScale, setVoiceState, router]);

  const handleMicPressOut = useCallback(() => {
    isHolding.current = false;
    micScale.value = withTiming(1, { duration: durations.fast });
  }, [micScale]);

  const micButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: micScale.value }],
  }));

  return (
    <GradientBackground>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={handleBack} style={styles.headerButton}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Voice Chat</Text>
          <Text style={styles.headerSubtitle}>Hold to speak</Text>
        </View>
        <Pressable onPress={handleEndSession} style={styles.headerButton}>
          <X size={22} color={colors.text.primary} />
        </Pressable>
      </View>

      <View style={styles.content}>
        {/* AI Tutor Avatar */}
        <MotiView
          from={motionFrom.scaleIn}
          animate={{ opacity: 1, scale: 1 }}
          transition={getTransition()}
          style={styles.avatarSection}
        >
          <TutorAvatarAnimated state="idle" size={140} />
        </MotiView>

        {/* Transcript */}
        <View style={styles.transcriptSection}>
          <Text style={styles.transcriptLabel}>Conversation</Text>
          <ScrollView
            ref={scrollViewRef}
            style={styles.transcriptScroll}
            contentContainerStyle={styles.transcriptContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.length === 0 ? (
              <Text style={styles.emptyText}>
                Start speaking to begin the conversation
              </Text>
            ) : (
              messages.slice(-6).map((message, index) => (
                <ChatBubble
                  key={message.id}
                  content={message.content}
                  sender={message.sender}
                  index={index}
                />
              ))
            )}
          </ScrollView>
        </View>

        {/* Waveform preview */}
        <View style={styles.waveformSection}>
          <VoiceWaveform isActive={isRecording} height={50} />
        </View>

        {/* Mic button */}
        <View style={[styles.micSection, { paddingBottom: insets.bottom + 20 }]}>
          <AnimatedPressable
            onPressIn={handleMicPressIn}
            onPressOut={handleMicPressOut}
            style={[styles.micButton, micButtonStyle]}
            accessibilityLabel="Hold to record"
            accessibilityRole="button"
          >
            <Mic size={36} color={colors.text.primary} />
          </AnimatedPressable>
          <Text style={styles.micHint}>Hold to talk</Text>
        </View>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.06)",
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 16,
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 16,
  },
  transcriptSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  transcriptLabel: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 12,
    color: colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  transcriptScroll: {
    flex: 1,
  },
  transcriptContent: {
    paddingBottom: 16,
  },
  emptyText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.muted,
    textAlign: "center",
    marginTop: 40,
  },
  waveformSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  micSection: {
    alignItems: "center",
    paddingTop: 8,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.secondary[500],
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.secondary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  micHint: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.muted,
    marginTop: 12,
  },
});

