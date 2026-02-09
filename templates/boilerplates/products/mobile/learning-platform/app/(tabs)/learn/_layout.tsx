import React from "react";
import { Stack } from "expo-router";

export default function LearnLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="category-list" />
      <Stack.Screen name="lesson-list" />
      <Stack.Screen name="lesson-detail" />
      <Stack.Screen name="lesson-content" />
      <Stack.Screen name="lesson-audio" />
      <Stack.Screen name="lesson-complete" />
      <Stack.Screen name="lesson-locked" />
      <Stack.Screen name="assessment" />
      <Stack.Screen name="vocab-list" />
      <Stack.Screen name="vocab-detail" />
      <Stack.Screen name="vocab-flashcard" />
      <Stack.Screen name="slang-regions" />
      <Stack.Screen name="slang-list" />
      <Stack.Screen name="slang-detail" />
      <Stack.Screen name="story-list" />
      <Stack.Screen name="story-reader" />
      <Stack.Screen name="worksheet" />
    </Stack>
  );
}



