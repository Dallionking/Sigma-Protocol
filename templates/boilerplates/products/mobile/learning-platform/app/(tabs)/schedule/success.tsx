import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { CheckCircle, Calendar, Bell } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import { ConfettiOverlay } from "@/components/practice";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { colors } from "@/theme/tokens";

export default function BookingSuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  useEffect(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const handleDone = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace("/schedule");
  }, [router]);

  const handleAddToCalendar = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Integration with expo-calendar would go here
  }, []);

  return (
    <GradientBackground>
      <ConfettiOverlay visible={true} />

      <View style={[styles.container, { paddingTop: insets.top + 60 }]}>
        <MotiView
          from={motionFrom.scaleIn}
          animate={{ opacity: 1, scale: 1 }}
          transition={getTransition()}
          style={styles.content}
        >
          <View style={styles.successIcon}>
            <CheckCircle size={80} color={colors.success} strokeWidth={1.5} />
          </View>
          
          <Text style={styles.title}>Session Booked!</Text>
          <Text style={styles.subtitle}>
            Your session with AI Tutor has been confirmed. Get ready to practice your skills!
          </Text>
        </MotiView>

        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 200 })}
          style={styles.nextSteps}
        >
          <Text style={styles.nextStepsTitle}>Next Steps</Text>
          <View style={styles.stepRow}>
            <View style={styles.stepIcon}>
              <Calendar size={20} color={colors.secondary[400]} />
            </View>
            <Text style={styles.stepText}>Add this session to your calendar.</Text>
          </View>
          <View style={styles.stepRow}>
            <View style={styles.stepIcon}>
              <Bell size={20} color={colors.secondary[400]} />
            </View>
            <Text style={styles.stepText}>We'll remind you 15 minutes before.</Text>
          </View>
        </MotiView>

        <View style={styles.spacer} />

        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 400 })}
          style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}
        >
          <PrimaryButton
            label="Add to Calendar"
            onPress={handleAddToCalendar}
            style={styles.calendarButton}
          />
          <SecondaryButton
            label="Done"
            onPress={handleDone}
          />
        </MotiView>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  content: {
    alignItems: "center",
    marginBottom: 48,
  },
  successIcon: {
    marginBottom: 24,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  title: {
    fontFamily: "Satoshi-Bold",
    fontSize: 32,
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
  },
  nextSteps: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  nextStepsTitle: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
    color: colors.text.primary,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 20,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 15,
    color: colors.text.secondary,
    flex: 1,
  },
  spacer: {
    flex: 1,
  },
  footer: {
    gap: 12,
  },
  calendarButton: {
    marginBottom: 4,
  },
});

