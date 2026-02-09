/**
 * Portfolio Layout
 * 
 * Premium screen transitions for portfolio setup flow.
 * Uses expo-router's built-in animation options.
 */

import { Stack } from 'expo-router';
import { colors } from '@/lib/theme';

export default function PortfolioLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.neutral[0] },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="balance" />
      <Stack.Screen 
        name="fund-prompt" 
        options={{
          animation: 'slide_from_bottom',
          gestureEnabled: true,
          gestureDirection: 'vertical',
        }}
      />
      <Stack.Screen 
        name="minimum-info" 
        options={{
          animation: 'slide_from_bottom',
          gestureEnabled: true,
        }}
      />
      <Stack.Screen 
        name="ready" 
        options={{ 
          gestureEnabled: false,
          animation: 'fade_from_bottom',
        }} 
      />
    </Stack>
  );
}

