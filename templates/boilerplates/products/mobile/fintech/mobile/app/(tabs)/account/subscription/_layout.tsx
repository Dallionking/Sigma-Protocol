import { Stack } from 'expo-router';

export default function SubscriptionLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="compare" />
      <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
      <Stack.Screen name="processing" />
      <Stack.Screen name="success" />
      <Stack.Screen name="failure" />
      <Stack.Screen name="restore" />
      <Stack.Screen name="manage" />
      <Stack.Screen name="cancel" />
      <Stack.Screen name="founding" />
    </Stack>
  );
}

