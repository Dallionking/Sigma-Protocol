import React from "react";
import { Pressable, StyleSheet, Text, View, ScrollView } from "react-native";
import { format } from "date-fns";
import { MotiView } from "moti";

import { useReduceMotion } from "@/hooks/useReduceMotion";
import { colors, durations } from "@/theme/tokens";
import { AvailabilitySlot } from "@/stores/scheduleStore";

interface Props {
  slots: AvailabilitySlot[];
  selectedSlot: AvailabilitySlot | null;
  onSlotSelect: (slot: AvailabilitySlot) => void;
}

export function TimeSlotPicker({ slots, selectedSlot, onSlotSelect }: Props) {
  const reduceMotion = useReduceMotion();

  if (slots.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No available slots for this date.</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.grid}>
        {slots.map((slot, index) => {
          const isSelected = selectedSlot?.id === slot.id;
          const startTime = new Date(slot.startTime);

          return (
            <MotiView
              key={slot.id}
              from={reduceMotion ? undefined : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "timing", duration: 200, delay: index * 20 }}
              style={styles.slotWrapper}
            >
              <Pressable
                onPress={() => slot.isAvailable && onSlotSelect(slot)}
                disabled={!slot.isAvailable}
                style={[
                  styles.slotButton,
                  isSelected && styles.slotSelected,
                  !slot.isAvailable && styles.slotDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.slotText,
                    isSelected && styles.slotTextSelected,
                    !slot.isAvailable && styles.slotTextDisabled,
                  ]}
                >
                  {format(startTime, "h:mm a")}
                </Text>
              </Pressable>
            </MotiView>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  slotWrapper: {
    width: "31%", // 3 columns
  },
  slotButton: {
    height: 50,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  slotSelected: {
    backgroundColor: colors.secondary[500],
    borderColor: colors.secondary[400],
  },
  slotDisabled: {
    opacity: 0.3,
    backgroundColor: "transparent",
  },
  slotText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
    color: colors.text.primary,
  },
  slotTextSelected: {
    color: "#FFFFFF",
  },
  slotTextDisabled: {
    color: colors.text.muted,
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 15,
    color: colors.text.muted,
    textAlign: "center",
  },
});

