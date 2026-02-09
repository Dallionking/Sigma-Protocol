import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Pressable, Platform, Linking, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton, NeonLoader } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';
import { verticalScale } from '@/lib/utils/responsive';
import { 
  MINIMUM_BALANCE, 
  formatCurrency, 
  fetchPortfolioBalance,
  getBrokerFundingUrl,
  DEMO_ACCOUNT,
  PortfolioAccount 
} from '@/lib/constants/portfolio';

export default function PortfolioFundPromptScreen() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [account, setAccount] = useState<PortfolioAccount>(DEMO_ACCOUNT);

  const handleOpenBroker = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const fundingUrl = getBrokerFundingUrl(account.brokerId);
    
    try {
      const canOpen = await Linking.canOpenURL(fundingUrl);
      if (canOpen) {
        await Linking.openURL(fundingUrl);
      } else {
        // Fallback to TradeLocker
        await Linking.openURL('https://tradelocker.com');
      }
    } catch (error) {
      console.error('Failed to open broker URL:', error);
      // For demo, just log it
      console.log('Would open:', fundingUrl);
    }
  };

  const handleRefreshBalance = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsRefreshing(true);
    
    try {
      const data = await fetchPortfolioBalance();
      setAccount(data);
      
      // Check if balance is now sufficient
      if (data.balance >= MINIMUM_BALANCE) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace('/(portfolio)/ready');
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [router]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleLearnMore = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(portfolio)/minimum-info');
  };

  const needed = Math.max(0, MINIMUM_BALANCE - account.balance);

  const steps = [
    { number: '1', text: "Open your broker's app or website" },
    { number: '2', text: 'Deposit funds to your trading account' },
    { number: '3', text: 'Return here and tap "Refresh Balance"' },
  ];

  return (
    <Screen safeArea padded={false} style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
      {/* Back button */}
      <Pressable onPress={handleBack} style={styles.backButton}>
        <NeonText variant="body" color="primary">
          ← Back
        </NeonText>
      </Pressable>

      <View style={styles.content}>
        {/* Icon */}
        <MotiView
          from={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', delay: 200 }}
          style={styles.iconContainer}
        >
          <View style={styles.fundIcon}>
            <NeonText variant="display" style={styles.iconText}>
              💰
            </NeonText>
          </View>
        </MotiView>

        {/* Title */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 300 }}
        >
          <NeonText variant="h2" style={styles.title}>
            Add Funds to Trade
          </NeonText>
        </MotiView>

        {/* Balance info */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 400 }}
          style={styles.balanceInfo}
        >
          <View style={styles.balanceRow}>
            <NeonText variant="body" color="muted">
              Your balance:
            </NeonText>
            <NeonText variant="body" color="white">
              {formatCurrency(account.balance)}
            </NeonText>
          </View>
          <View style={styles.balanceRow}>
            <NeonText variant="body" color="muted">
              Minimum for AI:
            </NeonText>
            <NeonText variant="body" color="primary">
              {formatCurrency(MINIMUM_BALANCE)}
            </NeonText>
          </View>
          {needed > 0 && (
            <View style={[styles.balanceRow, styles.neededRow]}>
              <NeonText variant="body" color="muted">
                Needed:
              </NeonText>
              <NeonText variant="body" color="primary" glow>
                {formatCurrency(needed)} more
              </NeonText>
            </View>
          )}
        </MotiView>

        {/* Steps */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 500 }}
          style={styles.stepsContainer}
        >
          <NeonText variant="label" color="muted" style={styles.stepsHeader}>
            To fund your trading account:
          </NeonText>
          {steps.map((step, index) => (
            <MotiView
              key={index}
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: 'timing', delay: 600 + index * 100 }}
              style={styles.stepRow}
            >
              <View style={styles.stepNumber}>
                <NeonText variant="label" color="primary">
                  {step.number}
                </NeonText>
              </View>
              <NeonText variant="body" color="white" style={styles.stepText}>
                {step.text}
              </NeonText>
            </MotiView>
          ))}
        </MotiView>

        {/* Learn more link */}
        <Pressable onPress={handleLearnMore} style={styles.learnMoreLink}>
          <NeonText variant="label" color="muted">
            Why is there a minimum? →
          </NeonText>
        </Pressable>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 900 }}
          style={styles.buttonContainer}
        >
          <NeonButton onPress={handleOpenBroker}>
            Open Broker Website
          </NeonButton>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 1000 }}
          style={styles.secondaryButtonContainer}
        >
          <NeonButton 
            onPress={handleRefreshBalance} 
            variant="primary"
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh Balance'}
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
    paddingBottom: spacing[6],
  },
  backButton: {
    paddingVertical: spacing[2],
    marginBottom: spacing[4],
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing[4],
  },
  iconContainer: {
    marginBottom: spacing[4],
    marginTop: spacing[4],
  },
  fundIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.neutral[50],
    borderWidth: 2,
    borderColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary.DEFAULT,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      web: {
        boxShadow: `0 0 20px ${colors.glow}`,
      },
      android: {},
    }),
  },
  iconText: {
    fontSize: 36,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  balanceInfo: {
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    width: '100%',
    maxWidth: 300,
    marginBottom: spacing[4],
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing[1],
  },
  neededRow: {
    marginTop: spacing[2],
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  stepsContainer: {
    width: '100%',
    maxWidth: 300,
  },
  stepsHeader: {
    marginBottom: spacing[3],
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing[3],
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  stepText: {
    flex: 1,
    lineHeight: 22,
  },
  learnMoreLink: {
    marginTop: spacing[4],
    paddingVertical: spacing[2],
  },
  actions: {
    paddingBottom: spacing[6],
    alignItems: 'center',
  },
  buttonContainer: {
    width: '100%',
  },
  secondaryButtonContainer: {
    width: '100%',
    marginTop: spacing[3],
  },
});

