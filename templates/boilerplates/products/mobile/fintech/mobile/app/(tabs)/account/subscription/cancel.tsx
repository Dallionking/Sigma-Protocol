import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton, Card } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';

export default function CancelSubscriptionScreen() {
  const router = useRouter();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleOpenSettings = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const url = Platform.select({
      ios: 'app-settings:',
      android: 'app-settings:',
      default: 'https://apps.apple.com/account/subscriptions',
    });

    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      Linking.openURL(url);
    }
  };

  return (
    <Screen safeArea style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 300 }}
          style={styles.header}
        >
          <Pressable onPress={handleBack} style={styles.backButton}>
            <NeonText variant="body" color="muted">‹ Back</NeonText>
          </Pressable>
          <NeonText variant="h2" color="white">Cancel Subscription</NeonText>
        </MotiView>

        {/* Icon */}
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
          style={styles.iconSection}
        >
          <View style={styles.iconContainer}>
            <NeonText variant="display" style={styles.icon}>😔</NeonText>
          </View>
        </MotiView>

        {/* Info Card */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 150, duration: 400 }}
        >
          <Card variant="default" padding="lg" style={styles.infoCard}>
            <NeonText variant="h4" color="white" style={styles.infoTitle}>
              We're Sorry to See You Go
            </NeonText>
            <NeonText variant="body" color="muted" style={styles.infoText}>
              You can cancel your subscription through iOS Settings. Your access will continue until the end of your current billing period.
            </NeonText>

            <View style={styles.keepingList}>
              <NeonText variant="label" color="muted" style={styles.keepingTitle}>
                You'll lose access to:
              </NeonText>
              <View style={styles.keepingRow}>
                <NeonText variant="body" color="danger">✕</NeonText>
                <NeonText variant="body" color="muted">4x faster AI cycles</NeonText>
              </View>
              <View style={styles.keepingRow}>
                <NeonText variant="body" color="danger">✕</NeonText>
                <NeonText variant="body" color="muted">Hourly balance updates</NeonText>
              </View>
              <View style={styles.keepingRow}>
                <NeonText variant="body" color="danger">✕</NeonText>
                <NeonText variant="body" color="muted">30-day income history</NeonText>
              </View>
            </View>
          </Card>
        </MotiView>

        {/* Open Settings Button */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200, duration: 400 }}
          style={styles.buttonSection}
        >
          <NeonButton onPress={handleOpenSettings}>
            Open iOS Subscription Settings
          </NeonButton>
        </MotiView>

        {/* Help Text */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', delay: 300, duration: 400 }}
          style={styles.helpSection}
        >
          <NeonText variant="caption" color="muted" style={styles.helpText}>
            Cancellations must be done through iOS Settings.{'\n'}
            Your subscription will remain active until the end of the billing period.
          </NeonText>
        </MotiView>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[0],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing[4],
    paddingBottom: layout.tabBarHeight + spacing[4],
  },
  header: {
    paddingVertical: spacing[2],
    gap: spacing[2],
  },
  backButton: {
    paddingVertical: spacing[2],
    alignSelf: 'flex-start',
  },
  iconSection: {
    alignItems: 'center',
    marginTop: spacing[6],
    marginBottom: spacing[6],
  },
  iconContainer: {
    position: 'relative',
  },
  icon: {
    fontSize: 72,
  },
  infoCard: {
    marginBottom: spacing[6],
  },
  infoTitle: {
    marginBottom: spacing[2],
  },
  infoText: {
    marginBottom: spacing[4],
    lineHeight: 22,
  },
  keepingList: {
    gap: spacing[2],
  },
  keepingTitle: {
    marginBottom: spacing[2],
  },
  keepingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  buttonSection: {
    marginTop: spacing[2],
  },
  helpSection: {
    marginTop: spacing[6],
    alignItems: 'center',
  },
  helpText: {
    textAlign: 'center',
    lineHeight: 20,
  },
});

