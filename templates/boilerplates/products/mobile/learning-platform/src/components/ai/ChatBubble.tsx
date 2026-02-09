import { MotiView } from "moti";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import type { Correction, MessageSender } from "@/stores/aiStore";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { colors } from "@/theme/tokens";

import { CorrectionHighlight } from "./CorrectionHighlight";

type Props = {
  content: string;
  sender: MessageSender;
  corrections?: Correction[];
  timestamp?: number;
  index?: number;
};

export function ChatBubble({
  content,
  sender,
  corrections,
  timestamp,
  index = 0,
}: Props) {
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);
  const isUser = sender === "user";

  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : undefined;

  return (
    <MotiView
      from={motionFrom.fadeUp}
      animate={{ opacity: 1, translateY: 0 }}
      transition={getTransition({
        delay: reduceMotion ? 0 : (index % 10) * 30,
      })}
      style={[styles.container, isUser ? styles.containerUser : styles.containerAI Tutor]}
    >
      <View
        style={[
          styles.bubble,
          isUser ? styles.bubbleUser : styles.bubbleAI Tutor,
        ]}
      >
        {/* Sender label for AI Tutor */}
        {!isUser && (
          <Text style={styles.senderLabel}>AI Tutor</Text>
        )}

        {/* Message content */}
        <Text style={[styles.content, isUser && styles.contentUser]}>
          {content}
        </Text>

        {/* Corrections (only for user messages) */}
        {corrections && corrections.length > 0 && (
          <View style={styles.correctionsContainer}>
            {corrections.map((correction, i) => (
              <CorrectionHighlight key={i} correction={correction} />
            ))}
          </View>
        )}

        {/* Timestamp */}
        {formattedTime && (
          <Text style={[styles.timestamp, isUser && styles.timestampUser]}>
            {formattedTime}
          </Text>
        )}
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  containerUser: {
    alignItems: "flex-end",
  },
  containerAI Tutor: {
    alignItems: "flex-start",
  },
  bubble: {
    maxWidth: "85%",
    padding: 14,
    borderRadius: 18,
  },
  bubbleUser: {
    backgroundColor: colors.secondary[500],
    borderBottomRightRadius: 4,
  },
  bubbleAI Tutor: {
    backgroundColor: "rgba(17, 24, 39, 0.7)",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  senderLabel: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 11,
    color: colors.primary[400],
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  content: {
    fontFamily: "PlusJakartaSans",
    fontSize: 15,
    color: colors.text.primary,
    lineHeight: 22,
  },
  contentUser: {
    color: "#FFFFFF",
  },
  correctionsContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  timestamp: {
    fontFamily: "PlusJakartaSans",
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 6,
  },
  timestampUser: {
    color: "rgba(255, 255, 255, 0.7)",
  },
});

