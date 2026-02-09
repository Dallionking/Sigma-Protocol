import * as Haptics from "expo-haptics";
import React, { useCallback, useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Mic, Send } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { colors, durations } from "@/theme/tokens";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  onSend: (message: string) => void;
  onVoicePress?: () => void;
  placeholder?: string;
  disabled?: boolean;
  showVoiceButton?: boolean;
};

export function ChatInput({
  onSend,
  onVoicePress,
  placeholder = "Type a message...",
  disabled = false,
  showVoiceButton = true,
}: Props) {
  const [text, setText] = useState("");
  const sendScale = useSharedValue(1);
  const micScale = useSharedValue(1);

  const handleSend = useCallback(() => {
    if (!text.trim() || disabled) return;

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSend(text.trim());
    setText("");
  }, [text, disabled, onSend]);

  const handleVoicePress = useCallback(() => {
    if (!onVoicePress || disabled) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onVoicePress();
  }, [onVoicePress, disabled]);

  const handleSendPressIn = useCallback(() => {
    sendScale.value = withTiming(0.9, { duration: durations.fast });
  }, [sendScale]);

  const handleSendPressOut = useCallback(() => {
    sendScale.value = withTiming(1, { duration: durations.fast });
  }, [sendScale]);

  const handleMicPressIn = useCallback(() => {
    micScale.value = withTiming(0.9, { duration: durations.fast });
  }, [micScale]);

  const handleMicPressOut = useCallback(() => {
    micScale.value = withTiming(1, { duration: durations.fast });
  }, [micScale]);

  const sendButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendScale.value }],
  }));

  const micButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: micScale.value }],
  }));

  const hasText = text.trim().length > 0;

  return (
    <View style={styles.container}>
      {/* Voice Button */}
      {showVoiceButton && onVoicePress && (
        <AnimatedPressable
          onPressIn={handleMicPressIn}
          onPressOut={handleMicPressOut}
          onPress={handleVoicePress}
          disabled={disabled}
          style={[styles.iconButton, micButtonStyle]}
          accessibilityLabel="Start voice input"
          accessibilityRole="button"
        >
          <Mic size={22} color={colors.text.secondary} />
        </AnimatedPressable>
      )}

      {/* Text Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.muted}
          editable={!disabled}
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
      </View>

      {/* Send Button */}
      <AnimatedPressable
        onPressIn={handleSendPressIn}
        onPressOut={handleSendPressOut}
        onPress={handleSend}
        disabled={!hasText || disabled}
        style={[
          styles.sendButton,
          hasText && styles.sendButtonActive,
          sendButtonStyle,
        ]}
        accessibilityLabel="Send message"
        accessibilityRole="button"
      >
        <Send
          size={20}
          color={hasText ? "#FFFFFF" : colors.text.muted}
        />
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "rgba(17, 24, 39, 0.8)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  inputContainer: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    minHeight: 44,
    maxHeight: 120,
    justifyContent: "center",
  },
  input: {
    fontFamily: "PlusJakartaSans",
    fontSize: 15,
    color: colors.text.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonActive: {
    backgroundColor: colors.secondary[500],
  },
});

