import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton, Card } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';
import { SUBSCRIPTION_PLANS, getYearlySavings, formatPrice } from '@/lib/constants/subscription';
import { useCurrentSubscription } from '@/lib/hooks/use-subscription';
import { PlanTier, BillingInterval } from '@/lib/types/subscription';

export default function ComparePlansScreen() {
  const router = useRouter();
  const { currentPlan } = useCurrentSubscription();
  const [selectedInterval, setSelectedInterval] = useState<BillingInterval>('yearly');

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleSelectPlan = (plan: PlanTier) => {
    if (plan === currentPlan) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/(tabs)/account/subscription/paywall',
      params: { plan, interval: selectedInterval },
    });
  };

  const handleToggleInterval = (interval: BillingInterval) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedInterval(interval);
  };

  const plans: PlanTier[] = ['basic', 'pro', 'elite'];

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
          <NeonText variant="h2" color="white">Compare Plans</NeonText>
        </MotiView>

        {/* Billing Toggle */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
          style={styles.toggleSection}
        >
          <View style={styles.toggleContainer}>
            <Pressable
              onPress={() => handleToggleInterval('monthly')}
              style={[
                styles.toggleButton,
                selectedInterval === 'monthly' && styles.toggleButtonActive,
              ]}
            >
              <NeonText
                variant="body"
                color={selectedInterval === 'monthly' ? 'white' : 'muted'}
              >
                Monthly
              </NeonText>
            </Pressable>
            <Pressable
              onPress={() => handleToggleInterval('yearly')}
              style={[
                styles.toggleButton,
                selectedInterval === 'yearly' && styles.toggleButtonActive,
              ]}
            >
              <NeonText
                variant="body"
                color={selectedInterval === 'yearly' ? 'white' : 'muted'}
              >
                Yearly
              </NeonText>
              <View style={styles.savingsBadge}>
                <NeonText variant="caption" color="primary" style={styles.savingsText}>
                  SAVE
                </NeonText>
              </View>
            </Pressable>
          </View>
        </MotiView>

        {/* Plan Cards */}
        <View style={styles.plansGrid}>
          {plans.map((planId, index) => {
            const plan = SUBSCRIPTION_PLANS[planId];
            const isCurrentPlan = planId === currentPlan;
            const price = selectedInterval === 'monthly' ? plan.price.monthly : plan.price.yearly;
            const savings = getYearlySavings(planId);

            return (
              <MotiView
                key={planId}
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', delay: 150 + index * 100 }}
                style={styles.planCardWrapper}
              >
                <Pressable
                  onPress={() => handleSelectPlan(planId)}
                  disabled={isCurrentPlan}
                  style={({ pressed }) => [
                    { opacity: pressed ? 0.8 : 1 },
                  ]}
                >
                  <Card
                    variant="glassmorphism"
                    padding="lg"
                    showBorderBeam={plan.popular || isCurrentPlan}
                    style={[
                      styles.planCard,
                      plan.popular && styles.planCardPopular,
                      isCurrentPlan && styles.planCardCurrent,
                    ]}
                  >
                    {/* Badge */}
                    {(plan.badge || isCurrentPlan) && (
                      <View style={styles.planBadge}>
                        <NeonText variant="caption" color="primary" style={styles.badgeText}>
                          {isCurrentPlan ? 'CURRENT' : plan.badge}
                        </NeonText>
                      </View>
                    )}

                    {/* Icon & Name */}
                    <View style={styles.planIconRow}>
                      <NeonText variant="h3" style={styles.planIcon}>
                        {plan.icon}
                      </NeonText>
                    </View>
                    <NeonText variant="h3" color="white" style={styles.planName}>
                      {plan.displayName}
                    </NeonText>

                    {/* Price */}
                    <View style={styles.priceSection}>
                      <View style={styles.priceRow}>
                        <NeonText variant="h2" color="white">
                          {formatPrice(price)}
                        </NeonText>
                        <NeonText variant="body" color="muted">
                          /{selectedInterval === 'monthly' ? 'mo' : 'yr'}
                        </NeonText>
                      </View>
                      {selectedInterval === 'yearly' && savings > 0 && (
                        <NeonText variant="caption" color="primary">
                          Save {formatPrice(savings)}
                        </NeonText>
                      )}
                    </View>

                    {/* Features */}
                    <View style={styles.features}>
                      {plan.features.map((feature, idx) => (
                        <View key={idx} style={styles.featureRow}>
                          <NeonText variant="body" color="primary">✓</NeonText>
                          <NeonText variant="caption" color="white" style={styles.featureText}>
                            {feature}
                          </NeonText>
                        </View>
                      ))}
                    </View>

                    {/* CTA */}
                    {!isCurrentPlan && (
                      <View style={styles.ctaSection}>
                        <NeonButton
                          variant="primary"
                          onPress={() => handleSelectPlan(planId)}
                        >
                          {planId === 'basic' ? 'Downgrade' : 'Upgrade'}
                        </NeonButton>
                      </View>
                    )}
                  </Card>
                </Pressable>
              </MotiView>
            );
          })}
        </View>

        {/* Trust Signals */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', delay: 500, duration: 400 }}
          style={styles.trustSection}
        >
          <NeonText variant="caption" color="muted" style={styles.trustText}>
            Cancel anytime • 48-hour guarantee • Secure billing
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
  toggleSection: {
    marginVertical: spacing[6],
    alignItems: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  toggleButton: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[5],
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  toggleButtonActive: {
    backgroundColor: colors.neutral[200],
  },
  savingsBadge: {
    backgroundColor: colors.primary[900],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  savingsText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  plansGrid: {
    gap: spacing[4],
  },
  planCardWrapper: {
    width: '100%',
  },
  planCard: {
    position: 'relative',
  },
  planCardPopular: {
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  planCardCurrent: {
    borderWidth: 1,
    borderColor: colors.neutral[300],
    opacity: 0.7,
  },
  planBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.primary[900],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  planIconRow: {
    marginBottom: spacing[2],
  },
  planIcon: {
    fontSize: 40,
  },
  planName: {
    marginBottom: spacing[3],
  },
  priceSection: {
    marginBottom: spacing[4],
    paddingBottom: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing[1],
    marginBottom: spacing[1],
  },
  features: {
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
  },
  featureText: {
    flex: 1,
    lineHeight: 18,
  },
  ctaSection: {
    marginTop: spacing[2],
  },
  trustSection: {
    marginTop: spacing[8],
    alignItems: 'center',
  },
  trustText: {
    textAlign: 'center',
  },
});

