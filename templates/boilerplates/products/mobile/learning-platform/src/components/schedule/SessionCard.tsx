import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Calendar, Clock, Video, ChevronRight } from "lucide-react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { format } from "date-fns";

import { GlassPanel } from "../GlassPanel";
import { TutorAvatar } from "../TutorAvatar";
import { colors, durations } from "@/theme/tokens";
import { Session } from "@/stores/scheduleStore";

interface Props {
  session: Session;
  onPress: (session: Session) => void;
  variant?: "compact" | "full";
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function SessionCard({ session, onPress, variant = "full" }: Props) {
  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(0.98, { duration: durations.fast });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: durations.fast });
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const sessionDate = new Date(session.date);
  const isUpcoming = session.status === "upcoming";

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => onPress(session)}
      style={[styles.container, animatedStyle]}
    >
      <GlassPanel style={styles.card} intensity={isUpcoming ? 40 : 20}>
        <View style={styles.content}>
          <View style={styles.tutorInfo}>
            {session.tutor.avatar === "tutor" ? (
              <TutorAvatar size={48} />
            ) : (
              <View style={styles.avatarPlaceholder} />
            )}
            <View style={styles.tutorText}>
              <Text style={styles.tutorName}>{session.tutor.name}</Text>
              <Text style={styles.sessionType}>{session.type} Session</Text>
            </View>
          </View>

          <View style={styles.dateTime}>
            <View style={styles.infoRow}>
              <Calendar size={14} color={colors.text.muted} />
              <Text style={styles.infoText}>
                {format(sessionDate, "EEE, MMM d")}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Clock size={14} color={colors.text.muted} />
              <Text style={styles.infoText}>
                {format(sessionDate, "h:mm a")} ({session.durationMinutes} min)
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          {isUpcoming ? (
            <View style={styles.joinBadge}>
              <Video size={14} color={colors.secondary[400]} />
              <Text style={styles.joinText}>Join Room</Text>
            </View>
          ) : (
            <Text style={styles.statusText}>
              {session.status === "completed" ? "Completed" : "Cancelled"}
            </Text>
          )}
          <ChevronRight size={18} color={colors.text.muted} />
        </View>
      </GlassPanel>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  card: {
    padding: 16,
    borderRadius: 20,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  tutorInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  tutorText: {
    gap: 2,
  },
  tutorName: {
    fontFamily: "Satoshi-Bold",
    fontSize: 16,
    color: colors.text.primary,
  },
  sessionType: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
  },
  dateTime: {
    alignItems: "flex-end",
    gap: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 12,
    color: colors.text.secondary,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
  },
  joinBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  joinText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 12,
    color: colors.secondary[400],
  },
  statusText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 12,
    color: colors.text.muted,
  },
});

