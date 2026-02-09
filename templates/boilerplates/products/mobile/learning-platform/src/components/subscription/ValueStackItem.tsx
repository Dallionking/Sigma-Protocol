import { MotiView } from "moti";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Gift, Check } from "lucide-react-native";

import { BonusItem } from "@/lib/subscription/mockData";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { colors } from "@/theme/tokens";

interface Props {
  bonus: BonusItem;
  delay?: number;
}

export function ValueStackItem({ bonus, delay = 0 }: Props) {
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  return (
    <MotiView
      from={motionFrom.fadeUp}
      animate={{ opacity: 1, translateY: 0 }}
      transition={getTransition({ delay })}
      style={styles.container}
    >
      <View style={styles.iconContainer}>
        <Gift size={16} color={colors.secondary[400]} />
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{bonus.name}</Text>
        <Text style={styles.description}>{bonus.description}</Text>
      </View>
      <View style={styles.valueContainer}>
        <Text style={styles.valueLabel}>Value</Text>
        <Text style={styles.valueAmount}>${bonus.perceivedValue}</Text>
      </View>
      <View style={styles.checkContainer}>
        <Check size={16} color={colors.success} />
      </View>
    </MotiView>
  );
}

interface ValueStackSummaryProps {
  totalValue: number;
  yourPrice: number;
  delay?: number;
}

export function ValueStackSummary({
  totalValue,
  yourPrice,
  delay = 0,
}: ValueStackSummaryProps) {
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const savingsPercent = Math.round(((totalValue - yourPrice) / totalValue) * 100);

  return (
    <MotiView
      from={motionFrom.fadeUp}
      animate={{ opacity: 1, translateY: 0 }}
      transition={getTransition({ delay })}
      style={styles.summaryContainer}
    >
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Total Value</Text>
        <Text style={styles.totalValue}>${totalValue.toLocaleString()}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Your Price</Text>
        <Text style={styles.yourPrice}>${yourPrice}</Text>
      </View>
      <View style={styles.savingsRow}>
        <Text style={styles.savingsText}>You save {savingsPercent}%</Text>
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  name: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 13,
    color: colors.text.primary,
    marginBottom: 2,
  },
  description: {
    fontFamily: "PlusJakartaSans",
    fontSize: 11,
    color: colors.text.muted,
  },
  valueContainer: {
    alignItems: "flex-end",
  },
  valueLabel: {
    fontFamily: "PlusJakartaSans",
    fontSize: 9,
    color: colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  valueAmount: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
    color: colors.text.secondary,
    textDecorationLine: "line-through",
  },
  checkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryContainer: {
    backgroundColor: "rgba(250, 204, 21, 0.08)",
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(250, 204, 21, 0.2)",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.secondary,
  },
  totalValue: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: colors.text.muted,
    textDecorationLine: "line-through",
  },
  yourPrice: {
    fontFamily: "Satoshi-Bold",
    fontSize: 24,
    color: colors.accent[400],
  },
  savingsRow: {
    alignItems: "center",
    marginTop: 4,
  },
  savingsText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 13,
    color: colors.accent[400],
  },
});

