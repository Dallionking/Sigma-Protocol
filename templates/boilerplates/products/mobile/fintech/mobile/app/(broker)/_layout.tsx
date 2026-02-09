/**
 * Broker Layout
 * 
 * Premium screen transitions for broker connection flow.
 * Uses expo-router's built-in animation options.
 */

import { Stack } from 'expo-router';
import { colors } from '@/lib/theme';

export default function BrokerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.neutral[0] },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="connect-start" 
        options={{
          animation: 'slide_from_bottom',
          gestureEnabled: true,
          gestureDirection: 'vertical',
        }}
      />
      <Stack.Screen 
        name="connect-tradelocker" 
        options={{ 
          gestureEnabled: false,
          animation: 'fade',
        }} 
      />
      <Stack.Screen 
        name="connect-success" 
        options={{ 
          gestureEnabled: false,
          animation: 'fade_from_bottom',
        }} 
      />
      <Stack.Screen 
        name="connect-failure" 
        options={{
          animation: 'slide_from_bottom',
          gestureEnabled: true,
        }}
      />
    </Stack>
  );
}

