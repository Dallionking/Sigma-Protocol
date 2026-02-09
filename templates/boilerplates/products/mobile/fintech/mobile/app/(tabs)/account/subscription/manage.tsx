import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton, Card } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';

export default function ManageBillingScreen() {
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
          <NeonText variant="h2" color="white">Manage Billing</NeonText>
        </MotiView>

        {/* Icon */}
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
          style={styles.iconSection}
        >
          <View style={styles.iconContainer}>
            <NeonText variant="display" style={styles.icon}>💳</NeonText>
            <View style={styles.iconGlow} />
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
              Managed by Apple
            </NeonText>
            <NeonText variant="body" color="muted" style={styles.infoText}>
              Your subscription is managed through Apple. You can view billing history, update payment methods, and manage your subscription in iOS Settings.
            </NeonText>

            <View style={styles.featureList}>
              <View style={styles.featureRow}>
                <NeonText variant="body" color="primary">•</NeonText>
                <NeonText variant="body" color="muted">View billing history</NeonText>
              </View>
              <View style={styles.featureRow}>
                <NeonText variant="body" color="primary">•</NeonText>
                <NeonText variant="body" color="muted">Update payment method</NeonText>
              </View>
              <View style={styles.featureRow}>
                <NeonText variant="body" color="primary">•</NeonText>
                <NeonText variant="body" color="muted">Change billing cycle</NeonText>
              </View>
              <View style={styles.featureRow}>
                <NeonText variant="body" color="primary">•</NeonText>
                <NeonText variant="body" color="muted">Cancel subscription</NeonText>
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
            Path: Settings → [Your Name] → Subscriptions → Trading Platform
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
  iconGlow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 60,
    backgroundColor: colors.glow,
    opacity: 0.3,
    zIndex: -1,
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
  featureList: {
    gap: spacing[2],
  },
  featureRow: {
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
  },
});

