import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton, Card, Badge } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';
import { useCurrentSubscription } from '@/lib/hooks/use-subscription';

export default function CurrentPlanScreen() {
  const router = useRouter();
  const { planData, status, interval, renewalDate, isFoundingMember } = useCurrentSubscription();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleComparePlans = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/account/subscription/compare');
  };

  const handleManageBilling = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/account/subscription/manage');
  };

  const handleRestorePurchases = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/account/subscription/restore');
  };

  const handleFoundingMember = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/account/subscription/founding');
  };

  const formatRenewalDate = (date: string | null) => {
    if (!date) return 'No renewal date';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
          <NeonText variant="h2" color="white">Subscription</NeonText>
        </MotiView>

        {/* Current Plan Card */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 100, duration: 400 }}
        >
          <Card variant="default" padding="lg" style={styles.planCard}>
            <View style={styles.planHeader}>
              <View>
                <NeonText variant="label" color="muted">Current Plan</NeonText>
                <View style={styles.planTitleRow}>
                  <NeonText variant="h3" color="white">
                    {planData?.displayName || 'No Plan'}
                  </NeonText>
                  {planData?.popular && (
                    <Badge variant="success" size="sm" style={styles.popularBadge}>
                      {planData.badge}
                    </Badge>
                  )}
                </View>
              </View>
              {status === 'active' && (
                <Badge variant="success" size="sm">ACTIVE</Badge>
              )}
            </View>

            {renewalDate && (
              <View style={styles.renewalInfo}>
                <NeonText variant="body" color="muted">
                  Renews: {formatRenewalDate(renewalDate)}
                </NeonText>
                <NeonText variant="caption" color="muted">
                  Billed {interval}
                </NeonText>
              </View>
            )}

            {/* Features */}
            <View style={styles.features}>
              {planData?.features.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <NeonText variant="body" color="primary">✓</NeonText>
                  <NeonText variant="body" color="white">{feature}</NeonText>
                </View>
              ))}
            </View>
          </Card>
        </MotiView>

        {/* Founding Member Badge */}
        {isFoundingMember && (
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', delay: 150 }}
          >
            <Pressable onPress={handleFoundingMember}>
              <Card variant="default" padding="md" style={styles.foundingCard}>
                <View style={styles.foundingContent}>
                  <NeonText variant="h4" style={styles.foundingEmoji}>👑</NeonText>
                  <View style={styles.foundingText}>
                    <NeonText variant="body" color="primary">Founding Member</NeonText>
                    <NeonText variant="caption" color="muted">
                      Your price is locked forever
                    </NeonText>
                  </View>
                  <NeonText variant="body" color="muted">›</NeonText>
                </View>
              </Card>
            </Pressable>
          </MotiView>
        )}

        {/* Actions */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200, duration: 400 }}
          style={styles.actions}
        >
          <NeonButton onPress={handleComparePlans}>
            Compare Plans
          </NeonButton>

          <NeonButton onPress={handleManageBilling}>
            Manage Billing
          </NeonButton>

          <NeonButton onPress={handleRestorePurchases}>
            Restore Purchases
          </NeonButton>
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
  planCard: {
    marginBottom: spacing[4],
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[4],
  },
  planTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[1],
  },
  popularBadge: {
    marginTop: 4,
  },
  renewalInfo: {
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    marginBottom: spacing[4],
    gap: spacing[1],
  },
  features: {
    gap: spacing[2],
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  foundingCard: {
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.primary[900],
  },
  foundingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  foundingEmoji: {
    fontSize: 32,
  },
  foundingText: {
    flex: 1,
    gap: 2,
  },
  actions: {
    gap: spacing[3],
  },
});

