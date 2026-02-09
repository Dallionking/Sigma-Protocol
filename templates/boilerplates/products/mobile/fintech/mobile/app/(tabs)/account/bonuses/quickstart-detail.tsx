import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';

const GUIDE_CONTENT: Record<string, { title: string; icon: string; sections: { heading: string; content: string }[] }> = {
  'first-100': {
    title: 'Your First $100',
    icon: '💰',
    sections: [
      { heading: 'Getting Started', content: 'Welcome to Trading Platform! This guide will help you fund your account and execute your first trade using our AI signals.' },
      { heading: 'Step 1: Connect Your Broker', content: 'Navigate to Account → Brokers and tap "Add Broker". Select your preferred broker from the list and follow the authentication steps.' },
      { heading: 'Step 2: Fund Your Account', content: 'Once connected, deposit funds into your broker account. We recommend starting with at least $100 to allow the AI to execute optimal position sizes.' },
      { heading: 'Step 3: Review AI Signals', content: 'Head to the Dashboard to see live AI signals. Each signal shows a confidence level, entry price, and risk parameters.' },
      { heading: 'Step 4: Execute Your First Trade', content: 'When you see a high-confidence signal (80%+), tap to view details. Review the analysis and tap "Execute Trade" to let the AI handle execution.' },
    ],
  },
  'ai-signals': {
    title: 'Understanding AI Signals',
    icon: '🤖',
    sections: [
      { heading: 'What Are AI Signals?', content: 'Our AI analyzes market conditions, technical indicators, and sentiment data to generate trading signals with confidence scores.' },
      { heading: 'Confidence Levels', content: 'Signals range from 50% to 99% confidence. Higher confidence means stronger conviction. We recommend only trading signals above 75%.' },
      { heading: 'Signal Components', content: 'Each signal includes: Entry Price, Take Profit, Stop Loss, Position Size recommendation, and Time Horizon.' },
      { heading: 'Risk Management', content: 'The AI automatically calculates position sizes based on your account balance and risk tolerance settings.' },
    ],
  },
  'deposits': {
    title: 'Deposits & Withdrawals',
    icon: '💳',
    sections: [
      { heading: 'Important Note', content: 'Trading Platform does not hold your funds. All money stays in your broker account. We only execute trades on your behalf.' },
      { heading: 'Deposits', content: 'To deposit funds, log into your broker account directly and follow their deposit process. Common methods include bank transfer, card, and crypto.' },
      { heading: 'Withdrawals', content: 'Similarly, withdrawals are processed through your broker. Navigate to their withdrawal section and follow the instructions.' },
    ],
  },
  'risk-management': {
    title: 'Risk Management 101',
    icon: '🛡️',
    sections: [
      { heading: 'Never Risk More Than 2%', content: 'A golden rule in trading: never risk more than 2% of your account on a single trade. Our AI follows this by default.' },
      { heading: 'Use Stop Losses', content: 'Every signal comes with a recommended stop loss. This automatically closes losing trades to protect your capital.' },
      { heading: 'Diversify', content: 'Don\'t put all your eggs in one basket. The AI spreads trades across different assets and timeframes.' },
    ],
  },
  'advanced-settings': {
    title: 'Advanced Settings',
    icon: '⚙️',
    sections: [
      { heading: 'Risk Tolerance', content: 'Adjust your risk level from Conservative to Aggressive. This affects position sizing and signal filtering.' },
      { heading: 'Trading Hours', content: 'Set active trading hours to avoid overnight positions or focus on specific market sessions.' },
      { heading: 'Asset Preferences', content: 'Select which assets you want the AI to trade: Forex, Indices, Crypto, or Commodities.' },
    ],
  },
};

export default function QuickStartDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const guide = GUIDE_CONTENT[id || ''] || GUIDE_CONTENT['first-100'];

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
          <View style={styles.titleRow}>
            <NeonText style={styles.titleIcon}>{guide.icon}</NeonText>
            <NeonText variant="h2" color="white">{guide.title}</NeonText>
          </View>
          <View style={styles.titleUnderline} />
        </MotiView>

        {/* Content Sections */}
        {guide.sections.map((section, index) => (
          <MotiView
            key={index}
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', delay: 100 + index * 50, duration: 400 }}
            style={styles.section}
          >
            <View style={styles.sectionCard}>
              <View style={styles.sectionNumber}>
                <NeonText variant="caption" color="primary" style={styles.numberText}>
                  {index + 1}
                </NeonText>
              </View>
              <View style={styles.sectionContent}>
                <NeonText variant="h4" color="white" style={styles.sectionHeading}>
                  {section.heading}
                </NeonText>
                <NeonText variant="body" color="muted" style={styles.sectionText}>
                  {section.content}
                </NeonText>
              </View>
            </View>
          </MotiView>
        ))}

        {/* Complete Button */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 400, duration: 400 }}
          style={styles.completeSection}
        >
          <NeonButton onPress={handleComplete}>
            Mark as Complete ✓
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  titleIcon: {
    fontSize: 28,
  },
  titleUnderline: {
    height: 2,
    width: 60,
    backgroundColor: colors.primary[500],
    borderRadius: 1,
  },
  section: {
    marginTop: spacing[4],
  },
  sectionCard: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    padding: spacing[4],
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
  sectionContent: {
    flex: 1,
    gap: spacing[2],
  },
  sectionHeading: {
    lineHeight: 24,
  },
  sectionText: {
    lineHeight: 22,
  },
  completeSection: {
    marginTop: spacing[6],
  },
});


