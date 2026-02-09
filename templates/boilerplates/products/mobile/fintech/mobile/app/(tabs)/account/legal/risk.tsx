import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton, Card } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';

const RISK_FACTORS = [
  {
    icon: '📉',
    title: 'Market Volatility',
    description: 'Markets can fluctuate rapidly and unpredictably, leading to significant losses.',
  },
  {
    icon: '📊',
    title: 'Past Performance',
    description: 'Historical results are not indicative of future performance. All trading strategies carry risk.',
  },
  {
    icon: '💸',
    title: 'Capital at Risk',
    description: 'You may lose more than your initial investment. Only trade with funds you can afford to lose.',
  },
  {
    icon: '🤖',
    title: 'AI Limitations',
    description: 'AI signals are probabilistic and not guaranteed to be profitable in all market conditions.',
  },
  {
    icon: '⏱️',
    title: 'Execution Risk',
    description: 'Market conditions may prevent trades from being executed at expected prices.',
  },
];

export default function RiskDisclosureScreen() {
  const router = useRouter();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleUnderstand = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
          <NeonText variant="h2" color="white">Risk Disclosure</NeonText>
          <View style={styles.titleUnderline} />
        </MotiView>

        {/* Warning Icon with Pulsing Effect */}
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
          style={styles.iconSection}
        >
          <View style={styles.iconContainer}>
            <MotiView
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ type: 'timing', duration: 1500, loop: true }}
            >
              <NeonText variant="display" style={styles.iconEmoji}>⚠️</NeonText>
            </MotiView>
            {/* Pulsing glow ring */}
            <MotiView
              style={styles.iconGlow}
              animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.3, 1] }}
              transition={{ type: 'timing', duration: 1500, loop: true }}
            />
          </View>
          <NeonText variant="h4" color="warning" style={styles.warningLabel}>
            IMPORTANT INFORMATION
          </NeonText>
        </MotiView>

        {/* Intro Warning */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 150, duration: 400 }}
        >
          <View style={styles.introBanner}>
            <NeonText variant="body" color="muted" style={styles.introText}>
              Trading in financial markets, including forex, indices, and commodities, involves{' '}
              <NeonText variant="body" color="warning">substantial risk of loss</NeonText>{' '}
              and is not suitable for all investors.
            </NeonText>
          </View>
        </MotiView>

        {/* Risk Factors - Staggered */}
        <View style={styles.riskSection}>
          <NeonText variant="caption" color="muted" style={styles.sectionLabel}>
            KEY RISK FACTORS
          </NeonText>
          
          {RISK_FACTORS.map((factor, index) => (
            <MotiView
              key={factor.title}
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: 'timing', delay: 200 + index * 50, duration: 400 }}
            >
              <View style={styles.riskCard}>
                <View style={styles.riskHeader}>
                  <View style={styles.riskIconContainer}>
                    <NeonText style={styles.riskIcon}>{factor.icon}</NeonText>
                  </View>
                  <NeonText variant="body" color="white" style={styles.riskTitle}>
                    {factor.title}
                  </NeonText>
                </View>
                <NeonText variant="caption" color="muted" style={styles.riskDescription}>
                  {factor.description}
                </NeonText>
              </View>
            </MotiView>
          ))}
        </View>

        {/* Advisory Note */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 500, duration: 400 }}
        >
          <Card variant="default" padding="md" style={styles.advisoryCard}>
            <View style={styles.advisoryAccent} />
            <NeonText variant="body" color="muted" style={styles.advisoryText}>
              Consider seeking{' '}
              <NeonText variant="body" color="primary">independent financial advice</NeonText>{' '}
              before using this service. Never invest more than you can afford to lose.
            </NeonText>
          </Card>
        </MotiView>

        {/* Acknowledge Button */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 550, duration: 400 }}
          style={styles.buttonSection}
        >
          <NeonButton onPress={handleUnderstand}>
            I Understand the Risks
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
  titleUnderline: {
    height: 2,
    width: 70,
    backgroundColor: colors.warning[500] || '#FFA500',
    borderRadius: 1,
  },
  iconSection: {
    alignItems: 'center',
    marginTop: spacing[4],
    marginBottom: spacing[4],
    gap: spacing[3],
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 72,
  },
  iconGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.warning[500] || '#FFA500',
  },
  warningLabel: {
    letterSpacing: 2,
    fontSize: 13,
  },
  introBanner: {
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    padding: spacing[4],
    borderLeftWidth: 4,
    borderLeftColor: colors.warning[500] || '#FFA500',
    marginBottom: spacing[4],
  },
  introText: {
    lineHeight: 24,
  },
  riskSection: {
    marginBottom: spacing[4],
  },
  sectionLabel: {
    letterSpacing: 1.5,
    fontSize: 11,
    marginBottom: spacing[3],
  },
  riskCard: {
    backgroundColor: colors.neutral[100],
    borderRadius: 10,
    padding: spacing[3],
    marginBottom: spacing[2],
  },
  riskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[2],
  },
  riskIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  riskIcon: {
    fontSize: 18,
  },
  riskTitle: {
    flex: 1,
    fontWeight: '600',
  },
  riskDescription: {
    lineHeight: 20,
    marginLeft: 48,
  },
  advisoryCard: {
    position: 'relative',
    overflow: 'hidden',
    marginBottom: spacing[4],
  },
  advisoryAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.primary[500],
  },
  advisoryText: {
    lineHeight: 22,
    textAlign: 'center',
  },
  buttonSection: {
    marginBottom: spacing[4],
  },
});


