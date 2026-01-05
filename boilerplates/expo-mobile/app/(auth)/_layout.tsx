import { Stack } from "expo-router";

/**
 * Auth Layout
 * 
 * Stack navigator for authentication screens.
 * 
 * @module auth
 */
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}

