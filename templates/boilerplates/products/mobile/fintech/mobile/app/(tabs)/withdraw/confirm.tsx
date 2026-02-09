import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';

// Mock data
const LINKED_ACCOUNT = {
  bank: 'Chase',
  last4: '1234',
  type: 'Checking',
};

export default function WithdrawConfirmScreen() {
  const router = useRouter();
  const { amount } = useLocalSearchParams<{ amount: string }>();
  
  const numericAmount = parseFloat(amount || '0');

  // Calculate ETA (1-3 business days from now)
  const today = new Date();
  const etaStart = new Date(today);
  etaStart.setDate(today.getDate() + 1);
  const etaEnd = new Date(today);
  etaEnd.setDate(today.getDate() + 3);
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleConfirm = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push({
      pathname: '/(tabs)/withdraw/processing',
      params: { amount },
    });
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
          <NeonText variant="h2" color="white">Confirm Withdrawal</NeonText>
          <View style={styles.titleUnderline} />
        </MotiView>

        {/* Amount Display */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
          style={styles.amountSection}
        >
          <View style={styles.amountCard}>
            <NeonText variant="caption" color="muted" style={styles.amountLabel}>
              WITHDRAWAL AMOUNT
            </NeonText>
            <NeonText variant="display" color="primary" glow style={styles.amountValue}>
              ${numericAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </NeonText>
          </View>
        </MotiView>

        {/* Details */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 150, duration: 400 }}
          style={styles.detailsSection}
        >
          <NeonText variant="caption" color="muted" style={styles.sectionLabel}>
            DETAILS
          </NeonText>

          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <NeonText variant="body" color="muted">To</NeonText>
              <View style={styles.detailValue}>
                <NeonText variant="body" color="white">{LINKED_ACCOUNT.bank}</NeonText>
                <NeonText variant="caption" color="muted">
                  •••• {LINKED_ACCOUNT.last4}
                </NeonText>
              </View>
            </View>

            <View style={styles.detailDivider} />

            <View style={styles.detailRow}>
              <NeonText variant="body" color="muted">Estimated Arrival</NeonText>
              <View style={styles.detailValue}>
                <NeonText variant="body" color="white">
                  {formatDate(etaStart)} – {formatDate(etaEnd)}
                </NeonText>
                <NeonText variant="caption" color="muted">1–3 business days</NeonText>
              </View>
            </View>

            <View style={styles.detailDivider} />

            <View style={styles.detailRow}>
              <NeonText variant="body" color="muted">Fee</NeonText>
              <NeonText variant="body" color="primary">$0.00</NeonText>
            </View>
          </View>
        </MotiView>

        {/* Summary */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200, duration: 400 }}
          style={styles.summarySection}
        >
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <NeonText variant="body" color="muted">Amount</NeonText>
              <NeonText variant="body" color="white">
                ${numericAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </NeonText>
            </View>
            <View style={styles.summaryRow}>
              <NeonText variant="body" color="muted">Fee</NeonText>
              <NeonText variant="body" color="white">-$0.00</NeonText>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <NeonText variant="h4" color="white">You'll Receive</NeonText>
              <NeonText variant="h4" color="primary">
                ${numericAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </NeonText>
            </View>
          </View>
        </MotiView>

        {/* Disclaimer */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', delay: 250, duration: 400 }}
          style={styles.disclaimerSection}
        >
          <NeonText variant="caption" color="muted" style={styles.disclaimerText}>
            By confirming, you authorize Trading Platform to initiate this withdrawal. 
            Funds will be transferred to your linked bank account.
          </NeonText>
        </MotiView>

        {/* Confirm Button */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 300, duration: 400 }}
          style={styles.buttonSection}
        >
          <NeonButton onPress={handleConfirm}>
            Confirm Withdrawal
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
    width: 100,
    backgroundColor: colors.primary[500],
    borderRadius: 1,
    marginTop: spacing[1],
  },
  amountSection: {
    marginTop: spacing[6],
  },
  amountCard: {
    backgroundColor: colors.neutral[100],
    borderRadius: 20,
    padding: spacing[6],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  amountLabel: {
    letterSpacing: 1.5,
    fontSize: 11,
    marginBottom: spacing[2],
  },
  amountValue: {
    fontSize: 48,
  },
  detailsSection: {
    marginTop: spacing[6],
  },
  sectionLabel: {
    letterSpacing: 1.5,
    fontSize: 11,
    marginBottom: spacing[3],
  },
  detailsCard: {
    backgroundColor: colors.neutral[100],
    borderRadius: 16,
    padding: spacing[4],
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingVertical: spacing[2],
  },
  detailValue: {
    alignItems: 'flex-end',
    gap: 2,
  },
  detailDivider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginVertical: spacing[2],
  },
  summarySection: {
    marginTop: spacing[4],
  },
  summaryCard: {
    backgroundColor: colors.neutral[100],
    borderRadius: 16,
    padding: spacing[4],
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[500],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginVertical: spacing[2],
  },
  disclaimerSection: {
    marginTop: spacing[4],
    paddingHorizontal: spacing[2],
  },
  disclaimerText: {
    textAlign: 'center',
    lineHeight: 18,
  },
  buttonSection: {
    marginTop: spacing[6],
  },
});

