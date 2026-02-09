import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { format } from "date-fns";

import { GlassPanel } from "@/components/GlassPanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TimeSlotPicker } from "@/components/schedule/TimeSlotPicker";
import { useMotionTransition } from "@/hooks/useMotionTransition";
import { useScheduleStore, AvailabilitySlot } from "@/stores/scheduleStore";
import { generateMockSlots } from "@/lib/schedule/mockData";
import { colors } from "@/theme/tokens";

export default function SlotSelectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion } = useMotionTransition();

  const { selectedDate, setSelectedSlot } = useScheduleStore();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [internalSelectedSlot, setInternalSelectedSlot] = useState<AvailabilitySlot | null>(null);

  useEffect(() => {
    if (selectedDate) {
      setSlots(generateMockSlots(new Date(selectedDate)));
    }
  }, [selectedDate]);

  const handleClose = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const handleSlotSelect = useCallback((slot: AvailabilitySlot) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInternalSelectedSlot(slot);
  }, []);

  const handleConfirm = useCallback(() => {
    if (!internalSelectedSlot) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedSlot(internalSelectedSlot);
    router.push("/schedule/confirm");
  }, [internalSelectedSlot, setSelectedSlot, router]);

  const displayDate = selectedDate ? format(new Date(selectedDate), "EEEE, MMMM do") : "";

  return (
    <View style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      
      <MotiView
        from={reduceMotion ? undefined : { translateY: 400 }}
        animate={{ translateY: 0 }}
        transition={{ type: "timing", duration: 300 }}
        style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}
      >
        <GlassPanel style={styles.panel} intensity={60}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Available Times</Text>
              <Text style={styles.subtitle}>{displayDate}</Text>
            </View>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <X size={20} color={colors.text.primary} />
            </Pressable>
          </View>

          <View style={styles.pickerContainer}>
            <TimeSlotPicker
              slots={slots}
              selectedSlot={internalSelectedSlot}
              onSlotSelect={handleSlotSelect}
            />
          </View>

          <View style={styles.footer}>
            <PrimaryButton
              label="Continue"
              onPress={handleConfirm}
              disabled={!internalSelectedSlot}
            />
          </View>
        </GlassPanel>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    width: "100%",
    maxHeight: "80%",
  },
  panel: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  title: {
    fontFamily: "Satoshi-Bold",
    fontSize: 20,
    color: colors.text.primary,
  },
  subtitle: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  pickerContainer: {
    height: 300, // Fixed height for slots grid
  },
  footer: {
    marginTop: 20,
  },
});

