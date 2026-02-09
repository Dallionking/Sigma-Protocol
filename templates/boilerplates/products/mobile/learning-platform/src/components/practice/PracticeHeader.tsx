import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated from "react-native-reanimated";

import { useReduceMotion } from "@/hooks/useReduceMotion";
import { colors } from "@/theme/tokens";

type Props = {
  currentQuestion: number;
  totalQuestions: number;
  title?: string;
  showClose?: boolean;
  onClose?: () => void;
};

export function PracticeHeader({
  currentQuestion,
  totalQuestions,
  title,
  showClose = false,
  onClose,
}: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();

  const progress = totalQuestions > 0 ? (currentQuestion + 1) / totalQuestions : 0;

  const handleBack = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  }, [onClose, router]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      {/* Back/Close Button */}
      <Pressable
        onPress={handleBack}
        style={styles.backButton}
        accessibilityLabel={showClose ? "Close exercise" : "Go back"}
        accessibilityRole="button"
      >
        {showClose ? (
          <X size={22} color={colors.text.primary} />
        ) : (
          <ChevronLeft size={24} color={colors.text.primary} />
        )}
      </Pressable>

      {/* Progress Section */}
      <View style={styles.progressSection}>
        {title && <Text style={styles.title}>{title}</Text>}

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <MotiView
              animate={{ width: `${progress * 100}%` }}
              transition={
                reduceMotion
                  ? { type: "timing", duration: 0 }
                  : { type: "timing", duration: 260 }
              }
              style={styles.progressBarFill}
            />
          </View>
        </View>

        {/* Question Counter */}
        <Text style={styles.counter}>
          {currentQuestion + 1} / {totalQuestions}
        </Text>
      </View>

      {/* Spacer for symmetry */}
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  progressSection: {
    flex: 1,
    marginHorizontal: 16,
    alignItems: "center",
  },
  title: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  progressBarContainer: {
    width: "100%",
    marginBottom: 6,
  },
  progressBarBackground: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: colors.secondary[400],
  },
  counter: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
  },
  spacer: {
    width: 40,
  },
});

