import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SystemStateLayout } from '@/components/system';
import { NeonText, Card } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';

/**
 * Simple network check using fetch
 * Returns true if we can reach a fast endpoint
 */
async function checkNetworkConnection(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('https://www.google.com/generate_204', {
      method: 'HEAD',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok || response.status === 204;
  } catch {
    return false;
  }
}

export default function OfflineScreen() {
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const handleRetry = async () => {
    setIsRetrying(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      const isConnected = await checkNetworkConnection();
      setLastChecked(new Date());
      
      if (isConnected) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace('/');
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleContinueOffline = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to offline-capable screens
    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <SystemStateLayout
      type="offline"
      icon="○"
      title="Offline"
      subtitle="We'll sync your data automatically when you reconnect."
      primaryAction={{
        label: isRetrying ? 'Checking...' : 'Retry Connection',
        onPress: handleRetry,
      }}
      secondaryAction={{
        label: 'Continue Offline',
        onPress: handleContinueOffline,
        variant: 'ghost',
      }}
      statusText="Waiting for connection..."
    >
      {/* Network status indicator */}
      <Card variant="glassmorphism" padding="md">
        <View style={styles.statusItem}>
          <View style={[styles.indicator, styles.indicatorOffline]} />
          <NeonText variant="caption" color="muted">
            Network unavailable
          </NeonText>
        </View>
        {lastChecked && (
          <NeonText variant="caption" color="muted" style={styles.lastChecked}>
            Last checked: {lastChecked.toLocaleTimeString()}
          </NeonText>
        )}
      </Card>
    </SystemStateLayout>
  );
}

const styles = StyleSheet.create({
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  indicatorOffline: {
    backgroundColor: colors.neutral[500],
  },
  lastChecked: {
    marginTop: spacing[2],
    textAlign: 'center',
  },
});

