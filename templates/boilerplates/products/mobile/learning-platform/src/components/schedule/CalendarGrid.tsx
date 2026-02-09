import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addDays,
} from "date-fns";
import { MotiView } from "moti";

import { useReduceMotion } from "@/hooks/useReduceMotion";
import { colors } from "@/theme/tokens";

interface Props {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}

export function CalendarGrid({ selectedDate, onDateSelect }: Props) {
  const reduceMotion = useReduceMotion();
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.monthTitle}>{format(currentMonth, "MMMM yyyy")}</Text>
        <View style={styles.navButtons}>
          <Pressable onPress={handlePrevMonth} style={styles.navButton}>
            <ChevronLeft size={20} color={colors.text.primary} />
          </Pressable>
          <Pressable onPress={handleNextMonth} style={styles.navButton}>
            <ChevronRight size={20} color={colors.text.primary} />
          </Pressable>
        </View>
      </View>

      {/* Day Labels */}
      <View style={styles.weekDaysRow}>
        {weekDays.map((day) => (
          <Text key={day} style={styles.weekDayLabel}>
            {day[0]}
          </Text>
        ))}
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        {days.map((day, index) => {
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isPast = day < new Date() && !isToday(day);

          return (
            <MotiView
              key={day.toISOString()}
              from={reduceMotion ? undefined : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "timing", duration: 200, delay: index * 5 }}
              style={styles.dayCell}
            >
              <Pressable
                onPress={() => !isPast && onDateSelect(day)}
                disabled={isPast}
                style={[
                  styles.dayButton,
                  isSelected && styles.daySelected,
                  !isCurrentMonth && styles.dayOutside,
                  isPast && styles.dayPast,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    isSelected && styles.dayTextSelected,
                    !isCurrentMonth && styles.dayTextOutside,
                    isToday(day) && styles.dayTextToday,
                    isPast && styles.dayTextPast,
                  ]}
                >
                  {format(day, "d")}
                </Text>
                {isToday(day) && !isSelected && <View style={styles.todayIndicator} />}
              </Pressable>
            </MotiView>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(17, 24, 39, 0.5)",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  monthTitle: {
    fontFamily: "Satoshi-Bold",
    fontSize: 18,
    color: colors.text.primary,
  },
  navButtons: {
    flexDirection: "row",
    gap: 8,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  weekDaysRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  weekDayLabel: {
    flex: 1,
    textAlign: "center",
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 12,
    color: colors.text.muted,
    textTransform: "uppercase",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 2,
  },
  dayButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    position: "relative",
  },
  daySelected: {
    backgroundColor: colors.primary[500],
  },
  dayOutside: {
    opacity: 0.3,
  },
  dayPast: {
    opacity: 0.2,
  },
  dayText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 15,
    color: colors.text.primary,
  },
  dayTextSelected: {
    color: "#FFFFFF",
  },
  dayTextOutside: {
    color: colors.text.muted,
  },
  dayTextToday: {
    color: colors.secondary[400],
  },
  dayTextPast: {
    color: colors.text.muted,
  },
  todayIndicator: {
    position: "absolute",
    bottom: 6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.secondary[400],
  },
});

