import React from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';
import { MINIMUM_BALANCE, formatCurrency, DEMO_ACCOUNT } from '@/lib/constants/portfolio';

export default function PortfolioMinimumInfoScreen() {
  const router = useRouter();
  
  // For demo, use the demo account balance
  const currentBalance = DEMO_ACCOUNT.balance;
  const needed = Math.max(0, MINIMUM_BALANCE - currentBalance);

  const handleFundAccount = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(portfolio)/fund-prompt');
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const reasons = [
    {
      icon: '📊',
      title: 'Proper Position Sizing',
      description: 'Ensures each trade is sized appropriately relative to your account.',
    },
    {
      icon: '🛡️',
      title: 'Risk Management Buffers',
      description: 'Provides margin cushion to handle normal market fluctuations.',
    },
    {
      icon: '⚠️',
      title: 'Avoid Margin Calls',
      description: 'Prevents your positions from being force-closed during drawdowns.',
    },
    {
      icon: '🎯',
      title: 'Optimal AI Performance',
      description: 'Allows the AI to execute its strategy effectively with proper sizing.',
    },
  ];

  return (
    <Screen safeArea padded style={styles.container}>
      {/* Back button */}
      <Pressable onPress={handleBack} style={styles.backButton}>
        <NeonText variant="body" color="primary">
          ← Back
        </NeonText>
      </Pressable>

      <View style={styles.content}>
        {/* Icon */}
        <MotiView
          from={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', delay: 200 }}
          style={styles.iconContainer}
        >
          <View style={styles.infoIcon}>
            <NeonText variant="display" style={styles.iconText}>
              ℹ️
            </NeonText>
          </View>
        </MotiView>

        {/* Title */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 300 }}
        >
          <NeonText variant="h2" style={styles.title}>
            Minimum Balance Required
          </NeonText>
        </MotiView>

        {/* Explanation */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 400 }}
        >
          <NeonText variant="body" color="muted" style={styles.explanation}>
            The AI Trading Bot requires a minimum balance to manage risk effectively and protect your capital.
          </NeonText>
        </MotiView>

        {/* Balance summary */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 500 }}
          style={styles.balanceSummary}
        >
          <View style={styles.summaryRow}>
            <NeonText variant="body" color="muted">
              Minimum:
            </NeonText>
            <NeonText variant="h4" color="primary">
              {formatCurrency(MINIMUM_BALANCE)}
            </NeonText>
          </View>
          <View style={styles.summaryRow}>
            <NeonText variant="body" color="muted">
              Your balance:
            </NeonText>
            <NeonText variant="h4" color="white">
              {formatCurrency(currentBalance)}
            </NeonText>
          </View>
          {needed > 0 && (
            <View style={[styles.summaryRow, styles.neededRow]}>
              <NeonText variant="body" color="muted">
                Needed:
              </NeonText>
              <NeonText variant="h4" color="primary" glow>
                {formatCurrency(needed)} more
              </NeonText>
            </View>
          )}
        </MotiView>

        {/* Reasons list */}
        <View style={styles.reasonsList}>
          <NeonText variant="label" color="muted" style={styles.reasonsHeader}>
            Why is this important?
          </NeonText>
          {reasons.map((reason, index) => (
            <MotiView
              key={index}
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: 'timing', delay: 600 + index * 100 }}
              style={styles.reasonRow}
            >
              <View style={styles.reasonIcon}>
                <NeonText variant="body">{reason.icon}</NeonText>
              </View>
              <View style={styles.reasonContent}>
                <NeonText variant="label" color="white">
                  {reason.title}
                </NeonText>
                <NeonText variant="label" color="muted" style={styles.reasonDescription}>
                  {reason.description}
                </NeonText>
              </View>
            </MotiView>
          ))}
        </View>
      </View>

      {/* CTA */}
      <View style={styles.actions}>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 1000 }}
          style={styles.buttonContainer}
        >
          <NeonButton onPress={handleFundAccount}>
            Fund My Account
          </NeonButton>
        </MotiView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[0],
  },
  backButton: {
    paddingVertical: spacing[2],
    marginBottom: spacing[2],
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing[4],
  },
  iconContainer: {
    marginBottom: spacing[4],
  },
  infoIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.neutral[50],
    borderWidth: 2,
    borderColor: colors.primary[700],
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary.DEFAULT,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      web: {
        boxShadow: `0 0 15px ${colors.glow}`,
      },
      android: {},
    }),
  },
  iconText: {
    fontSize: 32,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing[3],
  },
  explanation: {
    textAlign: 'center',
    marginBottom: spacing[4],
    maxWidth: 300,
    lineHeight: 22,
  },
  balanceSummary: {
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    width: '100%',
    maxWidth: 280,
    marginBottom: spacing[4],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[1],
  },
  neededRow: {
    marginTop: spacing[2],
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  reasonsList: {
    width: '100%',
    maxWidth: 320,
  },
  reasonsHeader: {
    marginBottom: spacing[3],
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing[3],
  },
  reasonIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  reasonContent: {
    flex: 1,
  },
  reasonDescription: {
    marginTop: spacing[1],
    lineHeight: 18,
    fontSize: 12,
  },
  actions: {
    paddingBottom: spacing[6],
    alignItems: 'center',
  },
  buttonContainer: {
    width: '100%',
  },
});

