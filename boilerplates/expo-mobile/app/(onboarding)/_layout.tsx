import { Stack } from "expo-router";

/**
 * Onboarding Layout
 * 
 * Stack navigator for onboarding flow.
 * 
 * @module mobileOnboarding
 */
export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="value-props" />
      <Stack.Screen name="permissions" />
    </Stack>
  );
}

