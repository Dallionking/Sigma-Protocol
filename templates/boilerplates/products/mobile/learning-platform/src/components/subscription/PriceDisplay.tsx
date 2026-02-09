import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { BillingCycle } from "@/stores/subscriptionStore";
import { colors } from "@/theme/tokens";

interface Props {
  price: number;
  cycle: BillingCycle;
  originalPrice?: number;
  size?: "small" | "large";
  showPeriod?: boolean;
}

export function PriceDisplay({
  price,
  cycle,
  originalPrice,
  size = "large",
  showPeriod = true,
}: Props) {
  const isLarge = size === "large";
  const periodLabel = cycle === "monthly" ? "/mo" : "/yr";

  return (
    <View style={styles.container}>
      {originalPrice && originalPrice > price && (
        <Text
          style={[
            styles.originalPrice,
            isLarge ? styles.originalPriceLarge : styles.originalPriceSmall,
          ]}
        >
          ${originalPrice}
        </Text>
      )}
      <View style={styles.priceRow}>
        <Text style={[styles.currency, isLarge ? styles.currencyLarge : styles.currencySmall]}>
          $
        </Text>
        <Text style={[styles.amount, isLarge ? styles.amountLarge : styles.amountSmall]}>
          {price}
        </Text>
        {showPeriod && (
          <Text style={[styles.period, isLarge ? styles.periodLarge : styles.periodSmall]}>
            {periodLabel}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  originalPrice: {
    fontFamily: "PlusJakartaSans",
    color: colors.text.muted,
    textDecorationLine: "line-through",
  },
  originalPriceLarge: {
    fontSize: 16,
    marginBottom: 2,
  },
  originalPriceSmall: {
    fontSize: 12,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  currency: {
    fontFamily: "Satoshi-Bold",
    color: colors.text.primary,
  },
  currencyLarge: {
    fontSize: 20,
    marginRight: 2,
  },
  currencySmall: {
    fontSize: 14,
    marginRight: 1,
  },
  amount: {
    fontFamily: "Satoshi-Bold",
    color: colors.text.primary,
  },
  amountLarge: {
    fontSize: 36,
    letterSpacing: -1,
  },
  amountSmall: {
    fontSize: 22,
    letterSpacing: -0.5,
  },
  period: {
    fontFamily: "PlusJakartaSans",
    color: colors.text.muted,
  },
  periodLarge: {
    fontSize: 14,
    marginLeft: 2,
  },
  periodSmall: {
    fontSize: 12,
    marginLeft: 1,
  },
});

