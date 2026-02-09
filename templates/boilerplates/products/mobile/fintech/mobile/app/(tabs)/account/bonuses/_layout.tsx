import { Stack } from 'expo-router';

export default function BonusesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#000000' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="quickstart" />
      <Stack.Screen name="quickstart-detail" />
      <Stack.Screen name="masterclass" />
      <Stack.Screen name="weekly-digest" />
      <Stack.Screen name="discord" />
      <Stack.Screen name="voting" />
      <Stack.Screen name="skins" />
      <Stack.Screen name="skin-preview" />
    </Stack>
  );
}


