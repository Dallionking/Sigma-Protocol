import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonLoader, Card, Badge } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';
import {
  AICycle,
  fetchAICycles,
  formatCycleAmount,
  DEMO_AI_CYCLES,
} from '@/lib/constants/ai';

function CycleRow({ cycle, index }: { cycle: AICycle; index: number }) {
  const isProfit = cycle.result === 'profit';
  
  return (
    <MotiView
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'timing', delay: 150 + index * 80 }}
    >
      <View style={styles.cycleRow}>
        <View style={styles.cycleLeft}>
          {/* Icon with glow for profit */}
          <View style={[
            styles.cycleIcon,
            isProfit ? styles.cycleIconProfit : styles.cycleIconLoss
          ]}>
            <NeonText variant="body" color={isProfit ? 'primary' : 'danger'}>
              {cycle.action === 'buy' ? '↑' : '↓'}
            </NeonText>
          </View>
          
          {/* Info */}
          <View style={styles.cycleInfo}>
            <View style={styles.cyclePairRow}>
              <NeonText variant="body" color="white">{cycle.pair}</NeonText>
              <Badge 
                variant={cycle.action === 'buy' ? 'success' : 'danger'} 
                size="sm"
              >
                {cycle.action.toUpperCase()}
              </Badge>
            </View>
            <NeonText variant="caption" color="muted">
              {cycle.duration} • {cycle.timestamp.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit' 
              })}
            </NeonText>
          </View>
        </View>
        
        {/* Amount */}
        <View style={styles.cycleRight}>
          <NeonText 
            variant="h4" 
            color={isProfit ? 'primary' : 'danger'}
            glow={isProfit}
          >
            {formatCycleAmount(cycle.amount)}
          </NeonText>
        </View>
      </View>
    </MotiView>
  );
}

export default function AICycleHistoryScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [cycles, setCycles] = useState<AICycle[]>(DEMO_AI_CYCLES);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchAICycles();
        setCycles(data);
      } catch (error) {
        console.error('Failed to load cycles:', error);
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

  // Calculate totals
  const totalProfit = cycles.reduce((sum, c) => sum + (c.result === 'profit' ? c.amount : 0), 0);
  const totalLoss = cycles.reduce((sum, c) => sum + (c.result === 'loss' ? Math.abs(c.amount) : 0), 0);
  const netProfit = cycles.reduce((sum, c) => sum + c.amount, 0);

  // Group cycles by day
  const groupedCycles = cycles.reduce((acc, cycle) => {
    const isToday = new Date().toDateString() === cycle.timestamp.toDateString();
    const isYesterday = new Date(Date.now() - 86400000).toDateString() === cycle.timestamp.toDateString();
    
    let dateLabel: string;
    if (isToday) {
      dateLabel = 'Today';
    } else if (isYesterday) {
      dateLabel = 'Yesterday';
    } else {
      dateLabel = cycle.timestamp.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      });
    }
    
    if (!acc[dateLabel]) {
      acc[dateLabel] = [];
    }
    acc[dateLabel].push(cycle);
    return acc;
  }, {} as Record<string, AICycle[]>);

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
      <MotiView
        from={{ opacity: 0, translateY: -10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', delay: 50 }}
      >
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <NeonText variant="body" color="muted">‹ Back</NeonText>
          </Pressable>
          <NeonText variant="h4" color="white">Cycle History</NeonText>
          <View style={styles.headerSpacer} />
        </View>
      </MotiView>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Card */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
        >
          <View style={styles.summaryCard}>
            <View style={styles.summaryTop}>
              <NeonText variant="caption" color="muted">NET PROFIT</NeonText>
              <NeonText 
                variant="display" 
                color={netProfit >= 0 ? 'primary' : 'danger'} 
                glow
                style={styles.summaryAmount}
              >
                {netProfit >= 0 ? '+' : ''}{netProfit.toFixed(2)}
              </NeonText>
            </View>
            
            <View style={styles.summaryStats}>
              <View style={styles.summaryStat}>
                <View style={[styles.summaryDot, { backgroundColor: colors.primary.DEFAULT }]} />
                <NeonText variant="caption" color="muted">Won</NeonText>
                <NeonText variant="body" color="primary">+${totalProfit.toFixed(2)}</NeonText>
              </View>
              <View style={styles.summaryStat}>
                <View style={[styles.summaryDot, { backgroundColor: colors.accent.DEFAULT }]} />
                <NeonText variant="caption" color="muted">Lost</NeonText>
                <NeonText variant="body" color="danger">-${totalLoss.toFixed(2)}</NeonText>
              </View>
              <View style={styles.summaryStat}>
                <View style={[styles.summaryDot, { backgroundColor: colors.neutral[500] }]} />
                <NeonText variant="caption" color="muted">Cycles</NeonText>
                <NeonText variant="body" color="white">{cycles.length}</NeonText>
              </View>
            </View>
          </View>
        </MotiView>

        {/* Grouped Cycles */}
        {Object.entries(groupedCycles).map(([date, dayCycles], groupIndex) => (
          <View key={date} style={styles.dateGroup}>
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: 'timing', delay: 200 + groupIndex * 50 }}
            >
              <View style={styles.dateHeader}>
                <NeonText variant="caption" color="muted">{date.toUpperCase()}</NeonText>
                <View style={styles.dateLine} />
              </View>
            </MotiView>
            
            <Card variant="default" padding="none">
              {dayCycles.map((cycle, index) => (
                <View key={cycle.id}>
                  <CycleRow cycle={cycle} index={groupIndex * 3 + index} />
                  {index < dayCycles.length - 1 && <View style={styles.rowDivider} />}
                </View>
              ))}
            </Card>
          </View>
        ))}

        {/* Footer */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', delay: 600 }}
          style={styles.footer}
        >
          <NeonText variant="caption" color="muted" align="center">
            Showing last {cycles.length} cycles
          </NeonText>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[8],
  },
  
  // Summary Card
  summaryCard: {
    backgroundColor: colors.card.DEFAULT,
    borderRadius: 20,
    padding: spacing[5],
    marginBottom: spacing[5],
    borderWidth: 1,
    borderColor: colors.card.border,
  },
  summaryTop: {
    alignItems: 'center',
    marginBottom: spacing[4],
    paddingBottom: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  summaryAmount: {
    fontSize: 42,
    letterSpacing: -1,
    marginTop: spacing[1],
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryStat: {
    alignItems: 'center',
    gap: spacing[1],
  },
  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 2,
  },
  
  // Date Groups
  dateGroup: {
    marginBottom: spacing[4],
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[2],
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.neutral[200],
  },
  
  // Cycle Row
  cycleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  rowDivider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginLeft: spacing[4],
  },
  cycleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    flex: 1,
  },
  cycleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cycleIconProfit: {
    backgroundColor: colors.primary[900],
    borderWidth: 1,
    borderColor: colors.primary[800],
  },
  cycleIconLoss: {
    backgroundColor: colors.accent.muted,
    borderWidth: 1,
    borderColor: colors.accent[600],
  },
  cycleInfo: {
    flex: 1,
    gap: 4,
  },
  cyclePairRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  cycleRight: {},
  
  // Footer
  footer: {
    marginTop: spacing[4],
  },
});

