import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { SystemStateLayout } from '@/components/system';
import { NeonText, Card } from '@/components/primitives';
import { useAuthStore } from '@/lib/stores/auth-store';
import { colors, spacing } from '@/lib/theme';

export default function SessionExpiredScreen() {
  const router = useRouter();
  const { logout } = useAuthStore();

  useEffect(() => {
    // Haptic feedback for session expiry
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, []);

  const handleSignIn = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Clear any stale auth state
    await logout();
    router.replace('/(auth)/signin');
  };

  const handleContactSupport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/account/support');
  };

  return (
    <SystemStateLayout
      type="session-expired"
      icon="⏱"
      title="Session Expired"
      subtitle="Your session has timed out for security. Please sign in again to continue."
      primaryAction={{
        label: 'Sign In',
        onPress: handleSignIn,
      }}
      secondaryAction={{
        label: 'Contact Support',
        onPress: handleContactSupport,
        variant: 'ghost',
      }}
    >
      {/* Security info */}
      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 400, delay: 500 }}
      >
        <Card variant="glassmorphism" padding="md">
          <View style={styles.securityContent}>
            <View style={styles.securityIcon}>
              <NeonText variant="body">🔐</NeonText>
            </View>
            <View style={styles.securityTextContainer}>
              <NeonText variant="caption" color="muted">
                Sessions expire after inactivity to protect your account. 
                Your data and positions remain secure.
              </NeonText>
            </View>
          </View>
        </Card>
      </MotiView>
    </SystemStateLayout>
  );
}

const styles = StyleSheet.create({
  securityContent: {
    flexDirection: 'row',
    gap: spacing[3],
    alignItems: 'flex-start',
  },
  securityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityTextContainer: {
    flex: 1,
  },
});

