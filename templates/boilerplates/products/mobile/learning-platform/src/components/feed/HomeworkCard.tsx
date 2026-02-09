import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Clock, CheckCircle, ChevronRight } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { format, isPast, differenceInDays } from "date-fns";

import { GlassPanel } from "@/components/GlassPanel";
import { Homework } from "@/stores/feedStore";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { colors, durations } from "@/theme/tokens";

interface Props {
  homework: Homework;
  onPress: (homework: Homework) => void;
  delay?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function HomeworkCard({ homework, onPress, delay = 0 }: Props) {
  const scale = useSharedValue(1);
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(0.98, { duration: durations.fast });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: durations.fast });
  }, [scale]);

  const handlePress = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(homework);
  }, [onPress, homework]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const dueDate = new Date(homework.dueDate);
  const isOverdue = isPast(dueDate) && !homework.isCompleted;
  const daysUntilDue = differenceInDays(dueDate, new Date());
  const isUrgent = daysUntilDue <= 2 && daysUntilDue >= 0;

  const getStatusColor = () => {
    if (homework.isCompleted) return colors.success;
    if (isOverdue) return colors.error;
    if (isUrgent) return colors.accent[400];
    return colors.secondary[400];
  };

  const getStatusText = () => {
    if (homework.isCompleted) return "Completed";
    if (isOverdue) return "Overdue";
    if (daysUntilDue === 0) return "Due today";
    if (daysUntilDue === 1) return "Due tomorrow";
    return `Due ${format(dueDate, "MMM d")}`;
  };

  const statusColor = getStatusColor();

  return (
    <MotiView
      from={motionFrom.fadeUp}
      animate={{ opacity: 1, translateY: 0 }}
      transition={getTransition({ delay })}
    >
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={[styles.container, animatedStyle]}
      >
        <GlassPanel style={styles.card}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              {homework.isCompleted ? (
                <CheckCircle size={24} color={colors.success} />
              ) : (
                <Clock size={24} color={statusColor} />
              )}
            </View>
            <View style={styles.textContent}>
              <Text style={styles.title} numberOfLines={1}>
                {homework.title}
              </Text>
              <Text style={styles.description} numberOfLines={2}>
                {homework.description}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {getStatusText()}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={colors.text.muted} />
          </View>
        </GlassPanel>
      </AnimatedPressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  card: {
    padding: 16,
    borderRadius: 16,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  textContent: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: "Satoshi-Bold",
    fontSize: 15,
    color: colors.text.primary,
  },
  description: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.muted,
    lineHeight: 18,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  statusText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
});

