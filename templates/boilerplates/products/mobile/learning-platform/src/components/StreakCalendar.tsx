import { MotiView } from "moti";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { colors } from "../theme/tokens";

type Props = {
  completedDays: Date[];
  weeksToShow?: number;
};

const DAYS_OF_WEEK = ["S", "M", "T", "W", "T", "F", "S"];

export function StreakCalendar({ completedDays, weeksToShow = 4 }: Props) {
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);
  const today = new Date();

  // Generate calendar data for the past N weeks
  const calendarData = React.useMemo(() => {
    const totalDays = weeksToShow * 7;
    const days: { date: Date; isCompleted: boolean; isToday: boolean }[] = [];

    for (let i = totalDays - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const isCompleted = completedDays.some((d) => {
        const completed = new Date(d);
        completed.setHours(0, 0, 0, 0);
        return completed.getTime() === date.getTime();
      });

      const isToday = i === 0;

      days.push({ date, isCompleted, isToday });
    }

    return days;
  }, [completedDays, weeksToShow, today]);

  // Split into weeks
  const weeks = React.useMemo(() => {
    const result: typeof calendarData[] = [];
    for (let i = 0; i < calendarData.length; i += 7) {
      result.push(calendarData.slice(i, i + 7));
    }
    return result;
  }, [calendarData]);

  return (
    <View style={styles.container}>
      {/* Day labels */}
      <View style={styles.dayLabelsRow}>
        {DAYS_OF_WEEK.map((day, i) => (
          <Text key={i} style={styles.dayLabel}>
            {day}
          </Text>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.grid}>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.weekRow}>
            {week.map((day, dayIndex) => {
              const globalIndex = weekIndex * 7 + dayIndex;

              return (
                <MotiView
                  key={dayIndex}
                  from={motionFrom.scaleIn}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={getTransition({
                    delay: reduceMotion ? 0 : globalIndex * 15,
                  })}
                  style={styles.dayCell}
                >
                  <View
                    style={[
                      styles.dayDot,
                      day.isCompleted && styles.dayDotCompleted,
                      day.isToday && styles.dayDotToday,
                    ]}
                  >
                    {day.isCompleted && (
                      <View style={styles.completedInner} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.dateNumber,
                      day.isToday && styles.dateNumberToday,
                    ]}
                  >
                    {day.date.getDate()}
                  </Text>
                </MotiView>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(17, 24, 39, 0.5)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  dayLabelsRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  dayLabel: {
    flex: 1,
    textAlign: "center",
    fontFamily: "PlusJakartaSans",
    fontSize: 11,
    color: colors.text.muted,
    textTransform: "uppercase",
  },
  grid: {
    gap: 8,
  },
  weekRow: {
    flexDirection: "row",
  },
  dayCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
  },
  dayDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  dayDotCompleted: {
    backgroundColor: colors.primary[500],
    shadowColor: colors.primary[500],
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  dayDotToday: {
    borderWidth: 2,
    borderColor: colors.secondary[400],
  },
  completedInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.text.primary,
  },
  dateNumber: {
    fontFamily: "PlusJakartaSans",
    fontSize: 10,
    color: colors.text.muted,
  },
  dateNumberToday: {
    color: colors.secondary[400],
    fontFamily: "PlusJakartaSans-SemiBold",
  },
});



