import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Pressable, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton, NeonLoader, Card, Badge, Icon } from '@/components/primitives';
import { AnimatedCurrency } from '@/components';
import { colors, spacing } from '@/lib/theme';
import { ChevronRight } from 'lucide-react-native';
import {
  IncomeEvent,
  IncomeSummary,
  ChartDataPoint,
  fetchIncomeSummary,
  fetchIncomeEvents,
  fetchChartData,
  formatIncomeAmount,
  formatCurrency,
  getTimeAgo,
  INCOME_EVENT_TYPES,
  DEMO_INCOME_SUMMARY,
  DEMO_INCOME_EVENTS,
  DEMO_CHART_DATA_7D,
} from '@/lib/constants/income';

type TimeRange = '7d' | '30d' | '90d';

export default function IncomeDashboardScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [summary, setSummary] = useState<IncomeSummary>(DEMO_INCOME_SUMMARY);
  const [events, setEvents] = useState<IncomeEvent[]>(DEMO_INCOME_EVENTS);
  const [chartData, setChartData] = useState<ChartDataPoint[]>(DEMO_CHART_DATA_7D);

  const loadData = useCallback(async () => {
    try {
      const [summaryData, eventsData, chart] = await Promise.all([
        fetchIncomeSummary(),
        fetchIncomeEvents(timeRange),
        fetchChartData(timeRange),
      ]);
      setSummary(summaryData);
      setEvents(eventsData);
      setChartData(chart);
    } catch (error) {
      console.error('Failed to load income data:', error);
    }
  }, [timeRange]);

  useEffect(() => {
    const init = async () => {
      await loadData();
      setIsLoading(false);
    };
    init();
  }, [loadData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadData();
    setIsRefreshing(false);
  };

  const handleTimeRangeChange = (range: TimeRange) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Check if gated
    if ((range === '30d' || range === '90d')) {
      router.push('/(tabs)/income/history-gate');
      return;
    }
    
    setTimeRange(range);
  };

  const handleEventPress = (event: IncomeEvent) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/(tabs)/income/event-detail',
      params: { eventId: event.id },
    });
  };

  const handleShareEarnings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/income/share-earnings');
  };

  const handleExport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/income/export');
  };

  // Calculate max for chart scaling
  const maxChartValue = Math.max(...chartData.map(d => d.amount));

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
        {/* Header */}
        <View style={styles.header}>
          <NeonText variant="h2" color="white">Income</NeonText>
          <Pressable onPress={handleExport} style={styles.exportButton}>
            <NeonText variant="caption" color="muted">Export ↓</NeonText>
          </Pressable>
        </View>

        {/* Total Earned - BAGS style */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}
          style={styles.totalSection}
        >
          <NeonText variant="caption" color="muted">Total Earned</NeonText>
          <AnimatedCurrency 
            value={summary.totalEarned} 
            variant="display" 
            color="primary" 
            glow 
            style={styles.totalAmount}
            duration={1200}
          />
          <View style={styles.todayBadge}>
            <AnimatedCurrency 
              value={summary.todayEarned} 
              variant="caption" 
              color="primary"
              showSign={true}
              duration={800}
            />
            <NeonText variant="caption" color="primary"> today</NeonText>
          </View>
        </MotiView>

        {/* Time Range Selector - BAGS segmented control */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 100, duration: 400 }}
          style={styles.rangeSelector}
        >
          {(['7d', '30d', '90d'] as TimeRange[]).map((range) => (
            <Pressable
              key={range}
              style={[
                styles.rangeButton,
                timeRange === range && styles.rangeButtonActive,
              ]}
              onPress={() => handleTimeRangeChange(range)}
            >
              <NeonText
                variant="caption"
                color={timeRange === range ? 'primary' : 'muted'}
              >
                {range.toUpperCase()}
              </NeonText>
              {(range === '30d' || range === '90d') && (
                <Icon name="lock" size={12} color="muted" />
              )}
            </Pressable>
          ))}
        </MotiView>

        {/* Chart - BAGS style bar chart */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200, duration: 400 }}
        >
          <Card variant="glassmorphism" padding="md" showBorderBeam style={styles.chartCard}>
            <View style={styles.chartContainer}>
              <View style={styles.chartBars}>
                {chartData.map((point, index) => (
                  <View key={point.date} style={styles.chartBarWrapper}>
                    <MotiView
                      from={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ type: 'spring', delay: 300 + index * 50 }}
                      style={[
                        styles.chartBar,
                        { height: (point.amount / maxChartValue) * 100 }
                      ]}
                    />
                    <NeonText variant="caption" color="muted" style={styles.chartLabel}>
                      {point.date}
                    </NeonText>
                  </View>
                ))}
              </View>
            </View>
          </Card>
        </MotiView>

        {/* Feed Header */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 300, duration: 400 }}
          style={styles.feedHeader}
        >
          <NeonText variant="h4" color="white">Recent Earnings</NeonText>
          <NeonText variant="caption" color="muted">
            {events.length} events
          </NeonText>
        </MotiView>

        {/* Income Feed - BAGS list style */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 400, duration: 400 }}
        >
          <Card variant="glassmorphism" padding="none" showBorderBeam>
            {events.slice(0, 8).map((event, index) => {
              const eventType = INCOME_EVENT_TYPES[event.type];
              return (
                <Pressable
                  key={event.id}
                  style={[
                    styles.eventRow,
                    index < events.slice(0, 8).length - 1 && styles.eventRowBorder
                  ]}
                  onPress={() => handleEventPress(event)}
                >
                  <View style={styles.eventLeft}>
                    <View style={[styles.eventIcon, { backgroundColor: `${eventType.color}20` }]}>
                      <Icon name={eventType.icon} size={20} color={eventType.color} />
                    </View>
                    <View style={styles.eventInfo}>
                      <NeonText variant="body" color="white">{event.title}</NeonText>
                      <NeonText variant="caption" color="muted">
                        {getTimeAgo(event.timestamp)}
                        {event.pair && ` • ${event.pair}`}
                      </NeonText>
                    </View>
                  </View>
                  <View style={styles.eventRight}>
                    <NeonText variant="body" color="primary">
                      {formatIncomeAmount(event.amount)}
                    </NeonText>
                    <NeonText variant="body" color="muted">›</NeonText>
                  </View>
                </Pressable>
              );
            })}
          </Card>
        </MotiView>

        {/* Share Earnings Button */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 500, duration: 400 }}
          style={styles.shareSection}
        >
          <NeonButton onPress={handleShareEarnings}>
            <Icon name="share" size={16} color="white" /> Share Earnings
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
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  exportButton: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.neutral[100],
    borderRadius: 8,
  },
  // Total Section
  totalSection: {
    alignItems: 'center',
    paddingVertical: spacing[4],
  },
  totalAmount: {
    marginVertical: spacing[1],
  },
  todayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.primary[900],
    borderRadius: 12,
    marginTop: spacing[2],
  },
  // Range Selector
  rangeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    padding: 4,
    marginBottom: spacing[4],
  },
  rangeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[2],
    borderRadius: 10,
    gap: 4,
  },
  rangeButtonActive: {
    backgroundColor: colors.neutral[0],
  },
  lockIcon: {
    fontSize: 10,
  },
  // Chart
  chartCard: {
    marginBottom: spacing[4],
  },
  chartContainer: {
    height: 140,
    justifyContent: 'flex-end',
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 100,
    gap: spacing[2],
  },
  chartBarWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  chartBar: {
    width: '100%',
    maxWidth: 32,
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: 4,
    minHeight: 4,
  },
  chartLabel: {
    marginTop: spacing[2],
    fontSize: 10,
  },
  // Feed
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  eventRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  eventLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    flex: 1,
  },
  eventIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventInfo: {
    flex: 1,
    gap: 2,
  },
  eventRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  // Share
  shareSection: {
    marginTop: spacing[4],
  },
});

