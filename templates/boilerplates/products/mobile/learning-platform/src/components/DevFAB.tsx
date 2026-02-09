import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Wrench } from "lucide-react-native";

import { colors } from "@/theme/tokens";

/**
 * Floating Action Button for quick access to the Developer Hub.
 * Only renders in __DEV__ mode.
 */
export function DevFAB() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  if (!__DEV__) return null;

  return (
    <Pressable
      onPress={() => router.push("/dev")}
      style={({ pressed }) => [
        styles.fab,
        {
          bottom: insets.bottom + 80, // Above tab bar
          opacity: pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.95 : 1 }],
        },
      ]}
      accessibilityLabel="Open Developer Hub"
      accessibilityRole="button"
    >
      <Wrench size={20} color={colors.text.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(6, 182, 212, 0.85)",
    alignItems: "center",
    justifyContent: "center",
    // Shadow for iOS
    shadowColor: colors.secondary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    // Elevation for Android
    elevation: 8,
    // Border for subtle definition
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    zIndex: 9999,
  },
});

