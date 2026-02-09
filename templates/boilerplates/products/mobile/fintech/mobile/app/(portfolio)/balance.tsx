import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton, NeonLoader, Card, Badge } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';
import { formatCurrency, fetchPortfolioBalance, PortfolioAccount, MINIMUM_BALANCE, DEMO_ACCOUNT } from '@/lib/constants/portfolio';
import { verticalScale } from '@/lib/utils/responsive';

export default function PortfolioBalanceScreen() {
  const router = useRouter();
  const [account, setAccount] = useState<PortfolioAccount>(DEMO_ACCOUNT);
  const [isLoading, setIsLoading] = useState(true);

  const loadBalance = useCallback(async () => {
    try {
      const data = await fetchPortfolioBalance();
      setAccount(data);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBalance();
  }, [loadBalance]);

  useFocusEffect(
    useCallback(() => {
      if (!isLoading) {
        loadBalance();
      }
    }, [isLoading, loadBalance])
  );

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (account.balance >= MINIMUM_BALANCE) {
      router.push('/(portfolio)/ready');
    } else {
      router.push('/(portfolio)/fund-prompt');
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  if (isLoading) {
    return (
      <Screen safeArea style={styles.container}>
        <View style={styles.loadingContent}>
          <NeonLoader size="large" />
          <NeonText variant="body" color="muted" style={styles.loadingText}>
            Syncing balance...
          </NeonText>
        </View>
      </Screen>
    );
  }

  const meetsMinimum = account.balance >= MINIMUM_BALANCE;

  return (
    <Screen safeArea padded={false} style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <NeonText variant="body" color="muted">‹ Back</NeonText>
        </Pressable>
      </View>

      <View style={styles.content}>
        {/* Balance display */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
          style={styles.balanceSection}
        >
          <NeonText variant="caption" color="muted" align="center">
            Current Balance
          </NeonText>
          <NeonText 
            variant="display" 
            color={meetsMinimum ? 'primary' : 'white'} 
            align="center"
            glow={meetsMinimum}
            style={styles.balanceAmount}
          >
            {formatCurrency(account.balance)}
          </NeonText>
          <Badge variant={meetsMinimum ? 'success' : 'warning'}>
            {meetsMinimum ? '✓ MINIMUM MET' : `MIN: ${formatCurrency(MINIMUM_BALANCE)}`}
          </Badge>
        </MotiView>

        {/* Account info */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200 }}
        >
          <Card variant="default" padding="md" style={styles.accountCard}>
            <View style={styles.accountRow}>
              <View style={styles.accountIcon}>
                <NeonText variant="body" color="primary">📊</NeonText>
              </View>
              <View style={styles.accountInfo}>
                <NeonText variant="body" color="white">{account.brokerName}</NeonText>
                <NeonText variant="caption" color="muted">
                  {account.accountNumber} • {account.serverType === 'demo' ? 'Demo' : 'Live'}
                </NeonText>
              </View>
              <Badge variant="success" size="sm">Connected</Badge>
            </View>
          </Card>
        </MotiView>

        {/* Requirement info */}
        {!meetsMinimum && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', delay: 300 }}
          >
            <Card variant="outlined" padding="md" style={styles.infoCard}>
              <NeonText variant="body" color="muted" align="center">
                Minimum {formatCurrency(MINIMUM_BALANCE)} required to activate AI trading
              </NeonText>
            </Card>
          </MotiView>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 400 }}
        >
          <NeonButton onPress={handleContinue}>
            {meetsMinimum ? 'Continue' : 'Fund Account'}
          </NeonButton>
        </MotiView>
      </View>
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
    flexGrow: 1,
    paddingHorizontal: spacing[4],
  },
  loadingContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: spacing[4],
  },
  header: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  backButton: {
    paddingVertical: spacing[2],
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing[4],
  },
  balanceSection: {
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  balanceAmount: {
    marginVertical: spacing[2],
  },
  accountCard: {
    marginBottom: spacing[4],
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  accountIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary[900],
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountInfo: {
    flex: 1,
    gap: 2,
  },
  infoCard: {
    marginBottom: spacing[4],
  },
  actions: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[6],
  },
});

