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
};

const TIMELINE_STEPS = [
  { id: 'requested', label: 'Requested', status: 'completed', time: 'Today, 2:34 PM' },
  { id: 'processing', label: 'Processing', status: 'current', time: 'In progress' },
  { id: 'sent', label: 'Sent to Bank', status: 'pending', time: 'Expected tomorrow' },
  { id: 'arrived', label: 'Arrives', status: 'pending', time: 'Dec 14–16' },
];

export default function WithdrawDetailScreen() {
  const router = useRouter();
  const { amount, status } = useLocalSearchParams<{ amount: string; status: string }>();
  
  const numericAmount = parseFloat(amount || '100');

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleBackToHome = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/(tabs)/home');
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
          <NeonText variant="h2" color="white">Withdrawal Tracking</NeonText>
          <View style={styles.titleUnderline} />
        </MotiView>

        {/* Status Badge */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
          style={styles.statusSection}
        >
          <View style={styles.statusBadge}>
            <MotiView
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ type: 'timing', duration: 1500, loop: true }}
            >
              <View style={styles.statusDot} />
            </MotiView>
            <NeonText variant="body" color="primary">In Progress</NeonText>
          </View>
        </MotiView>

        {/* Amount Card */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 150, duration: 400 }}
          style={styles.amountSection}
        >
          <View style={styles.amountCard}>
            <View style={styles.amountHeader}>
              <NeonText variant="caption" color="muted">AMOUNT</NeonText>
              <NeonText variant="h3" color="primary">
                ${numericAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </NeonText>
            </View>
            <View style={styles.amountDivider} />
            <View style={styles.amountDestination}>
              <NeonText variant="caption" color="muted">TO</NeonText>
              <NeonText variant="body" color="white">
                {LINKED_ACCOUNT.bank} •••• {LINKED_ACCOUNT.last4}
              </NeonText>
            </View>
          </View>
        </MotiView>

        {/* Timeline */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200, duration: 400 }}
          style={styles.timelineSection}
        >
          <NeonText variant="caption" color="muted" style={styles.sectionLabel}>
            TIMELINE
          </NeonText>

          <View style={styles.timeline}>
            {TIMELINE_STEPS.map((step, index) => (
              <MotiView
                key={step.id}
                from={{ opacity: 0, translateX: -15 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'timing', delay: 250 + index * 60, duration: 400 }}
              >
                <View style={styles.timelineStep}>
                  {/* Connector Line */}
                  {index < TIMELINE_STEPS.length - 1 && (
                    <View
                      style={[
                        styles.timelineConnector,
                        step.status === 'completed' && styles.timelineConnectorComplete,
                      ]}
                    />
                  )}
                  
                  {/* Step Icon */}
                  <View
                    style={[
                      styles.timelineIcon,
                      step.status === 'completed' && styles.timelineIconComplete,
                      step.status === 'current' && styles.timelineIconCurrent,
                    ]}
                  >
                    {step.status === 'completed' ? (
                      <NeonText style={styles.checkmark}>✓</NeonText>
                    ) : step.status === 'current' ? (
                      <MotiView
                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ type: 'timing', duration: 1500, loop: true }}
                        style={styles.currentDot}
                      />
                    ) : (
                      <View style={styles.pendingDot} />
                    )}
                  </View>
                  
                  {/* Step Content */}
                  <View style={styles.timelineContent}>
                    <NeonText
                      variant="body"
                      color={step.status === 'pending' ? 'muted' : 'white'}
                    >
                      {step.label}
                    </NeonText>
                    <NeonText variant="caption" color="muted">{step.time}</NeonText>
                  </View>
                </View>
              </MotiView>
            ))}
          </View>
        </MotiView>

        {/* Info */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', delay: 500, duration: 400 }}
          style={styles.infoSection}
        >
          <View style={styles.infoCard}>
            <View style={styles.infoAccent} />
            <NeonText style={styles.infoIcon}>💡</NeonText>
            <View style={styles.infoContent}>
              <NeonText variant="body" color="white">Track in Activity</NeonText>
              <NeonText variant="caption" color="muted">
                Find this and all withdrawals in your Activity tab
              </NeonText>
            </View>
          </View>
        </MotiView>

        {/* Button */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 550, duration: 400 }}
          style={styles.buttonSection}
        >
          <NeonButton variant="outline" onPress={handleBackToHome}>
            Back to Home
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
  statusSection: {
    marginTop: spacing[4],
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.primary[900],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[500],
  },
  amountSection: {
    marginTop: spacing[4],
  },
  amountCard: {
    backgroundColor: colors.neutral[100],
    borderRadius: 16,
    padding: spacing[4],
  },
  amountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountDivider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginVertical: spacing[3],
  },
  amountDestination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineSection: {
    marginTop: spacing[6],
  },
  sectionLabel: {
    letterSpacing: 1.5,
    fontSize: 11,
    marginBottom: spacing[3],
  },
  timeline: {
    backgroundColor: colors.neutral[100],
    borderRadius: 16,
    padding: spacing[4],
  },
  timelineStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
    paddingBottom: spacing[4],
    position: 'relative',
  },
  timelineConnector: {
    position: 'absolute',
    left: 15,
    top: 32,
    width: 2,
    height: 40,
    backgroundColor: colors.neutral[300],
  },
  timelineConnectorComplete: {
    backgroundColor: colors.primary[500],
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineIconComplete: {
    backgroundColor: colors.primary[500],
  },
  timelineIconCurrent: {
    backgroundColor: colors.primary[900],
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  checkmark: {
    fontSize: 14,
    color: colors.neutral[0],
    fontWeight: '700',
  },
  currentDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary[500],
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutral[400],
  },
  timelineContent: {
    flex: 1,
    gap: 2,
    paddingTop: 4,
  },
  infoSection: {
    marginTop: spacing[4],
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    padding: spacing[4],
    gap: spacing[3],
    position: 'relative',
    overflow: 'hidden',
  },
  infoAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.primary[500],
  },
  infoIcon: {
    fontSize: 24,
  },
  infoContent: {
    flex: 1,
    gap: 2,
  },
  buttonSection: {
    marginTop: spacing[6],
  },
});

