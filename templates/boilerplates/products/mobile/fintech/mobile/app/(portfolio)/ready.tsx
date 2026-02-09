import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton, NeonLoader, Card, Badge } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';
import { formatCurrency, fetchPortfolioBalance, PortfolioAccount, DEMO_ACCOUNT } from '@/lib/constants/portfolio';
import { verticalScale, moderateScale } from '@/lib/utils/responsive';

export default function PortfolioReadyScreen() {
  const router = useRouter();
  const [account, setAccount] = useState<PortfolioAccount>(DEMO_ACCOUNT);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBalance = async () => {
      try {
        const data = await fetchPortfolioBalance();
        setAccount(data);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error('Failed to fetch balance:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBalance();
  }, []);

  const handleChooseRiskLevel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace('/(risk)/select');
  };

  if (isLoading) {
    return (
      <Screen safeArea style={styles.container}>
        <View style={styles.loadingContent}>
          <NeonLoader size="large" />
          <NeonText variant="body" color="muted" style={styles.loadingText}>
            Confirming balance...
          </NeonText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen safeArea padded={false} style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
      <View style={styles.content}>
        {/* Success icon */}
        <MotiView
          from={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', delay: 100, damping: 10 }}
          style={styles.iconContainer}
        >
          <View style={styles.successCircle}>
            <NeonText variant="display" style={styles.checkmark}>✓</NeonText>
          </View>
        </MotiView>

        {/* Title */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200 }}
        >
          <NeonText variant="h2" color="primary" align="center" glow>
            Portfolio Ready
          </NeonText>
        </MotiView>

        {/* Balance */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 300 }}
          style={styles.balanceContainer}
        >
          <NeonText variant="display" color="white" align="center" style={styles.balance}>
            {formatCurrency(account.balance)}
          </NeonText>
        </MotiView>

        {/* Message */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 400 }}
        >
          <NeonText variant="body" color="muted" align="center" style={styles.message}>
            Your account meets the minimum requirements for AI trading
          </NeonText>
        </MotiView>

        {/* Account card */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 500 }}
        >
          <Card variant="default" padding="md" style={styles.accountCard}>
            <View style={styles.accountRow}>
              <View style={styles.accountIcon}>
                <NeonText variant="body" color="primary">📊</NeonText>
              </View>
              <View style={styles.accountInfo}>
                <NeonText variant="body" color="white">{account.brokerName}</NeonText>
                <NeonText variant="caption" color="muted">
                  {account.accountNumber} • {account.serverType === 'demo' ? 'Demo' : 'Live'}
                </NeonText>
              </View>
            </View>
          </Card>
        </MotiView>

        {/* Next step */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', delay: 600 }}
          style={styles.nextStep}
        >
          <Badge variant="info">Next: Select your risk level</Badge>
        </MotiView>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 700 }}
        >
          <NeonButton onPress={handleChooseRiskLevel}>
            Choose Risk Level
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
  loadingContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: spacing[4],
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
  },
  iconContainer: {
    marginBottom: spacing[4],
  },
  successCircle: {
    width: moderateScale(70),
    height: moderateScale(70),
    borderRadius: moderateScale(35),
    backgroundColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: moderateScale(36),
    color: colors.neutral[0],
  },
  balanceContainer: {
    marginTop: spacing[3],
    marginBottom: spacing[2],
  },
  balance: {
    fontSize: moderateScale(34),
  },
  message: {
    maxWidth: 280,
    marginBottom: spacing[6],
  },
  accountCard: {
    width: '100%',
    maxWidth: 300,
    marginBottom: spacing[4],
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
  nextStep: {
    alignItems: 'center',
  },
  actions: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[6],
  },
});

