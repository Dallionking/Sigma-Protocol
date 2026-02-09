import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, Card } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';

const SUBSCRIPTION_SECTIONS = [
  {
    title: 'Billing',
    icon: '💳',
    content: 'All subscriptions are billed through the Apple App Store. Your payment method on file with Apple will be charged at the start of each billing period.',
  },
  {
    title: 'Auto-Renewal',
    icon: '🔄',
    content: 'Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current billing period. You can manage auto-renewal in your device Settings.',
  },
  {
    title: 'Cancellation',
    icon: '✋',
    content: 'To cancel your subscription, go to Settings → Your Name → Subscriptions on your iOS device. Your access continues until the end of the current billing period.',
  },
  {
    title: 'Refunds',
    icon: '💰',
    content: 'Refund requests are handled by Apple. To request a refund, visit reportaproblem.apple.com within 90 days of the original purchase.',
  },
  {
    title: 'Plan Changes',
    icon: '📊',
    content: 'You can upgrade or downgrade your plan at any time. Upgrades take effect immediately, while downgrades apply at the start of the next billing cycle.',
  },
];

export default function SubscriptionTermsScreen() {
  const router = useRouter();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
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
          <NeonText variant="h2" color="white">Subscription Terms</NeonText>
          <View style={styles.titleUnderline} />
        </MotiView>

        {/* Apple Badge */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
          style={styles.appleBadge}
        >
          <View style={styles.badgeContainer}>
            <NeonText style={styles.appleIcon}></NeonText>
            <View style={styles.badgeTextContainer}>
              <NeonText variant="caption" color="muted" style={styles.badgeLabel}>
                POWERED BY
              </NeonText>
              <NeonText variant="body" color="white">
                App Store Subscriptions
              </NeonText>
            </View>
          </View>
        </MotiView>

        {/* Subscription Sections */}
        {SUBSCRIPTION_SECTIONS.map((section, index) => (
          <MotiView
            key={section.title}
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: 'timing', delay: 150 + index * 50, duration: 400 }}
          >
            <Card variant="default" padding="md" style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <NeonText style={styles.sectionIcon}>{section.icon}</NeonText>
                </View>
                <NeonText variant="h4" color="white">{section.title}</NeonText>
              </View>
              <View style={styles.sectionDivider} />
              <NeonText variant="body" color="muted" style={styles.sectionContent}>
                {section.content}
              </NeonText>
            </Card>
          </MotiView>
        ))}

        {/* Footer Note */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', delay: 500, duration: 400 }}
          style={styles.footer}
        >
          <View style={styles.footerCard}>
            <NeonText variant="caption" color="muted" style={styles.footerText}>
              Questions about billing? Contact Apple Support or visit{' '}
              <NeonText variant="caption" color="primary">support.apple.com</NeonText>
            </NeonText>
          </View>
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
  titleUnderline: {
    height: 2,
    width: 60,
    backgroundColor: colors.primary[500],
    borderRadius: 1,
    marginTop: spacing[1],
  },
  appleBadge: {
    marginTop: spacing[4],
    marginBottom: spacing[4],
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    padding: spacing[3],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  appleIcon: {
    fontSize: 32,
    color: colors.neutral[400],
    marginRight: spacing[3],
  },
  badgeTextContainer: {
    flex: 1,
  },
  badgeLabel: {
    letterSpacing: 1,
    fontSize: 10,
    marginBottom: 2,
  },
  sectionCard: {
    marginBottom: spacing[3],
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[500],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionIcon: {
    fontSize: 20,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginVertical: spacing[3],
  },
  sectionContent: {
    lineHeight: 22,
  },
  footer: {
    marginTop: spacing[4],
    marginBottom: spacing[4],
  },
  footerCard: {
    backgroundColor: colors.neutral[100],
    borderRadius: 8,
    padding: spacing[3],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  footerText: {
    textAlign: 'center',
    lineHeight: 18,
  },
});


