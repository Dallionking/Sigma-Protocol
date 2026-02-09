import React from "react";
import { Stack } from "expo-router";

export default function PracticeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    >
      {/* Main practice screens */}
      <Stack.Screen name="index" />
      <Stack.Screen name="exercise-select" />

      {/* Exercise type screens */}
      <Stack.Screen name="quiz-mcq" />
      <Stack.Screen name="fill-blank" />
      <Stack.Screen name="speaking" />
      <Stack.Screen name="sentence-build" />
      <Stack.Screen name="listening" />
      <Stack.Screen name="translation" />
      <Stack.Screen name="pronunciation-score" />
      <Stack.Screen name="timed-drill" />

      {/* Result screens */}
      <Stack.Screen
        name="result"
        options={{
          animation: "fade",
        }}
      />
      <Stack.Screen name="result-detail" />

      {/* AI Tutor (nested stack) */}
      <Stack.Screen name="ai" />
    </Stack>
  );
}

