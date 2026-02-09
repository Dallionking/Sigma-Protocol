import * as Haptics from "expo-haptics";
import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { useReduceMotion } from "@/hooks/useReduceMotion";
import { colors, durations } from "@/theme/tokens";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  showBack?: boolean;
  onBackPress?: () => void;
};

export function LearnHeader({
  title,
  subtitle,
  right,
  showBack = true,
  onBackPress,
}: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();

  const backScale = useSharedValue(1);
  const backStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backScale.value }],
  }));

  const handleBackPressIn = useCallback(() => {
    backScale.value = reduceMotion ? 0.95 : withTiming(0.95, { duration: durations.fast });
  }, [backScale, reduceMotion]);

  const handleBackPressOut = useCallback(() => {
    backScale.value = reduceMotion ? 1 : withTiming(1, { duration: durations.fast });
  }, [backScale, reduceMotion]);

  const handleBack = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onBackPress) onBackPress();
    else router.back();
  }, [onBackPress, router]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}> 
      <View style={styles.row}>
        {showBack ? (
          <AnimatedPressable
            onPress={handleBack}
            onPressIn={handleBackPressIn}
            onPressOut={handleBackPressOut}
            style={[styles.backButton, backStyle]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={22} color={colors.text.primary} />
          </AnimatedPressable>
        ) : (
          <View style={styles.backButtonSpacer} />
        )}

        <View style={styles.titleBlock}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={styles.rightSlot}>{right ?? <View style={styles.backButtonSpacer} />}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  backButtonSpacer: {
    width: 44,
    height: 44,
  },
  titleBlock: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 12,
  },
  title: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 17,
    color: colors.text.primary,
  },
  subtitle: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 2,
  },
  rightSlot: {
    width: 44,
    alignItems: "flex-end",
  },
});



