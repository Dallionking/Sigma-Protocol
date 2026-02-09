import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton, Icon } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';
import { Building2 } from 'lucide-react-native';

// Mock data
const AVAILABLE_BALANCE = 1200.00;
const LINKED_ACCOUNT = {
  bank: 'Chase',
  last4: '1234',
  type: 'Checking',
};

const QUICK_AMOUNTS = [50, 100, 250, 500];

export default function WithdrawAmountScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const numericAmount = parseFloat(amount) || 0;

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleAmountChange = (value: string) => {
    // Only allow numbers and one decimal point
    const cleaned = value.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) return;
    if (parts[1]?.length > 2) return;
    
    setAmount(cleaned);
    setError('');
  };

  const handleQuickAmount = (quickAmount: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (quickAmount <= AVAILABLE_BALANCE) {
      setAmount(quickAmount.toString());
      setError('');
    }
  };

  const handleMax = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAmount(AVAILABLE_BALANCE.toString());
    setError('');
  };

  const handleContinue = () => {
    if (numericAmount < 10) {
      setError('Minimum withdrawal is $10');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (numericAmount > AVAILABLE_BALANCE) {
      setError('Insufficient balance');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/(tabs)/withdraw/confirm',
      params: { amount: numericAmount.toFixed(2) },
    });
  };

  return (
    <Screen safeArea style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
          <NeonText variant="h2" color="white">Withdraw</NeonText>
          <View style={styles.titleUnderline} />
        </MotiView>

        {/* Available Balance */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
          style={styles.balanceSection}
        >
          <View style={styles.balanceCard}>
            <NeonText variant="caption" color="muted" style={styles.balanceLabel}>
              AVAILABLE BALANCE
            </NeonText>
            <NeonText variant="display" color="primary" glow style={styles.balanceAmount}>
              ${AVAILABLE_BALANCE.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </NeonText>
          </View>
        </MotiView>

        {/* Amount Input */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 150, duration: 400 }}
          style={styles.inputSection}
        >
          <NeonText variant="caption" color="muted" style={styles.sectionLabel}>
            AMOUNT
          </NeonText>
          
          <View style={[styles.inputContainer, error && styles.inputError]}>
            <NeonText variant="h2" color="muted" style={styles.dollarSign}>$</NeonText>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={handleAmountChange}
              placeholder="0.00"
              placeholderTextColor={colors.neutral[500]}
              keyboardType="decimal-pad"
              maxLength={10}
            />
            <Pressable onPress={handleMax} style={styles.maxButton}>
              <NeonText variant="caption" color="primary">MAX</NeonText>
            </Pressable>
          </View>

          {error ? (
            <MotiView
              from={{ opacity: 0, translateY: -5 }}
              animate={{ opacity: 1, translateY: 0 }}
            >
              <NeonText variant="caption" color="error" style={styles.errorText}>
                {error}
              </NeonText>
            </MotiView>
          ) : null}
        </MotiView>

        {/* Quick Amounts */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200, duration: 400 }}
          style={styles.quickAmountsSection}
        >
          <View style={styles.quickAmountsRow}>
            {QUICK_AMOUNTS.map((quickAmount, index) => (
              <MotiView
                key={quickAmount}
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'timing', delay: 250 + index * 40, duration: 300 }}
              >
                <Pressable
                  style={[
                    styles.quickAmountChip,
                    numericAmount === quickAmount && styles.quickAmountActive,
                    quickAmount > AVAILABLE_BALANCE && styles.quickAmountDisabled,
                  ]}
                  onPress={() => handleQuickAmount(quickAmount)}
                  disabled={quickAmount > AVAILABLE_BALANCE}
                >
                  <NeonText
                    variant="body"
                    color={numericAmount === quickAmount ? 'primary' : quickAmount > AVAILABLE_BALANCE ? 'muted' : 'white'}
                  >
                    ${quickAmount}
                  </NeonText>
                </Pressable>
              </MotiView>
            ))}
          </View>
        </MotiView>

        {/* Destination */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 300, duration: 400 }}
          style={styles.destinationSection}
        >
          <NeonText variant="caption" color="muted" style={styles.sectionLabel}>
            TO
          </NeonText>
          
          <View style={styles.destinationCard}>
            <View style={styles.bankIcon}>
              <NeonText style={styles.bankEmoji}>🏦</NeonText>
            </View>
            <View style={styles.destinationInfo}>
              <NeonText variant="body" color="white">{LINKED_ACCOUNT.bank}</NeonText>
              <NeonText variant="caption" color="muted">
                {LINKED_ACCOUNT.type} •••• {LINKED_ACCOUNT.last4}
              </NeonText>
            </View>
            <NeonText variant="caption" color="muted">›</NeonText>
          </View>
        </MotiView>

        {/* Info */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', delay: 350, duration: 400 }}
          style={styles.infoSection}
        >
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Icon name="clock" size={16} color="muted" />
              <NeonText variant="caption" color="muted">
                Withdrawals typically arrive in 1-3 business days
              </NeonText>
            </View>
            <View style={styles.infoRow}>
              <Icon name="lock" size={16} color="muted" />
              <NeonText variant="caption" color="muted">
                No fees • No lock-ups • Withdraw anytime
              </NeonText>
            </View>
          </View>
        </MotiView>

        {/* Continue Button */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 400, duration: 400 }}
          style={styles.buttonSection}
        >
          <NeonButton
            onPress={handleContinue}
            disabled={!amount || numericAmount <= 0}
          >
            Continue
          </NeonButton>
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
  balanceSection: {
    marginTop: spacing[4],
  },
  balanceCard: {
    backgroundColor: colors.neutral[100],
    borderRadius: 20,
    padding: spacing[5],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  balanceLabel: {
    letterSpacing: 1.5,
    fontSize: 11,
    marginBottom: spacing[2],
  },
  balanceAmount: {
    fontSize: 40,
  },
  inputSection: {
    marginTop: spacing[6],
  },
  sectionLabel: {
    letterSpacing: 1.5,
    fontSize: 11,
    marginBottom: spacing[2],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: 16,
    paddingHorizontal: spacing[4],
    borderWidth: 2,
    borderColor: colors.neutral[200],
  },
  inputError: {
    borderColor: colors.error[500] || '#FF4444',
  },
  dollarSign: {
    marginRight: spacing[1],
  },
  input: {
    flex: 1,
    color: colors.neutral[900],
    fontSize: 32,
    fontWeight: '700',
    paddingVertical: spacing[4],
  },
  maxButton: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.primary[900],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  errorText: {
    marginTop: spacing[2],
  },
  quickAmountsSection: {
    marginTop: spacing[4],
  },
  quickAmountsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing[2],
  },
  quickAmountChip: {
    flex: 1,
    paddingVertical: spacing[3],
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  quickAmountActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[900],
  },
  quickAmountDisabled: {
    opacity: 0.5,
  },
  destinationSection: {
    marginTop: spacing[6],
  },
  destinationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    padding: spacing[4],
    gap: spacing[3],
  },
  bankIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankEmoji: {
    fontSize: 22,
  },
  destinationInfo: {
    flex: 1,
    gap: 2,
  },
  infoSection: {
    marginTop: spacing[4],
  },
  infoCard: {
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    padding: spacing[4],
    gap: spacing[3],
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[500],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  infoIcon: {
    fontSize: 16,
  },
  buttonSection: {
    marginTop: spacing[6],
  },
});

