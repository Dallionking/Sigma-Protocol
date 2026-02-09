import { Stack } from "expo-router";

export default function StatesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        animationDuration: 260,
      }}
    />
  );
}

