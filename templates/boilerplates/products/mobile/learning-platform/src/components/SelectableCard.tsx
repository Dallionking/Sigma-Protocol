import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  Briefcase,
  Home,
  Leaf,
  MessageCircle,
  Mountain,
  Plane,
  Sprout,
  TreeDeciduous,
  LucideIcon,
} from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { colors, durations } from "../theme/tokens";

const ICON_MAP: Record<string, LucideIcon> = {
  Plane,
  MessageCircle,
  Briefcase,
  Home,
  Leaf,
  Sprout,
  TreeDeciduous,
  Mountain,
};

type Props = {
  icon: string;
  label: string;
  subtitle?: string;
  selected: boolean;
  onSelect: () => void;
  delay?: number;
  variant?: "grid" | "list";
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function SelectableCard({
  icon,
  label,
  subtitle,
  selected,
  onSelect,
  delay = 0,
  variant = "grid",
}: Props) {
  const pressed = useSharedValue(0);
  const IconComponent = ICON_MAP[icon] || Leaf;

  const animatedStyle = useAnimatedStyle(() => {
    const scale = 1 - pressed.value * 0.03;
    return { transform: [{ scale }] };
  });

  const handlePressIn = useCallback(() => {
    pressed.value = withTiming(1, { duration: durations.fast });
  }, [pressed]);

  const handlePressOut = useCallback(() => {
    pressed.value = withTiming(0, { duration: durations.fast });
  }, [pressed]);

  const handlePress = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect();
  }, [onSelect]);

  const isGrid = variant === "grid";

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 260, delay }}
      style={isGrid ? styles.gridWrapper : styles.listWrapper}
    >
      {/* Glow layer for selected state */}
      {selected && (
        <View
          style={[
            styles.glow,
            isGrid ? styles.glowGrid : styles.glowList,
          ]}
        />
      )}

      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={[
          isGrid ? styles.cardGrid : styles.cardList,
          selected && styles.cardSelected,
          animatedStyle,
        ]}
        accessibilityRole="button"
        accessibilityState={{ selected }}
      >
        <View
          style={[
            styles.iconContainer,
            selected && styles.iconContainerSelected,
          ]}
        >
          <IconComponent
            size={isGrid ? 24 : 22}
            color={selected ? colors.primary[400] : colors.text.secondary}
          />
        </View>

        <View style={isGrid ? styles.textContainerGrid : styles.textContainerList}>
          <Text
            style={[
              styles.label,
              selected && styles.labelSelected,
            ]}
          >
            {label}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}
        </View>
      </AnimatedPressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  gridWrapper: {
    flex: 1,
    position: "relative",
  },
  listWrapper: {
    position: "relative",
    width: "100%",
  },
  glow: {
    position: "absolute",
    borderRadius: 20,
    backgroundColor: colors.primary[500],
    opacity: 0.12,
  },
  glowGrid: {
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
  },
  glowList: {
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
  },
  cardGrid: {
    backgroundColor: "rgba(17, 24, 39, 0.6)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 130,
  },
  cardList: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(17, 24, 39, 0.6)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 16,
  },
  cardSelected: {
    borderColor: colors.primary[500],
    backgroundColor: "rgba(99, 102, 241, 0.08)",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainerSelected: {
    backgroundColor: "rgba(99, 102, 241, 0.15)",
  },
  textContainerGrid: {
    marginTop: 12,
    alignItems: "center",
  },
  textContainerList: {
    marginLeft: 14,
    flex: 1,
  },
  label: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 15,
    color: colors.text.primary,
    textAlign: "center",
  },
  labelSelected: {
    color: colors.primary[400],
  },
  subtitle: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.muted,
    marginTop: 2,
  },
});



