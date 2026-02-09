import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton, Card, Badge } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';
import { verticalScale, moderateScale } from '@/lib/utils/responsive';

export default function ConnectSuccessScreen() {
  const router = useRouter();

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace('/(portfolio)/balance');
  };

  return (
    <Screen safeArea padded={false} style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
      <View style={styles.content}>
        {/* Success Icon */}
        <MotiView
          from={{ scale: 0, rotate: '-180deg' }}
          animate={{ scale: 1, rotate: '0deg' }}
          transition={{ type: 'spring', damping: 10, delay: 100 }}
          style={styles.iconSection}
        >
          <View style={styles.successCircle}>
            <NeonText variant="display" style={styles.checkmark}>✓</NeonText>
          </View>
        </MotiView>

        {/* Title */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 300 }}
        >
          <NeonText variant="h2" color="primary" align="center" glow>
            Broker Connected
          </NeonText>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 400 }}
        >
          <NeonText variant="body" color="muted" align="center" style={styles.subtitle}>
            Your trading account is now linked to Trading Platform
          </NeonText>
        </MotiView>

        {/* Account Info Card */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 500 }}
        >
          <Card variant="default" padding="md" style={styles.accountCard}>
            <View style={styles.accountRow}>
              <View style={styles.accountIcon}>
                <NeonText variant="body" color="primary">📊</NeonText>
              </View>
              <View style={styles.accountInfo}>
                <NeonText variant="body" color="white">Demo Account</NeonText>
                <NeonText variant="caption" color="muted">
                  ****1234 • TradeLocker
                </NeonText>
              </View>
              <Badge variant="success">Connected</Badge>
            </View>
          </Card>
        </MotiView>

        {/* What's Next */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 600 }}
          style={styles.nextSection}
        >
          <NeonText variant="caption" color="muted" style={styles.nextTitle}>
            NEXT STEP
          </NeonText>
          <NeonText variant="body" color="white" align="center">
            We'll check your balance and get you started with AI trading
          </NeonText>
        </MotiView>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 700 }}
        >
          <NeonButton onPress={handleContinue}>
            Continue
          </NeonButton>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
  },
  iconSection: {
    marginBottom: spacing[4],
  },
  successCircle: {
    width: moderateScale(90),
    height: moderateScale(90),
    borderRadius: moderateScale(45),
    backgroundColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: moderateScale(42),
    color: colors.neutral[0],
  },
  subtitle: {
    marginTop: spacing[2],
    marginBottom: spacing[6],
    maxWidth: 280,
  },
  accountCard: {
    width: '100%',
    maxWidth: 320,
    marginBottom: spacing[6],
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  accountIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary[900],
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountInfo: {
    flex: 1,
    gap: 2,
  },
  nextSection: {
    alignItems: 'center',
  },
  nextTitle: {
    marginBottom: spacing[2],
  },
  actions: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[6],
  },
});

