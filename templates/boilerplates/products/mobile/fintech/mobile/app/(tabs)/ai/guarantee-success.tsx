import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton, Card } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';

export default function GuaranteeSuccessScreen() {
  const router = useRouter();

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const handleBackToAI = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace('/(tabs)/ai');
  };

  return (
    <Screen safeArea style={styles.container}>
      <View style={styles.content}>
        {/* Success Animation */}
        <View style={styles.successContainer}>
          {/* Ripple effects */}
          <MotiView
            from={{ scale: 0.5, opacity: 0.8 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ type: 'timing', duration: 1500, loop: true }}
            style={styles.ripple}
          />
          <MotiView
            from={{ scale: 0.5, opacity: 0.6 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ type: 'timing', duration: 1500, loop: true, delay: 500 }}
            style={styles.ripple}
          />
          
          {/* Main circle */}
          <MotiView
            from={{ scale: 0, rotate: '-180deg' }}
            animate={{ scale: 1, rotate: '0deg' }}
            transition={{ type: 'spring', damping: 8, delay: 100 }}
          >
            <View style={styles.successCircle}>
              <MotiView
                from={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 10, delay: 300 }}
              >
                <NeonText variant="display" style={styles.checkmark}>✓</NeonText>
              </MotiView>
            </View>
          </MotiView>
        </View>

        {/* Title */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 400 }}
        >
          <NeonText variant="h1" color="primary" align="center" glow>
            Claim Submitted
          </NeonText>
        </MotiView>

        {/* Description */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 500 }}
        >
          <NeonText variant="body" color="muted" align="center" style={styles.description}>
            We'll review your account and credit your first month if eligible.
          </NeonText>
        </MotiView>

        {/* Timeline Card */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 600 }}
        >
          <Card variant="glassmorphism" padding="lg" style={styles.timelineCard}>
            <View style={styles.timelineHeader}>
              <NeonText variant="caption" color="muted">WHAT HAPPENS NEXT</NeonText>
            </View>
            
            <View style={styles.timelineList}>
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, styles.timelineDotActive]} />
                <View style={styles.timelineContent}>
                  <NeonText variant="body" color="white">Claim Received</NeonText>
                  <NeonText variant="caption" color="muted">Just now</NeonText>
                </View>
              </View>
              
              <View style={styles.timelineLine} />
              
              <View style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <NeonText variant="body" color="muted">Under Review</NeonText>
                  <NeonText variant="caption" color="muted">~24 hours</NeonText>
                </View>
              </View>
              
              <View style={styles.timelineLine} />
              
              <View style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <NeonText variant="body" color="muted">Credit Applied</NeonText>
                  <NeonText variant="caption" color="muted">If eligible</NeonText>
                </View>
              </View>
            </View>
          </Card>
        </MotiView>

        {/* Email Reminder */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', delay: 700 }}
          style={styles.emailReminder}
        >
          <View style={styles.emailIcon}>
            <NeonText variant="body">📧</NeonText>
          </View>
          <NeonText variant="caption" color="muted">
            Check your email for confirmation
          </NeonText>
        </MotiView>
      </View>

      {/* CTA */}
      <View style={styles.actions}>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', delay: 800 }}
        >
          <NeonButton onPress={handleBackToAI}>
            Back to AI
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
  },
  
  // Success Animation
  successContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
    width: 140,
    height: 140,
  },
  ripple: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: colors.primary.DEFAULT,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? {
      boxShadow: `0 0 40px ${colors.glowMedium}`,
    } : {}),
  },
  checkmark: {
    fontSize: 48,
    color: colors.neutral[0],
  },
  description: {
    marginTop: spacing[2],
    marginBottom: spacing[6],
    maxWidth: 280,
    lineHeight: 22,
  },
  
  // Timeline
  timelineCard: {
    width: '100%',
    maxWidth: 320,
  },
  timelineHeader: {
    marginBottom: spacing[4],
  },
  timelineList: {
    paddingLeft: spacing[2],
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.neutral[400],
    marginTop: 4,
  },
  timelineDotActive: {
    backgroundColor: colors.primary.DEFAULT,
  },
  timelineContent: {
    flex: 1,
    gap: 2,
  },
  timelineLine: {
    width: 2,
    height: 24,
    backgroundColor: colors.neutral[300],
    marginLeft: 5,
    marginVertical: spacing[1],
  },
  
  // Email Reminder
  emailReminder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[4],
  },
  emailIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Actions
  actions: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[6],
  },
});

