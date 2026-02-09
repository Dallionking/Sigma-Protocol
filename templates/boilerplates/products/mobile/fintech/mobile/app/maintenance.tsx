import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';

// Simulated maintenance check
const checkMaintenance = async (): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  // In production, check API for maintenance status
  return Math.random() > 0.5; // 50% chance to "resolve" for demo
};

export default function MaintenanceScreen() {
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRetrying(true);
    
    const isStillMaintenance = await checkMaintenance();
    
    setIsRetrying(false);
    
    if (!isStillMaintenance) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/');
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  return (
    <Screen safeArea padded style={styles.container}>
      <View style={styles.content}>
        {/* Animated Icon */}
        <MotiView
          from={{ rotate: '0deg' }}
          animate={{ rotate: '360deg' }}
          transition={{
            type: 'timing',
            duration: 8000,
            loop: true,
          }}
          style={styles.iconContainer}
        >
          <NeonText variant="display" color="primary" glow>
            ⚙
          </NeonText>
        </MotiView>

        {/* Headline */}
        <NeonText variant="h2" style={styles.headline}>
          Maintenance Mode
        </NeonText>

        {/* Description */}
        <NeonText variant="body" color="muted" style={styles.description}>
          We're upgrading the Protocol.{'\n'}
          Please try again in a few minutes.
        </NeonText>

        {/* Retry button */}
        <View style={styles.buttonContainer}>
          <NeonButton 
            onPress={handleRetry} 
            disabled={isRetrying}
          >
            {isRetrying ? 'Checking...' : 'Retry'}
          </NeonButton>
        </View>

        {/* Loading indicator */}
        {isRetrying && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={styles.loadingContainer}
          >
            <ActivityIndicator color={colors.primary.DEFAULT} size="small" />
          </MotiView>
        )}
      </View>

      {/* Status footer */}
      <View style={styles.footer}>
        <View style={styles.statusRow}>
          <View style={styles.statusDot} />
          <NeonText variant="mono" color="muted" style={styles.statusText}>
            Status: @ 99.9% uptime target
          </NeonText>
        </View>
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
    paddingHorizontal: spacing[6],
  },
  iconContainer: {
    marginBottom: spacing[6],
  },
  headline: {
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing[8],
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 320,
  },
  loadingContainer: {
    marginTop: spacing[4],
  },
  footer: {
    alignItems: 'center',
    paddingBottom: spacing[6],
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary.DEFAULT,
    marginRight: spacing[2],
  },
  statusText: {
    fontSize: 12,
  },
});

