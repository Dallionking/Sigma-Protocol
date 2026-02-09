import React from "react";
import { Stack } from "expo-router";

export default function FeedLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="post-detail" />
      <Stack.Screen name="homework" />
      <Stack.Screen name="homework-submit" />
      <Stack.Screen name="comments" />
      <Stack.Screen 
        name="create-post" 
        options={{ 
          presentation: "modal",
          animation: "slide_from_bottom",
        }} 
      />
    </Stack>
  );
}

