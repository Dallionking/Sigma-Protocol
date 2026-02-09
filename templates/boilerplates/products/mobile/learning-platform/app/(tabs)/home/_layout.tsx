import React from "react";
import { Stack } from "expo-router";

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="verb-of-day" />
      <Stack.Screen name="streak-detail" />
      <Stack.Screen name="daily-challenge" />
      <Stack.Screen name="weekly-challenge" />
      <Stack.Screen name="feed" />
    </Stack>
  );
}



