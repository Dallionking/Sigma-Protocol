import React from "react";
import { Stack } from "expo-router";

export default function SubscriptionLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    >
      <Stack.Screen name="paywall" />
      <Stack.Screen name="plan-compare" />
      <Stack.Screen name="checkout" />
      <Stack.Screen name="success" />
      <Stack.Screen name="manage" />
      <Stack.Screen
        name="cancel"
        options={{
          presentation: "transparentModal",
          animation: "fade",
        }}
      />
    </Stack>
  );
}

