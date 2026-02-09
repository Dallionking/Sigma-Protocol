import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter, Link } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton, NeonLoader, Card, Badge } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';
import {
  PortfolioStats,
  fetchPortfolioStats,
  formatPnl,
  DEMO_PORTFOLIO_STATS,
} from '@/lib/constants/trading';

export default function BalanceDetailScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<PortfolioStats>(DEMO_PORTFOLIO_STATS);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchPortfolioStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleDeposit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Navigate to deposit flow when implemented
  };

  if (isLoading) {
    return (
      <Screen safeArea style={styles.container}>
        <View style={styles.loadingContent}>
          <NeonLoader size="large" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen safeArea style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <NeonText variant="body" color="muted">‹ Back</NeonText>
        </Pressable>
        <NeonText variant="h4" color="white">Balance</NeonText>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {/* Total Balance - BAGS centered style */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 400 }}
          style={styles.balanceSection}
        >
          <NeonText variant="caption" color="muted" align="center">Total Balance</NeonText>
          <NeonText variant="display" color="primary" align="center" glow style={styles.balance}>
            ${stats.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </NeonText>
          <Badge variant={stats.todayPnl >= 0 ? 'success' : 'danger'}>
            {formatPnl(stats.todayPnl)} TODAY
          </Badge>
        </MotiView>

        {/* Breakdown Card */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 100, duration: 400 }}
        >
          <Card variant="default" padding="none" style={styles.breakdownCard}>
            <View style={styles.breakdownRow}>
              <NeonText variant="body" color="muted">Equity</NeonText>
              <NeonText variant="body" color="white">
                ${stats.equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </NeonText>
            </View>
            <View style={[styles.breakdownRow, styles.borderBottom]}>
              <NeonText variant="body" color="muted">Open P&L</NeonText>
              <NeonText variant="body" color={stats.openPnl >= 0 ? 'primary' : 'danger'}>
                {formatPnl(stats.openPnl)}
              </NeonText>
            </View>
            <View style={styles.breakdownRow}>
              <NeonText variant="body" color="muted">This Week</NeonText>
              <NeonText variant="body" color={stats.weekPnl >= 0 ? 'primary' : 'danger'}>
                {formatPnl(stats.weekPnl)}
              </NeonText>
            </View>
            <View style={styles.breakdownRow}>
              <NeonText variant="body" color="muted">This Month</NeonText>
              <NeonText variant="body" color={stats.monthPnl >= 0 ? 'primary' : 'danger'}>
                {formatPnl(stats.monthPnl)}
              </NeonText>
            </View>
          </Card>
        </MotiView>

        {/* Performance Chart */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200, duration: 400 }}
        >
          <Card variant="glassmorphism" padding="md" style={styles.chartCard}>
            <NeonText variant="h4" color="white" style={styles.chartTitle}>Performance</NeonText>
            <View style={styles.chartContainer}>
              <View style={styles.chartBars}>
                {[0.4, 0.6, 0.5, 0.8, 0.7, 0.9, 0.85].map((height, index) => (
                  <MotiView
                    key={index}
                    from={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ type: 'spring', delay: 300 + index * 50 }}
                    style={[styles.chartBar, { height: height * 80 }]}
                  />
                ))}
              </View>
              <View style={styles.chartLabels}>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                  <NeonText key={index} variant="caption" color="muted" style={styles.chartLabel}>
                    {day}
                  </NeonText>
                ))}
              </View>
            </View>
          </Card>
        </MotiView>
      </View>

      {/* Action Buttons - BAGS style */}
      <View style={styles.actions}>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 400 }}
          style={styles.actionButtons}
        >
          <View style={styles.actionButton}>
            <NeonButton onPress={handleDeposit}>
              Deposit
            </NeonButton>
          </View>
          <Link href="/(tabs)/withdraw" asChild style={styles.actionButton}>
            <NeonButton onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)} variant="primary">
              Withdraw
            </NeonButton>
          </Link>
        </MotiView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[0],
  },
  loadingContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  backButton: {
    paddingVertical: spacing[2],
    width: 60,
  },
  headerSpacer: {
    width: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing[4],
  },
  balanceSection: {
    alignItems: 'center',
    paddingVertical: spacing[6],
  },
  balance: {
    marginVertical: spacing[2],
  },
  breakdownCard: {
    marginBottom: spacing[4],
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  chartCard: {
    marginBottom: spacing[4],
  },
  chartTitle: {
    marginBottom: spacing[4],
  },
  chartContainer: {
    alignItems: 'center',
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    width: '100%',
    height: 80,
    gap: spacing[2],
  },
  chartBar: {
    flex: 1,
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: 4,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: spacing[2],
  },
  chartLabel: {
    flex: 1,
    textAlign: 'center',
  },
  actions: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[6],
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  actionButton: {
    flex: 1,
  },
});

