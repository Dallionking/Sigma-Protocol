/**
 * Auth Layout
 * 
 * Premium screen transitions for authentication flow.
 * Uses expo-router's built-in animation options.
 */

import { Stack } from 'expo-router';
import { colors } from '@/lib/theme';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.neutral[0] },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="signup" />
      <Stack.Screen 
        name="signin" 
        options={{
          animation: 'fade',
        }}
      />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen 
        name="check-email" 
        options={{
          animation: 'fade_from_bottom',
        }}
      />
      <Stack.Screen name="reset-password" />
      <Stack.Screen 
        name="oauth-callback" 
        options={{ 
          gestureEnabled: false,
          animation: 'fade',
        }} 
      />
    </Stack>
  );
}

