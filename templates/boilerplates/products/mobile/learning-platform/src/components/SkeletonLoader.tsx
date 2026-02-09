import { MotiView } from "moti";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

import { useReduceMotion } from "../hooks/useReduceMotion";
import { colors } from "../theme/tokens";

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

type SkeletonProps = {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
};

/**
 * Skeleton - Shimmer loading placeholder
 */
export function Skeleton({
  width = "100%",
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const reduceMotion = useReduceMotion();
  const shimmerPosition = useSharedValue(-1);

  React.useEffect(() => {
    if (reduceMotion) return;

    shimmerPosition.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      false
    );
  }, [shimmerPosition, reduceMotion]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerPosition.value * 200 }],
  }));

  return (
    <View
      style={[
        styles.skeleton,
        { width, height, borderRadius },
        style,
      ]}
    >
      {!reduceMotion && (
        <AnimatedLinearGradient
          colors={[
            "transparent",
            "rgba(255, 255, 255, 0.08)",
            "transparent",
          ]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.shimmer, shimmerStyle]}
        />
      )}
    </View>
  );
}

/**
 * SkeletonCard - Card-shaped skeleton for dashboard
 */
export function SkeletonCard({ style }: { style?: ViewStyle }) {
  const reduceMotion = useReduceMotion();

  return (
    <MotiView
      from={reduceMotion ? undefined : { opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ type: "timing", duration: 800, loop: !reduceMotion }}
      style={[styles.card, style]}
    >
      <View style={styles.cardHeader}>
        <Skeleton width={120} height={16} />
        <Skeleton width={60} height={16} />
      </View>
      <Skeleton width="80%" height={24} style={styles.cardTitle} />
      <Skeleton width="60%" height={14} style={styles.cardSubtitle} />
      <Skeleton width="100%" height={8} borderRadius={4} style={styles.cardProgress} />
      <Skeleton width="100%" height={48} borderRadius={12} style={styles.cardButton} />
    </MotiView>
  );
}

/**
 * SkeletonXPRing - Circular skeleton for XP ring
 */
export function SkeletonXPRing({ size = 80 }: { size?: number }) {
  const reduceMotion = useReduceMotion();

  return (
    <MotiView
      from={reduceMotion ? undefined : { opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ type: "timing", duration: 800, loop: !reduceMotion }}
      style={styles.xpContainer}
    >
      <View style={[styles.xpRing, { width: size, height: size, borderRadius: size / 2 }]} />
      <View style={styles.xpInfo}>
        <Skeleton width={80} height={22} />
        <Skeleton width={100} height={14} style={{ marginTop: 4 }} />
      </View>
    </MotiView>
  );
}

/**
 * SkeletonQuickAction - Small action card skeleton
 */
export function SkeletonQuickAction() {
  const reduceMotion = useReduceMotion();

  return (
    <MotiView
      from={reduceMotion ? undefined : { opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ type: "timing", duration: 800, loop: !reduceMotion }}
      style={styles.quickAction}
    >
      <Skeleton width={44} height={44} borderRadius={14} />
      <Skeleton width={70} height={14} style={{ marginTop: 12 }} />
      <Skeleton width={50} height={12} style={{ marginTop: 4 }} />
    </MotiView>
  );
}

/**
 * SkeletonFeed - Feed card skeleton
 */
export function SkeletonFeed() {
  const reduceMotion = useReduceMotion();

  return (
    <MotiView
      from={reduceMotion ? undefined : { opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ type: "timing", duration: 800, loop: !reduceMotion }}
      style={styles.feed}
    >
      <View style={styles.feedHeader}>
        <Skeleton width={36} height={36} borderRadius={18} />
        <View style={styles.feedMeta}>
          <Skeleton width={60} height={14} />
          <Skeleton width={40} height={12} style={{ marginTop: 4 }} />
        </View>
      </View>
      <Skeleton width="100%" height={14} style={{ marginTop: 12 }} />
      <Skeleton width="80%" height={14} style={{ marginTop: 6 }} />
    </MotiView>
  );
}

/**
 * DashboardSkeleton - Full dashboard loading state
 */
export function DashboardSkeleton() {
  return (
    <View style={styles.dashboardContainer}>
      {/* Header skeleton */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Skeleton width={48} height={48} borderRadius={24} />
          <View style={styles.headerText}>
            <Skeleton width={150} height={22} />
            <Skeleton width={180} height={14} style={{ marginTop: 4 }} />
          </View>
        </View>
        <Skeleton width={70} height={36} borderRadius={16} />
      </View>

      {/* XP Section */}
      <View style={styles.section}>
        <SkeletonXPRing />
      </View>

      {/* Continue Lesson */}
      <View style={styles.section}>
        <SkeletonCard />
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsRow}>
        <SkeletonQuickAction />
        <SkeletonQuickAction />
      </View>

      {/* Feed */}
      <View style={styles.section}>
        <Skeleton width={80} height={16} style={{ marginBottom: 12 }} />
        <SkeletonFeed />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    overflow: "hidden",
  },
  shimmer: {
    position: "absolute",
    top: 0,
    left: -100,
    right: 0,
    bottom: 0,
    width: 100,
  },
  card: {
    backgroundColor: "rgba(17, 24, 39, 0.6)",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  cardTitle: {
    marginBottom: 8,
  },
  cardSubtitle: {
    marginBottom: 16,
  },
  cardProgress: {
    marginBottom: 20,
  },
  cardButton: {},
  xpContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(17, 24, 39, 0.6)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    gap: 16,
  },
  xpRing: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  xpInfo: {
    flex: 1,
  },
  quickAction: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.6)",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  quickActionsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  feed: {
    backgroundColor: "rgba(17, 24, 39, 0.6)",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  feedHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  feedMeta: {
    marginLeft: 10,
  },
  dashboardContainer: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerText: {
    marginLeft: 14,
  },
  section: {
    marginBottom: 20,
  },
});



