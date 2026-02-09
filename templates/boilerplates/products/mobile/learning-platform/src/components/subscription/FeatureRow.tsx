import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Check, X, Minus } from "lucide-react-native";

import { FeatureValue } from "@/lib/subscription/mockData";
import { colors } from "@/theme/tokens";

interface Props {
  value: FeatureValue;
  isHighlighted?: boolean;
}

export function FeatureCell({ value, isHighlighted = false }: Props) {
  if (typeof value === "boolean") {
    return (
      <View style={[styles.cell, isHighlighted && styles.cellHighlighted]}>
        {value ? (
          <Check size={18} color={colors.success} />
        ) : (
          <X size={18} color={colors.text.muted} />
        )}
      </View>
    );
  }

  if (value === "View only" || value === "Community") {
    return (
      <View style={[styles.cell, isHighlighted && styles.cellHighlighted]}>
        <Text style={styles.limitedText}>{value}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.cell, isHighlighted && styles.cellHighlighted]}>
      <Text style={[styles.valueText, isHighlighted && styles.valueTextHighlighted]}>
        {value}
      </Text>
    </View>
  );
}

interface FeatureRowProps {
  featureName: string;
  values: Record<string, FeatureValue>;
  tiers: string[];
  highlightedTier?: string;
}

export function FeatureRow({
  featureName,
  values,
  tiers,
  highlightedTier,
}: FeatureRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.nameCell}>
        <Text style={styles.featureName}>{featureName}</Text>
      </View>
      {tiers.map((tier) => (
        <FeatureCell
          key={tier}
          value={values[tier]}
          isHighlighted={tier === highlightedTier}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.06)",
  },
  nameCell: {
    flex: 2,
    paddingVertical: 14,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  featureName: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.secondary,
  },
  cell: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cellHighlighted: {
    backgroundColor: "rgba(6, 182, 212, 0.06)",
  },
  valueText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.primary,
    textAlign: "center",
  },
  valueTextHighlighted: {
    fontFamily: "PlusJakartaSans-SemiBold",
    color: colors.secondary[400],
  },
  limitedText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 11,
    color: colors.text.muted,
    textAlign: "center",
  },
});

