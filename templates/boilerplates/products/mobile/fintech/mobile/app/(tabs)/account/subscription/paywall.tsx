import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';
import { SUBSCRIPTION_PLANS, PAYWALL_MESSAGES, formatPrice, getYearlySavings } from '@/lib/constants/subscription';
import { useSubscriptionStore } from '@/lib/stores/subscription-store';
import { PlanTier, BillingInterval } from '@/lib/types/subscription';

const { height } = Dimensions.get('window');

export default function PaywallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ plan?: PlanTier; interval?: BillingInterval; feature?: string }>();
  
  const [selectedPlan] = useState<PlanTier>(params.plan || 'pro');
  const [selectedInterval, setSelectedInterval] = useState<BillingInterval>(params.interval || 'yearly');
  const upgrade = useSubscriptionStore((state) => state.upgrade);

  const planData = SUBSCRIPTION_PLANS[selectedPlan];
  const message = PAYWALL_MESSAGES[params.feature || 'default'];
  const price = selectedInterval === 'monthly' ? planData.price.monthly : planData.price.yearly;
  const savings = getYearlySavings(selectedPlan);

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleSelectInterval = (interval: BillingInterval) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedInterval(interval);
  };

  const handleUpgrade = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    router.push('/(tabs)/account/subscription/processing');
    
    try {
      await upgrade(selectedPlan, selectedInterval);
      router.replace('/(tabs)/account/subscription/success');
    } catch (error) {
      router.replace('/(tabs)/account/subscription/failure');
    }
  };

  return (
    <Screen style={styles.container}>
      {/* Gradient Background */}
      <View style={styles.gradientBg} />
      
      {/* Close Button */}
      <Pressable onPress={handleDismiss} style={styles.closeButton}>
        <NeonText variant="h3" color="muted">×</NeonText>
      </Pressable>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
          style={styles.heroSection}
        >
          {/* Icon */}
          <View style={styles.iconContainer}>
            <MotiView
              from={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 200, damping: 10 }}
            >
              <NeonText variant="display" style={styles.heroIcon}>
                {planData.icon}
              </NeonText>
            </MotiView>
            <View style={styles.iconGlow} />
          </View>

          {/* Title */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', delay: 300, duration: 400 }}
          >
            <NeonText variant="h1" color="white" style={styles.title}>
              {message.title}
            </NeonText>
          </MotiView>
        </MotiView>

        {/* Value Props */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 400, duration: 400 }}
          style={styles.benefitsSection}
        >
          {message.benefits.map((benefit, index) => (
            <MotiView
              key={index}
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: 'spring', delay: 500 + index * 100 }}
              style={styles.benefitRow}
            >
              <View style={styles.checkmark}>
                <NeonText variant="h4" color="primary">✓</NeonText>
              </View>
              <NeonText variant="h4" color="white" style={styles.benefitText}>
                {benefit}
              </NeonText>
            </MotiView>
          ))}
        </MotiView>

        {/* Pricing Toggle */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 700 }}
          style={styles.pricingSection}
        >
          <View style={styles.pricingCards}>
            <Pressable
              onPress={() => handleSelectInterval('monthly')}
              style={[
                styles.priceCard,
                selectedInterval === 'monthly' && styles.priceCardActive,
              ]}
            >
              <NeonText
                variant="body"
                color={selectedInterval === 'monthly' ? 'white' : 'muted'}
                style={styles.priceInterval}
              >
                Monthly
              </NeonText>
              <NeonText
                variant="h2"
                color={selectedInterval === 'monthly' ? 'primary' : 'muted'}
              >
                {formatPrice(planData.price.monthly)}
              </NeonText>
              <NeonText
                variant="caption"
                color={selectedInterval === 'monthly' ? 'white' : 'muted'}
              >
                per month
              </NeonText>
            </Pressable>

            <Pressable
              onPress={() => handleSelectInterval('yearly')}
              style={[
                styles.priceCard,
                selectedInterval === 'yearly' && styles.priceCardActive,
                styles.priceCardYearly,
              ]}
            >
              {savings > 0 && (
                <View style={styles.savingsBadge}>
                  <NeonText variant="caption" style={styles.savingsText}>
                    SAVE {formatPrice(savings)}
                  </NeonText>
                </View>
              )}
              <NeonText
                variant="body"
                color={selectedInterval === 'yearly' ? 'white' : 'muted'}
                style={styles.priceInterval}
              >
                Yearly
              </NeonText>
              <NeonText
                variant="h2"
                color={selectedInterval === 'yearly' ? 'primary' : 'muted'}
              >
                {formatPrice(planData.price.yearly)}
              </NeonText>
              <NeonText
                variant="caption"
                color={selectedInterval === 'yearly' ? 'white' : 'muted'}
              >
                ${Math.floor((planData.price.yearly / 12) * 100) / 100}/mo
              </NeonText>
            </Pressable>
          </View>
        </MotiView>

        {/* CTA Button */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', delay: 800 }}
          style={styles.ctaSection}
        >
          <NeonButton onPress={handleUpgrade} style={styles.ctaButton}>
            <NeonText variant="h4" color="white">
              Unlock {planData.name} →
            </NeonText>
          </NeonButton>
        </MotiView>

        {/* Trust Signals */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', delay: 900, duration: 400 }}
          style={styles.trustSection}
        >
          <NeonText variant="caption" color="muted" style={styles.trustText}>
            Cancel anytime • 48-hour money-back guarantee
          </NeonText>
          <NeonText variant="caption" color="muted" style={styles.trustText}>
            Secure billing through Apple
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
  gradientBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
    backgroundColor: colors.primary[900],
    opacity: 0.05,
  },
  closeButton: {
    position: 'absolute',
    top: spacing[4] + 44,
    right: spacing[4],
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[8] + 44,
    paddingBottom: spacing[8],
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  iconContainer: {
    position: 'relative',
    marginBottom: spacing[4],
  },
  heroIcon: {
    fontSize: 80,
  },
  iconGlow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 80,
    backgroundColor: colors.glow,
    opacity: 0.4,
    zIndex: -1,
  },
  title: {
    textAlign: 'center',
    lineHeight: 48,
  },
  benefitsSection: {
    marginBottom: spacing[8],
    gap: spacing[4],
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  checkmark: {
    width: 32,
    height: 32,
    backgroundColor: colors.primary[900],
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    flex: 1,
  },
  pricingSection: {
    marginBottom: spacing[6],
  },
  pricingCards: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  priceCard: {
    flex: 1,
    backgroundColor: colors.neutral[100],
    borderRadius: 16,
    padding: spacing[4],
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  priceCardActive: {
    backgroundColor: colors.neutral[150],
    borderColor: colors.primary[500],
  },
  priceCardYearly: {
    // Extra styling for yearly
  },
  savingsBadge: {
    position: 'absolute',
    top: -8,
    right: 8,
    backgroundColor: colors.primary[500],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  savingsText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.neutral[0],
    letterSpacing: 0.5,
  },
  priceInterval: {
    marginBottom: spacing[2],
  },
  ctaSection: {
    marginBottom: spacing[6],
  },
  ctaButton: {
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  trustSection: {
    alignItems: 'center',
    gap: spacing[1],
  },
  trustText: {
    textAlign: 'center',
    opacity: 0.7,
  },
});

