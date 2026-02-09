import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';

export default function WithdrawSuccessScreen() {
  const router = useRouter();
  const { amount } = useLocalSearchParams<{ amount: string }>();
  
  const numericAmount = parseFloat(amount || '0');

  // Calculate ETA dates
  const today = new Date();
  const etaStart = new Date(today);
  etaStart.setDate(today.getDate() + 1);
  const etaEnd = new Date(today);
  etaEnd.setDate(today.getDate() + 3);
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  React.useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const handleViewTracking = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace({
      pathname: '/(tabs)/withdraw/detail',
      params: { amount, status: 'pending' },
    });
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
        {/* Success Icon */}
        <MotiView
          from={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 12 }}
          style={styles.iconSection}
        >
          <View style={styles.iconContainer}>
            <MotiView
              style={styles.iconGlow}
              animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }}
              transition={{ type: 'timing', duration: 2000, loop: true }}
            />
            <MotiView
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ type: 'timing', duration: 2000, loop: true }}
            >
              <NeonText style={styles.icon}>✓</NeonText>
            </MotiView>
          </View>
        </MotiView>

        {/* Title */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200, duration: 400 }}
          style={styles.titleSection}
        >
          <NeonText variant="h2" color="white" style={styles.title}>
            Withdrawal Initiated
          </NeonText>
          <NeonText variant="body" color="muted" style={styles.subtitle}>
            Your funds are on the way
          </NeonText>
        </MotiView>

        {/* Amount Card */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 300, duration: 400 }}
          style={styles.amountSection}
        >
          <View style={styles.amountCard}>
            <NeonText variant="caption" color="muted" style={styles.amountLabel}>
              AMOUNT
            </NeonText>
            <NeonText variant="display" color="primary" glow style={styles.amountValue}>
              ${numericAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </NeonText>
          </View>
        </MotiView>

        {/* ETA Card */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 400, duration: 400 }}
          style={styles.etaSection}
        >
          <View style={styles.etaCard}>
            <View style={styles.etaIcon}>
              <NeonText style={styles.etaEmoji}>📅</NeonText>
            </View>
            <View style={styles.etaContent}>
              <NeonText variant="caption" color="muted">ESTIMATED ARRIVAL</NeonText>
              <NeonText variant="h4" color="white">
                {formatDate(etaStart)} – {formatDate(etaEnd)}
              </NeonText>
            </View>
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
            <NeonText variant="caption" color="muted" style={styles.infoText}>
              You'll receive a notification when your withdrawal arrives. 
              Track progress anytime from Activity.
            </NeonText>
          </View>
        </MotiView>

        {/* Buttons */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 600, duration: 400 }}
          style={styles.buttonsSection}
        >
          <NeonButton onPress={handleViewTracking}>
            View Tracking
          </NeonButton>
          <NeonButton variant="outline" onPress={handleBackToHome} style={styles.secondaryButton}>
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
    paddingTop: spacing[8],
  },
  iconSection: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.primary[500],
  },
  icon: {
    fontSize: 48,
    color: colors.neutral[0],
    fontWeight: '700',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  subtitle: {
    textAlign: 'center',
  },
  amountSection: {
    marginBottom: spacing[4],
  },
  amountCard: {
    backgroundColor: colors.neutral[100],
    borderRadius: 20,
    padding: spacing[5],
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
    fontSize: 40,
  },
  etaSection: {
    marginBottom: spacing[4],
  },
  etaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: 16,
    padding: spacing[4],
    gap: spacing[3],
  },
  etaIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  etaEmoji: {
    fontSize: 24,
  },
  etaContent: {
    flex: 1,
    gap: 2,
  },
  infoSection: {
    marginBottom: spacing[6],
  },
  infoCard: {
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    padding: spacing[4],
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[500],
  },
  infoText: {
    lineHeight: 18,
    textAlign: 'center',
  },
  buttonsSection: {
    gap: spacing[3],
  },
  secondaryButton: {
    marginTop: spacing[1],
  },
});

