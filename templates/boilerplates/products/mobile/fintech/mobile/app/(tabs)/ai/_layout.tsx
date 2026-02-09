import { Stack } from 'expo-router';

export default function AILayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#000000' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="detail" />
      <Stack.Screen name="cycle-history" />
      <Stack.Screen name="guarantee-info" />
      <Stack.Screen name="guarantee-claim" />
      <Stack.Screen name="guarantee-success" />
      <Stack.Screen name="signal-explainer" />
    </Stack>
  );
}

