import React, { useState } from 'react';
import { View, StyleSheet, Linking, Alert, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import Constants from 'expo-constants';
import { Screen, NeonText, NeonButton } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';

// App Store URL (replace with actual URL)
const APP_STORE_URL = Platform.select({
  ios: 'https://apps.apple.com/app/trading-platform/id000000000',
  android: 'https://play.google.com/store/apps/details?id=com.example.tradingplatform',
  default: 'https://example.com',
});

export default function ForceUpdateScreen() {
  const [error, setError] = useState(false);
  const version = Constants.expoConfig?.version ?? '1.0.0';

  const handleUpdate = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      const canOpen = await Linking.canOpenURL(APP_STORE_URL);
      if (canOpen) {
        await Linking.openURL(APP_STORE_URL);
      } else {
        setError(true);
      }
    } catch (e) {
      setError(true);
    }
  };

  const handleCopyLink = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // In a real app, use Clipboard API
    Alert.alert('Link Copied', 'Update link has been copied to clipboard.');
  };

  return (
    <Screen safeArea padded style={styles.container}>
      <View style={styles.content}>
        {/* Icon placeholder */}
        <View style={styles.iconContainer}>
          <NeonText variant="display" color="primary" glow>
            ↑
          </NeonText>
        </View>

        {/* Headline */}
        <NeonText variant="h2" style={styles.headline}>
          Update Required
        </NeonText>

        {/* Description */}
        <NeonText variant="body" color="muted" style={styles.description}>
          A new version is needed to keep{'\n'}your account secure.
        </NeonText>

        {/* CTA */}
        <View style={styles.buttonContainer}>
          {!error ? (
            <NeonButton onPress={handleUpdate}>
              Update on App Store
            </NeonButton>
          ) : (
            <NeonButton onPress={handleCopyLink}>
              Copy Update Link
            </NeonButton>
          )}
        </View>

        {/* Error message */}
        {error && (
          <NeonText variant="label" color="muted" style={styles.errorText}>
            Could not open App Store
          </NeonText>
        )}
      </View>

      {/* Version footer */}
      <View style={styles.footer}>
        <NeonText variant="mono" color="muted" style={styles.version}>
          Version: v{version}
        </NeonText>
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
  errorText: {
    marginTop: spacing[4],
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: spacing[6],
  },
  version: {
    fontSize: 12,
  },
});

