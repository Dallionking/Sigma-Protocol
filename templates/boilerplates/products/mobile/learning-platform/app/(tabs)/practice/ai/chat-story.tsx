import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useRef } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { ChatBubble, ChatInput, TypingIndicator } from "@/components/ai";
import {
  getGreeting,
  getStoryContinuation,
  simulateTypingDelay,
  STORY_PROMPTS,
  getRandomItem,
} from "@/lib/ai/mockResponses";
import { useAIStore } from "@/stores/aiStore";
import { colors } from "@/theme/tokens";

export default function ChatStoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const {
    messages,
    isTyping,
    currentMode,
    startSession,
    addMessage,
    setTyping,
  } = useAIStore();

  // Initialize session if not already started
  useEffect(() => {
    if (!currentMode) {
      startSession("story");
    }
  }, [currentMode, startSession]);

  // Send greeting and story starter on mount
  useEffect(() => {
    if (messages.length === 0) {
      const greeting = getGreeting("story");
      addMessage({ sender: "tutor", content: greeting });

      // Add story starter
      setTimeout(() => {
        const prompt = getRandomItem(STORY_PROMPTS);
        addMessage({
          sender: "tutor",
          content: `${prompt.starter}\n\n💡 ${prompt.hint}`,
        });
      }, 1500);
    }
  }, [messages.length, addMessage]);

  // Scroll to bottom when messages change
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages.length, isTyping]);

  const handleBack = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const handleEndSession = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/practice/ai/session-summary");
  }, [router]);

  const handleSend = useCallback(
    async (text: string) => {
      // Add user message
      addMessage({ sender: "user", content: text });

      // Show typing indicator
      setTyping(true);

      // Simulate AI thinking
      await simulateTypingDelay();

      // Get story continuation
      const response = getStoryContinuation();
      addMessage({ sender: "tutor", content: response });

      // Sometimes add a new story element
      if (Math.random() > 0.5) {
        await simulateTypingDelay();
        const additions = [
          "Suddenly, they heard footsteps behind them...",
          "The sky began to change colors...",
          "A mysterious stranger appeared...",
          "They found an old letter on the ground...",
        ];
        addMessage({
          sender: "tutor",
          content: getRandomItem(additions),
        });
      }

      setTyping(false);
    },
    [addMessage, setTyping]
  );

  return (
    <GradientBackground>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={handleBack} style={styles.headerButton}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Story Mode</Text>
          <Text style={styles.headerSubtitle}>Let's create together</Text>
        </View>
        <Pressable onPress={handleEndSession} style={styles.headerButton}>
          <X size={22} color={colors.text.primary} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((message, index) => (
            <ChatBubble
              key={message.id}
              content={message.content}
              sender={message.sender}
              timestamp={message.timestamp}
              index={index}
            />
          ))}

          {isTyping && <TypingIndicator message="AI Tutor is thinking..." />}
        </ScrollView>

        {/* Input */}
        <View style={{ paddingBottom: insets.bottom }}>
          <ChatInput
            onSend={handleSend}
            placeholder="Continue the story..."
            disabled={isTyping}
            showVoiceButton={false}
          />
        </View>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
  },
});

