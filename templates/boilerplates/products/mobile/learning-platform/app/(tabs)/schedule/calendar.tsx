import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { CalendarGrid } from "@/components/schedule/CalendarGrid";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { useScheduleStore } from "@/stores/scheduleStore";
import { colors } from "@/theme/tokens";

export default function ScheduleCalendarScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const { selectedDate, setSelectedDate } = useScheduleStore();
  const [internalDate, setInternalDate] = useState<Date | null>(
    selectedDate ? new Date(selectedDate) : null
  );

  const handleBack = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const handleDateSelect = useCallback((date: Date) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInternalDate(date);
  }, []);

  const handleNext = useCallback(() => {
    if (!internalDate) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedDate(internalDate.toISOString());
    router.push("/schedule/slot-select");
  }, [internalDate, setSelectedDate, router]);

  return (
    <GradientBackground>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Select Date</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.content}>
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition()}
          style={styles.intro}
        >
          <Text style={styles.title}>When do you want to practice?</Text>
          <Text style={styles.subtitle}>Choose a date to see available time slots.</Text>
        </MotiView>

        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 100 })}
          style={styles.calendarWrapper}
        >
          <CalendarGrid
            selectedDate={internalDate}
            onDateSelect={handleDateSelect}
          />
        </MotiView>

        <View style={styles.spacer} />

        <MotiView
          from={motionFrom.fade}
          animate={{ opacity: 1 }}
          transition={getTransition({ delay: 200 })}
          style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}
        >
          <PrimaryButton
            label="See Available Slots"
            onPress={handleNext}
            disabled={!internalDate}
          />
        </MotiView>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  headerTitle: {
    fontFamily: "Satoshi-Bold",
    fontSize: 18,
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  intro: {
    marginTop: 20,
    marginBottom: 32,
  },
  title: {
    fontFamily: "Satoshi-Bold",
    fontSize: 24,
    color: colors.text.primary,
    lineHeight: 32,
  },
  subtitle: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 8,
  },
  calendarWrapper: {
    width: "100%",
  },
  spacer: {
    flex: 1,
  },
  footer: {
    paddingTop: 20,
  },
});

