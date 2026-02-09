import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';

export default function CheckEmailScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [isResending, setIsResending] = useState(false);

  const handleResend = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsResending(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsResending(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleBackToSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/(auth)/signin');
  };

  return (
    <Screen safeArea padded style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        <MotiView
          from={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', delay: 200 }}
          style={styles.iconContainer}
        >
          <NeonText variant="display" style={styles.icon}>
            ✉️
          </NeonText>
        </MotiView>

        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 400 }}
        >
          <NeonText variant="h2" style={styles.title}>
            Check your email
          </NeonText>
        </MotiView>

        {/* Description */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 500 }}
        >
          <NeonText variant="body" color="muted" style={styles.description}>
            We sent a reset link to:
          </NeonText>
          <NeonText variant="body" color="primary" style={styles.email}>
            {email || 'your email'}
          </NeonText>
        </MotiView>

        {/* Resend button */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 700 }}
          style={styles.buttonContainer}
        >
          <NeonButton 
            onPress={handleResend} 
            variant="primary"
            disabled={isResending}
          >
            {isResending ? 'Sending...' : 'Resend Link'}
          </NeonButton>
        </MotiView>

        {/* Back to sign in */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', delay: 900 }}
        >
          <Pressable onPress={handleBackToSignIn} style={styles.backLink}>
            <NeonText variant="body" color="muted">
              Back to Sign In
            </NeonText>
          </Pressable>
        </MotiView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[0],
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
  },
  iconContainer: {
    marginBottom: spacing[6],
  },
  icon: {
    fontSize: 64,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  description: {
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  email: {
    textAlign: 'center',
    marginBottom: spacing[8],
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 320,
    marginBottom: spacing[6],
  },
  backLink: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
  },
});

