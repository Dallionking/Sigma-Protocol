import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton, NeonLoader } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';
import {
  Trade,
  DEMO_TRADES,
  formatPnl,
  formatPrice,
  getTimeAgo,
  getStatusLabel,
} from '@/lib/constants/trading';

export default function ActivityDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tradeId?: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [trade, setTrade] = useState<Trade | null>(null);

  useEffect(() => {
    const loadTrade = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      const foundTrade = DEMO_TRADES.find(t => t.id === params.tradeId);
      setTrade(foundTrade || DEMO_TRADES[0]);
      setIsLoading(false);
    };
    loadTrade();
  }, [params.tradeId]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleViewReceipt = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // View detailed receipt
    console.log('View receipt');
  };

  if (isLoading || !trade) {
    return (
      <Screen safeArea padded style={styles.container}>
        <View style={styles.loadingContent}>
          <NeonLoader size="large" />
        </View>
      </Screen>
    );
  }

  const isProfitable = trade.pnl >= 0;

  return (
    <Screen safeArea padded style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <NeonText variant="body" color="primary">
            ← Back
          </NeonText>
        </Pressable>
        <NeonText variant="h3" style={styles.headerTitle}>
          Trade Details
        </NeonText>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {/* P&L Card */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
          style={[
            styles.pnlCard,
            isProfitable ? styles.pnlCardProfit : styles.pnlCardLoss
          ]}
        >
          <NeonText 
            variant="display" 
            color={isProfitable ? 'primary' : 'white'}
            glow={isProfitable}
            style={styles.pnlAmount}
          >
            {formatPnl(trade.pnl)}
          </NeonText>
          <NeonText variant="body" color="muted">
            {trade.pair} • {trade.type === 'long' ? 'Long' : 'Short'}
          </NeonText>
        </MotiView>

        {/* Status */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200 }}
          style={styles.statusCard}
        >
          <View style={styles.statusRow}>
            <View style={[
              styles.statusBadge,
              trade.status === 'open' ? styles.statusOpen :
              trade.status === 'stopped' ? styles.statusStopped :
              styles.statusClosed
            ]}>
              <NeonText 
                variant="label" 
                color={trade.status === 'open' ? 'primary' : 'white'}
              >
                {getStatusLabel(trade.status)}
              </NeonText>
            </View>
            <NeonText variant="label" color="muted">
              {getTimeAgo(trade.time)}
            </NeonText>
          </View>
        </MotiView>

        {/* Trade Details */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 300 }}
          style={styles.detailsCard}
        >
          <NeonText variant="h4" style={styles.detailsTitle}>
            Trade Information
          </NeonText>
          
          <View style={styles.detailRow}>
            <NeonText variant="body" color="muted">
              Pair
            </NeonText>
            <NeonText variant="body" color="white">
              {trade.pair}
            </NeonText>
          </View>
          
          <View style={styles.detailRow}>
            <NeonText variant="body" color="muted">
              Direction
            </NeonText>
            <NeonText variant="body" color="white">
              {trade.type === 'long' ? '↑ Long (Buy)' : '↓ Short (Sell)'}
            </NeonText>
          </View>
          
          <View style={styles.detailRow}>
            <NeonText variant="body" color="muted">
              Lot Size
            </NeonText>
            <NeonText variant="body" color="white">
              {trade.lots.toFixed(2)}
            </NeonText>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.detailRow}>
            <NeonText variant="body" color="muted">
              Entry Price
            </NeonText>
            <NeonText variant="body" color="white">
              {formatPrice(trade.entryPrice, trade.pair)}
            </NeonText>
          </View>
          
          {trade.exitPrice && (
            <View style={styles.detailRow}>
              <NeonText variant="body" color="muted">
                Exit Price
              </NeonText>
              <NeonText variant="body" color="white">
                {formatPrice(trade.exitPrice, trade.pair)}
              </NeonText>
            </View>
          )}
          
          <View style={styles.divider} />
          
          <View style={styles.detailRow}>
            <NeonText variant="body" color="muted">
              Opened
            </NeonText>
            <NeonText variant="body" color="white">
              {trade.time.toLocaleString()}
            </NeonText>
          </View>
        </MotiView>

        {/* AI Analysis */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 400 }}
          style={styles.analysisCard}
        >
          <NeonText variant="h4" style={styles.analysisTitle}>
            AI Analysis
          </NeonText>
          <NeonText variant="body" color="muted" style={styles.analysisText}>
            {isProfitable 
              ? 'This trade was executed based on a trend continuation signal. The AI identified strong momentum in the direction and set optimal entry and exit points.'
              : 'This trade hit the stop loss due to unexpected market reversal. Risk management protocols prevented larger losses.'}
          </NeonText>
        </MotiView>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 500 }}
          style={styles.buttonContainer}
        >
          <NeonButton onPress={handleViewReceipt}>
            View Full Receipt
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
  loadingContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[4],
  },
  backButton: {
    paddingVertical: spacing[2],
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 60,
  },
  content: {
    flex: 1,
  },
  pnlCard: {
    alignItems: 'center',
    borderRadius: 20,
    padding: spacing[6],
    marginBottom: spacing[4],
    borderWidth: 2,
  },
  pnlCardProfit: {
    backgroundColor: colors.neutral[50],
    borderColor: colors.primary.DEFAULT,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary.DEFAULT,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      web: {
        boxShadow: `0 0 40px ${colors.glow}`,
      },
      android: {},
    }),
  },
  pnlCardLoss: {
    backgroundColor: colors.neutral[50],
    borderColor: colors.neutral[300],
  },
  pnlAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: spacing[2],
  },
  statusCard: {
    marginBottom: spacing[4],
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
    borderRadius: 20,
  },
  statusOpen: {
    backgroundColor: colors.primary[900],
    borderWidth: 1,
    borderColor: colors.primary.DEFAULT,
  },
  statusClosed: {
    backgroundColor: colors.neutral[100],
  },
  statusStopped: {
    backgroundColor: colors.neutral[200],
  },
  detailsCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: 16,
    padding: spacing[4],
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  detailsTitle: {
    marginBottom: spacing[3],
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginVertical: spacing[2],
  },
  analysisCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: 16,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  analysisTitle: {
    marginBottom: spacing[2],
  },
  analysisText: {
    lineHeight: 22,
  },
  actions: {
    paddingBottom: spacing[4],
  },
  buttonContainer: {
    width: '100%',
  },
});

