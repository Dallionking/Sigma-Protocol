import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Check } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { GlassPanel } from "@/components/GlassPanel";
import { TierBadge } from "./TierBadge";
import { PriceDisplay } from "./PriceDisplay";
import { TierInfo, getPrice } from "@/lib/subscription/mockData";
import { BillingCycle } from "@/stores/subscriptionStore";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { colors, durations } from "@/theme/tokens";

interface Props {
  tier: TierInfo;
  billingCycle: BillingCycle;
  isSelected: boolean;
  onSelect: (tier: TierInfo) => void;
  delay?: number;
  compact?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function TierCard({
  tier,
  billingCycle,
  isSelected,
  onSelect,
  delay = 0,
  compact = false,
}: Props) {
  const scale = useSharedValue(1);
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const price = getPrice(tier, billingCycle);

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(0.98, { duration: durations.fast });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: durations.fast });
  }, [scale]);

  const handlePress = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelect(tier);
  }, [onSelect, tier]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <MotiView
      from={motionFrom.fadeUp}
      animate={{ opacity: 1, translateY: 0 }}
      transition={getTransition({ delay })}
      style={compact ? styles.containerCompact : styles.container}
    >
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={[animatedStyle, styles.pressableContainer]}
      >
        {/* Badge - positioned outside GlassPanel to avoid clipping */}
        {tier.isRecommended && (
          <View style={styles.badgeContainer}>
            <TierBadge type="recommended" />
          </View>
        )}

        <GlassPanel
          style={[
            compact ? styles.cardCompact : styles.card,
            isSelected && styles.cardSelected,
            tier.isRecommended && styles.cardRecommended,
          ]}
        >
          {/* Tier Name */}
          <Text style={[styles.tierName, compact && styles.tierNameCompact]}>
            {tier.name}
          </Text>
          <Text style={styles.tagline}>{tier.tagline}</Text>

          {/* Price */}
          <View style={styles.priceContainer}>
            <PriceDisplay
              price={price}
              cycle={billingCycle}
              size={compact ? "small" : "large"}
            />
            {billingCycle === "annual" && tier.pricing.savingsPercent > 0 && (
              <Text style={styles.savingsText}>
                Save {tier.pricing.savingsPercent}%
              </Text>
            )}
          </View>

          {/* Feature Highlights */}
          {!compact && (
            <View style={styles.featuresContainer}>
              {tier.featureHighlights.slice(0, 4).map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <Check size={14} color={colors.secondary[400]} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Selection indicator */}
          {isSelected && (
            <View style={styles.selectedIndicator}>
              <Check size={16} color="#FFFFFF" />
            </View>
          )}
        </GlassPanel>
      </AnimatedPressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 14,
  },
  containerCompact: {
    width: "48%",
    paddingTop: 14,
  },
  pressableContainer: {
    position: "relative",
  },
  card: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
    minHeight: 280,
    overflow: "visible",
  },
  cardCompact: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
    minHeight: 160,
    overflow: "visible",
  },
  cardSelected: {
    borderColor: colors.secondary[400],
  },
  cardRecommended: {
    backgroundColor: "rgba(6, 182, 212, 0.08)",
  },
  badgeContainer: {
    position: "absolute",
    top: -2,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  tierName: {
    fontFamily: "Satoshi-Bold",
    fontSize: 22,
    color: colors.text.primary,
    textAlign: "center",
    marginTop: 8,
  },
  tierNameCompact: {
    fontSize: 18,
  },
  tagline: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.muted,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 16,
  },
  priceContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  savingsText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 12,
    color: colors.accent[400],
    marginTop: 4,
  },
  featuresContainer: {
    gap: 8,
    marginTop: 8,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.secondary,
    flex: 1,
  },
  selectedIndicator: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.secondary[500],
    alignItems: "center",
    justifyContent: "center",
  },
});

