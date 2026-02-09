import { Stack } from 'expo-router';

export default function IncomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#000000' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="event-detail" />
      <Stack.Screen name="export" />
      <Stack.Screen name="history-gate" />
      <Stack.Screen name="share-earnings" />
    </Stack>
  );
}

