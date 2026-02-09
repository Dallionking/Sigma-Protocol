import { Stack } from 'expo-router';

export default function ReferralLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#000000' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="invite" />
      <Stack.Screen name="redeem" />
      <Stack.Screen name="rewards" />
      <Stack.Screen name="terms" />
    </Stack>
  );
}


