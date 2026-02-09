import { Stack } from 'expo-router';

export default function SecurityLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#000000' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="change-password" />
      <Stack.Screen name="sessions" />
      <Stack.Screen 
        name="logout" 
        options={{ 
          presentation: 'transparentModal',
          animation: 'fade',
        }} 
      />
      <Stack.Screen name="delete-account" />
    </Stack>
  );
}

