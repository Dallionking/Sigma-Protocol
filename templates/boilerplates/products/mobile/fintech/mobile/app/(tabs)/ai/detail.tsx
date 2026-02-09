import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonLoader, Card, Badge, Icon } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';
import {
  AIStatus,
  AISignal,
  fetchAIStatus,
  fetchAISignals,
  formatTimeAgo,
  formatTimeUntil,
  DEMO_AI_STATUS,
  DEMO_AI_SIGNALS,
} from '@/lib/constants/ai';

const SIGNAL_CONFIG = {
  strong: { color: colors.primary.DEFAULT, width: '90%' },
  moderate: { color: colors.warning, width: '60%' },
  weak: { color: colors.error, width: '30%' },
} as const;

function SignalBar({ signal, index }: { signal: AISignal; index: number }) {
  const config = SIGNAL_CONFIG[signal.value];
  
  return (
    <MotiView
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'timing', delay: 300 + index * 100 }}
      style={styles.signalRow}
    >
      <View style={styles.signalHeader}>
        <NeonText variant="body" color="white">{signal.name}</NeonText>
        <NeonText 
          variant="caption" 
          style={{ color: config.color }}
        >
          {signal.value.toUpperCase()}
        </NeonText>
      </View>
      <View style={styles.signalBarContainer}>
        <MotiView
          from={{ width: '0%' }}
          animate={{ width: config.width as any }}
          transition={{ type: 'timing', duration: 800, delay: 400 + index * 100 }}
          style={[styles.signalBarFill, { backgroundColor: config.color }]}
        />
      </View>
    </MotiView>
  );
}

export default function AIDetailScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<AIStatus>(DEMO_AI_STATUS);
  const [signals, setSignals] = useState<AISignal[]>(DEMO_AI_SIGNALS);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statusData, signalsData] = await Promise.all([
          fetchAIStatus(),
          fetchAISignals(),
        ]);
        setStatus(statusData);
        setSignals(signalsData);
      } catch (error) {
        console.error('Failed to load data:', error);
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

  const handleSignalExplainer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/ai/signal-explainer');
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
      <MotiView
        from={{ opacity: 0, translateY: -10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', delay: 50 }}
      >
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <NeonText variant="body" color="muted">‹ Back</NeonText>
          </Pressable>
          <NeonText variant="h4" color="white">AI Details</NeonText>
          <View style={styles.headerSpacer} />
        </View>
      </MotiView>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Timing Hero */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
        >
          <View style={styles.timingHero}>
            <View style={styles.timingItem}>
              <View style={styles.timingIcon}>
                <MotiView
                  animate={{ rotate: ['0deg', '360deg'] }}
                  transition={{ type: 'timing', duration: 20000, loop: true }}
                >
                  <Icon name="clock" size={28} color="muted" />
                </MotiView>
              </View>
              <NeonText variant="caption" color="muted">LAST CYCLE</NeonText>
              <NeonText variant="h3" color="white">{formatTimeAgo(status.lastCycle)}</NeonText>
            </View>
            
            <View style={styles.timingDivider}>
              <View style={styles.timingLine} />
              <View style={styles.timingDot} />
              <View style={styles.timingLine} />
            </View>
            
            <View style={styles.timingItem}>
              <View style={[styles.timingIcon, styles.timingIconNext]}>
                <MotiView
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ type: 'timing', duration: 2000, loop: true }}
                >
                  <Icon name="hourglass" size={28} color="primary" />
                </MotiView>
              </View>
              <NeonText variant="caption" color="muted">NEXT CYCLE</NeonText>
              <NeonText variant="h3" color="primary" glow>{formatTimeUntil(status.nextCycle)}</NeonText>
            </View>
          </View>
        </MotiView>

        {/* Signals Section */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200 }}
        >
          <View style={styles.sectionHeader}>
            <NeonText variant="h4" color="white">Market Signals</NeonText>
            <Badge variant="default" size="sm">LIVE</Badge>
          </View>
          
          <Card variant="glassmorphism" padding="lg" showBorderBeam style={styles.signalsCard}>
            {signals.map((signal, index) => (
              <SignalBar key={signal.name} signal={signal} index={index} />
            ))}
          </Card>
        </MotiView>

        {/* Learn More */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 700 }}
        >
          <Pressable onPress={handleSignalExplainer}>
            <View style={styles.learnCard}>
              <View style={styles.learnRow}>
                <View style={styles.learnIcon}>
                  <Icon name="lightbulb" size={22} color="warning" />
                </View>
                <View style={styles.learnText}>
                  <NeonText variant="body" color="white">What do these signals mean?</NeonText>
                  <NeonText variant="caption" color="muted">Learn how the AI reads the market</NeonText>
                </View>
                <NeonText variant="h4" color="primary">›</NeonText>
              </View>
            </View>
          </Pressable>
        </MotiView>

        {/* Active Since */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 800 }}
        >
          <View style={styles.activeCard}>
            <View style={styles.activeRow}>
              <NeonText variant="caption" color="muted">ACTIVE SINCE</NeonText>
              <View style={styles.activeValue}>
                <NeonText variant="body" color="white">
                  {status.activeSince.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </NeonText>
                <Badge variant="success" size="sm">
                  {Math.floor((Date.now() - status.activeSince.getTime()) / 3600000)}h
                </Badge>
              </View>
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
    paddingBottom: spacing[12],
  },
  
  // Timing Hero
  timingHero: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card.DEFAULT,
    borderRadius: 20,
    padding: spacing[5],
    marginBottom: spacing[5],
    borderWidth: 1,
    borderColor: colors.card.border,
  },
  timingItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing[2],
  },
  timingIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[1],
  },
  timingIconNext: {
    backgroundColor: colors.primary[900],
    borderWidth: 1,
    borderColor: colors.primary[800],
  },
  timingDivider: {
    alignItems: 'center',
    paddingHorizontal: spacing[2],
  },
  timingLine: {
    width: 1,
    height: 20,
    backgroundColor: colors.neutral[300],
  },
  timingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary.DEFAULT,
    marginVertical: spacing[1],
  },
  
  // Signals
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
  },
  signalsCard: {
    marginBottom: spacing[4],
  },
  signalRow: {
    marginBottom: spacing[4],
  },
  signalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  signalBarContainer: {
    height: 6,
    backgroundColor: colors.neutral[200],
    borderRadius: 3,
    overflow: 'hidden',
  },
  signalBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  
  // Learn Card
  learnCard: {
    backgroundColor: colors.card.DEFAULT,
    borderRadius: 16,
    padding: spacing[4],
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.card.border,
  },
  learnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  learnIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  learnText: {
    flex: 1,
    gap: 2,
  },
  
  // Active Card
  activeCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  activeRow: {
    gap: spacing[2],
  },
  activeValue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

