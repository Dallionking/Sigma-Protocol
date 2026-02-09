/**
 * System States Layout
 * 
 * Premium screen transitions for all system state screens.
 * Uses expo-router's built-in animation options.
 */

import { Stack } from 'expo-router';
import { colors } from '@/lib/theme';

export default function SystemLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.neutral[0] },
      }}
    >
      {/* Offline - Alert style dropping from top */}
      <Stack.Screen 
        name="offline" 
        options={{
          animation: 'slide_from_bottom',
          gestureEnabled: true,
          gestureDirection: 'vertical',
        }}
      />
      
      {/* No Broker - Zoom in for focus/attention */}
      <Stack.Screen 
        name="no-broker" 
        options={{
          animation: 'fade_from_bottom',
        }}
      />
      
      {/* Insufficient Balance - Modal card style */}
      <Stack.Screen 
        name="insufficient-balance" 
        options={{
          animation: 'slide_from_bottom',
          gestureEnabled: true,
        }}
      />
      
      {/* Session Expired - Fade for security context */}
      <Stack.Screen 
        name="session-expired" 
        options={{
          animation: 'fade',
        }}
      />
      
      {/* Access Denied - Modal-style from bottom (paywall) */}
      <Stack.Screen 
        name="access-denied" 
        options={{
          animation: 'slide_from_bottom',
          gestureEnabled: true,
          gestureDirection: 'vertical',
        }}
      />
      
      {/* Error - Dismissible card */}
      <Stack.Screen 
        name="error" 
        options={{
          animation: 'slide_from_bottom',
          gestureEnabled: true,
        }}
      />
    </Stack>
  );
}

