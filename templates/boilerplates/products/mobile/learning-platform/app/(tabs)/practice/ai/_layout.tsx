import React from "react";
import { Stack } from "expo-router";

export default function AILayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    >
      {/* Main AI screens */}
      <Stack.Screen name="index" />
      <Stack.Screen name="mode-select" />

      {/* Chat screens */}
      <Stack.Screen name="chat-conversation" />
      <Stack.Screen name="chat-grammar" />
      <Stack.Screen name="chat-story" />
      <Stack.Screen name="chat-drill" />

      {/* Voice screens */}
      <Stack.Screen
        name="voice-talk"
        options={{
          animation: "fade",
        }}
      />
      <Stack.Screen
        name="voice-listening"
        options={{
          animation: "fade",
          presentation: "transparentModal",
        }}
      />
      <Stack.Screen
        name="voice-response"
        options={{
          animation: "fade",
        }}
      />

      {/* Summary */}
      <Stack.Screen
        name="session-summary"
        options={{
          animation: "fade",
        }}
      />
    </Stack>
  );
}

