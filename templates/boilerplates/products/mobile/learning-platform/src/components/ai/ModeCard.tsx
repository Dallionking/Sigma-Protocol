import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  BookOpen,
  BookText,
  Lock,
  MessageCircle,
  Mic,
  Zap,
  LucideIcon,
} from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { colors, durations } from "@/theme/tokens";

const ICON_MAP: Record<string, LucideIcon> = {
  MessageCircle,
  BookOpen,
  BookText,
  Zap,
  Mic,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  name: string;
  description: string;
  icon: string;
  onPress: () => void;
  locked?: boolean;
  delay?: number;
};

export function ModeCard({
  name,
  description,
  icon,
  onPress,
  locked = false,
  delay = 0,
}: Props) {
  const scale = useSharedValue(1);
  const Icon = ICON_MAP[icon] || MessageCircle;

  const handlePressIn = useCallback(() => {
    if (locked) return;
    scale.value = withTiming(0.97, { duration: durations.fast });
  }, [locked, scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: durations.fast });
  }, [scale]);

  const handlePress = useCallback(() => {
    if (locked) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [locked, onPress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 300, delay }}
    >
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={locked}
        style={[styles.container, locked && styles.containerLocked, animatedStyle]}
      >
        {/* Icon */}
        <View style={[styles.iconContainer, locked && styles.iconContainerLocked]}>
          {locked ? (
            <Lock size={24} color={colors.text.muted} />
          ) : (
            <Icon size={24} color={colors.secondary[400]} />
          )}
        </View>

        {/* Text */}
        <View style={styles.textContainer}>
          <Text style={[styles.name, locked && styles.nameLocked]}>{name}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>

        {/* Lock badge */}
        {locked && (
          <View style={styles.lockBadge}>
            <Text style={styles.lockText}>PRO</Text>
          </View>
        )}
      </AnimatedPressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(17, 24, 39, 0.6)",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  containerLocked: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  iconContainerLocked: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 2,
  },
  nameLocked: {
    color: colors.text.muted,
  },
  description: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.secondary,
  },
  lockBadge: {
    backgroundColor: "rgba(250, 204, 21, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  lockText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 10,
    color: colors.accent[400],
    letterSpacing: 0.5,
  },
});

