import { Stack } from 'expo-router';
import { colors } from '@/lib/theme';

export default function NotificationsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.neutral[0],
        },
        animation: 'slide_from_right',
      }}
    />
  );
}


