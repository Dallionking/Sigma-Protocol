import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Home, BookOpen, Mic, User, Calendar, LucideIcon } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from "react-native-reanimated";

import { useReduceMotion } from "../hooks/useReduceMotion";
import { colors, durations } from "../theme/tokens";

const TAB_ICONS: Record<string, LucideIcon> = {
  home: Home,
  learn: BookOpen,
  practice: Mic,
  schedule: Calendar,
  profile: User,
};

const TAB_LABELS: Record<string, string> = {
  home: "Home",
  learn: "Learn",
  practice: "Practice",
  schedule: "Schedule",
  profile: "Profile",
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Using any for props since expo-router's tab bar props differ from react-navigation
export function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();

  // Filter to only show tabs that have icons defined (skip hidden ones like index, two)
  const visibleRoutes = state.routes.filter((route: any) => {
    const routeName = route.name.replace("/index", "").replace("index", "home");
    return TAB_ICONS[routeName] !== undefined;
  });

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, 8) },
      ]}
    >
      <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.tabsRow}>
        {visibleRoutes.map((route: any) => {
          const originalIndex = state.routes.findIndex((r: any) => r.key === route.key);
          const isFocused = state.index === originalIndex;
          const routeName = route.name.replace("/index", "").replace("index", "home");

          const Icon = TAB_ICONS[routeName] || Home;
          const label = TAB_LABELS[routeName] || routeName;

          const onPress = () => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TabButton
              key={route.key}
              Icon={Icon}
              label={label}
              isFocused={isFocused}
              onPress={onPress}
              reduceMotion={reduceMotion}
            />
          );
        })}
      </View>
    </View>
  );
}

function TabButton({
  Icon,
  label,
  isFocused,
  onPress,
  reduceMotion,
}: {
  Icon: LucideIcon;
  label: string;
  isFocused: boolean;
  onPress: () => void;
  reduceMotion: boolean;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = reduceMotion ? 0.95 : withTiming(0.95, { duration: durations.fast });
  }, [reduceMotion, scale]);

  const handlePressOut = useCallback(() => {
    scale.value = reduceMotion ? 1 : withTiming(1, { duration: durations.fast });
  }, [reduceMotion, scale]);

  return (
    <AnimatedPressable
      style={[styles.tabButton, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={label}
    >
      {/* Active indicator glow */}
      {isFocused && (
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: reduceMotion ? 0 : 200 }}
          style={styles.activeGlow}
        />
      )}

      <View style={styles.iconWrapper}>
        <Icon
          size={22}
          color={isFocused ? colors.primary[400] : colors.text.muted}
          strokeWidth={isFocused ? 2.2 : 1.8}
        />
      </View>

      <Text
        style={[
          styles.label,
          { color: isFocused ? colors.primary[400] : colors.text.muted },
          isFocused && styles.labelActive,
        ]}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    elevation: 100,
    backgroundColor: "rgba(10, 15, 30, 0.92)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
  },
  tabsRow: {
    flexDirection: "row",
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    position: "relative",
  },
  activeGlow: {
    position: "absolute",
    top: -4,
    left: "25%",
    right: "25%",
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.primary[400],
    shadowColor: colors.primary[500],
    shadowOpacity: 0.6,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  iconWrapper: {
    marginBottom: 4,
  },
  label: {
    fontFamily: "PlusJakartaSans",
    fontSize: 11,
  },
  labelActive: {
    fontFamily: "PlusJakartaSans-SemiBold",
  },
});



