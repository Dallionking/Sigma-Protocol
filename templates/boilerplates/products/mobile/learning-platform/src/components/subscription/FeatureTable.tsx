import { MotiView } from "moti";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { GlassPanel } from "@/components/GlassPanel";
import { FeatureRow } from "./FeatureRow";
import {
  FEATURE_MATRIX,
  FEATURE_CATEGORIES,
  getPaidTiers,
  TierInfo,
} from "@/lib/subscription/mockData";
import { SubscriptionTier, BillingCycle } from "@/stores/subscriptionStore";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { colors } from "@/theme/tokens";

interface Props {
  selectedTier?: SubscriptionTier;
  billingCycle: BillingCycle;
  delay?: number;
}

export function FeatureTable({ selectedTier = "pro", billingCycle, delay = 0 }: Props) {
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const paidTiers = getPaidTiers();
  const tierIds = paidTiers.map((t) => t.id);

  return (
    <MotiView
      from={motionFrom.fadeUp}
      animate={{ opacity: 1, translateY: 0 }}
      transition={getTransition({ delay })}
    >
      <GlassPanel style={styles.container}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.headerNameCell}>
            <Text style={styles.headerLabel}>Features</Text>
          </View>
          {paidTiers.map((tier) => (
            <View
              key={tier.id}
              style={[
                styles.headerTierCell,
                tier.id === selectedTier && styles.headerTierCellSelected,
              ]}
            >
              <Text
                style={[
                  styles.headerTierName,
                  tier.id === selectedTier && styles.headerTierNameSelected,
                ]}
              >
                {tier.name}
              </Text>
              <Text style={styles.headerPrice}>
                ${billingCycle === "monthly" ? tier.pricing.monthly : tier.pricing.annual}
                <Text style={styles.headerPeriod}>
                  {billingCycle === "monthly" ? "/mo" : "/yr"}
                </Text>
              </Text>
            </View>
          ))}
        </View>

        {/* Feature Categories */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {FEATURE_CATEGORIES.map((category) => {
            const categoryFeatures = FEATURE_MATRIX.filter(
              (f) => f.category === category.id
            );

            return (
              <View key={category.id}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                </View>
                {categoryFeatures.map((feature) => (
                  <FeatureRow
                    key={feature.id}
                    featureName={feature.name}
                    values={feature.values}
                    tiers={tierIds}
                    highlightedTier={selectedTier}
                  />
                ))}
              </View>
            );
          })}
        </ScrollView>
      </GlassPanel>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  headerNameCell: {
    flex: 2,
    padding: 16,
  },
  headerLabel: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 12,
    color: colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  headerTierCell: {
    flex: 1,
    padding: 12,
    alignItems: "center",
  },
  headerTierCellSelected: {
    backgroundColor: "rgba(6, 182, 212, 0.1)",
  },
  headerTierName: {
    fontFamily: "Satoshi-Bold",
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 4,
  },
  headerTierNameSelected: {
    color: colors.secondary[400],
  },
  headerPrice: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 12,
    color: colors.text.secondary,
  },
  headerPeriod: {
    fontFamily: "PlusJakartaSans",
    fontSize: 10,
    color: colors.text.muted,
  },
  categoryHeader: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  categoryName: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 11,
    color: colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});

