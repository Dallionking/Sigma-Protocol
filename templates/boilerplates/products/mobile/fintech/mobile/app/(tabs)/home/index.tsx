import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, ScrollView, RefreshControl, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonLoader, Card, Badge, Icon } from '@/components/primitives';
import { AnimatedCurrency, AppLogo } from '@/components';
import { colors, spacing } from '@/lib/theme';
import {
  Trade,
  PortfolioStats,
  AIStatus,
  fetchPortfolioStats,
  fetchTrades,
  fetchAIStatus,
  formatPnl,
  getTimeAgo,
  DEMO_PORTFOLIO_STATS,
  DEMO_TRADES,
  DEMO_AI_STATUS,
} from '@/lib/constants/trading';

export default function HomeDashboardScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState<PortfolioStats>(DEMO_PORTFOLIO_STATS);
  const [trades, setTrades] = useState<Trade[]>(DEMO_TRADES);
  const [aiStatus, setAIStatus] = useState<AIStatus>(DEMO_AI_STATUS);

  const loadData = async () => {
    try {
      const [statsData, tradesData, aiData] = await Promise.all([
        fetchPortfolioStats(),
        fetchTrades(),
        fetchAIStatus(),
      ]);
      setStats(statsData);
      setTrades(tradesData);
      setAIStatus(aiData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      await loadData();
      setIsLoading(false);
    };
    init();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadData();
    setIsRefreshing(false);
  };

  const handleBalancePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/home/balance-detail');
  };

  const handleTradePress = (trade: Trade) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/(tabs)/home/activity-detail',
      params: { tradeId: trade.id },
    });
  };

  const handleNotificationsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/home/notifications');
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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary.DEFAULT}
          />
        }
      >
        {/* Header - BAGS style */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <AppLogo size={24} />
            </View>
            <NeonText variant="h4" color="white">TRADING PLATFORM</NeonText>
          </View>
          <Pressable onPress={handleNotificationsPress} style={styles.notificationButton}>
            <Icon name="bell" size={24} color="primary" />
            <View style={styles.notificationDot} />
          </Pressable>
        </View>

        {/* Balance Section - BAGS inspired */}
        <Pressable onPress={handleBalancePress}>
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400 }}
            style={styles.balanceSection}
          >
            <View style={styles.userRow}>
              <View style={styles.avatarCircle}>
                <NeonText variant="caption" color="primary">$</NeonText>
              </View>
              <NeonText variant="caption" color="muted">@TRADER</NeonText>
            </View>
            
            <AnimatedCurrency 
              value={stats.totalBalance} 
              variant="balance" 
              color="white" 
              style={styles.balanceAmount}
              duration={1000}
            />
            
            <View style={styles.pnlRow}>
              <AnimatedCurrency 
                value={stats.todayPnl} 
                variant="caption" 
                color={stats.todayPnl >= 0 ? 'primary' : 'danger'}
                showSign={true}
                duration={800}
              />
              <NeonText variant="caption" color="muted"> • </NeonText>
              <NeonText variant="caption" color="muted">24h</NeonText>
            </View>

            {/* Quick Action Buttons - BAGS style */}
            <View style={styles.quickActions}>
              <Pressable style={styles.quickActionBtn}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Icon name="send" size={14} color="white" />
                  <NeonText variant="caption" color="white">Send</NeonText>
                </View>
              </Pressable>
              <Pressable style={styles.quickActionBtn}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Icon name="plus" size={14} color="white" />
                  <NeonText variant="caption" color="white">Add</NeonText>
                </View>
              </Pressable>
            </View>
          </MotiView>
        </Pressable>

        {/* AI Status Card - Glassmorphism with border beam */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 100, duration: 400 }}
        >
          <Card variant="glassmorphism" padding="md" showBorderBeam style={styles.aiCard}>
            <View style={styles.aiHeader}>
              <View style={styles.aiStatusLeft}>
                <View style={[
                  styles.statusIndicator,
                  { backgroundColor: aiStatus.isActive ? colors.primary.DEFAULT : colors.neutral[400] }
                ]} />
                <NeonText variant="body" color="white">
                  AI Bot: {aiStatus.isActive ? 'ACTIVE' : 'PAUSED'}
                </NeonText>
              </View>
              <Badge variant={aiStatus.confidence === 'high' ? 'success' : 'default'}>
                {aiStatus.confidence}
              </Badge>
            </View>
            
            {/* Confidence bars - BAGS style */}
            <View style={styles.confidenceRow}>
              {[1, 2, 3, 4, 5].map((bar, index) => (
                <View
                  key={bar}
                  style={[
                    styles.confidenceBar,
                    index < (aiStatus.confidence === 'high' ? 5 : aiStatus.confidence === 'medium' ? 3 : 1) && 
                      styles.confidenceBarActive,
                  ]}
                />
              ))}
              <NeonText variant="caption" color="muted" style={styles.openText}>
                {aiStatus.openPositions} open
              </NeonText>
            </View>
          </Card>
        </MotiView>

        {/* Recent Trades - BAGS list style */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200, duration: 400 }}
          style={styles.tradesSection}
        >
          <View style={styles.sectionHeader}>
            <NeonText variant="h4" color="white">Recent Trades</NeonText>
            <Pressable>
              <NeonText variant="caption" color="primary">See all</NeonText>
            </Pressable>
          </View>
          
          <Card variant="glassmorphism" padding="none" showBorderBeam>
            {trades.slice(0, 5).map((trade, index) => (
              <Pressable 
                key={trade.id}
                style={[
                  styles.tradeRow,
                  index < trades.slice(0, 5).length - 1 && styles.tradeRowBorder
                ]}
                onPress={() => handleTradePress(trade)}
              >
                <View style={styles.tradeLeft}>
                  <View style={[
                    styles.tradeIcon,
                    { backgroundColor: trade.pnl >= 0 ? colors.primary[900] : colors.accent.muted }
                  ]}>
                    <Icon 
                      name={trade.type === 'long' ? 'trendUp' : 'trendDown'} 
                      size={16} 
                      color={trade.pnl >= 0 ? colors.primary.DEFAULT : colors.error} 
                    />
                  </View>
                  <View style={styles.tradeInfo}>
                    <NeonText variant="body" color="white">{trade.pair}</NeonText>
                    <NeonText variant="caption" color="muted">
                      {trade.status === 'open' ? 'Open' : getTimeAgo(trade.time)}
                    </NeonText>
                  </View>
                </View>
                <View style={styles.tradeRight}>
                  <NeonText 
                    variant="body" 
                    color={trade.pnl >= 0 ? 'primary' : 'danger'}
                  >
                    {formatPnl(trade.pnl)}
                  </NeonText>
                  <NeonText variant="body" color="muted">›</NeonText>
                </View>
              </Pressable>
            ))}
          </Card>
        </MotiView>

        {/* Search bar - BAGS style */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', delay: 300 }}
          style={styles.searchContainer}
        >
          <View style={styles.searchBar}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Icon name="search" size={14} color="muted" />
              <NeonText variant="caption" color="muted">Search trades...</NeonText>
            </View>
          </View>
        </MotiView>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[12], // Extra padding for tab bar
  },
  // Header - BAGS style
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  logoContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationButton: {
    position: 'relative',
    padding: spacing[2],
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary.DEFAULT,
  },
  // Balance Section
  balanceSection: {
    paddingVertical: spacing[4],
    marginBottom: spacing[4],
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  avatarCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary[900],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary.DEFAULT,
  },
  balanceAmount: {
    marginBottom: spacing[1],
  },
  pnlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  quickActionBtn: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.neutral[100],
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.neutral[300],
  },
  // AI Card
  aiCard: {
    marginBottom: spacing[4],
  },
  aiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  aiStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  confidenceBar: {
    width: 24,
    height: 6,
    backgroundColor: colors.neutral[300],
    borderRadius: 3,
  },
  confidenceBarActive: {
    backgroundColor: colors.primary.DEFAULT,
  },
  openText: {
    marginLeft: 'auto',
  },
  // Trades Section
  tradesSection: {
    marginBottom: spacing[4],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  tradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  tradeRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  tradeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  tradeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tradeInfo: {
    gap: 2,
  },
  tradeRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  // Search
  searchContainer: {
    marginTop: spacing[2],
  },
  searchBar: {
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
});

