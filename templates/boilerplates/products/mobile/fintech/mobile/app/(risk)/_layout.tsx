/**
 * Risk Layout
 * 
 * Premium screen transitions for risk configuration flow.
 * Uses expo-router's built-in animation options.
 */

import { Stack } from 'expo-router';
import { colors } from '@/lib/theme';

export default function RiskLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.neutral[0] },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="select" 
        options={{
          animation: 'slide_from_bottom',
          gestureEnabled: true,
          gestureDirection: 'vertical',
        }}
      />
      <Stack.Screen 
        name="customize" 
        options={{
          animation: 'slide_from_bottom',
          gestureEnabled: true,
        }}
      />
      <Stack.Screen 
        name="activate" 
        options={{ 
          gestureEnabled: false,
          animation: 'fade',
        }} 
      />
      <Stack.Screen 
        name="success" 
        options={{ 
          gestureEnabled: false,
          animation: 'fade_from_bottom',
        }} 
      />
      <Stack.Screen name="settings" />
    </Stack>
  );
}

