import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../theme/tokens";
import { ProgressPills } from "./ProgressPills";

type Props = {
  step: number;
  totalSteps?: number;
  showBack?: boolean;
  showSkip?: boolean;
  onSkip?: () => void;
};

export function OnboardingHeader({
  step,
  totalSteps = 5,
  showBack = true,
  showSkip = false,
  onSkip,
}: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.leftSection}>
        {showBack && (
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ChevronLeft size={24} color={colors.text.secondary} />
          </Pressable>
        )}
      </View>

      <View style={styles.centerSection}>
        <ProgressPills current={step} total={totalSteps} />
      </View>

      <View style={styles.rightSection}>
        {showSkip && onSkip && (
          <Pressable
            onPress={onSkip}
            style={styles.skipButton}
            accessibilityRole="button"
          >
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        )}
      </View>
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
  leftSection: {
    width: 60,
    alignItems: "flex-start",
  },
  centerSection: {
    flex: 1,
    alignItems: "center",
  },
  rightSection: {
    width: 60,
    alignItems: "flex-end",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  skipText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.secondary,
  },
});



