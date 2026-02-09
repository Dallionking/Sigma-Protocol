import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';

const TERMS_SECTIONS = [
  {
    title: 'Eligibility',
    icon: '✅',
    items: [
      'You must have an active Trading Platform account',
      'Referred users must be new to Trading Platform',
      'Both referrer and referee must complete account verification',
    ],
  },
  {
    title: 'How It Works',
    icon: '🔄',
    items: [
      'Share your unique referral code with friends',
      'Friend signs up and enters your code',
      'Both of you receive $10 in trading credits',
      'Credits are applied after friend\'s first trade',
    ],
  },
  {
    title: 'Credit Rules',
    icon: '💰',
    items: [
      'Credits are applied to subscription payments',
      'Credits cannot be withdrawn as cash',
      'Credits never expire',
      'Maximum of $500 in referral credits per account',
    ],
  },
  {
    title: 'Restrictions',
    icon: '⚠️',
    items: [
      'Self-referrals are not allowed',
      'Fake or fraudulent referrals will be voided',
      'One referral code per new user',
      'Trading Platform reserves the right to modify or cancel the program',
    ],
  },
];

export default function ReferralTermsScreen() {
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
          <NeonText variant="h2" color="white">Referral Terms</NeonText>
          <View style={styles.titleUnderline} />
        </MotiView>

        {/* Summary Card */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
          style={styles.summarySection}
        >
          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <NeonText style={styles.summaryEmoji}>📋</NeonText>
            </View>
            <NeonText variant="body" color="muted" style={styles.summaryText}>
              Share your code. Friends get{' '}
              <NeonText variant="body" color="primary">$10</NeonText>
              . You get{' '}
              <NeonText variant="body" color="primary">$10</NeonText>
              . It's that simple.
            </NeonText>
          </View>
        </MotiView>

        {/* Terms Sections */}
        {TERMS_SECTIONS.map((section, index) => (
          <MotiView
            key={section.title}
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: 'timing', delay: 150 + index * 50, duration: 400 }}
          >
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <NeonText style={styles.sectionIcon}>{section.icon}</NeonText>
                </View>
                <NeonText variant="h4" color="white">{section.title}</NeonText>
              </View>
              
              <View style={styles.itemsList}>
                {section.items.map((item, itemIndex) => (
                  <View key={itemIndex} style={styles.itemRow}>
                    <View style={styles.itemBullet} />
                    <NeonText variant="body" color="muted" style={styles.itemText}>
                      {item}
                    </NeonText>
                  </View>
                ))}
              </View>
            </View>
          </MotiView>
        ))}

        {/* Footer */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', delay: 400, duration: 400 }}
          style={styles.footer}
        >
          <NeonText variant="caption" color="muted" style={styles.footerText}>
            Last updated: December 2025
          </NeonText>
          <NeonText variant="caption" color="muted" style={styles.footerText}>
            Questions? Contact{' '}
            <NeonText variant="caption" color="primary">support@example.com</NeonText>
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
    gap: spacing[1],
  },
  backButton: {
    paddingVertical: spacing[2],
    alignSelf: 'flex-start',
  },
  titleUnderline: {
    height: 2,
    width: 70,
    backgroundColor: colors.primary[500],
    borderRadius: 1,
    marginTop: spacing[1],
  },
  summarySection: {
    marginTop: spacing[4],
  },
  summaryCard: {
    backgroundColor: colors.neutral[100],
    borderRadius: 16,
    padding: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[900],
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryEmoji: {
    fontSize: 24,
  },
  summaryText: {
    flex: 1,
    lineHeight: 22,
  },
  sectionCard: {
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    padding: spacing[4],
    marginTop: spacing[4],
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[500],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[3],
  },
  sectionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionIcon: {
    fontSize: 18,
  },
  itemsList: {
    gap: spacing[2],
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
  },
  itemBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary[500],
    marginTop: 8,
  },
  itemText: {
    flex: 1,
    lineHeight: 22,
  },
  footer: {
    marginTop: spacing[6],
    alignItems: 'center',
    gap: spacing[2],
  },
  footerText: {
    textAlign: 'center',
  },
});


