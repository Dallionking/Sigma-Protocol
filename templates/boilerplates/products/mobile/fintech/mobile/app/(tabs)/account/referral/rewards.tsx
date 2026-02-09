import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';

// Mock rewards data
const REWARDS_HISTORY = [
  { id: '1', type: 'earned', amount: 10, date: '2025-12-12', referredUser: 'Alex M.' },
  { id: '2', type: 'earned', amount: 10, date: '2025-12-08', referredUser: 'Jordan K.' },
  { id: '3', type: 'earned', amount: 10, date: '2025-12-01', referredUser: 'Sam T.' },
  { id: '4', type: 'redeemed', amount: 10, date: '2025-11-28', source: 'Friend code' },
];

const TOTAL_EARNED = 30;
const TOTAL_USED = 0;
const AVAILABLE_CREDIT = 40;

export default function RewardsScreen() {
  const router = useRouter();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Screen safeArea style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 300 }}
          style={styles.header}
        >
          <Pressable onPress={handleBack} style={styles.backButton}>
            <NeonText variant="body" color="muted">‹ Back</NeonText>
          </Pressable>
          <NeonText variant="h2" color="white">Rewards</NeonText>
          <View style={styles.titleUnderline} />
        </MotiView>

        {/* Credit Balance Card */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
          style={styles.balanceSection}
        >
          <View style={styles.balanceCard}>
            <View style={styles.balanceAccent} />
            <NeonText variant="caption" color="muted" style={styles.balanceLabel}>
              AVAILABLE CREDIT
            </NeonText>
            <MotiView
              from={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', delay: 150 }}
            >
              <NeonText variant="display" color="primary" glow style={styles.balanceAmount}>
                ${AVAILABLE_CREDIT}
              </NeonText>
            </MotiView>
            
            {/* Stats Row */}
            <View style={styles.balanceStats}>
              <View style={styles.balanceStat}>
                <NeonText variant="body" color="white">${TOTAL_EARNED}</NeonText>
                <NeonText variant="caption" color="muted">Earned</NeonText>
              </View>
              <View style={styles.balanceStatDivider} />
              <View style={styles.balanceStat}>
                <NeonText variant="body" color="white">${TOTAL_USED}</NeonText>
                <NeonText variant="caption" color="muted">Used</NeonText>
              </View>
            </View>
          </View>
        </MotiView>

        {/* History Section */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200, duration: 400 }}
          style={styles.historySection}
        >
          <NeonText variant="caption" color="muted" style={styles.sectionLabel}>
            HISTORY
          </NeonText>

          {REWARDS_HISTORY.length === 0 ? (
            <View style={styles.emptyState}>
              <NeonText style={styles.emptyIcon}>📭</NeonText>
              <NeonText variant="body" color="muted">No rewards yet</NeonText>
              <NeonText variant="caption" color="muted">
                Invite friends to start earning!
              </NeonText>
            </View>
          ) : (
            <View style={styles.historyList}>
              {REWARDS_HISTORY.map((reward, index) => (
                <MotiView
                  key={reward.id}
                  from={{ opacity: 0, translateX: -15 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ type: 'timing', delay: 250 + index * 50, duration: 400 }}
                >
                  <View style={styles.rewardRow}>
                    <View style={styles.rewardIconContainer}>
                      <NeonText style={styles.rewardIcon}>
                        {reward.type === 'earned' ? '🏆' : '🎁'}
                      </NeonText>
                    </View>
                    
                    <View style={styles.rewardContent}>
                      <View style={styles.rewardHeader}>
                        <NeonText variant="body" color="white">
                          {reward.type === 'earned' 
                            ? `Referral: ${reward.referredUser}`
                            : 'Code Redeemed'
                          }
                        </NeonText>
                        <NeonText variant="body" color="primary" style={styles.rewardAmount}>
                          +${reward.amount}
                        </NeonText>
                      </View>
                      <NeonText variant="caption" color="muted">
                        {formatDate(reward.date)}
                        {reward.type === 'earned' && ' • Friend signed up'}
                        {reward.type === 'redeemed' && ` • ${reward.source}`}
                      </NeonText>
                    </View>
                  </View>
                  
                  {index < REWARDS_HISTORY.length - 1 && (
                    <View style={styles.rewardDivider} />
                  )}
                </MotiView>
              ))}
            </View>
          )}
        </MotiView>

        {/* Info Footer */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', delay: 500, duration: 400 }}
          style={styles.infoFooter}
        >
          <View style={styles.infoCard}>
            <NeonText variant="caption" color="muted" style={styles.infoText}>
              Credits are automatically applied to your next subscription payment.
              Unused credits never expire.
            </NeonText>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing[4],
    paddingBottom: layout.tabBarHeight + spacing[4],
  },
  header: {
    paddingVertical: spacing[2],
    gap: spacing[1],
  },
  backButton: {
    paddingVertical: spacing[2],
    alignSelf: 'flex-start',
  },
  titleUnderline: {
    height: 2,
    width: 50,
    backgroundColor: colors.primary[500],
    borderRadius: 1,
    marginTop: spacing[1],
  },
  balanceSection: {
    marginTop: spacing[4],
  },
  balanceCard: {
    backgroundColor: colors.neutral[100],
    borderRadius: 20,
    padding: spacing[5],
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  balanceAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.primary[500],
  },
  balanceLabel: {
    letterSpacing: 1.5,
    fontSize: 11,
    marginBottom: spacing[2],
  },
  balanceAmount: {
    fontSize: 48,
    letterSpacing: 2,
  },
  balanceStats: {
    flexDirection: 'row',
    marginTop: spacing[4],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    width: '100%',
    justifyContent: 'center',
  },
  balanceStat: {
    alignItems: 'center',
    paddingHorizontal: spacing[6],
  },
  balanceStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.neutral[300],
  },
  historySection: {
    marginTop: spacing[6],
  },
  sectionLabel: {
    letterSpacing: 1.5,
    fontSize: 11,
    marginBottom: spacing[3],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing[8],
    gap: spacing[2],
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing[2],
  },
  historyList: {
    backgroundColor: colors.neutral[100],
    borderRadius: 16,
    overflow: 'hidden',
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    gap: spacing[3],
  },
  rewardIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardIcon: {
    fontSize: 22,
  },
  rewardContent: {
    flex: 1,
    gap: 2,
  },
  rewardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardAmount: {
    fontWeight: '700',
  },
  rewardDivider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginLeft: 68,
  },
  infoFooter: {
    marginTop: spacing[6],
  },
  infoCard: {
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    padding: spacing[4],
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[500],
  },
  infoText: {
    lineHeight: 18,
  },
});


