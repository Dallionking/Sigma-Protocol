import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, Card } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';

const TERMS_SECTIONS = [
  {
    number: '1',
    title: 'Acceptance of Terms',
    content: 'By accessing or using Trading Platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.',
  },
  {
    number: '2',
    title: 'Description of Service',
    content: 'Trading Platform provides AI-powered trading signals and automated trading capabilities through connected broker accounts. The service is provided "as is" and we make no guarantees regarding trading performance.',
  },
  {
    number: '3',
    title: 'User Responsibilities',
    content: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use.',
  },
  {
    number: '4',
    title: 'Risk Disclosure',
    content: 'Trading in financial markets involves substantial risk of loss. Past performance is not indicative of future results. You should only trade with funds you can afford to lose.',
  },
  {
    number: '5',
    title: 'Limitation of Liability',
    content: 'Trading Platform shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.',
  },
  {
    number: '6',
    title: 'Intellectual Property',
    content: 'All content, trademarks, and technology used in the app are owned by Trading Platform. You may not reproduce, modify, or distribute any part of our service without permission.',
  },
  {
    number: '7',
    title: 'Termination',
    content: 'We reserve the right to suspend or terminate your account at any time for violation of these terms or any other reason at our sole discretion.',
  },
];

export default function TermsScreen() {
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
          <NeonText variant="h2" color="white">Terms of Service</NeonText>
          <View style={styles.titleUnderline} />
        </MotiView>

        {/* Effective Date Badge */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
          style={styles.dateBadge}
        >
          <View style={styles.badgeContainer}>
            <NeonText variant="caption" color="muted" style={styles.badgeLabel}>
              EFFECTIVE DATE
            </NeonText>
            <NeonText variant="body" color="primary">December 1, 2025</NeonText>
          </View>
        </MotiView>

        {/* Terms Sections - Staggered */}
        {TERMS_SECTIONS.map((section, index) => (
          <MotiView
            key={section.number}
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', delay: 150 + index * 40, duration: 400 }}
          >
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionNumber}>
                  <NeonText variant="caption" color="primary" style={styles.numberText}>
                    {section.number}
                  </NeonText>
                </View>
                <NeonText variant="h4" color="white" style={styles.sectionTitle}>
                  {section.title}
                </NeonText>
              </View>
              <View style={styles.sectionDivider} />
              <NeonText variant="body" color="muted" style={styles.sectionContent}>
                {section.content}
              </NeonText>
            </View>
          </MotiView>
        ))}

        {/* Footer */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', delay: 500, duration: 400 }}
          style={styles.footer}
        >
          <NeonText variant="caption" color="muted" style={styles.footerText}>
            By using Trading Platform, you acknowledge that you have read and understood these terms.
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
  titleUnderline: {
    height: 2,
    width: 80,
    backgroundColor: colors.primary[500],
    borderRadius: 1,
  },
  dateBadge: {
    marginTop: spacing[4],
    marginBottom: spacing[4],
  },
  badgeContainer: {
    backgroundColor: colors.neutral[100],
    borderRadius: 8,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[500],
    alignSelf: 'flex-start',
  },
  badgeLabel: {
    letterSpacing: 1,
    fontSize: 10,
    marginBottom: 2,
  },
  sectionCard: {
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  sectionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontWeight: '700',
    fontSize: 12,
  },
  sectionTitle: {
    flex: 1,
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
    paddingHorizontal: spacing[2],
  },
  footerText: {
    textAlign: 'center',
    lineHeight: 18,
    fontStyle: 'italic',
  },
});


