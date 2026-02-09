import React from "react";
import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    >
      {/* Profile screens */}
      <Stack.Screen name="index" />
      <Stack.Screen name="stats" />
      <Stack.Screen name="achievements" />
      <Stack.Screen name="edit" />

      {/* Settings screens */}
      <Stack.Screen name="settings" />
      <Stack.Screen name="settings-account" />
      <Stack.Screen name="settings-change-email" />
      <Stack.Screen name="settings-change-password" />
      <Stack.Screen
        name="settings-delete-account"
        options={{
          presentation: "transparentModal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen name="settings-notifications" />
      <Stack.Screen name="settings-privacy" />
      <Stack.Screen name="settings-language" />
      <Stack.Screen name="settings-appearance" />
      <Stack.Screen name="settings-help" />
      <Stack.Screen name="settings-contact" />
    </Stack>
  );
}

