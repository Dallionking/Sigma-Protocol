import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton, Card, NeonLoader } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';
import { useSubscriptionStore } from '@/lib/stores/subscription-store';
import { usePurchaseState } from '@/lib/hooks/use-subscription';

export default function RestorePurchasesScreen() {
  const router = useRouter();
  const restorePurchases = useSubscriptionStore((state) => state.restorePurchases);
  const { isPurchasing } = usePurchaseState();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleRestore = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      await restorePurchases();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
          <NeonText variant="h2" color="white">Restore Purchases</NeonText>
        </MotiView>

        {/* Icon */}
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
          style={styles.iconSection}
        >
          <View style={styles.iconContainer}>
            <NeonText variant="display" style={styles.icon}>📦</NeonText>
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
              Recover Your Subscription
            </NeonText>
            <NeonText variant="body" color="muted" style={styles.infoText}>
              If you previously purchased a subscription on this Apple ID, you can restore it here.
            </NeonText>

            <View style={styles.bulletList}>
              <View style={styles.bulletRow}>
                <NeonText variant="body" color="primary">✓</NeonText>
                <NeonText variant="body" color="muted">
                  Syncs with your Apple ID
                </NeonText>
              </View>
              <View style={styles.bulletRow}>
                <NeonText variant="body" color="primary">✓</NeonText>
                <NeonText variant="body" color="muted">
                  Instant access to features
                </NeonText>
              </View>
              <View style={styles.bulletRow}>
                <NeonText variant="body" color="primary">✓</NeonText>
                <NeonText variant="body" color="muted">
                  No new charge
                </NeonText>
              </View>
            </View>
          </Card>
        </MotiView>

        {/* Restore Button */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200, duration: 400 }}
          style={styles.buttonSection}
        >
          {isPurchasing ? (
            <View style={styles.loadingContainer}>
              <NeonLoader size="medium" />
              <NeonText variant="body" color="muted" style={styles.loadingText}>
                Restoring purchases...
              </NeonText>
            </View>
          ) : (
            <NeonButton onPress={handleRestore}>
              Restore Purchases
            </NeonButton>
          )}
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
  bulletList: {
    gap: spacing[2],
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  buttonSection: {
    marginTop: spacing[2],
  },
  loadingContainer: {
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[4],
  },
  loadingText: {
    textAlign: 'center',
  },
});

