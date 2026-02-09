import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, Card } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';

// Mock article content
const ARTICLES: Record<string, { title: string; icon: string; content: string[] }> = {
  deposits: {
    title: 'Deposits & Withdrawals',
    icon: '💰',
    content: [
      'Trading Platform connects to your brokerage account to execute trades on your behalf. We never hold your funds directly.',
      '## How Deposits Work',
      'Your funds remain in your brokerage account at all times. When you connect a broker, you authorize Trading Platform to execute trades using your available balance.',
      '## Withdrawals',
      'To withdraw funds, simply log into your brokerage account directly and initiate a withdrawal. Trading Platform does not process withdrawals.',
      '## Minimum Balance',
      'We recommend maintaining at least $2,000 in your connected account to allow the AI to execute optimal strategies.',
    ],
  },
  subscriptions: {
    title: 'Subscriptions',
    icon: '⭐',
    content: [
      'Trading Platform offers several subscription tiers to match your trading needs.',
      '## Available Plans',
      '**Basic** - Entry tier with limited features and AI insights.',
      '**Pro** - Our most popular plan with full AI trading capabilities.',
      '**Elite** - Advanced features for serious traders.',
      '## Billing',
      'Subscriptions are billed monthly through the App Store. You can manage your subscription in your device settings.',
      '## Cancellation',
      'You can cancel anytime. Your subscription remains active until the end of the current billing period.',
    ],
  },
  brokers: {
    title: 'Broker Connection',
    icon: '🔗',
    content: [
      'Connect your brokerage account to enable AI-powered trading.',
      '## Supported Brokers',
      'We currently support TradeLocker and are adding more brokers soon.',
      '## How to Connect',
      '1. Go to Account → Brokers\n2. Tap "Add Broker"\n3. Select your broker\n4. Enter your credentials\n5. Authorize the connection',
      '## Security',
      'Your credentials are encrypted and stored securely. We use OAuth where available and never store your password in plain text.',
      '## Troubleshooting',
      'If your connection fails, ensure your broker account is in good standing and your credentials are correct.',
    ],
  },
  ai: {
    title: 'AI Trading',
    icon: '🤖',
    content: [
      'Our AI analyzes market conditions and executes trades to generate passive income.',
      '## How It Works',
      'The AI uses options trading strategies, primarily selling covered calls and cash-secured puts, to generate consistent income.',
      '## Risk Management',
      'The AI follows strict risk parameters and will never risk more than your specified limits.',
      '## Performance',
      'Past performance is not indicative of future results. The AI aims for consistent returns but cannot guarantee profits.',
      '## Control',
      'You can pause AI trading at any time from the AI tab.',
    ],
  },
  security: {
    title: 'Security',
    icon: '🔒',
    content: [
      'Your security is our top priority.',
      '## Account Protection',
      '• Face ID / Touch ID authentication\n• Encrypted data transmission\n• Secure credential storage',
      '## Session Management',
      'View and manage active sessions from Account → Security → Active Sessions.',
      '## Two-Factor Authentication',
      'We recommend enabling biometric authentication for an extra layer of security.',
      '## Reporting Issues',
      'If you notice any suspicious activity, contact support immediately.',
    ],
  },
};

export default function SupportArticleScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [feedback, setFeedback] = useState<'helpful' | 'not_helpful' | null>(null);

  const article = ARTICLES[id || 'deposits'];

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleFeedback = (type: 'helpful' | 'not_helpful') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setFeedback(type);
    if (type === 'helpful') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  // Simple markdown-like rendering
  const renderContent = (text: string, index: number) => {
    if (text.startsWith('## ')) {
      return (
        <NeonText 
          key={index} 
          variant="h4" 
          color="white" 
          style={styles.heading}
        >
          {text.replace('## ', '')}
        </NeonText>
      );
    }
    if (text.startsWith('**') && text.endsWith('**')) {
      return (
        <NeonText 
          key={index} 
          variant="body" 
          color="primary" 
          style={styles.bold}
        >
          {text.replace(/\*\*/g, '')}
        </NeonText>
      );
    }
    return (
      <NeonText 
        key={index} 
        variant="body" 
        color="muted" 
        style={styles.paragraph}
      >
        {text}
      </NeonText>
    );
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
        </MotiView>

        {/* Article Title */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 100, duration: 400 }}
          style={styles.titleSection}
        >
          <View style={styles.iconContainer}>
            <NeonText variant="display" style={styles.icon}>{article.icon}</NeonText>
          </View>
          <NeonText variant="h2" color="white">{article.title}</NeonText>
          <View style={styles.titleUnderline} />
        </MotiView>

        {/* Article Content */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 150, duration: 400 }}
          style={styles.contentSection}
        >
          <Card variant="default" padding="lg">
            {article.content.map((text, index) => renderContent(text, index))}
          </Card>
        </MotiView>

        {/* Feedback Section */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200, duration: 400 }}
          style={styles.feedbackSection}
        >
          <Card variant="default" padding="lg">
            <NeonText variant="body" color="white" align="center" style={styles.feedbackTitle}>
              Was this helpful?
            </NeonText>
            <View style={styles.feedbackButtons}>
              <Pressable
                onPress={() => handleFeedback('helpful')}
                style={[
                  styles.feedbackButton,
                  feedback === 'helpful' && styles.feedbackButtonSelected,
                ]}
              >
                <NeonText 
                  variant="h3" 
                  style={feedback === 'helpful' ? styles.feedbackIconSelected : undefined}
                >
                  👍
                </NeonText>
                {feedback === 'helpful' && (
                  <NeonText variant="caption" color="primary">Thanks!</NeonText>
                )}
              </Pressable>
              <Pressable
                onPress={() => handleFeedback('not_helpful')}
                style={[
                  styles.feedbackButton,
                  feedback === 'not_helpful' && styles.feedbackButtonSelected,
                ]}
              >
                <NeonText 
                  variant="h3"
                  style={feedback === 'not_helpful' ? styles.feedbackIconSelected : undefined}
                >
                  👎
                </NeonText>
                {feedback === 'not_helpful' && (
                  <NeonText variant="caption" color="muted">We'll improve</NeonText>
                )}
              </Pressable>
            </View>
          </Card>
        </MotiView>

        {/* Contact Support Link */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 250, duration: 400 }}
          style={styles.contactLink}
        >
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(tabs)/account/support/contact');
            }}
          >
            <NeonText variant="body" color="primary" align="center">
              Still need help? Contact Support →
            </NeonText>
          </Pressable>
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
  },
  backButton: {
    paddingVertical: spacing[2],
    alignSelf: 'flex-start',
  },
  titleSection: {
    alignItems: 'center',
    paddingVertical: spacing[4],
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
    borderWidth: 2,
    borderColor: colors.primary[700],
  },
  icon: {
    fontSize: 36,
  },
  titleUnderline: {
    height: 2,
    backgroundColor: colors.primary[500],
    width: 60,
    marginTop: spacing[3],
  },
  contentSection: {
    marginTop: spacing[4],
  },
  heading: {
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  bold: {
    marginBottom: spacing[2],
  },
  paragraph: {
    lineHeight: 24,
    marginBottom: spacing[3],
  },
  feedbackSection: {
    marginTop: spacing[4],
  },
  feedbackTitle: {
    marginBottom: spacing[3],
  },
  feedbackButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[6],
  },
  feedbackButton: {
    alignItems: 'center',
    padding: spacing[3],
    borderRadius: 12,
    minWidth: 80,
  },
  feedbackButtonSelected: {
    backgroundColor: colors.neutral[100],
  },
  feedbackIconSelected: {
    transform: [{ scale: 1.2 }],
  },
  contactLink: {
    marginTop: spacing[6],
    paddingVertical: spacing[4],
  },
});


