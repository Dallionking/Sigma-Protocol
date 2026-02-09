import React from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { SystemStateLayout } from '@/components/system';
import { NeonText, Badge, Card } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';
import { moderateScale } from '@/lib/utils/responsive';

const MINIMUM_BALANCE = 500;

export default function InsufficientBalanceScreen() {
  const router = useRouter();

  const handleFundBroker = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // In production, this would deep link to TradeLocker or broker funding page
    try {
      await Linking.openURL('https://tradelocker.com');
    } catch {
      // Fallback: navigate to broker info
      router.push('/(tabs)/account/brokers');
    }
  };

  const handleCheckBalance = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/home');
  };

  return (
    <SystemStateLayout
      type="insufficient-balance"
      icon="$"
      title="Insufficient Balance"
      subtitle={`A minimum of $${MINIMUM_BALANCE} is required to activate AI trading.`}
      primaryAction={{
        label: 'Fund via Broker',
        onPress: handleFundBroker,
      }}
      secondaryAction={{
        label: 'Check Balance',
        onPress: handleCheckBalance,
        variant: 'ghost',
      }}
      showBackButton
    >
      {/* Balance requirement card */}
      <Card variant="glassmorphism" padding="lg" showBorderBeam>
        <View style={styles.requirementHeader}>
          <NeonText variant="label" color="muted">MINIMUM REQUIRED</NeonText>
          <Badge variant="danger" size="sm">BELOW MINIMUM</Badge>
        </View>
        
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 500 }}
        >
          <View style={styles.balanceDisplay}>
            <NeonText variant="display" color="primary" glow style={styles.amount}>
              ${MINIMUM_BALANCE}
            </NeonText>
          </View>
        </MotiView>

        <View style={styles.divider} />
        
        <View style={styles.infoRow}>
          <NeonText variant="caption" color="muted">
            Deposit funds through your connected broker to enable AI trading. 
            Your capital remains in your broker account at all times.
          </NeonText>
        </View>
      </Card>
    </SystemStateLayout>
  );
}

const styles = StyleSheet.create({
  requirementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  balanceDisplay: {
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  amount: {
    fontSize: moderateScale(48),
    letterSpacing: -2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginVertical: spacing[4],
  },
  infoRow: {
    alignItems: 'center',
  },
});

