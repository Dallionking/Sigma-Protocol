import React from "react";
import { Pressable, Text, ViewStyle } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  label?: string;
  style?: ViewStyle;
};

export function DevHubButton({ label = "DEV", style }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  if (!__DEV__) return null;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push("/dev")}
      style={[
        {
          position: "absolute",
          top: insets.top + 10,
          right: 14,
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 999,
          backgroundColor: "rgba(17, 24, 39, 0.55)",
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.12)",
        },
        style,
      ]}
    >
      <Text
        style={{
          color: "rgba(248, 250, 252, 0.92)",
          fontSize: 12,
          letterSpacing: 0.7,
          fontFamily: "SpaceMono",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}




