import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, Share } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton } from '@/components/primitives';
import { AppLogo } from '@/components';
import { colors, spacing, layout } from '@/lib/theme';

const REFERRAL_CODE = 'TRADE-142';
const SHARE_MESSAGE = `Join the Trading Platform and get $10 in trading credits! Use my referral code: ${REFERRAL_CODE}\n\nDownload: https://example.com/invite/${REFERRAL_CODE}`;

export default function InviteScreen() {
  const router = useRouter();
  const [isSharing, setIsSharing] = React.useState(false);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleShare = async () => {
    setIsSharing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      await Share.share({
        message: SHARE_MESSAGE,
        title: 'Join Trading Platform',
      });
    } catch {
      // User cancelled or error
    } finally {
      setIsSharing(false);
    }
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
          <NeonText variant="h2" color="white">Invite Friends</NeonText>
          <View style={styles.titleUnderline} />
        </MotiView>

        {/* Branded Card Preview */}
        <MotiView
          from={{ opacity: 0, scale: 0.9, rotateZ: '-2deg' }}
          animate={{ opacity: 1, scale: 1, rotateZ: '0deg' }}
          transition={{ type: 'spring', delay: 100 }}
          style={styles.cardPreviewSection}
        >
          <View style={styles.inviteCard}>
            {/* Card Background Effects */}
            <View style={styles.cardGradientTop} />
            <View style={styles.cardGradientBottom} />
            
            {/* Card Content */}
            <View style={styles.cardHeader}>
              <View style={styles.logoContainer}>
                <AppLogo size={18} />
              </View>
              <NeonText variant="caption" color="muted" style={styles.cardBrand}>
                TRADING PLATFORM
              </NeonText>
            </View>
            
            <View style={styles.cardBody}>
              <NeonText variant="h3" color="white" style={styles.cardTitle}>
                Join the Protocol
              </NeonText>
              <NeonText variant="body" color="muted" style={styles.cardSubtitle}>
                AI-Powered Trading
              </NeonText>
            </View>
            
            <View style={styles.cardFooter}>
              <View style={styles.codeContainer}>
                <NeonText variant="caption" color="muted">REFERRAL CODE</NeonText>
                <NeonText variant="h4" color="primary" style={styles.codeValue}>
                  {REFERRAL_CODE}
                </NeonText>
              </View>
              <View style={styles.rewardBadge}>
                <NeonText variant="caption" color="primary" style={styles.rewardText}>
                  $10 CREDIT
                </NeonText>
              </View>
            </View>
            
            {/* Corner Accents */}
            <View style={styles.cornerAccentTL} />
            <View style={styles.cornerAccentBR} />
          </View>
        </MotiView>

        {/* Message Preview */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200, duration: 400 }}
          style={styles.messageSection}
        >
          <NeonText variant="caption" color="muted" style={styles.sectionLabel}>
            SHARE MESSAGE
          </NeonText>
          <View style={styles.messageCard}>
            <NeonText variant="body" color="muted" style={styles.messageText}>
              Join the Trading Platform and get{' '}
              <NeonText variant="body" color="primary">$10 in trading credits!</NeonText>
              {'\n\n'}Use my referral code: <NeonText variant="body" color="white">{REFERRAL_CODE}</NeonText>
            </NeonText>
          </View>
        </MotiView>

        {/* Share Button */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 300, duration: 400 }}
          style={styles.shareSection}
        >
          <NeonButton onPress={handleShare} disabled={isSharing}>
            {isSharing ? 'Opening...' : 'Share Invite'}
          </NeonButton>
        </MotiView>

        {/* Share Options Hint */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', delay: 400, duration: 400 }}
          style={styles.hintSection}
        >
          <NeonText variant="caption" color="muted" style={styles.hintText}>
            Share via Messages, WhatsApp, Email, or any app
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
    width: 60,
    backgroundColor: colors.primary[500],
    borderRadius: 1,
    marginTop: spacing[1],
  },
  cardPreviewSection: {
    marginTop: spacing[6],
    alignItems: 'center',
  },
  inviteCard: {
    width: '100%',
    aspectRatio: 1.6,
    backgroundColor: colors.neutral[100],
    borderRadius: 20,
    padding: spacing[5],
    justifyContent: 'space-between',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.neutral[200],
    position: 'relative',
  },
  cardGradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: colors.primary[500],
    opacity: 0.05,
  },
  cardGradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: colors.primary[500],
    opacity: 0.03,
  },
  cornerAccentTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 3,
    backgroundColor: colors.primary[500],
  },
  cornerAccentBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 3,
    backgroundColor: colors.primary[500],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  logoContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    fontSize: 18,
  },
  cardBrand: {
    letterSpacing: 2,
    fontSize: 10,
  },
  cardBody: {
    alignItems: 'center',
  },
  cardTitle: {
    textAlign: 'center',
    marginBottom: spacing[1],
  },
  cardSubtitle: {
    textAlign: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  codeContainer: {
    gap: 2,
  },
  codeValue: {
    letterSpacing: 1,
  },
  rewardBadge: {
    backgroundColor: colors.primary[900],
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  rewardText: {
    fontWeight: '700',
    letterSpacing: 1,
  },
  messageSection: {
    marginTop: spacing[6],
  },
  sectionLabel: {
    letterSpacing: 1.5,
    fontSize: 11,
    marginBottom: spacing[3],
  },
  messageCard: {
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    padding: spacing[4],
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[500],
  },
  messageText: {
    lineHeight: 22,
  },
  shareSection: {
    marginTop: spacing[6],
  },
  hintSection: {
    marginTop: spacing[4],
    alignItems: 'center',
  },
  hintText: {
    textAlign: 'center',
  },
});


