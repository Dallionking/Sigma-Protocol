import { Stack } from 'expo-router';

export default function AccountLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#000000' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="profile-edit" />
      <Stack.Screen name="avatar" />
      <Stack.Screen name="about" />
      <Stack.Screen name="brokers" />
      <Stack.Screen name="security" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="support" />
      <Stack.Screen name="legal" />
      <Stack.Screen name="referral" />
      <Stack.Screen name="bonuses" />
      <Stack.Screen name="subscription" />
    </Stack>
  );
}


