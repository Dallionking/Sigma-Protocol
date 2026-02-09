import { Stack } from 'expo-router';

export default function GateLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#000000' },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="early-access" />
      <Stack.Screen name="waitlist-join" />
      <Stack.Screen name="waitlist-status" />
      <Stack.Screen name="invite-code" />
    </Stack>
  );
}

