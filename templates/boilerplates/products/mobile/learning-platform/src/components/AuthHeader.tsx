import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import { useReduceMotion } from "../hooks/useReduceMotion";
import { colors, springs } from "../theme/tokens";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  showDecorativeLine?: boolean;
};

export function AuthHeader({
  title,
  showBack = true,
  onBack,
  showDecorativeLine = false,
}: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();
  const scale = useSharedValue(1);

  const handleBack = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  }, [onBack, router]);

  const handlePressIn = useCallback(() => {
    scale.value = reduceMotion ? 0.95 : withTiming(0.95, { duration: durations.fast });
  }, [reduceMotion, scale]);

  const handlePressOut = useCallback(() => {
    scale.value = reduceMotion ? 1 : withTiming(1, { duration: durations.fast });
  }, [reduceMotion, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.headerRow}>
        <View style={styles.leftSection}>
          {showBack && (
            <AnimatedPressable
              onPress={handleBack}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              style={[styles.backButton, animatedStyle]}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <ChevronLeft size={24} color={colors.text.secondary} />
            </AnimatedPressable>
          )}
        </View>

        {title && (
          <View style={styles.centerSection}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          </View>
        )}

        <View style={styles.rightSection} />
      </View>

      {/* Decorative line element */}
      {showDecorativeLine && (
        <MotiView
          from={reduceMotion ? undefined : { scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ type: "timing", duration: 600, delay: 200 }}
          style={styles.decorativeLine}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 48,
  },
  leftSection: {
    width: 48,
    alignItems: "flex-start",
  },
  centerSection: {
    flex: 1,
    alignItems: "center",
  },
  rightSection: {
    width: 48,
    alignItems: "flex-end",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  title: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 16,
    color: colors.text.primary,
    letterSpacing: 0.2,
  },
  decorativeLine: {
    height: 2,
    marginTop: 12,
    marginHorizontal: 60,
    borderRadius: 1,
    backgroundColor: colors.primary[500],
    opacity: 0.3,
  },
});



