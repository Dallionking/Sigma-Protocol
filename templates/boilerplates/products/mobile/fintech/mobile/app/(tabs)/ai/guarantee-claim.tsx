import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton, Card, Badge } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';

export default function GuaranteeClaimScreen() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleSubmitClaim = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/(tabs)/ai/guarantee-success');
  };

  return (
    <Screen safeArea style={styles.container}>
      {/* Header */}
      <MotiView
        from={{ opacity: 0, translateY: -10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', delay: 50 }}
      >
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <NeonText variant="body" color="muted">‹ Back</NeonText>
          </Pressable>
          <NeonText variant="h4" color="white">Claim Guarantee</NeonText>
          <View style={styles.headerSpacer} />
        </View>
      </MotiView>

      <View style={styles.content}>
        {/* Confirmation Card */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', delay: 100 }}
        >
          <Card variant="glassmorphism" padding="lg" showBorderBeam style={styles.confirmCard}>
            <View style={styles.confirmHeader}>
              <View style={styles.confirmIcon}>
                <NeonText style={styles.confirmEmoji}>📋</NeonText>
              </View>
              <NeonText variant="h3" color="white">Confirm Eligibility</NeonText>
            </View>
            
            <View style={styles.checkList}>
              <View style={styles.checkItem}>
                <View style={styles.checkCircle}>
                  <MotiView
                    from={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 200 }}
                  >
                    <NeonText variant="body" color="primary">✓</NeonText>
                  </MotiView>
                </View>
                <View style={styles.checkText}>
                  <NeonText variant="body" color="white">AI Trading Bot active?</NeonText>
                </View>
                <Badge variant="success">YES</Badge>
              </View>
              
              <View style={styles.checkDivider} />
              
              <View style={styles.checkItem}>
                <View style={styles.checkCircle}>
                  <MotiView
                    from={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 300 }}
                  >
                    <NeonText variant="body" color="primary">✓</NeonText>
                  </MotiView>
                </View>
                <View style={styles.checkText}>
                  <NeonText variant="body" color="white">48 hours passed?</NeonText>
                </View>
                <Badge variant="success">YES</Badge>
              </View>
              
              <View style={styles.checkDivider} />
              
              <View style={styles.checkItem}>
                <View style={styles.checkCircle}>
                  <MotiView
                    from={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 400 }}
                  >
                    <NeonText variant="body" color="primary">✓</NeonText>
                  </MotiView>
                </View>
                <View style={styles.checkText}>
                  <NeonText variant="body" color="white">No positive returns?</NeonText>
                </View>
                <Badge variant="success">CONFIRMED</Badge>
              </View>
            </View>
          </Card>
        </MotiView>

        {/* Process Timeline */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 500 }}
        >
          <View style={styles.processCard}>
            <View style={styles.processHeader}>
              <NeonText variant="caption" color="muted">WHAT HAPPENS NEXT</NeonText>
            </View>
            
            <View style={styles.processList}>
              <View style={styles.processItem}>
                <View style={styles.processNumber}>
                  <NeonText variant="caption" color="primary">1</NeonText>
                </View>
                <NeonText variant="body" color="muted">We review your account</NeonText>
                <NeonText variant="caption" color="muted">~24h</NeonText>
              </View>
              
              <View style={styles.processItem}>
                <View style={styles.processNumber}>
                  <NeonText variant="caption" color="primary">2</NeonText>
                </View>
                <NeonText variant="body" color="muted">Credit applied if eligible</NeonText>
              </View>
              
              <View style={styles.processItem}>
                <View style={styles.processNumber}>
                  <NeonText variant="caption" color="primary">3</NeonText>
                </View>
                <NeonText variant="body" color="muted">Email confirmation sent</NeonText>
              </View>
            </View>
          </View>
        </MotiView>

        {/* Disclaimer */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', delay: 600 }}
          style={styles.disclaimer}
        >
          <NeonText variant="caption" color="muted" align="center">
            By submitting, you confirm all information is accurate.
          </NeonText>
        </MotiView>
      </View>

      {/* Submit Button */}
      <View style={styles.actions}>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', delay: 700 }}
        >
          <NeonButton onPress={handleSubmitClaim} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Claim'}
          </NeonButton>
        </MotiView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[0],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  backButton: {
    paddingVertical: spacing[2],
    width: 60,
  },
  headerSpacer: {
    width: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing[4],
  },
  
  // Confirmation Card
  confirmCard: {
    marginBottom: spacing[4],
  },
  confirmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[4],
    paddingBottom: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  confirmIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[900],
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmEmoji: {
    fontSize: 24,
  },
  checkList: {},
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary[900],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  checkText: {
    flex: 1,
  },
  checkDivider: {
    height: 1,
    backgroundColor: colors.neutral[200],
  },
  
  // Process Card
  processCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: 16,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    marginBottom: spacing[4],
  },
  processHeader: {
    marginBottom: spacing[3],
  },
  processList: {
    gap: spacing[3],
  },
  processItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  processNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary[900],
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Disclaimer
  disclaimer: {
    paddingHorizontal: spacing[4],
  },
  
  // Actions
  actions: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[6],
  },
});

