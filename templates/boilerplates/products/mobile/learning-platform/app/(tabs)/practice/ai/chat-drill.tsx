import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
  getEncouragement,
  getGreeting,
  getNextDrillQuestion,
  simulateTypingDelay,
} from "@/lib/ai/mockResponses";
import { useAIStore } from "@/stores/aiStore";
import { colors } from "@/theme/tokens";

export default function ChatDrillScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const [currentQuestion, setCurrentQuestion] = useState(getNextDrillQuestion());
  const [questionCount, setQuestionCount] = useState(0);

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
      startSession("drill");
    }
  }, [currentMode, startSession]);

  // Send greeting and first question on mount
  useEffect(() => {
    if (messages.length === 0) {
      const greeting = getGreeting("drill");
      addMessage({ sender: "tutor", content: greeting });

      // Add first question
      setTimeout(() => {
        addMessage({
          sender: "tutor",
          content: `Question 1: ${currentQuestion.question}`,
        });
      }, 1000);
    }
  }, [messages.length, addMessage, currentQuestion.question]);

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

      // Check answer (simplified check)
      const userLower = text.toLowerCase().trim();
      const answerLower = currentQuestion.answer.toLowerCase();
      const isCorrect =
        userLower.includes(answerLower.split("/")[0].trim().toLowerCase()) ||
        answerLower.toLowerCase().includes(userLower);

      let response: string;
      if (isCorrect) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        response = `${getEncouragement()} The answer is: ${currentQuestion.answer}`;
      } else {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        response = `Not quite! The answer is: ${currentQuestion.answer}\n\n💡 ${currentQuestion.hint}`;
      }

      addMessage({ sender: "tutor", content: response });
      setTyping(false);

      // Move to next question after a delay
      setTimeout(async () => {
        const newQuestion = getNextDrillQuestion();
        setCurrentQuestion(newQuestion);
        setQuestionCount((prev) => prev + 1);

        if (questionCount < 4) {
          setTyping(true);
          await simulateTypingDelay();
          addMessage({
            sender: "tutor",
            content: `Question ${questionCount + 2}: ${newQuestion.question}`,
          });
          setTyping(false);
        } else {
          // End after 5 questions
          setTyping(true);
          await simulateTypingDelay();
          addMessage({
            sender: "tutor",
            content: "Great session! You've completed 5 drills. Ready to see your results?",
          });
          setTyping(false);
        }
      }, 1500);
    },
    [addMessage, setTyping, currentQuestion, questionCount]
  );

  return (
    <GradientBackground>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={handleBack} style={styles.headerButton}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Quick Drill</Text>
          <Text style={styles.headerSubtitle}>
            Question {Math.min(questionCount + 1, 5)} of 5
          </Text>
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

          {isTyping && <TypingIndicator />}
        </ScrollView>

        {/* Input */}
        <View style={{ paddingBottom: insets.bottom }}>
          <ChatInput
            onSend={handleSend}
            placeholder="Your answer..."
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

