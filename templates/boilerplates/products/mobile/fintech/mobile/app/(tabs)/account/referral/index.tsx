import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton, Card, ListRow, Icon } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';

// Mock referral data
const REFERRAL_CODE = 'TRADE-142';
const REFERRAL_STATS = {
  totalReferrals: 3,
  totalEarned: 30,
  pending: 1,
};

export default function ReferralOverviewScreen() {
  const router = useRouter();
  const [copied, setCopied] = React.useState(false);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleInvite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/account/referral/invite');
  };

  const handleRedeem = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/account/referral/redeem');
  };

  const handleRewards = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/account/referral/rewards');
  };

  const handleTerms = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/account/referral/terms');
  };

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(REFERRAL_CODE);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <NeonText variant="h2" color="white">Referral Program</NeonText>
          <View style={styles.titleUnderline} />
        </MotiView>

        {/* Hero Section */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
        >
          <View style={styles.heroCard}>
            <View style={styles.heroGlow} />
            <MotiView
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ type: 'timing', duration: 2000, loop: true }}
            >
              <Icon name="gift" size={64} color="primary" />
            </MotiView>
            <NeonText variant="h2" color="primary" glow style={styles.heroTitle}>
              Give $10 — Get $10
            </NeonText>
            <NeonText variant="body" color="muted" style={styles.heroSubtitle}>
              Invite friends to the Trading Platform and earn credits together.
            </NeonText>
          </View>
        </MotiView>

        {/* Referral Code */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 150, duration: 400 }}
        >
          <View style={styles.codeCard}>
            <NeonText variant="caption" color="muted" style={styles.codeLabel}>
              YOUR REFERRAL CODE
            </NeonText>
            <Pressable onPress={handleCopyCode} style={styles.codeBox}>
              <NeonText variant="h3" color="primary" style={styles.codeText}>
                {REFERRAL_CODE}
              </NeonText>
              <View style={styles.copyBadge}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  {copied && <Icon name="check" size={12} color="primary" />}
                  <NeonText variant="caption" color={copied ? 'primary' : 'muted'}>
                    {copied ? 'Copied!' : 'Tap to copy'}
                  </NeonText>
                </View>
              </View>
            </Pressable>
          </View>
        </MotiView>

        {/* Stats */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200, duration: 400 }}
          style={styles.statsSection}
        >
          <NeonText variant="caption" color="muted" style={styles.sectionLabel}>
            YOUR STATS
          </NeonText>
          <View style={styles.statsRow}>
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', delay: 220, duration: 300 }}
              style={styles.statItem}
            >
              <NeonText variant="h2" color="white">{REFERRAL_STATS.totalReferrals}</NeonText>
              <NeonText variant="caption" color="muted">Referrals</NeonText>
            </MotiView>
            <View style={styles.statDivider} />
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', delay: 260, duration: 300 }}
              style={styles.statItem}
            >
              <NeonText variant="h2" color="primary">${REFERRAL_STATS.totalEarned}</NeonText>
              <NeonText variant="caption" color="muted">Earned</NeonText>
            </MotiView>
            <View style={styles.statDivider} />
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', delay: 300, duration: 300 }}
              style={styles.statItem}
            >
              <NeonText variant="h2" color="white">{REFERRAL_STATS.pending}</NeonText>
              <NeonText variant="caption" color="muted">Pending</NeonText>
            </MotiView>
          </View>
        </MotiView>

        {/* Action Buttons */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 350, duration: 400 }}
          style={styles.actionsSection}
        >
          <NeonButton onPress={handleInvite}>
            Invite Friends
          </NeonButton>
          <NeonButton variant="outline" onPress={handleRedeem} style={styles.secondaryButton}>
            Redeem Code
          </NeonButton>
        </MotiView>

        {/* Links */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 400, duration: 400 }}
          style={styles.linksSection}
        >
          <Card variant="default" padding="none">
            <ListRow
              icon="trophy"
              title="Rewards History"
              showArrow
              onPress={handleRewards}
              divider
            />
            <ListRow
              icon="document"
              title="Referral Terms"
              showArrow
              onPress={handleTerms}
              divider={false}
            />
          </Card>
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
    width: 80,
    backgroundColor: colors.primary[500],
    borderRadius: 1,
    marginTop: spacing[1],
  },
  heroCard: {
    alignItems: 'center',
    marginTop: spacing[4],
    backgroundColor: colors.neutral[100],
    borderRadius: 20,
    padding: spacing[6],
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  heroGlow: {
    position: 'absolute',
    top: -50,
    left: '50%',
    marginLeft: -75,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.primary[500],
    opacity: 0.1,
  },
  heroEmoji: {
    fontSize: 64,
    marginBottom: spacing[3],
  },
  heroTitle: {
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  heroSubtitle: {
    textAlign: 'center',
  },
  codeCard: {
    marginTop: spacing[4],
    backgroundColor: colors.neutral[100],
    borderRadius: 16,
    padding: spacing[4],
    alignItems: 'center',
  },
  codeLabel: {
    letterSpacing: 1.5,
    fontSize: 11,
    marginBottom: spacing[3],
  },
  codeBox: {
    alignItems: 'center',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[6],
    backgroundColor: colors.neutral[0],
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary[500],
    borderStyle: 'dashed',
    width: '100%',
  },
  codeText: {
    letterSpacing: 2,
    fontWeight: '700',
  },
  copyBadge: {
    marginTop: spacing[2],
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.neutral[100],
    borderRadius: 8,
  },
  statsSection: {
    marginTop: spacing[6],
  },
  sectionLabel: {
    letterSpacing: 1.5,
    fontSize: 11,
    marginBottom: spacing[3],
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.neutral[100],
    borderRadius: 16,
    paddingVertical: spacing[5],
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[500],
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.neutral[300],
  },
  actionsSection: {
    marginTop: spacing[6],
    gap: spacing[3],
  },
  secondaryButton: {
    marginTop: spacing[1],
  },
  linksSection: {
    marginTop: spacing[6],
  },
});
