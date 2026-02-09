import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { SystemStateLayout } from '@/components/system';
import { NeonText, Badge, Card } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';

// Support contact
const SUPPORT_EMAIL = 'support@example.com';
const SUPPORT_URL = 'https://example.com/support';

export default function GenericErrorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ 
    message?: string; 
    code?: string;
    canRetry?: string;
  }>();
  
  const [retryCount, setRetryCount] = useState(0);
  const canRetry = params.canRetry !== 'false';
  const errorCode = params.code || 'ERR_UNKNOWN';
  const errorMessage = params.message || 'Something unexpected happened. Please try again.';

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }, []);

  const handleRetry = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRetryCount(prev => prev + 1);
    
    // After 3 retries, suggest support
    if (retryCount >= 2) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const handleContactSupport = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Try to open support page
    try {
      const canOpen = await Linking.canOpenURL(SUPPORT_URL);
      if (canOpen) {
        await Linking.openURL(SUPPORT_URL);
      } else {
        // Fallback to email
        await Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Error Report: ${errorCode}`);
      }
    } catch {
      // Silently fail - user can try again or use in-app support
    }
  };

  const handleGoHome = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/');
  };

  return (
    <SystemStateLayout
      type="error"
      icon="!"
      title="Something Went Wrong"
      subtitle={errorMessage}
      primaryAction={canRetry && retryCount < 3 ? {
        label: retryCount > 0 ? `Retry (${3 - retryCount} left)` : 'Retry',
        onPress: handleRetry,
      } : undefined}
      secondaryAction={{
        label: 'Contact Support',
        onPress: handleContactSupport,
        variant: 'ghost',
      }}
    >
      {/* Error details card */}
      <Card variant="glassmorphism" padding="lg">
        <View style={styles.errorHeader}>
          <NeonText variant="label" color="muted">ERROR CODE</NeonText>
          <Badge variant="danger" size="sm">{errorCode}</Badge>
        </View>

        {/* Troubleshooting tips */}
        <View style={styles.tips}>
          <NeonText variant="caption" color="muted" style={styles.tipsTitle}>
            Quick troubleshooting:
          </NeonText>
          <TipItem text="Check your internet connection" delay={500} />
          <TipItem text="Try closing and reopening the app" delay={600} />
          <TipItem text="Update to the latest version" delay={700} />
        </View>

        {/* Too many retries warning */}
        {retryCount >= 3 && (
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 300 }}
          >
            <View style={styles.warningBanner}>
              <NeonText variant="caption" color="danger">
                Multiple retries failed. Please contact support for assistance.
              </NeonText>
            </View>
          </MotiView>
        )}
      </Card>

      {/* Home button if retries exhausted */}
      {retryCount >= 3 && (
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', delay: 300 }}
        >
          <Pressable onPress={handleGoHome} style={styles.homeLink}>
            <NeonText variant="body" color="primary">
              Return to Home
            </NeonText>
          </Pressable>
        </MotiView>
      )}
    </SystemStateLayout>
  );
}

function TipItem({ text, delay }: { text: string; delay: number }) {
  return (
    <MotiView
      from={{ opacity: 0, translateX: -10 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'timing', duration: 300, delay }}
    >
      <View style={styles.tipItem}>
        <NeonText variant="caption" color="primary">•</NeonText>
        <NeonText variant="caption" color="muted">{text}</NeonText>
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  errorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
    paddingBottom: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  tips: {
    gap: spacing[2],
  },
  tipsTitle: {
    marginBottom: spacing[1],
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  warningBanner: {
    marginTop: spacing[4],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.accent.muted,
    borderRadius: 8,
  },
  homeLink: {
    marginTop: spacing[4],
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
});

