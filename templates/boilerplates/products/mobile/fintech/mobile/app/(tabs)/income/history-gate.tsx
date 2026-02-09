import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton, Card, Badge } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';

export default function IncomeHistoryGateScreen() {
  const router = useRouter();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleUpgrade = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Navigate to subscription screen
    console.log('Navigate to upgrade');
  };

  const handleComparePlans = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to plan comparison
    console.log('Navigate to compare plans');
  };

  return (
    <Screen safeArea style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <NeonText variant="body" color="muted">‹ Back</NeonText>
        </Pressable>
      </View>

      <View style={styles.content}>
        {/* Lock Icon */}
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
          style={styles.iconSection}
        >
          <View style={styles.lockCircle}>
            <NeonText variant="display" style={styles.lockEmoji}>🔒</NeonText>
          </View>
        </MotiView>

        {/* Title */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200 }}
        >
          <NeonText variant="h2" color="white" align="center">
            Unlock Extended History
          </NeonText>
          <NeonText variant="body" color="muted" align="center" style={styles.subtitle}>
            See 30-day and 90-day income history with Pro
          </NeonText>
        </MotiView>

        {/* Benefits Card */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 300 }}
        >
          <Card variant="glassmorphism" padding="lg" showBorderBeam style={styles.benefitsCard}>
            <View style={styles.benefitsHeader}>
              <Badge variant="success">Pro</Badge>
            </View>
            
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <NeonText variant="body" color="primary">✓</NeonText>
                <NeonText variant="body" color="white">30 & 90 day history</NeonText>
              </View>
              <View style={styles.benefitItem}>
                <NeonText variant="body" color="primary">✓</NeonText>
                <NeonText variant="body" color="white">4x faster AI cycles</NeonText>
              </View>
              <View style={styles.benefitItem}>
                <NeonText variant="body" color="primary">✓</NeonText>
                <NeonText variant="body" color="white">Advanced analytics</NeonText>
              </View>
              <View style={styles.benefitItem}>
                <NeonText variant="body" color="primary">✓</NeonText>
                <NeonText variant="body" color="white">Priority support</NeonText>
              </View>
            </View>

            <View style={styles.priceSection}>
              <NeonText variant="h3" color="primary">$14.99</NeonText>
              <NeonText variant="caption" color="muted">/month</NeonText>
            </View>
          </Card>
        </MotiView>

        {/* Social Proof */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 400 }}
          style={styles.socialProof}
        >
          <NeonText variant="caption" color="muted" align="center">
            Join 2,400+ traders using Pro
          </NeonText>
        </MotiView>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 500 }}
        >
          <NeonButton onPress={handleUpgrade}>
            Upgrade to Pro
          </NeonButton>
        </MotiView>
        
        <Pressable onPress={handleComparePlans} style={styles.compareLink}>
          <NeonText variant="body" color="muted">Compare Plans</NeonText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[0],
  },
  header: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  backButton: {
    paddingVertical: spacing[2],
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing[4],
  },
  iconSection: {
    alignItems: 'center',
    paddingVertical: spacing[6],
  },
  lockCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  lockEmoji: {
    fontSize: 48,
  },
  subtitle: {
    marginTop: spacing[2],
    marginBottom: spacing[6],
    maxWidth: 280,
    alignSelf: 'center',
  },
  benefitsCard: {
    marginBottom: spacing[4],
  },
  benefitsHeader: {
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  benefitsList: {
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: spacing[1],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  socialProof: {
    paddingVertical: spacing[2],
  },
  actions: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[6],
  },
  compareLink: {
    alignItems: 'center',
    paddingVertical: spacing[3],
    marginTop: spacing[2],
  },
});

