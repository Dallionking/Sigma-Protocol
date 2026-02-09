import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#000000' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="balance-detail" />
      <Stack.Screen name="activity-detail" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}
