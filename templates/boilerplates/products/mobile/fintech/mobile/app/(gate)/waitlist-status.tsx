import React from 'react';
import { View, StyleSheet, Share, Alert, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';
import { verticalScale } from '@/lib/utils/responsive';

// In production, this would come from API/state
const WAITLIST_POSITION = 142;
const REFERRAL_CODE = `TRADE-${WAITLIST_POSITION}`;
const SHARE_URL = `https://example.com/invite/${REFERRAL_CODE}`;

export default function WaitlistStatusScreen() {
  const router = useRouter();

  const handleSkipDemo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/(onboarding)/welcome');
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      const result = await Share.share({
        message: `Join me on Trading Platform! Use my invite link to skip the line: ${SHARE_URL}`,
        url: SHARE_URL, // iOS only
        title: 'Trading Platform Invite',
      });

      if (result.action === Share.sharedAction) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not open share dialog');
    }
  };

  return (
    <Screen safeArea padded={false} style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
      {/* Skip Demo button */}
      <View style={styles.skipDemoContainer}>
        <Pressable onPress={handleSkipDemo} style={styles.skipDemoButton}>
          <NeonText variant="label" color="muted">
            Skip (Demo)
          </NeonText>
        </Pressable>
      </View>

      <View style={styles.content}>
        {/* Success animation */}
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          style={styles.iconContainer}
        >
          <NeonText variant="display" color="primary" glow>
            ✓
          </NeonText>
        </MotiView>

        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 200 }}
        >
          <NeonText variant="h2" style={styles.title}>
            You're on the list
          </NeonText>
        </MotiView>

        {/* Position */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 400 }}
          style={styles.positionSection}
        >
          <NeonText variant="label" color="muted">
            Position
          </NeonText>
          <NeonText variant="display" color="primary" glow style={styles.positionNumber}>
            #{WAITLIST_POSITION}
          </NeonText>
        </MotiView>

        {/* Share prompt */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 600 }}
          style={styles.shareSection}
        >
          <NeonText variant="body" color="muted" style={styles.sharePrompt}>
            Move up the line by inviting friends.
          </NeonText>

          <View style={styles.shareButton}>
            <NeonButton onPress={handleShare}>
              Share Invite Link
            </NeonButton>
          </View>
        </MotiView>

        {/* Referral code */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 400, delay: 800 }}
          style={styles.codeSection}
        >
          <NeonText variant="label" color="muted">
            Your referral code
          </NeonText>
          <View style={styles.codeContainer}>
            <NeonText variant="mono" color="primary" style={styles.codeText}>
              {REFERRAL_CODE}
            </NeonText>
          </View>
        </MotiView>
      </View>
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
    flexGrow: 1,
    paddingHorizontal: spacing[4],
  },
  skipDemoContainer: {
    alignItems: 'flex-end',
    paddingTop: spacing[2],
  },
  skipDemoButton: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
  },
  iconContainer: {
    marginBottom: spacing[6],
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing[8],
  },
  positionSection: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  positionNumber: {
    marginTop: spacing[2],
  },
  shareSection: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  sharePrompt: {
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  shareButton: {
    width: '100%',
  },
  codeSection: {
    alignItems: 'center',
  },
  codeContainer: {
    marginTop: spacing[2],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    backgroundColor: colors.neutral[50],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  codeText: {
    fontSize: 18,
    letterSpacing: 1,
  },
});

