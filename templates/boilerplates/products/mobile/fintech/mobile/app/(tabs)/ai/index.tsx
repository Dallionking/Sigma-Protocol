import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Pressable, ScrollView, RefreshControl, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen, NeonText, NeonButton, NeonLoader, Card, Badge, Icon } from '@/components/primitives';
import { ConfidenceRing, AnimatedPercentage, AnimatedDots } from '@/components';
import { colors, spacing } from '@/lib/theme';
import { ChevronRight } from 'lucide-react-native';
import {
  AIStatus,
  fetchAIStatus,
  formatTimeAgo,
  formatTimeUntil,
  AI_STATUS_LABELS,
  CONFIDENCE_LABELS,
  DEMO_AI_STATUS,
} from '@/lib/constants/ai';

// Animated activity bar component
function ActivityBar({ index, isActive }: { index: number; isActive: boolean }) {
  const heights = [0.4, 0.8, 0.6, 1, 0.5, 0.9, 0.3, 0.7];
  const baseHeight = heights[index % heights.length];
  
  return (
    <MotiView
      from={{ scaleY: 0.2, opacity: 0.3 }}
      animate={{ 
        scaleY: isActive ? [0.2, baseHeight, 0.4, baseHeight * 0.8, 0.3] : 0.2,
        opacity: isActive ? 1 : 0.3,
      }}
      transition={{
        type: 'timing',
        duration: 1200 + index * 150,
        loop: isActive,
      }}
      style={[styles.activityBar, { 
        backgroundColor: isActive ? colors.primary.DEFAULT : colors.neutral[400],
        ...(isActive && Platform.OS === 'web' ? {
          boxShadow: `0 0 12px ${colors.glow}`,
        } : {}),
      }]}
    />
  );
}

export default function AIDashboardScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [status, setStatus] = useState<AIStatus>(DEMO_AI_STATUS);

  const loadData = useCallback(async () => {
    try {
      const data = await fetchAIStatus();
      setStatus(data);
    } catch (error) {
      console.error('Failed to load AI status:', error);
    }
  }, []);

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

  const handleSeeDetails = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/ai/detail');
  };

  const handleAdjustRisk = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(risk)/settings');
  };

  const handleCycleHistory = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/ai/cycle-history');
  };

  const handleGuarantee = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/ai/guarantee-info');
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

  const statusInfo = AI_STATUS_LABELS[status.status];
  const confidenceInfo = CONFIDENCE_LABELS[status.confidence];

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
        {/* Hero Status Section */}
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 20, delay: 100 }}
        >
          <View style={styles.heroSection}>
            {/* Ambient glow background */}
            <View style={styles.heroGlow}>
              <MotiView
                from={{ opacity: 0.3 }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ type: 'timing', duration: 3000, loop: true }}
                style={styles.glowOrb}
              />
            </View>
            
            {/* Status indicator */}
            <View style={styles.statusContainer}>
              <MotiView
                from={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 10, delay: 200 }}
              >
                <ConfidenceRing
                  percentage={status.successRate * 100}
                  size={80}
                  strokeWidth={6}
                  color={statusInfo.color}
                  showLabel={true}
                  label="SUCCESS"
                />
              </MotiView>
              
              <MotiView
                from={{ opacity: 0, translateX: -10 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'timing', delay: 300 }}
              >
                <NeonText variant="caption" color="muted" style={styles.statusLabel}>
                  STATUS
                </NeonText>
                <NeonText variant="h2" color="primary" glow style={styles.statusValue}>
                  {statusInfo.label}
                </NeonText>
              </MotiView>
            </View>

            {/* Activity Visualizer */}
            <View style={styles.visualizerContainer}>
              <View style={styles.activityBars}>
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <ActivityBar key={i} index={i} isActive={status.isActive} />
                ))}
              </View>
              {status.isActive ? (
                <AnimatedDots text="Processing market data" variant="caption" color="muted" />
              ) : (
                <NeonText variant="caption" color="muted" style={styles.visualizerLabel}>
                  Paused
                </NeonText>
              )}
            </View>
          </View>
        </MotiView>

        {/* Stats Grid */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 400 }}
        >
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <NeonText variant="caption" color="muted">Confidence</NeonText>
              <View style={styles.statValueRow}>
                <View style={[styles.statDot, { backgroundColor: confidenceInfo.color }]} />
                <NeonText variant="h4" color="white">{confidenceInfo.label}</NeonText>
              </View>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statCard}>
              <NeonText variant="caption" color="muted">Mode</NeonText>
              <NeonText variant="h4" color="white">{status.mode.toUpperCase()}</NeonText>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statCard}>
              <NeonText variant="caption" color="muted">Success</NeonText>
              <AnimatedPercentage 
                value={Math.round(status.successRate * 100)} 
                variant="h4" 
                color="primary" 
              />
            </View>
          </View>
        </MotiView>

        {/* Action Buttons */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 500 }}
          style={styles.actionButtons}
        >
          <Pressable style={styles.actionBtn} onPress={handleAdjustRisk}>
            <View style={styles.actionBtnInner}>
              <Icon name="settings" size={18} color="muted" />
              <NeonText variant="body" color="white">Adjust Risk</NeonText>
            </View>
          </Pressable>
          
          <Pressable style={[styles.actionBtn, styles.actionBtnPrimary]} onPress={handleSeeDetails}>
            <View style={styles.actionBtnInner}>
              <Icon name="barChart" size={18} color="primary" />
              <NeonText variant="body" color="primary">See Details</NeonText>
            </View>
          </Pressable>
        </MotiView>

        {/* Cycle Timing */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 600 }}
        >
          <Pressable onPress={handleCycleHistory}>
            <Card variant="glassmorphism" padding="none" showBorderBeam style={styles.cycleCard}>
              <View style={styles.cycleRow}>
                <View style={styles.cycleItem}>
                  <View style={styles.cycleIconContainer}>
                    <Icon name="clock" size={18} color="muted" />
                  </View>
                  <View style={styles.cycleInfo}>
                    <NeonText variant="caption" color="muted">Last Cycle</NeonText>
                    <NeonText variant="body" color="white">{formatTimeAgo(status.lastCycle)}</NeonText>
                  </View>
                </View>
                
                <View style={styles.cycleDivider} />
                
                <View style={styles.cycleItem}>
                  <View style={[styles.cycleIconContainer, styles.cycleIconNext]}>
                    <Icon name="hourglass" size={18} color="primary" />
                  </View>
                  <View style={styles.cycleInfo}>
                    <NeonText variant="caption" color="muted">Next Cycle</NeonText>
                    <NeonText variant="body" color="primary">{formatTimeUntil(status.nextCycle)}</NeonText>
                  </View>
                </View>
                
                <NeonText variant="h4" color="muted" style={styles.cycleArrow}>›</NeonText>
              </View>
            </Card>
          </Pressable>
        </MotiView>

        {/* Performance Summary */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 700 }}
        >
          <Card variant="glassmorphism" padding="md" showBorderBeam style={styles.performanceCard}>
            <View style={styles.performanceHeader}>
              <NeonText variant="h4" color="white">Performance</NeonText>
              <Badge variant="success" size="sm">{status.totalCycles} cycles</Badge>
            </View>
            
            <View style={styles.performanceBar}>
              <MotiView
                from={{ width: '0%' }}
                animate={{ width: `${status.successRate * 100}%` }}
                transition={{ type: 'timing', duration: 1000, delay: 800 }}
                style={styles.performanceFill}
              />
            </View>
            
            <View style={styles.performanceLabels}>
              <NeonText variant="caption" color="muted">Win Rate</NeonText>
              <AnimatedPercentage 
                value={Math.round(status.successRate * 100)} 
                variant="caption" 
                color="primary" 
              />
            </View>
          </Card>
        </MotiView>

        {/* Guarantee Banner */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 800 }}
        >
          <Pressable onPress={handleGuarantee}>
            <View style={styles.guaranteeBanner}>
              <View style={styles.guaranteeGradient}>
                <View style={styles.guaranteeContent}>
                  <View style={styles.guaranteeIcon}>
                    <Icon name="shield" size={28} color="primary" />
                  </View>
                  <View style={styles.guaranteeText}>
                    <NeonText variant="h4" color="white">48-Hour AI Guarantee</NeonText>
                    <NeonText variant="caption" color="muted">
                      See returns or your first month free
                    </NeonText>
                  </View>
                  <View style={styles.guaranteeArrow}>
                    <ChevronRight size={24} color={colors.primary.DEFAULT} />
                  </View>
                </View>
              </View>
            </View>
          </Pressable>
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
  
  // Hero Section
  heroSection: {
    paddingTop: spacing[2],
    paddingBottom: spacing[6],
    position: 'relative',
  },
  heroGlow: {
    position: 'absolute',
    top: 0,
    left: '25%',
    right: '25%',
    height: 150,
    alignItems: 'center',
  },
  glowOrb: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.primary[900],
    opacity: 0.4,
    ...(Platform.OS === 'web' ? {
      filter: 'blur(60px)',
    } : {}),
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    marginBottom: spacing[6],
    zIndex: 1,
  },
  statusDotOuter: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[900],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary[800],
  },
  statusDotInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  statusLabel: {
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 2,
  },
  statusValue: {
    fontSize: 32,
    letterSpacing: -1,
  },
  
  // Visualizer
  visualizerContainer: {
    alignItems: 'center',
    zIndex: 1,
  },
  activityBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 60,
    gap: 6,
    marginBottom: spacing[2],
  },
  activityBar: {
    width: 8,
    height: 60,
    borderRadius: 4,
    transformOrigin: 'bottom',
  },
  visualizerLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 10,
  },
  
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: colors.card.DEFAULT,
    borderRadius: 16,
    padding: spacing[4],
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.card.border,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: spacing[1],
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: colors.neutral[300],
    marginHorizontal: spacing[2],
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  actionBtn: {
    flex: 1,
    backgroundColor: colors.card.DEFAULT,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.card.border,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  actionBtnPrimary: {
    borderColor: colors.primary[800],
    backgroundColor: colors.primary[900],
  },
  actionBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  
  // Cycle Card
  cycleCard: {
    marginBottom: spacing[4],
  },
  cycleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
  },
  cycleItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  cycleDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.neutral[300],
    marginHorizontal: spacing[3],
  },
  cycleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  cycleIconNext: {
    backgroundColor: colors.primary[900],
  },
  cycleInfo: {
    gap: 2,
  },
  cycleArrow: {
    marginLeft: spacing[2],
  },
  
  // Performance Card
  performanceCard: {
    marginBottom: spacing[4],
  },
  performanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
  },
  performanceBar: {
    height: 8,
    backgroundColor: colors.neutral[200],
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing[2],
  },
  performanceFill: {
    height: '100%',
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: 4,
  },
  performanceLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  // Guarantee Banner
  guaranteeBanner: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.primary[800],
    backgroundColor: colors.primary[900],
  },
  guaranteeGradient: {
    padding: spacing[4],
  },
  guaranteeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  guaranteeIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary[800],
  },
  guaranteeText: {
    flex: 1,
    gap: 2,
  },
  guaranteeArrow: {
    paddingLeft: spacing[2],
  },
});

