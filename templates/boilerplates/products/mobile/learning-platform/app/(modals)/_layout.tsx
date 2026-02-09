import React from "react";
import { Stack } from "expo-router";

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: "modal",
        animation: "slide_from_bottom",
        contentStyle: { backgroundColor: "transparent" },
      }}
    >
      <Stack.Screen name="subscription" />
    </Stack>
  );
}

