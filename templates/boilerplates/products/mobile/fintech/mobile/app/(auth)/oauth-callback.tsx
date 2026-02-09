import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonLoader } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';

export default function OAuthCallbackScreen() {
  const router = useRouter();

  useEffect(() => {
    // Simulate authentication processing
    const processAuth = async () => {
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Navigate to broker connection for new users
      router.replace('/(broker)/connect-start');
    };

    processAuth();
  }, []);

  return (
    <Screen safeArea padded style={styles.container}>
      <View style={styles.content}>
        {/* Loader */}
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 200 }}
          style={styles.loaderContainer}
        >
          <NeonLoader size="large" />
        </MotiView>

        {/* Status text */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 500 }}
        >
          <NeonText variant="h3" style={styles.title}>
            Authenticating…
          </NeonText>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 700 }}
        >
          <NeonText variant="body" color="muted" style={styles.subtitle}>
            Securing your portfolio
          </NeonText>
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
  loaderContainer: {
    marginBottom: spacing[8],
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  subtitle: {
    textAlign: 'center',
  },
});

