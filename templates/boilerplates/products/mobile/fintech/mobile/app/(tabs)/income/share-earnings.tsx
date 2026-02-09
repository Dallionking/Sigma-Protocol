import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Share, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton, Card } from '@/components/primitives';
import { AppLogo } from '@/components';
import { colors, spacing } from '@/lib/theme';
import { DEMO_INCOME_SUMMARY, formatCurrency } from '@/lib/constants/income';

export default function ShareEarningsScreen() {
  const router = useRouter();
  const [isSharing, setIsSharing] = useState(false);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSharing(true);

    try {
      const message = `💰 Just earned ${formatCurrency(DEMO_INCOME_SUMMARY.todayEarned)} overnight with Trading Platform!\n\n🤖 AI-powered trading while I sleep.\n\n📈 Total earnings: ${formatCurrency(DEMO_INCOME_SUMMARY.totalEarned)}\n\nGet started → example.com`;

      await Share.share({
        message,
        title: 'My Trading Platform Earnings',
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Share failed:', error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Screen safeArea style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <NeonText variant="body" color="muted">‹ Back</NeonText>
        </Pressable>
        <NeonText variant="h4" color="white">Share Earnings</NeonText>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {/* Share Card Preview */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
        >
          <Card variant="glassmorphism" padding="lg" showBorderBeam style={styles.shareCard}>
            {/* Card Header */}
            <View style={styles.cardHeader}>
              <View style={styles.logoRow}>
                <View style={styles.logoCircle}>
                  <AppLogo size={16} />
                </View>
                <NeonText variant="caption" color="muted">TRADING PLATFORM</NeonText>
              </View>
            </View>

            {/* Main Content */}
            <View style={styles.cardContent}>
              <NeonText variant="display" color="primary" glow align="center" style={styles.earningsAmount}>
                +{formatCurrency(DEMO_INCOME_SUMMARY.todayEarned)}
              </NeonText>
              <NeonText variant="h4" color="white" align="center" style={styles.earningsLabel}>
                earned overnight
              </NeonText>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <NeonText variant="h4" color="white">
                  {formatCurrency(DEMO_INCOME_SUMMARY.weekEarned)}
                </NeonText>
                <NeonText variant="caption" color="muted">This Week</NeonText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <NeonText variant="h4" color="white">
                  {formatCurrency(DEMO_INCOME_SUMMARY.totalEarned)}
                </NeonText>
                <NeonText variant="caption" color="muted">Total</NeonText>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.cardFooter}>
              <NeonText variant="caption" color="primary">
                🤖 AI-Powered Trading
              </NeonText>
            </View>
          </Card>
        </MotiView>

        {/* Info */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200 }}
          style={styles.infoSection}
        >
          <NeonText variant="body" color="muted" align="center">
            Share your earnings and invite friends to join Trading Platform
          </NeonText>
        </MotiView>

        {/* Referral Note */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 300 }}
        >
          <Card variant="default" padding="md" style={styles.referralCard}>
            <View style={styles.referralRow}>
              <View style={styles.referralIcon}>
                <NeonText variant="body" color="primary">🎁</NeonText>
              </View>
              <View style={styles.referralText}>
                <NeonText variant="body" color="white">Earn $50 per referral</NeonText>
                <NeonText variant="caption" color="muted">
                  When your friend makes their first trade
                </NeonText>
              </View>
            </View>
          </Card>
        </MotiView>
      </View>

      {/* Share Button */}
      <View style={styles.actions}>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 400 }}
        >
          <NeonButton onPress={handleShare} disabled={isSharing}>
            {isSharing ? 'Opening...' : '📤 Share'}
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
  shareCard: {
    marginTop: spacing[4],
  },
  cardHeader: {
    marginBottom: spacing[4],
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  logoCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    alignItems: 'center',
    paddingVertical: spacing[4],
  },
  earningsAmount: {
    marginBottom: spacing[1],
  },
  earningsLabel: {
    marginBottom: spacing[2],
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.neutral[300],
  },
  cardFooter: {
    alignItems: 'center',
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  infoSection: {
    paddingVertical: spacing[4],
  },
  referralCard: {},
  referralRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  referralIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary[900],
    alignItems: 'center',
    justifyContent: 'center',
  },
  referralText: {
    flex: 1,
    gap: 2,
  },
  actions: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[6],
  },
});

