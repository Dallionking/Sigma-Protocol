/**
 * Onboarding Layout
 * 
 * Premium screen transitions for onboarding flow.
 * Uses expo-router's built-in animation options.
 */

import { Stack } from 'expo-router';
import { colors } from '@/lib/theme';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.neutral[0] },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="welcome" 
        options={{
          animation: 'fade',
        }}
      />
      <Stack.Screen 
        name="value-prop-1" 
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen name="value-prop-2" />
      <Stack.Screen name="value-prop-3" />
      <Stack.Screen 
        name="notifications" 
        options={{
          animation: 'slide_from_bottom',
          gestureEnabled: true,
          gestureDirection: 'vertical',
        }}
      />
      <Stack.Screen 
        name="biometric" 
        options={{
          animation: 'fade_from_bottom',
        }}
      />
    </Stack>
  );
}

